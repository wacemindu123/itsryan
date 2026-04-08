/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Tests that API route files correctly configure the CRUD factory.
 * We mock createCrudHandlers and verify the config passed in.
 */

const mockHandlers = {
  GET: jest.fn(),
  POST: jest.fn(),
  PUT: jest.fn(),
  DELETE: jest.fn(),
};

jest.mock('@/lib/crud', () => ({
  createCrudHandlers: jest.fn(() => mockHandlers),
}));

import { createCrudHandlers } from '@/lib/crud';

describe('API route configurations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('businesses route uses correct config', () => {
    jest.isolateModules(() => {
      require('@/app/api/businesses/route');
    });

    expect(createCrudHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'businesses',
        entityName: 'business',
        requiredFields: ['name'],
      })
    );
  });

  it('projects route uses correct config with deleteIdFromQuery', () => {
    jest.isolateModules(() => {
      require('@/app/api/projects/route');
    });

    expect(createCrudHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'projects',
        entityName: 'project',
        deleteIdFromQuery: true,
        requiredFields: ['name'],
      })
    );
  });

  it('prompts route uses correct config', () => {
    jest.isolateModules(() => {
      require('@/app/api/prompts/route');
    });

    expect(createCrudHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'prompts',
        entityName: 'prompt',
        requiredFields: ['title', 'description', 'content'],
      })
    );
  });

  it('businesses prepareInsert applies defaults', () => {
    jest.isolateModules(() => {
      require('@/app/api/businesses/route');
    });

    const calls = (createCrudHandlers as jest.Mock).mock.calls;
    const bizConfig = calls.find(
      (c: { table: string }[]) => c[0].table === 'businesses'
    );
    expect(bizConfig).toBeDefined();

    const prepareInsert = bizConfig![0].prepareInsert;
    const result = prepareInsert({ name: 'Test Biz' });

    expect(result).toEqual(
      expect.objectContaining({
        name: 'Test Biz',
        color: '#3B82F6',
        featured: false,
        display_order: 0,
        video_links: [],
        github_links: [],
        additional_links: [],
      })
    );
  });

  it('prompts prepareInsert applies default icon', () => {
    jest.isolateModules(() => {
      require('@/app/api/prompts/route');
    });

    const calls = (createCrudHandlers as jest.Mock).mock.calls;
    const promptConfig = calls.find(
      (c: { table: string }[]) => c[0].table === 'prompts'
    );
    expect(promptConfig).toBeDefined();

    const prepareInsert = promptConfig![0].prepareInsert;
    const result = prepareInsert({
      title: 'Test',
      description: 'A prompt',
      content: 'Do something',
    });

    expect(result).toEqual(
      expect.objectContaining({
        title: 'Test',
        icon: '📝',
        tags: [],
      })
    );
  });
});
