
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
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

const CATEGORY_QUESTIONS = [
  {
    name: "All",
    keys: [
      "amazon_spends", "flipkart_spends", "other_online_spends", "other_offline_spends", "grocery_spends_online", "online_food_ordering", "fuel", "dining_or_going_out", "flights_annual", "hotels_annual", "domestic_lounge_usage_quarterly", "international_lounge_usage_quarterly", "mobile_phone_bills", "electricity_bills", "water_bills", "insurance_health_annual", "insurance_car_or_bike_annual", "rent", "school_fees"
    ]
  },
  {
    name: "Online Shopping",
    keys: ["amazon_spends", "flipkart_spends", "other_online_spends", "other_offline_spends"]
  },
  {
    name: "Paying Bills",
    keys: ["mobile_phone_bills", "electricity_bills", "water_bills", "insurance_health_annual", "insurance_car_or_bike_annual", "rent", "school_fees"]
  },
  { name: "Groceries", keys: ["grocery_spends_online"] },
  { name: "Ordering Food", keys: ["online_food_ordering"] },
  { name: "Filling Fuel Up", keys: ["fuel"] },
  { name: "Dining Out", keys: ["dining_or_going_out"] },
  { name: "Flights and Hotels", keys: ["flights_annual", "hotels_annual", "domestic_lounge_usage_quarterly", "international_lounge_usage_quarterly"] }
];
const QUESTION_META = {
  amazon_spends: { label: "How much do you spend on Amazon in a month? 🛍️", min: 0, max: 50000, step: 500 },
  flipkart_spends: { label: "How much do you spend on Flipkart in a month? 📦", min: 0, max: 50000, step: 500 },
  other_online_spends: { label: "How much do you spend on other online shopping? 💸", min: 0, max: 30000, step: 500 },
  other_offline_spends: { label: "How much do you spend at local shops or offline stores monthly? 🏪", min: 0, max: 30000, step: 500 },
  grocery_spends_online: { label: "How much do you spend on groceries (Blinkit,Zepto etc.) every month? 🥦", min: 0, max: 20000, step: 500 },
  online_food_ordering: { label: "How much do you spend on food delivery apps in a month? 🛵🍜", min: 0, max: 15000, step: 250 },
  fuel: { label: "How much do you spend on fuel in a month? ⛽", min: 0, max: 15000, step: 500 },
  dining_or_going_out: { label: "How much do you spend on dining out in a month? 🥗", min: 0, max: 20000, step: 500 },
  flights_annual: { label: "How much do you spend on flights in a year? ✈️", min: 0, max: 300000, step: 5000 },
  hotels_annual: { label: "How much do you spend on hotel stays in a year? 🛌", min: 0, max: 200000, step: 5000 },
  domestic_lounge_usage_quarterly: { label: "How often do you visit domestic airport lounges in a year? 🇮🇳", min: 0, max: 50, step: 1 },
  international_lounge_usage_quarterly: { label: "Plus, what about international airport lounges? 🌎", min: 0, max: 20, step: 1 },
  mobile_phone_bills: { label: "How much do you spend on recharging your mobile or Wi-Fi monthly? 📱", min: 0, max: 5000, step: 100 },
  electricity_bills: { label: "What’s your average monthly electricity bill? ⚡️", min: 0, max: 10000, step: 200 },
  water_bills: { label: "And what about your monthly water bill? 💧", min: 0, max: 5000, step: 100 },
  insurance_health_annual: { label: "How much do you pay for health or term insurance annually? 🛡️", min: 0, max: 100000, step: 2000 },
  insurance_car_or_bike_annual: { label: "How much do you pay for car or bike insurance annually?", min: 0, max: 50000, step: 1000 },
  rent: { label: "How much do you pay for house rent every month?", min: 0, max: 100000, step: 1000 },
  school_fees: { label: "How much do you pay in school fees monthly?", min: 0, max: 50000, step: 1000 },
};
const ALL_KEYS = Object.keys(QUESTION_META);

