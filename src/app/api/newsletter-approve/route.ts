import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyActionToken, sha256Hex } from '@/lib/newsletter-approval';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const draftId = Number(url.searchParams.get('draftId'));
  const nonce = url.searchParams.get('nonce') || '';
  const token = url.searchParams.get('token') || '';

  const secret = process.env.NEWSLETTER_APPROVAL_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Approval secret not configured' }, { status: 500 });
  }

  if (!draftId || !nonce || !token) {
    return NextResponse.json({ error: 'Missing draftId, nonce, or token' }, { status: 400 });
  }

  if (!verifyActionToken({ draftId, action: 'approve', nonce, token, secret })) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  // Fetch draft
  const { data: draft, error: draftErr } = await supabase
    .from('newsletter_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (draftErr || !draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  if (!draft.approval_nonce_hash || draft.approval_nonce_hash !== sha256Hex(nonce)) {
    return NextResponse.json({ error: 'Invalid nonce' }, { status: 400 });
  }

  if (draft.approval_used_at) {
    // Already used. If already sent or sending, treat as success.
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai'}/admin/newsletter?approved=1&draftId=${draftId}`);
  }

  if (draft.sent_at || draft.send_started_at) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai'}/admin/newsletter?approved=1&draftId=${draftId}`);
  }

  // Mark approval token as used + mark send started (idempotency gate)
  const { data: updated, error: updateErr } = await supabase
    .from('newsletter_drafts')
    .update({
      approval_used_at: new Date().toISOString(),
      status: 'approved',
      approved_at: new Date().toISOString(),
      send_started_at: new Date().toISOString(),
    })
    .eq('id', draftId)
    .is('approval_used_at', null)
    .is('send_started_at', null)
    .select('*')
    .maybeSingle();

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to approve draft' }, { status: 500 });
  }

  // If another request won the race, redirect to admin.
  if (!updated) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai'}/admin/newsletter?approved=1&draftId=${draftId}`);
  }

  // Trigger send (server-to-server) with cron secret to bypass admin auth.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';
  const cronSecret = process.env.NEWSLETTER_CRON_SECRET;

  try {
    await fetch(`${siteUrl}/api/newsletter-send-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cronSecret ? { authorization: `Bearer ${cronSecret}` } : {}),
      },
      body: JSON.stringify({ draftId }),
    });
  } catch {
    // If send trigger fails, operator can retry from admin (we keep send_started_at to avoid dup sends).
  }

  return NextResponse.redirect(`${siteUrl}/admin/newsletter?approved=1&draftId=${draftId}`);
}
