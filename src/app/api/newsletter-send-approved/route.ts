import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase';
import { requireCronAuth } from '@/lib/newsletter-approval';

function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-me';
  return crypto
    .createHmac('sha256', secret)
    .update(email.toLowerCase())
    .digest('hex');
}

function generateEmailHtml(subject: string, content: string, email: string): string {
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai'}/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #d2d2d7;">
              <span style="font-size: 17px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.02em;">ItsRyan.ai</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0 16px 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.02em; line-height: 1.2;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                ${sanitizeHtml(content).replace(/\n/g, '<br>')}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #d2d2d7;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6e6e73; line-height: 1.5;">
                You're receiving this because you subscribed to the ItsRyan.ai newsletter.
              </p>
              <p style="margin: 0; font-size: 13px; color: #6e6e73;">
                <a href="${unsubscribeUrl}" style="color: #6e6e73; text-decoration: underline;">Unsubscribe</a>
              </p>
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

export async function POST(request: NextRequest) {
  const denied = requireCronAuth(request);
  if (denied) return denied;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const { draftId } = await request.json();

    if (!draftId) {
      return NextResponse.json({ error: 'draftId is required' }, { status: 400 });
    }

    const { data: draft, error: draftErr } = await supabase
      .from('newsletter_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (draftErr || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (draft.sent_at) {
      return NextResponse.json({ success: true, message: 'Already sent' });
    }

    if (!draft.send_started_at) {
      return NextResponse.json({ error: 'Draft not approved' }, { status: 400 });
    }

    // Fetch active subscribers
    const { data: subscribers, error: subErr } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('subscribed', true);

    if (subErr) throw subErr;

    if (!subscribers || subscribers.length === 0) {
      await supabase
        .from('newsletter_drafts')
        .update({ status: 'skipped' })
        .eq('id', draftId);

      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const s of subscribers) {
      try {
        const html = generateEmailHtml(draft.subject, draft.content, s.email);
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: s.email,
          subject: draft.subject,
          html,
          replyTo: fromEmail,
        });

        if (error) {
          failed++;
          errors.push(`${s.email}: ${error.message}`);
          await supabase.from('newsletter_send_logs').insert([
            { draft_id: draftId, to_email: s.email, status: 'failed', error: error.message },
          ]);
        } else {
          sent++;
          await supabase.from('newsletter_send_logs').insert([
            { draft_id: draftId, to_email: s.email, status: 'sent', resend_message_id: data?.id || null },
          ]);
        }
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${s.email}: ${msg}`);
        await supabase.from('newsletter_send_logs').insert([
          { draft_id: draftId, to_email: s.email, status: 'failed', error: msg },
        ]);
      }
    }

    await supabase
      .from('newsletter_drafts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', draftId);

    return NextResponse.json({
      success: true,
      results: {
        total: subscribers.length,
        sent,
        failed,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Error sending approved newsletter:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
