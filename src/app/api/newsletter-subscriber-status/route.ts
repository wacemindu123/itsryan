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
    const { id, subscribed } = await request.json();

    if (id === undefined || subscribed === undefined) {
      return NextResponse.json({ error: 'ID and subscribed status are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ subscribed })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subscriber status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
