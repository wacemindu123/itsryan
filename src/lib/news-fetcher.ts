// News fetcher for the daily newsletter.
// Free sources only: RSS, Hacker News, Reddit, Jina Reader.
// Returns a ranked + deduped pack of story candidates for the LLM drafter.

import {
  RSS_SOURCES,
  REDDIT_SUBREDDITS,
  AI_KEYWORDS,
  DOMAIN_PENALTIES,
  type RssSource,
} from './news-sources';

export interface NewsItem {
  title: string;
  url: string;
  source: string; // e.g. "OpenAI Blog", "HN", "r/artificial"
  publishedAt: string; // ISO timestamp
  excerpt: string; // ~300 chars summary / description
  body?: string; // Full markdown body from Jina Reader (when fetched)
  score: number; // computed rank score
}

// ── Utilities ─────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = 'ItsRyanNewsletterBot/1.0 (+https://itsryan.ai)';

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...opts,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/xml,text/xml,application/rss+xml,application/atom+xml,application/json,text/html,*/*',
        ...(opts.headers || {}),
      },
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Strip tracking params
    for (const k of Array.from(u.searchParams.keys())) {
      if (k.startsWith('utm_') || ['ref', 'refsrc', 'fbclid', 'gclid', 'mc_cid', 'mc_eid'].includes(k)) {
        u.searchParams.delete(k);
      }
    }
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function hoursAgo(iso: string): number {
  const t = Date.parse(iso);
  if (isNaN(t)) return 1e9;
  return (Date.now() - t) / 3_600_000;
}

function freshnessBoost(hoursAgeValue: number): number {
  // 0h → +0.8, 24h → +0.5, 72h → +0.2, 168h+ → 0
  if (hoursAgeValue <= 0) return 0.8;
  if (hoursAgeValue <= 24) return 0.8 - (hoursAgeValue / 24) * 0.3;
  if (hoursAgeValue <= 72) return 0.5 - ((hoursAgeValue - 24) / 48) * 0.3;
  if (hoursAgeValue <= 168) return 0.2 - ((hoursAgeValue - 72) / 96) * 0.2;
  return 0;
}

function mentionsAiKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── RSS parsing (regex-based, good enough for well-formed feeds) ─────────

interface RawFeedItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
}

function parseRss(xml: string): RawFeedItem[] {
  const items: RawFeedItem[] = [];

  // Handle both <item> (RSS 2.0) and <entry> (Atom)
  const itemRegex = /<(item|entry)\b[\s\S]*?<\/\1>/g;
  const matches = xml.match(itemRegex) || [];

  for (const chunk of matches.slice(0, 40)) {
    const title = extractTag(chunk, 'title');
    let link = extractTag(chunk, 'link');
    if (!link) {
      // Atom: <link href="..."/>
      const hrefMatch = chunk.match(/<link[^>]*href="([^"]+)"/i);
      if (hrefMatch) link = hrefMatch[1];
    }
    const pubDate = extractTag(chunk, 'pubDate') || extractTag(chunk, 'published') || extractTag(chunk, 'updated');
    const description =
      extractTag(chunk, 'description') ||
      extractTag(chunk, 'summary') ||
      extractTag(chunk, 'content') ||
      '';

    if (title && link) {
      items.push({
        title: stripHtml(title),
        link: link.trim(),
        pubDate: pubDate ? pubDate.trim() : undefined,
        description: stripHtml(description).slice(0, 500),
      });
    }
  }
  return items;
}

function extractTag(chunk: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const m = chunk.match(re);
  return m ? m[1] : '';
}

// ── Source fetchers ──────────────────────────────────────────────────────

async function fetchRssSource(src: RssSource): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(src.url);
    if (!res.ok) return [];
    const xml = await res.text();
    const items = parseRss(xml);
    const out: NewsItem[] = [];
    for (const it of items) {
      const pub = it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString();
      // Only keep last 7 days
      if (hoursAgo(pub) > 168) continue;
      const url = normalizeUrl(it.link);
      const text = `${it.title} ${it.description || ''}`;
      // For tier 1/2 we skip the keyword filter — they ARE AI sources.
      // For tier 3 (HN), require AI keywords.
      if (src.tier === 3 && !mentionsAiKeywords(text)) continue;

      const domain = hostnameOf(url);
      const domainPenalty = DOMAIN_PENALTIES[domain] ?? 0;
      const score = src.weight + freshnessBoost(hoursAgo(pub)) + domainPenalty;

      out.push({
        title: it.title,
        url,
        source: src.name,
        publishedAt: pub,
        excerpt: it.description || '',
        score,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchRedditSubreddit(name: string, weight: number): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(`https://www.reddit.com/r/${name}/top.json?t=week&limit=15`);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: { children?: Array<{ data: {
        title: string;
        permalink: string;
        url: string;
        score: number;
        num_comments: number;
        created_utc: number;
        selftext?: string;
        is_self?: boolean;
      } }> };
    };
    const children = json.data?.children || [];
    const out: NewsItem[] = [];
    for (const c of children) {
      const d = c.data;
      // Prefer the external URL if it's a link post, else the reddit permalink.
      const url = normalizeUrl(
        d.is_self || !d.url.startsWith('http') ? `https://www.reddit.com${d.permalink}` : d.url
      );
      const publishedAt = new Date(d.created_utc * 1000).toISOString();
      const hrsOld = hoursAgo(publishedAt);
      if (hrsOld > 168) continue;

      const excerpt = d.selftext ? d.selftext.slice(0, 400) : '';
      const text = `${d.title} ${excerpt}`;
      if (!mentionsAiKeywords(text)) continue;

      // Reddit score normalized: 500 upvotes ≈ solid signal
      const redditBoost = Math.min(d.score / 800, 0.5);
      const commentsBoost = Math.min(d.num_comments / 400, 0.25);
      const score = weight + freshnessBoost(hrsOld) + redditBoost + commentsBoost;

      out.push({
        title: d.title,
        url,
        source: `r/${name}`,
        publishedAt,
        excerpt,
        score,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchHackerNewsTopAI(): Promise<NewsItem[]> {
  try {
    const idsRes = await fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!idsRes.ok) return [];
    const ids = (await idsRes.json()) as number[];
    const topIds = ids.slice(0, 60);
    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const r = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {}, 5000);
          if (!r.ok) return null;
          return (await r.json()) as {
            title?: string;
            url?: string;
            score?: number;
            descendants?: number;
            time?: number;
            type?: string;
          } | null;
        } catch {
          return null;
        }
      })
    );
    const out: NewsItem[] = [];
    for (const s of stories) {
      if (!s || !s.title || !s.url || s.type !== 'story') continue;
      if (!mentionsAiKeywords(s.title)) continue;
      const pub = new Date((s.time ?? Date.now() / 1000) * 1000).toISOString();
      const hrs = hoursAgo(pub);
      if (hrs > 168) continue;

      const url = normalizeUrl(s.url);
      const domain = hostnameOf(url);
      const domainPenalty = DOMAIN_PENALTIES[domain] ?? 0;
      const scoreBoost = Math.min((s.score ?? 0) / 400, 0.5);
      const commentBoost = Math.min((s.descendants ?? 0) / 300, 0.25);

      out.push({
        title: s.title,
        url,
        source: 'Hacker News',
        publishedAt: pub,
        excerpt: '',
        score: 0.7 + freshnessBoost(hrs) + scoreBoost + commentBoost + domainPenalty,
      });
    }
    return out;
  } catch {
    return [];
  }
}

// ── Jina Reader body extraction ──────────────────────────────────────────

async function fetchBodyWithJina(url: string): Promise<string | undefined> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetchWithTimeout(jinaUrl, {}, 10000);
    if (!res.ok) return undefined;
    const text = await res.text();
    // Trim to ~4000 chars to keep prompt size reasonable
    return text.slice(0, 4000);
  } catch {
    return undefined;
  }
}

// ── Dedup + rank ─────────────────────────────────────────────────────────

function dedupItems(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const it of items.sort((a, b) => b.score - a.score)) {
    const key = it.url || it.title.toLowerCase();
    if (seen.has(key)) continue;
    // Also dedup by near-identical title
    const titleKey = it.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
    if (seen.has(titleKey)) continue;
    seen.add(key);
    seen.add(titleKey);
    out.push(it);
  }
  return out;
}

function excludeRecentlyCovered(items: NewsItem[], recentUrls: Set<string>, recentTitles: Set<string>): NewsItem[] {
  return items.filter((it) => {
    if (recentUrls.has(it.url)) return false;
    const titleKey = it.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
    return !recentTitles.has(titleKey);
  });
}

// ── Public API ───────────────────────────────────────────────────────────

export interface FetchNewsPackOptions {
  /** URLs from drafts in the last N days to avoid repeating. */
  recentUrls?: string[];
  /** Titles from drafts in the last N days to avoid repeating. */
  recentTitles?: string[];
  /** How many top items to enrich with Jina body extraction. */
  topN?: number;
}

