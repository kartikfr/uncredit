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
  joining_fee_text?: string;
  annual_fee_text?: string;
  selected_tags?: string[]; // New field for multi-select tag filtering
  card_types?: string[]; // New field for multi-select card type filtering
  joining_fee_min?: number; // New field for min joining fee
  joining_fee_max?: number; // New field for max joining fee
  annual_fee_min?: number; // New field for min annual fee
  annual_fee_max?: number; // New field for max annual fee
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
  key_features: string[];
  benefits: string[];
  tags?: string[]; // New field for card tags
  product_usps?: (string | { header?: string; name?: string; comment?: string })[]; // New field for product USPs
  annual_fee_comment?: string;
  reward_conversion_rate?: string;
  redemption_options?: string;
  exclusion_earnings?: string;
  exclusion_spends?: string;
  age_criteria?: string; // New field for age criteria (e.g., "21-60")
  age_criteria_comment?: string;
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
      // Handle all possible response structures
      if (Array.isArray(data)) {
        return data;
      }
      if (data.cards) {
        return data.cards;
      }
      if (data.data && Array.isArray(data.data.cards)) {
        return data.data.cards;
      }
      return [];
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
}

export const cardService = new CardService(); 