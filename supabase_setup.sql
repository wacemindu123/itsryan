-- Create submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business TEXT NOT NULL,
  scaling_challenge TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

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
