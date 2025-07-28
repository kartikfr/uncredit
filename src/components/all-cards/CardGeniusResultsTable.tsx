import React, { useState } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Info, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Star, 
  Crown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calculator,
  PiggyBank,
  Award,
  Shield,
  Calendar,
  Zap,
  Gift,
  ShoppingBag,
  Plane,
  Car,
  Home,
  Activity,
  BarChart3
} from 'lucide-react';
import { Card } from '@/services/api';

interface RedemptionOption {
  brand: string;
  conversion_rate: number;
  method: string;
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

interface CardGeniusResult {
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
  redemption_options?: RedemptionOption[];
  lounges: number;
  name: string;
  card_bg_image: string;
  image: string;
  network_url: string;
  product_usps: any[];
  net_savings?: number;
}

interface CardGeniusResultsTableProps {
  cards: Card[];
  results: Record<string, CardGeniusResult>;
  userSpending?: Record<string, number>;
  onCardClick?: (card: Card) => void;
  showDetailedBreakdown?: boolean;
  className?: string;
}

const CardGeniusResultsTable: React.FC<CardGeniusResultsTableProps> = ({
  cards,
  results,
  userSpending = {},
  onCardClick,
  showDetailedBreakdown = true,
  className = ""
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Record<string, Set<string>>>({});
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Helper function to calculate display value based on view mode
  const getDisplayValue = (monthlyValue: number) => {
    return viewMode === 'yearly' ? monthlyValue * 12 : monthlyValue;
  };

  // Helper function to get view mode label
  const getViewModeLabel = () => {
    return viewMode === 'yearly' ? 'per year' : 'per month';
  };

  // Helper function to group redemption options by method
  const groupRedemptionOptionsByMethod = (options: RedemptionOption[]) => {
    const grouped: Record<string, RedemptionOption[]> = {};
    options.forEach(option => {
      if (!grouped[option.method]) {
        grouped[option.method] = [];
      }
      grouped[option.method].push(option);
    });
    return grouped;
  };

  const toggleCardExpansion = (cardAlias: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardAlias)) {
      newExpanded.delete(cardAlias);
    } else {
      newExpanded.add(cardAlias);
    }
    setExpandedCards(newExpanded);
  };

  const toggleCategoryExpansion = (cardAlias: string, category: string) => {
    const newExpanded = { ...expandedCategories };
    if (!newExpanded[cardAlias]) {
      newExpanded[cardAlias] = new Set();
    }
    
    const cardCategories = new Set(newExpanded[cardAlias]);
    if (cardCategories.has(category)) {
      cardCategories.delete(category);
    } else {
      cardCategories.add(category);
    }
    newExpanded[cardAlias] = cardCategories;
    setExpandedCategories(newExpanded);
  };

  const isCategoryExpanded = (cardAlias: string, category: string) => {
    return expandedCategories[cardAlias]?.has(category) || false;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      amazon_spends: ShoppingBag,
      flipkart_spends: ShoppingBag,
      other_online_spends: ShoppingBag,
      other_offline_spends: ShoppingBag,
      grocery_spends_online: Home,
      online_food_ordering: Gift,
      fuel: Car,
      dining_or_going_out: Gift,
      flights_annual: Plane,
      hotels_annual: Home,
      domestic_lounge_usage_quarterly: Crown,
      international_lounge_usage_quarterly: Crown,
      mobile_phone_bills: CreditCard,
      electricity_bills: Zap,
      water_bills: Home,
      insurance_health_annual: Shield,
      insurance_car_or_bike_annual: Car,
      rent: Home,
      school_fees: Calendar
    };
    
