-- Create a table for API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  description TEXT
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_name ON api_keys(key_name);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read API keys" ON api_keys;
DROP POLICY IF EXISTS "Service role can manage API keys" ON api_keys;

-- Create policy to allow only authenticated users to read API keys
CREATE POLICY "Users can read API keys" ON api_keys
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow only service role to insert/update/delete
CREATE POLICY "Service role can manage API keys" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at 
  BEFORE UPDATE ON api_keys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a default OpenAI API key entry (you'll update this with your actual key)
INSERT INTO api_keys (key_name, key_value, description) 
VALUES ('openai_api_key', 'YOUR_OPENAI_API_KEY_HERE', 'OpenAI API key for content generation')
ON CONFLICT (key_name) DO NOTHING; 