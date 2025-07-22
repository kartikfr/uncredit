import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  Gift, 
  CreditCard, 
  ShoppingBag, 
  Plane, 
  Car, 
  Home, 
  Star,
  TrendingUp,
  Award,
  Zap,
  ExternalLink
} from 'lucide-react';
import { cardService } from '@/services/api';

interface RedemptionOption {
  brand: string;
  conversion_rate: string;
  method: string;
}

interface RedemptionOptionsProps {
  cardName: string;
  seoCardAlias: string;
  userSpending?: Record<string, number>;
}

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

export const RedemptionOptions: React.FC<RedemptionOptionsProps> = ({
  cardName,
  seoCardAlias,
  userSpending
}) => {
  const [redemptionData, setRedemptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedMethods, setExpandedMethods] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRedemptionData();
  }, [seoCardAlias, userSpending]);

  const fetchRedemptionData = async () => {
    if (!seoCardAlias) {
      setError('Card alias not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the cardService instead of direct fetch
      const spendingData = {
        amazon_spends: userSpending?.amazon_spends || 1280,
        flipkart_spends: userSpending?.flipkart_spends || 10000,
        grocery_spends_online: userSpending?.grocery_spends_online || 7500,
        online_food_ordering: userSpending?.online_food_ordering || 5000,
        other_online_spends: userSpending?.other_online_spends || 3000,
        other_offline_spends: userSpending?.other_offline_spends || 5000,
        dining_or_going_out: userSpending?.dining_or_going_out || 5000,
        fuel: userSpending?.fuel || 5000,
        school_fees: userSpending?.school_fees || 20000,
        rent: userSpending?.rent || 35000,
        mobile_phone_bills: userSpending?.mobile_phone_bills || 1500,
        electricity_bills: userSpending?.electricity_bills || 7500,
        water_bills: userSpending?.water_bills || 2500,
        ott_channels: userSpending?.ott_channels || 1000,
        new_monthly_cat_1: 0,
        new_monthly_cat_2: 0,
        new_monthly_cat_3: 0,
        hotels_annual: userSpending?.hotels_annual || 75000,
        flights_annual: userSpending?.flights_annual || 75000,
        insurance_health_annual: userSpending?.insurance_health_annual || 75000,
        insurance_car_or_bike_annual: userSpending?.insurance_car_or_bike_annual || 45000,
        large_electronics_purchase_like_mobile_tv_etc: userSpending?.large_electronics_purchase_like_mobile_tv_etc || 100000,
        all_pharmacy: userSpending?.all_pharmacy || 99,
        new_cat_1: 0,
        new_cat_2: 0,
        new_cat_3: 0,
        domestic_lounge_usage_quarterly: userSpending?.domestic_lounge_usage_quarterly || 20,
        international_lounge_usage_quarterly: userSpending?.international_lounge_usage_quarterly || 13,
        railway_lounge_usage_quarterly: userSpending?.railway_lounge_usage_quarterly || 1,
        movie_usage: userSpending?.movie_usage || 3,
        movie_mov: userSpending?.movie_mov || 600,
        dining_usage: userSpending?.dining_usage || 3,
        dining_mov: userSpending?.dining_mov || 1500,
        selected_card_id: null
      };

      const data = await cardService.getCardGeniusDataForCard(seoCardAlias, spendingData);
      console.log('Redemption data response:', data);

      if (data) {
        setRedemptionData(data);
      } else {
        setError('Card not found in redemption data');
      }
    } catch (err) {
      console.error('Error fetching redemption data:', err);
      setError('Failed to load redemption options');
    } finally {
      setLoading(false);
    }
  };

  const toggleMethod = (method: string) => {
    const newExpanded = new Set(expandedMethods);
    if (newExpanded.has(method)) {
      newExpanded.delete(method);
    } else {
      newExpanded.add(method);
    }
    setExpandedMethods(newExpanded);
  };

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

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Redemption Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading redemption options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Redemption Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Unable to load redemption options</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={fetchRedemptionData} 
              variant="outline" 
              className="mt-4"
            >
              <Zap className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!redemptionData || !redemptionData.redemption_options) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Redemption Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No redemption options available</p>
            <p className="text-sm">This card may not have redemption options configured yet.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Redemption options are fetched from Card Genius API. 
                If you don't see any options, it might be because this card doesn't have 
                redemption data available in the system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const redemptionOptions = redemptionData.redemption_options;
  const groupedOptions = groupRedemptionOptions(redemptionOptions);
  const methodCount = Object.keys(groupedOptions).length;
  const totalOptions = redemptionOptions.length;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Redemption Options
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {totalOptions} Options
            </Badge>
            <Badge variant="outline">
              {methodCount} Methods
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Explore how you can redeem your rewards with {cardName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedOptions).map(([method, options]) => {
            const Icon = METHOD_ICONS[method] || METHOD_ICONS.default;
            const colorClass = METHOD_COLORS[method] || METHOD_COLORS.default;
            const isExpanded = expandedMethods.has(method);
            
            return (
              <Collapsible
                key={method}
                open={isExpanded}
                onOpenChange={() => toggleMethod(method)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${colorClass} transition-colors duration-200`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{method}</div>
                        <div className="text-sm text-muted-foreground">
                          {options.length} redemption option{options.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {options.length}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300 ease-in-out">
                  <div className="mt-2 p-4 bg-white rounded-lg border border-muted/30 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-[40%] font-semibold">Brand/Partner</TableHead>
                          <TableHead className="w-[30%] font-semibold">Conversion Rate</TableHead>
                          <TableHead className="w-[30%] font-semibold">Redemption Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {options.map((option: RedemptionOption, index: number) => (
                          <TableRow key={index} className="hover:bg-muted/50 transition-colors duration-150">
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Star className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm">{option.brand || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                                {option.conversion_rate || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{option.method || 'N/A'}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
        
        {totalOptions > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Redemption Summary</h4>
                <p className="text-sm text-blue-700">
                  {totalOptions} redemption options across {methodCount} different methods available for {cardName}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 