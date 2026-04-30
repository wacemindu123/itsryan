import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/lib/supabase';
import { renderNewsletterPreviewEmailHtml } from '@/lib/newsletter-preview-email';
import {
  NEWSLETTER_SYSTEM_PROMPT,
  buildDailyUserPrompt,
  NEWSLETTER_FALLBACK_SUBJECT,
  NEWSLETTER_SKIP_MARKER,
} from '@/lib/newsletter-prompt';
import { fetchNewsPack, renderNewsPackForPrompt } from '@/lib/news-fetcher';
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
  const url = new URL(request.url);
  const force = url.searchParams.get('force') === '1';

  // Idempotency: if draft already exists for today, do not create a new one (unless force=1).
  const { data: existingDraft, error: existingErr } = await supabase
    .from('newsletter_drafts')
    .select('*')
    .eq('issue_date', issueDate)
    .maybeSingle();

  if (existingErr) {
    return NextResponse.json({ error: 'Failed to check existing draft' }, { status: 500 });
  }

  if (existingDraft && !force) {
    return NextResponse.json({
      success: true,
      message: 'Draft already exists for today',
      draftId: existingDraft.id,
      issueDate,
    });
  }

  if (existingDraft && force) {
    // Don't delete if already sent — avoid breaking audit/send logs.
    if (existingDraft.sent_at) {
      return NextResponse.json({
        error: 'Today\'s draft has already been sent; cannot regenerate',
        draftId: existingDraft.id,
      }, { status: 400 });
    }
    await supabase.from('newsletter_drafts').delete().eq('id', existingDraft.id);
  }

  // Pull URLs + titles from last 3 drafts for dedup against recently covered stories.
  const { data: recentDrafts } = await supabase
    .from('newsletter_drafts')
    .select('subject, generation_context')
    .order('id', { ascending: false })
    .limit(3);

  const recentUrls: string[] = [];
  const recentTitles: string[] = [];
  for (const d of recentDrafts || []) {
    if (d.subject) recentTitles.push(d.subject);
    const ctx = d.generation_context as { pack?: { items?: Array<{ url?: string; title?: string }> } } | null;
    const items = ctx?.pack?.items || [];
    for (const it of items) {
      if (it.url) recentUrls.push(it.url);
      if (it.title) recentTitles.push(it.title);
    }
  }

  // Fetch the news pack (core architectural requirement).
  const pack = await fetchNewsPack({ recentUrls, recentTitles, topN: 10 });

  const openai = new OpenAI({ apiKey: openaiKey });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: NEWSLETTER_SYSTEM_PROMPT },
      { role: 'user', content: buildDailyUserPrompt(renderNewsPackForPrompt(pack)) },
    ],
    temperature: 0.7,
    max_tokens: 2400,
  });

  const full = completion.choices[0]?.message?.content || '';
  const subjectMatch = full.match(/Subject:\s*(.+?)(?:\n|$)/i);
  const rawSubject = subjectMatch ? subjectMatch[1].trim() : NEWSLETTER_FALLBACK_SUBJECT;
  const previewMatch = full.match(/Preview:\s*(.+?)(?:\n|$)/i);
  const previewText = previewMatch ? previewMatch[1].trim() : '';
  const content = full
    .replace(/Subject:\s*.+?\n/i, '')
    .replace(/Preview:\s*.+?\n/i, '')
    .trim();

  // Skip protocol: LLM returned "Subject: (skip)" or no usable pack.
  const isSkip = rawSubject.toLowerCase().includes(NEWSLETTER_SKIP_MARKER) || pack.items.length === 0;
  const subject = isSkip ? `${NEWSLETTER_SKIP_MARKER} no stories today` : rawSubject;

  const approveNonce = randomNonce();
  const changesNonce = randomNonce();

  // Persist pack + model info for audit + future dedup.
  const generationContext = {
    model: 'gpt-4o-mini',
    issue_date: issueDate,
    preview_text: previewText,
    pack: {
      fetchedAt: pack.fetchedAt,
      rawCount: pack.rawCount,
      sourcesUsed: pack.sourcesUsed,
      items: pack.items.map((it) => ({
        title: it.title,
        url: it.url,
        source: it.source,
        publishedAt: it.publishedAt,
      })),
    },
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('newsletter_drafts')
    .insert([
      {
        issue_date: issueDate,
        subject,
        content,
        status: isSkip ? 'skipped' : 'draft',
        approval_nonce_hash: sha256Hex(approveNonce),
        changes_nonce_hash: sha256Hex(changesNonce),
        generation_context: generationContext,
      },
    ])
    .select('*')
    .single();

  if (insertErr) {
    console.error('newsletter-daily-generate insert error:', insertErr);
    return NextResponse.json({ error: 'Failed to save draft', detail: insertErr.message, code: insertErr.code }, { status: 500 });
  }

  const draftId = inserted.id as number;

  // Skip protocol: no preview email sent; admin can see the skipped draft in dashboard.
  if (isSkip) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: pack.items.length === 0 ? 'no-stories-in-pack' : 'llm-returned-skip',
      issueDate,
      draftId,
      sourcesUsed: pack.sourcesUsed,
    });
  }

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
    previewText,
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
