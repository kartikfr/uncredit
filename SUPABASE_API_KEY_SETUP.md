# 🚀 OpenAI API Key Setup in Supabase

This guide will help you set up your OpenAI API key in Supabase so your project can use it across multiple features without hardcoding it anywhere.

## 📋 Prerequisites

1. **Supabase Project**: You already have a project with ID `cardgeniusx2`
2. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Supabase Dashboard Access**: You need access to your Supabase project dashboard

## 🔧 Step-by-Step Setup

### Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `cardgeniusx2`

### Step 2: Create the API Keys Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the following SQL:

```sql
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
```

4. Click **Run** to execute the SQL

### Step 3: Insert Your OpenAI API Key

1. In the same SQL Editor, create a new query
2. Copy and paste the following SQL (replace `YOUR_ACTUAL_API_KEY_HERE` with your real OpenAI API key):

```sql
-- Insert your OpenAI API key
INSERT INTO api_keys (key_name, key_value, description) 
VALUES ('openai_api_key', 'YOUR_ACTUAL_API_KEY_HERE', 'OpenAI API key for content generation')
ON CONFLICT (key_name) 
DO UPDATE SET 
  key_value = EXCLUDED.key_value,
  description = EXCLUDED.description,
  updated_at = NOW();
```

3. Replace `YOUR_ACTUAL_API_KEY_HERE` with your actual OpenAI API key (starts with `sk-`)
4. Click **Run** to execute the SQL

### Step 4: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 5: Configure Environment Variables

1. Create or update your `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here

# Optional: Fallback OpenAI API key (for development)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

2. Replace the values with your actual Supabase credentials

### Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the **Create Content** page
3. Click the **API Key Setup** button
4. Test your API key by clicking **Test Key**

## 🔒 Security Features

- ✅ **Encrypted Storage**: API keys are encrypted in Supabase
- ✅ **Row Level Security**: Only authenticated users can access keys
- ✅ **Service Role Protection**: Admin operations require service role
- ✅ **No Hardcoding**: No API keys in source code
- ✅ **GitHub Safe**: Safe to commit to GitHub without exposing keys

## 🎯 Usage in Your Project

### AI Widget
The API key will be automatically available for your AI Widget component.

### Content Generation
The Create Content page will use the API key from Supabase for:
- Content generation
- Tone analysis
- Profile scraping
- All AI-powered features

### Future Features
Any new AI features you add will automatically have access to the API key.

## 🔄 How It Works

1. **Primary Source**: Supabase database
2. **Fallback**: Environment variable `VITE_OPENAI_API_KEY`
3. **Development**: Mock content when no key is available
4. **Caching**: 5-minute cache for performance

## 🛠️ Troubleshooting

### "Supabase configuration not found"
- Check your `.env.local` file
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

### "API key not found"
- Check if the key was inserted correctly in Supabase
- Verify the key name is exactly `openai_api_key`
- Check if the key is marked as `is_active = true`

### "Failed to fetch API key"
- Check your Supabase project URL
- Verify your anon key is correct
- Check if Row Level Security is configured properly

## 📝 API Key Management

### Update API Key
```sql
UPDATE api_keys 
SET key_value = 'your_new_api_key_here', updated_at = NOW()
WHERE key_name = 'openai_api_key';
```

### Deactivate API Key
```sql
UPDATE api_keys 
SET is_active = false, updated_at = NOW()
WHERE key_name = 'openai_api_key';
```

### View API Key Status
```sql
SELECT key_name, is_active, created_at, updated_at 
FROM api_keys 
WHERE key_name = 'openai_api_key';
```

## 🚀 Production Deployment

1. Set the same environment variables in your production hosting platform
2. The API key will be automatically available in production
3. No additional configuration needed

## ✅ Verification Checklist

- [ ] API keys table created in Supabase
- [ ] OpenAI API key inserted into the table
- [ ] Environment variables configured
- [ ] API Key Setup button works
- [ ] Test Key function works
- [ ] Content generation works
- [ ] No API keys in source code
- [ ] Safe to commit to GitHub

## 🆘 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Test with environment variables first
4. Check the network tab for API call failures

---

**🎉 Congratulations!** Your OpenAI API key is now securely stored in Supabase and ready to use across your entire project! 