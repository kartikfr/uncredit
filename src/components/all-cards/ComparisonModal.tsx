
import React, { useState, useEffect } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { X, Star, TrendingUp, FileText, CreditCard, Users, Award, Shield, Calendar, DollarSign, Sparkles, Zap, Info, ExternalLink, Calculator, Target, PiggyBank, Activity, BarChart3, PieChart, Crown, ChevronDown, ChevronUp, TrendingUp as TrendingUpIcon, Gift, ShoppingBag, Plane, Car, Home } from 'lucide-react';
import { Card, cardService } from '@/services/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Category questions for UI display (same as CardDetail)
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

// Redemption options constants
const METHOD_ICONS: Record<string, React.ComponentType<any>> = {
  'Shopping': ShoppingBag,
  'Travel': Plane,
  'Fuel': Car,
  'Gift Cards': Gift,
  'Cashback': CreditCard,
  'Home': Home,
  'default': Star
};

const METHOD_COLORS: Record<string, string> = {
  'Shopping': 'bg-blue-100 text-blue-800 border-blue-200',
  'Travel': 'bg-purple-100 text-purple-800 border-purple-200',
  'Fuel': 'bg-orange-100 text-orange-800 border-orange-200',
  'Gift Cards': 'bg-pink-100 text-pink-800 border-pink-200',
  'Cashback': 'bg-green-100 text-green-800 border-green-200',
  'Home': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

interface RedemptionOption {
  brand: string;
  conversion_rate: string;
  method: string;
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: Card[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, selectedCards }) => {
  const [activeTab, setActiveTab] = useState('textual');
  
  // Spending calculation state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [calcValues, setCalcValues] = useState<Record<string, number>>(() => Object.fromEntries(ALL_KEYS.map(k => [k, 0])));
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcResults, setCalcResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, Set<string>>>({});

  // Debug effect to monitor calcValues changes
  useEffect(() => {
    console.log('🔄 calcValues changed:', calcValues);
  }, [calcValues]);

  if (!isOpen || selectedCards.length === 0) return null;

  const formatRating = (rating: number) => rating.toFixed(1);
  const formatUserCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  // Get visible keys based on selected categories
  const visibleKeys = selectedCategories.includes("All")
    ? ALL_KEYS
    : CATEGORY_QUESTIONS.filter(c => selectedCategories.includes(c.name)).flatMap(c => c.keys);

  // Handle category toggle
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

  // Handle spending value change
  const handleCalcValueChange = (key: string, value: number) => {
    setCalcValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategoryExpansion = (cardAlias: string, category: string) => {
    setExpandedCategories(prev => {
      const newExpanded = { ...prev };
      if (!newExpanded[cardAlias]) {
        newExpanded[cardAlias] = new Set();
      }
      
      const cardExpanded = new Set(newExpanded[cardAlias]);
      if (cardExpanded.has(category)) {
        cardExpanded.delete(category);
      } else {
        cardExpanded.add(category);
      }
      
      newExpanded[cardAlias] = cardExpanded;
      return newExpanded;
    });
  };

  const isCategoryExpanded = (cardAlias: string, category: string) => {
    return expandedCategories[cardAlias]?.has(category) || false;
  };

  // Helper function to group redemption options by method
  const groupRedemptionOptions = (options: RedemptionOption[]) => {
    const grouped: Record<string, RedemptionOption[]> = {};
    
    options.forEach(option => {
      const method = option.method || 'Other';
      if (!grouped[method]) {
        grouped[method] = [];
      }
      grouped[method].push(option);
    });
    
    return grouped;
  };

  // Helper function to format conversion rate for better understanding
  const formatConversionRate = (rate: string): { display: string; explanation: string } => {
    if (!rate || rate === 'N/A') {
      return { display: 'N/A', explanation: 'Rate not available' };
    }

    const numRate = parseFloat(rate);
    if (isNaN(numRate)) {
      return { display: rate, explanation: 'Custom rate' };
    }

    // Format as 1 R.P = ₹X.XX
    const rupeeValue = numRate.toFixed(2);
    return { 
      display: `1 R.P = ₹${rupeeValue}`, 
      explanation: `1 Reward Point equals ₹${rupeeValue}` 
    };
  };

  // Validation function to ensure spending values are properly set
  const validateSpendingValues = (values: Record<string, number>, visibleKeys: string[]) => {
    const issues: string[] = [];
    
    // Check if we have any spending values
    const totalSpending = visibleKeys.reduce((sum, key) => sum + (values[key] || 0), 0);
    if (totalSpending === 0) {
      issues.push('No spending values entered');
    }
    
    // Check for negative values
    visibleKeys.forEach(key => {
      if (values[key] < 0) {
        issues.push(`Negative value for ${key}: ${values[key]}`);
      }
    });
    
    // Check for unreasonably high values (over 1 crore)
    visibleKeys.forEach(key => {
      if (values[key] > 10000000) {
        issues.push(`Unreasonably high value for ${key}: ${values[key]}`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues,
      totalSpending
    };
  };

  // Process card savings data (same logic as CardDetail)
  const processCardSavingsData = (cardData: any, userSpending: Record<string, number>) => {
    const processed = { ...cardData };
    
    // Extract key savings values from API response
    processed.total_savings_yearly = extractValueByTag(cardData, 'total_savings_yearly') || 0;
    processed.joining_fees = extractValueByTag(cardData, 'joining_fees') || 0;
    processed.net_savings = extractValueByTag(cardData, 'roi') || (processed.total_savings_yearly - processed.joining_fees);
    
    // Extract spending breakdown from API response
    if (cardData.spending_breakdown_array && Array.isArray(cardData.spending_breakdown_array)) {
      processed.spending_breakdown_array = cardData.spending_breakdown_array.map((item: any) => {
        const userAmount = userSpending[item.on] || 0;
        return {
          on: item.on,
          spend: item.spend || userAmount,
          savings: item.savings || 0,
          maxCap: item.maxCap || 0,
          totalMaxCap: item.totalMaxCap || 0,
          cashback_percentage: item.cashback_percentage || "0",
          explanation: item.explanation || []
        };
      });
    }
    
    return processed;
  };

  // Extract value by tag (same logic as CardDetail)
  const extractValueByTag = (cardData: any, tag: string): number => {
    // Search in product_usps array
    if (cardData.product_usps && Array.isArray(cardData.product_usps)) {
      const uspItem = cardData.product_usps.find((item: any) => 
        item.tag === tag || 
        (item.description && item.description.toLowerCase().includes(tag.replace('_', ' ')))
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
    
    return 0;
  };

  // Helper function to extract numeric value from string
  const extractNumericValue = (str: string): number | null => {
    if (!str) return null;
    const cleanStr = str.replace(/[₹,]/g, '').trim();
    const match = cleanStr.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : null;
  };

  // Handle spending calculation submit
  const handleCalcSubmit = async () => {
    setCalcLoading(true);
    setCalcError("");
    setCalcResults({});
    setShowResults(false);
    
    try {
      const results: Record<string, any> = {};
      
      // Create a stable copy of calcValues to prevent any state changes during API calls
      const stableCalcValues = { ...calcValues };
      const stableVisibleKeys = [...visibleKeys];
      
      // Validate spending values before making API calls
      const validation = validateSpendingValues(stableCalcValues, stableVisibleKeys);
      if (!validation.isValid) {
        setCalcError(`Invalid spending data: ${validation.issues.join(', ')}`);
        return;
      }
      
      console.log('✅ Spending validation passed:', {
        totalSpending: validation.totalSpending,
        categoriesWithSpending: stableVisibleKeys.filter(key => stableCalcValues[key] > 0).length
      });
      
      console.log('Starting API calls with stable values:', {
        calcValues: stableCalcValues,
        visibleKeys: stableVisibleKeys,
        selectedCards: selectedCards.map(c => ({ name: c.name, alias: c.seo_card_alias }))
      });
      
      // Calculate for each selected card with proper error handling and validation
      for (let i = 0; i < selectedCards.length; i++) {
        const card = selectedCards[i];
        
        try {
          // Create a fresh payload for each card to prevent any cross-contamination
          const payload: Record<string, any> = {
            selected_card_id: null, // Use null like other working pages
            spending_breakdown_array: []
          };
          
          // Add individual spending values (include all fields like other working pages)
          for (const k of ALL_KEYS) {
            const value = stableCalcValues[k] || 0;
            payload[k] = value;
            
            // Validate that the value is properly set
            if (stableVisibleKeys.includes(k) && stableCalcValues[k] > 0 && payload[k] !== stableCalcValues[k]) {
              console.warn(`Value mismatch for ${k}: expected ${stableCalcValues[k]}, got ${payload[k]}`);
            }
          }
          
          // Add additional fields that might be required by the API
          payload.ott_channels = 0;
          payload.new_monthly_cat_1 = 0;
          payload.new_monthly_cat_2 = 0;
          payload.new_monthly_cat_3 = 0;
          payload.large_electronics_purchase_like_mobile_tv_etc = 0;
          payload.all_pharmacy = 0;
          payload.new_cat_1 = 0;
          payload.new_cat_2 = 0;
          payload.new_cat_3 = 0;
          payload.railway_lounge_usage_quarterly = 0;
          payload.movie_usage = 0;
          payload.movie_mov = 0;
          payload.dining_usage = 0;
          payload.dining_mov = 0;
          
          // Create spending breakdown array for API with proper structure (same as CardDetail)
          const spendingBreakdownArray: any[] = [];
          stableVisibleKeys.forEach(key => {
            const spendValue = stableCalcValues[key] || 0;
            if (spendValue > 0) {
              spendingBreakdownArray.push({
                category: key,
                amount_spent: spendValue,
                user_input: spendValue
              });
            }
          });
          
          payload.spending_breakdown_array = spendingBreakdownArray;
          
          // Validate payload before sending
          const totalSpending = stableVisibleKeys.reduce((sum, key) => sum + (stableCalcValues[key] || 0), 0);
          const breakdownTotal = spendingBreakdownArray.reduce((sum, item) => sum + item.amount_spent, 0);
          
          console.log(`API Call ${i + 1}/${selectedCards.length} for ${card.name}:`, {
            cardAlias: card.seo_card_alias,
            totalSpending,
            breakdownTotal,
            breakdownCount: spendingBreakdownArray.length,
            payload: payload
          });
          
          // Validate that we have spending data
          if (totalSpending === 0) {
            console.warn(`No spending data for ${card.name}`);
            continue;
          }
          
          if (breakdownTotal === 0) {
            console.warn(`No breakdown data for ${card.name}`);
            continue;
          }
          
          const data = await cardService.getCardGeniusDataForCard(card.seo_card_alias, payload);
          console.log(`API Response ${i + 1}/${selectedCards.length} for ${card.name}:`, {
            dataKeys: Object.keys(data || {}),
            foundCard: data ? 'YES' : 'NO'
          });
          
          // The data is already the specific card data
          const found = data;
          
          if (found) {
            const processedResult = processCardSavingsData(found, stableCalcValues);
            results[card.seo_card_alias] = processedResult;
            console.log(`✅ Successfully processed ${card.name} with savings: ₹${processedResult.total_savings_yearly || 0}`);
          } else {
            console.warn(`❌ Card ${card.name} (${card.seo_card_alias}) not found in API response`);
            console.warn('Available cards in response:', data.savings?.map((c: any) => c.seo_card_alias) || []);
          }
          
        } catch (cardError) {
          console.error(`❌ Error processing card ${card.name}:`, cardError);
          // Continue with other cards even if one fails
          continue;
        }
      }
      
      // Final validation and results processing
      console.log('Final results summary:', {
        totalCards: selectedCards.length,
        successfulCards: Object.keys(results).length,
        results: Object.keys(results)
      });
      
      if (Object.keys(results).length === 0) {
        setCalcError('No cards found in API response. Please check your spending inputs and try again.');
        return;
      }
      
      setCalcResults(results);
      setShowResults(true);
      
    } catch (err) {
      console.error('❌ Overall calculation error:', err);
      setCalcError(`Failed to calculate savings: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setCalcLoading(false);
    }
  };

  // Generate comparison data for charts
  const getComparisonData = () => {
    if (!showResults || Object.keys(calcResults).length === 0) return [];
    
    return selectedCards.map(card => {
      const result = calcResults[card.seo_card_alias];
      return {
        name: card.name,
        totalSavings: result?.total_savings_yearly || 0,
        joiningFees: result?.joining_fees || 0,
        netSavings: result?.net_savings || 0,
        card: card
      };
    }).sort((a, b) => b.netSavings - a.netSavings);
  };

  // Generate pie chart data for category breakdown
  const getCategoryBreakdownData = (cardAlias: string) => {
    const result = calcResults[cardAlias];
    if (!result?.spending_breakdown_array) return [];
    
    return result.spending_breakdown_array
      .filter((item: any) => item.savings > 0)
      .map((item: any, index: number) => ({
        name: item.on.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: item.savings,
        color: `hsl(${index * 60}, 70%, 50%)`
      }));
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
      return annualFeeWaiver;
    }
  };

  // Function to render redemption catalogue with clickable link
  const renderRedemptionCatalogue = (catalogue?: string) => {
    if (!catalogue) return <span className="text-muted-foreground">Not specified</span>;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = catalogue.match(urlRegex);
    
    if (match && match[0]) {
      return (
        <div className="space-y-1">
          <span>{catalogue.replace(urlRegex, '').trim()}</span>
          <a 
            href={match[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:text-primary/80 text-xs font-medium underline transition-colors"
          >
            Click here
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      );
    } else {
      return <span>{catalogue}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full bg-background rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold">Compare Cards</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedCards.length} card{selectedCards.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Card Names Comparison Header */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center space-x-4">
              {selectedCards.map((card, index) => (
                <React.Fragment key={card.id}>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-10 h-6 object-contain rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <span className="text-sm font-semibold text-blue-900 truncate max-w-32">
                      {card.name}
                    </span>
                  </div>
                  {index < selectedCards.length - 1 && (
                    <div className="text-lg font-bold text-muted-foreground">VS</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 z-10 bg-background border-b">
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 mb-0">
                <TabsTrigger value="textual" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Textual Comparison</span>
                </TabsTrigger>
                <TabsTrigger value="spending" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Spending Comparison</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="textual" className="p-4 space-y-6">
              {/* Basic Information Section */}
              <UICard className="shadow-card border-l-4 border-blue-500">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="text-xl flex items-center">
                    <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-4">
                        <div className="text-center">
                          <div className="w-32 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3">
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={card.name}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <CreditCard className="h-10 w-10 text-white" />
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-blue-900 line-clamp-2">{card.name}</h3>
                          <p className="text-sm text-blue-700">{card.bank_name}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-800 font-medium">Rating:</span>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-blue-900">{formatRating(card.rating)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-800 font-medium">Reviews:</span>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="font-bold text-blue-900">{formatUserCount(card.user_rating_count)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-800 font-medium">Type:</span>
                            <Badge className="bg-blue-600 text-white text-xs">
                              {card.card_type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-800 font-medium">Network:</span>
                            <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                              {card.card_network}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Fees & Charges Section */}
              <UICard className="shadow-card border-l-4 border-green-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-6 w-6 mr-3 text-green-600" />
                    Fees & Charges
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <Award className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">Joining Fee</span>
                          </div>
                          <span className="text-xl font-bold text-green-900">
                            {card.joining_fee_text || (card.joining_fee ? `₹${card.joining_fee}` : 'Free')}
                          </span>
                          <p className="text-xs text-green-700 mt-2">
                            {getJoiningFeeDescription(card.joining_fee_offset)}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                          <div className="flex items-center mb-2">
                            <Shield className="h-4 w-4 text-emerald-600 mr-2" />
                            <span className="text-sm font-medium text-emerald-800">Annual Fee</span>
                          </div>
                          <span className="text-xl font-bold text-emerald-900">
                            {card.annual_fee_text || (card.annual_fee ? `₹${card.annual_fee}` : 'Free')}
                          </span>
                          <p className="text-xs text-emerald-700 mt-2">
                            {getAnnualFeeDescription(card.annual_fee_waiver)}
                          </p>
                        </div>
                        

                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Eligibility Section - Salaried */}
              <UICard className="shadow-card border-l-4 border-purple-500">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-purple-600" />
                    Eligibility Criteria - Salaried
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-800">Age Criteria</span>
                          </div>
                          <span className="text-lg font-bold text-purple-900">
                            {card.age_criteria || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center mb-2">
                            <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-800">Credit Rating</span>
                          </div>
                          <span className="text-lg font-bold text-purple-900">
                            {card.crif || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center mb-2">
                            <DollarSign className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-800">Income Criteria</span>
                          </div>
                          <span className="text-lg font-bold text-purple-900">
                            {card.income_salaried || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Eligibility Section - Self Employed */}
              <UICard className="shadow-card border-l-4 border-indigo-500">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-indigo-600" />
                    Eligibility Criteria - Self Employed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-4">
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium text-indigo-800">Age Criteria</span>
                          </div>
                          <span className="text-lg font-bold text-indigo-900">
                            {card.age_self_emp || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center mb-2">
                            <TrendingUp className="h-4 w-4 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium text-indigo-800">Credit Rating</span>
                          </div>
                          <span className="text-lg font-bold text-indigo-900">
                            {card.crif_self_emp || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center mb-2">
                            <DollarSign className="h-4 w-4 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium text-indigo-800">Income Criteria</span>
                          </div>
                          <span className="text-lg font-bold text-indigo-900">
                            {card.income_self_emp || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* How to Redeem Section */}
              <UICard className="shadow-card border-l-4 border-orange-500">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-6 w-6 mr-3 text-orange-600" />
                    How to Redeem
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-4">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center mb-2">
                            <TrendingUp className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-800">Points Value</span>
                          </div>
                          <span className="text-sm text-orange-900">
                            {card.reward_conversion_rate || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center mb-2">
                            <Award className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-800">Redeem For</span>
                          </div>
                          <span className="text-sm text-orange-900">
                            {card.redemption_options || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center mb-2">
                            <Info className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-800">Catalogue</span>
                          </div>
                          <div className="text-sm text-orange-900">
                            {renderRedemptionCatalogue(card.redemption_catalogue)}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                          <div className="flex items-center mb-2">
                            <X className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-800">Exclusion Spends</span>
                          </div>
                          <ScrollArea className="h-24">
                            <div className="text-sm text-red-900">
                              {card.exclusion_spends ? (
                                <ul className="space-y-1">
                                  {card.exclusion_spends.split(/\r?\n|,|•|\u2022/).map((item, idx) => {
                                    const trimmed = item.trim();
                                    return trimmed ? (
                                      <li key={idx} className="flex items-start">
                                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                        <span>{trimmed}</span>
                                      </li>
                                    ) : null;
                                  })}
                                </ul>
                              ) : (
                                <span>Not specified</span>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Product USPs Section */}
              {selectedCards.some(card => card.product_usps && card.product_usps.length > 0) && (
                <UICard className="shadow-card border-l-4 border-pink-500">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100">
                    <CardTitle className="text-xl flex items-center">
                      <Sparkles className="h-6 w-6 mr-3 text-pink-600" />
                      Product USPs & Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedCards.map((card) => (
                        <div key={card.id} className="space-y-4">
                          {card.product_usps && card.product_usps.length > 0 ? (
                            card.product_usps.map((usp: any, idx: number) => (
                              <div key={idx} className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                                <div className="flex items-center mb-3">
                                  <div className="p-2 bg-pink-200 rounded-lg mr-3">
                                    <Zap className="h-4 w-4 text-pink-700" />
                                  </div>
                                  <h3 className="font-bold text-pink-900">
                                    {usp.header || usp.name || `Feature ${idx + 1}`}
                                  </h3>
                                </div>
                                <p className="text-pink-800 leading-relaxed text-sm">
                                  {usp.description || usp.comment || (typeof usp === 'string' ? usp : JSON.stringify(usp))}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                              <p className="text-pink-800 text-sm">No USPs available</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </UICard>
              )}
            </TabsContent>

            <TabsContent value="spending" className="p-4 space-y-6">
              {!showResults ? (
                <>
                  {/* Category Selection */}
                  <UICard className="shadow-lg border-l-4 border-blue-500">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                      <CardTitle className="text-xl flex items-center">
                        <Target className="h-6 w-6 mr-3 text-blue-600" />
                        Select Spending Categories
                      </CardTitle>
                      <p className="text-sm text-blue-700">
                        Choose the categories that match your spending patterns to get accurate savings comparison
                  </p>
                </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-3 mb-6">
                        {CATEGORY_QUESTIONS.map((category) => (
                          <Badge
                            key={category.name}
                            variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              selectedCategories.includes(category.name)
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-primary/10"
                            }`}
                            onClick={() => handleCategoryToggle(category.name)}
                          >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Spending Input Form */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Enter Your Spending Details</h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {visibleKeys.filter(key => calcValues[key] > 0).length} categories filled
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {visibleKeys.map((key) => {
                            const meta = QUESTION_META[key as keyof typeof QUESTION_META];
                            if (!meta) return null;
                            
                            return (
                              <div key={key} className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">
                                  {meta.label}
                                </label>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="number"
                                    min={meta.min}
                                    max={meta.max}
                                    step={meta.step}
                                    value={calcValues[key] || ''}
                                    onChange={(e) => handleCalcValueChange(key, Number(e.target.value) || 0)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                  />
                                  <span className="text-sm text-gray-500">₹</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Min: ₹{meta.min.toLocaleString()}</span>
                                  <span>Max: ₹{meta.max.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Spending Summary */}
                        {visibleKeys.filter(key => calcValues[key] > 0).length > 0 && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-green-900">Your Spending Summary</h4>
                              <Badge variant="default" className="bg-green-600 text-white">
                                {visibleKeys.filter(key => calcValues[key] > 0).length} Categories
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-700">
                                  ₹{visibleKeys.reduce((sum, key) => sum + (calcValues[key] || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-green-600">Total Monthly</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-700">
                                  ₹{(visibleKeys.reduce((sum, key) => sum + (calcValues[key] || 0), 0) * 12).toLocaleString()}
                                </div>
                                <div className="text-xs text-green-600">Total Annual</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-700">
                                  {visibleKeys.filter(key => calcValues[key] > 0).length}
                                </div>
                                <div className="text-xs text-green-600">Categories</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Calculate Button */}
                        <div className="flex justify-center pt-6">
                          <Button
                            onClick={handleCalcSubmit}
                            disabled={calcLoading || visibleKeys.filter(key => calcValues[key] > 0).length === 0}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
                          >
                            {calcLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Calculating Savings...
                              </>
                            ) : (
                              <>
                                <Calculator className="h-5 w-5 mr-2" />
                                Compare Savings
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {calcError && (
                          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{calcError}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </UICard>
                </>
              ) : (
                <>
                  {/* Results Header */}
                  <UICard className="shadow-lg border-l-4 border-green-500">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                      <CardTitle className="text-xl flex items-center justify-between">
                        <div className="flex items-center">
                          <PiggyBank className="h-6 w-6 mr-3 text-green-600" />
                          Savings Comparison Results
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResults(false)}
                          className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                          ← Back to Input
                        </Button>
                      </CardTitle>
                      <p className="text-sm text-green-700">
                        Compare potential savings across {selectedCards.length} cards based on your spending
                      </p>
                    </CardHeader>
                  </UICard>

                  {/* Overall Comparison Chart */}
                  <UICard className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <BarChart3 className="h-6 w-6 mr-3 text-primary" />
                        Overall Savings Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getComparisonData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              fontSize={12}
                            />
                            <YAxis fontSize={12} />
                            <Tooltip 
                              formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                              labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar 
                              dataKey="totalSavings" 
                              fill="#10B981" 
                              radius={[4, 4, 0, 0]}
                              name="Total Savings"
                            />
                            <Bar 
                              dataKey="joiningFees" 
                              fill="#EF4444" 
                              radius={[4, 4, 0, 0]}
                              name="Joining Fees"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                  </div>
                </CardContent>
              </UICard>

                  {/* Enhanced Card Comparison Results */}
                  <div className="space-y-8">
                    {/* Common Header for All Cards */}
                    <UICard className="shadow-lg border-l-4 border-purple-500">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                        <CardTitle className="text-2xl flex items-center justify-between">
                          <div className="flex items-center">
                            <Crown className="h-8 w-8 mr-3 text-purple-600" />
                            <div>
                              <div className="font-bold text-purple-900">Detailed Card Comparison</div>
                              <div className="text-sm font-normal text-purple-700">
                                Compare {selectedCards.length} cards based on your spending pattern
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                              <Target className="h-4 w-4 mr-1" />
                              {visibleKeys.filter(key => calcValues[key] > 0).length} Categories
                            </Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              ₹{visibleKeys.reduce((sum, key) => sum + (calcValues[key] || 0), 0).toLocaleString()}/month
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </UICard>

                    {/* Cards in Single Row Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {selectedCards.map((card, index) => {
                        const result = calcResults[card.seo_card_alias];
                        if (!result) return null;
                        
                        const netSavings = result.net_savings || 0;
                        const totalSavings = result.total_savings_yearly || 0;
                        const joiningFees = result.joining_fees || 0;
                        const categoryData = getCategoryBreakdownData(card.seo_card_alias);
                        const roi = totalSavings > 0 ? ((netSavings / totalSavings) * 100) : 0;
                        
                        return (
                          <UICard 
                            key={card.id} 
                            className={`shadow-xl border-l-4 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                              index === 0 ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' :
                              index === 1 ? 'border-gray-500 bg-gradient-to-br from-gray-50 to-slate-50' :
                              'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                            }`}
                            style={{ animationDelay: `${index * 200}ms` }}
                          >
                            {/* Card Header with Ranking */}
                            <CardHeader className={`${
                              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-100' :
                              index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-100' :
                              'bg-gradient-to-r from-orange-50 to-red-100'
                            }`}>
                              <CardTitle className="text-lg flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="relative">
                                    <img
                                      src={card.image}
                                      alt={card.name}
                                      className="w-10 h-6 object-contain rounded mr-3 border border-gray-200"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder.svg';
                                      }}
                                    />
                                    {index === 0 && (
                                      <div className="absolute -top-2 -right-2">
                                        <Crown className="h-4 w-4 text-yellow-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{card.name}</div>
                                    <div className="text-xs text-gray-600">{card.bank_name}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <Badge 
                                    variant="default" 
                                    className={`text-sm font-bold ${
                                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 
                                      index === 1 ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white' : 
                                      'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                    }`}
                                  >
                                    #{index + 1}
                                  </Badge>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {index === 0 ? 'Best Value' : index === 1 ? 'Good Value' : 'Consider'}
                                  </div>
                                </div>
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                              {/* Enhanced Savings Summary with Animations */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
                                  <div className="text-2xl font-bold text-green-700 mb-1">
                                    ₹{totalSavings.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">Total Savings</div>
                                  <div className="text-xs text-green-500 mt-1">Per Year</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300">
                                  <div className="text-2xl font-bold text-red-700 mb-1">
                                    ₹{joiningFees.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-red-600 font-medium">Joining Fees</div>
                                  <div className="text-xs text-red-500 mt-1">One Time</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                                  <div className="text-2xl font-bold text-blue-700 mb-1">
                                    ₹{netSavings.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-blue-600 font-medium">Net Savings</div>
                                  <div className="text-xs text-blue-500 mt-1">{roi.toFixed(1)}% ROI</div>
                                </div>
                              </div>

                              {/* Enhanced Category Breakdown Chart */}
                              {categoryData.length > 0 && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                      <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                                      Savings by Category
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {categoryData.length} Categories
                                    </Badge>
                                  </div>
                                  <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsPieChart>
                                        <Pie
                                          data={categoryData}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                                          outerRadius={70}
                                          fill="#8884d8"
                                          dataKey="value"
                                          animationDuration={1000}
                                          animationBegin={index * 200}
                                        >
                                          {categoryData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                          ))}
                                        </Pie>
                                        <Tooltip 
                                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Savings']}
                                          contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #ccc',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                          }}
                                        />
                                        <Legend 
                                          layout="vertical" 
                                          verticalAlign="middle" 
                                          align="right"
                                          wrapperStyle={{ fontSize: '12px' }}
                                        />
                                      </RechartsPieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}

                              {/* Enhanced Category Details with Collapsible Breakdown */}
                              {result.spending_breakdown_array && result.spending_breakdown_array.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-gray-900 flex items-center">
                                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                                    Category Breakdown
                                  </h4>
                                  <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {result.spending_breakdown_array
                                      .filter((item: any) => item.savings > 0)
                                      .map((item: any, idx: number) => {
                                        const percentage = totalSavings > 0 ? (item.savings / totalSavings) * 100 : 0;
                                        const categoryName = item.on.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        const isExpanded = isCategoryExpanded(card.seo_card_alias, item.on);
                                        
                                        return (
                                          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Category Header - Always Visible */}
                                            <div 
                                              className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                              onClick={() => toggleCategoryExpansion(card.seo_card_alias, item.on)}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  <span className="text-sm font-medium text-gray-700">
                                                    {categoryName}
                                                  </span>
                                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                    {percentage.toFixed(1)}%
                                                  </Badge>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-sm font-bold text-green-600">
                                                    ₹{item.savings.toLocaleString()}
                                                  </span>
                                                  {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                                  ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                                  )}
                                                </div>
                                              </div>
                                              <Progress 
                                                value={percentage} 
                                                className="h-2 mt-2"
                                                style={{
                                                  '--progress-background': '#e5e7eb',
                                                  '--progress-foreground': index === 0 ? '#f59e0b' : 
                                                                          index === 1 ? '#6b7280' : '#ea580c'
                                                } as React.CSSProperties}
                                              />
                                            </div>

                                            {/* Collapsible Detailed Information */}
                                            {isExpanded && (
                                              <div className="p-4 bg-white space-y-4 border-t border-gray-200">
                                                {/* User Spending Information */}
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                      <CreditCard className="h-4 w-4 text-blue-600" />
                                                      <span className="text-sm font-medium text-blue-700">Your Spending</span>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="text-lg font-bold text-blue-600">
                                                        ₹{item.spend?.toLocaleString() || calcValues[item.on]?.toLocaleString() || '0'}
                                                      </div>
                                                      <div className="text-xs text-blue-600">Monthly</div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Cashback and Cap Information */}
                                                {item.cashback_percentage && (
                                                  <div className="bg-green-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <div className="flex items-center space-x-2">
                                                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-700">Cashback Rate</span>
                                                      </div>
                                                      <div className="text-right">
                                                        <div className="text-lg font-bold text-green-600">
                                                          {item.cashback_percentage}%
                                                        </div>
                                                      </div>
                                                    </div>
                                                    {item.maxCap && (
                                                      <div className="flex items-center justify-between text-sm">
                                                        <span className="text-green-700">Maximum Cap:</span>
                                                        <span className="text-green-800 font-medium">₹{item.maxCap.toLocaleString()}</span>
                                                      </div>
                                                    )}
                                                    {item.totalMaxCap && (
                                                      <div className="flex items-center justify-between text-sm">
                                                        <span className="text-green-700">Total Cap:</span>
                                                        <span className="text-green-800 font-medium">₹{item.totalMaxCap.toLocaleString()}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}

                                                {/* Savings Breakdown */}
                                                <div className="bg-purple-50 rounded-lg p-3">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                      <PiggyBank className="h-4 w-4 text-purple-600" />
                                                      <span className="text-sm font-medium text-purple-700">Annual Savings</span>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="text-lg font-bold text-purple-600">
                                                        ₹{item.savings.toLocaleString()}
                                                      </div>
                                                      <div className="text-xs text-purple-600">
                                                        {percentage.toFixed(1)}% of total
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Explanation */}
                                                {item.explanation && item.explanation.length > 0 && (
                                                  <div className="bg-yellow-50 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                      <Info className="h-4 w-4 text-yellow-600" />
                                                      <span className="text-sm font-medium text-yellow-700">How it works</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                      {item.explanation.map((explanation: string, expIdx: number) => (
                                                        <div 
                                                          key={expIdx} 
                                                          className="text-sm text-yellow-800 leading-relaxed"
                                                          dangerouslySetInnerHTML={{ __html: explanation }}
                                                        />
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Additional Details */}
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="font-semibold text-gray-700">
                                                      ₹{((item.spend || calcValues[item.on] || 0) * 12).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Annual Spend</div>
                                                  </div>
                                                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="font-semibold text-gray-700">
                                                      {item.cashback_percentage ? `${item.cashback_percentage}%` : 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Cashback Rate</div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}

                              {/* Additional Card Information */}
                              <div className="space-y-3 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-700">
                                      {card.card_network}
                                    </div>
                                    <div className="text-xs text-gray-500">Network</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-700">
                                      {card.annual_fee || 'Free'}
                                    </div>
                                    <div className="text-xs text-gray-500">Annual Fee</div>
                                  </div>
                                </div>
                                
                                {/* Key Features */}
                                {card.key_features && card.key_features.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-600">Key Features:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {card.key_features.slice(0, 3).map((feature: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                      {card.key_features.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{card.key_features.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </UICard>
                        );
                      })}
                    </div>

                    {/* Summary Statistics */}
                    <UICard className="shadow-lg border-l-4 border-green-500">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                        <CardTitle className="text-xl flex items-center">
                          <BarChart3 className="h-6 w-6 mr-3 text-green-600" />
                          Comparison Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              ₹{Math.max(...selectedCards.map(card => calcResults[card.seo_card_alias]?.net_savings || 0)).toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600">Best Net Savings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">
                              ₹{(selectedCards.reduce((sum, card) => sum + (calcResults[card.seo_card_alias]?.total_savings_yearly || 0), 0) / selectedCards.length).toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-600">Average Savings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-700">
                              ₹{Math.min(...selectedCards.map(card => calcResults[card.seo_card_alias]?.joining_fees || 0)).toLocaleString()}
                            </div>
                            <div className="text-sm text-purple-600">Lowest Joining Fee</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">
                              {selectedCards.length}
                            </div>
                            <div className="text-sm text-orange-600">Cards Compared</div>
                          </div>
                        </div>
                      </CardContent>
                    </UICard>

                    {/* Redemption Options Section */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Gift className="h-5 w-5 mr-2 text-purple-600" />
                          Reward Point Redemption Comparison
                        </h3>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          R.P Values
                        </Badge>
                      </div>
                      
                      {/* Conversion Rate Explanation */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-blue-900 text-sm mb-2">Understanding Reward Point Values</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p><strong>1 R.P = ₹1.00</strong> = Standard conversion rate</p>
                              <p><strong>1 R.P = ₹0.50</strong> = Lower value (2 points = ₹1)</p>
                              <p><strong>1 R.P = ₹2.00</strong> = Higher value (better redemption)</p>
                              <p className="text-xs text-blue-600 mt-2">R.P = Reward Points. Higher rupee values mean better reward value!</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {selectedCards.map((card, index) => {
                          const result = calcResults[card.seo_card_alias];
                          const redemptionOptions = result?.redemption_options || [];
                          const groupedOptions = groupRedemptionOptions(redemptionOptions);
                          const methodCount = Object.keys(groupedOptions).length;
                          const totalOptions = redemptionOptions.length;
                          
                          return (
                            <UICard 
                              key={`redemption-${card.seo_card_alias}`} 
                              className={`shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                                index === 0 ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' :
                                index === 1 ? 'border-gray-500 bg-gradient-to-br from-gray-50 to-slate-50' :
                                'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              }`}
                            >
                              <CardHeader className={`${
                                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-100' :
                                index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-100' :
                                'bg-gradient-to-r from-orange-50 to-red-100'
                              }`}>
                                <CardTitle className="text-lg flex items-center justify-between">
                                  <div className="flex items-center">
                                    <img
                                      src={card.image}
                                      alt={card.name}
                                      className="w-8 h-5 object-contain rounded mr-2 border border-gray-200"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder.svg';
                                      }}
                                    />
                                    <div>
                                      <div className="font-semibold text-gray-900 text-sm">{card.name}</div>
                                      <div className="text-xs text-gray-600">{card.bank_name}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                      {totalOptions} Options
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {methodCount} Methods
                                    </Badge>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              
                              <CardContent className="p-4">
                                {totalOptions === 0 ? (
                                  <div className="text-center py-6">
                                    <Gift className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500">No redemption options available</p>
                                    <p className="text-xs text-gray-400 mt-1">This card may not have redemption data configured</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {Object.entries(groupedOptions).map(([method, options]) => {
                                      const Icon = METHOD_ICONS[method] || METHOD_ICONS.default;
                                      const colorClass = METHOD_COLORS[method] || METHOD_COLORS.default;
                                      
                                      return (
                                        <div key={method} className="border border-gray-100 rounded-lg overflow-hidden">
                                          <div className={`p-3 ${colorClass} border-b border-gray-100`}>
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <Icon className="h-4 w-4" />
                                                <span className="font-medium text-sm">{method}</span>
                                              </div>
                                              <Badge variant="secondary" className="bg-white/50 text-xs">
                                                {options.length}
                                              </Badge>
                                            </div>
                                          </div>
                                          
                                          <div className="p-3 bg-gray-50">
                                            <div className="space-y-2">
                                                                                             {options.map((option, idx) => {
                                                 const formattedRate = formatConversionRate(option.conversion_rate);
                                                 return (
                                                   <div key={idx} className="flex items-center justify-between text-sm">
                                                     <div className="flex items-center space-x-2">
                                                       <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                       <span className="font-medium text-gray-700">{option.brand || 'N/A'}</span>
                                                     </div>
                                                     <div className="flex flex-col items-end">
                                                       <Badge 
                                                         variant="outline" 
                                                         className={`text-xs ${
                                                           formattedRate.display === 'N/A' 
                                                             ? 'bg-gray-50 text-gray-500 border-gray-200' 
                                                             : formattedRate.display.includes('₹') && parseFloat(formattedRate.display.split('₹')[1]) > 1
                                                             ? 'bg-green-100 text-green-800 border-green-300' 
                                                             : formattedRate.display.includes('₹1.00')
                                                             ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                             : 'bg-orange-100 text-orange-800 border-orange-300'
                                                         }`}
                                                         title={formattedRate.explanation}
                                                       >
                                                         {formattedRate.display}
                                                       </Badge>
                                                       <div className="text-xs text-gray-500 mt-1 max-w-24 text-right">
                                                         {formattedRate.explanation}
                                                       </div>
                                                     </div>
                                                   </div>
                                                 );
                                               })}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </CardContent>
                            </UICard>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal; 