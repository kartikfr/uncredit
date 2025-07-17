@echo off
echo 🚀 Setting up OpenAI API Key Management with Supabase...

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI is not installed. Please install it first:
    echo npm install -g supabase
    pause
    exit /b 1
)

REM Check if user is logged in
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged into Supabase. Please run:
    echo supabase login
    pause
    exit /b 1
)

echo 📦 Deploying database migration...
supabase db push
if %errorlevel% neq 0 (
    echo ❌ Database migration failed!
    pause
    exit /b 1
)
echo ✅ Database migration deployed successfully!

echo 🔧 Deploying edge function...
supabase functions deploy api-keys
if %errorlevel% neq 0 (
    echo ❌ Edge function deployment failed!
    pause
    exit /b 1
)
echo ✅ Edge function deployed successfully!

echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 1. Add these environment variables to your .env.local:
echo    VITE_SUPABASE_URL=your_supabase_project_url
echo    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
echo.
echo 2. Start your development server:
echo    npm run dev
echo.
echo 3. Navigate to Create Content page and click 'API Key Setup'
echo.
echo 4. Enter your OpenAI API key and test the setup
echo.
echo 📚 For more details, see SETUP_GUIDE.md
pause 