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
import { CreditCard, Star, Users, ArrowLeft, CheckCircle, XCircle, Info, Calendar, DollarSign, TrendingUp, Sparkles, Award, Shield, Zap, Home, Calculator, BarChart3 } from "lucide-react";
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

// Enhanced category mapping with proper API tag structure
const SPENDING_CATEGORY_MAPPING = {
  // Shopping & Online
  amazon_spends: {
    category: "shopping",
    displayName: "Amazon Shopping",
    icon: "🛍️",
    tag: "amazon_spends",
    description: "Online shopping on Amazon"
  },
  flipkart_spends: {
    category: "shopping", 
    displayName: "Flipkart Shopping",
    icon: "📦",
    tag: "flipkart_spends",
    description: "Online shopping on Flipkart"
  },
  other_online_spends: {
    category: "shopping",
    displayName: "Other Online Shopping", 
    icon: "💸",
    tag: "other_online_spends",
    description: "Other online shopping expenses"
  },
  other_offline_spends: {
    category: "shopping",
    displayName: "Offline Shopping",
    icon: "🏪", 
    tag: "other_offline_spends",
    description: "Local shops and offline stores"
  },
  
  // Food & Dining
  grocery_spends_online: {
    category: "food",
    displayName: "Online Groceries",
    icon: "🥦",
    tag: "grocery_spends_online", 
    description: "Grocery delivery (Blinkit, Zepto, etc.)"
  },
  online_food_ordering: {
    category: "food",
    displayName: "Food Delivery",
    icon: "🛵🍜",
    tag: "online_food_ordering",
    description: "Food delivery apps"
  },
  dining_or_going_out: {
    category: "food", 
    displayName: "Dining Out",
    icon: "🥗",
    tag: "dining_or_going_out",
    description: "Restaurants and dining out"
  },
  
  // Travel
  flights_annual: {
    category: "travel",
    displayName: "Flight Bookings",
    icon: "✈️",
    tag: "flights_annual",
    description: "Annual flight expenses"
  },
  hotels_annual: {
    category: "travel",
    displayName: "Hotel Stays", 
    icon: "🛌",
    tag: "hotels_annual",
    description: "Annual hotel expenses"
  },
  domestic_lounge_usage_quarterly: {
    category: "travel",
    displayName: "Domestic Lounges",
    icon: "🇮🇳",
    tag: "domestic_lounge_usage_quarterly",
    description: "Domestic airport lounge visits"
  },
  international_lounge_usage_quarterly: {
    category: "travel",
    displayName: "International Lounges",
    icon: "🌎",
    tag: "international_lounge_usage_quarterly", 
    description: "International airport lounge visits"
  },
  
  // Fuel & Transportation
  fuel: {
    category: "fuel",
    displayName: "Fuel Expenses",
    icon: "⛽",
    tag: "fuel",
    description: "Monthly fuel expenses"
  },
  
  // Bills & Utilities
  mobile_phone_bills: {
    category: "utilities",
    displayName: "Mobile & WiFi Bills",
    icon: "📱",
    tag: "mobile_phone_bills",
    description: "Mobile and WiFi recharges"
  },
  electricity_bills: {
    category: "utilities",
    displayName: "Electricity Bills",
    icon: "⚡️",
    tag: "electricity_bills",
    description: "Monthly electricity bills"
  },
  water_bills: {
    category: "utilities",
    displayName: "Water Bills",
    icon: "💧",
    tag: "water_bills",
    description: "Monthly water bills"
  },
  
  // Insurance
  insurance_health_annual: {
    category: "insurance",
    displayName: "Health Insurance",
    icon: "🛡️",
    tag: "insurance_health_annual",
    description: "Health and term insurance"
  },
  insurance_car_or_bike_annual: {
    category: "insurance",
    displayName: "Vehicle Insurance",
    icon: "🚗",
    tag: "insurance_car_or_bike_annual",
    description: "Car and bike insurance"
  },
  
  // Other Bills
  rent: {
    category: "bills",
    displayName: "House Rent",
    icon: "🏠",
    tag: "rent",
    description: "Monthly house rent"
  },
  school_fees: {
    category: "bills",
    displayName: "School Fees",
    icon: "🎓",
    tag: "school_fees",
    description: "Monthly school fees"
  }
};

