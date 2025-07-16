import React, { useState } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Star, TrendingUp, FileText, CreditCard, Users, Award, Shield, Calendar, DollarSign, Sparkles, Zap, Info, ExternalLink } from 'lucide-react';
import { Card } from '@/services/api';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: Card[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, selectedCards }) => {
  const [activeTab, setActiveTab] = useState('textual');

  if (!isOpen || selectedCards.length === 0) return null;

  const formatRating = (rating: number) => rating.toFixed(1);
  const formatUserCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
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
                        
                        {card.commission && (
                          <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                            <div className="flex items-center mb-2">
                              <TrendingUp className="h-4 w-4 text-teal-600 mr-2" />
                              <span className="text-sm font-medium text-teal-800">Commission</span>
                            </div>
                            <span className="text-lg font-bold text-teal-900">{card.commission}</span>
                          </div>
                        )}
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

            <TabsContent value="spending" className="p-4">
              <UICard>
                <CardHeader>
                  <CardTitle className="text-lg">Spending Comparison</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Detailed spending analysis and rewards comparison will be available soon.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                      We're working on integrating spending analysis and rewards comparison features.
                      This will help you make informed decisions based on your spending patterns.
                    </p>
                  </div>
                </CardContent>
              </UICard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal; 