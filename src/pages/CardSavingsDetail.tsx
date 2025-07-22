import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Car, 
  Utensils, 
  Plane, 
  Home, 
  CreditCard,
  Star,
  Users,
  Award,
  Shield,
  Zap,
  BarChart3,
  Target,
  PiggyBank,
  Calculator,
  ShoppingBag,
  Package,
  CreditCard as CreditCardIcon,
  Store,
  Leaf,
  Truck,
  Coffee,
  Building,
  Globe,
  Wifi,
  Droplets,
  Heart,
  Car as CarIcon,
  GraduationCap,
  Home as HomeIcon,
  PieChart,
  Activity,
  ChevronDown
} from "lucide-react";
import { Card as CardType } from "@/services/api";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, Title, DonutChart } from '@tremor/react';
import { RedemptionOptions } from "@/components/redemption/RedemptionOptions";
import FinalPDFGenerator from '@/components/pdf/FinalPDFGenerator';
import ScrollToTop from "@/components/ui/ScrollToTop";

// Enhanced category mapping with proper icons and display names
const SPENDING_CATEGORY_MAPPING = {
  // Shopping & Online
  amazon_spends: {
    category: "shopping",
    displayName: "Amazon Shopping",
    icon: ShoppingBag,
    tag: "amazon_spends",
    description: "Online shopping on Amazon",
    color: "from-blue-500 to-blue-600",
    chartColor: "#3B82F6"
  },
  flipkart_spends: {
    category: "shopping", 
    displayName: "Flipkart Shopping",
    icon: Package,
    tag: "flipkart_spends",
    description: "Online shopping on Flipkart",
    color: "from-orange-500 to-orange-600",
    chartColor: "#F97316"
  },
  other_online_spends: {
    category: "shopping",
    displayName: "Other Online Shopping", 
    icon: CreditCardIcon,
    tag: "other_online_spends",
    description: "Other online shopping expenses",
    color: "from-purple-500 to-purple-600",
    chartColor: "#8B5CF6"
  },
  other_offline_spends: {
    category: "shopping",
    displayName: "Offline Shopping",
    icon: Store, 
    tag: "other_offline_spends",
    description: "Local shops and offline stores",
    color: "from-gray-500 to-gray-600",
    chartColor: "#6B7280"
  },
  
  // Food & Dining
  grocery_spends_online: {
    category: "food",
    displayName: "Online Groceries",
    icon: Leaf,
    tag: "grocery_spends_online", 
    description: "Grocery delivery (Blinkit, Zepto, etc.)",
    color: "from-green-500 to-green-600",
    chartColor: "#10B981"
  },
  online_food_ordering: {
    category: "food",
    displayName: "Food Delivery",
    icon: Truck,
    tag: "online_food_ordering",
    description: "Food delivery apps",
    color: "from-red-500 to-red-600",
    chartColor: "#EF4444"
  },
  dining_or_going_out: {
    category: "food", 
    displayName: "Dining Out",
    icon: Coffee,
    tag: "dining_or_going_out",
    description: "Restaurants and dining out",
    color: "from-yellow-500 to-yellow-600",
    chartColor: "#EAB308"
  },
  
  // Travel
  flights_annual: {
    category: "travel",
    displayName: "Flight Bookings",
    icon: Plane,
    tag: "flights_annual",
    description: "Annual flight expenses",
    color: "from-indigo-500 to-indigo-600",
    chartColor: "#6366F1"
  },
  hotels_annual: {
    category: "travel",
    displayName: "Hotel Stays", 
    icon: Building,
    tag: "hotels_annual",
    description: "Annual hotel expenses",
    color: "from-purple-500 to-purple-600",
    chartColor: "#8B5CF6"
  },
  domestic_lounge_usage_quarterly: {
    category: "travel",
    displayName: "Domestic Lounges",
    icon: Home,
    tag: "domestic_lounge_usage_quarterly",
    description: "Domestic airport lounge visits",
    color: "from-green-500 to-green-600",
    chartColor: "#10B981"
  },
  international_lounge_usage_quarterly: {
    category: "travel",
    displayName: "International Lounges",
    icon: Globe,
    tag: "international_lounge_usage_quarterly", 
    description: "International airport lounge visits",
    color: "from-blue-500 to-blue-600",
    chartColor: "#3B82F6"
  },
  
  // Fuel & Transportation
  fuel: {
    category: "fuel",
    displayName: "Fuel Expenses",
    icon: Car,
    tag: "fuel",
    description: "Monthly fuel expenses",
    color: "from-orange-500 to-orange-600",
    chartColor: "#F97316"
  },
  
  // Bills & Utilities
  mobile_phone_bills: {
    category: "utilities",
    displayName: "Mobile & WiFi Bills",
    icon: Wifi,
    tag: "mobile_phone_bills",
    description: "Mobile and WiFi recharges",
    color: "from-blue-500 to-blue-600",
    chartColor: "#3B82F6"
  },
  electricity_bills: {
    category: "utilities",
    displayName: "Electricity Bills",
    icon: Zap,
    tag: "electricity_bills",
    description: "Monthly electricity bills",
    color: "from-yellow-500 to-yellow-600",
    chartColor: "#EAB308"
  },
  water_bills: {
    category: "utilities",
    displayName: "Water Bills",
    icon: Droplets,
    tag: "water_bills",
    description: "Monthly water bills",
    color: "from-cyan-500 to-cyan-600",
    chartColor: "#06B6D4"
  },
  
  // Insurance
  insurance_health_annual: {
    category: "insurance",
    displayName: "Health Insurance",
    icon: Heart,
    tag: "insurance_health_annual",
    description: "Health and term insurance",
    color: "from-red-500 to-red-600",
    chartColor: "#EF4444"
  },
  insurance_car_or_bike_annual: {
    category: "insurance",
    displayName: "Vehicle Insurance",
    icon: CarIcon,
    tag: "insurance_car_or_bike_annual",
    description: "Car and bike insurance",
    color: "from-gray-500 to-gray-600",
    chartColor: "#6B7280"
  },
  
  // Other Bills
  rent: {
    category: "bills",
    displayName: "House Rent",
    icon: HomeIcon,
    tag: "rent",
    description: "Monthly house rent",
    color: "from-emerald-500 to-emerald-600",
    chartColor: "#059669"
  },
  school_fees: {
    category: "bills",
    displayName: "School Fees",
    icon: GraduationCap,
    tag: "school_fees",
    description: "Monthly school fees",
    color: "from-violet-500 to-violet-600",
    chartColor: "#7C3AED"
  }
};

