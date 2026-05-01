// Shared HTML renderer for the newsletter (preview + subscriber-facing).
// Design paradigm: see docs/newsletter/email-paradigm.md.
// Quiet Modern — warm paper palette, Georgia headlines, system sans body,
// hairline section rules, 600px container, 40px side padding.
// Four visual motifs: spec strip, 4-question filter scorecard, win card, pull quote.
// Email-safe: inline styles, table-based layout, web-safe fonts only.

const NEWSLETTER_NAME = 'Anti-gatekeeping AI newsletter';

// Palette (locked by email-paradigm.md — do not tweak ad-hoc)
const PAGE    = '#f3efe6'; // warm paper
const CARD    = '#fbfaf7'; // slightly warmer white
const INK     = '#1c1c1a'; // near-black headlines
const BODY    = '#5a5248'; // body text
const MUTED   = '#a8917a'; // meta / kickers
const RULE    = '#e8e2d3'; // hairlines
const ACCENT  = '#c8612a'; // warm clay — signal color
const WIN_BG  = '#fcf6e8'; // win card tint
const SPEC_BG = '#f3efe6'; // spec strip (same as page)

// Typography stacks
const SERIF  = `Georgia, 'Iowan Old Style', 'Times New Roman', Times, serif`;
const SANS   = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const MONO   = `Consolas, 'Courier New', monospace`;

// ---------- helpers ----------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function inlineFormat(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${INK}; font-weight:600;">$1</strong>`);
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em style="font-family:' + SERIF + '; font-style:italic;">$2</em>');
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    `<a href="$2" style="color:${INK}; text-decoration:underline; text-underline-offset:2px; text-decoration-thickness:1px;">$1</a>`
  );
  return out;
}

// Parse a fenced block body like "Key: value" lines into a map preserving order.
function parseKV(src: string): Array<{ key: string; value: string }> {
  const out: Array<{ key: string; value: string }> = [];
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z][A-Za-z0-9 _-]*)\s*:\s*(.+)$/);
    if (m) out.push({ key: m[1].trim(), value: m[2].trim() });
  }
  return out;
}

// ---------- motif renderers ----------

