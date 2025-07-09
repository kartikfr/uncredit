
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plane, UtensilsCrossed, Fuel, ShoppingCart, Zap, ArrowRight, Star, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export const FeaturedCategoriesSection = () => {
  const [categoryCards, setCategoryCards] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const featuredCategories = [
    { 
      name: "Shopping", 
      slug: "best-shopping-credit-card", 
      icon: ShoppingBag, 
      color: "bg-blue-500",
      cards: []
    },
    { 
      name: "Travel", 
      slug: "best-travel-credit-card", 
      icon: Plane, 
      color: "bg-green-500",
      cards: []
    },
    { 
      name: "Dining", 
      slug: "best-dining-credit-card", 
      icon: UtensilsCrossed, 
      color: "bg-orange-500",
      cards: []
    },
    { 
      name: "Fuel", 
      slug: "best-fuel-credit-card", 
      icon: Fuel, 
      color: "bg-purple-500",
      cards: []
    },
    { 
      name: "Grocery", 
      slug: "BestCardsforGroceryShopping", 
      icon: ShoppingCart, 
      color: "bg-red-500",
      cards: []
    },
    { 
      name: "Utility", 
      slug: "best-utility-credit-card", 
      icon: Zap, 
      color: "bg-indigo-500",
      cards: []
    }
  ];

  useEffect(() => {
    fetchCategoryCards();
  }, []);

  const fetchCategoryCards = async () => {
    setLoading(true);
    const categoryData = {};
    
    try {
      for (const category of featuredCategories) {
        const response = await fetch('https://bk-api.bankkaro.com/sp/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: category.slug,
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
        const data = await response.json();
        categoryData[category.slug] = data.cards?.slice(0, 5) || [];
      }
      setCategoryCards(categoryData);
    } catch (error) {
      console.error('Error fetching category cards:', error);
    } finally {
      setLoading(false);
    }
  };

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
        ) : (
          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            {featuredCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              const cards = categoryCards[category.slug] || [];
              
              return (
                <div key={category.slug} className="space-y-4 sm:space-y-6">
                  {/* Category Header - Properly Aligned */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground">{category.name} Cards</h3>
                        <p className="text-sm text-muted-foreground">Top {Math.min(cards.length, 5)} cards in this category</p>
                      </div>
                    </div>
                    <Link to={`/explore?category=${category.name}`} className="flex-shrink-0">
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Top 5 Cards - Horizontal Scroll with Better Alignment */}
                  <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex space-x-4 sm:space-x-6 pb-4" style={{ width: 'max-content' }}>
                        {cards.slice(0, 5).map((card: any, index: number) => (
                          <Card 
                            key={card.id} 
                            className="hover-lift shadow-card animate-slide-up flex-shrink-0 w-72 sm:w-80"
                            style={{animationDelay: `${(categoryIndex * 100) + (index * 50)}ms`}}
                          >
                            <CardContent className="p-4 sm:p-6">
                              {/* Card Image */}
                              <div className="relative mb-4">
                                <div className="w-full h-24 bg-gradient-primary rounded-lg flex items-center justify-center">
                                  <CreditCard className="h-8 w-8 text-white" />
                                </div>
                                
                                {/* Annual Fee Badge */}
                                <Badge className="absolute -bottom-2 left-2 bg-white text-primary text-xs px-2 py-1">
                                  {card.annual_fee ? `₹${card.annual_fee}` : 'Free'}
                                </Badge>
                              </div>

                              {/* Card Info */}
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-foreground text-base leading-tight line-clamp-2 mb-1">{card.name}</h4>
                                  <p className="text-sm text-muted-foreground">{card.bank_name}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 fill-accent text-accent" />
                                    <span className="text-sm font-medium">{card.rating || '4.0'}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {card.card_network}
                                  </Badge>
                                </div>

                                <div className="bg-accent/10 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-accent line-clamp-2">{card.key_features?.[0] || 'Great rewards'}</p>
                                </div>

                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="flex-1 text-xs border-primary text-primary hover:bg-primary/5">
                                    View Details
                                  </Button>
                                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-xs">
                                    Apply Now
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Show more indicator if there are more cards */}
                        {cards.length > 5 && (
                          <div className="flex-shrink-0 w-72 sm:w-80 flex items-center justify-center">
                            <Link to={`/explore?category=${category.name}`}>
                              <Card className="h-full w-full border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                                  <ArrowRight className="h-8 w-8 text-primary mb-2" />
                                  <p className="text-primary font-medium">View {cards.length - 5} more cards</p>
                                  <p className="text-xs text-muted-foreground">in {category.name} category</p>
                                </CardContent>
                              </Card>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
