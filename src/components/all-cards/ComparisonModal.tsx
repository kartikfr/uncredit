import React, { useState } from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Star, TrendingUp, FileText } from 'lucide-react';
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
          
          {/* Selected Cards Preview */}
          <div className="px-4 pb-4">
            <div className="flex space-x-3 overflow-x-auto">
              {selectedCards.map((card, index) => (
                <div key={card.id} className="flex-shrink-0 flex items-center space-x-2 bg-muted/50 rounded-lg p-2">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-8 h-5 object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <span className="text-sm font-medium truncate max-w-24">
                    {card.name}
                  </span>
                </div>
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
              {/* Basic Info Comparison */}
              <UICard>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-3">
                        <div className="text-center">
                          <img
                            src={card.image}
                            alt={card.name}
                            className="w-24 h-16 object-contain mx-auto rounded-lg bg-white border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          <h3 className="font-semibold mt-2 text-sm line-clamp-2">{card.name}</h3>
                          <p className="text-xs text-muted-foreground">{card.bank_name}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{formatRating(card.rating)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Reviews:</span>
                            <span className="font-medium">{formatUserCount(card.user_rating_count)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="secondary" className="text-xs">
                              {card.card_type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Network:</span>
                            <Badge variant="outline" className="text-xs">
                              {card.card_network}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Fees Comparison */}
              <UICard>
                <CardHeader>
                  <CardTitle className="text-lg">Fees & Charges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Joining Fee:</span>
                          <span className="font-medium">
                            {card.joining_fee_text ? card.joining_fee_text : (card.joining_fee ? `₹${card.joining_fee}` : 'Free')}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Annual Fee:</span>
                          <span className="font-medium">
                            {card.annual_fee_text ? card.annual_fee_text : (card.annual_fee ? `₹${card.annual_fee}` : 'Free')}
                          </span>
                        </div>
                        
                        {card.commission && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Commission:</span>
                            <span className="font-medium">{card.commission}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Features Comparison */}
              <UICard>
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="space-y-2">
                        {card.key_features && card.key_features.length > 0 ? (
                          <ul className="space-y-1 text-sm">
                            {card.key_features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No features available</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>

              {/* Age Criteria Comparison */}
              {selectedCards.some(card => card.age_criteria) && (
                <UICard>
                  <CardHeader>
                    <CardTitle className="text-lg">Age Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCards.map((card) => (
                        <div key={card.id} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Age Range:</span>
                            <span className="font-medium">
                              {card.age_criteria || 'Not specified'}
                            </span>
                          </div>
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