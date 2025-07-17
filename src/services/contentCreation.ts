// Content Creation Service for UnCredit with RAG (Retrieval Augmented Generation)
export interface ContentCreationRequest {
  platforms: string[];
  selectedCards: string[];
  tone: string;
  prompt: string;
  selectedFormat?: any;
  linkedinProfile?: string;
  uploadedFiles?: File[];
  customTone?: string;
}

export interface GeneratedContent {
  id: string;
  platforms: string[];
  content: {
    [platform: string]: string;
  };
  references: ContentReference[];
  tone: string;
  prompt: string;
  selectedCards: string[];
  selectedFormat?: any;
  cardData?: CardData[];
  createdAt: Date;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

export interface ContentReference {
  text: string;
  source: string;
  url?: string;
  cardName?: string;
}

export interface CardData {
  id: string;
  name: string;
  seo_card_alias: string;
  bank_name: string;
  card_network: string;
  annual_fee: string;
  joining_fee: string;
  key_features: string[];
  benefits: string[];
  reward_conversion_rate?: string;
  redemption_options?: string;
  age_criteria?: string;
  income_salaried?: string;
  income_self_emp?: string;
  crif?: string;
  crif_self_emp?: string;
  exclusion_spends?: string;
  exclusion_earnings?: string;
  product_usps?: any[];
  tags?: string[];
  image?: string;
}

export interface ToneAnalysis {
  tone: string;
  confidence: number;
  suggestions: string[];
}

export interface LinkedInProfile {
  posts: string[];
  tone: string;
  engagement: number;
  followers: number;
}

export interface ContentHistory {
  id: string;
  title: string;
  platforms: string[];
  createdAt: Date;
  lastModified: Date;
  status: 'draft' | 'scheduled' | 'published';
}

// Enhanced RAG Search Interface
export interface RAGSearchResult {
  cardName: string;
  bankName: string;
  relevantInfo: {
    field: string;
    value: string;
    relevance: number;
  }[];
  extractedData: {
    joining_fee?: string;
    annual_fee?: string;
    key_features?: string[];
    benefits?: string[];
    reward_rate?: string;
    eligibility?: string;
    [key: string]: any;
  };
}

// Platform and format definitions
export const PLATFORM_GUIDELINES = {
  linkedin: {
    tone: 'professional',
    maxLength: 3000,
    emojiUsage: 'minimal',
    hashtagCount: '3-5',
    callToAction: 'professional',
    contentStyle: 'educational, thought-leadership, industry insights',
    formatGuidelines: {
      'full-post': {
        structure: 'hook, context, insights, conclusion, call-to-action',
        paragraphLength: '2-3 sentences',
        bulletPoints: 'use sparingly'
      },
      'carousel': {
        structure: 'intro slide, 3-5 content slides, conclusion slide',
        slideLength: '50-100 words per slide',
        visualElements: 'charts, infographics, key points'
      },
      'article': {
        structure: 'headline, introduction, main content, conclusion',
        paragraphLength: '3-4 sentences',
        subheadings: 'use for organization'
      }
    }
  },
  twitter: {
    tone: 'conversational',
    maxLength: 280,
    emojiUsage: 'moderate',
    hashtagCount: '2-3',
    callToAction: 'direct',
    contentStyle: 'quick tips, breaking news, engaging questions',
    formatGuidelines: {
      'single-tweet': {
        structure: 'hook, main point, call-to-action',
        characterCount: '240 (leaving room for engagement)',
        hashtags: 'end of tweet'
      },
      'thread': {
        structure: 'hook tweet, 3-5 content tweets, conclusion tweet',
        tweetLength: '200-250 characters each',
        numbering: '1/5, 2/5, etc.'
      }
    }
  },
  instagram: {
    tone: 'casual, engaging',
    maxLength: 2200,
    emojiUsage: 'liberal',
    hashtagCount: '10-20',
    callToAction: 'encouraging',
    contentStyle: 'visual storytelling, behind-the-scenes, tips',
    formatGuidelines: {
      'caption': {
        structure: 'hook, main content, call-to-action, hashtags',
        paragraphBreaks: 'use line breaks for readability',
        emojiPlacement: 'start of paragraphs'
      },
      'story': {
        structure: 'quick tip, visual element, call-to-action',
        length: 'short and punchy',
        interactiveElements: 'polls, questions'
      },
      'reel': {
        structure: 'hook, main content, call-to-action',
        length: '15-60 seconds script',
        trendingElements: 'current trends, music'
      }
    }
  },
  youtube: {
    tone: 'educational, friendly',
    maxLength: 5000,
    emojiUsage: 'minimal',
    hashtagCount: '5-10',
    callToAction: 'subscribe-focused',
    contentStyle: 'tutorial, review, educational content',
    formatGuidelines: {
      'full-video': {
        structure: 'intro, main content, conclusion, call-to-action',
        scriptLength: '10-20 minutes',
        sections: 'clear chapter markers'
      },
      'shorts': {
        structure: 'hook, quick tip, call-to-action',
        scriptLength: '15-60 seconds',
        verticalFormat: 'optimized for mobile'
      }
    }
  }
};

import { supabaseApiKeyService } from './supabaseApiKeys';

class ContentCreationService {
  private baseURL = 'https://bk-api.bankkaro.com/sp/api';
  private cardGeniusURL = 'https://card-recommendation-api-v2.bankkaro.com/cg/api/pro';
  private contentHistory: ContentHistory[] = [];
  private cardCache: CardData[] = [];
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Enhanced RAG-powered content generation
  private async makeOpenAIRequest(prompt: string, context: any, model: string = 'gpt-4'): Promise<string> {
    console.log('🔍 makeOpenAIRequest: Starting RAG-enhanced generation...');
    
    const openaiApiKey = await supabaseApiKeyService.getOpenAIKey();
    
    if (!openaiApiKey) {
      console.warn('❌ OpenAI API key not configured. Using mock content.');
      return this.generateMockContent(context);
    }

    console.log('🚀 Making RAG-enhanced OpenAI API request...');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(context)
            },
            {
              role: 'user',
              content: this.buildUserPrompt(prompt, context)
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ RAG-enhanced OpenAI API Success');
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      throw error;
    }
  }

