
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Star, Users, ArrowLeft, CheckCircle, XCircle, Info, Calendar, DollarSign, TrendingUp, Sparkles, Award, Shield, Zap, Home } from "lucide-react";
import { Card as CardType } from "@/services/api";

// Helper type guards
function isObjectWithNameOrHeader(obj: unknown): obj is { name?: string; header?: string } {
  return typeof obj === 'object' && obj !== null && ('name' in obj || 'header' in obj);
}
function isObjectWithHeaderOrName(obj: unknown): obj is { header?: string; name?: string } {
  return typeof obj === 'object' && obj !== null && ('header' in obj || 'name' in obj);
}

// Description mapping based on joining_fee_offset
const getCardDescription = (joiningFeeOffset?: string): string => {
  if (!joiningFeeOffset) return "Experience premium benefits with this credit card designed for your lifestyle.";
  
  const descriptions: Record<string, string> = {
    "0": "Perfect for beginners! This card offers great value with no joining fee and essential benefits to start your credit journey.",
    "500": "Excellent value proposition! This card provides premium features at an affordable joining fee, making it ideal for regular users.",
    "1000": "Premium experience awaits! This card offers exclusive benefits and rewards that justify the joining fee for serious credit card users.",
    "1500": "Luxury meets functionality! This premium card delivers exceptional benefits and exclusive perks for discerning customers.",
    "2000": "Ultimate premium experience! This elite card offers the highest tier benefits and exclusive access to premium services.",
    "2500": "Exclusive luxury card! This ultra-premium offering provides unmatched benefits and elite status for high-net-worth individuals.",
    "3000": "The pinnacle of credit cards! This ultimate premium card offers unparalleled benefits and exclusive access to the finest services."
  };
  
  return descriptions[joiningFeeOffset] || "Experience premium benefits with this credit card designed for your lifestyle.";
};

// Joining fee description mapping based on joining_fee_offset
const getJoiningFeeDescription = (joiningFeeOffset?: string): string => {
  if (!joiningFeeOffset) return "Standard joining fee for this card.";
  
  const descriptions: Record<string, string> = {
    "0": "No joining fee - perfect for new credit card users!",
    "500": "Low joining fee with excellent value proposition.",
    "1000": "Moderate joining fee for premium benefits.",
    "1500": "Premium joining fee for luxury features.",
    "2000": "High joining fee for elite benefits.",
    "2500": "Premium joining fee for exclusive services.",
    "3000": "Ultra-premium joining fee for ultimate benefits."
  };
  
  return descriptions[joiningFeeOffset] || "Standard joining fee for this card.";
};

// Annual fee description mapping based on annual_fee_waiver
const getAnnualFeeDescription = (annualFeeWaiver?: string): string => {
  if (!annualFeeWaiver) return "Standard annual fee applies.";
  
  const waiverText = annualFeeWaiver.toLowerCase();
  
  if (waiverText.includes("free") || waiverText.includes("waived")) {
    return "Annual fee waived - enjoy benefits for free!";
  } else if (waiverText.includes("spend") || waiverText.includes("spending")) {
    return "Annual fee waived on meeting spending criteria.";
  } else if (waiverText.includes("first year") || waiverText.includes("1st year")) {
    return "Annual fee waived in the first year.";
  } else if (waiverText.includes("lifetime") || waiverText.includes("life")) {
    return "Lifetime annual fee waiver available.";
  } else if (waiverText.includes("conditional") || waiverText.includes("terms")) {
    return "Annual fee waiver available on meeting conditions.";
  } else {
    return annualFeeWaiver; // Return the original text if no specific pattern matches
  }
};

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

// Confetti Animation Component
const ConfettiAnimation = () => (
  <div className="pointer-events-none">
    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(-40px) scale(1); opacity: 1; }
        100% { transform: translateY(120px) scale(0.8); opacity: 0; }
      }
    `}</style>
    {[...Array(18)].map((_, i) => (
      <span
        key={i}
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random()}s`,
          background: `hsl(${Math.random() * 360}, 80%, 60%)`,
        }}
        className="absolute top-0 w-2 h-2 rounded-full opacity-80 animate-[confetti-fall_1.2s_ease-in-out]"
      />
    ))}
  </div>
);

