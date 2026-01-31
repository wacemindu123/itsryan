import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const { data, error } = await supabase
      .from('class_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching class signups:', error);
    return NextResponse.json({ error: 'Failed to fetch class signups' }, { status: 500 });
  }
}