  // Enhanced RAG Search Function
  private async performRAGSearch(prompt: string, selectedCards: string[]): Promise<RAGSearchResult[]> {
    console.log('🔍 RAG Search: Starting intelligent search...');
    console.log('📋 Search query:', prompt);
    console.log('🎯 Selected cards:', selectedCards);

    // Extract search keywords from prompt
    const searchKeywords = this.extractSearchKeywords(prompt);
    console.log('🔑 Extracted keywords:', searchKeywords);

    // Get card data
    const allCards = await this.getCardsForSelection();
    const results: RAGSearchResult[] = [];

    for (const cardId of selectedCards) {
      const card = allCards.find(c => c.id === cardId);
      if (!card) continue;

      console.log('🔍 Searching in card:', card.name);
      
      const relevantInfo = this.searchCardData(card, searchKeywords);
      const extractedData = this.extractRelevantData(card, searchKeywords);

      results.push({
        cardName: card.name,
        bankName: card.bank_name,
        relevantInfo,
        extractedData
      });
    }

    console.log('✅ RAG Search completed:', results.length, 'results');
    return results;
  }

  // Extract search keywords from user prompt
  private extractSearchKeywords(prompt: string): string[] {
    const keywords: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Fee-related keywords
    if (lowerPrompt.includes('joining fee') || lowerPrompt.includes('joining fees')) {
      keywords.push('joining_fee', 'joining fee', 'fees');
    }
    if (lowerPrompt.includes('annual fee') || lowerPrompt.includes('annual fees')) {
      keywords.push('annual_fee', 'annual fee', 'fees');
    }

    // Reward-related keywords
    if (lowerPrompt.includes('reward') || lowerPrompt.includes('rewards') || lowerPrompt.includes('points')) {
      keywords.push('reward_conversion_rate', 'rewards', 'points', 'key_features');
    }

    // Benefit-related keywords
    if (lowerPrompt.includes('benefit') || lowerPrompt.includes('benefits') || lowerPrompt.includes('feature')) {
      keywords.push('benefits', 'key_features', 'feature');
    }

    // Eligibility keywords
    if (lowerPrompt.includes('eligibility') || lowerPrompt.includes('income') || lowerPrompt.includes('age') || lowerPrompt.includes('crif')) {
      keywords.push('age_criteria', 'income_salaried', 'income_self_emp', 'crif', 'eligibility');
    }

    // Network keywords
    if (lowerPrompt.includes('visa') || lowerPrompt.includes('mastercard') || lowerPrompt.includes('network')) {
      keywords.push('card_network', 'network');
    }

    // Bank keywords
    if (lowerPrompt.includes('bank') || lowerPrompt.includes('hdfc') || lowerPrompt.includes('icici') || lowerPrompt.includes('sbi')) {
      keywords.push('bank_name', 'bank');
    }

    // General card info
    keywords.push('name', 'card', 'credit');

    console.log('🔑 Extracted keywords:', keywords);
    return keywords;
  }