export interface NewsPack {
  items: NewsItem[]; // top N, body-enriched
  rawCount: number; // before ranking
  fetchedAt: string;
  sourcesUsed: string[];
}

export async function fetchNewsPack(opts: FetchNewsPackOptions = {}): Promise<NewsPack> {
  const topN = opts.topN ?? 10;

  // Fetch everything in parallel
  const rssTasks = RSS_SOURCES.map((s) => fetchRssSource(s));
  const redditTasks = REDDIT_SUBREDDITS.map((r) => fetchRedditSubreddit(r.name, r.weight));
  const [rssResults, redditResults, hnResults] = await Promise.all([
    Promise.all(rssTasks),
    Promise.all(redditTasks),
    fetchHackerNewsTopAI(),
  ]);

  const allItems: NewsItem[] = [
    ...rssResults.flat(),
    ...redditResults.flat(),
    ...hnResults,
  ];

  const sourcesUsed = Array.from(new Set(allItems.map((i) => i.source)));
  const rawCount = allItems.length;

  // Dedup
  let ranked = dedupItems(allItems);

  // Exclude recently covered
  if (opts.recentUrls?.length || opts.recentTitles?.length) {
    const recentUrls = new Set((opts.recentUrls || []).map(normalizeUrl));
    const recentTitles = new Set(
      (opts.recentTitles || []).map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80))
    );
    ranked = excludeRecentlyCovered(ranked, recentUrls, recentTitles);
  }

  // Keep top N
  const top = ranked.slice(0, topN);

  // Enrich top items with Jina body (parallel, best-effort)
  const enriched = await Promise.all(
    top.map(async (it) => {
      const body = await fetchBodyWithJina(it.url);
      return { ...it, body };
    })
  );

  return {
    items: enriched,
    rawCount,
    fetchedAt: new Date().toISOString(),
    sourcesUsed,
  };
}

/** Render a compact, LLM-friendly brief of the news pack. */
export function renderNewsPackForPrompt(pack: NewsPack): string {
  if (pack.items.length === 0) {
    return '(No stories fetched — return an empty draft and mark status=skipped.)';
  }
  const lines: string[] = [];
  lines.push(`# News pack (${pack.items.length} items, fetched ${pack.fetchedAt})`);
  lines.push('');
  pack.items.forEach((it, idx) => {
    lines.push(`## [${idx + 1}] ${it.title}`);
    lines.push(`- Source: ${it.source}`);
    lines.push(`- URL: ${it.url}`);
    lines.push(`- Published: ${it.publishedAt}`);
    if (it.excerpt) {
      lines.push(`- Excerpt: ${it.excerpt.slice(0, 280)}`);
    }
    if (it.body) {
      // Trim body aggressively per item to keep total prompt size sane
      const snippet = it.body.replace(/\s+/g, ' ').slice(0, 1200);
      lines.push(`- Body excerpt: ${snippet}`);
    }
    lines.push('');
  });
  return lines.join('\n');
}
