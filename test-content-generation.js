// Test script to debug content generation and test specific prompt
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Content Generation and Debugging Issue');
console.log('=' .repeat(60));

// Test configuration
const testConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  testPrompt: "what is the joining fee ICICI MAKEMYTRIP CREDIT CARD, and what are the product benefit of it",
  platforms: ['LinkedIn'],
  selectedCards: ['test-card-1'],
  tone: 'professional',
  selectedFormat: { id: 'full-post', name: 'Full Post' }
};

async function testSupabaseConnection() {
  console.log('\n🔗 Testing Supabase Connection...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);
    
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
      return apiKeys[0].openai_api_key;
    }
    
    return false;
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function testContentGeneration(openaiApiKey) {
  console.log('\n🤖 Testing Content Generation...');
  console.log('📋 Test Configuration:');
  console.log('  - Prompt:', testConfig.testPrompt);
  console.log('  - Platforms:', testConfig.platforms);
  console.log('  - Format:', testConfig.selectedFormat.name);
  
  try {
    // Mock card data for ICICI MakeMyTrip
    const cardData = {
      id: 'test-card-1',
      name: 'ICICI MakeMyTrip Credit Card',
      seo_card_alias: 'icici-makemytrip-credit-card',
      bank_name: 'ICICI Bank',
      card_network: 'Visa',
      annual_fee: '₹500',
      joining_fee: '₹500',
      key_features: ['5X rewards on MakeMyTrip', '2X rewards on dining', '1X on other spends'],
      benefits: ['Complimentary airport lounge access', 'Travel insurance', 'Zero forex markup'],
      reward_conversion_rate: '1 point = ₹0.25',
      redemption_options: 'MakeMyTrip vouchers, statement credit, gift vouchers',
      age_criteria: '21-65 years',
      income_salaried: '₹3,00,000 per annum',
      income_self_emp: '₹3,50,000 per annum',
      crif: '700+',
      crif_self_emp: '700+',
      exclusion_spends: 'Fuel, insurance, utilities',
      exclusion_earnings: 'Government transactions, cash advances'
    };

    // Build RAG system prompt
    const systemPrompt = `You are a professional financial content creator specializing in credit card content. You create engaging, accurate, and informative content that follows best practices for social media platforms.

IMPORTANT: Always respond with valid JSON format containing content for each platform.

CONTEXT:
- Selected Cards: ${cardData.name}
- Tone: ${testConfig.tone}
- Format: ${testConfig.selectedFormat.name}

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

USER REQUEST: ${testConfig.testPrompt}

PLATFORMS: ${testConfig.platforms.join(', ')}
FORMAT: ${testConfig.selectedFormat.name}

SPECIFIC REQUIREMENTS:
- Focus on the selected cards: ${cardData.name}
- If the user asks about specific card features (like joining fees, rewards, etc.), use the provided card data
- If information is not available in the card data, provide general information based on your knowledge
- Make the content platform-appropriate and engaging
- Include relevant hashtags and calls-to-action

Please generate content that addresses the user's specific request while following all platform guidelines.`;

    console.log('📝 Sending request to OpenAI...');
    
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
      console.log('❌ OpenAI API error:', errorText);
      return false;
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ Content generation successful');
    console.log('📄 Raw response length:', content.length);
    
    // Try to parse JSON response
    try {
      const parsedContent = JSON.parse(content);
      console.log('📄 Generated content structure:', Object.keys(parsedContent));
      
      // Check if content is platform-appropriate
      Object.entries(parsedContent).forEach(([platform, text]) => {
        console.log(`\n📱 ${platform.toUpperCase()} Content:`);
        console.log(`   Length: ${text.length} characters`);
        console.log(`   Preview: ${text.substring(0, 200)}...`);
        
        // Check for card-specific information
        const hasCardInfo = text.toLowerCase().includes(cardData.name.toLowerCase()) ||
                           text.toLowerCase().includes(cardData.bank_name.toLowerCase()) ||
                           text.toLowerCase().includes(cardData.joining_fee.toLowerCase());
        
        console.log(`   Contains card info: ${hasCardInfo ? '✅' : '❌'}`);
        
        // Check for joining fee information
        const hasJoiningFee = text.toLowerCase().includes('joining fee') ||
                             text.toLowerCase().includes('₹500') ||
                             text.toLowerCase().includes('500');
        
        console.log(`   Contains joining fee info: ${hasJoiningFee ? '✅' : '❌'}`);
        
        // Check for benefits information
        const hasBenefits = text.toLowerCase().includes('benefit') ||
                           text.toLowerCase().includes('reward') ||
                           text.toLowerCase().includes('feature');
        
        console.log(`   Contains benefits info: ${hasBenefits ? '✅' : '❌'}`);
      });
      
      return parsedContent;
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError.message);
      console.log('📄 Raw response:', content.substring(0, 500) + '...');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Content generation failed:', error.message);
    return false;
  }
}

async function testBankKaroAPI() {
  console.log('\n🏦 Testing BankKaro API for ICICI MakeMyTrip card...');
  
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
    
    // Search for ICICI MakeMyTrip card
    const iciciCard = cards.find(card => 
      card.name?.toLowerCase().includes('icici') && 
      card.name?.toLowerCase().includes('makemytrip')
    );
    
    if (iciciCard) {
      console.log('🎯 Found ICICI MakeMyTrip card:');
      console.log('  - Name:', iciciCard.name);
      console.log('  - Bank:', iciciCard.bank_name);
      console.log('  - Joining Fee:', iciciCard.joining_fee);
      console.log('  - Annual Fee:', iciciCard.annual_fee);
      console.log('  - Key Features:', iciciCard.key_features?.length || 0);
      console.log('  - Benefits:', iciciCard.benefits?.length || 0);
    } else {
      console.log('❌ ICICI MakeMyTrip card not found in API response');
    }
    
    return true;
  } catch (error) {
    console.log('❌ BankKaro API test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting content generation debug tests...\n');
  
  const openaiApiKey = await testSupabaseConnection();
  if (!openaiApiKey) {
    console.log('❌ Cannot proceed without OpenAI API key');
    return false;
  }
  
  const content = await testContentGeneration(openaiApiKey);
  const bankKaroWorking = await testBankKaroAPI();
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(40));
  console.log('🔗 Supabase Connection:', openaiApiKey ? '✅ PASS' : '❌ FAIL');
  console.log('🤖 Content Generation:', content ? '✅ PASS' : '❌ FAIL');
  console.log('🏦 BankKaro API:', bankKaroWorking ? '✅ PASS' : '❌ FAIL');
  
  if (content) {
    console.log('\n🎯 Generated Content for ICICI MakeMyTrip:');
    console.log('=' .repeat(50));
    Object.entries(content).forEach(([platform, text]) => {
      console.log(`\n📱 ${platform.toUpperCase()}:`);
      console.log(text);
    });
  }
  
  return content && bankKaroWorking;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testConfig }; 