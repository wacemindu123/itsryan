const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const CALENDLY_LINK = process.env.CALENDLY_LINK || 'https://calendly.com/ryansmallbussinessdoctor/15min';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

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

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Schedule Your Free Tech Consultation',
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for your interest in scaling your business with AI and technology!</p>
        <p>I'd love to discuss how I can help you overcome the challenges you're facing.</p>
        <p>Please schedule a free consultation using the link below:</p>
        <p><a href="${CALENDLY_LINK}" style="display: inline-block; padding: 12px 24px; background-color: #0071e3; color: white; text-decoration: none; border-radius: 5px;">Schedule a Meeting</a></p>
        <p>Looking forward to speaking with you!</p>
        <p>Best regards,<br>Ryan</p>
      `
    });

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Email sent successfully', data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
