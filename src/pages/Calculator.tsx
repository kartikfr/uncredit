import React, { useState, useEffect } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Calculator as CalculatorIcon, ArrowRight, ArrowLeft, Sparkles, Target, TrendingUp, Award, Crown, Star, Users, CreditCard, Zap, CheckCircle, ExternalLink, BarChart3, Coins, Percent, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cardService } from '@/services/api';
import ScrollToTop from "@/components/ui/ScrollToTop";

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Fetch cards from BankKaro API
  const fetchBankKaroCards = async () => {
    try {
      console.log('Fetching cards from BankKaro API...');
      const cards = await cardService.getCards({
        slug: "",
        banks_ids: [],
        card_networks: [],
        annualFees: "",
        credit_score: "",
        sort_by: "",
        free_cards: "",
        eligiblityPayload: {},
        cardGeniusPayload: {}
      });

      console.log('BankKaro API response:', cards);

      // Extract cards from response and convert to BankKaroCard type
      let bankKaroCards: BankKaroCard[] = [];
      if (Array.isArray(cards)) {
        bankKaroCards = cards.map(card => ({
          id: card.id,
          name: card.name,
          seo_card_alias: card.seo_card_alias || '',
          image: card.image,
          bank_name: card.bank_name,
          card_type: card.card_type
        }));
      }

      // If no cards found, use mock data for testing
      if (bankKaroCards.length === 0) {
        console.log('No cards from API, using mock data');
        bankKaroCards = [
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

      setBankKaroCards(bankKaroCards);
      console.log('BankKaro cards loaded:', bankKaroCards.length);
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
      const response = await fetch('/cg-api/pro', {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <CalculatorIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reward Calculator</h1>
                <p className="text-sm text-muted-foreground">Calculate Your Credit Card Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <CalculatorIcon className="h-12 w-12 md:h-16 md:w-16 mr-2 md:mr-4 animate-calculator-float" />
              <Coins className="h-12 w-12 md:h-16 md:w-16 animate-reward-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
              Calculate Your Rewards! 💰
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed px-4">
              Choose a credit card and discover how much you can earn in rewards and cashback
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Main Calculator Card */}
          <UICard className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Select Your Card
                </h2>
                <p className="text-sm md:text-base text-muted-foreground px-2">
                  Choose a credit card to calculate your potential rewards and savings
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 md:py-12">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader2 className="h-4 w-4 md:h-6 md:w-6 animate-spin text-blue-600 mr-2 md:mr-3" />
                    <span className="text-blue-800 font-medium text-sm md:text-base">Loading available cards...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8 md:py-12">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-red-800 text-sm md:text-base">{error}</p>
                  </div>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : mappedCards.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-yellow-800 text-sm md:text-base">
                    No cards available for reward calculation at the moment.
                  </p>
                  </div>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* Card Selection */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-xl border border-blue-200">
                  <div className="space-y-4">
                      <div className="flex items-center mb-3 md:mb-4">
                        <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                        <span className="text-xs md:text-sm font-medium text-blue-800">Choose a Credit Card</span>
                      </div>
                      
                    <Select value={selectedCard} onValueChange={handleCardSelect}>
                        <SelectTrigger className="h-10 md:h-12 text-sm md:text-lg border-2 border-blue-300 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select a card to calculate rewards" />
                      </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          side="bottom" 
                          align="start"
                          className="w-full max-h-[300px] overflow-y-auto"
                          sideOffset={4}
                        >
                          <ScrollArea className="h-[250px]">
                        {mappedCards.map((card) => (
                              <SelectItem key={card.id} value={card.id} className="py-2 md:py-3">
                                <div className="flex items-center space-x-2 md:space-x-3">
                                  <div className="w-6 h-4 md:w-8 md:h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                              <img
                                src={card.image}
                                alt={card.name}
                                      className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                                  </div>
                              <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-xs md:text-sm lg:text-base">{card.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {card.bank_name} • {card.card_type}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                          </ScrollArea>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>

                  {/* Selected Card Preview */}
                  {selectedCardData && (
                    <UICard className="shadow-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 animate-card-select">
                      <CardContent className="p-4 md:p-6">
                        <div className="text-center mb-4">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 mb-3">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected Card
                          </Badge>
                        </div>
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                          <div className="w-32 h-20 md:w-48 md:h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <img
                            src={selectedCardData.image}
                            alt={selectedCardData.name}
                              className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          </div>
                          <div className="text-center md:text-left flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                              {selectedCardData.name}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground mb-2">
                              {selectedCardData.bank_name} • {selectedCardData.card_type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Card ID: {selectedCardData.seo_card_alias}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </UICard>
                  )}

                  {/* Action Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleCalculateRewards}
                      disabled={!selectedCard}
                      size="lg"
                      className="px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg md:text-xl w-full md:w-auto hover-lift"
                    >
                      <CalculatorIcon className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                      Calculate Rewards
                      <ArrowRight className="h-5 w-5 md:h-6 md:w-6 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </UICard>

          {/* Info Section */}
          <div className="mt-6 md:mt-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                <span className="text-sm md:text-base font-semibold text-blue-900">
              Showing {mappedCards.length} cards available for reward calculation
                </span>
              </div>
              <p className="text-xs md:text-sm text-blue-700 mb-3">
              Only cards available in both BankKaro and Card Genius APIs are shown
            </p>
            {error && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> {error}
                </p>
              </div>
            )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-blue-200 hover-lift">
              <div className="flex items-center mb-2">
                <Coins className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                <h4 className="text-sm md:text-base font-semibold text-blue-900">Reward Calculation</h4>
              </div>
              <p className="text-xs md:text-sm text-blue-700">Calculate potential rewards based on your spending</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-purple-200 hover-lift">
              <div className="flex items-center mb-2">
                <Percent className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2" />
                <h4 className="text-sm md:text-base font-semibold text-purple-900">Cashback Analysis</h4>
              </div>
              <p className="text-xs md:text-sm text-purple-700">See how much cashback you can earn</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-blue-200 sm:col-span-2 md:col-span-1 hover-lift">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                <h4 className="text-sm md:text-base font-semibold text-blue-900">Savings Overview</h4>
              </div>
              <p className="text-xs md:text-sm text-blue-700">Get a complete overview of your potential savings</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default Calculator;