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

function generateEmailHtml(subject: string, content: string, email: string, previewText?: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;

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

    const ctx = draft.generation_context as { preview_text?: string } | null;
    const previewText = ctx?.preview_text || undefined;

    for (const s of subscribers) {
      try {
        const html = generateEmailHtml(draft.subject, draft.content, s.email, previewText);
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