const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [card, setCard] = useState<CardType | null>(null);
  const [cardNotFound, setCardNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'calculator'>('details');

  // Add state for calculator tab
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [calcValues, setCalcValues] = useState<Record<string, number>>(() => Object.fromEntries(ALL_KEYS.map(k => [k, 0])));
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcResultList, setCalcResultList] = useState<any[]>([]);

  // Eligibility check state
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityForm, setEligibilityForm] = useState({ pincode: '', inhandIncome: '', empStatus: 'salaried' });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [showFailureMessage, setShowFailureMessage] = useState(false);

  // Eligibility tabs state
  const [eligibilityTab, setEligibilityTab] = useState<'salaried' | 'self-employed'>('salaried');

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
      
      // Smooth scroll to results after a short delay to ensure DOM update
      setTimeout(() => {
        const resultsElement = document.getElementById('calc-results');
        const allResultsElement = document.getElementById('calc-all-results');
        
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        } else if (allResultsElement) {
          // If individual results not found, scroll to all results
          allResultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } catch (err) {
      setCalcError('Failed to calculate savings. Please try again.');
    } finally {
      setCalcLoading(false);
    }
  };

  // Eligibility check function
  const handleEligibilityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setEligibilityLoading(true);
    setEligibilityError('');
    setShowCongrats(false);
    setEligibleCount(0);
    setIsEligible(false);
    setShowFailureMessage(false);
    
    try {
      const res = await fetch('https://bk-api.bankkaro.com/sp/api/cg-eligiblity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: card.seo_card_alias,
          pincode: eligibilityForm.pincode,
          inhandIncome: eligibilityForm.inhandIncome,
          empStatus: eligibilityForm.empStatus,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to check eligibility');
      
      const data = await res.json();
      if (!data || !Array.isArray(data.data)) throw new Error('Invalid response');
      
      const eligible = data.data.filter((c: any) => c.eligible && c.seo_card_alias).map((c: any) => c.seo_card_alias);
      
      if (!eligible.length) {
        // User is not eligible - show failure message and close modal
        setShowFailureMessage(true);
        setTimeout(() => {
          setShowEligibilityModal(false);
          setShowFailureMessage(false);
        }, 3000);
        return;
      }
      
      // User is eligible
      setEligibleCount(eligible.length);
      setIsEligible(true);
      setShowCongrats(true);
      
      setTimeout(() => {
        setShowEligibilityModal(false);
        setShowCongrats(false);
      }, 2000);
    } catch (err: any) {
      setEligibilityError(err.message || 'Something went wrong');
    } finally {
      setEligibilityLoading(false);
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
    
    console.log('[CardDetail] Loading card with ID:', id);
    console.log('[CardDetail] Location state:', location.state);
    
    // Set a timeout to show "not found" if card loading takes too long
    const timeoutId = setTimeout(() => {
      if (!card) {
        console.warn('[CardDetail] Card loading timeout, showing not found');
        setCardNotFound(true);
      }
    }, 5000); // 5 second timeout
    
    // Try to get card from navigation state (preferred)
    if (location.state && location.state.card) {
      console.log('[CardDetail] Found card in navigation state:', location.state.card.name);
      setCard(location.state.card);
      clearTimeout(timeoutId);
      return;
    }
    
    // Fallback: Try to get card from localStorage
    const cardsJSON = localStorage.getItem("all_cards_cache");
    if (cardsJSON) {
      try {
        const cards: CardType[] = JSON.parse(cardsJSON);
        console.log('[CardDetail] Found', cards.length, 'cached cards');
        
        // Try to find card by seo_card_alias first, then by id
        const found = cards.find((c) => {
          const matchesSeo = c.seo_card_alias === id;
          const matchesId = c.id && c.id.toString() === id;
          console.log('[CardDetail] Checking card:', c.name, 'seo:', c.seo_card_alias, 'id:', c.id, 'matches:', matchesSeo || matchesId);
          return matchesSeo || matchesId;
        });
        
        if (found) {
          console.log('[CardDetail] Found card in cache:', found.name);
          setCard(found);
          setCardNotFound(false);
          clearTimeout(timeoutId);
        } else {
          console.warn('[CardDetail] Card not found in cache for ID:', id);
          setCardNotFound(true);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('[CardDetail] Error parsing cached cards:', error);
        setCardNotFound(true);
        clearTimeout(timeoutId);
      }
    } else {
      console.warn('[CardDetail] No cached cards found in localStorage');
      setCardNotFound(true);
      clearTimeout(timeoutId);
    }
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [id, location.state]);

  if (cardNotFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Card Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the card you're looking for. The card might have been removed or the link might be incorrect.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/all-cards')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Cards
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Enhanced Top Section - Full Width */}
        <div className="mb-8">
          <UICard className="shadow-card animate-card-glow">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Card Image - Larger and More Prominent */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    {card.image ? (
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover rounded-xl" 
                      />
                    ) : (
                      <CreditCard className="h-10 w-10 text-white" />
                    )}
                  </div>
                  {/* Commission Badge */}
                  {card.commission && (
                    <Badge className="mt-2 bg-accent text-white text-xs px-2 py-1">
                      {card.commission}
                    </Badge>
                  )}
                </div>
                
                {/* Card Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">{card.name}</h1>
                      <p className="text-lg text-muted-foreground mb-3">{card.bank_name}</p>
                      
                      {/* Tags and Categories */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {Array.isArray(card.tags) && card.tags.length > 0 && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {typeof card.tags[0] === 'string' ? card.tags[0] : ((card.tags[0] as any).name || (card.tags[0] as any).header || JSON.stringify(card.tags[0]))}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {card.card_network}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {card.card_type}
                        </Badge>
                      </div>
                      
                      {/* Rating and User Count */}
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center bg-accent/10 px-3 py-2 rounded-lg">
                          <Star className="h-5 w-5 fill-accent text-accent mr-2" />
                          <span className="font-semibold text-lg">{card.rating}</span>
                        </div>
                        {card.user_rating_count > 0 && (
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="font-medium">{card.user_rating_count.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fees Information - Enhanced Layout with Descriptions */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Award className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Joining Fee</span>
                      </div>
                      <span className="text-xl font-bold text-blue-900">
                        {card.joining_fee_text || (card.joining_fee ? `₹${card.joining_fee}` : 'Free')}
                      </span>
                      <p className="text-xs text-blue-700 mt-2">
                        {getJoiningFeeDescription(card.joining_fee_offset)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Annual Fee</span>
                      </div>
                      <span className="text-xl font-bold text-green-900">
                        {card.annual_fee_text || (card.annual_fee ? `₹${card.annual_fee}` : 'Free')}
                      </span>
                      <p className="text-xs text-green-700 mt-2">
                        {getAnnualFeeDescription(card.annual_fee_waiver)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Eligibility Success Strip */}
                  {isEligible && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-6 w-6 text-white" />
                          <span className="text-white font-semibold text-lg">
                            🎉 Congratulations! You are eligible for this card
                          </span>
                        </div>
                        <button
                          onClick={() => setIsEligible(false)}
                          className="text-white/80 hover:text-white transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <Button
                    size="lg"
                    onClick={() => {
                      setEligibilityForm({ pincode: '', inhandIncome: '', empStatus: 'salaried' });
                      setEligibilityError('');
                      setShowEligibilityModal(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 animate-pulse-glow hover:animate-none transition-all duration-300"
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Check Eligibility
                  </Button>
                </div>
              </div>
            </CardContent>
          </UICard>
        </div>
        {/* Enhanced Tabs Section */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'calculator')} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="details" className="text-base font-semibold">Card Details</TabsTrigger>
            <TabsTrigger value="calculator" className="text-base font-semibold">Savings Calculator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="space-y-6">
              
              {/* Enhanced Eligibility Section */}
              <UICard className="shadow-card border-l-4 border-primary">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-primary" />
                    Eligibility Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Employment Status Tabs */}
                  <Tabs value={eligibilityTab} onValueChange={(value) => setEligibilityTab(value as 'salaried' | 'self-employed')} className="mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="salaried">Salaried</TabsTrigger>
                      <TabsTrigger value="self-employed">Self Employed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="salaried" className="mt-6">
                      {/* Eligibility Criteria Cards */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Age Criteria Card */}
                        <UICard className="shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-blue-900">Age Criteria</h3>
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-blue-800">
                              {card.age_criteria || 'Not specified'}
                            </p>
                            <p className="text-sm text-blue-600 mt-2">Minimum age requirement</p>
                          </CardContent>
                        </UICard>

                        {/* Credit Score Card */}
                        <UICard className="shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-green-900">Credit Rating</h3>
                              <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-green-800">
                              {card.crif || 'Not specified'}
                            </p>
                            <p className="text-sm text-green-600 mt-2">Minimum credit score required</p>
                          </CardContent>
                        </UICard>

                        {/* Income Criteria Card */}
                        <UICard className="shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-purple-900">Salary Criteria</h3>
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-purple-800">
                              {card.income_salaried || 'Not specified'}
                            </p>
                            <p className="text-sm text-purple-600 mt-2">Minimum monthly income</p>
                          </CardContent>
                        </UICard>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="self-employed" className="mt-6">
                      {/* Eligibility Criteria Cards for Self Employed */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Age Criteria Card */}
                        <UICard className="shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-blue-900">Age Criteria</h3>
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-blue-800">
                              {card.age_self_emp || 'Not specified'}
                            </p>
                            <p className="text-sm text-blue-600 mt-2">Minimum age requirement</p>
                          </CardContent>
                        </UICard>

                        {/* Credit Score Card */}
                        <UICard className="shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-green-900">Credit Rating</h3>
                              <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-green-800">
                              {card.crif_self_emp || 'Not specified'}
                            </p>
                            <p className="text-sm text-green-600 mt-2">Minimum credit score required</p>
                          </CardContent>
                        </UICard>

                        {/* Income Criteria Card */}
                        <UICard className="shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-lg text-purple-900">Income Criteria</h3>
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-purple-800">
                              {card.income_self_emp || 'Not specified'}
                            </p>
                            <p className="text-sm text-purple-600 mt-2">Minimum annual income</p>
                          </CardContent>
                        </UICard>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </UICard>
              {/* Enhanced How To Redeem Section */}
              <UICard className="shadow-card border-l-4 border-green-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-6 w-6 mr-3 text-green-600" />
                    How To Redeem Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Rewards Conversion Rate */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-blue-200 rounded-lg mr-3">
                          <TrendingUp className="h-5 w-5 text-blue-700" />
                        </div>
                        <h3 className="font-bold text-lg text-blue-900">Points Value</h3>
                      </div>
                      <p className="text-blue-800 leading-relaxed">
                        {card.reward_conversion_rate || 'Not specified'}
                      </p>
                    </div>

                    {/* Redemption Options */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-green-200 rounded-lg mr-3">
                          <Award className="h-5 w-5 text-green-700" />
                        </div>
                        <h3 className="font-bold text-lg text-green-900">Redeem For</h3>
                      </div>
                      <p className="text-green-800 leading-relaxed">
                        {card.redemption_options || 'Not specified'}
                      </p>
                    </div>

                    {/* Redemption Catalogue */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-purple-200 rounded-lg mr-3">
                          <Info className="h-5 w-5 text-purple-700" />
                        </div>
                        <h3 className="font-bold text-lg text-purple-900">Catalogue</h3>
                      </div>
                      <div className="text-purple-800 leading-relaxed">
                        {card.redemption_catalogue ? (
                          (() => {
                            // Check if the text contains a URL
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            const match = card.redemption_catalogue.match(urlRegex);
                            
                            if (match && match[0]) {
                              return (
                                <div className="space-y-2">
                                  <p>{card.redemption_catalogue.replace(urlRegex, '').trim()}</p>
                                  <a 
                                    href={match[0]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium underline transition-colors"
                                  >
                                    Click here
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                              );
                            } else {
                              return <p>{card.redemption_catalogue}</p>;
                            }
                          })()
                        ) : (
                          <p>Not specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </UICard>
              {/* Enhanced Exclusion Sections */}
              <div className="grid md:grid-cols-2 gap-6">
                <UICard className="shadow-card border-l-4 border-red-500">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                    <CardTitle className="text-xl flex items-center">
                      <XCircle className="h-6 w-6 mr-3 text-red-600" />
                      Exclusion Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {card.exclusion_earnings ? (
                      <ScrollArea className="h-48">
                        <ul className="space-y-3">
                          {card.exclusion_earnings.split(/\r?\n|,|•|\u2022/).map((item, idx) => {
                            const trimmed = item.trim();
                            return trimmed ? (
                              <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-red-800 font-medium">{trimmed}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <span className="text-gray-500">No exclusions specified</span>
                      </div>
                    )}
                  </CardContent>
                </UICard>
                
                <UICard className="shadow-card border-l-4 border-orange-500">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                    <CardTitle className="text-xl flex items-center">
                      <XCircle className="h-6 w-6 mr-3 text-orange-600" />
                      Exclusion Spends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {card.exclusion_spends ? (
                      <ScrollArea className="h-48">
                        <ul className="space-y-3">
                          {card.exclusion_spends.split(/\r?\n|,|•|\u2022/).map((item, idx) => {
                            const trimmed = item.trim();
                            return trimmed ? (
                              <li key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <XCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span className="text-orange-800 font-medium">{trimmed}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <span className="text-gray-500">No exclusions specified</span>
                      </div>
                    )}
                  </CardContent>
                </UICard>
              </div>
              {/* Enhanced Product USPs Section */}
              {Array.isArray(card.product_usps) && card.product_usps.length > 0 && (
                <UICard className="shadow-card border-l-4 border-indigo-500">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardTitle className="text-xl flex items-center">
                      <Sparkles className="h-6 w-6 mr-3 text-indigo-600" />
                      Product USPs & Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {card.product_usps.map((usp: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-shadow">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-indigo-200 rounded-lg mr-3">
                              <Zap className="h-5 w-5 text-indigo-700" />
                            </div>
                            <h3 className="font-bold text-lg text-indigo-900">
                              {usp.header || usp.name || `Feature ${idx + 1}`}
                            </h3>
                          </div>
                          <p className="text-indigo-800 leading-relaxed">
                            {usp.description || usp.comment || (typeof usp === 'string' ? usp : JSON.stringify(usp))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </UICard>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calculator" className="space-y-6">
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
                    <div id="calc-results" className="mt-8 animate-fade-in">
                      <UICard className="shadow-card border-primary/30 animate-card-glow">
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
                    <div id="calc-all-results" className="mt-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
                      <UICard className="shadow-card border-primary/30 animate-card-glow">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Eligibility Modal */}
      <Dialog open={showEligibilityModal} onOpenChange={(open) => {
        if (!open) {
          setShowEligibilityModal(false);
          setEligibilityForm({ pincode: '', inhandIncome: '', empStatus: 'salaried' });
          setEligibilityError('');
          setShowCongrats(false);
          setEligibleCount(0);
          setShowFailureMessage(false);
          // Don't reset isEligible here as we want to keep the success strip visible
        }
      }}>
        <DialogContent className="transition-all duration-500 ease-in-out animate-fade-in">
          <DialogClose asChild>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="Close"
            >
              ×
            </button>
          </DialogClose>
          {showCongrats ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] animate-fade-in">
              <div className="relative w-full flex flex-col items-center">
                <span className="text-3xl font-bold text-green-600 mb-2 animate-bounce">🎉</span>
                <span className="text-xl font-semibold text-center mb-2 animate-fade-in">
                  Congratulations!<br />You are eligible for this card
                </span>
                {/* Simple confetti/party animation */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
                  <ConfettiAnimation />
                </div>
              </div>
            </div>
          ) : showFailureMessage ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] animate-fade-in">
              <div className="relative w-full flex flex-col items-center">
                <span className="text-3xl font-bold text-red-500 mb-2">❌</span>
                <span className="text-xl font-semibold text-center mb-2 text-red-600 animate-fade-in">
                  Sorry, you are not eligible for this card
                </span>
                <span className="text-sm text-muted-foreground text-center">
                  Try checking other cards that might better match your profile
                </span>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Check Card Eligibility</h2>
              <form onSubmit={handleEligibilityCheck} className="space-y-4">
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="Enter your pincode"
                    value={eligibilityForm.pincode}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, pincode: e.target.value }))}
                    required
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="inhandIncome">In-hand Income (Monthly)</Label>
                  <Input
                    id="inhandIncome"
                    type="number"
                    placeholder="Enter your monthly in-hand income"
                    value={eligibilityForm.inhandIncome}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, inhandIncome: e.target.value }))}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <Label>Employment Status</Label>
                  <RadioGroup
                    value={eligibilityForm.empStatus}
                    onValueChange={(value) => setEligibilityForm(prev => ({ ...prev, empStatus: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="salaried" id="salaried" />
                      <Label htmlFor="salaried">Salaried</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="self-employed" id="self-employed" />
                      <Label htmlFor="self-employed">Self Employed</Label>
                    </div>
                  </RadioGroup>
                </div>
                {eligibilityError && (
                  <div className="text-red-500 text-sm">{eligibilityError}</div>
                )}
                <Button
                  type="submit"
                  disabled={eligibilityLoading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {eligibilityLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking Eligibility...
                    </>
                  ) : (
                    'Check Eligibility'
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardDetail;
