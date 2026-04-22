import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/lib/supabase';
import { renderNewsletterPreviewEmailHtml } from '@/lib/newsletter-preview-email';
import {
  formatIssueDateET,
  randomNonce,
  sha256Hex,
  signActionToken,
  requireCronAuth,
} from '@/lib/newsletter-approval';

export async function POST(request: NextRequest) {
  const denied = requireCronAuth(request);
  if (denied) return denied;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const previewTo = process.env.NEWSLETTER_PREVIEW_TO || 'itsryan@itsryan.ai';
  const approvalSecret = process.env.NEWSLETTER_APPROVAL_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';

  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }
  if (!approvalSecret) {
    return NextResponse.json({ error: 'Approval secret not configured' }, { status: 500 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const issueDate = formatIssueDateET(new Date());

  // Idempotency: if draft already exists for today, do not create a new one.
  const { data: existingDraft, error: existingErr } = await supabase
    .from('newsletter_drafts')
    .select('*')
    .eq('issue_date', issueDate)
    .maybeSingle();

  if (existingErr) {
    return NextResponse.json({ error: 'Failed to check existing draft' }, { status: 500 });
  }

  if (existingDraft) {
    return NextResponse.json({
      success: true,
      message: 'Draft already exists for today',
      draftId: existingDraft.id,
      issueDate,
    });
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // v1: reuse existing prompt style for now; we can swap to Exa + skill pack next.
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          `You are Ryan. Write a DAILY newsletter for SMB operators and casual builders. ` +
          `Keep it practical and concrete. 500–700 words. Avoid hype. ` +
          `End with a short question that encourages replies. ` +
          `Start with a subject line in the format: "Subject: ...".`,
      },
      {
        role: 'user',
        content:
          `Write today's daily AI newsletter for ${issueDate}. ` +
          `Keep it fresh and timely. Include 2-3 practical tips and one copy/paste prompt.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  const full = completion.choices[0]?.message?.content || '';
  const subjectMatch = full.match(/Subject:\s*(.+?)(?:\n|$)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : `Daily AI Newsletter — ${issueDate}`;
  const content = full.replace(/Subject:\s*.+?\n/i, '').trim();

  const approveNonce = randomNonce();
  const changesNonce = randomNonce();

  // Insert draft first to get draft id, then compute tokens properly
  const { data: inserted, error: insertErr } = await supabase
    .from('newsletter_drafts')
    .insert([
      {
        issue_date: issueDate,
        subject,
        content,
        status: 'draft',
        approval_nonce_hash: sha256Hex(approveNonce),
        changes_nonce_hash: sha256Hex(changesNonce),
        generation_context: { model: 'gpt-4o-mini', issue_date: issueDate },
      },
    ])
    .select('*')
    .single();

  if (insertErr) {
    console.error('newsletter-daily-generate insert error:', insertErr);
    return NextResponse.json({ error: 'Failed to save draft', detail: insertErr.message, code: insertErr.code }, { status: 500 });
  }

  const draftId = inserted.id as number;

  const approveTokenFinal = signActionToken({
    draftId,
    action: 'approve',
    nonce: approveNonce,
    secret: approvalSecret,
  });
  const changesTokenFinal = signActionToken({
    draftId,
    action: 'changes',
    nonce: changesNonce,
    secret: approvalSecret,
  });

  const approveUrl = `${siteUrl}/api/newsletter-approve?draftId=${draftId}&nonce=${approveNonce}&token=${approveTokenFinal}`;
  const changesUrl = `${siteUrl}/newsletter/feedback?draftId=${draftId}&nonce=${changesNonce}&token=${changesTokenFinal}`;

  const resend = new Resend(apiKey);

  const previewHtml = renderNewsletterPreviewEmailHtml({
    draftId,
    subject,
    content,
    approveUrl,
    changesUrl,
  });

  const { error: sendErr } = await resend.emails.send({
    from: fromEmail,
    to: previewTo,
    subject: `Preview: ${subject}`,
    html: previewHtml,
    replyTo: fromEmail,
  });

  if (sendErr) {
    return NextResponse.json({ error: sendErr.message || 'Failed to send preview' }, { status: 500 });
  }

  await supabase
    .from('newsletter_drafts')
    .update({ preview_sent_at: new Date().toISOString() })
    .eq('id', draftId);

  return NextResponse.json({
    success: true,
    issueDate,
    draftId,
    previewTo,
  });
}
