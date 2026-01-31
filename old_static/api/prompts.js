const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - Fetch all prompts
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      res.status(500).json({ error: 'Failed to fetch prompts' });
    }
    return;
  }

  // POST - Create new prompt
  if (req.method === 'POST') {
    const { title, icon, description, tags, content } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ error: 'Title, description, and content are required' });
    }

    try {
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
      res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
      console.error('Error creating prompt:', error);
      res.status(500).json({ error: 'Failed to create prompt' });
    }
    return;
  }

  // PUT - Update prompt
  if (req.method === 'PUT') {
    const { id, title, icon, description, tags, content } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Prompt ID is required' });
    }

    try {
      const updateData = { updated_at: new Date().toISOString() };
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
      res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      console.error('Error updating prompt:', error);
      res.status(500).json({ error: 'Failed to update prompt' });
    }
    return;
  }

  // DELETE - Delete prompt
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Prompt ID is required' });
    }

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.status(200).json({ success: true, message: 'Prompt deleted' });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      res.status(500).json({ error: 'Failed to delete prompt' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
