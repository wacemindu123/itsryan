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
      .from('businesses')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
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
    const { 
      name, 
      thumbnail, 
      website_url, 
      description,
      value_delivered,
      revenue_generated,
      color,
      video_links,
      github_links,
      additional_links,
      featured,
      display_order
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        name,
        thumbnail: thumbnail || null,
        website_url: website_url || null,
        description: description || null,
        value_delivered: value_delivered || 0,
        revenue_generated: revenue_generated || 0,
        color: color || '#3B82F6',
        video_links: video_links || [],
        github_links: github_links || [],
        additional_links: additional_links || [],
        featured: featured || false,
        display_order: display_order || 0,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 });
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
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('businesses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
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
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 });
  }
}
