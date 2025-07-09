
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Star, Users, ArrowLeft, CheckCircle, XCircle, Info } from "lucide-react";
import { Card as CardType } from "@/services/api";

// Helper type guards
function isObjectWithNameOrHeader(obj: unknown): obj is { name?: string; header?: string } {
  return typeof obj === 'object' && obj !== null && ('name' in obj || 'header' in obj);
}
function isObjectWithHeaderOrName(obj: unknown): obj is { header?: string; name?: string } {
  return typeof obj === 'object' && obj !== null && ('header' in obj || 'name' in obj);
}

const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [card, setCard] = useState<CardType | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'calculator'>('details');

  useEffect(() => {
    // Scroll to top with smooth animation on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Try to get card from navigation state (preferred)
    if (location.state && location.state.card) {
      setCard(location.state.card);
      return;
    }
    // Fallback: Try to get card from localStorage (set by AllCards page)
    const cardsJSON = localStorage.getItem("all_cards_cache");
    if (cardsJSON) {
      const cards: CardType[] = JSON.parse(cardsJSON);
      const found = cards.find((c) => c.id.toString() === id);
      if (found) setCard(found);
    }
  }, [id, location.state]);

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading card details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Cards
        </Button>
        {/* Top Section: name, image, rating, user_rating_count, joining_fee_text, category (from tags) */}
        <UICard className="mb-8 shadow-card">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <CreditCard className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">{card.name}</h1>
                <div className="flex items-center space-x-2 mb-2">
                  {/* Category from tags (first tag) */}
                  {Array.isArray(card.tags) && card.tags.length > 0 && (
                    <Badge className="text-xs bg-primary/10 text-primary">
                      {typeof card.tags[0] === 'string' ? card.tags[0] : ((card.tags[0] as any).name || (card.tags[0] as any).header || JSON.stringify(card.tags[0]))}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent text-accent mr-1" />
                    <span className="font-medium">{card.rating}</span>
                  </div>
                  {card.user_rating_count > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{card.user_rating_count}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-6 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Joining Fee: </span>
                    <span className="font-medium text-foreground">{card.joining_fee_text || (card.joining_fee ? `₹${card.joining_fee}` : 'Free')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </UICard>
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 font-medium ml-4 ${activeTab === 'calculator' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('calculator')}
            >
              Calculator
            </button>
          </div>
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Age Criteria */}
              <UICard className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Age Criteria
                    {card.age_criteria_comment && (
                      <span className="relative group">
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block bg-white border border-gray-300 rounded px-2 py-1 text-xs text-muted-foreground shadow-lg min-w-[180px]">
                          {card.age_criteria_comment}
                        </span>
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground">{card.age_criteria || 'Not specified'}</span>
                </CardContent>
              </UICard>
              {/* Reward Conversion Rate & Redemption Options */}
              <div className="grid md:grid-cols-2 gap-6">
                <UICard className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Reward Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(card.reward_conversion_rate)
                      ? card.reward_conversion_rate.map((item: any, idx: number) => (
                          <div key={idx} className="mb-3">
                            <div className="font-semibold text-primary mb-1">{item.header || `Reward Rate ${idx + 1}`}</div>
                            <div className="text-sm text-muted-foreground">{item.description || item.comment || JSON.stringify(item)}</div>
                          </div>
                        ))
                      : typeof (card.reward_conversion_rate ?? undefined) === 'object' && card.reward_conversion_rate !== null
                      ? (
                          <div>
                            <div className="font-semibold text-primary mb-1">{(card.reward_conversion_rate as any).header || 'Reward Rate'}</div>
                            <div className="text-sm text-muted-foreground">{(card.reward_conversion_rate as any).description || (card.reward_conversion_rate as any).comment || JSON.stringify(card.reward_conversion_rate)}</div>
                          </div>
                        )
                      : <span className="text-sm text-muted-foreground">{card.reward_conversion_rate || 'Not specified'}</span>
                    }
                  </CardContent>
                </UICard>
                <UICard className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Redemption Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(card.redemption_options)
                      ? card.redemption_options.map((item: any, idx: number) => (
                          <div key={idx} className="mb-3">
                            <div className="font-semibold text-primary mb-1">{item.header || `Redemption Option ${idx + 1}`}</div>
                            <div className="text-sm text-muted-foreground">{item.description || item.comment || JSON.stringify(item)}</div>
                          </div>
                        ))
                      : typeof (card.redemption_options ?? undefined) === 'object' && card.redemption_options !== null
                      ? (
                          <div>
                            <div className="font-semibold text-primary mb-1">{(card.redemption_options as any).header || 'Redemption Option'}</div>
                            <div className="text-sm text-muted-foreground">{(card.redemption_options as any).description || (card.redemption_options as any).comment || JSON.stringify(card.redemption_options)}</div>
                          </div>
                        )
                      : <span className="text-sm text-muted-foreground">{card.redemption_options || 'Not specified'}</span>
                    }
                  </CardContent>
                </UICard>
              </div>
              {/* Exclusion Earnings & Spends - improved UI */}
              <div className="grid md:grid-cols-2 gap-6">
                <UICard className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Exclusion Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {card.exclusion_earnings ? (
                      <ul className="space-y-2">
                        {card.exclusion_earnings.split(/\r?\n|,|•|\u2022/).map((item, idx) => {
                          const trimmed = item.trim();
                          return trimmed ? (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span>{trimmed}</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </CardContent>
                </UICard>
                <UICard className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Exclusion Spends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {card.exclusion_spends ? (
                      <ul className="space-y-2">
                        {card.exclusion_spends.split(/\r?\n|,|•|\u2022/).map((item, idx) => {
                          const trimmed = item.trim();
                          return trimmed ? (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span>{trimmed}</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </CardContent>
                </UICard>
              </div>
              {/* Product USPs - improved UI */}
              {Array.isArray(card.product_usps) && card.product_usps.length > 0 && (
                <div className="space-y-4">
                  {card.product_usps.map((usp: any, idx: number) => (
                    <UICard key={idx} className="shadow-card border-l-4 border-primary">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-primary">
                          {usp.header || usp.name || `USP ${idx + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-sm text-muted-foreground block">
                          {usp.description || usp.comment || (typeof usp === 'string' ? usp : JSON.stringify(usp))}
                        </span>
                      </CardContent>
                    </UICard>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'calculator' && (
            <div className="p-8 bg-white rounded shadow-card min-h-[200px] flex items-center justify-center text-muted-foreground">
              <span>Calculator coming soon...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
