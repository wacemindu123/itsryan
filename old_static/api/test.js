module.exports = async function handler(req, res) {
  res.status(200).json({ 
    message: 'API is working!',
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      hasCalendlyLink: !!process.env.CALENDLY_LINK
    }
  });
}
