import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_LINK = process.env.CALENDLY_LINK || 'https://calendly.com/ryansmallbussinessdoctor/15min';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return NextResponse.json({ error: 'Email service not configured - missing API key' }, { status: 500 });
  }
  
  const resend = new Resend(apiKey);
  
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    console.log(`Sending Calendly email to ${email} (${name})`);

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

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ success: true, message: 'Email sent successfully', data });
  } catch (error) {
    console.error('Error sending email:', error);
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
