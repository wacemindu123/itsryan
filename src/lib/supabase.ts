import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client-side Supabase client (lazy initialization)
let supabaseClient: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      supabaseClient = createClient(url, key);
    }
  }
  return supabaseClient;
}

// Server-side client for API routes
export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase URL and Key are required');
  }
  
  return createClient(url, key);
}
