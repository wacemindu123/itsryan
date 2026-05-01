import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase';
import { requireCronAuth } from '@/lib/newsletter-approval';
import { requireAdmin } from '@/lib/auth';
import { renderNewsletterEmailHtml } from '@/lib/newsletter-email-template';

// Bulk sends can exceed the default 10s serverless timeout.
// 300s is the Vercel Pro ceiling; Hobby caps at 60s but still helps.
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Chunk size for parallel sends. 20 is conservative for Resend's default rate limits.
const SEND_CHUNK_SIZE = 20;

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
  const cronDenied = requireCronAuth(request);
  if (cronDenied) {
    const adminDenied = await requireAdmin();
    if (adminDenied) return cronDenied;
  }

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
    const listId = `<newsletter.${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai').hostname}>`;

    // Send one subscriber. Returns a log-row shape the caller can batch-insert.
    async function sendOne(email: string): Promise<{
      to_email: string;
      status: 'sent' | 'failed';
      resend_message_id: string | null;
      error: string | null;
    }> {
      try {
        const unsubscribeUrl = buildUnsubscribeUrl(email);
        const html = generateEmailHtml(draft.subject, draft.content, unsubscribeUrl, previewText);
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: isTestSend ? `[TEST] ${draft.subject}` : draft.subject,
          html,
          replyTo,
          headers: {
            'List-Unsubscribe': `<mailto:${listUnsubMailto}?subject=unsubscribe>, <${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'List-Id': listId,
          },
        });
        if (error) {
          return { to_email: email, status: 'failed', resend_message_id: null, error: error.message };
        }
        return { to_email: email, status: 'sent', resend_message_id: data?.id || null, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { to_email: email, status: 'failed', resend_message_id: null, error: msg };
      }
    }

    // Chunked parallel sends. Keeps wall-time in check without hammering Resend.
    for (let i = 0; i < subscribers.length; i += SEND_CHUNK_SIZE) {
      const chunk = subscribers.slice(i, i + SEND_CHUNK_SIZE);
      const results = await Promise.all(chunk.map((s) => sendOne(s.email)));

      const rows = results.map((r) => ({
        draft_id: draftId,
        to_email: r.to_email,
        status: r.status,
        resend_message_id: r.resend_message_id,
        error: r.error,
      }));

      // Bulk-insert this chunk's logs in one round-trip.
      await supabase.from('newsletter_send_logs').insert(rows);

      for (const r of results) {
        if (r.status === 'sent') {
          sent++;
        } else {
          failed++;
          if (errors.length < 20) errors.push(`${r.to_email}: ${r.error ?? 'unknown'}`);
        }
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
