/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */

// ── Mocks ────────────────────────────────────────────────────────────

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({ from: mockFrom }),
}));

jest.mock('@/lib/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(null),
}));

// ── Helpers ──────────────────────────────────────────────────────────

function makeSubmission(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@gmail.com',
    business: 'Test Biz',
    scaling_challenge: 'Need help with marketing and leads',
    phone: '555-0100',
    website: 'https://test.com',
    created_at: new Date().toISOString(),
    contacted: false,
    contacted_at: null,
    ...overrides,
  };
}

function setupMockFrom() {
  // submissions query — chained .select().order()
  const submissionsChain = {
    select: jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: [makeSubmission()], error: null }),
    }),
  };

  // overlap queries — just .select()
  const overlapChain = {
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
  };

  mockFrom.mockImplementation((table: string) => {
    if (table === 'submissions') return submissionsChain;
    return overlapChain;
  });
}

// ── Tests ────────────────────────────────────────────────────────────

import { GET } from '@/app/api/submissions-stats/route';

describe('GET /api/submissions-stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockFrom();
  });

  it('returns 200 with stats payload', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('kpis');
    expect(json).toHaveProperty('weekly');
    expect(json).toHaveProperty('themes');
    expect(json).toHaveProperty('dataQuality');
    expect(json).toHaveProperty('staleness');
    expect(json).toHaveProperty('emailDomains');
    expect(json).toHaveProperty('warmOverlap');
    expect(json).toHaveProperty('submissions');
  });

  it('computes KPIs correctly for a single uncontacted submission', async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.kpis.total).toBe(1);
    expect(json.kpis.uncontacted).toBe(1);
    expect(json.kpis.contacted).toBe(0);
  });

  it('detects marketing/leads theme', async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.themes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ theme: 'marketing/leads', count: 1 }),
      ])
    );
  });

  it('detects gmail.com email domain', async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.emailDomains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domain: 'gmail.com', count: 1 }),
      ])
    );
  });

  it('returns 401 when admin auth is denied', async () => {
    const { requireAdmin } = jest.requireMock('@/lib/auth');
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('flags data quality issues', async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.dataQuality).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Missing phone' }),
      ])
    );
  });
});
