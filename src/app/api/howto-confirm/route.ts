import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const guideId = searchParams.get('guide_id');

  if (!sessionId || !guideId) {
    return NextResponse.json({ error: 'Missing session_id or guide_id' }, { status: 400 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 });
    }

    const guideIdFromMetadata = session.metadata?.guide_id;
    if (guideIdFromMetadata && String(guideIdFromMetadata) !== String(guideId)) {
      return NextResponse.json({ error: 'Guide mismatch' }, { status: 400 });
    }

    const email = session.customer_details?.email || session.customer_email;

    // Ensure DB is updated (webhook may be delayed)
    await supabase
      .from('howto_purchases')
      .update({ status: 'completed' })
      .eq('stripe_session_id', sessionId);

    // Validate the purchase exists and is completed
    const { data: purchase } = await supabase
      .from('howto_purchases')
      .select('id, status')
      .eq('stripe_session_id', sessionId)
      .single();

    if (!purchase || purchase.status !== 'completed') {
      // best-effort: create a row if missing
      if (email) {
        await supabase
          .from('howto_purchases')
          .upsert(
            [
              {
                guide_id: Number(guideId),
                email,
                stripe_session_id: sessionId,
                amount: session.amount_total ? session.amount_total / 100 : null,
                status: 'completed',
              },
            ],
            { onConflict: 'stripe_session_id' }
          );
      }
    }

    const { data: guide } = await supabase
      .from('howto_guides')
      .select('google_doc_url')
      .eq('id', Number(guideId))
      .single();

    if (!guide?.google_doc_url) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, url: guide.google_doc_url });
  } catch (error) {
    console.error('Howto confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm purchase' }, { status: 500 });
  }
}
