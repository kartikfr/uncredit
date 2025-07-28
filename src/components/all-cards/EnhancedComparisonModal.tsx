import React, { useState, useEffect } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Info, 
  ExternalLink, 
  Calculator, 
  Target, 
  PiggyBank, 
  Activity, 
  BarChart3, 
  Crown, 
  ChevronDown, 
  ChevronUp, 
  Gift, 
  ShoppingBag, 
  Plane, 
  Car, 
  Home,
  Zap,
  Brain,
  Sparkles,
  Calculator as CalculatorIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { Card, cardService } from '@/services/api';

interface EnhancedComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: Card[];
  geniusResults?: Record<string, any>;
  isGeniusFilterActive?: boolean;
  defaultTab?: string;
}

const EnhancedComparisonModal: React.FC<EnhancedComparisonModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedCards, 
  geniusResults, 
  isGeniusFilterActive,
  defaultTab = 'textual'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [spendingViewMode, setSpendingViewMode] = useState<'monthly' | 'yearly'>('yearly');

  // Initialize with genius results if available or use defaultTab
  useEffect(() => {
    if (isGeniusFilterActive && geniusResults) {
      setActiveTab('spending');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isGeniusFilterActive, geniusResults, defaultTab]);

  if (!isOpen || selectedCards.length === 0) return null;

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

  const toggleSectionExpansion = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isSectionExpanded = (section: string) => {
    return expandedSections.has(section);
  };

  // Helper function to safely extract text from various data formats
  const extractTextFromData = (data: any): string => {
    if (!data) return 'Not specified';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) {
      return data.map(item => extractTextFromData(item)).join(', ');
    }
    if (typeof data === 'object') {
      return data.header || data.description || data.name || data.text || 'Feature';
    }
    return String(data);
  };

  // Get card data with genius results
  const getCardData = (card: Card) => {
    const geniusResult = geniusResults?.[card.seo_card_alias];
    return {
      ...card,
      geniusResult,
      netSavings: geniusResult?.net_savings || 0,
      totalSavingsYearly: geniusResult?.total_savings_yearly || 0,
      joiningFees: geniusResult?.joining_fees || 0,
      roi: geniusResult?.roi || 0
    };
  };

  const cardsData = selectedCards.map(getCardData);

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 flex items-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative w-full bg-background rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[95vh] overflow-hidden">
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
            
            {/* Card Names Header */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-center space-x-4">
                {cardsData.map((cardData, index) => (
                  <React.Fragment key={cardData.id || index}>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                      <img
                        src={cardData.image}
                        alt={cardData.name}
                        className="w-10 h-6 object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <span className="text-sm font-semibold text-blue-900 truncate max-w-32">
                        {cardData.name}
                      </span>
                    </div>
                    {index < cardsData.length - 1 && (
                      <div className="text-lg font-bold text-muted-foreground">VS</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
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
                {/* Basic Information Table */}
                <UICard className="shadow-lg border-l-4 border-blue-500">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="text-xl flex items-center">
                      <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-48">Feature</TableHead>
                            {cardsData.map((cardData) => (
                              <TableHead key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-8 h-5 object-contain rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm font-medium">{cardData.name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Card Name</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Official name of the credit card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <div className="font-semibold text-gray-900">{cardData.name}</div>
                                <div className="text-sm text-gray-600">{cardData.bank_name}</div>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Rating</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>User rating out of 5 stars based on customer reviews</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-bold">{cardData.rating.toFixed(1)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {cardData.user_rating_count.toLocaleString()} reviews
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Card Type</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Category of the credit card (rewards, cashback, travel, etc.)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <Badge className="bg-blue-600 text-white text-xs">
                                  {cardData.card_type}
                                </Badge>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Network</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Payment network (Visa, Mastercard, RuPay, etc.)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                                  {cardData.card_network}
                                </Badge>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </UICard>

                {/* Fees & Charges Table */}
                <UICard className="shadow-lg border-l-4 border-green-500">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-xl flex items-center">
                      <Award className="h-6 w-6 mr-3 text-green-600" />
                      Fees & Charges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-48">Fee Type</TableHead>
                            {cardsData.map((cardData) => (
                              <TableHead key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-8 h-5 object-contain rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm font-medium">{cardData.name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Joining Fee</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>One-time fee to get the card. This is deducted from total savings to calculate net savings</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <div className="text-red-700 font-semibold">
                                  {cardData.joining_fee_text || (cardData.joining_fee ? `₹${cardData.joining_fee}` : 'Free')}
                                </div>
                                <div className="text-xs text-red-600">one time</div>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Annual Fee</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Yearly fee charged for maintaining the card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <div className="text-blue-700 font-semibold">
                                  {cardData.annual_fee_text || (cardData.annual_fee ? `₹${cardData.annual_fee}` : 'Free')}
                                </div>
                                <div className="text-xs text-blue-600">per year</div>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </UICard>

                {/* Eligibility Criteria Table */}
                <UICard className="shadow-lg border-l-4 border-purple-500">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <CardTitle className="text-xl flex items-center">
                      <Shield className="h-6 w-6 mr-3 text-purple-600" />
                      Eligibility Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-48">Criteria</TableHead>
                            {cardsData.map((cardData) => (
                              <TableHead key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-8 h-5 object-contain rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm font-medium">{cardData.name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Age Criteria (Salaried)</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Age requirements for salaried individuals</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <span className="text-sm">{extractTextFromData(cardData.age_criteria)}</span>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Income Criteria (Salaried)</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Minimum income requirement for salaried individuals</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <span className="text-sm">{extractTextFromData(cardData.income_salaried)}</span>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Credit Rating</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Required credit score or rating for approval</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <span className="text-sm">{extractTextFromData(cardData.crif)}</span>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </UICard>

                {/* How To Redeem Rewards Section */}
                <UICard className="shadow-lg border-l-4 border-green-500">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-xl flex items-center">
                      <Award className="h-6 w-6 mr-3 text-green-600" />
                      How To Redeem Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-48">Feature</TableHead>
                            {cardsData.map((cardData) => (
                              <TableHead key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-8 h-5 object-contain rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm font-medium">{cardData.name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Points Value</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Reward points conversion rate and value</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <span className="text-sm">{extractTextFromData(cardData.reward_conversion_rate)}</span>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Redeem For</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>What you can redeem your rewards for</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <span className="text-sm">{extractTextFromData(cardData.redemption_options)}</span>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Catalogue</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Reward catalogue and redemption options</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <span className="text-sm">
                                  {cardData.redemption_catalogue ? (
                                    (() => {
                                      const catalogueText = extractTextFromData(cardData.redemption_catalogue);
                                      if (catalogueText.includes('http')) {
                                        const urlMatch = catalogueText.match(/(https?:\/\/[^\s]+)/);
                                        return urlMatch ? (
                                          <a 
                                            href={urlMatch[0]} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                          >
                                            View Catalogue
                                          </a>
                                        ) : (
                                          catalogueText
                                        );
                                      } else {
                                        return catalogueText;
                                      }
                                    })()
                                  ) : (
                                    'Not specified'
                                  )}
                                </span>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </UICard>

                {/* Exclusion Earnings Section */}
                <UICard className="shadow-lg border-l-4 border-red-500">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                    <CardTitle className="text-xl flex items-center">
                      <X className="h-6 w-6 mr-3 text-red-600" />
                      Exclusion Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-48">Exclusions</TableHead>
                            {cardsData.map((cardData) => (
                              <TableHead key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-8 h-5 object-contain rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm font-medium">{cardData.name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Excluded Categories</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Spending categories that don't earn rewards</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <div className="text-sm max-h-32 overflow-y-auto">
                                  {cardData.exclusion_earnings ? (
                                    <ul className="text-left space-y-1">
                                      {Array.isArray(cardData.exclusion_earnings) ? (
                                        // Handle array of objects
                                        cardData.exclusion_earnings.map((item, idx) => (
                                          <li key={idx} className="flex items-start">
                                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                            <span className="text-red-800 text-xs">{extractTextFromData(item)}</span>
                                          </li>
                                        ))
                                      ) : (
                                        // Handle string format
                                        cardData.exclusion_earnings.split(/\r?\n|,|•|\u2022/).map((item, idx) => {
                                          const trimmed = item.trim();
                                          return trimmed ? (
                                            <li key={idx} className="flex items-start">
                                              <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                              <span className="text-red-800 text-xs">{trimmed}</span>
                                            </li>
                                          ) : null;
                                        })
                                      )}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-500">No exclusions specified</span>
                                  )}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </UICard>

                {/* Product USPs & Features Section */}
                <UICard className="shadow-lg border-l-4 border-purple-500">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <CardTitle className="text-xl flex items-center">
                      <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
                      Product USPs & Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-48">Features</TableHead>
                            {cardsData.map((cardData) => (
                              <TableHead key={cardData.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-8 h-5 object-contain rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm font-medium">{cardData.name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-1">
                                <span>Key Features</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Unique selling points and key features of the card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            {cardsData.map((cardData) => (
                              <TableCell key={cardData.id} className="text-center">
                                <div className="text-sm max-h-32 overflow-y-auto">
                                  {cardData.product_usps && cardData.product_usps.length > 0 ? (
                                    <ul className="text-left space-y-1">
                                      {cardData.product_usps.map((usp, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                          <span className="text-purple-800 text-xs">{extractTextFromData(usp)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-500">No features specified</span>
                                  )}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </UICard>
              </TabsContent>

              <TabsContent value="spending" className="p-4 space-y-6">
                {isGeniusFilterActive && geniusResults ? (
                  <>
                    {/* Spending Comparison Results */}
                    <UICard className="shadow-lg border-l-4 border-green-500">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                        <CardTitle className="text-xl flex items-center justify-between">
                          <div className="flex items-center">
                            <PiggyBank className="h-6 w-6 mr-3 text-green-600" />
                            Spending Comparison Results
                          </div>
                          <Badge variant="default" className="bg-green-600 text-white">
                            Genius Filter Active
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-green-700">
                          Compare potential savings across {selectedCards.length} cards based on your spending patterns
                        </p>
                      </CardHeader>
                    </UICard>

                    {/* Savings Summary Table */}
                    <UICard className="shadow-lg border-l-4 border-blue-500">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <CardTitle className="text-xl flex items-center">
                          <Calculator className="h-6 w-6 mr-3 text-blue-600" />
                          Savings Summary
                        </CardTitle>
                        <p className="text-sm text-blue-700 mt-2">
                          Note: Total savings are calculated annually. Individual category breakdown shows monthly savings by default.
                        </p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-48">Metric</TableHead>
                                {cardsData.map((cardData) => (
                                  <TableHead key={cardData.id} className="text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                      <img
                                        src={cardData.image}
                                        alt={cardData.name}
                                        className="w-8 h-5 object-contain rounded"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/placeholder.svg';
                                        }}
                                      />
                                      <span className="text-sm font-medium">{cardData.name}</span>
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-1">
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
                                </TableCell>
                                {cardsData.map((cardData) => (
                                  <TableCell key={cardData.id} className="text-center">
                                    <div className="text-green-700 font-semibold">
                                      {formatCurrency(cardData.totalSavingsYearly)}
                                    </div>
                                    <div className="text-xs text-green-600">per year</div>
                                  </TableCell>
                                ))}
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-1">
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
                                </TableCell>
                                {cardsData.map((cardData) => (
                                  <TableCell key={cardData.id} className="text-center">
                                    <div className="text-red-700 font-semibold">
                                      {formatCurrency(cardData.joiningFees)}
                                    </div>
                                    <div className="text-xs text-red-600">one time</div>
                                  </TableCell>
                                ))}
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-1">
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
                                </TableCell>
                                {cardsData.map((cardData) => (
                                  <TableCell key={cardData.id} className="text-center">
                                    <div className={`font-bold text-lg ${
                                      cardData.netSavings > 0 ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                      {formatCurrency(cardData.netSavings)}
                                    </div>
                                    <div className="text-xs text-gray-600">after fees</div>
                                  </TableCell>
                                ))}
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-1">
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
                                </TableCell>
                                {cardsData.map((cardData) => (
                                  <TableCell key={cardData.id} className="text-center">
                                    <div className="text-blue-700 font-semibold">
                                      {formatPercentage(cardData.roi)}
                                    </div>
                                    <div className="text-xs text-blue-600">ROI</div>
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </UICard>

                    {/* Spending Category Breakdown */}
                    {cardsData.some(cardData => cardData.geniusResult?.spending_breakdown_array) && (
                      <UICard className="shadow-lg border-l-4 border-purple-500">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                          <CardTitle className="text-xl flex items-center justify-between">
                            <div className="flex items-center">
                              <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
                              Spending Category Breakdown
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-purple-700">View:</span>
                              <div className="flex bg-purple-200 rounded-lg p-1">
                                <Button
                                  variant={spendingViewMode === 'monthly' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setSpendingViewMode('monthly')}
                                  className={`text-xs px-3 py-1 ${
                                    spendingViewMode === 'monthly' 
                                      ? 'bg-purple-600 text-white' 
                                      : 'text-purple-700 hover:text-purple-900'
                                  }`}
                                >
                                  Monthly
                                </Button>
                                <Button
                                  variant={spendingViewMode === 'yearly' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setSpendingViewMode('yearly')}
                                  className={`text-xs px-3 py-1 ${
                                    spendingViewMode === 'yearly' 
                                      ? 'bg-purple-600 text-white' 
                                      : 'text-purple-700 hover:text-purple-900'
                                  }`}
                                >
                                  Yearly
                                </Button>
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="w-48">Category</TableHead>
                                  {cardsData.map((cardData) => (
                                    <TableHead key={cardData.id} className="text-center">
                                      <div className="flex items-center justify-center space-x-2">
                                        <img
                                          src={cardData.image}
                                          alt={cardData.name}
                                          className="w-8 h-5 object-contain rounded"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder.svg';
                                          }}
                                        />
                                        <span className="text-sm font-medium">{cardData.name}</span>
                                      </div>
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {cardsData[0]?.geniusResult?.spending_breakdown_array?.map((item: any, idx: number) => {
                                  const categoryName = item.on.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center space-x-1">
                                          <span>{categoryName}</span>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                              <p>Monthly savings from this spending category. Use the toggle to switch between monthly and yearly view.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                      </TableCell>
                                      {cardsData.map((cardData) => {
                                        const breakdownItem = cardData.geniusResult?.spending_breakdown_array?.find((i: any) => i.on === item.on);
                                        const monthlySavings = breakdownItem?.savings || 0;
                                        const yearlySavings = monthlySavings * 12;
                                        const displaySavings = spendingViewMode === 'yearly' ? yearlySavings : monthlySavings;
                                        
                                        return (
                                          <TableCell key={cardData.id} className="text-center">
                                            <div className="text-green-700 font-semibold">
                                              {formatCurrency(displaySavings)}
                                            </div>
                                            <div className="text-xs text-green-600">
                                              {spendingViewMode === 'yearly' ? 'per year' : 'per month'}
                                            </div>
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </UICard>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <CalculatorIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Spending Data Available</h3>
                    <p className="text-gray-600 mb-6">
                      Apply the Genius Filter to see detailed spending comparison between these cards.
                    </p>
                    <Button
                      onClick={() => setActiveTab('textual')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Textual Comparison
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedComparisonModal; 