@echo off
echo 🔧 Setting up environment variables for CardGenius...

echo.
echo Creating .env.local file with correct configuration...
echo.

(
echo # Supabase Configuration
echo VITE_SUPABASE_URL=https://yurfpubenqaotwnemuwg.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ
echo.
echo # Note: Your OpenAI API key is now stored securely in Supabase
echo # No need to add VITE_OPENAI_API_KEY here - it's fetched from Supabase automatically
) > .env.local

echo ✅ .env.local file created successfully!
echo.
echo 📋 Environment variables configured:
echo    - VITE_SUPABASE_URL: Set
echo    - VITE_SUPABASE_ANON_KEY: Set
echo    - VITE_OPENAI_API_KEY: Will be fetched from Supabase
echo.
echo 🚀 You can now start the development server:
echo    npm run dev
echo.
echo 💡 The content generation should now work properly with:
echo    - OpenAI API calls visible in Network tab
echo    - Real content generation (not mock data)
echo    - Proper preview display
echo.
pause 