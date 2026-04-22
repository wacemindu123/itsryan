import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/lib/supabase';
import { renderNewsletterPreviewEmailHtml } from '@/lib/newsletter-preview-email';
import { verifyActionToken, sha256Hex, randomNonce, signActionToken } from '@/lib/newsletter-approval';
import { NEWSLETTER_SYSTEM_PROMPT, buildRegenerateUserPrompt, NEWSLETTER_SKIP_MARKER } from '@/lib/newsletter-prompt';
import { fetchNewsPack, renderNewsPackForPrompt, type NewsPack } from '@/lib/news-fetcher';

export async function POST(request: NextRequest) {
  const approvalSecret = process.env.NEWSLETTER_APPROVAL_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const previewTo = process.env.NEWSLETTER_PREVIEW_TO || 'itsryan@itsryan.ai';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';

  if (!approvalSecret) {
    return NextResponse.json({ error: 'Approval secret not configured' }, { status: 500 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
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

  try {
    const { draftId, nonce, token, feedback } = await request.json();

    if (!draftId || !nonce || !token || !feedback) {
      return NextResponse.json({ error: 'draftId, nonce, token, and feedback are required' }, { status: 400 });
    }

    if (!verifyActionToken({ draftId, action: 'changes', nonce, token, secret: approvalSecret })) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { data: draft, error: draftErr } = await supabase
      .from('newsletter_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (draftErr || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (!draft.changes_nonce_hash || draft.changes_nonce_hash !== sha256Hex(nonce)) {
      return NextResponse.json({ error: 'Invalid nonce' }, { status: 400 });
    }

    if (draft.changes_used_at) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 400 });
    }

    if (draft.regeneration_count >= 3) {
      await supabase
        .from('newsletter_drafts')
        .update({ status: 'skipped', last_feedback: feedback })
        .eq('id', draftId);

      return NextResponse.json({ error: 'Regeneration limit reached (3/day). Skipped.' }, { status: 400 });
    }

    // Mark changes token used
    const { data: locked, error: lockErr } = await supabase
      .from('newsletter_drafts')
      .update({
        changes_used_at: new Date().toISOString(),
        last_feedback: feedback,
      })
      .eq('id', draftId)
      .is('changes_used_at', null)
      .select('*')
      .maybeSingle();

    if (lockErr) {
      return NextResponse.json({ error: 'Failed to lock draft for regeneration' }, { status: 500 });
    }

    if (!locked) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 400 });
    }

    // Reuse the news pack stored on the draft; refetch if missing (legacy drafts).
    const existingCtx = draft.generation_context as {
      pack?: NewsPack & { items?: Array<{ title?: string; url?: string; source?: string; publishedAt?: string }> };
    } | null;
    let pack: NewsPack;
    if (existingCtx?.pack?.items && existingCtx.pack.items.length > 0) {
      pack = {
        items: existingCtx.pack.items.map((it) => ({
          title: it.title || '',
          url: it.url || '',
          source: it.source || '',
          publishedAt: it.publishedAt || new Date().toISOString(),
          excerpt: '',
          score: 0,
        })),
        rawCount: existingCtx.pack.rawCount || existingCtx.pack.items.length,
        fetchedAt: existingCtx.pack.fetchedAt || new Date().toISOString(),
        sourcesUsed: existingCtx.pack.sourcesUsed || [],
      };
    } else {
      pack = await fetchNewsPack({ topN: 10 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: NEWSLETTER_SYSTEM_PROMPT },
        { role: 'user', content: buildRegenerateUserPrompt(draft.content, feedback, renderNewsPackForPrompt(pack)) },
      ],
      temperature: 0.7,
      max_tokens: 1400,
    });

    const full = completion.choices[0]?.message?.content || '';
    const subjectMatch = full.match(/Subject:\s*(.+?)(?:\n|$)/i);
    const rawSubject = subjectMatch ? subjectMatch[1].trim() : draft.subject;
    const content = full.replace(/Subject:\s*.+?\n/i, '').trim();
    const isSkip = rawSubject.toLowerCase().includes(NEWSLETTER_SKIP_MARKER);
    const subject = isSkip ? `${NEWSLETTER_SKIP_MARKER} no stories today` : rawSubject;

    // New single-use tokens for the revised draft
    const approveNonce = randomNonce();
    const changesNonce = randomNonce();

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

    const updatedContext = {
      ...((existingCtx as object) || {}),
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
      last_feedback: feedback,
    };

    const { error: updateErr } = await supabase
      .from('newsletter_drafts')
      .update({
        subject,
        content,
        status: isSkip ? 'skipped' : 'draft',
        approval_nonce_hash: sha256Hex(approveNonce),
        approval_used_at: null,
        send_started_at: null,
        sent_at: null,
        changes_nonce_hash: sha256Hex(changesNonce),
        changes_used_at: null,
        regeneration_count: (draft.regeneration_count || 0) + 1,
        generation_context: updatedContext,
      })
      .eq('id', draftId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to save regenerated draft' }, { status: 500 });
    }

    if (isSkip) {
      return NextResponse.json({ success: true, skipped: true, reason: 'llm-returned-skip' });
    }

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
      subject: `Preview (Revised): ${subject}`,
      html: previewHtml,
      replyTo: fromEmail,
    });

    if (sendErr) {
      return NextResponse.json({ error: sendErr.message || 'Failed to send preview' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error regenerating newsletter:', err);
    return NextResponse.json({ error: 'Failed to regenerate newsletter' }, { status: 500 });
  }
}
