// Shared HTML renderer for the newsletter (preview + subscriber-facing).
// Email-safe: inline styles, table-based layout, 600px max-width.

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
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0b0d12;">$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" style="color:#0066ff; text-decoration:underline;">$1</a>'
  );
  return out;
}

function renderMarkdownish(input: string): string {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let inList = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      html.push(
        `<p style="margin:0 0 18px 0; font-size:16px; line-height:1.7; color:#1d1d1f;">${inlineFormat(text)}</p>`
      );
    }
    paragraph = [];
  };

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    if (/^###\s+/.test(line)) {
      flushParagraph();
      closeList();
      html.push(
        `<h3 style="margin:28px 0 10px 0; font-size:17px; font-weight:600; color:#0b0d12; letter-spacing:-0.01em;">${inlineFormat(line.replace(/^###\s+/, ''))}</h3>`
      );
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushParagraph();
      closeList();
      html.push(
        `<h2 style="margin:36px 0 14px 0; font-size:21px; font-weight:700; color:#0b0d12; letter-spacing:-0.02em; line-height:1.25;">${inlineFormat(line.replace(/^##\s+/, ''))}</h2>`
      );
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (!inList) {
        html.push('<ul style="margin:0 0 18px 22px; padding:0; color:#1d1d1f; font-size:16px; line-height:1.7;">');
        inList = true;
      }
      html.push(`<li style="margin:0 0 6px 0;">${inlineFormat(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushParagraph();
      closeList();
      html.push(
        `<blockquote style="margin:0 0 18px 0; padding:14px 18px; border-left:3px solid #0b0d12; background:#f5f5f7; color:#1d1d1f; font-size:15px; line-height:1.65; border-radius:6px;">${inlineFormat(line.replace(/^>\s?/, ''))}</blockquote>`
      );
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
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
}

export function renderNewsletterEmailHtml(opts: NewsletterEmailOptions): string {
  const safeSubject = escapeHtml(opts.subject);
  const body = renderMarkdownish(opts.content);
  const siteLabel = opts.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const preheader = escapeHtml(
    opts.content.replace(/[#>*_\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120)
  );

  const previewBar = opts.kind === 'preview'
    ? `
      <tr>
        <td style="padding:0 0 18px 0; border-bottom:1px solid #e5e5ea;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px; font-weight:600; color:#0b0d12; letter-spacing:-0.01em;">ItsRyan.ai — Internal Preview</td>
              <td align="right" style="font-size:12px; color:#6e6e73;">Draft #${opts.draftId ?? ''}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 0 8px 0;">
          <a href="${opts.approveUrl}" style="display:inline-block; padding:12px 20px; background:#0b0d12; color:#ffffff; border-radius:999px; font-weight:600; font-size:14px; text-decoration:none; margin-right:8px;">Approve &amp; Send</a>
          <a href="${opts.changesUrl}" style="display:inline-block; padding:12px 20px; background:#ffffff; color:#0b0d12; border:1px solid #0b0d12; border-radius:999px; font-weight:600; font-size:14px; text-decoration:none;">Request Changes</a>
          <p style="margin:12px 0 0 0; font-size:12px; color:#6e6e73; line-height:1.5;">Nothing sends unless you click Approve. Links are single-use.</p>
        </td>
      </tr>
    `
    : '';

  const unsubFooter = opts.kind === 'subscriber' && opts.unsubscribeUrl
    ? `
      <tr>
        <td style="padding:8px 0 0 0; font-size:12px; color:#86868b; line-height:1.6;">
          You're getting this because you signed up at <a href="${opts.siteUrl}" style="color:#86868b; text-decoration:underline;">${siteLabel}</a>.
          <br/>
          <a href="${opts.unsubscribeUrl}" style="color:#86868b; text-decoration:underline;">Unsubscribe</a>
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
<body style="margin:0; padding:0; background:#f5f5f7; font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; box-shadow:0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06); overflow:hidden;">
          <tr>
            <td style="padding:32px 36px 0 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${opts.siteUrl}" style="font-size:15px; font-weight:700; color:#0b0d12; text-decoration:none; letter-spacing:-0.02em;">itsryan.ai</a>
                  </td>
                  <td align="right" style="font-size:12px; color:#86868b;">AI for founders</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 36px 0 36px;">
              ${previewBar}
            </td>
          </tr>

          <tr>
            <td style="padding:${opts.kind === 'preview' ? '20px' : '36px'} 36px 8px 36px;">
              <h1 style="margin:0 0 20px 0; font-size:28px; font-weight:700; color:#0b0d12; line-height:1.2; letter-spacing:-0.03em;">${safeSubject}</h1>
              ${body}
            </td>
          </tr>

          <tr>
            <td style="padding:20px 36px 32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:20px 0 0 0; border-top:1px solid #e5e5ea;">
                    <p style="margin:0 0 14px 0; font-size:14px; color:#1d1d1f; line-height:1.6;">
                      Want more? Browse free tools, prompts, and guides at
                      <a href="${opts.siteUrl}" style="color:#0066ff; text-decoration:none; font-weight:600;">${siteLabel}</a>.
                    </p>
                    <a href="${opts.siteUrl}" style="display:inline-block; padding:10px 18px; background:#0b0d12; color:#ffffff; border-radius:999px; font-weight:600; font-size:13px; text-decoration:none;">Visit itsryan.ai →</a>
                  </td>
                </tr>
                ${unsubFooter}
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0 0; font-size:12px; color:#86868b; text-align:center;">
          Written by a human. Ryan. Reply to this email — it goes straight to my inbox.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
