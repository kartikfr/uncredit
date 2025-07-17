# OpenAI API Key Setup Guide

This guide will help you set up OpenAI API key management using Supabase without breaking your existing code.

## Step 1: Set Up Supabase Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Fallback OpenAI API key (for development)
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Step 2: Deploy the Database Migration

Run this command to create the API keys table:

```bash
supabase db push
```

## Step 3: Deploy the Edge Function

Deploy the API key management function:

```bash
supabase functions deploy api-keys
```

## Step 4: Set Up Supabase Environment Variables (Production)

In your Supabase dashboard, go to Settings > API and add:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the Create Content page
3. Click on "API Key Setup" to configure your OpenAI API key
4. Test content generation

## How It Works

### Fallback System
- **Primary**: API key stored in Supabase database
- **Fallback**: Environment variable `VITE_OPENAI_API_KEY`
- **Development**: Mock content when no key is available

### Security Features
- API keys are encrypted in Supabase
- Row Level Security (RLS) enabled
- 5-minute caching for performance
- Service role required for admin operations

### Non-Breaking Integration
- Existing code continues to work
- Environment variables still supported
- Mock content for development
- Graceful error handling

## Usage

### In Your Components

```typescript
import { apiKeyService } from '../services/apiKeys'

// Get API key (automatically handles fallbacks)
const apiKey = await apiKeyService.getOpenAIKey()

// Save new API key
await apiKeyService.setOpenAIKey('sk-your-key-here')

// Test if key exists
const hasKey = await apiKeyService.getOpenAIKey()
```

### API Key Manager Component

```typescript
import { ApiKeyManager } from '../components/ApiKeyManager'

// Use in your component
<ApiKeyManager 
  onClose={() => setShowSetup(false)}
  showSuccessMessage={(msg) => toast.success(msg)}
/>
```

## Troubleshooting

### "Supabase not configured" warning
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your `.env.local`
- The system will fall back to environment variables

### "API key not found" error
- Use the API Key Manager to set up your key
- Or add `VITE_OPENAI_API_KEY` to your environment variables

### Edge function deployment fails
- Make sure you're logged into Supabase CLI
- Check your Supabase project is properly configured
- Verify the function directory structure is correct

## Production Deployment

1. Set environment variables in your hosting platform
2. Deploy the edge function to production
3. Run database migrations on production
4. Test the API key management flow

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for local development
3. **Rotate API keys** regularly
4. **Monitor usage** in OpenAI dashboard
5. **Set up alerts** for unusual usage patterns

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Test with environment variables first
4. Check the network tab for API call failures 