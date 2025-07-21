
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Plane, UtensilsCrossed, Fuel, ShoppingCart, Zap, Hotel, Star, Users, CreditCard, TrendingUp, Award, Crown, CheckCircle, Sparkles, Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { cardService } from "@/services/api";

const CATEGORY_ICONS = {
  Shopping: ShoppingBag,
  Travel: Plane,
  Dining: UtensilsCrossed,
  Fuel: Fuel,
  Grocery: ShoppingCart,
  Utility: Zap,
  Hotel: Hotel,
};

// Demo fallback data
const DEMO_CARDS = [
  {
    id: '1',
    seo_card_alias: 'hdfc-regalia-credit-card',
    name: 'HDFC Regalia Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Regalia',
    card_type: 'Premium',
    joining_fee_text: '₹2,500',
    annual_fee_text: '₹2,500',
    rating: '4.5',
    user_rating_count: 12000,
    tags: ['Travel', 'Shopping'],
  },
  {
    id: '2',
    seo_card_alias: 'sbi-simplyclick-credit-card',
    name: 'SBI SimplyCLICK Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+SimplyCLICK',
    card_type: 'Shopping',
    joining_fee_text: '₹499',
    annual_fee_text: '₹499',
    rating: '4.2',
    user_rating_count: 9000,
    tags: ['Shopping', 'Utility'],
  },
  {
    id: '3',
    seo_card_alias: 'taj-hotel-card',
    name: 'Taj Hotel Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=Taj+Hotel',
    card_type: 'Hotel',
    joining_fee_text: '₹1,000',
    annual_fee_text: '₹1,000',
    rating: '4.7',
    user_rating_count: 3000,
    tags: ['Hotel', 'Travel'],
  },
  {
    id: '4',
    seo_card_alias: 'icici-amazon-pay-credit-card',
    name: 'ICICI Amazon Pay Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=ICICI+Amazon+Pay',
    card_type: 'Shopping',
    joining_fee_text: '₹500',
    annual_fee_text: '₹500',
    rating: '4.3',
    user_rating_count: 15000,
    tags: ['Shopping', 'Online'],
  },
  {
    id: '5',
    seo_card_alias: 'axis-flipkart-credit-card',
    name: 'Axis Flipkart Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=Axis+Flipkart',
    card_type: 'Shopping',
    joining_fee_text: '₹500',
    annual_fee_text: '₹500',
    rating: '4.1',
    user_rating_count: 12000,
    tags: ['Shopping', 'Online'],
  },
  {
    id: '6',
    seo_card_alias: 'hdfc-millennia-credit-card',
    name: 'HDFC Millennia Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Millennia',
    card_type: 'Shopping',
    joining_fee_text: '₹1,000',
    annual_fee_text: '₹1,000',
    rating: '4.4',
    user_rating_count: 18000,
    tags: ['Shopping', 'Rewards'],
  },
  {
    id: '7',
    seo_card_alias: 'sbi-cashback-credit-card',
    name: 'SBI Cashback Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+Cashback',
    card_type: 'Cashback',
    joining_fee_text: '₹999',
    annual_fee_text: '₹999',
    rating: '4.6',
    user_rating_count: 8000,
    tags: ['Shopping', 'Cashback'],
  },
  {
    id: '8',
    seo_card_alias: 'icici-coral-credit-card',
    name: 'ICICI Coral Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=ICICI+Coral',
    card_type: 'Travel',
    joining_fee_text: '₹2,000',
    annual_fee_text: '₹2,000',
    rating: '4.2',
    user_rating_count: 6000,
    tags: ['Travel', 'Lounge'],
  },
  {
    id: '9',
    seo_card_alias: 'hdfc-tata-neu-credit-card',
    name: 'HDFC Tata Neu Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Tata+Neu',
    card_type: 'Shopping',
    joining_fee_text: '₹1,500',
    annual_fee_text: '₹1,500',
    rating: '4.0',
    user_rating_count: 5000,
    tags: ['Shopping', 'Rewards'],
  },
  {
    id: '10',
    seo_card_alias: 'axis-ace-credit-card',
    name: 'Axis Ace Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=Axis+Ace',
    card_type: 'Cashback',
    joining_fee_text: '₹500',
    annual_fee_text: '₹500',
    rating: '4.5',
    user_rating_count: 10000,
    tags: ['Shopping', 'Cashback'],
  },
  {
    id: '11',
    seo_card_alias: 'sbi-elite-credit-card',
    name: 'SBI Elite Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+Elite',
    card_type: 'Premium',
    joining_fee_text: '₹4,999',
    annual_fee_text: '₹4,999',
    rating: '4.8',
    user_rating_count: 3000,
    tags: ['Travel', 'Premium'],
  },
  {
    id: '12',
    seo_card_alias: 'icici-ruby-credit-card',
    name: 'ICICI Ruby Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=ICICI+Ruby',
    card_type: 'Premium',
    joining_fee_text: '₹3,000',
    annual_fee_text: '₹3,000',
    rating: '4.3',
    user_rating_count: 4000,
    tags: ['Travel', 'Premium'],
  },
];

