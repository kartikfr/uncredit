// Test script to verify Supabase connection
const SUPABASE_URL = 'https://yurfpubenqaotwnemuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Basic connection test
    console.log('1. Testing basic connection...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Supabase connection successful\n');
    } else {
      console.log(`❌ Connection failed: ${response.status} ${response.statusText}\n`);
      return;
    }

    // Test 2: Check if api_keys table exists
    console.log('2. Checking if api_keys table exists...');
    const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?select=count`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (tableResponse.ok) {
      console.log('✅ api_keys table exists\n');
    } else if (tableResponse.status === 404) {
      console.log('❌ api_keys table does not exist');
      console.log('💡 You need to run the SQL setup script first\n');
      return;
    } else {
      console.log(`❌ Error checking table: ${tableResponse.status} ${tableResponse.statusText}\n`);
      return;
    }

    // Test 3: Check if OpenAI API key exists
    console.log('3. Checking for OpenAI API key...');
    const keyResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_name=eq.openai_api_key&is_active=eq.true&select=key_value,is_active`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (keyResponse.ok) {
      const data = await keyResponse.json();
      
      if (data && data.length > 0) {
        const apiKey = data[0].key_value;
        if (apiKey && apiKey !== 'YOUR_ACTUAL_API_KEY_HERE') {
          console.log('✅ OpenAI API key found and properly configured\n');
          
          // Test 4: Test OpenAI API call
          console.log('4. Testing OpenAI API call...');
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

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            console.log('✅ OpenAI API call successful');
            console.log(`📝 Response: ${openaiData.choices[0].message.content}\n`);
          } else {
            console.log(`❌ OpenAI API call failed: ${openaiResponse.status} ${openaiResponse.statusText}\n`);
          }
        } else {
          console.log('❌ OpenAI API key not properly set');
          console.log('💡 Update the key_value in the api_keys table with your actual OpenAI API key\n');
        }
      } else {
        console.log('❌ No OpenAI API key found');
        console.log('💡 Insert your OpenAI API key into the api_keys table\n');
      }
    } else {
      console.log(`❌ Error checking API key: ${keyResponse.status} ${keyResponse.statusText}\n`);
    }

    console.log('🎉 Connection test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Create .env.local file with your Supabase credentials');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Navigate to Create Content page');
    console.log('4. Click "API Key Setup" to test the UI');

  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }
}

// Run the test
testSupabaseConnection(); 