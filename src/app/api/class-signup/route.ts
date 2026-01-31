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
    const { 
      'class-name': name, 
      'class-email': email, 
      'class-phone': phone, 
      'class-business': business,
      format,
      experience 
    } = body;

    if (!name || !email || !phone || !format || !experience) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('class_signups')
      .insert([{
        name,
        email,
        phone,
        business: business || null,
        format,
        experience,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error inserting class signup:', error);
    return NextResponse.json({ error: 'Failed to save signup' }, { status: 500 });
  }
}
