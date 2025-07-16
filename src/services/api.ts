// API Service Layer for UnCredit
export interface CardFilters {
  slug?: string;
  banks_ids?: string[];
  card_networks?: string[];
  annualFees?: string;
  credit_score?: string;
  sort_by?: string;
  free_cards?: string;
  eligiblityPayload?: any;
  cardGeniusPayload?: any;
  lounges?: string[];
  exclude_points?: boolean;
  joining_fee?: string;
  card_type?: string;
  user_rating_count?: number;
  rating?: number;
  commission?: string;
  // Advanced filter fields
  age_criteria?: string;
  age_min?: number; // New field for minimum age filter
  age_max?: number; // New field for maximum age filter
  joining_fee_text?: string;
  annual_fee_text?: string;
  selected_tags?: string[]; // New field for multi-select tag filtering
  card_types?: string[]; // New field for multi-select card type filtering
  joining_fee_min?: number; // New field for min joining fee
  joining_fee_max?: number; // New field for max joining fee
  annual_fee_min?: number; // New field for min annual fee
  annual_fee_max?: number; // New field for max annual fee
  // Card Genius API filters
  domestic_lounges_min?: number; // New field for minimum domestic lounges
  international_lounges_min?: number; // New field for minimum international lounges
  spending_categories?: string[]; // New field for multi-select spending categories
  eligibleAliases?: string[]; // For eligibility API filtering
  joining_fee_free?: boolean; // Special flag for free joining fee
  annual_fee_free?: boolean; // Special flag for free annual fee
}

export interface Card {
  id: string;
  name: string;
  card_type: string;
  user_rating_count: number;
  rating: number;
  commission: string;
  image: string;
  joining_fee_text: string;
  bank_name: string;
  card_network: string;
  annual_fee: string;
  annual_fee_text?: string;
  joining_fee: string;
  joining_fee_offset?: string; // New field for description mapping
  key_features: string[];
  benefits: string[];
  seo_card_alias?: string; // Add this field for Card Genius mapping
  tags?: string[]; // New field for card tags
  product_usps?: (string | { header?: string; name?: string; comment?: string })[]; // New field for product USPs
  annual_fee_comment?: string;
  reward_conversion_rate?: string;
  redemption_options?: string;
  redemption_catalogue?: string; // New field for redemption catalogue
  exclusion_earnings?: string;
  exclusion_spends?: string;
  age_criteria?: string; // New field for age criteria (e.g., "21-60")
  age_criteria_comment?: string;
  // Additional eligibility fields
  age_self_emp?: string; // Age criteria for self-employed
  crif?: string; // Credit score for salaried
  crif_self_emp?: string; // Credit score for self-employed
  income_salaried?: string; // Income criteria for salaried
  income_self_emp?: string; // Income criteria for self-employed
  annual_fee_waiver?: string; // Annual fee waiver information
  eligibility?: {
    age_min: number;
    age_max: number;
    income_min: number;
    credit_score_min: number;
  };
  rewards?: {
    shopping: string;
    dining: string;
    fuel: string;
    travel: string;
    grocery: string;
    utility: string;
  };
  lounge_access?: {
    domestic: boolean;
    international: boolean;
    count: number;
  };
  insurance?: {
    travel: boolean;
    health: boolean;
    life: boolean;
  };
}

