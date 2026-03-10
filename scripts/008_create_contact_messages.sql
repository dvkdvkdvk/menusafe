-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Only allow inserts from anyone (public form)
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only admins can read (you would implement admin logic separately)
CREATE POLICY "Service role can read all messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'service_role');