  // Search through card data for relevant information
  private searchCardData(card: CardData, keywords: string[]): { field: string; value: string; relevance: number }[] {
    const results: { field: string; value: string; relevance: number }[] = [];
    const cardData = card as any;

    for (const keyword of keywords) {
      for (const [field, value] of Object.entries(cardData)) {
        if (!value) continue;

        const fieldStr = field.toLowerCase();
        const valueStr = String(value).toLowerCase();
        const keywordLower = keyword.toLowerCase();

        let relevance = 0;

        // Exact field match
        if (fieldStr.includes(keywordLower)) {
          relevance += 10;
        }

        // Value contains keyword
        if (valueStr.includes(keywordLower)) {
          relevance += 5;
        }

        // Partial matches
        if (fieldStr.includes(keywordLower.substring(0, 3))) {
          relevance += 3;
        }

        if (valueStr.includes(keywordLower.substring(0, 3))) {
          relevance += 2;
        }

        if (relevance > 0) {
          results.push({
            field,
            value: String(value),
            relevance
          });
        }
      }
    }

    // Sort by relevance and remove duplicates
    const uniqueResults = results
      .filter((result, index, self) => 
        index === self.findIndex(r => r.field === result.field)
      )
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Top 10 most relevant

    console.log('🔍 Search results for', card.name, ':', uniqueResults);
    return uniqueResults;
  }

  // Extract specific data based on search keywords
  private extractRelevantData(card: CardData, keywords: string[]): any {
    const extracted: any = {};
    const lowerKeywords = keywords.map(k => k.toLowerCase());

    // Extract joining fee
    if (lowerKeywords.some(k => k.includes('joining'))) {
      extracted.joining_fee = card.joining_fee;
    }

    // Extract annual fee
    if (lowerKeywords.some(k => k.includes('annual'))) {
      extracted.annual_fee = card.annual_fee;
    }

    // Extract rewards
    if (lowerKeywords.some(k => k.includes('reward') || k.includes('point'))) {
      extracted.reward_rate = card.reward_conversion_rate;
      extracted.key_features = card.key_features;
    }

    // Extract benefits
    if (lowerKeywords.some(k => k.includes('benefit') || k.includes('feature'))) {
      extracted.benefits = card.benefits;
      extracted.key_features = card.key_features;
    }

    // Extract eligibility
    if (lowerKeywords.some(k => k.includes('eligibility') || k.includes('income') || k.includes('age'))) {
      extracted.eligibility = {
        age: card.age_criteria || 'Not specified',
        income_salaried: card.income_salaried || 'Not specified',
        income_self_emp: card.income_self_emp || 'Not specified',
        crif: card.crif || 'Not specified'
      };
    }

    console.log('📊 Extracted data for', card.name, ':', extracted);
    return extracted;
  }

