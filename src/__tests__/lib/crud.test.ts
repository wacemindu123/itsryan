/**
 * @jest-environment node
 */
import { createCrudHandlers } from '@/lib/crud';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockOrder = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({ from: mockFrom }),
}));

jest.mock('@/lib/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(null),
}));

// ── Helpers ──────────────────────────────────────────────────────────

function makeRequest(method: string, body?: Record<string, unknown>, url?: string) {
  const reqUrl = url || 'http://localhost:3000/api/test';
  return new NextRequest(reqUrl, {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  });
}

// ── Tests ────────────────────────────────────────────────────────────

describe('createCrudHandlers', () => {
  const handlers = createCrudHandlers({
    table: 'widgets',
    entityName: 'widget',
    orderBy: { column: 'created_at', ascending: false },
    requiredFields: ['name'],
    prepareInsert: (body) => ({ name: body.name, color: body.color || 'blue' }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns data from supabase ordered correctly', async () => {
      const mockData = [{ id: 1, name: 'Widget A' }, { id: 2, name: 'Widget B' }];
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: mockData, error: null });

      const res = await handlers.GET();
      const json = await res.json();

      expect(mockFrom).toHaveBeenCalledWith('widgets');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(json).toEqual(mockData);
      expect(res.status).toBe(200);
    });

    it('returns 500 when supabase throws', async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: null, error: new Error('DB down') });

      const res = await handlers.GET();
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toMatch(/Failed to fetch widget/);
    });

    it('returns empty array when no data', async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: null, error: null });

      const res = await handlers.GET();
      const json = await res.json();

      expect(json).toEqual([]);
    });
  });

  describe('POST', () => {
    it('inserts a row and returns 201', async () => {
      const insertedRow = { id: 1, name: 'New Widget', color: 'blue' };
      mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [insertedRow], error: null }) });

      const req = makeRequest('POST', { name: 'New Widget' });
      const res = await handlers.POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data).toEqual(insertedRow);
      expect(mockFrom).toHaveBeenCalledWith('widgets');
    });

    it('uses prepareInsert to transform the body', async () => {
      mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{}], error: null }) });

      const req = makeRequest('POST', { name: 'Test', color: 'red' });
      await handlers.POST(req);

      expect(mockInsert).toHaveBeenCalledWith([{ name: 'Test', color: 'red' }]);
    });

    it('applies default from prepareInsert when field is missing', async () => {
      mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{}], error: null }) });

      const req = makeRequest('POST', { name: 'Test' });
      await handlers.POST(req);

      expect(mockInsert).toHaveBeenCalledWith([{ name: 'Test', color: 'blue' }]);
    });

    it('returns 400 when required field is missing', async () => {
      const req = makeRequest('POST', { color: 'red' });
      const res = await handlers.POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/name is required/);
    });

    it('returns 500 when supabase insert fails', async () => {
      mockInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }) });

      const req = makeRequest('POST', { name: 'Test' });
      const res = await handlers.POST(req);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT', () => {
    it('updates a row by id', async () => {
      const updatedRow = { id: 1, name: 'Updated' };
      mockUpdate.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [updatedRow], error: null }) }) });

      const req = makeRequest('PUT', { id: 1, name: 'Updated' });
      const res = await handlers.PUT(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('returns 400 when id is missing', async () => {
      const req = makeRequest('PUT', { name: 'No ID' });
      const res = await handlers.PUT(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/widget ID is required/);
    });
  });

  describe('DELETE', () => {
    it('deletes a row by id from body', async () => {
      mockDelete.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

      const req = makeRequest('DELETE', { id: 1 });
      const res = await handlers.DELETE(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('returns 400 when id is missing', async () => {
      const req = makeRequest('DELETE', {});
      const res = await handlers.DELETE(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/widget ID is required/);
    });
  });

  describe('DELETE with deleteIdFromQuery', () => {
    const queryHandlers = createCrudHandlers({
      table: 'widgets',
      entityName: 'widget',
      deleteIdFromQuery: true,
    });

    it('reads id from query params', async () => {
      mockDelete.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

      const req = makeRequest('DELETE', undefined, 'http://localhost:3000/api/test?id=42');
      const res = await queryHandlers.DELETE(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('returns 400 when query id is missing', async () => {
      const req = makeRequest('DELETE', undefined, 'http://localhost:3000/api/test');
      const res = await queryHandlers.DELETE(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/widget ID is required/);
    });
  });
});

describe('createCrudHandlers - auth denied', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { requireAdmin } = jest.requireMock('@/lib/auth');
    requireAdmin.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );
  });

  afterEach(() => {
    const { requireAdmin } = jest.requireMock('@/lib/auth');
    requireAdmin.mockResolvedValue(null);
  });

  it('POST returns 401 when not authenticated', async () => {
    const handlers = createCrudHandlers({ table: 'widgets', entityName: 'widget' });
    const req = makeRequest('POST', { name: 'test' });
    const res = await handlers.POST(req);
    expect(res.status).toBe(401);
  });

  it('PUT returns 401 when not authenticated', async () => {
    const handlers = createCrudHandlers({ table: 'widgets', entityName: 'widget' });
    const req = makeRequest('PUT', { id: 1, name: 'test' });
    const res = await handlers.PUT(req);
    expect(res.status).toBe(401);
  });

  it('DELETE returns 401 when not authenticated', async () => {
    const handlers = createCrudHandlers({ table: 'widgets', entityName: 'widget' });
    const req = makeRequest('DELETE', { id: 1 });
    const res = await handlers.DELETE(req);
    expect(res.status).toBe(401);
  });
});
