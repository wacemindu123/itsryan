-- Create submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business TEXT NOT NULL,
  website TEXT,
  scaling_challenge TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add website column if table already exists
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS website TEXT;

-- Add an index on created_at for faster sorting
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust as needed)
CREATE POLICY "Enable all operations for authenticated users" ON submissions
  FOR ALL USING (true);
  
-- If you want to allow anonymous submissions (recommended for your form):
CREATE POLICY "Enable insert for anon users" ON submissions
  FOR INSERT WITH CHECK (true);

-- =============================================
-- AI CLASS SIGNUPS TABLE
-- =============================================

CREATE TABLE class_signups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business TEXT,
  format TEXT NOT NULL,
  experience TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add an index on created_at for faster sorting
CREATE INDEX idx_class_signups_created_at ON class_signups(created_at DESC);

-- Enable Row Level Security
ALTER TABLE class_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for class_signups
CREATE POLICY "Enable all operations for class_signups" ON class_signups
  FOR ALL USING (true);
  
CREATE POLICY "Enable insert for anon users on class_signups" ON class_signups
  FOR INSERT WITH CHECK (true);

-- =============================================
-- ADD CONTACTED COLUMN TO BOTH TABLES
-- Run this if tables already exist
-- =============================================

-- Add contacted column to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS contacted BOOLEAN DEFAULT FALSE;

-- Add contacted column to class_signups
ALTER TABLE class_signups ADD COLUMN IF NOT EXISTS contacted BOOLEAN DEFAULT FALSE;

-- =============================================
-- PROMPTS TABLE
-- =============================================

CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '📝',
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add an index on created_at for faster sorting
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for prompts - allow read for everyone, write for authenticated
CREATE POLICY "Enable read for all users on prompts" ON prompts
  FOR SELECT USING (true);

CREATE POLICY "Enable all operations for prompts" ON prompts
  FOR ALL USING (true);

-- =============================================
-- BUSINESSES TABLE (for Value Meters & Showcase)
-- =============================================

CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  thumbnail TEXT,
  website_url TEXT,
  description TEXT,
  value_delivered INTEGER DEFAULT 0,
  revenue_generated INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  video_links TEXT[] DEFAULT '{}',
  github_links TEXT[] DEFAULT '{}',
  additional_links TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add index for display order sorting
CREATE INDEX idx_businesses_display_order ON businesses(display_order ASC);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for businesses
CREATE POLICY "Enable read for all users on businesses" ON businesses
  FOR SELECT USING (true);

CREATE POLICY "Enable all operations for businesses" ON businesses
  FOR ALL USING (true);

-- =============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =============================================

CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  name TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add index for email lookups
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_subscribers
CREATE POLICY "Enable read for all users on newsletter_subscribers" ON newsletter_subscribers
  FOR SELECT USING (true);

CREATE POLICY "Enable all operations for newsletter_subscribers" ON newsletter_subscribers
  FOR ALL USING (true);

CREATE POLICY "Enable insert for anon users on newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- =============================================
-- NEWSLETTER DRAFTS TABLE (for AI-generated newsletters)
-- =============================================

CREATE TABLE newsletter_drafts (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sms_content TEXT,
  status TEXT DEFAULT 'draft', -- draft, approved, sent
  approved_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE newsletter_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for newsletter_drafts" ON newsletter_drafts
  FOR ALL USING (true);
