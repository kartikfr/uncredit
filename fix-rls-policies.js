// Script to check and fix RLS policies for api_keys table
const SUPABASE_URL = 'https://yurfpubenqaotwnemuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ';

async function checkAndFixRLS() {
  console.log('🔍 Checking RLS Policies...\n');

  try {
    // Test 1: Try to insert a test record
    console.log('1. Testing record insertion...');
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key_name: 'test_key',
        key_value: 'test_value',
        description: 'Test key for RLS debugging',
        is_active: true
      })
    });

    console.log(`Insert Status: ${insertResponse.status} ${insertResponse.statusText}`);
    
    if (insertResponse.ok) {
      const insertData = await insertResponse.json();
      console.log('✅ Test record inserted successfully');
      console.log(`📝 Record ID: ${insertData[0].id}`);
      
      // Clean up test record
      console.log('\n2. Cleaning up test record...');
      const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?id=eq.${insertData[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Test record cleaned up');
      }
    } else {
      const errorText = await insertResponse.text();
      console.log(`❌ Insert failed: ${errorText}`);
      
      if (insertResponse.status === 403) {
        console.log('💡 This suggests an RLS policy issue');
        console.log('📋 You may need to run this SQL in Supabase to fix RLS:');
        console.log(`
-- Fix RLS policies for api_keys table
DROP POLICY IF EXISTS "Users can read API keys" ON api_keys;
DROP POLICY IF EXISTS "Service role can manage API keys" ON api_keys;

-- Allow anonymous access for testing (you can restrict this later)
CREATE POLICY "Allow all operations for testing" ON api_keys
  FOR ALL USING (true)
  WITH CHECK (true);
        `);
      }
    }

    // Test 2: Try to read records
    console.log('\n3. Testing record retrieval...');
    const readResponse = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`Read Status: ${readResponse.status} ${readResponse.statusText}`);
    
    if (readResponse.ok) {
      const readData = await readResponse.json();
      console.log(`✅ Read successful - found ${readData.length} records`);
      
      if (readData.length > 0) {
        console.log('\n📋 Found records:');
        readData.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.key_name} (Active: ${record.is_active})`);
        });
      }
    } else {
      const errorText = await readResponse.text();
      console.log(`❌ Read failed: ${errorText}`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run the check
checkAndFixRLS(); 