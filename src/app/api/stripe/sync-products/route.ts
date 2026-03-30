import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { createStripeProduct, getStripe } from '@/lib/stripe';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Fetch all guides that don't have a Stripe product yet and have a price > 0
    const { data: guides, error } = await supabase
      .from('howto_guides')
      .select('*')
      .is('stripe_product_id', null)
      .gt('price', 0);

    if (error) throw error;
    if (!guides || guides.length === 0) {
      return NextResponse.json({ synced: 0, message: 'All guides already synced' });
    }

    let synced = 0;
    const errors: string[] = [];

    for (const guide of guides) {
      try {
        const result = await createStripeProduct({
          title: guide.title,
          description: guide.description,
          price: guide.price,
        });

        if (result) {
          await supabase
            .from('howto_guides')
            .update({
              stripe_product_id: result.productId,
              stripe_price_id: result.priceId,
            })
            .eq('id', guide.id);

          synced++;
        }
      } catch (err) {
        console.error(`Failed to sync guide ${guide.id}:`, err);
        errors.push(`Guide "${guide.title}" (ID ${guide.id}): ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      synced,
      total: guides.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Synced ${synced}/${guides.length} guides to Stripe`,
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return NextResponse.json({ error: 'Failed to sync products' }, { status: 500 });
  }
}
