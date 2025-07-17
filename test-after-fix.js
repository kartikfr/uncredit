// Test script to verify the fix after RLS policies are updated
const SUPABASE_URL = 'https://yurfpubenqaotwnemuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ';

async function testAfterFix() {
  console.log('🔍 Testing After RLS Fix...\n');

  try {
    // Test 1: Check if we can read records
    console.log('1. Testing record retrieval...');
    const readResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (readResponse.ok) {
      const readData = await readResponse.json();
      console.log(`✅ Read successful - found ${readData.length} records`);
      
      if (readData.length > 0) {
        console.log('\n📋 Found records:');
        readData.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.key_name} (Active: ${record.is_active})`);
          if (record.key_name === 'openai_api_key') {
            const keyPreview = record.key_value ? record.key_value.substring(0, 10) + '...' : 'NULL';
            console.log(`     Key: ${keyPreview}`);
          }
        });
      } else {
        console.log('❌ No records found');
      }
    } else {
      console.log(`❌ Read failed: ${readResponse.status} ${readResponse.statusText}`);
    }

    // Test 2: Check specifically for OpenAI API key
    console.log('\n2. Testing OpenAI API key retrieval...');
    const openaiResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_name=eq.openai_api_key&is_active=eq.true&select=key_value,is_active`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (openaiResponse.ok) {
      const openaiData = await openaiResponse.json();
      
      if (openaiData && openaiData.length > 0) {
        const apiKey = openaiData[0].key_value;
        console.log('✅ OpenAI API key found!');
        
        // Test 3: Test OpenAI API call
        console.log('\n3. Testing OpenAI API call...');
        const openaiApiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

        if (openaiApiResponse.ok) {
          const openaiApiData = await openaiApiResponse.json();
          console.log('✅ OpenAI API call successful!');
          console.log(`📝 Response: ${openaiApiData.choices[0].message.content}`);
          
          console.log('\n🎉 Everything is working perfectly!');
          console.log('\n📋 Next steps:');
          console.log('1. Create .env.local file with your Supabase credentials');
          console.log('2. Your development server is already running at http://localhost:8082');
          console.log('3. Navigate to Create Content page');
          console.log('4. Click "API Key Setup" to test the UI');
        } else {
          console.log(`❌ OpenAI API call failed: ${openaiApiResponse.status} ${openaiApiResponse.statusText}`);
        }
      } else {
        console.log('❌ No OpenAI API key found');
        console.log('💡 Make sure you inserted the API key after fixing RLS policies');
      }
    } else {
      console.log(`❌ Failed to retrieve OpenAI API key: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run the test
testAfterFix(); 