  // Build comprehensive system prompt with RAG-enhanced context
  private buildSystemPrompt(context: any): string {
    const { platforms, selectedFormat, cardData, tone, ragResults } = context;
    
    let systemPrompt = `You are a professional financial content creator specializing in credit card content. You create engaging, accurate, and informative content that follows best practices for social media platforms.

IMPORTANT: Always respond with valid JSON format containing content for each platform.

CONTEXT:
- Selected Cards: ${cardData?.map(card => card.name).join(', ') || 'None specified'}
- Tone: ${tone}
- Format: ${selectedFormat?.name || 'Standard'}

RAG-ENHANCED CARD DATA:`;

    // Add RAG search results
    if (ragResults && ragResults.length > 0) {
      ragResults.forEach((result: RAGSearchResult) => {
        const eligibility = result.extractedData.eligibility;
        const eligibilityText = eligibility && typeof eligibility === 'object' && eligibility !== null ? 
          `Age: ${(eligibility as any).age || 'Not specified'}, Income: ${(eligibility as any).income_salaried || 'Not specified'}` : 
          'Not specified';

        systemPrompt += `

${result.cardName} (${result.bankName}):
- Joining Fee: ${result.extractedData.joining_fee || 'Not specified'}
- Annual Fee: ${result.extractedData.annual_fee || 'Not specified'}
- Reward Rate: ${result.extractedData.reward_rate || 'Not specified'}
- Key Features: ${result.extractedData.key_features?.join(', ') || 'Not specified'}
- Benefits: ${result.extractedData.benefits?.join(', ') || 'Not specified'}
- Eligibility: ${eligibilityText}`;
      });
    }

    // Add platform-specific guidelines
    systemPrompt += `

PLATFORM GUIDELINES:`;

    platforms.forEach((platform: string) => {
      const platformKey = platform.toLowerCase();
      const guidelines = PLATFORM_GUIDELINES[platformKey as keyof typeof PLATFORM_GUIDELINES];
      
      if (guidelines) {
        systemPrompt += `

${platform.toUpperCase()}:
- Tone: ${guidelines.tone}
- Max Length: ${guidelines.maxLength} characters
- Emoji Usage: ${guidelines.emojiUsage}
- Hashtag Count: ${guidelines.hashtagCount}
- Content Style: ${guidelines.contentStyle}
- Call to Action: ${guidelines.callToAction}`;

        // Add format-specific guidelines
        if (selectedFormat && guidelines.formatGuidelines[selectedFormat.id as keyof typeof guidelines.formatGuidelines]) {
          const formatGuidelines = guidelines.formatGuidelines[selectedFormat.id as keyof typeof guidelines.formatGuidelines];
          if (formatGuidelines && typeof formatGuidelines === 'object' && 'structure' in formatGuidelines) {
            systemPrompt += `
- Format Structure: ${(formatGuidelines as any).structure}`;
          }
        }
      }
    });

    systemPrompt += `

INSTRUCTIONS:
1. Use the RAG-enhanced card data provided to create accurate, specific content
2. If the user asks about specific information (like joining fees), use the exact data provided
3. If specific information is not available in the RAG data, use your knowledge to provide general information
4. Follow platform-specific guidelines for tone, length, and style
5. Include relevant hashtags appropriate for each platform
6. Make content engaging and actionable
7. Always maintain accuracy and avoid misleading information
8. If the user asks about specific card features, prioritize the RAG-extracted data

RESPONSE FORMAT:
Return a JSON object with content for each platform:
{
  "linkedin": "content for LinkedIn",
  "twitter": "content for Twitter", 
  "instagram": "content for Instagram",
  "youtube": "content for YouTube"
}`;

    return systemPrompt;
  }