function formatUserCount(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || '0';
}

export const FeaturedCategoriesSection = () => {
  const [allCards, setAllCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, any[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showAllMap, setShowAllMap] = useState<Record<string, boolean>>({});
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllCards();
  }, []);

  const fetchAllCards = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[FeaturedCategoriesSection] Fetching cards using cardService...');
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
      
      console.log('[FeaturedCategoriesSection] Cards received from service:', cards);
      
      // Debug: Log the structure of first few cards
      if (cards.length > 0) {
        console.log('[FeaturedCategoriesSection] First card structure:', cards[0]);
        console.log('[FeaturedCategoriesSection] Card ID mapping:', {
          id: cards[0].id,
          seo_card_alias: cards[0].seo_card_alias,
          name: cards[0].name
        });
        if (cards[0].tags && Array.isArray(cards[0].tags)) {
          console.log('[FeaturedCategoriesSection] First card tags:', cards[0].tags);
        }
      }
      
      // If no cards found, use demo data
      if (!cards || cards.length === 0) {
        console.warn('[FeaturedCategoriesSection] No cards from API, using demo data');
        setAllCards(DEMO_CARDS);
        setError("Showing demo cards. Live data not available.");
      } else {
        setAllCards(cards);
        setError(""); // Clear any previous errors
      }
      
      // Cache cards in localStorage for CardDetail component
      try {
        localStorage.setItem("all_cards_cache", JSON.stringify(cards || DEMO_CARDS));
        console.log('[FeaturedCategoriesSection] Cached', (cards || DEMO_CARDS).length, 'cards in localStorage');
      } catch (error) {
        console.warn('[FeaturedCategoriesSection] Failed to cache cards in localStorage:', error);
      }
      
      // Extract unique categories from tags
      const catSet = new Set<string>();
      const catMap: Record<string, any[]> = {};
      const cardsToProcess = cards || DEMO_CARDS;
      
      cardsToProcess.forEach(card => {
        if (Array.isArray(card.tags)) {
          card.tags.forEach((tag: any) => {
            // Handle both string and object tags
            const tagName = typeof tag === 'string' ? tag : (tag.name || tag.id || JSON.stringify(tag));
            catSet.add(tagName);
            if (!catMap[tagName]) catMap[tagName] = [];
            catMap[tagName].push(card);
          });
        }
      });
      const catArr = Array.from(catSet);
      console.log('[FeaturedCategoriesSection] Extracted categories:', catArr);
      setCategories(catArr);
      setCategoryMap(catMap);
      setSelectedCategory(catArr[0] || "");
      if (cardsToProcess.length === 0 || catArr.length === 0) {
        setError("No categories or cards found. Please try again later.");
      }
    } catch (error) {
      console.error('[FeaturedCategoriesSection] Error fetching cards:', error);
      setAllCards(DEMO_CARDS);
      
      // Cache demo cards in localStorage for CardDetail component
      try {
        localStorage.setItem("all_cards_cache", JSON.stringify(DEMO_CARDS));
        console.log('[FeaturedCategoriesSection] Cached', DEMO_CARDS.length, 'demo cards in localStorage');
      } catch (cacheError) {
        console.warn('[FeaturedCategoriesSection] Failed to cache demo cards in localStorage:', cacheError);
      }
      
      // Extract categories from demo data
      const catSet = new Set<string>();
      const catMap: Record<string, any[]> = {};
      DEMO_CARDS.forEach(card => {
        if (Array.isArray(card.tags)) {
          card.tags.forEach((tag: any) => {
            // Handle both string and object tags
            const tagName = typeof tag === 'string' ? tag : (tag.name || tag.id || JSON.stringify(tag));
            catSet.add(tagName);
            if (!catMap[tagName]) catMap[tagName] = [];
            catMap[tagName].push(card);
          });
        }
      });
      const catArr = Array.from(catSet);
      setCategories(catArr);
      setCategoryMap(catMap);
      setSelectedCategory(catArr[0] || "");
      setError("Failed to load cards. Showing demo cards.");
    } finally {
      setLoading(false);
    }
  };

  // Reset showAll for new category
  useEffect(() => {
    setShowAllMap((prev) => ({ ...prev, [selectedCategory]: false }));
  }, [selectedCategory]);

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20 animate-fade-in">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 mb-4">
            <Target className="w-4 h-4 mr-2" />
            Explore by Category
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Find Your Perfect Card Match
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover credit cards tailored to your spending habits and lifestyle preferences
          </p>
        </div>
        {loading ? (
          <div className="text-center">
            <div className="text-lg text-muted-foreground">Loading categories...</div>
          </div>
        ) : error ? (
          <div className="text-center text-destructive text-lg py-8">{error}</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg py-8">No categories found.</div>
        ) : (
          <>
            {/* Horizontal scrollable categories */}
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 mb-8 scrollbar-hide">
              {categories.map((cat, index) => {
                const Icon = CATEGORY_ICONS[cat] || CreditCard;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={`${cat}-${index}`}
                    className={`flex flex-col items-center px-4 md:px-6 py-4 md:py-6 rounded-2xl border-2 transition-all min-w-[120px] md:min-w-[140px] shadow-lg gap-3 hover-lift ${
                      isSelected 
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 text-blue-700 shadow-blue-200' 
                        : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-2 mb-2 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600' 
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}>
                      <Icon className="h-7 w-7 md:h-8 md:w-8" />
                    </span>
                    <span className="text-sm md:text-base font-bold truncate max-w-[100px] text-center">{cat}</span>
                    <span className="text-xs text-muted-foreground mt-1 bg-gray-100 px-2 py-1 rounded-full">
                      {categoryMap[cat]?.length || 0} cards
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Cards for selected category */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">{selectedCategory} Cards</h3>
                </div>
                <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                  {categoryMap[selectedCategory]?.length || 0} cards available
                </Badge>
              </div>
              {categoryMap[selectedCategory] && categoryMap[selectedCategory].length > 0 ? (
                <>
                  <div
                    ref={cardsContainerRef}
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 transition-all duration-500 ease-in-out ${showAllMap[selectedCategory] ? '' : 'overflow-hidden'}`}
                    style={{
                      gridAutoRows: 'minmax(480px, auto)',
                      maxHeight: showAllMap[selectedCategory] ? 'none' : '1400px',
                    }}
                  >
                    {(showAllMap[selectedCategory] ? categoryMap[selectedCategory] : categoryMap[selectedCategory].slice(0, 9)).map((card, index) => {
                      console.log('[FeaturedCategoriesSection] Rendering card:', {
                        name: card.name,
                        id: card.id,
                        seo_card_alias: card.seo_card_alias,
                        index
                      });
                      return (
                        <Card key={`${card.id || card.name || index}`} className="shadow-lg hover-lift transition-transform duration-300 border-2 border-gray-200 bg-white/80 backdrop-blur-sm overflow-hidden group h-full min-h-[480px]">
                        <CardContent className="p-6 flex flex-col h-full">
                          {/* Card Image */}
                          <div className="flex justify-center mb-6">
                            <div className="w-36 h-22 md:w-44 md:h-28 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <img 
                                src={card.image} 
                                alt={card.name} 
                                className="w-full h-full object-cover rounded-xl" 
                                onError={e => (e.currentTarget.style.display = 'none')} 
                              />
                            </div>
                          </div>
                          
                          {/* Card Name */}
                          <h4 className="font-bold text-lg md:text-xl mb-3 text-center line-clamp-2 text-foreground">
                            {typeof card.name === 'string' ? card.name : 'Card Name'}
                          </h4>
                          <p className="text-sm text-muted-foreground text-center mb-6">
                            {typeof card.card_type === 'string' ? card.card_type : 'Credit Card'}
                          </p>
                          
                          <Separator className="mb-6" />
                          
                          {/* Fees & Info */}
                          <div className="flex flex-wrap justify-center gap-3 mb-6">
                            <Badge className="bg-blue-100 text-blue-700 text-xs px-3 py-2">
                              Joining: {typeof card.joining_fee_text === 'string' ? card.joining_fee_text : (typeof card.joining_fee === 'string' || typeof card.joining_fee === 'number' ? `₹${card.joining_fee || '0'}` : '₹0')}
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 text-xs px-3 py-2">
                              Annual: {typeof card.annual_fee_text === 'string' ? card.annual_fee_text : (typeof card.annual_fee === 'string' || typeof card.annual_fee === 'number' ? `₹${card.annual_fee || '0'}` : '₹0')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-center gap-6 mb-6">
                            <span className="flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              {typeof card.rating === 'string' || typeof card.rating === 'number' ? (card.rating || '4.0') : '4.0'}
                            </span>
                            <span className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-blue-400" />
                              {formatUserCount(card.user_rating_count)}
                            </span>
                          </div>
                          
                          {/* View Detail Button */}
                          <Button 
                            asChild 
                            className="mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold group-hover:scale-105 transition-transform py-3"
                          >
                            <Link to={`/card/${card.seo_card_alias || card.id || 'demo'}`} state={{ card }}>
                              <Target className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                    })}
                  </div>
                  {categoryMap[selectedCategory].length > 9 && (
                    <div className="flex flex-col items-center mt-8 space-y-4">
                      <Button
                        className="px-8 py-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover-lift"
                        onClick={() => setShowAllMap((prev) => ({ ...prev, [selectedCategory]: !prev[selectedCategory] }))}
                      >
                        {showAllMap[selectedCategory] ? 'Show Less' : 'View More'}
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        Made with ❤️ by CashKaro & BankKaro
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">No cards found for this category.</div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
