// Shared HTML renderer for the newsletter (preview + subscriber-facing).
// Editorial layout: 640px card, generous whitespace, accent rule per section,
// monochrome with a single warm accent for links + buttons.
// Email-safe: inline styles, table-based layout.

const ACCENT = '#d24d1f';            // warm accent (links, accent rule)
const INK = '#0b0d12';               // primary text / headings
const BODY = '#1d1d1f';              // body copy
const MUTED = '#6e6e73';             // secondary
const RULE = '#e5e5ea';              // hairline rules
const PAGE_BG = '#f5f5f4';           // outer page background
const CARD_BG = '#ffffff';           // card
const CODE_BG = '#f7f5f1';           // code block background

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
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    `<a href="$2" style="color:${ACCENT}; text-decoration:underline; text-underline-offset:2px;">$1</a>`
  );
  return out;
}

function renderMarkdownish(input: string): string {
  // Strip any stray placeholder text the model may emit despite the prompt rules.
  // This is a belt-and-suspenders guard so subscribers never see "[REPLACE: ...]".
  const cleaned = input.replace(/\[REPLACE:[^\]]*\]/gi, '').replace(/\n{3,}/g, '\n\n');

  const lines = cleaned.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inCode = false;
  let codeBuffer: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      html.push(
        `<p style="margin:0 0 18px 0; font-size:16px; line-height:1.7; color:${BODY};">${inlineFormat(text)}</p>`
      );
    }
    paragraph = [];
  };

  const closeLists = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      html.push('</ol>');
      inOrderedList = false;
    }
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) return;
    const code = escapeHtml(codeBuffer.join('\n'));
    html.push(
      `<pre style="margin:0 0 22px 0; padding:18px 20px; background:${CODE_BG}; border:1px solid ${RULE}; border-radius:10px; font-family:'SF Mono', ui-monospace, Menlo, Consolas, monospace; font-size:14px; line-height:1.65; color:${INK}; white-space:pre-wrap; word-break:break-word;">${code}</pre>`
    );
    codeBuffer = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, '');
    const trimmed = line.trim();

    // Fenced code blocks
    if (/^```/.test(trimmed)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        closeLists();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      closeLists();
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      closeLists();
      html.push(
        `<h3 style="margin:30px 0 10px 0; font-size:16px; font-weight:600; color:${INK}; letter-spacing:-0.005em;">${inlineFormat(trimmed.replace(/^###\s+/, ''))}</h3>`
      );
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      flushParagraph();
      closeLists();
      const heading = trimmed.replace(/^##\s+/, '');
      html.push(
        `<div style="margin:42px 0 14px 0;">
          <div style="display:inline-block; width:28px; height:3px; background:${ACCENT}; margin-bottom:14px; border-radius:2px;"></div>
          <h2 style="margin:0; font-size:22px; font-weight:700; color:${INK}; letter-spacing:-0.025em; line-height:1.25;">${inlineFormat(heading)}</h2>
        </div>`
      );
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      closeLists();
      html.push(
        `<h1 style="margin:36px 0 16px 0; font-size:26px; font-weight:700; color:${INK}; letter-spacing:-0.03em; line-height:1.2;">${inlineFormat(trimmed.replace(/^#\s+/, ''))}</h1>`
      );
      continue;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        html.push(`<ol style="margin:0 0 22px 26px; padding:0; color:${BODY}; font-size:16px; line-height:1.75;">`);
        inOrderedList = true;
      }
      html.push(`<li style="margin:0 0 8px 0;">${inlineFormat(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }
    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      if (inOrderedList) {
        html.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        html.push(`<ul style="margin:0 0 22px 22px; padding:0; color:${BODY}; font-size:16px; line-height:1.75; list-style-type:disc;">`);
        inList = true;
      }
      html.push(`<li style="margin:0 0 8px 0;">${inlineFormat(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      closeLists();
      html.push(
        `<blockquote style="margin:0 0 22px 0; padding:14px 20px; border-left:3px solid ${ACCENT}; background:${CODE_BG}; color:${BODY}; font-size:15px; line-height:1.7; border-radius:0 6px 6px 0;">${inlineFormat(trimmed.replace(/^>\s?/, ''))}</blockquote>`
      );
      continue;
    }
    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      closeLists();
      html.push(`<hr style="border:none; border-top:1px solid ${RULE}; margin:32px 0;">`);
      continue;
    }

    closeLists();
    paragraph.push(trimmed);
  }

  if (inCode) flushCode();
  flushParagraph();
  closeLists();
  return html.join('\n');
}

export interface NewsletterEmailOptions {
  kind: 'preview' | 'subscriber';
  subject: string;
  content: string;
  siteUrl: string; // e.g. https://itsryan.ai
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

  const todayLabel = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const previewBar = opts.kind === 'preview'
    ? `
      <tr>
        <td style="padding:0 0 24px 0; border-bottom:1px solid ${RULE};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:${ACCENT};">Internal preview</td>
              <td align="right" style="font-size:11px; color:${MUTED}; letter-spacing:0.05em;">Draft #${opts.draftId ?? ''}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 0 4px 0;">
          <a href="${opts.approveUrl}" style="display:inline-block; padding:13px 22px; background:${INK}; color:#ffffff; border-radius:999px; font-weight:600; font-size:14px; text-decoration:none; margin-right:8px;">Approve &amp; Send</a>
          <a href="${opts.changesUrl}" style="display:inline-block; padding:13px 22px; background:${CARD_BG}; color:${INK}; border:1px solid ${INK}; border-radius:999px; font-weight:600; font-size:14px; text-decoration:none;">Request Changes</a>
          <p style="margin:14px 0 0 0; font-size:12px; color:${MUTED}; line-height:1.5;">Nothing sends unless you click Approve. Links are single-use.</p>
        </td>
      </tr>
    `
    : '';

  const unsubFooter = opts.kind === 'subscriber' && opts.unsubscribeUrl
    ? `
      <tr>
        <td style="padding:18px 0 0 0; font-size:12px; color:${MUTED}; line-height:1.7;">
          You're getting this because you signed up at <a href="${opts.siteUrl}" style="color:${MUTED}; text-decoration:underline;">${siteLabel}</a>.
          <br/>
          <a href="${opts.unsubscribeUrl}" style="color:${MUTED}; text-decoration:underline;">Unsubscribe</a>
        </td>
      </tr>
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
</head>
<body style="margin:0; padding:0; background:${PAGE_BG}; font-family:'Charter', 'Iowan Old Style', 'Source Serif Pro', Georgia, 'Times New Roman', serif; -webkit-font-smoothing:antialiased; color:${BODY};">
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:48px 16px 56px 16px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%; background:${CARD_BG}; border-radius:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03), 0 12px 32px rgba(11,13,18,0.06);">

          <!-- Masthead -->
          <tr>
            <td style="padding:36px 48px 0 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${opts.siteUrl}" style="font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; font-size:18px; font-weight:700; color:${INK}; text-decoration:none; letter-spacing:-0.025em;">itsryan.ai</a>
                  </td>
                  <td align="right" style="font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif; font-size:11px; color:${MUTED}; letter-spacing:0.08em; text-transform:uppercase;">${todayLabel}</td>
                </tr>
              </table>
              <div style="margin-top:24px; height:1px; background:${RULE};"></div>
            </td>
          </tr>

          <!-- Preview bar (preview kind only) -->
          ${opts.kind === 'preview' ? `
          <tr>
            <td style="padding:24px 48px 0 48px; font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;">
              ${previewBar}
            </td>
          </tr>` : ''}

          <!-- Subject + body -->
          <tr>
            <td style="padding:${opts.kind === 'preview' ? '32px' : '44px'} 48px 16px 48px;">
              <h1 style="margin:0 0 28px 0; font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; font-size:32px; font-weight:700; color:${INK}; line-height:1.18; letter-spacing:-0.035em;">${safeSubject}</h1>
              <div style="font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                ${body}
              </div>
            </td>
          </tr>

          <!-- Footer CTA -->
          <tr>
            <td style="padding:32px 48px 44px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;">
                <tr>
                  <td style="padding:24px 0 0 0; border-top:1px solid ${RULE};">
                    <p style="margin:0 0 6px 0; font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:${ACCENT};">From the archives</p>
                    <p style="margin:0 0 18px 0; font-size:15px; color:${BODY}; line-height:1.6;">
                      Free tools, prompts, and step-by-step guides for small business owners running on AI.
                    </p>
                    <a href="${opts.siteUrl}" style="display:inline-block; padding:11px 20px; background:${INK}; color:#ffffff; border-radius:999px; font-weight:600; font-size:14px; text-decoration:none;">Browse itsryan.ai</a>
                  </td>
                </tr>
                ${unsubFooter}
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
