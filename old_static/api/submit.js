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

  const { name, email, business, 'scaling-challenge': scalingChallenge } = req.body;

  if (!name || !email || !business || !scalingChallenge) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          name,
          email,
          business,
          scaling_challenge: scalingChallenge,
        }
      ])
      .select();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error inserting submission:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
}
