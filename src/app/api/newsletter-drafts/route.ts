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
      .from('newsletter_drafts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
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
    const { id, status, subject, content, sms_content } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }
    }
    if (subject !== undefined) updateData.subject = subject;
    if (content !== undefined) updateData.content = content;
    if (sms_content !== undefined) updateData.sms_content = sms_content;

    const { data, error } = await supabase
      .from('newsletter_drafts')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}
