
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, RefreshCw, Badge as BadgeIcon, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cardService, Card, CardFilters } from '@/services/api';
import { SearchHeader } from '@/components/all-cards/SearchHeader';
import { AdvancedFilters } from '@/components/all-cards/AdvancedFilters';
import { CardSkeleton } from '@/components/all-cards/CardSkeleton';
import CardsList from '@/components/all-cards/CardsList';
import ComparisonModal from '@/components/all-cards/ComparisonModal';
import { AIWidget } from '@/components/all-cards/AIWidget';
import AIOnboardingOverlay from '@/components/all-cards/AIOnboardingOverlay';
import CompareOnboardingOverlay from '@/components/all-cards/CompareOnboardingOverlay';
import { useSearchParams } from 'react-router-dom';

const AllCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CardFilters>({});
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [selectedCardForAI, setSelectedCardForAI] = useState<Card | null>(null);
  const [selectedCardsForCompare, setSelectedCardsForCompare] = useState<Card[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [showCompareOnboarding, setShowCompareOnboarding] = useState(false);
  const [searchParams] = useSearchParams();

  const fetchAllCards = async () => {
    setLoading(true);
    try {
      const fetchedCards = await cardService.getCards(filters);
      setCards(fetchedCards);
      setFilteredCards(fetchedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  // Check for onboarding parameter
  useEffect(() => {
    const onboarding = searchParams.get('onboarding');
    if (onboarding === 'ai-assistant') {
      // Wait for cards to load, then show onboarding
      if (!loading && filteredCards.length > 0) {
        setTimeout(() => {
          setShowAIOnboarding(true);
          // Smooth scroll to the first card
          const firstCard = document.querySelector('[data-card-index="0"]');
          if (firstCard) {
            firstCard.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 1500);
      }
    } else if (onboarding === 'compare-cards') {
      // Wait for cards to load, then show compare onboarding
      if (!loading && filteredCards.length > 0) {
        setTimeout(() => {
          setShowCompareOnboarding(true);
          // Smooth scroll to the first card
          const firstCard = document.querySelector('[data-card-index="0"]');
          if (firstCard) {
            firstCard.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 1500);
      }
    }
  }, [searchParams, loading, filteredCards]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [cards, searchQuery, filters]);

  const applyFiltersAndSearch = () => {
    let result = [...cards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card =>
        card.name.toLowerCase().includes(query) ||
        card.bank_name.toLowerCase().includes(query) ||
        card.card_type.toLowerCase().includes(query) ||
        card.key_features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.card_networks && filters.card_networks.length > 0) {
      result = result.filter(card => filters.card_networks!.includes(card.card_network));
    }
    if (filters.selected_tags && filters.selected_tags.length > 0) {
      result = result.filter(card => {
        if (!card.tags || !Array.isArray(card.tags)) return false;
        return filters.selected_tags!.some(tag => 
          card.tags!.some((cardTag: any) => {
            const cardTagText = typeof cardTag === 'string' ? cardTag : (cardTag.name || cardTag.header || '');
            return cardTagText === tag;
          })
        );
      });
    }
    if (filters.card_types && filters.card_types.length > 0) {
      result = result.filter(card => filters.card_types!.includes(card.card_type));
    }
    if (filters.age_criteria) {
      const userAge = parseInt(filters.age_criteria, 10);
      if (!isNaN(userAge)) {
        result = result.filter(card => {
          if (card.age_criteria) {
            // Parse age_criteria like "21-60" or "18+" or "25-65 years"
            const ageMatch = card.age_criteria.match(/(\d+)(?:\s*-\s*(\d+))?/);
            if (ageMatch) {
              const minAge = parseInt(ageMatch[1], 10);
              const maxAge = ageMatch[2] ? parseInt(ageMatch[2], 10) : minAge + 50;
              
              if (!isNaN(minAge) && !isNaN(maxAge)) {
                return userAge >= minAge && userAge <= maxAge;
              }
            }
          }
          
          // Fallback to eligibility fields if age_criteria is not available
          const min = card.eligibility?.age_min ?? 0;
          const max = card.eligibility?.age_max ?? 100;
          return userAge >= min && userAge <= max;
        });
      }
    }
    if (filters.joining_fee_text && filters.joining_fee_text !== "all") {
      result = result.filter(card => card.joining_fee_text === filters.joining_fee_text);
    }
    if (filters.annual_fee_text && filters.annual_fee_text !== "all") {
      result = result.filter(card => card.annual_fee === filters.annual_fee_text);
    }
    if (filters.rating) {
      result = result.filter(card => card.rating >= filters.rating!);
    }
    if (filters.free_cards === "true") {
      result = result.filter(card =>
        !card.annual_fee || card.annual_fee === "0" || card.annual_fee === "Free"
      );
    }
    if (filters.exclude_points) {
      result = result.filter(card =>
        !card.name.toLowerCase().includes('points') &&
        !card.key_features.some(feature =>
          feature.toLowerCase().includes('points')
        )
      );
    }
    if (filters.joining_fee_min !== undefined || filters.joining_fee_max !== undefined) {
      const min = filters.joining_fee_min ?? 0;
      const max = filters.joining_fee_max ?? Number.MAX_SAFE_INTEGER;
      result = result.filter(card => {
        // Prefer joining_fee_text if available, else joining_fee
        let fee = card.joining_fee_text || card.joining_fee;
        if (typeof fee === 'string') {
          fee = fee.replace(/[^\d.]/g, '');
        }
        let num = parseInt(fee, 10);
        if (isNaN(num)) num = 0; // Treat missing/invalid as 0
        return num >= min && num <= max;
      });
    }
    if (filters.annual_fee_min !== undefined || filters.annual_fee_max !== undefined) {
      const min = filters.annual_fee_min ?? 0;
      const max = filters.annual_fee_max ?? Number.MAX_SAFE_INTEGER;
      result = result.filter(card => {
        // Prefer annual_fee_text if available, else annual_fee
        let fee = card.annual_fee_text || card.annual_fee;
        if (typeof fee === 'string') {
          fee = fee.replace(/[^\d.]/g, '');
        }
        let num = parseInt(fee, 10);
        if (isNaN(num)) num = 0; // Treat missing/invalid as 0
        return num >= min && num <= max;
      });
    }
    result = sortCards(result, sortBy);
    setFilteredCards(result);
  };

  const sortCards = (cardsToSort: Card[], sortType: string): Card[] => {
    const sorted = [...cardsToSort];
    switch (sortType) {
      case 'rating-high':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'fee-low':
        return sorted.sort((a, b) => {
          const feeA = parseInt(a.annual_fee) || 0;
          const feeB = parseInt(b.annual_fee) || 0;
          return feeA - feeB;
        });
      case 'fee-high':
        return sorted.sort((a, b) => {
          const feeA = parseInt(a.annual_fee) || 0;
          const feeB = parseInt(b.annual_fee) || 0;
          return feeB - feeA;
        });
      case 'user-count':
        return sorted.sort((a, b) => b.user_rating_count - a.user_rating_count);
      default:
        return sorted;
    }
  };

  const handleFiltersChange = (newFilters: CardFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const handleRefresh = () => {
    fetchAllCards();
  };

  const handleAddToCompare = (card: Card) => {
    if (selectedCardsForCompare.length < 3 && !selectedCardsForCompare.find(c => c.id === card.id)) {
      setSelectedCardsForCompare(prev => [...prev, card]);
    }
  };
  
  const handleRemoveFromCompare = (card: Card) => {
    setSelectedCardsForCompare(prev => prev.filter(c => c.id !== card.id));
  };
  
  const handleCompareNow = () => {
    setShowComparisonModal(true);
  };
  
  const handleCloseComparison = () => {
    setShowComparisonModal(false);
  };

  const handleAIOnboardingComplete = () => {
    setShowAIOnboarding(false);
    // Remove the onboarding parameter from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('onboarding');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleCompareOnboardingComplete = () => {
    setShowCompareOnboarding(false);
    // Remove the onboarding parameter from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('onboarding');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value &&
        key !== 'eligiblityPayload' &&
        key !== 'cardGeniusPayload' &&
        (Array.isArray(value) ? value.length > 0 : value !== '')) {
        count++;
      }
    });
    return count;
  };

  const sortBy = filters.sort_by || 'rating-high';

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                cards={cards}
              />
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-muted-foreground">
                  {loading ? (
                    <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</span>
                  ) : (
                    `Showing ${filteredCards.length} of ${cards.length} cards`
                  )}
                </p>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
                  </Badge>
                )}
                {selectedCardsForCompare.length > 0 && (
                  <Badge variant="default" className="bg-green-500 text-white">
                    {selectedCardsForCompare.length} card{selectedCardsForCompare.length > 1 ? 's' : ''} selected for comparison
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            {/* Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, index) => (
                  <CardSkeleton key={index} viewMode="list" />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No cards found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <CardsList
                cards={filteredCards}
                onAskAI={(card) => {
                  setSelectedCardForAI(card);
                  setShowAIWidget(true);
                }}
                onAddToCompare={handleAddToCompare}
                onRemoveFromCompare={handleRemoveFromCompare}
                selectedCardsForCompare={selectedCardsForCompare}
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Widget */}
      {showAIWidget && selectedCardForAI && (
        <AIWidget
          showAIWidget={showAIWidget}
          onClose={() => {
            setShowAIWidget(false);
            setSelectedCardForAI(null);
          }}
        />
      )}

      {/* Floating Compare Button */}
      {selectedCardsForCompare.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleCompareNow}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Compare Cards ({selectedCardsForCompare.length})
          </Button>
        </div>
      )}
  
      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparisonModal}
        onClose={handleCloseComparison}
        selectedCards={selectedCardsForCompare}
      />

      {/* AI Onboarding Overlay */}
      <AIOnboardingOverlay
        isVisible={showAIOnboarding}
        onClose={() => setShowAIOnboarding(false)}
        onComplete={handleAIOnboardingComplete}
      />

      {/* Compare Onboarding Overlay */}
      <CompareOnboardingOverlay
        isVisible={showCompareOnboarding}
        onClose={() => setShowCompareOnboarding(false)}
        onComplete={handleCompareOnboardingComplete}
      />
    </div>
  );
};

export default AllCards;
