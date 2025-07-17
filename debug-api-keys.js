// Debug script to check what's in the api_keys table
const SUPABASE_URL = 'https://yurfpubenqaotwnemuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ';

async function debugApiKeys() {
  console.log('🔍 Debugging API Keys Table...\n');

  try {
    // Check all records in the api_keys table
    console.log('1. Checking all records in api_keys table...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Found ${data.length} record(s) in api_keys table:`);
      
      if (data.length === 0) {
        console.log('❌ No records found in the table');
        console.log('💡 You need to insert your OpenAI API key');
      } else {
        data.forEach((record, index) => {
          console.log(`\nRecord ${index + 1}:`);
          console.log(`  - ID: ${record.id}`);
          console.log(`  - Key Name: ${record.key_name}`);
          console.log(`  - Is Active: ${record.is_active}`);
          console.log(`  - Created At: ${record.created_at}`);
          console.log(`  - Updated At: ${record.updated_at}`);
          console.log(`  - Description: ${record.description}`);
          
          // Show first few characters of the key for verification
          if (record.key_value) {
            const keyPreview = record.key_value.substring(0, 10) + '...';
            console.log(`  - Key Value: ${keyPreview}`);
            
            // Check if it's the placeholder value
            if (record.key_value === 'YOUR_ACTUAL_API_KEY_HERE') {
              console.log('  ⚠️  This is the placeholder value - you need to update it!');
            } else if (record.key_value.startsWith('sk-')) {
              console.log('  ✅ This looks like a valid OpenAI API key');
            } else {
              console.log('  ❓ This doesn\'t look like a valid OpenAI API key format');
            }
          } else {
            console.log('  ❌ No key value found');
          }
        });
      }
    } else {
      console.log(`❌ Error fetching records: ${response.status} ${response.statusText}`);
    }

    // Check specifically for openai_api_key
    console.log('\n2. Checking specifically for openai_api_key...');
    const openaiResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_name=eq.openai_api_key&select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (openaiResponse.ok) {
      const openaiData = await openaiResponse.json();
      console.log(`Found ${openaiData.length} record(s) with key_name = 'openai_api_key'`);
      
      if (openaiData.length > 0) {
        const record = openaiData[0];
        console.log(`\nOpenAI API Key Record:`);
        console.log(`  - Is Active: ${record.is_active}`);
        console.log(`  - Key Value: ${record.key_value ? record.key_value.substring(0, 10) + '...' : 'NULL'}`);
        
        if (!record.is_active) {
          console.log('  ⚠️  The key is marked as inactive!');
        }
      }
    }

    // Check RLS policies
    console.log('\n3. Testing Row Level Security...');
    const rlsResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?key_name=eq.openai_api_key&is_active=eq.true&select=key_value,is_active`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`RLS Query Status: ${rlsResponse.status} ${rlsResponse.statusText}`);
    if (rlsResponse.ok) {
      const rlsData = await rlsResponse.json();
      console.log(`RLS Query returned ${rlsData.length} record(s)`);
    }

  } catch (error) {
    console.log(`❌ Error during debugging: ${error.message}`);
  }
}

// Run the debug
debugApiKeys(); 