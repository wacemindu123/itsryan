import { createServerSupabaseClient } from '@/lib/supabase';
import { createStripeProduct, updateStripeProduct } from '@/lib/stripe';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export async function GET() {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('howto_guides')
      .select('id, title, slug, description, category, google_doc_url, preview_image_url, price, energy, related_ids, status, tiktok_url, display_order, featured, created_at, stripe_product_id, stripe_price_id')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Strip google_doc_url from paid guides in public response
    const safeData = (data || []).map((guide: Record<string, unknown>) => {
      if (guide.price && Number(guide.price) > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { google_doc_url, ...rest } = guide;
        return rest;
      }
      return guide;
    });

    return NextResponse.json(safeData);
  } catch (error) {
    console.error('Error fetching howto guides:', error);
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, description, category, google_doc_url, prompt_content, preview_image_url, price, energy, related_ids, status, tiktok_url, display_order, featured } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = generateSlug(title) + '-' + Date.now().toString(36);
    const guidePrice = price ?? 1.99;

    // Create Stripe product if price > 0
    let stripe_product_id: string | null = null;
    let stripe_price_id: string | null = null;

    try {
      const stripeResult = await createStripeProduct({
        title,
        description: description || null,
        price: guidePrice,
      });
      if (stripeResult) {
        stripe_product_id = stripeResult.productId;
        stripe_price_id = stripeResult.priceId;
      }
    } catch (stripeErr) {
      console.error('Stripe product creation failed (continuing):', stripeErr);
    }

    // Core fields that always exist
    const corePayload: Record<string, unknown> = {
      title,
      description: description || null,
      category: category || 'General',
      google_doc_url: google_doc_url || null,
      preview_image_url: preview_image_url || null,
      price: guidePrice,
      energy: energy ?? 50,
      related_ids: related_ids || [],
      status: status || 'available',
      tiktok_url: tiktok_url || null,
      display_order: display_order ?? 0,
      featured: featured ?? false,
    };

    // Try full payload with all new columns
    const fullPayload = {
      ...corePayload,
      slug,
      prompt_content: prompt_content || null,
      stripe_product_id,
      stripe_price_id,
    };

    let result = await supabase.from('howto_guides').insert([fullPayload]).select();

    if (result.error) {
      console.error('Full insert failed, retrying with core fields:', result.error.message);
      // Retry with only core fields
      result = await supabase.from('howto_guides').insert([corePayload]).select();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error creating howto guide:', error);
    const msg = error && typeof error === 'object' && 'message' in error
      ? (error as { message: string }).message
      : JSON.stringify(error);
    return NextResponse.json({ error: 'Failed to create guide: ' + msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
    }

    // Fetch existing guide to check for Stripe product changes
    const { data: existing } = await supabase
      .from('howto_guides')
      .select('stripe_product_id, stripe_price_id, price, title, description')
      .eq('id', id)
      .single();

    // Sync Stripe product if guide already has one or if price > 0
    if (existing) {
      const newPrice = updates.price ?? existing.price;
      const newTitle = updates.title ?? existing.title;
      const newDesc = updates.description !== undefined ? updates.description : existing.description;

      try {
        if (existing.stripe_product_id) {
          // Update existing Stripe product
          const result = await updateStripeProduct({
            stripeProductId: existing.stripe_product_id,
            stripePriceId: existing.stripe_price_id,
            title: newTitle,
            description: newDesc,
            price: newPrice,
          });
          if (result) {
            updates.stripe_product_id = result.productId;
            updates.stripe_price_id = result.priceId;
          } else {
            // Product archived (price set to 0)
            updates.stripe_product_id = null;
            updates.stripe_price_id = null;
          }
        } else if (newPrice > 0) {
          // No Stripe product yet — create one
          const result = await createStripeProduct({
            title: newTitle,
            description: newDesc,
            price: newPrice,
          });
          if (result) {
            updates.stripe_product_id = result.productId;
            updates.stripe_price_id = result.priceId;
          }
        }
      } catch (stripeErr) {
        console.error('Stripe product update failed (continuing):', stripeErr);
      }
    }

    const { error } = await supabase
      .from('howto_guides')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating howto guide:', error);
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('howto_guides')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting howto guide:', error);
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}
