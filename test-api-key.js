// Test script to verify OpenAI API key setup
// Run this after setting up your Supabase configuration

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your_supabase_url_here';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

async function testApiKeySetup() {
  console.log('🔍 Testing OpenAI API Key Setup...\n');

  // Test 1: Check if Supabase credentials are configured
  console.log('1. Checking Supabase configuration...');
  if (!SUPABASE_URL || SUPABASE_URL === 'your_supabase_url_here') {
    console.log('❌ VITE_SUPABASE_URL not configured');
    return;
  }
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
    console.log('❌ VITE_SUPABASE_ANON_KEY not configured');
    return;
  }
  console.log('✅ Supabase credentials configured\n');

  // Test 2: Try to fetch API key from Supabase
  console.log('2. Testing API key retrieval from Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_name=eq.openai_api_key&is_active=eq.true&select=key_value,is_active`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ Failed to fetch API key: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.log('❌ No API key found in Supabase');
      console.log('💡 Make sure you have inserted your OpenAI API key in the api_keys table');
      return;
    }

    const apiKey = data[0].key_value;
    if (!apiKey || apiKey === 'YOUR_ACTUAL_API_KEY_HERE') {
      console.log('❌ API key not properly set in Supabase');
      console.log('💡 Update the key_value in the api_keys table with your actual OpenAI API key');
      return;
    }

    console.log('✅ API key found in Supabase\n');

    // Test 3: Test OpenAI API call
    console.log('3. Testing OpenAI API call...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, API key is working!"'
          }
        ],
        max_tokens: 50,
      }),
    });

    if (!openaiResponse.ok) {
      console.log(`❌ OpenAI API call failed: ${openaiResponse.status} ${openaiResponse.statusText}`);
      return;
    }

    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI API call successful');
    console.log(`📝 Response: ${openaiData.choices[0].message.content}\n`);

    console.log('🎉 All tests passed! Your OpenAI API key setup is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Navigate to Create Content page');
    console.log('3. Click "API Key Setup" to test the UI');
    console.log('4. Try generating content with AI');

  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }
}

// Run the test
testApiKeySetup(); 