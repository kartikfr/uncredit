import React, { useState, useEffect } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Star, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Users, 
  Award, 
  Shield, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Zap, 
  Info, 
  ExternalLink, 
  Calculator, 
  Target, 
  PiggyBank, 
  Activity, 
  BarChart3, 
  PieChart, 
  Crown, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp as TrendingUpIcon, 
  Gift, 
  ShoppingBag, 
  Plane, 
  Car, 
  Home,
  Brain,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, cardService } from '@/services/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import CardGeniusResultsTable from './CardGeniusResultsTable';

// Category questions for UI display (same as ComparisonModal)
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

interface CardGeniusFilterProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: Card[];
  selectedCards: Card[];
  onApplyGenius: (filteredCards: Card[], geniusResults: Record<string, any>, spendingValues: Record<string, number>) => void;
  showResultsTab?: boolean;
  existingResults?: Record<string, any>;
  existingFilteredCards?: Card[];
  onCardClick?: (card: Card) => void;
  existingSpendingValues?: Record<string, number>;
}

interface SpendingBreakdown {
  on: string;
  spend: number;
  points_earned?: number;
  savings: number;
  explanation: string[];
  conv_rate?: number;
  cashback_percentage?: string;
  maxCap?: number;
  totalMaxCap?: number;
}

interface CardRecommendation {
  card_name: string;
  card_type: string;
  seo_card_alias: string;
  id: number;
  joining_fees: string | number;
  total_savings: number;
  total_savings_yearly: number;
  total_extra_benefits: number;
  max_potential_savings: string;
  spending_breakdown: Record<string, SpendingBreakdown>;
  spending_breakdown_array?: SpendingBreakdown[];
  lounges: number;
  name: string;
  card_bg_image: string;
  image: string;
  network_url: string;
  product_usps: any[];
}

