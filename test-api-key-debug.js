// Test script to debug API key retrieval
const SUPABASE_URL = 'https://yurfpubenqaotwnemuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ';

console.log('🔍 Debugging API Key Retrieval...\n');

async function debugApiKey() {
  try {
    console.log('1. Testing Supabase configuration...');
    console.log('   URL:', SUPABASE_URL);
    console.log('   Anon Key Prefix:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    console.log('\n2. Testing API key retrieval from Supabase...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_name=eq.openai_api_key&is_active=eq.true&select=key_value,is_active`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('   Response Status:', response.status);
    console.log('   Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('   Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('   Response Data Type:', typeof data);
    console.log('   Is Array:', Array.isArray(data));
    console.log('   Data Length:', Array.isArray(data) ? data.length : 'not array');
    
    if (Array.isArray(data) && data.length > 0) {
      const keyData = data[0];
      console.log('   First Item:', {
        hasKeyValue: !!keyData.key_value,
        keyValueLength: keyData.key_value ? keyData.key_value.length : 0,
        keyValuePrefix: keyData.key_value ? keyData.key_value.substring(0, 7) + '...' : 'none',
        isActive: keyData.is_active
      });
      
      if (keyData.key_value) {
        console.log('\n3. Testing OpenAI API call...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyData.key_value}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant. Respond with "Hello from OpenAI!"'
              },
              {
                role: 'user',
                content: 'Say hello'
              }
            ],
            max_tokens: 50,
            temperature: 0.7,
          }),
        });

        console.log('   OpenAI Response Status:', openaiResponse.status);
        
        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          console.log('   OpenAI Response:', openaiData.choices[0].message.content);
          console.log('\n✅ SUCCESS: API key is working correctly!');
        } else {
          const errorText = await openaiResponse.text();
          console.log('   OpenAI Error:', errorText);
          console.log('\n❌ FAILED: OpenAI API call failed');
        }
      } else {
        console.log('\n❌ FAILED: No API key value found in Supabase');
      }
    } else {
      console.log('\n❌ FAILED: No API key records found in Supabase');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Run the debug
debugApiKey(); 