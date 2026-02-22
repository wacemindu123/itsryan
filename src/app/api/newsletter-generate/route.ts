import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST() {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  try {
    // Generate newsletter content using GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Ryan, a tech consultant who helps small businesses use AI and technology. Write a bi-weekly newsletter that feels personal and conversational - like you're talking to a friend over coffee. 

Key guidelines:
- Write in first person as Ryan
- Be warm, approachable, and practical
- Share 2-3 actionable AI tips that small business owners can implement immediately
- Include real-world examples and use cases
- Avoid corporate jargon and buzzwords
- Don't sound like AI - be natural and human
- Keep it concise but valuable (300-500 words for email)
- End with a personal note or question to encourage replies

Topics to cover (pick 2-3):
- ChatGPT tips for customer service, marketing, or operations
- Free AI tools that save time
- Automation ideas for small businesses
- How to use AI without technical skills
- Common AI mistakes to avoid
- Success stories from small businesses using AI`
        },
        {
          role: 'user',
          content: 'Write the next bi-weekly newsletter. Make it feel fresh and timely. Include a catchy subject line at the start (format: "Subject: [your subject line]").'
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const fullContent = completion.choices[0]?.message?.content || '';
    
    // Extract subject line
    const subjectMatch = fullContent.match(/Subject:\s*(.+?)(?:\n|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'AI Tips for Your Business';
    const content = fullContent.replace(/Subject:\s*.+?\n/i, '').trim();

    // Generate SMS version (short, punchy)
    const smsCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are Ryan. Write a very short SMS (under 160 characters) that teases the newsletter content and encourages people to check their email. Be casual and friendly. Do not include links.'
        },
        {
          role: 'user',
          content: `The newsletter is about: ${subject}. Write the SMS teaser.`
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const smsContent = smsCompletion.choices[0]?.message?.content?.trim() || null;

    // Save draft to database
    const { data, error } = await supabase
      .from('newsletter_drafts')
      .insert([{
        subject,
        content,
        sms_content: smsContent,
        status: 'draft',
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error generating newsletter:', error);
    return NextResponse.json({ error: 'Failed to generate newsletter' }, { status: 500 });
  }
}
