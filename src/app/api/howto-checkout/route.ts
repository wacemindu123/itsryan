import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { guideId, email } = await request.json();

    if (!guideId || !email) {
      return NextResponse.json({ error: 'Guide ID and email are required' }, { status: 400 });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('howto_purchases')
      .select('id')
      .eq('guide_id', guideId)
      .eq('email', email)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      // Already purchased — fetch the guide URL
      const { data: guide } = await supabase
        .from('howto_guides')
        .select('google_doc_url')
        .eq('id', guideId)
        .single();

      return NextResponse.json({ 
        alreadyPurchased: true, 
        url: guide?.google_doc_url 
      });
    }

    // Fetch guide details
    const { data: guide, error: guideError } = await supabase
      .from('howto_guides')
      .select('*')
      .eq('id', guideId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (!stripeKey) {
      // Stripe not configured — placeholder: record purchase directly
      const { error: insertError } = await supabase
        .from('howto_purchases')
        .insert([{
          guide_id: guideId,
          email,
          stripe_session_id: 'placeholder_' + Date.now(),
          amount: guide.price,
          status: 'completed',
        }]);

      if (insertError) throw insertError;

      return NextResponse.json({ 
        success: true, 
        url: guide.google_doc_url,
        placeholder: true,
        message: 'Stripe not configured — purchase recorded for free (placeholder mode)',
      });
    }

    // Stripe is configured — create checkout session
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: guide.title,
            description: guide.description || 'How-To Guide by ItsRyan.ai',
          },
          unit_amount: Math.round((guide.price || 1.99) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${siteUrl}/howto/success?session_id={CHECKOUT_SESSION_ID}&guide_id=${guideId}`,
      cancel_url: `${siteUrl}/howto`,
      metadata: {
        guide_id: String(guideId),
        email,
      },
    });

    // Record pending purchase
    await supabase
      .from('howto_purchases')
      .insert([{
        guide_id: guideId,
        email,
        stripe_session_id: session.id,
        amount: guide.price,
        status: 'pending',
      }]);

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
