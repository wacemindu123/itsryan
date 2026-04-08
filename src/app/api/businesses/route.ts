import { createCrudHandlers } from '@/lib/crud';

export const { GET, POST, PUT, DELETE } = createCrudHandlers({
  table: 'businesses',
  entityName: 'business',
  orderBy: { column: 'display_order', ascending: true },
  requiredFields: ['name'],
  prepareInsert: (body) => ({
    name: body.name,
    thumbnail: body.thumbnail || null,
    website_url: body.website_url || null,
    description: body.description || null,
    value_delivered: body.value_delivered || 0,
    revenue_generated: body.revenue_generated || 0,
    color: body.color || '#3B82F6',
    video_links: body.video_links || [],
    github_links: body.github_links || [],
    additional_links: body.additional_links || [],
    featured: body.featured || false,
    display_order: body.display_order || 0,
  }),
});
