/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */

// ── Mocks ────────────────────────────────────────────────────────────

const mockCreateClient = jest.fn(() => ({ from: jest.fn() }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (url: string, key: string) => mockCreateClient(url, key),
}));

// We need to reset module cache between tests to test caching behaviour
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('getSupabase (client-side)', () => {
  it('returns null when env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabase } = require('@/lib/supabase');
    expect(getSupabase()).toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('creates client when env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { getSupabase } = require('@/lib/supabase');
    const client = getSupabase();

    expect(client).not.toBeNull();
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  it('returns cached client on subsequent calls', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { getSupabase } = require('@/lib/supabase');
    const first = getSupabase();
    const second = getSupabase();

    expect(first).toBe(second);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });
});

describe('createServerSupabaseClient', () => {
  it('throws when env vars are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { createServerSupabaseClient } = require('@/lib/supabase');
    expect(() => createServerSupabaseClient()).toThrow('Supabase URL and Key are required');
  });

  it('creates server client with SUPABASE_ env vars', () => {
    process.env.SUPABASE_URL = 'https://server.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'server-key';

    const { createServerSupabaseClient } = require('@/lib/supabase');
    const client = createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://server.supabase.co',
      'server-key'
    );
  });

  it('falls back to NEXT_PUBLIC_ env vars', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-key';

    const { createServerSupabaseClient } = require('@/lib/supabase');
    const client = createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://public.supabase.co',
      'public-key'
    );
  });

  it('caches server client on subsequent calls', () => {
    process.env.SUPABASE_URL = 'https://server.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'server-key';

    const { createServerSupabaseClient } = require('@/lib/supabase');
    const first = createServerSupabaseClient();
    const second = createServerSupabaseClient();

    expect(first).toBe(second);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });
});