// API Response structure mapping
const API_RESPONSE_MAPPING = {
  spending_breakdown_array: "spending_breakdown_array",
  total_savings_yearly: "total_savings_yearly",
  joining_fees: "joining_fees",
  net_savings: "roi",
  category_savings: "category_savings"
};

// Category questions for UI display
const CATEGORY_QUESTIONS = [
  {
    name: "All",
    icon: "🎯",
    keys: [
      "amazon_spends", "flipkart_spends", "other_online_spends", "other_offline_spends", "grocery_spends_online", "online_food_ordering", "fuel", "dining_or_going_out", "flights_annual", "hotels_annual", "domestic_lounge_usage_quarterly", "international_lounge_usage_quarterly", "mobile_phone_bills", "electricity_bills", "water_bills", "insurance_health_annual", "insurance_car_or_bike_annual", "rent", "school_fees"
    ]
  },
  {
    name: "Shopping",
    icon: "🛍️",
    keys: ["amazon_spends", "flipkart_spends", "other_online_spends", "other_offline_spends"]
  },
  {
    name: "Food & Dining",
    icon: "🍽️",
    keys: ["grocery_spends_online", "online_food_ordering", "dining_or_going_out"]
  },
  { 
    name: "Travel", 
    icon: "✈️",
    keys: ["flights_annual", "hotels_annual", "domestic_lounge_usage_quarterly", "international_lounge_usage_quarterly"] 
  },
  { 
    name: "Fuel", 
    icon: "⛽",
    keys: ["fuel"] 
  },
  { 
    name: "Bills & Utilities", 
    icon: "💳",
    keys: ["mobile_phone_bills", "electricity_bills", "water_bills", "insurance_health_annual", "insurance_car_or_bike_annual", "rent", "school_fees"] 
  }
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
  electricity_bills: { label: "What's your average monthly electricity bill? ⚡️", min: 0, max: 10000, step: 200 },
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
  const [eligibilityForm, setEligibilityForm] = useState({ pincode: '', inhandIncome: '', empStatus: 'salaried' as 'salaried' | 'self_employed' });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [showFailureMessage, setShowFailureMessage] = useState(false);


  // Eligibility tabs state
  const [eligibilityTab, setEligibilityTab] = useState<'salaried' | 'self-employed'>('salaried');

  // Enhanced process card savings data with proper API response mapping
  const processCardSavingsData = (cardData: any, userSpending: Record<string, number>) => {
    const processed = { ...cardData };
    
    console.log('Processing card data:', cardData);
    console.log('User spending:', userSpending);
    
    // Extract key savings values from API response with proper tag mapping
    processed.total_savings_yearly = extractValueByTag(cardData, 'total_savings_yearly') || 0;
    processed.joining_fees = extractValueByTag(cardData, 'joining_fees') || 0;
    processed.net_savings = extractValueByTag(cardData, 'roi') || (processed.total_savings_yearly - processed.joining_fees);
    
    console.log('Extracted values:', {
      total_savings_yearly: processed.total_savings_yearly,
      joining_fees: processed.joining_fees,
      net_savings: processed.net_savings
    });
    
    // Extract spending breakdown from API response spending_breakdown_array
    if (cardData.spending_breakdown_array && Array.isArray(cardData.spending_breakdown_array)) {
      console.log('Found spending_breakdown_array in API response:', cardData.spending_breakdown_array);
      
      // Calculate total savings from spending_breakdown_array if not already set
      if (!processed.total_savings_yearly || processed.total_savings_yearly === 0) {
        const totalSavingsFromBreakdown = cardData.spending_breakdown_array.reduce((sum: number, item: any) => {
          return sum + (Number(item.savings) || 0);
        }, 0);
        processed.total_savings_yearly = totalSavingsFromBreakdown;
        console.log('Calculated total_savings_yearly from breakdown:', totalSavingsFromBreakdown);
      }
      
      // Process the spending_breakdown_array directly from API
      processed.spending_breakdown_array = cardData.spending_breakdown_array.map((item: any) => {
        const categoryInfo = SPENDING_CATEGORY_MAPPING[item.on as keyof typeof SPENDING_CATEGORY_MAPPING];
        const userAmount = userSpending[item.on] || 0;
        
        return {
          on: item.on,
          spend: item.spend || userAmount,
          savings: item.savings || 0,
          maxCap: item.maxCap || 0,
          totalMaxCap: item.totalMaxCap || 0,
          cashback_percentage: item.cashback_percentage || "0",
          explanation: item.explanation || [],
          category_display: categoryInfo?.displayName || item.on,
          description: categoryInfo?.description || "",
          icon: categoryInfo?.icon || "💰"
        };
      });
      
      // Also create categoryBreakdown for backward compatibility
      processed.categoryBreakdown = processed.spending_breakdown_array.map((item: any) => {
        const categoryInfo = SPENDING_CATEGORY_MAPPING[item.on as keyof typeof SPENDING_CATEGORY_MAPPING];
        const totalSavings = Number(processed.total_savings_yearly) || 0;
        const percentage = totalSavings > 0 ? (item.savings / totalSavings) * 100 : 0;
        
        return {
          category: item.on,
          displayName: categoryInfo?.displayName || item.category_display || item.on,
          icon: categoryInfo?.icon || "💰",
          userAmount: item.spend,
          savings: item.savings,
          percentage: Math.round(percentage * 10) / 10,
          tag: item.on,
          description: categoryInfo?.description || item.description || "",
          explanation: item.explanation,
          cashback_percentage: item.cashback_percentage,
          maxCap: item.maxCap,
          totalMaxCap: item.totalMaxCap
        };
      });
    } else {
      console.log('No spending_breakdown_array found, using fallback');
      // Fallback: Create category breakdown from user spending
      processed.categoryBreakdown = Object.entries(userSpending)
        .filter(([key, value]) => value > 0 && SPENDING_CATEGORY_MAPPING[key as keyof typeof SPENDING_CATEGORY_MAPPING])
        .map(([key, value]) => {
          const categoryInfo = SPENDING_CATEGORY_MAPPING[key as keyof typeof SPENDING_CATEGORY_MAPPING];
          // Estimate savings (2% of spending as default)
          const estimatedSavings = Math.round(value * 0.02);
          return {
            category: key,
            displayName: categoryInfo.displayName,
            icon: categoryInfo.icon,
            userAmount: value,
            savings: estimatedSavings,
            percentage: processed.total_savings_yearly > 0 ? (estimatedSavings / processed.total_savings_yearly) * 100 : 0,
            tag: key,
            description: categoryInfo.description
          };
        });
    }
    
    console.log('Processed category breakdown:', processed.categoryBreakdown);
    console.log('Processed spending_breakdown_array:', processed.spending_breakdown_array);
    return processed;
  };

  // Helper function to extract values by tag from API response
  const extractValueByTag = (cardData: any, tag: string): number => {
    // Search in product_usps array
    if (cardData.product_usps && Array.isArray(cardData.product_usps)) {
      const uspItem = cardData.product_usps.find((usp: any) => 
        usp.tag === tag || 
        (usp.description && usp.description.toLowerCase().includes(tag.replace('_', ' ')))
      );
      if (uspItem) {
        const value = extractNumericValue(uspItem.description);
        if (value !== null) return value;
      }
    }
    
    // Search in total_savings_yearly array
    if (cardData.total_savings_yearly && Array.isArray(cardData.total_savings_yearly)) {
      const savingsItem = cardData.total_savings_yearly.find((item: any) => 
        item.tag === tag || 
        (item.description && item.description.toLowerCase().includes(tag.replace('_', ' ')))
      );
      if (savingsItem) {
        const value = extractNumericValue(savingsItem.description);
        if (value !== null) return value;
      }
    }
    
    // Search in max_potential_savings array (fallback for backward compatibility)
    if (cardData.max_potential_savings && Array.isArray(cardData.max_potential_savings)) {
      const savingsItem = cardData.max_potential_savings.find((item: any) => 
        item.tag === tag || 
        (item.description && item.description.toLowerCase().includes(tag.replace('_', ' ')))
      );
      if (savingsItem) {
        const value = extractNumericValue(savingsItem.description);
        if (value !== null) return value;
      }
    }
    
    // Direct property access
    if (cardData[tag] !== undefined) {
      return Number(cardData[tag]) || 0;
    }
    
    // Search in any nested arrays
    const searchInArrays = (obj: any): number | null => {
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          const item = obj[key].find((item: any) => 
            item.tag === tag || 
            (item.description && item.description.toLowerCase().includes(tag.replace('_', ' ')))
          );
          if (item) {
            const value = extractNumericValue(item.description);
            if (value !== null) return value;
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          const result = searchInArrays(obj[key]);
          if (result !== null) return result;
        }
      }
      return null;
    };
    
    const result = searchInArrays(cardData);
    return result !== null ? result : 0;
  };

  // Helper function to extract numeric value from string
  const extractNumericValue = (str: string): number | null => {
    if (!str) return null;
    
    // Remove ₹ symbol and commas, then extract number
    const cleanStr = str.replace(/[₹,]/g, '').trim();
    const match = cleanStr.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : null;
  };

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
      // Enhanced payload with proper spending breakdown structure
      const payload: Record<string, any> = {
        selected_card_id: null,
        spending_breakdown_array: []
      };
      
      // Add individual spending values
      for (const k of ALL_KEYS) {
        payload[k] = visibleKeys.includes(k) ? calcValues[k] : "";
      }
      
      // Create spending breakdown array for API with proper structure
      visibleKeys.forEach(key => {
        if (calcValues[key] > 0 && SPENDING_CATEGORY_MAPPING[key]) {
          const categoryInfo = SPENDING_CATEGORY_MAPPING[key];
          payload.spending_breakdown_array.push({
            category: key,
            amount_spent: calcValues[key],
            category_display: categoryInfo.displayName,
            tag: categoryInfo.tag,
            description: categoryInfo.description,
            icon: categoryInfo.icon,
            // Additional fields for API compatibility
            user_input: calcValues[key],
            category_type: categoryInfo.category,
            savings_rate: 0.02, // Default 2% savings rate
            estimated_savings: Math.round(calcValues[key] * 0.02)
          });
        }
      });
      
      console.log('Enhanced API Payload:', payload);
      
      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      // Find the card for this detail page by seo_card_alias
      const found = (data.savings || []).find((c: any) => c.seo_card_alias === card.seo_card_alias);
      
      // Process the found card data to extract proper savings breakdown
      if (found) {
        const processedResult = processCardSavingsData(found, calcValues);
        setCalcResult(processedResult);
      } else {
        setCalcResult(null);
      }
      
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
      console.error('Calculation error:', err);
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
              {/* Enhanced Category Selection */}
              <UICard className="shadow-card border-l-4 border-primary">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="text-xl flex items-center">
                    <Calculator className="h-6 w-6 mr-3 text-primary" />
                    Savings Calculator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select your spending categories and input your monthly/annual expenses to calculate potential savings
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Your Spending Categories</h3>
                      <p className="text-gray-600">Choose the categories that match your spending habits</p>
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {selectedCategories.length} of {CATEGORY_QUESTIONS.length} selected
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {CATEGORY_QUESTIONS.map(cat => (
                        <Button 
                          key={cat.name}
                          variant={selectedCategories.includes(cat.name) ? "default" : "outline"}
                          className={`h-auto p-6 flex flex-col items-center space-y-3 rounded-xl transition-all duration-300 ${
                            selectedCategories.includes(cat.name) 
                              ? "bg-primary text-white shadow-xl scale-105 border-2 border-primary animate-category-select" 
                              : "hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-primary/30 bg-white"
                          }`}
                          onClick={() => handleCategoryToggle(cat.name)}
                        >
                          <span className="text-3xl">{cat.icon}</span>
                          <span className="text-sm font-semibold text-center leading-tight">{cat.name}</span>
                          {selectedCategories.includes(cat.name) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                    {selectedCategories.length === 0 && (
                      <div className="text-center mt-6 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="text-yellow-600 text-2xl mb-2">⚠️</div>
                        <p className="text-yellow-800 font-medium">Please select at least one spending category</p>
                        <p className="text-yellow-600 text-sm mt-1">This helps us calculate your potential savings accurately</p>
                      </div>
                    )}
                  </div>
                  {/* Enhanced Dynamic Questions */}
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Input Your Spending Amounts</h3>
                      <p className="text-gray-600">Adjust the sliders or enter amounts directly for each category</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {visibleKeys.map(key => (
                        <div key={key} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-primary/10 rounded-full mr-3">
                              <span className="text-lg">{QUESTION_META[key].icon || "💰"}</span>
                            </div>
                            <label className="font-semibold text-gray-800 text-lg">
                              {QUESTION_META[key].label}
                            </label>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Amount</span>
                              <span className="text-sm text-gray-500">
                                {key.includes("lounge") ? "times" : key.includes('annual') ? 'per year' : 'per month'}
                              </span>
                            </div>
                            <Slider
                              min={QUESTION_META[key].min}
                              max={Math.max(QUESTION_META[key].max, calcValues[key])}
                              step={QUESTION_META[key].step}
                              value={[calcValues[key]]}
                              onValueChange={val => handleCalcValueChange(key, val[0])}
                              className="w-full"
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">₹</span>
                                <input
                                  type="number"
                                  min={0}
                                  className="border-2 border-gray-200 rounded-lg px-4 py-3 w-32 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                  value={calcValues[key]}
                                  onChange={e => handleCalcValueChange(key, Math.max(0, Number(e.target.value)))}
                                  placeholder="0"
                                />
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">
                                  {calcValues[key].toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {key.includes("lounge") ? "visits" : key.includes('annual') ? 'yearly' : 'monthly'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center mt-12">
                    <div className="text-center">
                      <Button 
                        onClick={handleCalcSubmit} 
                        disabled={calcLoading || selectedCategories.length === 0} 
                        className={`font-bold px-12 py-4 text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl ${
                          selectedCategories.length === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white hover:scale-105'
                        }`}
                      >
                        {calcLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Calculating Your Savings...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-6 w-6 mr-3" />
                            Calculate My Savings
                          </>
                        )}
                      </Button>
                      {selectedCategories.length === 0 && (
                        <p className="text-sm text-gray-500 mt-3">Please select at least one category to continue</p>
                      )}
                    </div>
                  </div>
                  {calcError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700 font-medium">{calcError}</span>
                      </div>
                    </div>
                  )}
                  
                  {calcResult && (
                    <div id="calc-results" className="mt-8 animate-calculator-success">
                      <UICard className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 animate-result-glow">
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-3xl flex items-center justify-center gap-3 text-green-800 mb-2">
                            <TrendingUp className="h-8 w-8" />
                            Net Annual Savings
                          </CardTitle>
                          <p className="text-green-600 text-lg">Based on your spending profile</p>
                        </CardHeader>
                        <CardContent className="text-center px-8 pb-8">
                          {/* Main Savings Display */}
                          <div className="mb-8">
                            <div className="text-6xl font-bold text-green-700 mb-2 drop-shadow-sm">
                              ₹{Number(calcResult.net_savings || (calcResult.total_savings_yearly - calcResult.joining_fees)).toLocaleString()}
                            </div>
                            <div className="text-green-600 text-lg">Your net savings after fees</div>
                          </div>
                          
                          {/* Key Metrics Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-shadow">
                              <div className="flex items-center justify-center mb-3">
                                <div className="p-2 bg-green-100 rounded-full mr-3">
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="text-green-700 font-semibold text-lg">Total Annual Savings</span>
                              </div>
                              <div className="text-2xl font-bold text-green-700 mb-1">
                                ₹{Number(calcResult.total_savings_yearly).toLocaleString()}
                              </div>
                              <span className="text-sm text-green-600">Per year</span>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
                              <div className="flex items-center justify-center mb-3">
                                <div className="p-2 bg-blue-100 rounded-full mr-3">
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-blue-700 font-semibold text-lg">Joining Fees</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-700 mb-1">
                                ₹{Number(calcResult.joining_fees).toLocaleString()}
                              </div>
                              <span className="text-sm text-blue-600">One-time</span>
                            </div>
                          </div>
                          
                          {/* Spending Summary */}
                          {calcResult.categoryBreakdown && calcResult.categoryBreakdown.length > 0 && (
                            <div className="w-full mb-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
                                  <div className="flex items-center mb-3">
                                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                                      <DollarSign className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-blue-700 font-semibold text-lg">Your Total Spending</span>
                                  </div>
                                  <div className="text-2xl font-bold text-blue-700 mb-1">
                                    ₹{calcResult.categoryBreakdown
                                      .filter((item: any) => item.userAmount > 0)
                                      .reduce((sum: number, item: any) => sum + (item.userAmount * (item.category.includes('annual') ? 1 : 12)), 0)
                                      .toLocaleString()}
                                  </div>
                                  <div className="text-sm text-blue-600">
                                    {calcResult.categoryBreakdown.filter((item: any) => item.userAmount > 0).length} categories • Per year
                                  </div>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-shadow">
                                  <div className="flex items-center mb-3">
                                    <div className="p-2 bg-green-100 rounded-full mr-3">
                                      <BarChart3 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-green-700 font-semibold text-lg">Potential Savings Rate</span>
                                  </div>
                                  <div className="text-2xl font-bold text-green-700 mb-1">
                                    {calcResult.categoryBreakdown.filter((item: any) => item.userAmount > 0).length > 0 
                                      ? ((calcResult.total_savings_yearly / calcResult.categoryBreakdown
                                          .filter((item: any) => item.userAmount > 0)
                                          .reduce((sum: number, item: any) => sum + (item.userAmount * (item.category.includes('annual') ? 1 : 12)), 0)) * 100).toFixed(1)
                                      : '0'}%
                                  </div>
                                  <div className="text-sm text-green-600">of your spending • Average</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced Category Breakdown */}
                          {calcResult.categoryBreakdown && calcResult.categoryBreakdown.length > 0 && (
                            <div className="w-full mb-8">
                              <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">Savings by Category</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {calcResult.categoryBreakdown
                                  .filter((item: any) => item.userAmount > 0)
                                  .map((item: any, index: number) => (
                                  <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                      <div className="text-3xl mb-2">{item.icon}</div>
                                      <div className="text-sm font-semibold text-gray-700 mb-2 line-clamp-2">{item.displayName}</div>
                                      <div className="text-lg font-bold text-green-600 mb-1">
                                        ₹{item.savings.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {item.percentage.toFixed(1)}% of total
                                      </div>
                                      <div className="text-xs text-blue-600 mt-1">
                                        ₹{item.userAmount.toLocaleString()}/month
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {calcResult.categoryBreakdown.filter((item: any) => item.userAmount > 0).length === 0 && (
                                <div className="text-center py-8">
                                  <div className="text-gray-400 text-4xl mb-3">📊</div>
                                  <p className="text-gray-500 text-lg">No spending data entered for breakdown</p>
                                  <p className="text-gray-400 text-sm mt-2">Add your spending amounts above to see category-wise savings</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                              onClick={() => navigate(`/card-savings-detail/${card.seo_card_alias}`, { 
                                state: { 
                                  card, 
                                  calcResult, 
                                  calcResultList, 
                                  calcValues,
                                  selectedCategories 
                                } 
                              })}
                              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            >
                              <TrendingUp className="h-5 w-5 mr-2" />
                              View Detailed Breakdown
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                const element = document.getElementById('calc-all-results');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }}
                              className="border-2 border-green-200 text-green-700 hover:bg-green-50 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            >
                              <BarChart3 className="h-5 w-5 mr-2" />
                              Compare with Other Cards
                            </Button>
                          </div>
                        </CardContent>
                      </UICard>
                    </div>
                  )}
                  {calcResultList.length > 0 && (
                    <div id="calc-all-results" className="mt-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
                      <UICard className="shadow-lg border-l-4 border-blue-500">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                          <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                            <BarChart3 className="h-6 w-6" />
                            Compare with Other Cards
                          </CardTitle>
                          <p className="text-blue-600 text-sm">
                            See how this card ranks against other options based on your spending
                          </p>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="overflow-x-auto max-w-full">
                            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-muted/30 shadow-md bg-white">
                              <Table className="min-w-[700px]">
                                <TableHeader className="sticky top-0 bg-white z-10">
                                  <TableRow>
                                    <TableHead className="font-semibold">Rank</TableHead>
                                    <TableHead className="font-semibold">Card Name</TableHead>
                                    <TableHead className="text-center font-semibold">Total Savings</TableHead>
                                    <TableHead className="text-center font-semibold">Joining Fees</TableHead>
                                    <TableHead className="text-center font-semibold">Net Savings</TableHead>
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
                                    .map((card, idx) => {
                                      const isCurrentCard = card.seo_card_alias === calcResult?.seo_card_alias;
                                      return (
                                        <TableRow 
                                          key={card.id || card.card_name || idx} 
                                          className={isCurrentCard ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-gray-50"}
                                        >
                                          <TableCell className="font-bold">
                                            <div className="flex items-center">
                                              {idx === 0 && <Award className="h-4 w-4 text-yellow-500 mr-2" />}
                                              #{idx + 1}
                                            </div>
                                          </TableCell>
                                          <TableCell className="font-semibold">
                                            <div className="flex items-center space-x-3">
                                              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                                                <CreditCard className="h-3 w-3 text-white" />
                                              </div>
                                              <div>
                                                <div className="font-semibold text-foreground leading-tight">
                                                  {card.card_name}
                                                </div>
                                                {isCurrentCard && (
                                                  <Badge variant="default" className="text-xs mt-1">
                                                    Your Card
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-center font-bold text-green-600 text-base">
                                            ₹{Number(card.total_savings_yearly).toLocaleString()}
                                          </TableCell>
                                          <TableCell className="text-center text-muted-foreground text-base">
                                            ₹{Number(card.joining_fees).toLocaleString()}
                                          </TableCell>
                                          <TableCell className="text-center font-bold text-green-700 text-base">
                                            ₹{card._netSavings.toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                </TableBody>
                              </Table>
                            </div>
                            {calcResultList.length > 10 && (
                              <div className="text-center text-sm text-muted-foreground mt-4">
                                Showing top 10 cards. Scroll for more options.
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
                    onValueChange={(value) => setEligibilityForm(prev => ({ ...prev, empStatus: value as 'salaried' | 'self_employed' }))}
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
