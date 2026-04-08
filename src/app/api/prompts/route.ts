import { createCrudHandlers } from '@/lib/crud';

export const { GET, POST, PUT, DELETE } = createCrudHandlers({
  table: 'prompts',
  entityName: 'prompt',
  orderBy: { column: 'created_at', ascending: false },
  requiredFields: ['title', 'description', 'content'],
  prepareInsert: (body) => ({
    title: body.title,
    icon: body.icon || '📝',
    description: body.description,
    tags: body.tags || [],
    content: body.content,
  }),
});
