import { createCrudHandlers } from '@/lib/crud';

export const { GET, POST, PUT, DELETE } = createCrudHandlers({
  table: 'projects',
  entityName: 'project',
  orderBy: { column: 'display_order', ascending: true },
  requiredFields: ['name'],
  deleteIdFromQuery: true,
  prepareInsert: (body) => ({
    name: body.name,
    description: body.description || null,
    thumbnail: body.thumbnail || null,
    status: body.status || 'in_progress',
    demo_url: body.demo_url || null,
    video_url: body.video_url || null,
    tags: body.tags || [],
    featured: body.featured || false,
    display_order: body.display_order || 0,
  }),
});
