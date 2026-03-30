import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

 export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeSecretKey);

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: import('stripe').Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session;
        const sessionId = session.id as string;
        const paymentStatus = session.payment_status as string | undefined;
        const email = session.customer_details?.email || session.customer_email || undefined;
        const guideId = session.metadata?.guide_id;

        if (paymentStatus === 'paid') {
          await supabase
            .from('howto_purchases')
            .update({ status: 'completed' })
            .eq('stripe_session_id', sessionId);
        }

        // best-effort: ensure a row exists (in case insert failed)
        if (email && guideId) {
          await supabase
            .from('howto_purchases')
            .upsert(
              [
                {
                  guide_id: Number(guideId),
                  email,
                  stripe_session_id: sessionId,
                  amount: session.amount_total ? session.amount_total / 100 : null,
                  status: paymentStatus === 'paid' ? 'completed' : 'pending',
                },
              ],
              { onConflict: 'stripe_session_id' }
            );
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session;
        const sessionId = session.id as string;

        await supabase
          .from('howto_purchases')
          .update({ status: 'expired' })
          .eq('stripe_session_id', sessionId)
          .eq('status', 'pending');

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
