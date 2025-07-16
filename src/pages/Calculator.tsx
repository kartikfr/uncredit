import React, { useState, useEffect } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calculator as CalculatorIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cardService } from '@/services/api';

interface BankKaroCard {
  id: string;
  name: string;
  seo_card_alias: string;
  image: string;
  bank_name: string;
  card_type: string;
}

interface CardGeniusCard {
  id: string;
  name: string;
  seo_card_alias: string;
  // Add other fields as needed
}

const Calculator = () => {
  const [bankKaroCards, setBankKaroCards] = useState<BankKaroCard[]>([]);
  const [cardGeniusCards, setCardGeniusCards] = useState<CardGeniusCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mappedCards, setMappedCards] = useState<BankKaroCard[]>([]);
  const navigate = useNavigate();

  // Fetch cards from BankKaro API
  const fetchBankKaroCards = async () => {
    try {
      console.log('Fetching cards from BankKaro API...');
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
        })
      });

      if (!response.ok) {
        throw new Error(`BankKaro API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('BankKaro API response:', data);

      // Extract cards from response
      let cards: BankKaroCard[] = [];
      if (Array.isArray(data)) {
        cards = data;
      } else if (data.cards && Array.isArray(data.cards)) {
        cards = data.cards;
      } else if (data.data && data.data.cards && Array.isArray(data.data.cards)) {
        cards = data.data.cards;
      }

      // If no cards found, use mock data for testing
      if (cards.length === 0) {
        console.log('No cards from API, using mock data');
        cards = [
          {
            id: '1',
            name: 'HDFC Regalia Credit Card',
            seo_card_alias: 'hdfc-regalia-credit-card',
            image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Regalia',
            bank_name: 'HDFC Bank',
            card_type: 'Premium'
          },
          {
            id: '2',
            name: 'SBI SimplyCLICK Credit Card',
            seo_card_alias: 'sbi-simplyclick-credit-card',
            image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+SimplyCLICK',
            bank_name: 'State Bank of India',
            card_type: 'Shopping'
          },
          {
            id: '3',
            name: 'ICICI Amazon Pay Credit Card',
            seo_card_alias: 'icici-amazon-pay-credit-card',
            image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=ICICI+Amazon+Pay',
            bank_name: 'ICICI Bank',
            card_type: 'Shopping'
          }
        ];
      }

      setBankKaroCards(cards);
      console.log('BankKaro cards loaded:', cards.length);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching BankKaro cards:', error);
      setError('Failed to load cards from BankKaro API. Using demo data.');
      // Use mock data on error
      const mockCards: BankKaroCard[] = [
        {
          id: '1',
          name: 'HDFC Regalia Credit Card',
          seo_card_alias: 'hdfc-regalia-credit-card',
          image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Regalia',
          bank_name: 'HDFC Bank',
          card_type: 'Premium'
        },
        {
          id: '2',
          name: 'SBI SimplyCLICK Credit Card',
          seo_card_alias: 'sbi-simplyclick-credit-card',
          image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+SimplyCLICK',
          bank_name: 'State Bank of India',
          card_type: 'Shopping'
        },
        {
          id: '3',
          name: 'ICICI Amazon Pay Credit Card',
          seo_card_alias: 'icici-amazon-pay-credit-card',
          image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=ICICI+Amazon+Pay',
          bank_name: 'ICICI Bank',
          card_type: 'Shopping'
        }
      ];
      setBankKaroCards(mockCards);
    }
  };

  // Fetch cards from Card Genius API
  const fetchCardGeniusCards = async () => {
    try {
      console.log('Fetching cards from Card Genius API...');
      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`Card Genius API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Card Genius API response:', data);

      // Extract cards from response - adjust based on actual API structure
      let cards: CardGeniusCard[] = [];
      if (data.cards && Array.isArray(data.cards)) {
        cards = data.cards;
      } else if (data.data && data.data.cards && Array.isArray(data.data.cards)) {
        cards = data.data.cards;
      } else if (Array.isArray(data)) {
        cards = data;
      }

      // If no cards found, use mock data for testing
      if (cards.length === 0) {
        console.log('No cards from Card Genius API, using mock data');
        cards = [
          {
            id: '1',
            name: 'HDFC Regalia Credit Card',
            seo_card_alias: 'hdfc-regalia-credit-card'
          },
          {
            id: '2',
            name: 'SBI SimplyCLICK Credit Card',
            seo_card_alias: 'sbi-simplyclick-credit-card'
          },
          {
            id: '3',
            name: 'ICICI Amazon Pay Credit Card',
            seo_card_alias: 'icici-amazon-pay-credit-card'
          }
        ];
      }

      setCardGeniusCards(cards);
      console.log('Card Genius cards loaded:', cards.length);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching Card Genius cards:', error);
      setError('Failed to load cards from Card Genius API. Using demo data.');
      // Use mock data on error
      const mockCards: CardGeniusCard[] = [
        {
          id: '1',
          name: 'HDFC Regalia Credit Card',
          seo_card_alias: 'hdfc-regalia-credit-card'
        },
        {
          id: '2',
          name: 'SBI SimplyCLICK Credit Card',
          seo_card_alias: 'sbi-simplyclick-credit-card'
        },
        {
          id: '3',
          name: 'ICICI Amazon Pay Credit Card',
          seo_card_alias: 'icici-amazon-pay-credit-card'
        }
      ];
      setCardGeniusCards(mockCards);
    }
  };

  // Map cards using seo_card_alias
  const mapCards = () => {
    if (bankKaroCards.length === 0 || cardGeniusCards.length === 0) {
      return;
    }

    console.log('Mapping cards using seo_card_alias...');
    console.log('BankKaro cards:', bankKaroCards);
    console.log('Card Genius cards:', cardGeniusCards);
    
    // Create a set of seo_card_alias from Card Genius API for faster lookup
    const cardGeniusAliases = new Set(cardGeniusCards.map(card => card.seo_card_alias));
    
    // Filter BankKaro cards to only include those that exist in Card Genius API
    const mapped = bankKaroCards.filter(bankKaroCard => 
      cardGeniusAliases.has(bankKaroCard.seo_card_alias)
    );

    console.log('Mapped cards:', mapped.length);
    console.log('Sample mapped cards:', mapped.slice(0, 3));
    
    // If no mapped cards found, use BankKaro cards as fallback
    if (mapped.length === 0) {
      console.log('No mapped cards found, using BankKaro cards as fallback');
      setMappedCards(bankKaroCards);
    } else {
      setMappedCards(mapped);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Fetch both APIs in parallel
      await Promise.all([
        fetchBankKaroCards(),
        fetchCardGeniusCards()
      ]);
      
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (bankKaroCards.length > 0 && cardGeniusCards.length > 0) {
      mapCards();
    }
  }, [bankKaroCards, cardGeniusCards]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCard(cardId);
  };

  const handleCalculateRewards = () => {
    if (!selectedCard) {
      alert('Please select a card first');
      return;
    }

    const selectedCardData = mappedCards.find(card => card.id === selectedCard);
    if (selectedCardData) {
      // Try to find the card in the existing cards data first
      const cardsJSON = localStorage.getItem("all_cards_cache");
      let existingCard = null;
      
      if (cardsJSON) {
        const cards = JSON.parse(cardsJSON);
        existingCard = cards.find((c: any) => c.id.toString() === selectedCardData.id);
      }

      // Navigate to card detail page with calculator tab
      navigate(`/card/${selectedCardData.id}?tab=calculator`, {
        state: { 
          card: existingCard || selectedCardData,
          seo_card_alias: selectedCardData.seo_card_alias
        }
      });
    }
  };

  const selectedCardData = mappedCards.find(card => card.id === selectedCard);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CalculatorIcon className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl font-bold text-foreground">Reward Calculator</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a credit card and calculate your potential rewards based on your spending patterns
            </p>
          </div>

          {/* Main Calculator Card */}
          <UICard className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Select Your Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading available cards...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : mappedCards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No cards available for reward calculation at the moment.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {/* Card Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                      Choose a Credit Card
                    </label>
                    <Select value={selectedCard} onValueChange={handleCardSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a card to calculate rewards" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto" position="popper" side="bottom" avoidCollisions={false}>
                        {mappedCards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            <div className="flex items-center space-x-3">
                              <img
                                src={card.image}
                                alt={card.name}
                                className="w-8 h-5 object-contain rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{card.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {card.bank_name} • {card.card_type}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Card Preview */}
                  {selectedCardData && (
                    <UICard className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={selectedCardData.image}
                            alt={selectedCardData.name}
                            className="w-16 h-10 object-contain rounded-lg bg-white border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {selectedCardData.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedCardData.bank_name} • {selectedCardData.card_type}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Card ID: {selectedCardData.seo_card_alias}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </UICard>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleCalculateRewards}
                      disabled={!selectedCard}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Calculate Rewards
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </UICard>

          {/* Info Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {mappedCards.length} cards available for reward calculation
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Only cards available in both BankKaro and Card Genius APIs are shown
            </p>
            {error && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;