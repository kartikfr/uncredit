
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, X, Loader2, Bot, User } from "lucide-react";
import { Card, cardService } from '@/services/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIWidgetProps {
  showAIWidget: boolean;
  onClose: () => void;
  selectedCard: Card | null;
}

export const AIWidget = ({ showAIWidget, onClose, selectedCard }: AIWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset messages when card changes
  useEffect(() => {
    if (selectedCard) {
      setMessages([{
        id: '1',
        content: `Hi! I'm your AI assistant for the ${selectedCard.name}. I have all the information about this card including fees, features, benefits, and more. Ask me anything!`,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [selectedCard]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatCardContext = (card: Card): string => {
    return `
Card Information:
- Name: ${card.name}
- Bank: ${card.bank_name}
- Type: ${card.card_type}
- Network: ${card.card_network}
- Rating: ${card.rating}/5 (${card.user_rating_count} reviews)
- Joining Fee: ${card.joining_fee_text || card.joining_fee}
- Annual Fee: ${card.annual_fee_text || card.annual_fee}


Key Features: ${card.key_features?.join(', ') || 'N/A'}

Benefits: ${card.benefits?.join(', ') || 'N/A'}

Age Criteria: ${card.age_criteria || 'N/A'}

Rewards Structure:
${card.rewards ? Object.entries(card.rewards).map(([category, value]) => `- ${category}: ${value}`).join('\n') : 'N/A'}

Lounge Access: ${card.lounge_access ? `Domestic: ${card.lounge_access.domestic ? 'Yes' : 'No'}, International: ${card.lounge_access.international ? 'Yes' : 'No'}, Count: ${card.lounge_access.count}` : 'N/A'}

Insurance: ${card.insurance ? `Travel: ${card.insurance.travel ? 'Yes' : 'No'}, Health: ${card.insurance.health ? 'Yes' : 'No'}, Life: ${card.insurance.life ? 'Yes' : 'No'}` : 'N/A'}

Exclusion Spends: ${card.exclusion_spends || 'N/A'}

Tags: ${Array.isArray(card.tags) ? card.tags.join(', ') : 'N/A'}
    `.trim();
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedCard || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const cardContext = formatCardContext(selectedCard);
      
      // Call OpenAI API for real AI responses
      const aiResponse = await callOpenAI(userMessage.content, cardContext, selectedCard.name);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Secure OpenAI API integration via Supabase Edge Function
  const callOpenAI = async (message: string, cardContext: string, cardName: string): Promise<string> => {
    try {
      // First, get additional data from Card Genius API using seo_card_alias
      const cardGeniusData = await getCardGeniusData(selectedCard.seo_card_alias);
      
      // Call Supabase Edge Function instead of OpenAI directly
      const response = await fetch('https://yurfpubenqaotwnemuwg.supabase.co/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmZwdWJlbnFhb3R3bmVtdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTY2MDYsImV4cCI6MjA2NzYzMjYwNn0.0YY2TikwGgBJC7FsubXGB28uEoCLv40UaZiAxG4UxyQ`,
        },
        body: JSON.stringify({
          message,
          cardContext,
          cardName,
          cardGeniusData
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase Edge Function error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Supabase Edge Function error:', error);
      // Fallback to mock response if Supabase fails
      return generateMockAIResponse(message, cardContext, cardName);
    }
  };  
  // Get additional data from Card Genius API
  const getCardGeniusData = async (seoCardAlias: string | undefined): Promise<string> => {
    if (!seoCardAlias) {
      return 'No Card Genius data available (missing seo_card_alias)';
    }

    try {
      const spendingData = {
        amazon_spends: 1280,
        flipkart_spends: 10000,
        grocery_spends_online: 7500,
        online_food_ordering: 5000,
        other_online_spends: 3000,
        other_offline_spends: 5000,
        dining_or_going_out: 5000,
        fuel: 5000,
        school_fees: 20000,
        rent: 35000,
        mobile_phone_bills: 1500,
        electricity_bills: 7500,
        water_bills: 2500,
        ott_channels: 1000,
        new_monthly_cat_1: 0,
        new_monthly_cat_2: 0,
        new_monthly_cat_3: 0,
        hotels_annual: 75000,
        flights_annual: 75000,
        insurance_health_annual: 75000,
        insurance_car_or_bike_annual: 45000,
        large_electronics_purchase_like_mobile_tv_etc: 100000,
        all_pharmacy: 99,
        new_cat_1: 0,
        new_cat_2: 0,
        new_cat_3: 0,
        domestic_lounge_usage_quarterly: 20,
        international_lounge_usage_quarterly: 13,
        railway_lounge_usage_quarterly: 1,
        movie_usage: 3,
        movie_mov: 600,
        dining_usage: 3,
        dining_mov: 1500,
        selected_card_id: null
      };

      const cardGeniusCard = await cardService.getCardGeniusDataForCard(seoCardAlias, spendingData);

      if (!cardGeniusCard) {
        return `Card Genius data not found for seo_card_alias: ${seoCardAlias}`;
      }

      // Format Card Genius data
      return formatCardGeniusData(cardGeniusCard);
    } catch (error) {
      console.error('Error fetching Card Genius data:', error);
      return `Error fetching Card Genius data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  // Format Card Genius API data
  const formatCardGeniusData = (cardGeniusCard: any): string => {
    let formattedData = '';

    // Basic card info
    if (cardGeniusCard.card_name) {
      formattedData += `Card Genius Name: ${cardGeniusCard.card_name}\n`;
    }

    // Travel benefits
    if (cardGeniusCard.travel_benefits) {
      formattedData += '\nTravel Benefits:\n';
      const travel = cardGeniusCard.travel_benefits;
      
      if (travel.domestic_lounges_unlocked !== undefined) {
        formattedData += `- Domestic Lounges: ${travel.domestic_lounges_unlocked ? 'Yes' : 'No'}\n`;
      }
      if (travel.international_lounges_unlocked !== undefined) {
        formattedData += `- International Lounges: ${travel.international_lounges_unlocked ? 'Yes' : 'No'}\n`;
      }
      if (travel.railway_lounges_unlocked !== undefined) {
        formattedData += `- Railway Lounges: ${travel.railway_lounges_unlocked ? 'Yes' : 'No'}\n`;
      }
      if (travel.movie_benefits_unlocked !== undefined) {
        formattedData += `- Movie Benefits: ${travel.movie_benefits_unlocked ? 'Yes' : 'No'}\n`;
      }
      if (travel.dining_benefits_unlocked !== undefined) {
        formattedData += `- Dining Benefits: ${travel.dining_benefits_unlocked ? 'Yes' : 'No'}\n`;
      }
    }

    // Rewards structure
    if (cardGeniusCard.rewards_structure) {
      formattedData += '\nDetailed Rewards Structure:\n';
      const rewards = cardGeniusCard.rewards_structure;
      
      Object.entries(rewards).forEach(([category, value]) => {
        if (value && typeof value === 'object' && 'rate' in value) {
          formattedData += `- ${category}: ${value.rate}${value.unit || '%'}\n`;
        } else if (value) {
          formattedData += `- ${category}: ${value}\n`;
        }
      });
    }

    // Spending categories
    if (cardGeniusCard.spending_categories) {
      formattedData += '\nSpending Categories:\n';
      const categories = cardGeniusCard.spending_categories;
      
      Object.entries(categories).forEach(([category, value]) => {
        if (value && typeof value === 'object' && 'rate' in value) {
          formattedData += `- ${category}: ${value.rate}${value.unit || '%'}\n`;
        } else if (value) {
          formattedData += `- ${category}: ${value}\n`;
        }
      });
    }

    // Additional benefits
    if (cardGeniusCard.additional_benefits) {
      formattedData += '\nAdditional Benefits:\n';
      const benefits = cardGeniusCard.additional_benefits;
      
      Object.entries(benefits).forEach(([benefit, value]) => {
        if (value) {
          formattedData += `- ${benefit}: ${value}\n`;
        }
      });
    }

    // Fees and charges
    if (cardGeniusCard.fees_and_charges) {
      formattedData += '\nFees and Charges:\n';
      const fees = cardGeniusCard.fees_and_charges;
      
      Object.entries(fees).forEach(([fee, value]) => {
        if (value) {
          formattedData += `- ${fee}: ${value}\n`;
        }
      });
    }

    // Eligibility criteria
    if (cardGeniusCard.eligibility_criteria) {
      formattedData += '\nEligibility Criteria:\n';
      const eligibility = cardGeniusCard.eligibility_criteria;
      
      Object.entries(eligibility).forEach(([criteria, value]) => {
        if (value) {
          formattedData += `- ${criteria}: ${value}\n`;
        }
      });
    }

    // Annual savings calculation
    if (cardGeniusCard.annual_savings) {
      formattedData += `\nAnnual Savings: ₹${cardGeniusCard.annual_savings}\n`;
    }

    // Card score
    if (cardGeniusCard.card_score) {
      formattedData += `Card Score: ${cardGeniusCard.card_score}/100\n`;
    }

    return formattedData || 'No additional Card Genius data available';
  };

  // Mock AI response function (fallback)
  const generateMockAIResponse = (userMessage: string, cardContext: string, cardName: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('joining fee') || message.includes('joining')) {
      const feeMatch = cardContext.match(/Joining Fee: ([^\n]+)/);
      const fee = feeMatch ? feeMatch[1] : 'information not available';
      return `The joining fee for ${cardName} is ${fee}. This is a one-time fee charged when you first get the card.`;
    }
    
    if (message.includes('annual fee') || message.includes('yearly fee')) {
      const feeMatch = cardContext.match(/Annual Fee: ([^\n]+)/);
      const fee = feeMatch ? feeMatch[1] : 'information not available';
      return `The annual fee for ${cardName} is ${fee}. This fee is charged every year to maintain your card membership.`;
    }
    
    if (message.includes('reward') || message.includes('cashback') || message.includes('points')) {
      const rewardsMatch = cardContext.match(/Rewards Structure:\n([\s\S]*?)(?=\n\n|$)/);
      if (rewardsMatch && rewardsMatch[1] !== 'N/A') {
        return `Here are the rewards for ${cardName}:\n${rewardsMatch[1]}\n\nThese rewards help you earn benefits on your everyday spending!`;
      } else {
        return `The ${cardName} offers various rewards and benefits. You can earn rewards on shopping, dining, fuel, and other categories. Check the key features for specific details.`;
      }
    }
    
    if (message.includes('lounge') || message.includes('airport')) {
      const loungeMatch = cardContext.match(/Lounge Access: ([^\n]+)/);
      const lounge = loungeMatch ? loungeMatch[1] : 'information not available';
      return `Lounge access for ${cardName}: ${lounge}. This allows you to access airport lounges for a more comfortable travel experience.`;
    }
    
    if (message.includes('feature') || message.includes('benefit')) {
      const featuresMatch = cardContext.match(/Key Features: ([^\n]+)/);
      const benefitsMatch = cardContext.match(/Benefits: ([^\n]+)/);
      
      let response = `Here are the key features and benefits of ${cardName}:\n\n`;
      
      if (featuresMatch && featuresMatch[1] !== 'N/A') {
        response += `**Key Features:** ${featuresMatch[1]}\n\n`;
      }
      
      if (benefitsMatch && benefitsMatch[1] !== 'N/A') {
        response += `**Benefits:** ${benefitsMatch[1]}`;
      }
      
      return response;
    }
    
    if (message.includes('eligibility') || message.includes('age') || message.includes('income')) {
      const ageMatch = cardContext.match(/Age Criteria: ([^\n]+)/);
      const age = ageMatch ? ageMatch[1] : 'information not available';
      return `Eligibility criteria for ${cardName}:\n- Age requirement: ${age}\n\nPlease note that specific income requirements and credit score criteria may apply. It's best to check with the bank for the most current eligibility information.`;
    }
    
    if (message.includes('insurance') || message.includes('protection')) {
      const insuranceMatch = cardContext.match(/Insurance: ([^\n]+)/);
      const insurance = insuranceMatch ? insuranceMatch[1] : 'information not available';
      return `Insurance coverage for ${cardName}: ${insurance}. These insurance benefits provide additional protection for your purchases and travel.`;
    }
    
    if (message.includes('network') || message.includes('visa') || message.includes('mastercard')) {
      const networkMatch = cardContext.match(/Network: ([^\n]+)/);
      const network = networkMatch ? networkMatch[1] : 'information not available';
      return `The ${cardName} is issued on the ${network} network. This means you can use it anywhere ${network} cards are accepted worldwide.`;
    }
    
    if (message.includes('rating') || message.includes('review')) {
      const ratingMatch = cardContext.match(/Rating: ([^\n]+)/);
      const rating = ratingMatch ? ratingMatch[1] : 'information not available';
      return `The ${cardName} has a ${rating}. This rating is based on user reviews and feedback from cardholders.`;
    }
    
    // Default response for other questions
    return `I have comprehensive information about the ${cardName}. You can ask me about:\n\n• Joining and annual fees\n• Rewards and cashback\n• Lounge access\n• Insurance benefits\n• Eligibility criteria\n• Card features and benefits\n• Network acceptance\n• User ratings\n\nWhat specific aspect would you like to know more about?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!showAIWidget || !selectedCard) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-elevated z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">Ask me anything about</h3>
            <p className="text-xs text-muted-foreground font-medium truncate max-w-48">
              {selectedCard.name}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'ai' && (
                  <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.sender === 'user' && (
                  <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about fees, features, benefits..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
