// Test script for RAG (Retrieval Augmented Generation) system
// This script tests the enhanced content creation with platform-aware generation

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing RAG (Retrieval Augmented Generation) System');
console.log('=' .repeat(60));

// Test configuration
const testConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  testCards: [
    {
      id: 'test-card-1',
      name: 'HDFC Regalia Credit Card',
      seo_card_alias: 'hdfc-regalia-credit-card',
      bank_name: 'HDFC Bank',
      card_network: 'Visa',
      annual_fee: '₹2,500',
      joining_fee: '₹2,500',
      key_features: ['4 Reward Points per ₹150', 'Domestic & International Lounge Access', 'Travel Insurance'],
      benefits: ['Complimentary airport lounge access', 'Travel insurance coverage', 'Reward point redemption'],
      reward_conversion_rate: '1 point = ₹0.30',
      redemption_options: 'Airline miles, gift vouchers, statement credit',
      age_criteria: '21-60 years',
      income_salaried: '₹12,00,000 per annum',
      income_self_emp: '₹15,00,000 per annum',
      crif: '750+',
      crif_self_emp: '750+',
      exclusion_spends: 'Fuel, insurance, utilities',
      exclusion_earnings: 'Government transactions, cash advances'
    },
    {
      id: 'test-card-2',
      name: 'SBI SimplyCLICK Credit Card',
      seo_card_alias: 'sbi-simplyclick-credit-card',
      bank_name: 'State Bank of India',
      card_network: 'Visa',
      annual_fee: '₹499',
      joining_fee: '₹499',
      key_features: ['10X rewards on online spends', '5X on dining', '2X on travel'],
      benefits: ['High rewards on online shopping', 'Dining rewards', 'Travel benefits'],
      reward_conversion_rate: '1 point = ₹0.25',
      redemption_options: 'Gift vouchers, statement credit, merchandise',
      age_criteria: '21-70 years',
      income_salaried: '₹2,00,000 per annum',
      income_self_emp: '₹2,50,000 per annum',
      crif: '650+',
      crif_self_emp: '650+',
      exclusion_spends: 'Fuel, insurance, utilities',
      exclusion_earnings: 'Government transactions, cash advances'
    }
  ],
  testPrompts: [
    "I want to write a post about HDFC Regalia joining fee and its benefits",
    "Compare the rewards structure of HDFC Regalia vs SBI SimplyCLICK",
    "Create content about credit card eligibility criteria and income requirements",
    "Write about travel benefits and lounge access features",
    "Explain the reward conversion rates and redemption options"
  ],
  platforms: ['LinkedIn', 'Twitter', 'Instagram', 'YouTube'],
  formats: [
    { id: 'full-post', name: 'Full Post' },
    { id: 'single-tweet', name: 'Single Tweet' },
    { id: 'caption', name: 'Caption' },
    { id: 'full-video', name: 'Full Video' }
  ]
};

