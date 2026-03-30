import { createServerSupabaseClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #d2d2d7;">
              <span style="font-size: 17px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.02em;">ItsRyan.ai</span>
            </td>
          </tr>
          
          <!-- Subject -->
          <tr>
            <td style="padding: 32px 0 16px 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.02em; line-height: 1.2;">${subject}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                ${sanitizeHtml(content).replace(/\n/g, '<br>')}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
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
  const denied = await requireAdmin();
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
    const { subject, content, draftId } = await request.json();

    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
    }

    // Fetch active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('subscribed', true);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails one by one (Resend batch API requires paid plan)
    for (const subscriber of subscribers) {
      try {
        const html = generateEmailHtml(subject, content, subscriber.email);
        
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: subscriber.email,
          subject: subject,
          html: html,
          replyTo: fromEmail,
        });

        if (error) {
          results.failed++;
          results.errors.push(`${subscriber.email}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push(`${subscriber.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Update draft status if draftId provided
    if (draftId) {
      await supabase
        .from('newsletter_drafts')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', draftId);
    }

    return NextResponse.json({
      success: true,
      results: {
        total: subscribers.length,
        sent: results.success,
        failed: results.failed,
        errors: results.errors.slice(0, 10), // Limit error list
      },
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
