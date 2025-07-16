
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plane, UtensilsCrossed, Fuel, ShoppingCart, Zap, Hotel, Star, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

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
    name: 'HDFC Regalia Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=HDFC+Regalia',
    bank_name: 'HDFC Bank',
    joining_fee: '2500',
    renewal_fee: '2500',
    rating: '4.5',
    total_users: 12000,
    tags: ['Travel', 'Shopping'],
  },
  {
    id: '2',
    name: 'SBI SimplyCLICK Credit Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=SBI+SimplyCLICK',
    bank_name: 'State Bank of India',
    joining_fee: '499',
    renewal_fee: '499',
    rating: '4.2',
    total_users: 9000,
    tags: ['Shopping', 'Utility'],
  },
  {
    id: '3',
    name: 'Taj Hotel Card',
    image: 'https://via.placeholder.com/200x120/1f2937/ffffff?text=Taj+Hotel',
    bank_name: 'ICICI Bank',
    joining_fee: '1000',
    renewal_fee: '1000',
    rating: '4.7',
    total_users: 3000,
    tags: ['Hotel', 'Travel'],
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
      const response = await fetch('https://bk-api.bankkaro.com/sp/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: "", banks_ids: [], card_networks: [], annualFees: "", credit_score: "", sort_by: "", free_cards: "", eligiblityPayload: {}, cardGeniusPayload: {} })
      });
      const data = await response.json();
      console.log('[FeaturedCategoriesSection] Full API response:', data);
      // Try all possible response structures
      let cards: any[] = [];
      if (Array.isArray(data)) {
        cards = data;
      } else if (data.cards && Array.isArray(data.cards)) {
        cards = data.cards;
      } else if (data.data && data.data.cards && Array.isArray(data.data.cards)) {
        cards = data.data.cards;
      }
      
      // Debug: Log the structure of first few cards
      if (cards.length > 0) {
        console.log('[FeaturedCategoriesSection] First card structure:', cards[0]);
        if (cards[0].tags && Array.isArray(cards[0].tags)) {
          console.log('[FeaturedCategoriesSection] First card tags:', cards[0].tags);
        }
      }
      // If no cards found, use demo data
      if (!cards || cards.length === 0) {
        console.warn('[FeaturedCategoriesSection] No cards from API, using demo data');
        cards = DEMO_CARDS;
        setError("Showing demo cards. Live data not available.");
      }
      setAllCards(cards);
      // Extract unique categories from tags
      const catSet = new Set<string>();
      const catMap: Record<string, any[]> = {};
      cards.forEach(card => {
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
      if (cards.length === 0 || catArr.length === 0) {
        setError("No categories or cards found. Please try again later.");
      }
    } catch (error) {
      setAllCards(DEMO_CARDS);
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
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Explore Cards by Category
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Find the perfect card for your spending habits
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
            <div className="flex overflow-x-auto gap-8 pb-4 mb-8 scrollbar-hide">
              {categories.map((cat, index) => {
                const Icon = CATEGORY_ICONS[cat] || CreditCard;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={`${cat}-${index}`}
                    className={`flex flex-col items-center px-5 py-3 rounded-2xl border transition-all min-w-[100px] shadow-sm gap-2 ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-muted text-foreground hover:bg-muted/30'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/40 border border-muted mb-1">
                      <Icon className="h-8 w-8" />
                    </span>
                    <span className="text-xs font-semibold truncate max-w-[80px] text-center">{cat}</span>
                    <span className="text-[11px] text-muted-foreground mt-1">{categoryMap[cat]?.length || 0} cards</span>
                  </button>
                );
              })}
            </div>
            {/* Cards for selected category */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-left">{selectedCategory} Cards</h3>
              {categoryMap[selectedCategory] && categoryMap[selectedCategory].length > 0 ? (
                <>
                  <div
                    ref={cardsContainerRef}
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out overflow-hidden ${showAllMap[selectedCategory] ? 'max-h-[2000px]' : 'max-h-[1200px]'}`}
                    style={{
                      gridAutoRows: '1fr',
                    }}
                  >
                    {(showAllMap[selectedCategory] ? categoryMap[selectedCategory] : categoryMap[selectedCategory].slice(0, 9)).map((card, index) => (
                      <Card key={`${card.id || card.name || index}`} className="shadow-card hover-lift transition-transform duration-300">
                        <CardContent className="p-4 flex flex-col h-full">
                          {/* Card Image */}
                          <div className="flex justify-center mb-3">
                            <img src={card.image} alt={card.name} className="w-24 h-14 object-contain rounded bg-white border" onError={e => (e.currentTarget.style.display = 'none')} />
                          </div>
                          {/* Card Name */}
                          <h4 className="font-semibold text-base mb-1 text-center line-clamp-2">{typeof card.name === 'string' ? card.name : 'Card Name'}</h4>
                          <p className="text-xs text-muted-foreground text-center mb-2">{typeof card.bank_name === 'string' ? card.bank_name : 'Bank'}</p>
                          {/* Fees & Info */}
                          <div className="flex flex-wrap justify-center gap-2 mb-2">
                            <Badge className="bg-primary/10 text-primary text-xs">Joining: ₹{typeof card.joining_fee === 'string' || typeof card.joining_fee === 'number' ? (card.joining_fee || card.annual_fee || '0') : '0'}</Badge>
                            <Badge className="bg-secondary/10 text-secondary text-xs">Renewal: ₹{typeof card.renewal_fee === 'string' || typeof card.renewal_fee === 'number' ? (card.renewal_fee || card.annual_fee || '0') : '0'}</Badge>
                          </div>
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="flex items-center gap-1 text-xs"><Star className="h-4 w-4 text-yellow-400" />{typeof card.rating === 'string' || typeof card.rating === 'number' ? (card.rating || '4.0') : '4.0'}</span>
                            <span className="flex items-center gap-1 text-xs"><Users className="h-4 w-4 text-blue-400" />{formatUserCount(card.user_rating_count)}</span>
                          </div>
                          {/* View Detail Button */}
                          <Button asChild className="mt-auto w-full bg-primary hover:bg-primary/90 text-xs">
                            <Link to={`/card/${typeof card.id === 'string' || typeof card.id === 'number' ? card.id : 'demo'}`}>View Detail</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {categoryMap[selectedCategory].length > 9 && (
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        className="px-8 py-2 rounded-lg shadow-sm border border-primary/30 text-primary font-semibold transition-all duration-300"
                        onClick={() => setShowAllMap((prev) => ({ ...prev, [selectedCategory]: !prev[selectedCategory] }))}
                      >
                        {showAllMap[selectedCategory] ? 'Show Less' : 'View More'}
                      </Button>
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
