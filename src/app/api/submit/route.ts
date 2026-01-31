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
    const body = await request.json();
    const { name, email, business, 'scaling-challenge': scalingChallenge } = body;

    if (!name || !email || !business || !scalingChallenge) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        name,
        email,
        business,
        scaling_challenge: scalingChallenge,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error inserting submission:', error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}