export interface CardDetail extends Card {
  detailed_features: string[];
  terms_conditions: string[];
  how_to_apply: string[];
  documents_required: string[];
  fees_charges: {
    annual_fee: string;
    joining_fee: string;
    interest_rate: string;
    late_fee: string;
    cash_advance_fee: string;
  };
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class CardService {
  private baseURL = 'https://bk-api.bankkaro.com/sp/api';
  private cardRecommendationURL = 'https://card-recommendation-api-v2.bankkaro.com/cg/api/pro';

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    console.log('API Service: Making request to:', url);
    console.log('API Service: Request options:', options);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('API Service: Response status:', response.status);
      console.log('API Service: Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Response error text:', errorText);
        throw new ApiError(response.status, `HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Service: Parsed response data:', data);
      return data;
    } catch (error) {
      console.error('API Service: Network error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCards(filters: CardFilters = {}): Promise<Card[]> {
    console.log('API Service: Getting cards with filters:', filters);
    const payload = {
      slug: filters.slug || "",
      banks_ids: filters.banks_ids || [],
      card_networks: filters.card_networks || [],
      annualFees: filters.annualFees || "",
      credit_score: filters.credit_score || "",
      sort_by: filters.sort_by || "",
      free_cards: filters.free_cards || "",
      eligiblityPayload: filters.eligiblityPayload || {},
      cardGeniusPayload: filters.cardGeniusPayload || {},
    };

    console.log('API Service: Sending payload:', payload);
    console.log('API Service: URL:', `${this.baseURL}/cards`);

    try {
      const data = await this.makeRequest(`${this.baseURL}/cards`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('API Service: Response received:', data);
      
      let cards: Card[] = [];
      // Handle all possible response structures
      if (Array.isArray(data)) {
        cards = data;
      } else if (data.cards) {
        cards = data.cards;
      } else if (data.data && Array.isArray(data.data.cards)) {
        cards = data.data.cards;
      }

      // Always use Card Genius filtering if either filter is defined
      if (filters.domestic_lounges_min !== undefined || filters.international_lounges_min !== undefined) {
        console.log('API Service: Applying Card Genius filtering for lounges:', filters);
        console.log('API Service: Total BankKaro cards before filtering:', cards.length);
        
        // Log some BankKaro cards to see their seo_card_alias structure
        console.log('API Service: First 3 BankKaro cards seo_card_alias:', cards.slice(0, 3).map(card => card.seo_card_alias));
        
        try {
          const filteredCardAliases = await this.getFilteredCardsFromCardGenius(filters);
          console.log('API Service: Card Genius filtered aliases:', filteredCardAliases);
          
          if (filteredCardAliases.length > 0) {
            // Log all BankKaro seo_card_alias values
            const allBankKaroAliases = cards.map(card => card.seo_card_alias).filter(Boolean);
            console.log('API Service: All BankKaro seo_card_alias values:', allBankKaroAliases);
            console.log('API Service: Card Genius filtered aliases:', filteredCardAliases);

            // Find intersection
            const matchedAliases = allBankKaroAliases.filter(alias => filteredCardAliases.includes(alias));
            console.log('API Service: Matched aliases (intersection):', matchedAliases);

            // Filter BankKaro cards to only include those whose seo_card_alias matches
            const filteredCards = cards.filter(card => matchedAliases.includes(card.seo_card_alias));
            console.log('API Service: Final filtered cards count:', filteredCards.length);

            if (filteredCards.length === 0) {
              console.warn('API Service: No BankKaro cards matched the Card Genius filter.');
            }

            return filteredCards;
          } else {
            console.log('API Service: No cards match the Card Genius criteria');
            return [];
          }
        } catch (error) {
          console.error('API Service: Error in Card Genius filtering:', error);
          // Return original cards if Card Genius filtering fails
          return cards;
        }
      } else {
        // No lounge filter at all, return all BankKaro cards
        return cards;
      }
    } catch (error) {
      console.error('API Service: Error in getCards:', error);
      throw error;
    }
  }

  async getCardDetails(cardId: string): Promise<CardDetail> {
    // For now, we'll use the cards endpoint and filter by ID
    // In a real implementation, you'd have a dedicated card detail endpoint
    const cards = await this.getCards();
    const card = cards.find(c => c.id === cardId);
    
    if (!card) {
      throw new ApiError(404, 'Card not found');
    }

    // Mock detailed data - replace with actual API call when available
    return {
      ...card,
      detailed_features: [
        "4 reward points per ₹150 spent on dining and shopping",
        "2 reward points per ₹150 spent on groceries",
        "Airport lounge access",
        "Complimentary domestic airport transfers",
        "Welcome benefit worth ₹2,500",
        "Fuel surcharge waiver",
        "Insurance coverage",
        "24x7 concierge services"
      ],
      terms_conditions: [
        "Minimum age: 21 years",
        "Maximum age: 60 years",
        "Minimum income: ₹1,00,000 per month",
        "Credit score: 750+ preferred"
      ],
      how_to_apply: [
        "Visit the bank's website",
        "Fill the online application form",
        "Upload required documents",
        "Submit for verification"
      ],
      documents_required: [
        "PAN Card",
        "Aadhaar Card",
        "Income proof (Salary slips/ITR)",
        "Address proof",
        "Passport size photographs"
      ],
      fees_charges: {
        annual_fee: "₹2,500",
        joining_fee: "₹2,500",
        interest_rate: "3.49% per month",
        late_fee: "₹750",
        cash_advance_fee: "2.5% of amount withdrawn"
      }
    };
  }

  async getCardRecommendations(spendingData: any): Promise<any> {
    const payload = {
      ...spendingData,
      selected_card_id: null
    };

    return await this.makeRequest(this.cardRecommendationURL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getFilteredCardsFromCardGenius(filters: CardFilters): Promise<string[]> {
    // Default payload for Card Genius API
    const defaultPayload = {
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
      hotels_annual: 75000,
      flights_annual: 75000,
      insurance_health_annual: 75000,
      insurance_car_or_bike_annual: 45000,
      domestic_lounge_usage_quarterly: filters.domestic_lounges_min || 0,
      international_lounge_usage_quarterly: filters.international_lounges_min ?? 0
    };

    try {
      console.log('Card Genius API: Calling with payload:', defaultPayload);
      const response = await this.makeRequest(this.cardRecommendationURL, {
        method: 'POST',
        body: JSON.stringify(defaultPayload),
      });

      console.log('Card Genius API: Full response received:', JSON.stringify(response, null, 2));

      // Extract cards that meet the domestic lounges criteria
      const filteredCardAliases: string[] = [];
      
      // Handle different response structures
      let cardsArray: any[] = [];
      
      if (response && response.success && response.savings && Array.isArray(response.savings)) {
        cardsArray = response.savings;
      } else if (Array.isArray(response)) {
        cardsArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        cardsArray = response.data;
      } else if (response && response.cards && Array.isArray(response.cards)) {
        cardsArray = response.cards;
      } else if (response && response.recommendations && Array.isArray(response.recommendations)) {
        cardsArray = response.recommendations;
      }

      console.log('Card Genius API: Extracted cards array:', cardsArray);
      console.log('Card Genius API: Number of cards in response:', cardsArray.length);

      if (cardsArray.length > 0) {
        // Log first few cards to understand structure
        console.log('Card Genius API: First 3 cards structure:', cardsArray.slice(0, 3));
        
        cardsArray.forEach((card: any, index: number) => {
          const seoCardAlias = card.seo_card_alias || card.card_alias || card.alias || card.id;
          const travel = card.travel_benefits || {};
          const domesticLoungeCount = typeof travel.domestic_lounges_unlocked !== 'undefined' ? parseInt(travel.domestic_lounges_unlocked, 10) : undefined;
          const internationalLoungeCount = typeof travel.international_lounges_unlocked !== 'undefined' ? parseInt(travel.international_lounges_unlocked, 10) : undefined;

          // Both filters: must match both
          let matches = true;
          if (filters.domestic_lounges_min !== undefined) {
            matches = matches && typeof domesticLoungeCount === 'number' && !isNaN(domesticLoungeCount) && domesticLoungeCount >= filters.domestic_lounges_min;
          }
          if (filters.international_lounges_min !== undefined) {
            matches = matches && typeof internationalLoungeCount === 'number' && !isNaN(internationalLoungeCount) && internationalLoungeCount >= filters.international_lounges_min;
          }
          if (seoCardAlias && matches) {
            filteredCardAliases.push(seoCardAlias);
          }
        });
      }

      console.log('Card Genius API: Final filtered card aliases:', filteredCardAliases);
      return filteredCardAliases;
    } catch (error) {
      console.error('Card Genius API: Error getting filtered cards:', error);
      return [];
    }
  }

  async searchCards(query: string, filters: CardFilters = {}): Promise<Card[]> {
    const cards = await this.getCards(filters);
    
    if (!query.trim()) {
      return cards;
    }

    const searchTerm = query.toLowerCase();
    return cards.filter(card => 
      card.name.toLowerCase().includes(searchTerm) ||
      card.bank_name.toLowerCase().includes(searchTerm) ||
      card.card_type.toLowerCase().includes(searchTerm) ||
      card.key_features.some(feature => 
        feature.toLowerCase().includes(searchTerm)
      )
    );
  }

  async getCardsByCategory(category: string): Promise<Card[]> {
    const categorySlugMap: Record<string, string> = {
      "shopping": "best-shopping-credit-card",
      "travel": "best-travel-credit-card",
      "dining": "best-dining-credit-card",
      "fuel": "best-fuel-credit-card",
      "grocery": "BestCardsforGroceryShopping",
      "utility": "best-utility-credit-card",
      "premium": "premium-credit-cards",
      "student": "student-credit-cards",
      "business": "business-credit-cards"
    };

    const slug = categorySlugMap[category.toLowerCase()] || "";
    return await this.getCards({ slug });
  }

  /**
   * Check eligibility for all cards (used on All Cards page)
   * Payload: { pincode, inhandIncome, empStatus }
   * Returns: List of eligible card aliases
   */
  async checkEligibility(eligibilityData: {
    pincode: string;
    inhandIncome: string;
    empStatus: 'salaried' | 'self_employed';
  }): Promise<{ eligibleCards: string[]; totalEligible: number }> {
    console.log('API Service: Checking eligibility with data:', eligibilityData);
    
    try {
      const payload = {
        pincode: eligibilityData.pincode,
        inhandIncome: eligibilityData.inhandIncome,
        empStatus: eligibilityData.empStatus,
      };

      console.log('API Service: Eligibility payload:', payload);
      
      const response = await this.makeRequest(`${this.baseURL}/cg-eligiblity`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('API Service: Eligibility response:', response);

      if (!response) {
        console.error('API Service: No response from eligibility API');
        throw new Error('No response from eligibility API');
      }

      if (!response.data || !Array.isArray(response.data)) {
        console.error('API Service: Invalid eligibility response structure:', response);
        console.error('API Service: Response data type:', typeof response.data);
        console.error('API Service: Response data:', response.data);
        throw new Error('Invalid response structure from eligibility API');
      }

      const eligibleCards = response.data
        .filter((card: any) => card.eligible && card.seo_card_alias)
        .map((card: any) => card.seo_card_alias);

      console.log('API Service: Eligible card aliases:', eligibleCards);
      
      return {
        eligibleCards,
        totalEligible: eligibleCards.length
      };
    } catch (error) {
      console.error('API Service: Error checking eligibility:', error);
      throw error;
    }
  }

  /**
   * Check eligibility for a specific card (used on Card Detail page)
   * Payload: { alias, pincode, inhandIncome, empStatus }
   * Returns: Eligibility status for the specific card
   */
  async checkCardSpecificEligibility(cardAlias: string, eligibilityData: {
    pincode: string;
    inhandIncome: string;
    empStatus: 'salaried' | 'self_employed';
  }): Promise<{ isEligible: boolean; cardAlias: string }> {
    console.log('API Service: Checking card-specific eligibility for:', cardAlias, 'with data:', eligibilityData);
    
    try {
      const payload = {
        alias: cardAlias,
        pincode: eligibilityData.pincode,
        inhandIncome: eligibilityData.inhandIncome,
        empStatus: eligibilityData.empStatus,
      };

      console.log('API Service: Card-specific eligibility payload:', payload);
      
      const response = await this.makeRequest(`${this.baseURL}/cg-eligiblity`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('API Service: Card-specific eligibility response:', response);

      if (!response || !Array.isArray(response.data)) {
        console.error('API Service: Invalid card-specific eligibility response structure:', response);
        throw new Error('Invalid response structure from card-specific eligibility API');
      }

      // Find the specific card in the response
      const cardData = response.data.find((card: any) => card.seo_card_alias === cardAlias);
      
      if (!cardData) {
        console.error('API Service: Card not found in eligibility response:', cardAlias);
        throw new Error('Card not found in eligibility response');
      }

      return {
        isEligible: cardData.eligible || false,
        cardAlias: cardAlias
      };
    } catch (error) {
      console.error('API Service: Error checking card-specific eligibility:', error);
      throw error;
    }
  }
}

export const cardService = new CardService(); 