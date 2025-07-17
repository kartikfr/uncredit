#!/bin/bash

echo "🚀 Setting up OpenAI API Key Management with Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged into Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

echo "📦 Deploying database migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migration deployed successfully!"
else
    echo "❌ Database migration failed!"
    exit 1
fi

echo "🔧 Deploying edge function..."
supabase functions deploy api-keys

if [ $? -eq 0 ]; then
    echo "✅ Edge function deployed successfully!"
else
    echo "❌ Edge function deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Add these environment variables to your .env.local:"
echo "   VITE_SUPABASE_URL=your_supabase_project_url"
echo "   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""
echo "2. Start your development server:"
echo "   npm run dev"
echo ""
echo "3. Navigate to Create Content page and click 'API Key Setup'"
echo ""
echo "4. Enter your OpenAI API key and test the setup"
echo ""
echo "📚 For more details, see SETUP_GUIDE.md" 