  // Build user prompt with specific request and RAG context
  private buildUserPrompt(prompt: string, context: any): string {
    const { platforms, selectedFormat, ragResults } = context;
    
    let userPrompt = `Create content for the following request:

USER REQUEST: ${prompt}

PLATFORMS: ${platforms.join(', ')}
FORMAT: ${selectedFormat?.name || 'Standard'}

RAG-ENHANCED CONTEXT:
The following information has been extracted from the selected credit cards based on your request:`;

    if (ragResults && ragResults.length > 0) {
      ragResults.forEach((result: RAGSearchResult) => {
        userPrompt += `

${result.cardName}:
${result.relevantInfo.map(info => `- ${info.field}: ${info.value}`).join('\n')}`;
      });
    }

    userPrompt += `

SPECIFIC REQUIREMENTS:
- Focus on the information extracted from the RAG search
- If the user asks about specific card features (like joining fees, rewards, etc.), use the exact data provided
- If information is not available in the RAG data, provide general information based on your knowledge
- Make the content platform-appropriate and engaging
- Include relevant hashtags and calls-to-action
- Ensure all information is accurate and up-to-date

Please generate content that addresses the user's specific request while following all platform guidelines and using the RAG-enhanced data.`;

    return userPrompt;
  }

  // Generate mock content for development/testing
  private generateMockContent(context: any): string {
    const { platforms, cardData, selectedFormat } = context;
    
    const mockContent: any = {};
    
    platforms.forEach((platform: string) => {
      const platformKey = platform.toLowerCase();
      const guidelines = PLATFORM_GUIDELINES[platformKey as keyof typeof PLATFORM_GUIDELINES];
      
      if (guidelines) {
        const cardNames = cardData?.map((card: CardData) => card.name).join(', ') || 'selected credit cards';
        
        switch (platformKey) {
          case 'linkedin':
            mockContent.linkedin = `🚀 Exciting insights on ${cardNames}! 

After analyzing the latest credit card offerings, I've discovered some compelling opportunities for financial optimization. These cards offer competitive rewards structures and valuable benefits that can significantly impact your spending strategy.

Key highlights:
• Strategic reward optimization
• Enhanced travel benefits
• Competitive fee structures

The right credit card choice can transform your financial journey. Ready to explore these opportunities?

#CreditCards #FinancialOptimization #Rewards #MoneyMatters`;
            break;
            
          case 'twitter':
            mockContent.twitter = `💳 Just analyzed ${cardNames} - here's what you need to know! 

🔥 Competitive rewards
✈️ Travel perks included  
🎁 Valuable sign-up bonuses

Your wallet deserves an upgrade! 👇

#CreditCards #Rewards #Finance`;
            break;
            
          case 'instagram':
            mockContent.instagram = `💳✨ Your credit card upgrade guide is here! 

Discovering ${cardNames} has been a game-changer! 🚀

🔥 What I love:
• Generous reward structures
• Travel benefits that actually work
• Competitive annual fees

💡 Pro tip: Always compare the fine print and choose cards that match your spending patterns!

Ready to level up your financial game? 💪

#CreditCards #FinancialFreedom #Rewards #MoneyGoals #FinanceTips`;
            break;
            
          case 'youtube':
            mockContent.youtube = `🎥 Complete Guide to ${cardNames}

In this comprehensive review, I'll walk you through everything you need to know about these credit cards, from rewards structures to eligibility requirements.

What we'll cover:
• Detailed card comparisons
• Reward optimization strategies
• Application tips and tricks
• Real-world usage scenarios

Don't forget to like and subscribe for more financial insights! 🔔

#CreditCards #FinancialEducation #Rewards #MoneyTips`;
            break;
        }
      }
    });
    
    return JSON.stringify(mockContent);
  }