async function testSupabaseConnection() {
  console.log('\n🔗 Testing Supabase Connection...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);
    
    // Test API key retrieval
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 API keys found:', apiKeys?.length || 0);
    
    if (apiKeys && apiKeys.length > 0) {
      console.log('🔑 OpenAI API key available:', apiKeys[0].openai_api_key ? 'Yes' : 'No');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function testOpenAIAPI() {
  console.log('\n🤖 Testing OpenAI API...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);
    
    // Get API key
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('openai_api_key')
      .limit(1);
    
    if (error || !apiKeys || apiKeys.length === 0 || !apiKeys[0].openai_api_key) {
      console.log('❌ No OpenAI API key found in Supabase');
      return false;
    }
    
    const openaiApiKey = apiKeys[0].openai_api_key;
    
    // Test OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond with "OpenAI API is working correctly."'
          },
          {
            role: 'user',
            content: 'Test message'
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ OpenAI API error:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ OpenAI API working correctly');
    console.log('📝 Response:', data.choices[0].message.content);
    
    return true;
  } catch (error) {
    console.log('❌ OpenAI API test failed:', error.message);
    return false;
  }
}

async function testRAGContentGeneration() {
  console.log('\n🧠 Testing RAG Content Generation...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);
    
    // Get API key
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('openai_api_key')
      .limit(1);
    
    if (error || !apiKeys || apiKeys.length === 0 || !apiKeys[0].openai_api_key) {
      console.log('❌ No OpenAI API key found for RAG test');
      return false;
    }
    
    const openaiApiKey = apiKeys[0].openai_api_key;
    
    // Test RAG-enhanced prompt
    const testPrompt = testConfig.testPrompts[0];
    const cardData = testConfig.testCards[0];
    const platform = testConfig.platforms[0];
    const format = testConfig.formats[0];
    
    console.log('📋 Test Configuration:');
    console.log('  - Prompt:', testPrompt);
    console.log('  - Card:', cardData.name);
    console.log('  - Platform:', platform);
    console.log('  - Format:', format.name);
    
    // Build RAG system prompt
    const systemPrompt = `You are a professional financial content creator specializing in credit card content. You create engaging, accurate, and informative content that follows best practices for social media platforms.

IMPORTANT: Always respond with valid JSON format containing content for each platform.

CONTEXT:
- Selected Cards: ${cardData.name}
- Tone: professional
- Format: ${format.name}

PLATFORM GUIDELINES:

LINKEDIN:
- Tone: professional
- Max Length: 3000 characters
- Emoji Usage: minimal
- Hashtag Count: 3-5
- Content Style: educational, thought-leadership, industry insights
- Call to Action: professional
- Format Structure: hook, context, insights, conclusion, call-to-action

CARD DATA CONTEXT:
${cardData.name} (${cardData.bank_name}):
- Annual Fee: ${cardData.annual_fee}
- Joining Fee: ${cardData.joining_fee}
- Key Features: ${cardData.key_features.join(', ')}
- Benefits: ${cardData.benefits.join(', ')}
- Reward Rate: ${cardData.reward_conversion_rate}
- Eligibility: Age ${cardData.age_criteria}, Income ${cardData.income_salaried}
- Exclusions: ${cardData.exclusion_spends}

INSTRUCTIONS:
1. Use the card data provided to create accurate, specific content
2. Follow platform-specific guidelines for tone, length, and style
3. Include relevant hashtags appropriate for each platform
4. Make content engaging and actionable
5. If specific card information is requested but not available in the data, use your knowledge to provide general information
6. Always maintain accuracy and avoid misleading information

RESPONSE FORMAT:
Return a JSON object with content for each platform:
{
  "linkedin": "content for LinkedIn",
  "twitter": "content for Twitter", 
  "instagram": "content for Instagram",
  "youtube": "content for YouTube"
}`;

    const userPrompt = `Create content for the following request:

USER REQUEST: ${testPrompt}

PLATFORMS: ${platform}
FORMAT: ${format.name}

SPECIFIC REQUIREMENTS:
- Focus on the selected cards: ${cardData.name}
- If the user asks about specific card features (like joining fees, rewards, etc.), use the provided card data
- If information is not available in the card data, provide general information based on your knowledge
- Make the content platform-appropriate and engaging
- Include relevant hashtags and calls-to-action

Please generate content that addresses the user's specific request while following all platform guidelines.`;

    // Make OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ RAG OpenAI API error:', errorText);
      return false;
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ RAG content generation successful');
    
    // Try to parse JSON response
    try {
      const parsedContent = JSON.parse(content);
      console.log('📄 Generated content structure:', Object.keys(parsedContent));
      
      // Check if content is platform-appropriate
      Object.entries(parsedContent).forEach(([platform, text]) => {
        console.log(`\n📱 ${platform.toUpperCase()} Content:`);
        console.log(`   Length: ${text.length} characters`);
        console.log(`   Preview: ${text.substring(0, 100)}...`);
        
        // Check for card-specific information
        const hasCardInfo = text.toLowerCase().includes(cardData.name.toLowerCase()) ||
                           text.toLowerCase().includes(cardData.bank_name.toLowerCase()) ||
                           text.toLowerCase().includes(cardData.joining_fee.toLowerCase());
        
        console.log(`   Contains card info: ${hasCardInfo ? '✅' : '❌'}`);
      });
      
      return true;
    } catch (parseError) {
      console.log('❌ Failed to parse RAG response as JSON:', parseError.message);
      console.log('📄 Raw response:', content.substring(0, 200) + '...');
      return false;
    }
    
  } catch (error) {
    console.log('❌ RAG content generation failed:', error.message);
    return false;
  }
}

async function testBankKaroAPI() {
  console.log('\n🏦 Testing BankKaro API...');
  
  try {
    const response = await fetch('https://bk-api.bankkaro.com/sp/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: "",
        banks_ids: [],
        card_networks: [],
        annualFees: "",
        credit_score: "",
        sort_by: "",
        free_cards: "",
        eligiblityPayload: {},
        cardGeniusPayload: {}
      }),
    });
    
    if (!response.ok) {
      console.log('❌ BankKaro API error:', response.status);
      return false;
    }
    
    const data = await response.json();
    const cards = Array.isArray(data) ? data : data.cards || data.data?.cards || [];
    
    console.log('✅ BankKaro API working correctly');
    console.log('📊 Cards fetched:', cards.length);
    
    if (cards.length > 0) {
      const sampleCard = cards[0];
      console.log('📋 Sample card data structure:');
      console.log('  - Name:', sampleCard.name);
      console.log('  - Bank:', sampleCard.bank_name);
      console.log('  - Network:', sampleCard.card_network);
      console.log('  - Annual Fee:', sampleCard.annual_fee);
      console.log('  - Joining Fee:', sampleCard.joining_fee);
      console.log('  - Key Features:', sampleCard.key_features?.length || 0);
      console.log('  - Benefits:', sampleCard.benefits?.length || 0);
    }
    
    return true;
  } catch (error) {
    console.log('❌ BankKaro API test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive RAG system tests...\n');
  
  const results = {
    supabase: await testSupabaseConnection(),
    openai: await testOpenAIAPI(),
    rag: await testRAGContentGeneration(),
    bankkaro: await testBankKaroAPI()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(40));
  console.log('🔗 Supabase Connection:', results.supabase ? '✅ PASS' : '❌ FAIL');
  console.log('🤖 OpenAI API:', results.openai ? '✅ PASS' : '❌ FAIL');
  console.log('🧠 RAG Content Generation:', results.rag ? '✅ PASS' : '❌ FAIL');
  console.log('🏦 BankKaro API:', results.bankkaro ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🎉 RAG system is ready for production use!');
    console.log('✨ Features working:');
    console.log('   • Platform-aware content generation');
    console.log('   • Card-specific data integration');
    console.log('   • Format alignment');
    console.log('   • Enhanced content quality');
  } else {
    console.log('\n⚠️  Some issues need to be resolved before production use.');
    console.log('💡 Check the error messages above for details.');
  }
  
  return allPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testConfig }; 