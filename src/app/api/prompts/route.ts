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
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
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
    const { title, icon, description, tags, content } = await request.json();

    if (!title || !description || !content) {
      return NextResponse.json({ error: 'Title, description, and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert([{
        title,
        icon: icon || '📝',
        description,
        tags: tags || [],
        content
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
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
    const { id, title, icon, description, tags, content } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (content !== undefined) updateData.content = content;

    const { data, error } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
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
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Prompt deleted' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
