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
    const { email, phone, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, subscribed')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
      }
      // Resubscribe
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ subscribed: true, phone: phone || null, name: name || null })
        .eq('id', existing.id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Resubscribed successfully' });
    }

    // Insert new subscriber
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email,
        phone: phone || null,
        name: name || null,
        subscribed: true,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
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
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
