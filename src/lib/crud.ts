import { createServerSupabaseClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// ── CRUD route factory ───────────────────────────────────────────────
// Generates GET / POST / PUT / DELETE handlers for a Supabase table.
// Each route file becomes ~15 lines of config instead of ~140 lines.

export interface CrudConfig {
  table: string;
  entityName: string;
  orderBy?: { column: string; ascending?: boolean };
  /** Fields required on POST — returns 400 if any are missing. */
  requiredFields?: string[];
  /** Transform the raw body before INSERT (add defaults, etc.). */
  prepareInsert?: (body: Record<string, unknown>) => Record<string, unknown>;
  /** If true, DELETE reads `id` from query params instead of JSON body. */
  deleteIdFromQuery?: boolean;
}

function getSupabaseOrFail() {
  try {
    return { supabase: createServerSupabaseClient(), error: null };
  } catch {
    return { supabase: null, error: NextResponse.json({ error: 'Database not configured' }, { status: 500 }) };
  }
}

export function createCrudHandlers(config: CrudConfig) {
  const {
    table,
    entityName,
    orderBy = { column: 'display_order', ascending: true },
    requiredFields = [],
    prepareInsert,
    deleteIdFromQuery = false,
  } = config;

  async function GET() {
    const { supabase, error: dbError } = getSupabaseOrFail();
    if (dbError) return dbError;

    try {
      const { data, error } = await supabase!
        .from(table)
        .select('*')
        .order(orderBy.column, { ascending: orderBy.ascending ?? true });

      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error);
      return NextResponse.json({ error: `Failed to fetch ${entityName}` }, { status: 500 });
    }
  }

  async function POST(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { supabase, error: dbError } = getSupabaseOrFail();
    if (dbError) return dbError;

    try {
      const body = await request.json();

      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { error: `${field} is required` },
            { status: 400 },
          );
        }
      }

      const row = prepareInsert ? prepareInsert(body) : body;

      const { data, error } = await supabase!
        .from(table)
        .insert([row])
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data: data?.[0] ?? data }, { status: 201 });
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error);
      return NextResponse.json({ error: `Failed to create ${entityName}` }, { status: 500 });
    }
  }

  async function PUT(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { supabase, error: dbError } = getSupabaseOrFail();
    if (dbError) return dbError;

    try {
      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json({ error: `${entityName} ID is required` }, { status: 400 });
      }

      const { data, error } = await supabase!
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data: data?.[0] ?? data });
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error);
      return NextResponse.json({ error: `Failed to update ${entityName}` }, { status: 500 });
    }
  }

  async function DELETE(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { supabase, error: dbError } = getSupabaseOrFail();
    if (dbError) return dbError;

    try {
      let id: string | number | null = null;

      if (deleteIdFromQuery) {
        const { searchParams } = new URL(request.url);
        id = searchParams.get('id');
      } else {
        const body = await request.json();
        id = body.id;
      }

      if (!id) {
        return NextResponse.json({ error: `${entityName} ID is required` }, { status: 400 });
      }

      const { error } = await supabase!
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      return NextResponse.json({ error: `Failed to delete ${entityName}` }, { status: 500 });
    }
  }

  return { GET, POST, PUT, DELETE };
}
