const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    'class-name': name, 
    'class-email': email, 
    'class-phone': phone,
    'class-business': business,
    format,
    experience
  } = req.body;

  if (!name || !email || !phone || !format || !experience) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const { data, error } = await supabase
      .from('class_signups')
      .insert([
        {
          name,
          email,
          phone,
          business: business || null,
          format,
          experience,
        }
      ])
      .select();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error inserting class signup:', error);
    res.status(500).json({ error: 'Failed to save signup' });
  }
}