const CardGeniusFilter: React.FC<CardGeniusFilterProps> = ({ 
  isOpen, 
  onClose, 
  allCards, 
  selectedCards, 
  onApplyGenius,
  showResultsTab = false,
  existingResults = {},
  existingFilteredCards = [],
  onCardClick,
  existingSpendingValues = {}
}) => {
  const [activeTab, setActiveTab] = useState(showResultsTab ? 'results' : 'spending');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [calcValues, setCalcValues] = useState<Record<string, number>>(() => {
    // Use existing spending values if provided, otherwise initialize with zeros
    const initialValues = Object.fromEntries(ALL_KEYS.map(k => [k, 0]));
    return { ...initialValues, ...existingSpendingValues };
  });
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcResults, setCalcResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, Set<string>>>({});

  // Handle showResultsTab prop
  useEffect(() => {
    if (showResultsTab && existingResults && Object.keys(existingResults).length > 0) {
      setActiveTab('results');
      setCalcResults(existingResults);
      setFilteredCards(existingFilteredCards);
      setShowResults(true);
    }
  }, [showResultsTab, existingResults, existingFilteredCards]);

  // Handle existingSpendingValues prop changes
  useEffect(() => {
    if (existingSpendingValues && Object.keys(existingSpendingValues).length > 0) {
      console.log('🔍 CardGeniusFilter: Updating spending values from props', {
        existingSpendingValues,
        spendingValuesCount: Object.keys(existingSpendingValues).length
      });
      setCalcValues(prev => ({ ...prev, ...existingSpendingValues }));
      
      // If we have existing spending values and we're showing results, set edit mode
      if (showResultsTab && Object.keys(existingResults).length > 0) {
        setIsEditMode(true);
      }
    }
  }, [existingSpendingValues, showResultsTab, existingResults]);

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

  // Process card savings data
  const processCardSavingsData = (cardData: any, userSpending: Record<string, number>) => {
    const processed = { ...cardData };
    
    console.log('🔍 PROCESSING CARD DATA:', {
      cardName: cardData.card_name || cardData.name,
      cardAlias: cardData.seo_card_alias,
      rawTotalSavingsYearly: cardData.total_savings_yearly,
      rawJoiningFees: cardData.joining_fees,
      dataKeys: Object.keys(cardData)
    });
    
    // Extract key savings values from API response with proper direct access
    processed.total_savings_yearly = Number(cardData.total_savings_yearly) || 0;
    processed.joining_fees = Number(cardData.joining_fees) || 0;
    
    // Calculate net savings: total_savings_yearly - joining_fees
    processed.net_savings = processed.total_savings_yearly - processed.joining_fees;
    
    // Additional validation to ensure we have valid numbers
    if (isNaN(processed.total_savings_yearly) || isNaN(processed.joining_fees)) {
      console.warn('⚠️ Invalid numeric values detected:', {
        rawTotalSavingsYearly: cardData.total_savings_yearly,
        rawJoiningFees: cardData.joining_fees,
        processedTotalSavingsYearly: processed.total_savings_yearly,
        processedJoiningFees: processed.joining_fees
      });
    }
    
    console.log('✅ CALCULATED VALUES:', {
      total_savings_yearly: processed.total_savings_yearly,
      joining_fees: processed.joining_fees,
      net_savings: processed.net_savings,
      calculation: `${processed.total_savings_yearly} - ${processed.joining_fees} = ${processed.net_savings}`
    });
    
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
          points_earned: item.points_earned || 0,
          explanation: item.explanation || []
        };
      });
    }
    
    return processed;
  };

  // Extract value by tag
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
      
      // Determine which cards to process
      const cardsToProcess = selectedCards.length > 0 ? selectedCards : allCards;
      
      console.log('Starting API calls with stable values:', {
        calcValues: stableCalcValues,
        visibleKeys: stableVisibleKeys,
        selectedCards: cardsToProcess.map(c => ({ name: c.name, seo_card_alias: c.seo_card_alias }))
      });
      
      // Calculate for each card with proper error handling and validation
      for (let i = 0; i < cardsToProcess.length; i++) {
        const card = cardsToProcess[i];
        
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
          
          // Create spending breakdown array for API with proper structure
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
          
          console.log(`API Call ${i + 1}/${cardsToProcess.length} for ${card.name}:`, {
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
          console.log(`API Response ${i + 1}/${cardsToProcess.length} for ${card.name}:`, {
            dataKeys: Object.keys(data || {}),
            foundCard: data ? 'YES' : 'NO',
            totalSavingsYearly: data?.total_savings_yearly,
            joiningFees: data?.joining_fees,
            rawData: data
          });
          
          // Test: Log the exact structure of the first card response
          if (i === 0 && data) {
            console.log('🔍 FIRST CARD API RESPONSE STRUCTURE:', {
              cardName: card.name,
              cardAlias: card.seo_card_alias,
              totalSavingsYearly: data.total_savings_yearly,
              joiningFees: data.joining_fees,
              netSavings: data.total_savings_yearly - data.joining_fees,
              fullResponse: JSON.stringify(data, null, 2)
            });
          }
          
          // The data is already the specific card data
          const found = data;
          
          if (found) {
            const processedResult = processCardSavingsData(found, stableCalcValues);
            results[card.seo_card_alias] = processedResult;
            console.log(`✅ Successfully processed ${card.name} with savings: ₹${processedResult.total_savings_yearly || 0}, net savings: ₹${processedResult.net_savings || 0}`);
          } else {
            console.warn(`❌ Card ${card.name} (${card.seo_card_alias}) not found in API response`);
          }
          
        } catch (cardError) {
          console.error(`❌ Error processing card ${card.name}:`, cardError);
          // Continue with other cards even if one fails
          continue;
        }
      }
      
      // Final validation and results processing
      console.log('Final results summary:', {
        totalCards: cardsToProcess.length,
        successfulCards: Object.keys(results).length,
        results: Object.keys(results)
      });
      
      // Test: Log detailed results for debugging
      console.log('🔍 DETAILED RESULTS FOR DEBUGGING:', results);
      
      if (Object.keys(results).length === 0) {
        setCalcError('No cards found in API response. Please check your spending inputs and try again.');
        return;
      }
      
      // Enhance the mapping with fallback strategies
      const enhancedResults = enhanceCardMapping(cardsToProcess, results);
      
      setCalcResults(enhancedResults);
      setShowResults(true);
      
      // Validate the enhanced mapping between Card Genius API and BankKaro cards
      const mappingValidation = validateCardMapping(cardsToProcess, enhancedResults);
      
      // Filter cards that have positive net savings and are available in BankKaro
      const cardsWithPositiveSavings = cardsToProcess.filter(card => {
        const result = enhancedResults[card.seo_card_alias];
        if (!result) {
          console.log(`❌ No result found for card ${card.name} (${card.seo_card_alias})`);
          return false;
        }
        
        const netSavings = result.net_savings || 0;
        console.log(`🔍 Card ${card.name}: net_savings = ${netSavings}, positive = ${netSavings > 0}`);
        return netSavings > 0;
      });
      
      // Additional validation: Ensure we have the complete card objects from BankKaro
      console.log('🔍 VALIDATING CARD MAPPING:', {
        totalCardsToProcess: cardsToProcess.length,
        cardsWithResults: Object.keys(enhancedResults).length,
        cardsWithPositiveSavings: cardsWithPositiveSavings.length,
        sampleCard: cardsWithPositiveSavings.length > 0 ? {
          name: cardsWithPositiveSavings[0].name,
          seo_card_alias: cardsWithPositiveSavings[0].seo_card_alias,
          hasCompleteData: !!cardsWithPositiveSavings[0].id && !!cardsWithPositiveSavings[0].name,
          resultKeys: Object.keys(enhancedResults[cardsWithPositiveSavings[0].seo_card_alias] || {})
        } : null
      });
      
      console.log('🔍 FILTERING RESULTS:', {
        totalCardsProcessed: cardsToProcess.length,
        cardsWithResults: Object.keys(enhancedResults).length,
        cardsWithPositiveSavings: cardsWithPositiveSavings.length,
        cardsWithPositiveSavingsDetails: cardsWithPositiveSavings.map(card => ({
          name: card.name,
          seo_card_alias: card.seo_card_alias,
          netSavings: enhancedResults[card.seo_card_alias]?.net_savings || 0
        }))
      });
      
      // Sort by net savings (descending)
      const sortedCards = cardsWithPositiveSavings.sort((a, b) => {
        const aResult = enhancedResults[a.seo_card_alias];
        const bResult = enhancedResults[b.seo_card_alias];
        const aNetSavings = aResult?.net_savings || 0;
        const bNetSavings = bResult?.net_savings || 0;
        return bNetSavings - aNetSavings;
      });
      
      console.log('🔍 SORTED CARDS:', {
        sortedCardsCount: sortedCards.length,
        sortedCardsDetails: sortedCards.map(card => ({
          name: card.name,
          seo_card_alias: card.seo_card_alias,
          netSavings: enhancedResults[card.seo_card_alias]?.net_savings || 0
        }))
      });
      
      setFilteredCards(sortedCards);
      
      // If in edit mode, switch back to results tab and clear edit mode
      if (isEditMode) {
        setIsEditMode(false);
        setActiveTab('results');
      }
      
    } catch (err) {
      console.error('❌ Overall calculation error:', err);
      setCalcError(`Failed to calculate savings: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setCalcLoading(false);
    }
  };

  // Handle apply genius filter
  const handleApplyGenius = () => {
    // Validate that we have the correct data before applying
    console.log('🔍 VALIDATING BEFORE APPLYING GENIUS FILTER:', {
      filteredCardsCount: filteredCards.length,
      filteredCards: filteredCards.map(c => ({ 
        name: c.name, 
        seo_card_alias: c.seo_card_alias,
        hasCompleteData: !!c.id && !!c.name && !!c.seo_card_alias
      })),
      resultsKeys: Object.keys(calcResults),
      resultsWithNetSavings: Object.entries(calcResults).filter(([alias, result]) => {
        const netSavings = result.net_savings || 0;
        return netSavings > 0;
      }).map(([alias, result]) => ({
        alias,
        cardName: result.card_name || result.name,
        totalSavingsYearly: result.total_savings_yearly,
        joiningFees: result.joining_fees,
        netSavings: result.net_savings,
        hasNetSavings: typeof result.net_savings === 'number'
      }))
    });
    
    // Ensure all filtered cards have corresponding results
    const validatedCards = filteredCards.filter(card => {
      const hasResult = !!calcResults[card.seo_card_alias];
      const hasPositiveSavings = calcResults[card.seo_card_alias]?.net_savings > 0;
      
      if (!hasResult) {
        console.warn(`⚠️ Card ${card.name} (${card.seo_card_alias}) has no result in calcResults`);
      }
      if (!hasPositiveSavings) {
        console.warn(`⚠️ Card ${card.name} (${card.seo_card_alias}) has no positive savings`);
      }
      
      return hasResult && hasPositiveSavings;
    });
    
    console.log('🔍 FINAL VALIDATED CARDS:', {
      originalCount: filteredCards.length,
      validatedCount: validatedCards.length,
      validatedCards: validatedCards.map(c => ({ name: c.name, seo_card_alias: c.seo_card_alias }))
    });
    
    // Apply the genius filter with Card Genius results only
    // The AllCards component will handle mapping with BankKaro API
    onApplyGenius([], calcResults, calcValues);
  };

  // Enhanced validation function to check mapping quality
  const validateCardMapping = (cardsToProcess: Card[], results: Record<string, any>) => {
    console.log('🔍 ENHANCED CARD MAPPING VALIDATION:', {
      totalCardsToProcess: cardsToProcess.length,
      totalResults: Object.keys(results).length,
      resultsKeys: Object.keys(results)
    });

    // Check which cards have results
    const cardsWithResults = cardsToProcess.filter(card => {
      const hasResult = !!results[card.seo_card_alias];
      if (!hasResult) {
        console.warn(`❌ No result for card: ${card.name} (${card.seo_card_alias})`);
      }
      return hasResult;
    });

    // Check which results have corresponding cards
    const resultsWithCards = Object.keys(results).filter(alias => {
      const hasCard = cardsToProcess.some(card => card.seo_card_alias === alias);
      if (!hasCard) {
        console.warn(`❌ No card found for result: ${alias}`);
      }
      return hasCard;
    });

    // Check for potential mapping issues
    const potentialIssues = [];
    
    // Check for case sensitivity issues
    const bankKaroAliases = cardsToProcess.map(c => c.seo_card_alias?.toLowerCase()).filter(Boolean);
    const cardGeniusAliases = Object.keys(results).map(alias => alias.toLowerCase());
    
    const caseInsensitiveMatches = bankKaroAliases.filter(bkAlias => 
      cardGeniusAliases.includes(bkAlias)
    );
    
    if (caseInsensitiveMatches.length > cardsWithResults.length) {
      potentialIssues.push('Case sensitivity mismatch detected');
    }
    
    // Check for partial matches
    const partialMatches = cardsToProcess.filter(card => {
      const cardAlias = card.seo_card_alias?.toLowerCase();
      if (!cardAlias) return false;
      
      return Object.keys(results).some(resultAlias => {
        const resultAliasLower = resultAlias.toLowerCase();
        return resultAliasLower.includes(cardAlias) || cardAlias.includes(resultAliasLower);
      });
    });
    
    if (partialMatches.length > cardsWithResults.length) {
      potentialIssues.push('Partial matches found - possible alias format mismatch');
    }

    console.log('🔍 MAPPING VALIDATION RESULTS:', {
      cardsWithResults: cardsWithResults.length,
      resultsWithCards: resultsWithCards.length,
      caseInsensitiveMatches: caseInsensitiveMatches.length,
      partialMatches: partialMatches.length,
      potentialIssues,
      sampleCardsWithResults: cardsWithResults.slice(0, 3).map(card => ({
        name: card.name,
        seo_card_alias: card.seo_card_alias,
        netSavings: results[card.seo_card_alias]?.net_savings || 0
      })),
      sampleResultsWithCards: resultsWithCards.slice(0, 3).map(alias => ({
        alias,
        cardName: results[alias]?.card_name || results[alias]?.name,
        netSavings: results[alias]?.net_savings || 0
      })),
      samplePartialMatches: partialMatches.slice(0, 3).map(card => ({
        name: card.name,
        seo_card_alias: card.seo_card_alias,
        potentialMatches: Object.keys(results).filter(resultAlias => {
          const cardAlias = card.seo_card_alias?.toLowerCase();
          const resultAliasLower = resultAlias.toLowerCase();
          return resultAliasLower.includes(cardAlias) || cardAlias.includes(resultAliasLower);
        })
      }))
    });

    return {
      cardsWithResults,
      resultsWithCards,
      mappingQuality: cardsWithResults.length / cardsToProcess.length,
      potentialIssues,
      partialMatches
    };
  };

  // Enhanced card mapping function with multiple fallback strategies
  const enhanceCardMapping = (cardsToProcess: Card[], results: Record<string, any>) => {
    console.log('🔍 ENHANCING CARD MAPPING WITH FALLBACK STRATEGIES');
    
    const enhancedResults = { ...results };
    const unmappedCards = cardsToProcess.filter(card => !results[card.seo_card_alias]);
    
    console.log('🔍 UNMAPPED CARDS:', {
      count: unmappedCards.length,
              cards: unmappedCards.map(c => ({ name: c.name, seo_card_alias: c.seo_card_alias }))
    });
    
    unmappedCards.forEach(card => {
      const cardAlias = card.seo_card_alias?.toLowerCase();
      const cardName = card.name?.toLowerCase();
      
      if (!cardAlias) return;
      
      // Strategy 1: Case-insensitive exact match
      const exactMatch = Object.keys(results).find(resultAlias => 
        resultAlias.toLowerCase() === cardAlias
      );
      
      if (exactMatch) {
        console.log(`✅ Found case-insensitive match for ${card.name}: ${cardAlias} -> ${exactMatch}`);
        enhancedResults[card.seo_card_alias] = results[exactMatch];
        return;
      }
      
      // Strategy 2: Partial alias match
      const partialMatch = Object.keys(results).find(resultAlias => {
        const resultAliasLower = resultAlias.toLowerCase();
        return resultAliasLower.includes(cardAlias) || cardAlias.includes(resultAliasLower);
      });
      
      if (partialMatch) {
        console.log(`✅ Found partial match for ${card.name}: ${cardAlias} -> ${partialMatch}`);
        enhancedResults[card.seo_card_alias] = results[partialMatch];
        return;
      }
      
      // Strategy 3: Name-based matching
      const nameMatch = Object.keys(results).find(resultAlias => {
        const resultData = results[resultAlias];
        const resultName = (resultData.card_name || resultData.name || '').toLowerCase();
        return resultName.includes(cardName) || cardName.includes(resultName);
      });
      
      if (nameMatch) {
        console.log(`✅ Found name-based match for ${card.name}: ${cardName} -> ${nameMatch}`);
        enhancedResults[card.seo_card_alias] = results[nameMatch];
        return;
      }
      
      console.warn(`❌ No match found for ${card.name} (${cardAlias})`);
    });
    
    const finalMappedCount = cardsToProcess.filter(card => enhancedResults[card.seo_card_alias]).length;
    console.log('🔍 ENHANCED MAPPING RESULTS:', {
      originalMapped: Object.keys(results).length,
      finalMapped: finalMappedCount,
      improvement: finalMappedCount - Object.keys(results).length
    });
    
    return enhancedResults;
  };

  // Test function to verify mapping with a small sample
  const testMappingWithSample = async () => {
    console.log('🧪 TESTING MAPPING WITH SAMPLE CARDS');
    
    // Use selectedCards if available, otherwise use allCards
    const availableCards = selectedCards.length > 0 ? selectedCards : allCards;
    
    // Take first 3 cards for testing
    const testCards = availableCards.slice(0, 3);
          console.log('🧪 TEST CARDS:', testCards.map(c => ({ name: c.name, seo_card_alias: c.seo_card_alias })));
    
    const testResults: Record<string, any> = {};
    
    for (const card of testCards) {
      try {
        // Use a simple payload for testing
        const testPayload = {
          amazon_spends: 5000,
          flipkart_spends: 3000,
          grocery_spends_online: 2000,
          online_food_ordering: 1500,
          other_online_spends: 2000,
          other_offline_spends: 3000,
          dining_or_going_out: 2000,
          fuel: 3000,
          school_fees: 5000,
          rent: 15000,
          mobile_phone_bills: 500,
          electricity_bills: 1000,
          water_bills: 200,
          hotels_annual: 50000,
          flights_annual: 80000,
          insurance_health_annual: 15000,
          insurance_car_or_bike_annual: 8000,
          domestic_lounge_usage_quarterly: 5,
          international_lounge_usage_quarterly: 2,
          selected_card_id: null
        };
        
        const data = await cardService.getCardGeniusDataForCard(card.seo_card_alias, testPayload);
        
        // Process the data using the same function as handleCalcSubmit
        if (data) {
          const processedData = processCardSavingsData(data, testPayload);
          testResults[card.seo_card_alias] = processedData;
          
          console.log(`🧪 TEST RESULT for ${card.name}:`, {
            found: !!data,
            dataKeys: data ? Object.keys(data) : [],
            totalSavingsYearly: processedData.total_savings_yearly,
            joiningFees: processedData.joining_fees,
            netSavings: processedData.net_savings,
            calculation: `${processedData.total_savings_yearly} - ${processedData.joining_fees} = ${processedData.net_savings}`
          });
        } else {
          console.log(`🧪 TEST RESULT for ${card.name}:`, {
            found: false,
            dataKeys: [],
            netSavings: 0
          });
        }
      } catch (error) {
        console.error(`🧪 TEST ERROR for ${card.name}:`, error);
      }
    }
    
    console.log('🧪 TEST RESULTS SUMMARY:', {
      testCardsCount: testCards.length,
      successfulResults: Object.keys(testResults).length,
      testResults: testResults
    });
    
    // Test enhanced mapping
    const enhancedTestResults = enhanceCardMapping(testCards, testResults);
    console.log('🧪 ENHANCED TEST RESULTS:', {
      originalResults: Object.keys(testResults).length,
      enhancedResults: Object.keys(enhancedTestResults).length,
      improvement: Object.keys(enhancedTestResults).length - Object.keys(testResults).length
    });
    
    return enhancedTestResults;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get net saving for a card
  const getNetSaving = (card: Card): number => {
    const result = calcResults[card.seo_card_alias];
    if (!result) return 0;
    return result.net_savings || 0;
  };

  // Get category breakdown data for charts
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            onClose();
          }}
        />
        
        {/* Modal Content */}
        <div className="relative w-full bg-background rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Card Genius Filter</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCards.length > 0 
                      ? `Filter ${selectedCards.length} selected cards by spending` 
                      : `Filter all ${allCards.length} cards by spending`
                    }
                  </p>
                </div>
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
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sticky top-0 z-10 bg-background border-b">
                <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 mb-0">
                  <TabsTrigger value="spending" className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4" />
                    <span>Spending Input</span>
                  </TabsTrigger>
                  <TabsTrigger value="results" className="flex items-center space-x-2" disabled={!showResults}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Results</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="spending" className="p-4 space-y-6">
                {!showResults || isEditMode ? (
                  <>
                    {/* Category Selection */}
                    <UICard className="shadow-lg border-l-4 border-blue-500">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <CardTitle className="text-xl flex items-center">
                          <Target className="h-6 w-6 mr-3 text-blue-600" />
                          {isEditMode ? 'Edit Spending Categories' : 'Select Spending Categories'}
                        </CardTitle>
                        <p className="text-sm text-blue-700">
                          {isEditMode 
                            ? 'Modify your spending values to recalculate savings and apply the Genius filter again'
                            : 'Choose the categories that match your spending patterns to get accurate savings comparison'
                          }
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
                          
                          {/* Test and Calculate Buttons */}
                          <div className="flex justify-center space-x-4 pt-6">
                            {!isEditMode && (
                              <Button
                                onClick={testMappingWithSample}
                                disabled={calcLoading}
                                variant="outline"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold"
                              >
                                <Target className="h-5 w-5 mr-2" />
                                Test Mapping
                              </Button>
                            )}
                            <Button
                              onClick={handleCalcSubmit}
                              disabled={calcLoading || visibleKeys.filter(key => calcValues[key] > 0).length === 0}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
                            >
                              {calcLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  Calculating Savings...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-5 w-5 mr-2" />
                                  {isEditMode ? 'Recalculate & Apply Genius Filter' : 'Apply Genius Filter'}
                                </>
                              )}
                            </Button>
                            {isEditMode && (
                              <Button
                                onClick={() => {
                                  setIsEditMode(false);
                                  setActiveTab('results');
                                }}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold"
                              >
                                <X className="h-5 w-5 mr-2" />
                                Cancel Edit
                              </Button>
                            )}
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
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculation Complete!</h3>
                    <p className="text-gray-600 mb-4">
                      Found {filteredCards.length} cards with positive net savings
                    </p>
                    <Button
                      onClick={() => setActiveTab('results')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="results" className="p-4 space-y-6">
                {showResults && (
                  <>
                    {/* Back to Input and Edit Spending Buttons */}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab('spending');
                          setIsEditMode(false);
                        }}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        ← Back to Input
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveTab('spending');
                          setIsEditMode(true);
                        }}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Edit Spending
                      </Button>
                    </div>

                    {/* New Tabular Results Component */}
                    <CardGeniusResultsTable
                      cards={filteredCards}
                      results={calcResults}
                      userSpending={calcValues}
                                                     onCardClick={onCardClick}
                      showDetailedBreakdown={true}
                      className=""
                    />

                    {/* Apply Button */}
                    <div className="flex justify-center pt-6">
                      <Button
                        onClick={handleApplyGenius}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
                      >
                        <Filter className="h-5 w-5 mr-2" />
                        Apply Genius Filter ({filteredCards.length} cards)
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardGeniusFilter; 