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
    const { id, contacted, table } = await request.json();

    if (!id || contacted === undefined || !table) {
      return NextResponse.json({ error: 'ID, contacted status, and table are required' }, { status: 400 });
    }

    if (!['submissions', 'class_signups'].includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { error } = await supabase
      .from(table)
      .update({ contacted })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
