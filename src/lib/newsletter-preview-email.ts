export function renderNewsletterPreviewEmailHtml(params: {
  draftId: number;
  subject: string;
  content: string;
  approveUrl: string;
  changesUrl: string;
}): string {
  const safeSubject = params.subject
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const safeContent = params.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td style="padding: 28px 18px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" style="max-width: 650px; margin: 0 auto;">
          <tr>
            <td style="padding-bottom: 14px; border-bottom: 1px solid #d2d2d7;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px;">
                <span style="font-size: 15px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.02em;">ItsRyan.ai — Daily Preview</span>
                <span style="font-size: 12px; color: #6e6e73;">Draft #${params.draftId}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 18px 0 6px 0;">
              <div style="display:flex; gap: 10px; align-items:center;">
                <a href="${params.approveUrl}" style="display:inline-block; padding: 12px 16px; background:#34c759; color:#0b0d12; border-radius: 999px; font-weight: 700; text-decoration:none;">Approve &amp; Send</a>
                <a href="${params.changesUrl}" style="display:inline-block; padding: 12px 16px; background:#ffcc00; color:#0b0d12; border-radius: 999px; font-weight: 700; text-decoration:none;">Request Changes</a>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color:#6e6e73; line-height: 1.4;">Nothing will send unless you click Approve. Links are single-use.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 18px 0 10px 0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; line-height: 1.2;">${safeSubject}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 18px;">
              <div style="font-size: 15px; line-height: 1.65; color: #1d1d1f; white-space: pre-wrap;">${safeContent}</div>
            </td>
          </tr>

          <tr>
            <td style="padding-top: 14px; border-top: 1px solid #d2d2d7;">
              <p style="margin: 0; font-size: 12px; color: #6e6e73; line-height: 1.5;">This is the internal preview email. Subscriber emails include an unsubscribe link automatically.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