const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [card, setCard] = useState<CardType | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'calculator'>('details');

  // Add state for calculator tab
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [calcValues, setCalcValues] = useState<Record<string, number>>(() => Object.fromEntries(ALL_KEYS.map(k => [k, 0])));
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcResultList, setCalcResultList] = useState<any[]>([]);

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => {
      if (cat === "All") return ["All"];
      if (prev.includes(cat)) {
        const filtered = prev.filter(c => c !== cat);
        return filtered.length === 0 ? ["All"] : filtered;
      } else {
        return prev.filter(c => c !== "All").concat(cat);
      }
    });
  };

  const visibleKeys = selectedCategories.includes("All")
    ? ALL_KEYS
    : CATEGORY_QUESTIONS.filter(c => selectedCategories.includes(c.name)).flatMap(c => c.keys);

  const handleCalcValueChange = (key: string, value: number) => {
    setCalcValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCalcSubmit = async () => {
    setCalcLoading(true);
    setCalcError("");
    setCalcResult(null);
    setCalcResultList([]);
    try {
      const payload: Record<string, any> = {};
      for (const k of ALL_KEYS) {
        payload[k] = visibleKeys.includes(k) ? calcValues[k] : "";
      }
      payload.selected_card_id = null;
      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      // Find the card for this detail page by seo_card_alias
      const found = (data.savings || []).find((c: any) => c.seo_card_alias === card.seo_card_alias);
      setCalcResult(found || null);
      setCalcResultList(data.savings || []);
    } catch (err) {
      setCalcError('Failed to calculate savings. Please try again.');
    } finally {
      setCalcLoading(false);
    }
  };

  // Check URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'calculator') {
      setActiveTab('calculator');
    }
  }, [location.search]);

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
            <div className="space-y-6">
              {/* Category Selection */}
              <UICard className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Choose Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {CATEGORY_QUESTIONS.map(cat => (
                      <Button
                        key={cat.name}
                        variant={selectedCategories.includes(cat.name) ? "default" : "outline"}
                        className={selectedCategories.includes(cat.name) ? "bg-primary text-white" : ""}
                        onClick={() => handleCategoryToggle(cat.name)}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                  {/* Dynamic Questions */}
                  <div className="space-y-6">
                    {visibleKeys.map(key => (
                      <div key={key} className="flex flex-col gap-2">
                        <label className="font-medium text-foreground mb-1">{QUESTION_META[key].label}</label>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={QUESTION_META[key].min}
                            max={Math.max(QUESTION_META[key].max, calcValues[key])}
                            step={QUESTION_META[key].step}
                            value={[calcValues[key]]}
                            onValueChange={val => handleCalcValueChange(key, val[0])}
                          />
                          <input
                            type="number"
                            min={0}
                            className="border rounded px-2 py-1 w-24 text-right text-base focus:outline-primary"
                            value={calcValues[key]}
                            onChange={e => handleCalcValueChange(key, Math.max(0, Number(e.target.value)))}
                          />
                          {key.includes("lounge") ? <span className="ml-1 text-xs text-muted-foreground">times</span> : <span className="ml-1 text-xs text-muted-foreground">{key.includes('annual') ? 'per year' : 'per month'}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleCalcSubmit} disabled={calcLoading} className="bg-primary text-white">
                      {calcLoading ? "Calculating..." : "Calculate Savings"}
                    </Button>
                  </div>
                  {calcError && <div className="text-destructive text-sm mt-4">{calcError}</div>}
                  {calcResult && (
                    <div className="mt-8">
                      <UICard className="shadow-card border-primary/30">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Net Savings for this Card
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl font-bold text-green-700">₹{Number(calcResult.total_savings_yearly || 0) - Number(calcResult.joining_fees || 0)}</span>
                            <div className="flex gap-4 text-sm mt-2">
                              <span>Total Savings: <span className="font-semibold text-green-600">₹{Number(calcResult.total_savings_yearly).toLocaleString()}</span></span>
                              <span>Joining Fees: <span className="font-semibold text-muted-foreground">₹{Number(calcResult.joining_fees).toLocaleString()}</span></span>
                            </div>
                          </div>
                        </CardContent>
                      </UICard>
                    </div>
                  )}
                  {calcResultList.length > 0 && (
                    <div className="mt-8">
                      <UICard className="shadow-card border-primary/30">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            All Cards - Net Savings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto max-w-full">
                            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-muted/30 shadow-md bg-white">
                              <Table className="min-w-[700px]">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Card Name</TableHead>
                                    <TableHead className="text-center">Total Savings</TableHead>
                                    <TableHead className="text-center">Joining Fees</TableHead>
                                    <TableHead className="text-center">Net Savings</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {calcResultList
                                    .map(card => ({
                                      ...card,
                                      _netSavings: (Number(card.total_savings_yearly) || 0) - (Number(card.joining_fees) || 0)
                                    }))
                                    .sort((a, b) => b._netSavings - a._netSavings)
                                    .slice(0, 10)
                                    .map((card, idx) => (
                                      <TableRow key={card.id || card.card_name || idx} className={card.seo_card_alias === (calcResult?.seo_card_alias || card.seo_card_alias) ? "bg-primary/10" : ""}>
                                        <TableCell className="font-semibold text-foreground text-base leading-tight line-clamp-2">{card.card_name}</TableCell>
                                        <TableCell className="text-center font-bold text-green-600 text-base">₹{Number(card.total_savings_yearly).toLocaleString()}</TableCell>
                                        <TableCell className="text-center text-muted-foreground text-base">₹{Number(card.joining_fees).toLocaleString()}</TableCell>
                                        <TableCell className="text-center font-bold text-green-700 text-base">₹{card._netSavings.toLocaleString()}</TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                            {calcResultList.length > 10 && (
                              <div className="text-center text-xs text-muted-foreground mt-2">
                                Showing top 10 cards. Scroll for more.
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </UICard>
                    </div>
                  )}
                </CardContent>
              </UICard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