    const IconComponent = iconMap[category] || Activity;
    return <IconComponent className="h-4 w-4 text-gray-600" />;
  };

  const getCategoryName = (category: string) => {
    const nameMap: Record<string, string> = {
      amazon_spends: "Amazon Shopping",
      flipkart_spends: "Flipkart Shopping",
      other_online_spends: "Other Online Shopping",
      other_offline_spends: "Offline Shopping",
      grocery_spends_online: "Online Groceries",
      online_food_ordering: "Food Delivery",
      fuel: "Fuel",
      dining_or_going_out: "Dining Out",
      flights_annual: "Flights",
      hotels_annual: "Hotels",
      domestic_lounge_usage_quarterly: "Domestic Lounges",
      international_lounge_usage_quarterly: "International Lounges",
      mobile_phone_bills: "Mobile Bills",
      electricity_bills: "Electricity Bills",
      water_bills: "Water Bills",
      insurance_health_annual: "Health Insurance",
      insurance_car_or_bike_annual: "Vehicle Insurance",
      rent: "Rent",
      school_fees: "School Fees"
    };
    
    return nameMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const sortedCards = cards
    .filter(card => results[card.seo_card_alias])
    .sort((a, b) => {
      const resultA = results[a.seo_card_alias];
      const resultB = results[b.seo_card_alias];
          const netSavingsA = resultA.total_savings_yearly - Number(resultA.joining_fees);
    const netSavingsB = resultB.total_savings_yearly - Number(resultB.joining_fees);
      return netSavingsB - netSavingsA;
    });

  if (sortedCards.length === 0) {
    return (
      <UICard className={`shadow-lg ${className}`}>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
          <p className="text-gray-600">No cards found with Card Genius data to display.</p>
        </CardContent>
      </UICard>
    );
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Summary Header */}
        <UICard className="shadow-lg border-l-4 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center">
                <PiggyBank className="h-6 w-6 mr-3 text-green-600" />
                Card Genius Results Summary
              </div>
              <Badge variant="default" className="bg-green-600 text-white">
                {sortedCards.length} Cards Analyzed
              </Badge>
            </CardTitle>
            <p className="text-sm text-green-700">
              Cards ranked by net savings based on your spending patterns
            </p>
          </CardHeader>
        </UICard>

        {/* Main Results Table */}
        <UICard className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              Detailed Card Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead className="w-48">Card Details</TableHead>
                    <TableHead className="w-32 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span>Total Savings</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Annual savings from rewards, cashback, and benefits based on your spending patterns</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span>Joining Fees</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>One-time fee to get the card. This is deducted from total savings to calculate net savings</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span>Net Savings</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Total annual savings minus joining fees. This is the actual money you save after paying the card fee</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span>ROI</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Return on Investment = (Net Savings / Joining Fees) × 100. Higher ROI means better value for money</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span>Lounge Access</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Number of airport lounges you can access with this card. Includes both domestic and international lounges</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="w-24 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCards.map((card, index) => {
                    const result = results[card.seo_card_alias];
                    if (!result) return null;

                    const netSavings = result.total_savings_yearly - Number(result.joining_fees);
                    const joiningFees = Number(result.joining_fees) || 0;
                    const totalSavings = result.total_savings_yearly || 0;
                    const roi = joiningFees > 0 ? ((netSavings / joiningFees) * 100) : 0;
                    const isExpanded = expandedCards.has(card.seo_card_alias);

                    return (
                      <React.Fragment key={card.id}>
                        <TableRow className={`hover:bg-gray-50 ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :
                          index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50' :
                          index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50' :
                          'bg-white'
                        }`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Badge 
                                variant="default" 
                                className={`mr-2 ${
                                  index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                                  index === 1 ? 'bg-gradient-to-r from-gray-500 to-slate-500' : 
                                  index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                                  'bg-blue-500'
                                }`}
                              >
                                #{index + 1}
                              </Badge>
                              {index < 3 && <Crown className="h-4 w-4 text-yellow-600" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={card.image}
                                alt={card.name}
                                className="w-12 h-8 object-contain rounded border border-gray-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                              <div>
                                <div className="font-semibold text-gray-900">{card.name}</div>
                                <div className="text-sm text-gray-600">{card.bank_name}</div>
                                <div className="text-xs text-gray-500">{card.card_network}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-green-700 font-semibold">
                              {formatCurrency(totalSavings)}
                            </div>
                            <div className="text-xs text-green-600">per year</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-red-700 font-semibold">
                              {formatCurrency(joiningFees)}
                            </div>
                            <div className="text-xs text-red-600">one time</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`font-bold text-lg ${
                              netSavings > 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {formatCurrency(netSavings)}
                            </div>
                            <div className="text-xs text-gray-600">after fees</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-blue-700 font-semibold">
                              {formatPercentage(roi)}
                            </div>
                            <div className="text-xs text-blue-600">ROI</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Badge variant="outline" className="text-xs">
                                {result.lounges || 0} lounges
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCardExpansion(card.seo_card_alias)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              {onCardClick && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCardClick(card)}
                                  className="h-8 w-8 p-0"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details */}
                        {isExpanded && showDetailedBreakdown && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <div className="bg-gray-50 p-6 space-y-6">
                                {/* Spending Breakdown */}
                                {result.spending_breakdown_array && result.spending_breakdown_array.length > 0 && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-gray-900 flex items-center">
                                        <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                                        Spending Category Breakdown
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700">View:</span>
                                        <div className="flex bg-purple-200 rounded-lg p-1">
                                          <Button
                                            variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('monthly')}
                                            className={`text-xs px-3 py-1 ${
                                              viewMode === 'monthly' 
                                                ? 'bg-purple-600 text-white' 
                                                : 'text-purple-700 hover:text-purple-900'
                                            }`}
                                          >
                                            Monthly
                                          </Button>
                                          <Button
                                            variant={viewMode === 'yearly' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('yearly')}
                                            className={`text-xs px-3 py-1 ${
                                              viewMode === 'yearly' 
                                                ? 'bg-purple-600 text-white' 
                                                : 'text-purple-700 hover:text-purple-900'
                                            }`}
                                          >
                                            Annual
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                             {result.spending_breakdown_array
                                         .filter((item: SpendingBreakdown) => item.savings > 0)
                                         .map((item: SpendingBreakdown, idx: number) => {
                                           const category = item.on;
                                           const isCategoryExpanded = expandedCategories[card.seo_card_alias]?.has(category) || false;
                                          
                                          return (
                                            <UICard key={idx} className="shadow-sm">
                                              <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex items-center space-x-2">
                                                    {getCategoryIcon(category)}
                                                    <span className="font-medium text-sm">
                                                      {getCategoryName(category)}
                                                    </span>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleCategoryExpansion(card.seo_card_alias, category)}
                                                    className="h-6 w-6 p-0"
                                                  >
                                                    {isCategoryExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                  </Button>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                  <div className="flex justify-between text-sm">
                                                    <div className="flex items-center space-x-1">
                                                      <span className="text-gray-600">Spend:</span>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                          <p>Your {viewMode === 'yearly' ? 'annual' : 'monthly'} spending in this category. Used to calculate rewards and savings</p>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="font-medium">{formatCurrency(getDisplayValue(item.spend))}</div>
                                                      <div className="text-xs text-gray-500">{getViewModeLabel()}</div>
                                                    </div>
                                                  </div>
                                                                                                     {item.points_earned !== undefined && (
                                                    <div className="flex justify-between text-sm">
                                                      <div className="flex items-center space-x-1">
                                                        <span className="text-gray-600">Points:</span>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                          </TooltipTrigger>
                                                          <TooltipContent className="max-w-xs">
                                                            <p>Reward points earned on your {viewMode === 'yearly' ? 'annual' : 'monthly'} spending in this category</p>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </div>
                                                      <div className="text-right">
                                                        <div className="font-medium text-blue-700">{getDisplayValue(item.points_earned).toLocaleString()}</div>
                                                        <div className="text-xs text-gray-500">{getViewModeLabel()}</div>
                                                      </div>
                                                    </div>
                                                  )}
                                                  <div className="flex justify-between text-sm">
                                                    <div className="flex items-center space-x-1">
                                                      <span className="text-gray-600">Savings:</span>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                          <p>{viewMode === 'yearly' ? 'Annual' : 'Monthly'} savings from this spending category. Calculated as (points_earned × conv_rate)</p>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="font-semibold text-green-700">{formatCurrency(getDisplayValue(item.savings))}</div>
                                                      <div className="text-xs text-gray-500">{getViewModeLabel()}</div>
                                                    </div>
                                                  </div>
                                                  
                                                                                                     {item.points_earned && item.points_earned > 0 && (
                                                     <div className="flex justify-between text-sm">
                                                       <div className="flex items-center space-x-1">
                                                         <span className="text-gray-600">Conv. Rate:</span>
                                                         <Tooltip>
                                                           <TooltipTrigger asChild>
                                                             <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                           </TooltipTrigger>
                                                           <TooltipContent className="max-w-xs">
                                                             <p>Conversion rate of reward points to rupees. Calculated as: Savings ÷ Points Earned</p>
                                                           </TooltipContent>
                                                         </Tooltip>
                                                       </div>
                                                       <span className="font-medium text-purple-700">₹{(item.savings / item.points_earned).toFixed(2)}</span>
                                                     </div>
                                                   )}
                                                </div>

                                                {/* Explanation - Always Visible */}
                                                {item.explanation && item.explanation.length > 0 && (
                                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="space-y-2">
                                                      {item.explanation.map((explanation, expIdx) => (
                                                        <div 
                                                          key={expIdx} 
                                                          className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200"
                                                          dangerouslySetInnerHTML={{ __html: explanation }}
                                                        />
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </CardContent>
                                            </UICard>
                                          );
                                        })}
                                    </div>
                                  </div>
                                )}

                                {/* Redemption Options */}
                                {result.redemption_options && result.redemption_options.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                      <Gift className="h-5 w-5 mr-2 text-purple-600" />
                                      Redemption Options
                                    </h4>
                                    <div className="space-y-4">
                                      {Object.entries(groupRedemptionOptionsByMethod(result.redemption_options)).map(([method, options]) => (
                                        <div key={method} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                          <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
                                            <h5 className="font-medium text-purple-900 flex items-center">
                                              <ShoppingBag className="h-4 w-4 mr-2" />
                                              {method}
                                            </h5>
                                          </div>
                                          <div className="overflow-x-auto">
                                            <Table>
                                              <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                  <TableHead className="w-1/3">
                                                    <div className="flex items-center space-x-1">
                                                      <span>Brand</span>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                          <p>Brand or partner where you can redeem your reward points</p>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    </div>
                                                  </TableHead>
                                                  <TableHead className="w-1/3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                      <span>Conversion Rate</span>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                          <p>Value of each reward point when redeemed at this brand (₹ per point)</p>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    </div>
                                                  </TableHead>
                                                  <TableHead className="w-1/3 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                      <span>Method</span>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                          <p>Medium or platform through which you can redeem your points</p>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    </div>
                                                  </TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {options.map((option, idx) => (
                                                  <TableRow key={idx} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium text-gray-900">
                                                      {option.brand}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                      <span className="font-semibold text-green-700">
                                                        ₹{option.conversion_rate.toFixed(2)}
                                                      </span>
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-600">
                                                      {option.method}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Additional Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                    <div className="text-lg font-bold text-green-700 mb-1">
                                      {formatCurrency(totalSavings)}
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">Total Annual Savings</div>
                                  </div>
                                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                    <div className="text-lg font-bold text-blue-700 mb-1">
                                      {formatPercentage(roi)}
                                    </div>
                                    <div className="text-xs text-blue-600 font-medium">Return on Investment</div>
                                  </div>
                                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                    <div className="text-lg font-bold text-purple-700 mb-1">
                                      {result.lounges || 0}
                                    </div>
                                    <div className="text-xs text-purple-600 font-medium">Lounge Access</div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </UICard>

        {/* Ranking Legend */}
        <UICard className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-600" />
              Ranking System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-sm">#1 - Best Value</div>
                  <div className="text-xs text-gray-600">Highest net savings and ROI</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm">#2 - Good Value</div>
                  <div className="text-xs text-gray-600">Strong savings with reasonable fees</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-sm">#3 - Consider</div>
                  <div className="text-xs text-gray-600">Decent value, worth considering</div>
                </div>
              </div>
            </div>
          </CardContent>
        </UICard>
      </div>
    </TooltipProvider>
  );
};

export default CardGeniusResultsTable; 