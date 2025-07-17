// Script to insert OpenAI API key into Supabase
const SUPABASE_URL = 'https://yurfpubenqaotwnemuwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ';

async function insertApiKey() {
  console.log('🔑 Inserting OpenAI API Key...\n');

  // You need to replace this with your actual OpenAI API key
  const OPENAI_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE'; // Replace this!

  if (OPENAI_API_KEY === 'YOUR_ACTUAL_API_KEY_HERE') {
    console.log('❌ Please replace YOUR_ACTUAL_API_KEY_HERE with your real OpenAI API key');
    console.log('💡 Get your API key from: https://platform.openai.com/api-keys');
    console.log('\n📝 Steps:');
    console.log('1. Open this file: insert-api-key.js');
    console.log('2. Replace YOUR_ACTUAL_API_KEY_HERE with your actual key');
    console.log('3. Run: node insert-api-key.js');
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/api_keys`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        key_name: 'openai_api_key',
        key_value: OPENAI_API_KEY,
        description: 'OpenAI API key for content generation',
        is_active: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key inserted successfully!');
      console.log(`📝 Record ID: ${data[0].id}`);
      console.log(`📝 Key Name: ${data[0].key_name}`);
      console.log(`📝 Is Active: ${data[0].is_active}`);
      console.log(`📝 Created At: ${data[0].created_at}`);
      
      console.log('\n🎉 Your OpenAI API key is now stored in Supabase!');
      console.log('\n📋 Next steps:');
      console.log('1. Create .env.local file with your Supabase credentials');
      console.log('2. Start your development server: npm run dev');
      console.log('3. Navigate to Create Content page');
      console.log('4. Click "API Key Setup" to test the UI');
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to insert API key: ${response.status} ${response.statusText}`);
      console.log(`Error details: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Error inserting API key: ${error.message}`);
  }
}

// Run the insertion
insertApiKey(); 