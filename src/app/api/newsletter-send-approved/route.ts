import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase';
import { requireCronAuth } from '@/lib/newsletter-approval';
import { renderNewsletterEmailHtml } from '@/lib/newsletter-email-template';

function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-me';
  return crypto
    .createHmac('sha256', secret)
    .update(email.toLowerCase())
    .digest('hex');
}

function buildUnsubscribeUrl(email: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';
  const unsubscribeToken = generateUnsubscribeToken(email);
  return `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;
}

function generateEmailHtml(subject: string, content: string, unsubscribeUrl: string, previewText?: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';
  return renderNewsletterEmailHtml({
    kind: 'subscriber',
    subject,
    content,
    siteUrl,
    unsubscribeUrl,
    previewText,
  });
}

export async function POST(request: NextRequest) {
  const denied = requireCronAuth(request);
  if (denied) return denied;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const replyTo = process.env.NEWSLETTER_REPLY_TO || 'ryan@itsryan.ai';

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
    const body = await request.json();
    const draftId = body?.draftId;
    const testEmail: string | undefined = typeof body?.testEmail === 'string' ? body.testEmail.trim() : undefined;
    const isTestSend = !!testEmail;

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

    // For real (blast) sends we enforce the approval + idempotency guards.
    // Test sends bypass them so you can self-test without altering draft state.
    if (!isTestSend) {
      if (draft.sent_at) {
        return NextResponse.json({ success: true, message: 'Already sent' });
      }
      if (!draft.send_started_at) {
        return NextResponse.json({ error: 'Draft not approved' }, { status: 400 });
      }
    }

    // Build the recipient list: either a single test address or all active subscribers.
    let subscribers: { email: string }[];
    if (isTestSend) {
      subscribers = [{ email: testEmail! }];
    } else {
      const { data, error: subErr } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('subscribed', true);
      if (subErr) throw subErr;
      if (!data || data.length === 0) {
        await supabase.from('newsletter_drafts').update({ status: 'skipped' }).eq('id', draftId);
        return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
      }
      subscribers = data;
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    const ctx = draft.generation_context as { preview_text?: string } | null;
    const previewText = ctx?.preview_text || undefined;

    const listUnsubMailto = process.env.NEWSLETTER_UNSUB_MAILTO || replyTo;

    for (const s of subscribers) {
      try {
        const unsubscribeUrl = buildUnsubscribeUrl(s.email);
        const html = generateEmailHtml(draft.subject, draft.content, unsubscribeUrl, previewText);
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: s.email,
          subject: isTestSend ? `[TEST] ${draft.subject}` : draft.subject,
          html,
          replyTo,
          headers: {
            'List-Unsubscribe': `<mailto:${listUnsubMailto}?subject=unsubscribe>, <${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'List-Id': `<newsletter.${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai').hostname}>`,
          },
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

    if (!isTestSend) {
      await supabase
        .from('newsletter_drafts')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', draftId);
    }

    return NextResponse.json({
      success: true,
      testMode: isTestSend,
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
