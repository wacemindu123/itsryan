import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { projectId, email, phone } = await request.json();

    if (!projectId || !email) {
      return NextResponse.json({ error: 'Project ID and email are required' }, { status: 400 });
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('project_waitlist')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already on the waitlist for this project' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('project_waitlist')
      .insert([{
        project_id: projectId,
        email,
        phone: phone || null,
      }])
      .select();

    if (error) throw error;

    // Also add to newsletter subscribers
    await supabase
      .from('newsletter_subscribers')
      .upsert([{
        email,
        phone: phone || null,
        subscribed: true,
      }], { onConflict: 'email' });

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let query = supabase
      .from('project_waitlist')
      .select('*, projects(name)')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }
}