interface CategoryBreakdown {
  category: string;
  displayName: string;
  icon: any;
  color: string;
  chartColor: string;
  userAmount: number;
  savings: number;
  percentage: number;
  description: string;
  explanation?: string[];
  cashback_percentage?: string;
  maxCap?: number;
  totalMaxCap?: number;
  points_earned?: number;
  conv_rate?: string;
  spend?: number;
}

interface SavingsBreakdown {
  category: string;
  amount: number;
  percentage: number;
  icon: any;
  color: string;
  chartColor: string;
  label: string;
}

const CardSavingsDetail = () => {
  const { cardAlias } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [card, setCard] = useState<CardType | null>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcResultList, setCalcResultList] = useState<any[]>([]);
  const [calcValues, setCalcValues] = useState<Record<string, number>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [savingsBreakdown, setSavingsBreakdown] = useState<SavingsBreakdown[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'top5' | 'significant'>('all');
  const [loading, setLoading] = useState(false);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Record<string, boolean>>({});

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    if (location.state) {
      setCard(location.state.card);
      setCalcResult(location.state.calcResult);
      setCalcResultList(location.state.calcResultList);
      setCalcValues(location.state.calcValues);
      setSelectedCategories(location.state.selectedCategories);
    } else {
      // Fallback: try to get from localStorage or redirect
      navigate('/all-cards');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (calcResult) {
      processCategoryBreakdown();
      generateSavingsBreakdown();
    }
  }, [calcResult]);

  // Monitor categoryBreakdown state changes
  useEffect(() => {
    console.log('🔄 categoryBreakdown state updated:', categoryBreakdown);
    const amazonItem = categoryBreakdown.find(item => item.category === 'amazon_spends');
    if (amazonItem) {
      console.log('🔍 State update - Amazon item:', {
        category: amazonItem.category,
        points_earned: amazonItem.points_earned,
        points_earned_type: typeof amazonItem.points_earned,
        points_earned_value: amazonItem.points_earned,
        is_zero: amazonItem.points_earned === 0,
        is_undefined: amazonItem.points_earned === undefined,
        spend: amazonItem.spend,
        savings: amazonItem.savings
      });
    }
  }, [categoryBreakdown]);

  const processCategoryBreakdown = () => {
    if (!calcResult) return;

    console.log('Processing category breakdown from API response:', calcResult);

    const breakdown: CategoryBreakdown[] = [];

    // Process spending_breakdown_array from API response
    if (calcResult.spending_breakdown_array && Array.isArray(calcResult.spending_breakdown_array)) {
      console.log('Found spending_breakdown_array:', calcResult.spending_breakdown_array);
      
      calcResult.spending_breakdown_array.forEach((item: any) => {
        const categoryInfo = SPENDING_CATEGORY_MAPPING[item.on as keyof typeof SPENDING_CATEGORY_MAPPING];
        
        if (categoryInfo) {
          const userAmount = calcValues[item.on] || 0;
          const savings = item.savings || 0;
          const totalSavings = Number(calcResult.total_savings_yearly) || 0;
          const percentage = totalSavings > 0 ? (savings / totalSavings) * 100 : 0;
          
          // COMPREHENSIVE points_earned calculation with multiple fallback strategies
          let pointsEarned = Number(item.points_earned) || 0;
          
          // FALLBACK STRATEGY 1: Extract from explanation text with multiple patterns
          if (pointsEarned === 0 && item.explanation && item.explanation.length > 0) {
            const explanationText = item.explanation[0];
            
            // Pattern 1: "you will receive (\d+) RP"
            let pointsMatch = explanationText.match(/you will receive (\d+) RP/);
            if (pointsMatch) {
              pointsEarned = Number(pointsMatch[1]);
              console.log(`🔄 Strategy 1: Extracted points_earned from "you will receive" pattern for ${item.on}:`, {
                explanation: explanationText,
                extracted_points: pointsEarned
              });
            }
            
            // Pattern 2: "which is ₹(\d+)" (for cashback scenarios)
            if (pointsEarned === 0) {
              pointsMatch = explanationText.match(/which is ₹([\d,]+)/);
              if (pointsMatch) {
                const cashbackAmount = Number(pointsMatch[1].replace(/,/g, ''));
                pointsEarned = cashbackAmount; // For cashback, points = cashback amount
                console.log(`🔄 Strategy 2: Extracted points_earned from cashback amount for ${item.on}:`, {
                  explanation: explanationText,
                  cashback_amount: cashbackAmount,
                  extracted_points: pointsEarned
                });
              }
            }
            
            // Pattern 3: "(\d+)% Cashback" (calculate from percentage)
            if (pointsEarned === 0 && item.cashback_percentage) {
              const cashbackPercent = parseFloat(item.cashback_percentage);
              if (cashbackPercent > 0) {
                pointsEarned = Math.round((item.spend * cashbackPercent) / 100);
                console.log(`🔄 Strategy 3: Calculated points_earned from cashback percentage for ${item.on}:`, {
                  spend: item.spend,
                  cashback_percentage: cashbackPercent,
                  calculated_points: pointsEarned
                });
              }
            }
          }
          
          // FALLBACK STRATEGY 2: Calculate from savings and conversion rate
          if (pointsEarned === 0 && item.savings && item.conv_rate) {
            const convRate = Number(item.conv_rate);
            if (convRate > 0) {
              pointsEarned = Math.round(item.savings / convRate);
              console.log(`🔄 Strategy 4: Calculated points_earned from savings/conversion rate for ${item.on}:`, {
                savings: item.savings,
                conv_rate: convRate,
                calculated_points: pointsEarned
              });
            }
          }
          
          // FALLBACK STRATEGY 3: Use savings directly if no conversion rate
          if (pointsEarned === 0 && item.savings) {
            pointsEarned = item.savings;
            console.log(`🔄 Strategy 5: Using savings as points_earned for ${item.on}:`, {
              savings: item.savings,
              points_earned: pointsEarned
            });
          }
          
          const convRate = Number(item.conv_rate || 1);
          const calculatedSavings = pointsEarned * convRate;
          
          // CRITICAL DEBUG: Check if points_earned is being processed correctly
          console.log(`🔴 CRITICAL DEBUG for ${item.on}:`, {
            raw_points_earned: item.points_earned,
            raw_type: typeof item.points_earned,
            final_points_earned: pointsEarned,
            final_type: typeof pointsEarned,
            is_zero: pointsEarned === 0,
            is_nan: isNaN(pointsEarned),
            explanation_available: item.explanation && item.explanation.length > 0,
            explanation_text: item.explanation ? item.explanation[0] : null,
            cashback_percentage: item.cashback_percentage,
            conv_rate: item.conv_rate,
            conv_rate_parsed: convRate,
            calculated_savings: calculatedSavings,
            api_savings: item.savings,
            savings_match: calculatedSavings === item.savings,
            spend: item.spend,
            strategy_used: pointsEarned > 0 ? 'SUCCESS' : 'FAILED'
          });
          
          breakdown.push({
            category: item.on,
            displayName: categoryInfo.displayName,
            icon: categoryInfo.icon,
            color: categoryInfo.color,
            chartColor: categoryInfo.chartColor,
            userAmount: userAmount,
            savings: savings,
            percentage: Math.round(percentage * 10) / 10,
            description: categoryInfo.description,
            explanation: item.explanation || [],
            cashback_percentage: item.cashback_percentage,
            maxCap: item.maxCap,
            totalMaxCap: item.totalMaxCap,
            points_earned: pointsEarned,
            conv_rate: item.conv_rate,
            spend: item.spend
          });
        }
      });
    } else if (calcResult.categoryBreakdown && Array.isArray(calcResult.categoryBreakdown)) {
      console.log('Using fallback categoryBreakdown:', calcResult.categoryBreakdown);
      
      calcResult.categoryBreakdown.forEach((item: any) => {
        const categoryInfo = SPENDING_CATEGORY_MAPPING[item.category as keyof typeof SPENDING_CATEGORY_MAPPING];
        
        if (categoryInfo) {
          breakdown.push({
            category: item.category,
            displayName: item.displayName || categoryInfo.displayName,
            icon: categoryInfo.icon,
            color: categoryInfo.color,
            chartColor: categoryInfo.chartColor,
            userAmount: item.userAmount || 0,
            savings: item.savings || 0,
            percentage: item.percentage || 0,
            description: item.description || categoryInfo.description,
            explanation: item.explanation || []
          });
        }
      });
    }

    // Filter to show only categories where user has input values
    const filteredBreakdown = breakdown.filter(item => item.userAmount > 0);
    
    console.log('Processed category breakdown (filtered):', filteredBreakdown);
    
    // Debug: Check specific amazon_spends data
    const amazonItem = filteredBreakdown.find(item => item.category === 'amazon_spends');
    if (amazonItem) {
      console.log('🔍 Amazon item debug:', {
        category: amazonItem.category,
        points_earned: amazonItem.points_earned,
        points_earned_type: typeof amazonItem.points_earned,
        points_earned_parsed: Number(amazonItem.points_earned),
        spend: amazonItem.spend,
        savings: amazonItem.savings,
        cashback_percentage: amazonItem.cashback_percentage,
        conv_rate: amazonItem.conv_rate
      });
    }
    
    setCategoryBreakdown(filteredBreakdown);
  };

  const generateSavingsBreakdown = () => {
    if (!calcResult) return;

    const breakdown: SavingsBreakdown[] = [];
    const totalSavings = Number(calcResult.total_savings_yearly) || 0;

    console.log('Generating savings breakdown for:', calcResult);

    // Group savings by category
    const categorySavings: Record<string, number> = {};
    
    categoryBreakdown.forEach(item => {
      const category = SPENDING_CATEGORY_MAPPING[item.category as keyof typeof SPENDING_CATEGORY_MAPPING]?.category || item.category;
      categorySavings[category] = (categorySavings[category] || 0) + item.savings;
    });

    // Create breakdown array
    Object.entries(categorySavings).forEach(([category, amount]) => {
      const percentage = totalSavings > 0 ? (amount / totalSavings) * 100 : 0;
      
      // Get category info for display
      const categoryInfo = Object.values(SPENDING_CATEGORY_MAPPING).find(info => info.category === category);
      
      breakdown.push({
        category,
        amount: Math.round(amount),
        percentage: Math.round(percentage * 10) / 10,
        icon: categoryInfo?.icon || DollarSign,
        color: categoryInfo?.color || "from-gray-500 to-gray-600",
        chartColor: categoryInfo?.chartColor || "#6B7280",
        label: categoryInfo?.displayName || category
      });
    });

    // Sort by amount descending
    breakdown.sort((a, b) => b.amount - a.amount);
    console.log('Final savings breakdown:', breakdown);
    setSavingsBreakdown(breakdown);
  };

  // Prepare data for charts
  const getPieChartData = () => {
    // Filter out categories with zero savings and sort by savings amount
    const validCategories = categoryBreakdown
      .filter(item => item.savings > 0)
      .sort((a, b) => b.savings - a.savings);

    // If we have more than 6 categories, group the smallest ones into "Others"
    if (validCategories.length > 6) {
      const topCategories = validCategories.slice(0, 5);
      const otherCategories = validCategories.slice(5);
      const othersTotal = otherCategories.reduce((sum, item) => sum + item.savings, 0);
      
      return [
        ...topCategories.map(item => ({
          name: item.displayName,
          value: item.savings,
          color: item.chartColor,
          fullName: item.displayName
        })),
        {
          name: "Others",
          value: othersTotal,
          color: "#6B7280", // Gray color for others
          fullName: `Others (${otherCategories.length} categories)`
        }
      ];
    }

    // Return all categories if 6 or fewer
    return validCategories.map(item => ({
      name: item.displayName,
      value: item.savings,
      color: item.chartColor,
      fullName: item.displayName
    }));
  };

  const getBarChartData = () => {
    // Filter out categories with zero savings for better bar chart display
    return categoryBreakdown
      .filter(item => item.savings > 0)
      .sort((a, b) => b.savings - a.savings)
      .map(item => ({
        category: item.displayName,
        "Amount Spent": item.userAmount,
        "Savings": item.savings,
        "Cashback Rate": parseFloat(item.cashback_percentage || "0")
      }));
  };

  const toggleBreakdown = (category: string) => {
    setExpandedBreakdowns(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!card || !calcResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading savings details...</p>
        </div>
      </div>
    );
  }

  const netSavings = Number(calcResult.net_savings || (calcResult.total_savings_yearly - calcResult.joining_fees) || 0);
  const topCards = calcResultList
    .map(card => ({
      ...card,
      _netSavings: (Number(card.total_savings_yearly) || 0) - (Number(card.joining_fees) || 0)
    }))
    .sort((a, b) => b._netSavings - a._netSavings)
    .slice(0, 10);

  const pieChartData = getPieChartData();
  const barChartData = getBarChartData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Savings Breakdown</h1>
                <p className="text-sm text-muted-foreground">{card.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FinalPDFGenerator
                cardName={card.name}
                totalSavings={Number(calcResult.total_savings_yearly)}
                joiningFees={Number(calcResult.joining_fees)}
                netSavings={netSavings}
                categoryBreakdown={categoryBreakdown}
                savingsBreakdown={savingsBreakdown}
                calcValues={calcValues}
                calcResult={calcResult}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              />
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Card Genius</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="card-savings-detail-content" className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <UICard className="shadow-lg border-0 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <PiggyBank className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Your Potential Savings</h2>
                    <p className="text-muted-foreground">Based on your spending patterns</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">Total Annual Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      ₹{Number(calcResult.total_savings_yearly).toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600 mt-1">Per year</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-center mb-3">
                      <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-700">Joining Fees</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      ₹{Number(calcResult.joining_fees).toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">One-time</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <div className="flex items-center justify-center mb-3">
                      <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">Net Savings</span>
                    </div>
                    <div className="text-3xl font-bold text-green-800">
                      ₹{netSavings.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600 mt-1">After fees</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* Data Visualization Section */}
        {categoryBreakdown.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart - Savings Distribution */}
              <UICard className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center">
                      <PieChart className="h-6 w-6 mr-3 text-primary" />
                      Savings Distribution
                    </div>
                    {pieChartData.length > 6 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Top 5 + Others
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    How your savings are distributed across categories
                    {pieChartData.length > 6 && " (showing top 5 categories, others grouped)"}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) => {
                            // Only show labels for segments with > 5% or if it's "Others"
                            if (percent > 0.05 || name === "Others") {
                              return `${name}\n${(percent * 100).toFixed(0)}%`;
                            }
                            return "";
                          }}
                          outerRadius={pieChartData.length > 4 ? 70 : 80}
                          innerRadius={pieChartData.length > 4 ? 20 : 0}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `₹${value.toLocaleString()}`, 
                            props.payload.fullName || name
                          ]}
                          labelFormatter={(label) => `Category: ${label}`}
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
                  
                  {/* Summary Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-700">{pieChartData.length}</div>
                      <div className="text-gray-500">Categories</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-700">
                        ₹{pieChartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                      </div>
                      <div className="text-gray-500">Total Savings</div>
                    </div>
                  </div>
                </CardContent>
              </UICard>

              {/* Bar Chart - Spending vs Savings */}
              <UICard className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 mr-3 text-primary" />
                      Spending vs Savings
                    </div>
                    {barChartData.length > 8 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Top {Math.min(8, barChartData.length)} Categories
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compare your spending with potential savings
                    {barChartData.length > 8 && ` (showing top ${Math.min(8, barChartData.length)} categories)`}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={barChartData.slice(0, 8)} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="category" 
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
                          dataKey="Amount Spent" 
                          fill="#3B82F6" 
                          radius={[4, 4, 0, 0]}
                          name="Amount Spent"
                        />
                        <Bar 
                          dataKey="Savings" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]}
                          name="Potential Savings"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Bar Chart Summary */}
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-700">
                        ₹{barChartData.slice(0, 8).reduce((sum, item) => sum + item["Amount Spent"], 0).toLocaleString()}
                      </div>
                      <div className="text-blue-600">Total Spent</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-700">
                        ₹{barChartData.slice(0, 8).reduce((sum, item) => sum + item["Savings"], 0).toLocaleString()}
                      </div>
                      <div className="text-green-600">Total Savings</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-700">
                        {barChartData.length > 8 ? `${barChartData.length - 8} more` : 'All shown'}
                      </div>
                      <div className="text-purple-600">Categories</div>
                    </div>
                  </div>
                </CardContent>
              </UICard>
            </div>
          </div>
        )}

        {/* Detailed Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="mb-8">
            <UICard className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-primary" />
                  Category-wise Spending & Savings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of your spending and potential savings in each category
                </p>
              </CardHeader>
              <CardContent>
                {/* Category Filter Tabs */}
                {categoryBreakdown.length > 6 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="default" 
                        className="cursor-pointer"
                        onClick={() => setActiveCategoryFilter('all')}
                      >
                        All Categories ({categoryBreakdown.length})
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => setActiveCategoryFilter('top5')}
                      >
                        Top 5 Categories
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => setActiveCategoryFilter('significant')}
                      >
                        Significant Savings (&gt;5%)
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryBreakdown
                    .filter(item => {
                      if (activeCategoryFilter === 'top5') {
                        return categoryBreakdown.indexOf(item) < 5;
                      } else if (activeCategoryFilter === 'significant') {
                        return item.percentage > 5;
                      }
                      return true;
                    })
                    .map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color}`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-foreground">{item.displayName}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">You spend</div>
                            <div className="text-lg font-bold text-blue-600">
                              ₹{item.userAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Potential Savings</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                ₹{item.savings.toLocaleString()}
                              </div>
                              <div className="text-xs text-green-600">
                                {item.percentage.toFixed(1)}% of total savings
                              </div>
                            </div>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>

                        {/* Cashback and Cap Information */}
                        {item.cashback_percentage && parseFloat(item.cashback_percentage) > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700 font-medium">Cashback Rate:</span>
                              <span className="text-blue-800 font-bold">{item.cashback_percentage}%</span>
                            </div>
                            {item.maxCap && (
                              <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-blue-700">Max Cap:</span>
                                <span className="text-blue-800">₹{item.maxCap.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Calculation Breakdown */}
                        <Collapsible 
                          open={expandedBreakdowns[item.category]} 
                          onOpenChange={() => toggleBreakdown(item.category)}
                          className="bg-purple-50 rounded-lg border border-purple-200 mb-3"
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-100 transition-colors">
                              <div className="flex items-center space-x-2">
                                <Calculator className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-semibold text-purple-800">Savings Calculation Breakdown</span>
                              </div>
                              <ChevronDown 
                                className={`h-4 w-4 text-purple-600 transition-transform duration-200 ${
                                  expandedBreakdowns[item.category] ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 pb-4">
                          
                          {(() => {
                            // Cross-check all values for consistency
                            const pointsEarned = item.points_earned || 0;
                            const convRate = Number(item.conv_rate || 1);
                            const calculatedSavings = pointsEarned * convRate;
                            const actualSavings = item.savings;
                            
                            console.log(`🔍 CROSS-CHECK for ${item.category}:`, {
                              points_earned_display: pointsEarned,
                              conv_rate: convRate,
                              calculated_monthly_savings: calculatedSavings,
                              actual_monthly_savings: actualSavings,
                              savings_match: calculatedSavings === actualSavings,
                              formula_check: `${pointsEarned} × ${convRate} = ${calculatedSavings}`,
                              should_display: `${pointsEarned.toLocaleString()} R.P`
                            });
                            
                            return null;
                          })()}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {/* Points Earned */}
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-700 font-medium">Points Earned:</span>
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="text-lg font-bold text-purple-800">
                                {(() => {
                                  // DIRECT TEST: Check what's actually being rendered
                                  const displayValue = (item.points_earned || 0).toLocaleString();
                                  console.log(`🎯 DIRECT RENDER TEST for ${item.category}:`, {
                                    points_earned: item.points_earned,
                                    type: typeof item.points_earned,
                                    displayValue: displayValue,
                                    is_zero: item.points_earned === 0,
                                    is_undefined: item.points_earned === undefined,
                                    is_null: item.points_earned === null,
                                    fullItem: JSON.stringify(item, null, 2)
                                  });
                                  return displayValue;
                                })()} R.P
                              </div>
                              <div className="text-xs text-purple-600">
                                Monthly reward points
                              </div>
                            </div>

                            {/* Conversion Rate */}
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-700 font-medium">Conversion Rate:</span>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="text-lg font-bold text-purple-800">
                                {item.conv_rate ? `1 R.P = ₹${item.conv_rate}` : '1 R.P = ₹1.00'}
                              </div>
                              <div className="text-xs text-purple-600">
                                {item.conv_rate ? 'API rate' : 'Standard rate'}
                              </div>
                            </div>

                            {/* Monthly Savings */}
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-700 font-medium">Monthly Savings:</span>
                                <PiggyBank className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="text-lg font-bold text-purple-800">
                                {(() => {
                                  const calculatedSavings = (item.points_earned || 0) * Number(item.conv_rate || 1);
                                  console.log(`💰 Monthly Savings calculation for ${item.category}:`, {
                                    points_earned: item.points_earned,
                                    conv_rate: item.conv_rate,
                                    conv_rate_parsed: Number(item.conv_rate || 1),
                                    calculated_savings: calculatedSavings,
                                    actual_savings: item.savings,
                                    match: calculatedSavings === item.savings
                                  });
                                  return `₹${item.savings.toLocaleString()}`;
                                })()}
                              </div>
                              <div className="text-xs text-purple-600">
                                Points × Conversion Rate
                              </div>
                            </div>

                            {/* Annual Savings */}
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-700 font-medium">Annual Savings:</span>
                                <Target className="h-4 w-4 text-blue-500" />
                              </div>
                              <div className="text-lg font-bold text-purple-800">
                                ₹{(item.savings * 12).toLocaleString()}
                              </div>
                              <div className="text-xs text-purple-600">
                                Monthly × 12 months
                              </div>
                            </div>
                          </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Explanation */}
                        {item.explanation && item.explanation.length > 0 && (
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <div className="text-sm text-yellow-800" 
                                 dangerouslySetInnerHTML={{ __html: item.explanation[0] }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </UICard>
          </div>
        )}

        {/* Category Group Summary */}
        {savingsBreakdown.length > 0 && (
          <div className="mb-8">
            <UICard className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-primary" />
                  Savings by Category Group
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Summary of savings grouped by category types
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savingsBreakdown.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.category} className="bg-white rounded-xl p-6 shadow-md border hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {item.percentage}%
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {item.label}
                        </h3>
                        
                        <div className="text-2xl font-bold text-primary mb-3">
                          ₹{item.amount.toLocaleString()}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Savings</span>
                            <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </UICard>
          </div>
        )}

        {/* Empty State */}
        {categoryBreakdown.length === 0 && (
          <div className="mb-8">
            <UICard className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-primary" />
                  Category-wise Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No spending data available for breakdown</p>
                  <p className="text-sm text-gray-400 mt-2">Enter your spending details to see category-wise savings</p>
                </div>
              </CardContent>
            </UICard>
          </div>
        )}

        {/* Redemption Options Section */}
        <div className="mb-8">
          <UICard className="shadow-lg border-l-4 border-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-xl flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-6 w-6 mr-3 text-purple-600" />
                  Redemption Options
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Card Genius Data
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Based on Your Spending
                  </Badge>
                </div>
              </CardTitle>
              <p className="text-sm text-purple-700">
                Explore how you can redeem your calculated savings of ₹{Number(calcResult.total_savings_yearly).toLocaleString()} 
                with {calcResult.card_name} - powered by Card Genius API
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Savings Summary</span>
                </div>
                <p className="text-sm text-blue-700">
                  With your current spending pattern, you can earn ₹{Number(calcResult.total_savings_yearly).toLocaleString()} 
                  annually with {calcResult.card_name}. Below are the redemption options available for these rewards.
                </p>
              </div>
              <RedemptionOptions 
                cardName={calcResult.card_name}
                seoCardAlias={calcResult.seo_card_alias || ''}
                userSpending={calcValues}
              />
            </CardContent>
          </UICard>
        </div>

        {/* Comparison Table */}
        <div className="mb-8">
          <UICard className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-primary" />
                Compare with Other Cards
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                See how this card performs against other options based on your spending
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto rounded-lg border border-muted/30 shadow-md bg-white">
                  <Table className="min-w-[800px]">
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="font-semibold">Rank</TableHead>
                        <TableHead className="font-semibold">Card Name</TableHead>
                        <TableHead className="text-center font-semibold">Total Savings</TableHead>
                        <TableHead className="text-center font-semibold">Joining Fees</TableHead>
                        <TableHead className="text-center font-semibold">Net Savings</TableHead>
                        <TableHead className="text-center font-semibold">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCards.map((card, index) => {
                        const isCurrentCard = card.seo_card_alias === calcResult.seo_card_alias;
                        return (
                          <TableRow 
                            key={card.id || card.card_name || index} 
                            className={isCurrentCard ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-gray-50"}
                          >
                            <TableCell className="font-bold">
                              <div className="flex items-center">
                                {index === 0 && <Award className="h-4 w-4 text-yellow-500 mr-2" />}
                                #{index + 1}
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
                            <TableCell className="text-center font-bold text-green-600">
                              ₹{Number(card.total_savings_yearly).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              ₹{Number(card.joining_fees).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center font-bold text-green-700">
                              ₹{card._netSavings.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="font-medium">{card.rating || 'N/A'}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing top {topCards.length} cards based on your spending profile
                </p>
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Card Details
          </Button>
          <Button 
            onClick={() => navigate('/all-cards')}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Browse All Cards
          </Button>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default CardSavingsDetail; 