function renderSpecStrip(body: string): string {
  // Expect keys like For / Cost / Stack. Render as a 3-column warm strip.
  const kv = parseKV(body);
  if (kv.length === 0) return '';
  const colWidth = `${Math.floor(100 / kv.length)}%`;
  const cells = kv.map(({ key, value }) => `
    <td width="${colWidth}" style="padding:14px 18px; vertical-align:top; border-right:1px solid ${RULE};">
      <div style="font-family:${SANS}; font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:${MUTED}; margin-bottom:6px;">${escapeHtml(key)}</div>
      <div style="font-family:${SANS}; font-size:14px; line-height:1.45; color:${INK};">${inlineFormat(value)}</div>
    </td>
  `).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0; background:${SPEC_BG}; border:1px solid ${RULE}; border-radius:2px;">
      <tr>${cells.replace(/border-right:1px solid [^;]+;(?=\s*">[^<]*<\/div>\s*<\/td>\s*$)/, '')}</tr>
    </table>
  `;
}

function renderFilterScorecard(body: string): string {
  const kv = parseKV(body);
  if (kv.length === 0) return '';
  // Expected keys: Who / Cost / Replaces / Catch (or with question phrasing).
  const rows = kv.map((row, i) => `
    <tr>
      <td width="42" style="vertical-align:top; padding:14px 0 14px 18px;">
        <div style="width:26px; height:26px; border-radius:50%; border:1.5px solid ${ACCENT}; color:${ACCENT}; font-family:${SANS}; font-size:12px; font-weight:700; line-height:23px; text-align:center;">${i + 1}</div>
      </td>
      <td style="vertical-align:top; padding:14px 18px 14px 12px; border-bottom:${i < kv.length - 1 ? `1px solid ${RULE}` : 'none'};">
        <div style="font-family:${SANS}; font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:${MUTED}; margin-bottom:4px;">${escapeHtml(row.key)}</div>
        <div style="font-family:${SANS}; font-size:15px; line-height:1.5; color:${INK};">${inlineFormat(row.value)}</div>
      </td>
    </tr>
  `).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0; background:#ffffff; border:1px solid ${RULE}; border-radius:2px;">
      <tr>
        <td style="padding:10px 18px; background:${SPEC_BG}; border-bottom:1px solid ${RULE};">
          <div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:${MUTED};">The 4-Question Filter</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderWinCard(body: string): string {
  const kv = parseKV(body);
  const map: Record<string, string> = {};
  for (const { key, value } of kv) map[key.toLowerCase()] = value;
  const biz = map.business || map.who || '';
  const headline = map.headline || '';
  const metric = map.metric || '';
  const bodyText = map.body || '';
  const quote = map.quote || '';

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0; background:${WIN_BG}; border-radius:2px;">
      <tr>
        <td style="padding:22px 24px;">
          ${biz ? `<div style="font-family:${SANS}; font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:${MUTED}; margin-bottom:8px;">${inlineFormat(biz)}</div>` : ''}
          ${headline ? `<div style="font-family:${SERIF}; font-size:18px; font-weight:500; line-height:1.3; color:${INK}; letter-spacing:-0.01em; margin-bottom:10px;">${inlineFormat(headline)}</div>` : ''}
          ${metric ? `<div style="font-family:${SERIF}; font-size:30px; font-weight:500; line-height:1.1; color:${ACCENT}; letter-spacing:-0.02em; margin:4px 0 14px 0;">${inlineFormat(metric)}</div>` : ''}
          ${bodyText ? `<div style="font-family:${SANS}; font-size:15px; line-height:1.6; color:${BODY}; margin-bottom:${quote ? '12px' : '0'};">${inlineFormat(bodyText)}</div>` : ''}
          ${quote ? `<div style="font-family:${SERIF}; font-style:italic; font-size:15px; line-height:1.5; color:${INK}; border-left:2px solid ${ACCENT}; padding-left:14px; margin-top:8px;">&ldquo;${inlineFormat(quote.replace(/^["'\u201c]|["'\u201d]$/g, ''))}&rdquo;</div>` : ''}
        </td>
      </tr>
    </table>
  `;
}

function renderPullQuote(body: string): string {
  const text = body.trim().replace(/^["'\u201c]|["'\u201d]$/g, '');
  if (!text) return '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:18px 0 18px 18px; border-left:3px solid ${ACCENT};">
          <div style="font-family:${SERIF}; font-style:italic; font-size:19px; line-height:1.4; color:${INK}; letter-spacing:-0.005em;">&ldquo;${inlineFormat(text)}&rdquo;</div>
        </td>
      </tr>
    </table>
  `;
}

// ---------- markdown renderer ----------

function renderMarkdownish(input: string): string {
  // Belt-and-suspenders: strip any stray placeholder text the model may emit.
  const cleaned = input.replace(/\[REPLACE:[^\]]*\]/gi, '').replace(/\n{3,}/g, '\n\n');

  const lines = cleaned.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let inList = false;
  let inOrdered = false;
  let orderedIdx = 0;
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];
  let paragraph: string[] = [];

  const flushP = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      html.push(
        `<p style="margin:0 0 18px 0; font-family:${SANS}; font-size:16px; line-height:1.65; color:${BODY};">${inlineFormat(text)}</p>`
      );
    }
    paragraph = [];
  };

  const closeLists = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    if (inOrdered) {
      html.push('</table>');
      inOrdered = false;
      orderedIdx = 0;
    }
  };

  const flushCode = () => {
    const raw = codeBuf.join('\n');
    const lang = codeLang.trim().toLowerCase();
    if (lang === 'spec') {
      html.push(renderSpecStrip(raw));
    } else if (lang === 'filter') {
      html.push(renderFilterScorecard(raw));
    } else if (lang === 'win') {
      html.push(renderWinCard(raw));
    } else if (lang === 'pullquote' || lang === 'pq') {
      html.push(renderPullQuote(raw));
    } else {
      const code = escapeHtml(raw);
      html.push(
        `<pre style="margin:0 0 22px 0; padding:16px 18px; background:${INK}; color:#f3efe6; border-radius:3px; font-family:${MONO}; font-size:13px; line-height:1.6; white-space:pre-wrap; word-break:break-word;">${code}</pre>`
      );
    }
    codeBuf = [];
    codeLang = '';
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, '');
    const trimmed = line.trim();

    // Fenced code
    if (/^```/.test(trimmed)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushP();
        closeLists();
        inCode = true;
        codeLang = trimmed.replace(/^```/, '');
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (!trimmed) {
      flushP();
      closeLists();
      continue;
    }

    // H2 — the major section heading with a kicker rule above
    if (/^##\s+/.test(trimmed)) {
      flushP();
      closeLists();
      const heading = trimmed.replace(/^##\s+/, '');
      html.push(`
        <div style="margin:38px 0 18px 0;">
          <div style="border-top:1px solid ${RULE}; padding-top:18px;">
            <div style="font-family:${SANS}; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:${MUTED}; margin-bottom:8px;">${inlineFormat(heading)}</div>
          </div>
        </div>
      `);
      continue;
    }

    // H3 — sub-heading inside a section (bold inline label-ish)
    if (/^###\s+/.test(trimmed)) {
      flushP();
      closeLists();
      const heading = trimmed.replace(/^###\s+/, '');
      html.push(
        `<h3 style="margin:22px 0 10px 0; font-family:${SERIF}; font-size:20px; font-weight:500; color:${INK}; letter-spacing:-0.015em; line-height:1.25;">${inlineFormat(heading)}</h3>`
      );
      continue;
    }

    // H1 — rarely used; treat as section headline
    if (/^#\s+/.test(trimmed)) {
      flushP();
      closeLists();
      html.push(
        `<h2 style="margin:28px 0 14px 0; font-family:${SERIF}; font-size:26px; font-weight:500; color:${INK}; letter-spacing:-0.02em; line-height:1.2;">${inlineFormat(trimmed.replace(/^#\s+/, ''))}</h2>`
      );
      continue;
    }

    // Ordered list → numbered circle steps
    if (/^\d+\.\s+/.test(trimmed)) {
      flushP();
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      if (!inOrdered) {
        html.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px 0;">`);
        inOrdered = true;
        orderedIdx = 0;
      }
      orderedIdx += 1;
      const item = trimmed.replace(/^\d+\.\s+/, '');
      html.push(`
        <tr>
          <td width="40" style="vertical-align:top; padding:4px 0 14px 0;">
            <div style="width:26px; height:26px; border-radius:50%; border:1.5px solid ${ACCENT}; color:${ACCENT}; font-family:${SANS}; font-size:12px; font-weight:700; line-height:23px; text-align:center;">${orderedIdx}</div>
          </td>
          <td style="vertical-align:top; padding:6px 0 14px 12px; font-family:${SANS}; font-size:16px; line-height:1.65; color:${BODY};">${inlineFormat(item)}</td>
        </tr>
      `);
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      flushP();
      if (inOrdered) {
        html.push('</table>');
        inOrdered = false;
        orderedIdx = 0;
      }
      if (!inList) {
        html.push(`<ul style="margin:0 0 22px 20px; padding:0; color:${BODY}; font-family:${SANS}; font-size:16px; line-height:1.65;">`);
        inList = true;
      }
      html.push(`<li style="margin:0 0 6px 0;">${inlineFormat(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    // Blockquote → pull quote
    if (/^>\s?/.test(trimmed)) {
      flushP();
      closeLists();
      html.push(renderPullQuote(trimmed.replace(/^>\s?/, '')));
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushP();
      closeLists();
      html.push(`<hr style="border:none; border-top:1px solid ${RULE}; margin:28px 0;">`);
      continue;
    }

    closeLists();
    paragraph.push(trimmed);
  }

  if (inCode) flushCode();
  flushP();
  closeLists();
  return html.join('\n');
}

// ---------- outer shell ----------

export interface NewsletterEmailOptions {
  kind: 'preview' | 'subscriber';
  subject: string;
  content: string;
  siteUrl: string;
  unsubscribeUrl?: string;
  approveUrl?: string;
  changesUrl?: string;
  draftId?: number;
  previewText?: string;
}

export function renderNewsletterEmailHtml(opts: NewsletterEmailOptions): string {
  const safeSubject = escapeHtml(opts.subject);
  const body = renderMarkdownish(opts.content);
  const siteLabel = opts.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const preheader = escapeHtml(
    (opts.previewText && opts.previewText.trim()
      ? opts.previewText
      : opts.content.replace(/[#>*_\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120))
  );
  const dateLabel = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const deck = (opts.previewText && opts.previewText.trim()) || '';

  const previewBar = opts.kind === 'preview'
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0; border-top:1px solid ${RULE}; border-bottom:1px solid ${RULE};">
        <tr>
          <td style="padding:14px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:${ACCENT};">Internal preview</td>
                <td align="right" style="font-family:${SANS}; font-size:10px; color:${MUTED}; letter-spacing:0.08em; text-transform:uppercase;">Draft #${opts.draftId ?? ''}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0 16px 0;">
            <a class="nl-btn nl-btn-primary" href="${opts.approveUrl}" style="display:inline-block; padding:12px 20px; background:${INK}; color:${PAGE}; border-radius:2px; font-family:${SANS}; font-weight:600; font-size:13px; text-decoration:none; margin-right:8px; letter-spacing:0.02em;">Approve &amp; Send</a>
            <a class="nl-btn nl-btn-secondary" href="${opts.changesUrl}" style="display:inline-block; padding:12px 20px; background:transparent; color:${INK}; border:1px solid ${INK}; border-radius:2px; font-family:${SANS}; font-weight:600; font-size:13px; text-decoration:none; letter-spacing:0.02em;">Request Changes</a>
            <div style="margin-top:12px; font-family:${SANS}; font-size:11px; color:${MUTED}; line-height:1.5;">Nothing sends unless you click Approve. Links are single-use.</div>
          </td>
        </tr>
      </table>
    `
    : '';

  const subscriberFooter = opts.kind === 'subscriber' && opts.unsubscribeUrl
    ? `
      <div style="margin-top:14px; font-family:${SANS}; font-size:11px; color:${MUTED}; line-height:1.7;">
        You're reading <strong style="color:${BODY}; font-weight:600;">${escapeHtml(NEWSLETTER_NAME)}</strong> because you signed up at <a href="${opts.siteUrl}" style="color:${MUTED}; text-decoration:underline;">${siteLabel}</a>.<br/>
        <a href="${opts.unsubscribeUrl}" style="color:${MUTED}; text-decoration:underline;">Unsubscribe</a> · <a href="${opts.siteUrl}" style="color:${MUTED}; text-decoration:underline;">Archive</a>
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${safeSubject}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .nl-outer { padding: 0 !important; }
      .nl-card { border-radius: 0 !important; width: 100% !important; }
      .nl-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .nl-pad-body { padding: 28px 22px 16px 22px !important; }
      .nl-pad-masthead { padding: 26px 22px 0 22px !important; }
      .nl-pad-footer { padding: 26px 22px 34px 22px !important; }
      .nl-subject { font-size: 26px !important; line-height: 1.22 !important; letter-spacing: -0.015em !important; }
      .nl-deck { font-size: 16px !important; }
      .nl-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; margin: 0 0 10px 0 !important; }
      .nl-btn-primary { margin-right: 0 !important; }
      .nl-masthead-date { display: block !important; text-align: left !important; margin-top: 6px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:${PAGE}; color:${BODY}; -webkit-font-smoothing:antialiased; font-family:${SANS};">
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};">
    <tr>
      <td class="nl-outer" align="center" style="padding:40px 16px;">
        <table class="nl-card" role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:${CARD}; border-radius:2px;">

          <!-- Masthead -->
          <tr>
            <td class="nl-pad-masthead" style="padding:34px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${opts.siteUrl}" style="font-family:${SERIF}; font-size:18px; font-weight:500; color:${INK}; text-decoration:none; letter-spacing:-0.015em;">itsryan.ai</a>
                    <span style="font-family:${SANS}; font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:${MUTED}; margin-left:10px;">${escapeHtml(NEWSLETTER_NAME)}</span>
                  </td>
                  <td class="nl-masthead-date" align="right" style="font-family:${SANS}; font-size:10px; color:${MUTED}; letter-spacing:0.1em; text-transform:uppercase;">${dateLabel}</td>
                </tr>
              </table>
              <div style="margin-top:22px; height:1px; background:${RULE};"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="nl-pad-body" style="padding:32px 40px 12px 40px;">
              ${opts.kind === 'preview' ? previewBar : ''}
              <div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:${ACCENT}; margin-bottom:12px;">This week</div>
              <h1 class="nl-subject" style="margin:0 0 14px 0; font-family:${SERIF}; font-size:34px; font-weight:500; color:${INK}; line-height:1.15; letter-spacing:-0.025em;">${safeSubject}</h1>
              ${deck ? `<div class="nl-deck" style="margin:0 0 26px 0; font-family:${SERIF}; font-style:italic; font-size:17px; line-height:1.45; color:${BODY};">${escapeHtml(deck)}</div>` : ''}
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="nl-pad-footer" style="padding:28px 40px 40px 40px; border-top:1px solid ${RULE};">
              <div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:${MUTED}; margin-bottom:8px;">From the archives</div>
              <div style="font-family:${SANS}; font-size:14px; line-height:1.6; color:${BODY}; margin-bottom:14px;">
                Free guides and prompts for small business owners putting AI to work.
              </div>
              <a href="${opts.siteUrl}" style="display:inline-block; padding:10px 18px; background:${INK}; color:${PAGE}; border-radius:2px; font-family:${SANS}; font-weight:600; font-size:13px; text-decoration:none; letter-spacing:0.02em;">Browse itsryan.ai</a>
              ${subscriberFooter}
            </td>
          </tr>
        </table>

        <div style="margin-top:18px; font-family:${SANS}; font-size:11px; color:${MUTED}; text-align:center; letter-spacing:0.04em;">
          Written by Ryan · Reply to this email — it lands in my inbox.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
