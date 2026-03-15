import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

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
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching howto guides:', error);
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, description, category, google_doc_url, preview_image_url, price, energy, related_ids, status, tiktok_url, display_order, featured } = body;

    if (!title || !google_doc_url) {
      return NextResponse.json({ error: 'Title and Google Doc URL are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('howto_guides')
      .insert([{
        title,
        description: description || null,
        category: category || 'General',
        google_doc_url,
        preview_image_url: preview_image_url || null,
        price: price ?? 1.99,
        energy: energy ?? 50,
        related_ids: related_ids || [],
        status: status || 'available',
        tiktok_url: tiktok_url || null,
        display_order: display_order ?? 0,
        featured: featured ?? false,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating howto guide:', error);
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