  // Enhanced card data fetching with detailed information
  async getCardsForSelection(): Promise<any[]> {
    console.log('🔍 Fetching detailed cards from BankKaro API...');
    
    try {
      const response = await fetch(`${this.baseURL}/cards`, {
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
        throw new Error(`BankKaro API error: ${response.status}`);
      }

      const data = await response.json();
      const cards = Array.isArray(data) ? data : data.cards || data.data?.cards || [];
      
      console.log('📋 Detailed cards fetched:', cards.length);
      return cards;
    } catch (error) {
      console.error('❌ Error fetching cards:', error);
      
      // Return enhanced mock cards
      return [
        {
          id: 'mock-card-1',
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
          exclusion_earnings: 'Government transactions, cash advances',
          image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Regalia'
        },
        {
          id: 'mock-card-2',
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
          exclusion_earnings: 'Government transactions, cash advances',
          image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+SimplyCLICK'
        }
      ];
    }
  }

  // Enhanced content generation with RAG
  async generateContent(request: ContentCreationRequest): Promise<GeneratedContent> {
    console.log('🚀 Enhanced RAG content generation starting...');
    console.log('📋 Request details:', {
      platforms: request.platforms,
      selectedCards: request.selectedCards,
      tone: request.tone,
      prompt: request.prompt,
      format: request.selectedFormat
    });

    try {
      // Perform RAG search to get detailed card data
      const ragResults = await this.performRAGSearch(request.prompt, request.selectedCards);

      // Fetch detailed card data for RAG
      const allCards = await this.getCardsForSelection();
      const cardData: CardData[] = request.selectedCards.map(cardId => {
        const card = allCards.find(c => c.id === cardId);
        return card ? {
          id: card.id,
          name: card.name,
          seo_card_alias: card.seo_card_alias,
          bank_name: card.bank_name,
          card_network: card.card_network,
          annual_fee: card.annual_fee,
          joining_fee: card.joining_fee,
          key_features: card.key_features || [],
          benefits: card.benefits || [],
          reward_conversion_rate: card.reward_conversion_rate,
          redemption_options: card.redemption_options,
          age_criteria: card.age_criteria,
          income_salaried: card.income_salaried,
          income_self_emp: card.income_self_emp,
          crif: card.crif,
          crif_self_emp: card.crif_self_emp,
          exclusion_spends: card.exclusion_spends,
          exclusion_earnings: card.exclusion_earnings,
          product_usps: card.product_usps,
          tags: card.tags,
          image: card.image
        } : null;
      }).filter(Boolean) as CardData[];

      console.log('📊 Card data prepared for RAG:', cardData.length, 'cards');

      // Prepare context for RAG
      const context = {
        platforms: request.platforms,
        selectedFormat: request.selectedFormat,
        cardData,
        tone: request.tone,
        ragResults // Pass RAG results to the context
      };

      // Generate content using RAG
      const contentResponse = await this.makeOpenAIRequest(request.prompt, context);
      
      let rawContent: { [platform: string]: string };
      try {
        rawContent = JSON.parse(contentResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response:', parseError);
        // Fallback to mock content
        rawContent = JSON.parse(this.generateMockContent(context));
      }

      // Map platform names from API response to display names
      const content: { [platform: string]: string } = {};
      const platformMapping: { [key: string]: string } = {
        'linkedin': 'LinkedIn',
        'twitter': 'X (Twitter)',
        'instagram': 'Instagram',
        'youtube': 'YouTube'
      };

      Object.entries(rawContent).forEach(([platformKey, contentText]) => {
        const displayName = platformMapping[platformKey] || platformKey;
        content[displayName] = contentText;
      });

      console.log('🔧 Platform mapping applied:', {
        rawContent: Object.keys(rawContent),
        mappedContent: Object.keys(content)
      });

      // Create references from card data
      const references: ContentReference[] = cardData.map(card => ({
        text: `${card.name} - ${card.bank_name}`,
        source: 'BankKaro API',
        cardName: card.name
      }));

      const generatedContent: GeneratedContent = {
        id: `content-${Date.now()}`,
        platforms: request.platforms,
        content,
        references,
        tone: request.tone,
        prompt: request.prompt,
        selectedCards: request.selectedCards,
        selectedFormat: request.selectedFormat,
        cardData,
        createdAt: new Date(),
        status: 'draft'
      };

      console.log('✅ RAG-enhanced content generated successfully');
      this.saveToHistory(generatedContent);
      this.saveGeneratedContent(generatedContent);
      
      return generatedContent;
    } catch (error) {
      console.error('❌ Enhanced content generation error:', error);
      throw error;
    }
  }

  async analyzeTone(text: string): Promise<ToneAnalysis> {
    // Get API key from the service (with fallback to environment variable)
    const openaiApiKey = await supabaseApiKeyService.getOpenAIKey();
    
    if (!openaiApiKey) {
      // Return mock tone analysis for development/testing
      console.warn('OpenAI API key not configured. Using mock tone analysis.');
      return {
        tone: 'professional',
        confidence: 0.8,
        suggestions: ['Consider adding more personal anecdotes', 'Include specific examples', 'Add a clear call-to-action']
      };
    }

    const prompt = `Analyze the tone of the following text and provide a detailed analysis. Return the response as JSON with fields: tone (string), confidence (number 0-1), suggestions (array of strings).

Text: "${text}"

Focus on identifying if the tone is professional, casual, humorous, educational, promotional, or any other relevant tone for financial content.`;

    try {
      const response = await this.makeOpenAIRequest(prompt, {}); // No context needed for tone analysis
      const analysis = JSON.parse(response);
      return {
        tone: analysis.tone || 'neutral',
        confidence: analysis.confidence || 0.5,
        suggestions: analysis.suggestions || []
      };
    } catch (error) {
      console.error('Tone analysis error:', error);
      return {
        tone: 'neutral',
        confidence: 0.5,
        suggestions: ['Unable to analyze tone automatically']
      };
    }
  }

  async scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
    // Note: This is a placeholder implementation
    // In a real implementation, you would need to use a proper LinkedIn scraping service
    // or implement browser automation with proper authentication
    
    console.log('LinkedIn scraping would be implemented here for:', profileUrl);
    
    // For now, return mock data
    return {
      posts: [
        "Just discovered an amazing credit card with 5% cashback on dining!",
        "Here's why you should consider upgrading your credit card this year...",
        "The best travel credit cards for 2024 - my top picks!"
      ],
      tone: 'professional',
      engagement: 85,
      followers: 1200
    };
  }

  async scrapeInstagramProfile(profileUrl: string): Promise<LinkedInProfile> {
    // Note: This is a placeholder implementation
    // In a real implementation, you would need to use Instagram's API or scraping service
    
    console.log('Instagram scraping would be implemented here for:', profileUrl);
    
    // For now, return mock data
    return {
      posts: [
        "💳✨ Your wallet upgrade is here! Discovering these credit cards has been a game-changer! 🚀",
        "🔥 Pro tip: Always read the fine print and choose cards that match your spending habits! 💡",
        "Ready to level up your financial game? These cards are everything! 💪 #CreditCards #FinancialFreedom"
      ],
      tone: 'casual',
      engagement: 92,
      followers: 2500
    };
  }

  async scrapeTwitterProfile(profileUrl: string): Promise<LinkedInProfile> {
    // Note: This is a placeholder implementation
    // In a real implementation, you would need to use Twitter's API or scraping service
    
    console.log('Twitter scraping would be implemented here for:', profileUrl);
    
    // For now, return mock data
    return {
      posts: [
        "💳 Just found the BEST credit cards for 2024! 5% cashback on dining, travel perks galore! 🔥",
        "Your wallet deserves an upgrade! These cards are game-changers! 👇 #CreditCards #Rewards",
        "Pro tip: Always check the annual fees and reward rates before applying! 💡 #FinanceTips"
      ],
      tone: 'conversational',
      engagement: 78,
      followers: 1800
    };
  }

  async scrapeYouTubeProfile(profileUrl: string): Promise<LinkedInProfile> {
    // Note: This is a placeholder implementation
    // In a real implementation, you would need to use YouTube's API or scraping service
    
    console.log('YouTube scraping would be implemented here for:', profileUrl);
    
    // For now, return mock data
    return {
      posts: [
        "In this video, I'm sharing the top 5 credit cards that will maximize your rewards in 2024!",
        "Don't miss this comprehensive guide to choosing the right credit card for your lifestyle!",
        "Here's everything you need to know about credit card rewards and how to use them effectively!"
      ],
      tone: 'educational',
      engagement: 95,
      followers: 5000
    };
  }

  async scheduleContent(contentId: string, scheduledFor: Date): Promise<void> {
    // In a real implementation, this would save to a database and set up a cron job
    console.log(`Scheduling content ${contentId} for ${scheduledFor}`);
    
    // Update history
    const content = this.contentHistory.find(c => c.id === contentId);
    if (content) {
      content.status = 'scheduled';
      content.lastModified = new Date();
    }
    
    // Also update the generated content if it exists in memory
    const generatedContent = this.findGeneratedContent(contentId);
    if (generatedContent) {
      generatedContent.status = 'scheduled';
      generatedContent.scheduledFor = scheduledFor;
    }
  }

  async saveDraft(content: GeneratedContent): Promise<void> {
    content.status = 'draft';
    this.saveToHistory(content);
    this.saveGeneratedContent(content);
  }

  async publishContent(contentId: string): Promise<void> {
    // In a real implementation, this would integrate with social media APIs
    console.log(`Publishing content ${contentId} to social media platforms`);
    
    // Simulate publishing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update history
    const content = this.contentHistory.find(c => c.id === contentId);
    if (content) {
      content.status = 'published';
      content.lastModified = new Date();
    }
    
    // Also update the generated content if it exists in memory
    const generatedContent = this.findGeneratedContent(contentId);
    if (generatedContent) {
      generatedContent.status = 'published';
    }
  }

  private generatedContents: GeneratedContent[] = [];

  private saveGeneratedContent(content: GeneratedContent): void {
    const existingIndex = this.generatedContents.findIndex(c => c.id === content.id);
    if (existingIndex >= 0) {
      this.generatedContents[existingIndex] = content;
    } else {
      this.generatedContents.push(content);
    }
  }

  private findGeneratedContent(contentId: string): GeneratedContent | undefined {
    return this.generatedContents.find(c => c.id === contentId);
  }

  async getContentHistory(): Promise<ContentHistory[]> {
    return this.contentHistory;
  }

  async getDraft(id: string): Promise<GeneratedContent | null> {
    // In a real implementation, this would fetch from a database
    const content = this.contentHistory.find(c => c.id === id);
    if (content) {
      // Return mock content for now
      return {
        id: content.id,
        platforms: content.platforms,
        content: {
          'LinkedIn': 'Sample LinkedIn content...',
          'X (Twitter)': 'Sample Twitter content...',
          'Instagram': 'Sample Instagram content...'
        },
        references: [],
        tone: 'professional',
        prompt: 'Sample prompt',
        selectedCards: [],
        createdAt: content.createdAt,
        status: content.status
      };
    }
    return null;
  }

  private saveToHistory(content: GeneratedContent): void {
    const historyItem: ContentHistory = {
      id: content.id,
      title: `Content for ${content.platforms.join(', ')}`,
      platforms: content.platforms,
      createdAt: content.createdAt,
      lastModified: new Date(),
      status: content.status
    };

    const existingIndex = this.contentHistory.findIndex(c => c.id === content.id);
    if (existingIndex >= 0) {
      this.contentHistory[existingIndex] = historyItem;
    } else {
      this.contentHistory.push(historyItem);
    }
  }

  async exportContent(content: GeneratedContent, format: 'txt' | 'pdf' | 'json'): Promise<string> {
    switch (format) {
      case 'txt':
        return this.exportAsText(content);
      case 'json':
        return JSON.stringify(content, null, 2);
      case 'pdf':
        return this.exportAsPDF(content);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportAsText(content: GeneratedContent): string {
    let text = `Content Export\n`;
    text += `Generated: ${content.createdAt.toLocaleString()}\n`;
    text += `Platforms: ${content.platforms.join(', ')}\n`;
    text += `Tone: ${content.tone}\n\n`;

    Object.entries(content.content).forEach(([platform, platformContent]) => {
      text += `${platform.toUpperCase()}:\n`;
      text += `${platformContent}\n\n`;
    });

    if (content.references.length > 0) {
      text += `References:\n`;
      content.references.forEach(ref => {
        text += `- ${ref.text} (${ref.source})\n`;
      });
    }

    return text;
  }

  private exportAsPDF(content: GeneratedContent): string {
    // In a real implementation, this would generate a PDF
    // For now, return a placeholder
    return 'PDF export would be implemented here';
  }
}

export const contentCreationService = new ContentCreationService(); 