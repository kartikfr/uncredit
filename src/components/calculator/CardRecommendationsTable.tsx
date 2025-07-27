import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ChevronDown, 
  ChevronRight, 
  Info, 
  Calculator, 
  TrendingUp,
  CreditCard,
  DollarSign,
  Target,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface CardRecommendationsTableProps {
  recommendations: CardRecommendation[];
  spendingData: Record<string, number>;
  onBack: () => void;
}

export const CardRecommendationsTable: React.FC<CardRecommendationsTableProps> = ({
  recommendations,
  spendingData,
  onBack
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const toggleCardExpansion = (cardId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const handleCardSelect = (card: CardRecommendation) => {
    navigate(`/card/${card.id}?tab=calculator`, {
      state: { 
        card: card,
        seo_card_alias: card.seo_card_alias
      }
    });
  };

  const getCategoryDisplayName = (categoryKey: string): string => {
    const categoryMap: Record<string, string> = {
      'amazon_spends': 'Amazon Shopping',
      'flipkart_spends': 'Flipkart Shopping',
      'grocery_spends_online': 'Online Groceries',
      'online_food_ordering': 'Food Delivery',
      'other_online_spends': 'Other Online Shopping',
      'other_offline_spends': 'Offline Shopping',
      'dining_or_going_out': 'Dining Out',
      'fuel': 'Fuel',
      'school_fees': 'School Fees',
      'rent': 'Rent',
      'mobile_phone_bills': 'Mobile Bills',
      'electricity_bills': 'Electricity Bills',
      'water_bills': 'Water Bills',
      'hotels_annual': 'Hotel Stays',
      'flights_annual': 'Flight Bookings',
      'insurance_health_annual': 'Health Insurance',
      'insurance_car_or_bike_annual': 'Vehicle Insurance',
      'domestic_lounge_usage_quarterly': 'Domestic Lounge Visits',
      'international_lounge_usage_quarterly': 'International Lounge Visits',
    };
    return categoryMap[categoryKey] || categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getNetSaving = (card: CardRecommendation): number => {
    const joiningFees = typeof card.joining_fees === 'string' ? parseInt(card.joining_fees) : card.joining_fees;
    return (card.total_savings_yearly || 0) - (joiningFees || 0);
  };

     const getTotalSpends = (card: CardRecommendation): number => {
     // The spend values in spending_breakdown are already monthly, so we return as is
     return Object.values(card.spending_breakdown || {}).reduce((total, breakdown) => {
       return total + (breakdown.spend || 0);
     }, 0);
   };

  const getCategoriesWithSpending = (card: CardRecommendation): SpendingBreakdown[] => {
    // Use spending_breakdown_array if available, otherwise fall back to spending_breakdown object
    if (card.spending_breakdown_array && Array.isArray(card.spending_breakdown_array)) {
      return card.spending_breakdown_array.filter(breakdown => 
        breakdown.spend > 0 && spendingData[breakdown.on] > 0
      );
    }
    
    // Fallback to object format
    return Object.values(card.spending_breakdown || {}).filter(breakdown => 
      breakdown.spend > 0 && spendingData[breakdown.on] > 0
    );
  };

  const sortedRecommendations = [...recommendations]
    .filter(card => getNetSaving(card) > 0) // Only show cards with positive net savings
    .sort((a, b) => getNetSaving(b) - getNetSaving(a));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Best Cards for Your Spending
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Here are the top cards ranked by net savings. Click on any card to view detailed breakdowns.
        </p>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                             <TableHeader>
                 <TableRow className="bg-gray-50">
                   <TableHead className="w-12"></TableHead>
                   <TableHead className="font-semibold text-center w-16">
                     <div className="flex items-center justify-center gap-1">
                       Rank
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger>
                             <Info className="h-3 w-3 text-gray-500" />
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Card ranking based on net savings</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                   </TableHead>
                   <TableHead className="font-semibold">
                    <div className="flex items-center gap-1">
                      Card Name
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Name of the credit card</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    <div className="flex items-center justify-end gap-1">
                      Total Savings (Yearly)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total annual savings from rewards and benefits</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    <div className="flex items-center justify-end gap-1">
                      Joining Fees
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>One-time joining fee for the card</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    <div className="flex items-center justify-end gap-1">
                      Monthly Savings
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Average monthly savings from the card</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                                     <TableHead className="font-semibold text-right">
                     <div className="flex items-center justify-end gap-1">
                       Total Monthly Spend
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger>
                             <Info className="h-3 w-3 text-gray-500" />
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Total monthly spending across all categories</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                   </TableHead>
                                     <TableHead className="font-semibold text-right">
                     <div className="flex items-center justify-end gap-1">
                       Net Saving (Yearly)
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger>
                             <Info className="h-3 w-3 text-gray-500" />
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Net yearly savings after deducting joining fees</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                   </TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                                 {sortedRecommendations.map((card, index) => {
                   const isExpanded = expandedCards.has(card.id);
                   const netSaving = getNetSaving(card);
                   const totalSpends = getTotalSpends(card);
                   const categoriesWithSpending = getCategoriesWithSpending(card);
                   const rank = index + 1;
                   const isTopCard = rank <= 3;
                   
                   return (
                     <React.Fragment key={card.id}>
                       <TableRow className={`hover:bg-gray-50 ${
                         isTopCard 
                           ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' 
                           : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                       }`}>
                                                 <TableCell>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => toggleCardExpansion(card.id)}
                             className="h-6 w-6 p-0"
                           >
                             {isExpanded ? (
                               <ChevronDown className="h-4 w-4" />
                             ) : (
                               <ChevronRight className="h-4 w-4" />
                             )}
                           </Button>
                         </TableCell>
                         <TableCell className="text-center">
                           <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                             rank === 1 
                               ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' 
                               : rank === 2 
                               ? 'bg-gray-100 text-gray-800 border-2 border-gray-300' 
                               : rank === 3 
                               ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' 
                               : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                           }`}>
                             {rank}
                           </div>
                         </TableCell>
                                                 <TableCell className="font-medium">
                           <div className="flex items-center gap-3">
                             <div className="w-12 h-8 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                               {card.image ? (
                                 <img 
                                   src={card.image} 
                                   alt={card.card_name || card.name}
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     target.nextElementSibling?.classList.remove('hidden');
                                   }}
                                 />
                               ) : null}
                               <div className={`w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ${card.image ? 'hidden' : ''}`}>
                                 <span className="text-white text-xs font-bold">C</span>
                               </div>
                             </div>
                             <div>
                               <div className="font-semibold text-gray-900">
                                 {card.card_name || card.name}
                               </div>
                             </div>
                           </div>
                         </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(card.total_savings_yearly || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(typeof card.joining_fees === 'string' ? parseInt(card.joining_fees) : card.joining_fees || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {formatCurrency(card.total_savings || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(totalSpends)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          {formatCurrency(netSaving)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => handleCardSelect(card)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Calculator className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                                             {/* Expanded Category Breakdown */}
                       {isExpanded && categoriesWithSpending.length > 0 && (
                         <TableRow>
                           <TableCell colSpan={9} className="p-0">
                            <div className="bg-gray-50 border-t border-gray-200">
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Category-wise Breakdown
                                </h4>
                                <div className="overflow-x-auto">
                                  <Table>
                                                                         <TableHeader>
                                       <TableRow className="bg-white">
                                         <TableHead className="font-medium">
                                           <div className="flex items-center gap-1">
                                             Category
                                             <TooltipProvider>
                                               <Tooltip>
                                                 <TooltipTrigger>
                                                   <Info className="h-3 w-3 text-gray-500" />
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                   <p>Spending category where you provided input</p>
                                                 </TooltipContent>
                                               </Tooltip>
                                             </TooltipProvider>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-medium text-right">
                                           <div className="flex items-center justify-end gap-1">
                                             Spend
                                             <TooltipProvider>
                                               <Tooltip>
                                                 <TooltipTrigger>
                                                   <Info className="h-3 w-3 text-gray-500" />
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                   <p>Your monthly spending amount in this category</p>
                                                 </TooltipContent>
                                               </Tooltip>
                                             </TooltipProvider>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-medium text-right">
                                           <div className="flex items-center justify-end gap-1">
                                             Rewards
                                             <TooltipProvider>
                                               <Tooltip>
                                                 <TooltipTrigger>
                                                   <Info className="h-3 w-3 text-gray-500" />
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                   <p>Points earned or cashback percentage for this category</p>
                                                 </TooltipContent>
                                               </Tooltip>
                                             </TooltipProvider>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-medium text-right">
                                           <div className="flex items-center justify-end gap-1">
                                             Monthly Savings
                                             <TooltipProvider>
                                               <Tooltip>
                                                 <TooltipTrigger>
                                                   <Info className="h-3 w-3 text-gray-500" />
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                   <p>Monthly savings from rewards in this category</p>
                                                 </TooltipContent>
                                               </Tooltip>
                                             </TooltipProvider>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-medium text-right">
                                           <div className="flex items-center justify-end gap-1">
                                             Conversion Rate
                                             <TooltipProvider>
                                               <Tooltip>
                                                 <TooltipTrigger>
                                                   <Info className="h-3 w-3 text-gray-500" />
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                   <p>Points to rupees conversion rate or cashback percentage</p>
                                                 </TooltipContent>
                                               </Tooltip>
                                             </TooltipProvider>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-medium">
                                           <div className="flex items-center gap-1">
                                             Explanation
                                             <TooltipProvider>
                                               <Tooltip>
                                                 <TooltipTrigger>
                                                   <Info className="h-3 w-3 text-gray-500" />
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                   <p>Detailed breakdown of how rewards are calculated</p>
                                                 </TooltipContent>
                                               </Tooltip>
                                             </TooltipProvider>
                                           </div>
                                         </TableHead>
                                       </TableRow>
                                     </TableHeader>
                                    <TableBody>
                                      {categoriesWithSpending.map((breakdown, idx) => (
                                        <TableRow key={idx} className="bg-white">
                                          <TableCell className="font-medium">
                                            {getCategoryDisplayName(breakdown.on)}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(breakdown.spend)}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {breakdown.points_earned ? (
                                              <span>{formatNumber(breakdown.points_earned)} points</span>
                                            ) : breakdown.cashback_percentage ? (
                                              <span>{breakdown.cashback_percentage}% cashback</span>
                                            ) : (
                                              <span>-</span>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right font-semibold text-green-600">
                                            {formatCurrency(breakdown.savings)}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {breakdown.conv_rate ? (
                                              <span>₹{breakdown.conv_rate}</span>
                                            ) : breakdown.cashback_percentage ? (
                                              <span>{breakdown.cashback_percentage}%</span>
                                            ) : (
                                              <span>-</span>
                                            )}
                                          </TableCell>
                                          <TableCell className="max-w-xs">
                                            <div 
                                              className="text-sm text-gray-700"
                                              dangerouslySetInnerHTML={{ 
                                                __html: breakdown.explanation?.[0] || 'No explanation available' 
                                              }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
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
      </Card>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="text-center">
               <div className="text-2xl font-bold text-green-700">
                 {sortedRecommendations.length}
               </div>
               <div className="text-sm text-gray-600">Cards with Positive Net Savings</div>
             </div>
                         <div className="text-center">
               <div className="text-2xl font-bold text-blue-700">
                 {sortedRecommendations.length > 0 ? formatCurrency(getNetSaving(sortedRecommendations[0])) : '₹0'}
               </div>
               <div className="text-sm text-gray-600">Best Net Savings (Yearly)</div>
             </div>
                         <div className="text-center">
               <div className="text-2xl font-bold text-purple-700">
                 {formatCurrency(sortedRecommendations.reduce((total, card) => total + (card.total_savings_yearly || 0), 0))}
               </div>
               <div className="text-sm text-gray-600">Total Annual Savings</div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline" className="px-6">
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Spending Input
        </Button>
        
        <div className="text-sm text-gray-500">
          Click on any card to view detailed breakdowns and apply
        </div>
      </div>
    </div>
  );
}; 