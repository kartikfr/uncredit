import React, { useState, useEffect } from 'react';
import { Search, Filter, X, CreditCard, Star, TrendingUp, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { contentCreationService } from '@/services/contentCreation';
import { motion, AnimatePresence } from 'framer-motion';

interface CardSelectorProps {
  selectedCards: string[];
  onSelectionChange: (cardIds: string[]) => void;
}

export default function CardSelector({ selectedCards, onSelectionChange }: CardSelectorProps) {
  const [cards, setCards] = useState<any[]>([]);
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, searchQuery, selectedBank, selectedNetwork]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await contentCreationService.getCardsForSelection();
      setCards(fetchedCards);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cards. Please try again.');
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterCards = () => {
    let filtered = cards;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.key_features?.some((feature: string) =>
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Bank filter
    if (selectedBank) {
      filtered = filtered.filter(card => card.bank_name === selectedBank);
    }

    // Network filter
    if (selectedNetwork) {
      filtered = filtered.filter(card => card.card_network === selectedNetwork);
    }

    setFilteredCards(filtered);
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = selectedCards.includes(cardId)
      ? selectedCards.filter(id => id !== cardId)
      : [...selectedCards, cardId];
    onSelectionChange(newSelection);
  };

  const getUniqueBanks = () => {
    const banks = cards.map(card => card.bank_name).filter(Boolean);
    return [...new Set(banks)];
  };

  const getUniqueNetworks = () => {
    const networks = cards.map(card => card.card_network).filter(Boolean);
    return [...new Set(networks)];
  };

  const getCardRating = (card: any) => {
    if (card.rating) return card.rating;
    if (card.user_rating_count) return 4.5; // Default rating
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchCards} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search cards by name, bank, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Banks</option>
            {getUniqueBanks().map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>

          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Networks</option>
            {getUniqueNetworks().map(network => (
              <option key={network} value={network}>{network}</option>
            ))}
          </select>

          {(selectedBank || selectedNetwork) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBank('');
                setSelectedNetwork('');
              }}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Selected Cards Summary */}
      {selectedCards.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-semibold text-emerald-800 mb-2">
            Selected Cards ({selectedCards.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCards.map(cardId => {
              const card = cards.find(c => c.id === cardId);
              return card ? (
                <Badge
                  key={cardId}
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 border-emerald-300"
                >
                  {card.name}
                  <button
                    onClick={() => toggleCardSelection(cardId)}
                    className="ml-1 hover:text-emerald-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedCards.includes(card.id)
                      ? 'ring-2 ring-emerald-500 bg-emerald-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleCardSelection(card.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold line-clamp-2">
                          {card.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 mt-1">
                          {card.bank_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">
                          {getCardRating(card).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Card Network */}
                      <Badge variant="outline" className="text-xs">
                        {card.card_network}
                      </Badge>

                      {/* Enhanced Card Details */}
                      <div className="space-y-2">
                        {/* Reward Rate */}
                        {card.reward_conversion_rate && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {card.reward_conversion_rate}
                            </span>
                          </div>
                        )}
                        
                        {/* Eligibility */}
                        {card.age_criteria && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-gray-600">
                              Age: {card.age_criteria}
                            </span>
                          </div>
                        )}

                        {card.income_salaried && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-gray-600">
                              Income: {card.income_salaried}
                            </span>
                          </div>
                        )}

                        {/* Key Features */}
                        {card.key_features && card.key_features.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Key Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {card.key_features.slice(0, 2).map((feature: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {feature}
                                </span>
                              ))}
                              {card.key_features.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{card.key_features.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Fees */}
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Joining: {card.joining_fee_text || card.joining_fee || 'N/A'}</span>
                          <span>Annual: {card.annual_fee_text || card.annual_fee || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedCards.includes(card.id) && (
                        <div className="flex items-center justify-center pt-2">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* No Results */}
      {filteredCards.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No cards found matching your criteria.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedBank('');
              setSelectedNetwork('');
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
} 