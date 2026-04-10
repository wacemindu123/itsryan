import { createServerSupabaseClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── Theme regex patterns ─────────────────────────────────────────────
const THEME_PATTERNS: [string, RegExp][] = [
  ['marketing/leads', /market|lead|advertis|social media|seo|brand|audience|traffic|visibility/i],
  ['tech/website', /website|tech|app|software|platform|tool|integr|shopify|wordpress/i],
  ['time/ops', /time|overwhelm|organiz|systems?|process|sop|manual|tedious|repetit/i],
  ['customer/retention', /customer|client|retention|churn|support|onboard/i],
  ['ai/automation', /automat|ai |a\.i\.|agent|workflow|zapier|make\.com|n8n/i],
  ['scaling/growth', /scal|grow|expand|plateau|stuck/i],
  ['sales/conversion', /sales|convert|pipeline|crm|follow[ -]?up|outreach/i],
  ['finance/pricing', /pric|revenue|cash|financ|budget|profit|invoic/i],
  ['inventory/supply', /inventory|supply|shipp|fulfil|logistic|manufact/i],
  ['hiring/team', /hir|staff|employ|delegate|outsourc|contractor/i],
];

function detectThemes(text: string): string[] {
  if (!text) return [];
  return THEME_PATTERNS.filter(([, rx]) => rx.test(text)).map(([name]) => name);
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

interface RawSubmission {
  id: number;
  name: string;
  email: string;
  business: string;
  scaling_challenge: string;
  phone: string | null;
  website: string | null;
  created_at: string;
  contacted: boolean;
  contacted_at: string | null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Fetch all submissions
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const subs: RawSubmission[] = submissions || [];

    // Fetch overlap emails
    const [nlRes, csRes, pwRes] = await Promise.all([
      supabase.from('newsletter_subscribers').select('email'),
      supabase.from('class_signups').select('email'),
      supabase.from('project_waitlist').select('email'),
    ]);
    const warmEmails = new Set<string>();
    const nlEmails = new Set<string>();
    const csEmails = new Set<string>();
    const pwEmails = new Set<string>();

    for (const row of nlRes.data || []) { warmEmails.add(row.email); nlEmails.add(row.email); }
    for (const row of csRes.data || []) { warmEmails.add(row.email); csEmails.add(row.email); }
    for (const row of pwRes.data || []) { warmEmails.add(row.email); pwEmails.add(row.email); }

    // Enrich submissions
    const now = Date.now();
    const enriched = subs.map(s => {
      const themes = detectThemes(s.scaling_challenge);
      const is_warm = warmEmails.has(s.email);
      const ageDays = Math.floor((now - new Date(s.created_at).getTime()) / 86400000);
      return { ...s, themes, is_warm, ageDays };
    });

    // ── KPIs ─────────────────────────────────────────────────────────
    const total = enriched.length;
    const contacted = enriched.filter(s => s.contacted).length;
    const uncontacted = total - contacted;
    const stale30d = enriched.filter(s => !s.contacted && s.ageDays >= 30).length;
    const warm = enriched.filter(s => s.is_warm).length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = enriched.filter(s => s.created_at.slice(0, 10) === todayStr).length;
    const oldestStaleDays = enriched
      .filter(s => !s.contacted)
      .reduce((max, s) => Math.max(max, s.ageDays), 0);

    // ── Weekly volume (last 12 weeks) ────────────────────────────────
    const twelveWeeksAgo = new Date(now - 12 * 7 * 86400000);
    const weekMap = new Map<string, { total: number; contacted: number }>();
    for (const s of enriched) {
      if (new Date(s.created_at) < twelveWeeksAgo) continue;
      const week = getWeekStart(new Date(s.created_at));
      const entry = weekMap.get(week) || { total: 0, contacted: 0 };
      entry.total++;
      if (s.contacted) entry.contacted++;
      weekMap.set(week, entry);
    }
    const weekly = Array.from(weekMap.entries())
      .map(([week, v]) => ({ week, ...v }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // ── Theme counts ─────────────────────────────────────────────────
    const themeCounts = new Map<string, number>();
    for (const s of enriched) {
      for (const t of s.themes) {
        themeCounts.set(t, (themeCounts.get(t) || 0) + 1);
      }
    }
    const themes = Array.from(themeCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);

    // ── Data quality ─────────────────────────────────────────────────
    const missingWebsite = enriched.filter(s => !s.website || s.website.trim() === '').length;
    const missingScheme = enriched.filter(s => s.website && s.website.trim() !== '' && !/^https?:\/\//i.test(s.website)).length;
    const missingPhone = enriched.filter(s => !s.phone || s.phone.trim() === '').length;
    const tinyDescription = enriched.filter(s => (s.scaling_challenge || '').length < 15).length;
    const lowercaseName = enriched.filter(s => /^[a-z]/.test(s.name)).length;

    const dataQuality = [
      { label: 'Missing website', count: missingWebsite },
      { label: 'Website missing scheme', count: missingScheme },
      { label: 'Missing phone', count: missingPhone },
      { label: 'Tiny description (<15 chars)', count: tinyDescription },
      { label: 'Lowercase name', count: lowercaseName },
    ];

    // ── Staleness histogram ──────────────────────────────────────────
    const buckets = { '<7d': 0, '7-14d': 0, '14-30d': 0, '>30d': 0 };
    for (const s of enriched) {
      if (s.contacted) continue;
      if (s.ageDays < 7) buckets['<7d']++;
      else if (s.ageDays < 14) buckets['7-14d']++;
      else if (s.ageDays < 30) buckets['14-30d']++;
      else buckets['>30d']++;
    }
    const staleness = Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));

    // ── Email domain breakdown ───────────────────────────────────────
    const personalDomains = new Set(['gmail.com', 'yahoo.com', 'icloud.com', 'outlook.com', 'proton.me', 'protonmail.com', 'hotmail.com', 'aol.com', 'live.com']);
    const domainMap = new Map<string, number>();
    for (const s of enriched) {
      const domain = s.email.split('@')[1]?.toLowerCase() || 'unknown';
      let bucket: string;
      if (domain === 'gmail.com') bucket = 'gmail.com';
      else if (domain === 'yahoo.com') bucket = 'yahoo.com';
      else if (personalDomains.has(domain)) bucket = 'other personal';
      else bucket = 'business domain';
      domainMap.set(bucket, (domainMap.get(bucket) || 0) + 1);
    }
    const emailDomains = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    // ── Warm overlap breakdown ───────────────────────────────────────
    const warmOverlap = [
      { source: 'Newsletter', count: enriched.filter(s => nlEmails.has(s.email)).length },
      { source: 'Class Signups', count: enriched.filter(s => csEmails.has(s.email)).length },
      { source: 'Project Waitlist', count: enriched.filter(s => pwEmails.has(s.email)).length },
    ];

    // ── Enriched submissions for the table ───────────────────────────
    const tableData = enriched.map(({ ageDays, ...rest }) => ({
      ...rest,
      ageDays,
    }));

    return NextResponse.json({
      kpis: { total, contacted, uncontacted, stale30d, warm, today: todayCount, oldestStaleDays },
      weekly,
      themes,
      dataQuality,
      staleness,
      emailDomains,
      warmOverlap,
      submissions: tableData,
    });
  } catch (error) {
    console.error('Error computing submission stats:', error);
    return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 });
  }
}
