
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Loader2, 
  RefreshCw, 
  Badge as BadgeIcon, 
  BarChart3, 
  CreditCard, 
  Sparkles, 
  Target, 
  Filter, 
  Search, 
  TrendingUp, 
  Award, 
  Shield, 
  Zap, 
  Crown, 
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  DollarSign,
  TrendingDown,
  Eye,
  GitCompare,
  MessageCircle,
  Plus,
  X
} from 'lucide-react';
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
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollToTop from "@/components/ui/ScrollToTop";

const ConfettiAnimation = () => (
  <div className="pointer-events-none">
    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(-40px) scale(1); opacity: 1; }
        100% { transform: translateY(120px) scale(0.8); opacity: 0; }
      }
    `}</style>
    {[...Array(18)].map((_, i) => (
      <span
        key={i}
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random()}s`,
          background: `hsl(${Math.random() * 360}, 80%, 60%)`,
        }}
        className="absolute top-0 w-2 h-2 rounded-full opacity-80 animate-[confetti-fall_1.2s_ease-in-out]"
      />
    ))}
  </div>
);

const AllCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState(''); // <-- new state
  const [filters, setFilters] = useState<CardFilters>({});
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [selectedCardForAI, setSelectedCardForAI] = useState<Card | null>(null);
  const [selectedCardsForCompare, setSelectedCardsForCompare] = useState<Card[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [showCompareOnboarding, setShowCompareOnboarding] = useState(false);
  const [searchParams] = useSearchParams();
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityForm, setEligibilityForm] = useState({ pincode: '', inhandIncome: '', empStatus: 'salaried' as 'salaried' | 'self_employed' });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [eligibleAliases, setEligibleAliases] = useState<string[] | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Refs for smooth scrolling
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  const filtersSectionRef = useRef<HTMLDivElement>(null);
  const searchHeaderRef = useRef<HTMLDivElement>(null);

  // State to track if search was just performed
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchAllCards = async () => {
    setLoading(true);
    try {
      console.log('AllCards: Fetching cards with filters:', filters);
      
      // Debug: First get all cards without any Card Genius filtering
      const allCards = await cardService.getCards({});
      console.log('AllCards: Total cards from BankKaro API:', allCards.length);
      console.log('AllCards: Sample BankKaro cards:', allCards.slice(0, 3).map(card => ({
        name: card.name,
        seo_card_alias: card.seo_card_alias,
        id: card.id,
        bank_name: card.bank_name,
        joining_fee: card.joining_fee,
        joining_fee_text: card.joining_fee_text,
        annual_fee: card.annual_fee,
        annual_fee_text: card.annual_fee_text
      })));
      
      // Log all available fields for the first card
      if (allCards.length > 0) {
        console.log('AllCards: First BankKaro card full structure:', allCards[0]);
        console.log('AllCards: First BankKaro card available fields:', Object.keys(allCards[0]));
        
        // Log some sample exclusion_spends data
        console.log('AllCards: Sample exclusion_spends data:');
        allCards.slice(0, 5).forEach((card, index) => {
          console.log(`Card ${index + 1} (${card.name}):`, card.exclusion_spends);
        });
      }
      
      // Now get cards with filters
      const fetchedCards = await cardService.getCards(filters);
      console.log('AllCards: Fetched cards count after filtering:', fetchedCards.length);
      
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
  }, [filters.domestic_lounges_min, filters.international_lounges_min]); // Refetch when either lounge filter changes

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Check for onboarding parameter and comparison mode
  useEffect(() => {
    const onboarding = searchParams.get('onboarding');
    const mode = searchParams.get('mode');
    
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
    } else if (onboarding === 'compare-cards' || mode === 'compare') {
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

  // Enhanced search functionality with smooth scrolling
  // Remove old handleSearchChange

  // Smooth scroll to cards section
  const scrollToCardsSection = () => {
    if (cardsSectionRef.current) {
      cardsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Smooth scroll to filters section
  const scrollToFiltersSection = () => {
    if (filtersSectionRef.current) {
      filtersSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Handle search submission (from search header)
  const handleSearchSubmit = () => {
    if (pendingSearchQuery.trim()) {
      setSearchQuery(pendingSearchQuery);
      setSearchPerformed(true);
      setTimeout(() => {
        scrollToCardsSection();
      }, 100);
    }
  };

  useEffect(() => {
    applyFiltersAndSearch();
  }, [cards, searchQuery, filters]);

  const applyFiltersAndSearch = () => {
    let result = [...cards];

    console.log('AllCards: Starting filter application with filters:', filters);
    console.log('AllCards: Initial cards count:', result.length);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => {
        // Search in card name
        if (card.name?.toLowerCase().includes(query)) return true;
        
        // Search in bank name
        if (card.bank_name?.toLowerCase().includes(query)) return true;
        
        // Search in card type
        if (card.card_type?.toLowerCase().includes(query)) return true;
        
        // Search in card network
        if (card.card_network?.toLowerCase().includes(query)) return true;
        
        // Search in key features
        if (card.key_features && Array.isArray(card.key_features)) {
          if (card.key_features.some(feature => feature?.toLowerCase().includes(query))) return true;
        }
        
        // Search in tags
        if (card.tags && Array.isArray(card.tags)) {
          if (card.tags.some((tag: any) => {
            const tagText = typeof tag === 'string' ? tag : (tag.name || tag.header || '');
            return tagText?.toLowerCase().includes(query);
          })) return true;
        }
        
        // Search in joining fee text
        if (card.joining_fee_text?.toLowerCase().includes(query)) return true;
        
        // Search in annual fee text
        if (card.annual_fee_text?.toLowerCase().includes(query)) return true;
        

        
        // Search in age criteria
        if (card.age_criteria?.toLowerCase().includes(query)) return true;
        
        // Search in exclusion spends (spending categories)
        if (card.exclusion_spends?.toLowerCase().includes(query)) return true;
        
        return false;
      });
      console.log('AllCards: After search filter, cards count:', result.length);
    }

    // Apply filters
    if (filters.card_networks && filters.card_networks.length > 0) {
      result = result.filter(card => filters.card_networks!.includes(card.card_type));
      console.log('AllCards: After card networks filter (using card_type), cards count:', result.length);
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
      console.log('AllCards: After tags filter, cards count:', result.length);
    }
    if (filters.card_types && filters.card_types.length > 0) {
      result = result.filter(card => filters.card_types!.includes(card.card_type));
      console.log('AllCards: After card types filter, cards count:', result.length);
    }
    
    // Joining fee filters (numeric range and Free)
    if (filters.joining_fee_min !== undefined || filters.joining_fee_max !== undefined || filters.joining_fee_free) {
      console.log('AllCards: Applying joining fee filter:', { 
        min: filters.joining_fee_min, 
        max: filters.joining_fee_max, 
        free: filters.joining_fee_free 
      });
      
      if (filters.joining_fee_free) {
        // Match all cards with joining_fee or joining_fee_text as 0, '0', 'Free', '₹0', '0.00', 'free'
        result = result.filter(card => {
          const values = [card.joining_fee, card.joining_fee_text];
          const isFree = values.some(val => {
            if (!val) return false;
            const str = String(val).replace(/\s/g, '').toLowerCase();
            return str === '0' || str === 'free' || str === '₹0' || str === '0.00';
          });
          
          if (isFree) {
            console.log('AllCards: Card matches FREE filter:', card.name, 'values:', values);
          }
          
          return isFree;
        });
        console.log('AllCards: After joining fee FREE filter, cards count:', result.length);
      } else {
        result = result.filter(card => {
          // Check both joining_fee and joining_fee_text fields
          const feeValues = [card.joining_fee, card.joining_fee_text];
          console.log('AllCards: Processing card:', card.name, 'fee values:', feeValues);
          
          for (const fee of feeValues) {
            if (!fee) continue;
            
            let feeStr = String(fee);
            // Remove currency symbols, commas, spaces, and extract numeric value
            feeStr = feeStr.replace(/[^\d.]/g, '');
            const num = parseInt(feeStr, 10);
            
            console.log('AllCards: Card:', card.name, 'fee:', fee, 'cleaned:', feeStr, 'numeric:', num);
            
            if (!isNaN(num)) {
              // Check if this numeric value falls within the filter range
              if (filters.joining_fee_min !== undefined && num < filters.joining_fee_min) {
                console.log('AllCards: Card filtered out - below min:', card.name, num, '<', filters.joining_fee_min);
                continue;
              }
              if (filters.joining_fee_max !== undefined && num > filters.joining_fee_max) {
                console.log('AllCards: Card filtered out - above max:', card.name, num, '>', filters.joining_fee_max);
                continue;
              }
              console.log('AllCards: Card matches range filter:', card.name, num);
              return true; // Found a valid fee value within range
            }
          }
          
          console.log('AllCards: Card filtered out - no valid fee values:', card.name);
          return false; // No valid fee values found within range
        });
        console.log('AllCards: After joining fee filter, cards count:', result.length);
      }
    }

    // Annual fee filters (numeric range and Free)
    if (filters.annual_fee_min !== undefined || filters.annual_fee_max !== undefined || filters.annual_fee_free) {
      if (filters.annual_fee_free) {
        // Match all cards with annual_fee or annual_fee_text as 0, '0', 'Free', '₹0', '0.00', 'free'
        result = result.filter(card => {
          const values = [card.annual_fee, card.annual_fee_text];
          return values.some(val => {
            if (!val) return false;
            const str = String(val).replace(/\s/g, '').toLowerCase();
            return str === '0' || str === 'free' || str === '₹0' || str === '0.00';
          });
        });
        console.log('AllCards: After annual fee FREE filter, cards count:', result.length);
      } else {
        result = result.filter(card => {
          let fee = card.annual_fee_text || card.annual_fee;
          if (typeof fee === 'string') {
            fee = fee.replace(/[^\d.]/g, '');
          }
          const num = parseInt(fee, 10);
          if (isNaN(num)) return false;
          
          if (filters.annual_fee_min !== undefined && num < filters.annual_fee_min) return false;
          if (filters.annual_fee_max !== undefined && num > filters.annual_fee_max) return false;
          return true;
        });
        console.log('AllCards: After annual fee filter, cards count:', result.length);
      }
    }
    
    // Joining fee text filter (exact match)
    if (filters.joining_fee_text && filters.joining_fee_text !== "all") {
      console.log('AllCards: Applying joining fee text filter:', filters.joining_fee_text);
      result = result.filter(card => card.joining_fee_text === filters.joining_fee_text);
      console.log('AllCards: After joining fee text filter, cards count:', result.length);
    }
    
    // Note: Annual fee text filter removed - now using range-based filtering above
    
    if (filters.rating) {
      result = result.filter(card => card.rating >= filters.rating!);
      console.log('AllCards: After rating filter, cards count:', result.length);
    }
    if (filters.free_cards === "true") {
      result = result.filter(card =>
        !card.annual_fee || card.annual_fee === "0" || card.annual_fee === "Free"
      );
      console.log('AllCards: After free cards filter, cards count:', result.length);
    }
    if (filters.exclude_points) {
      result = result.filter(card =>
        !card.name.toLowerCase().includes('points') &&
        !card.key_features.some(feature =>
          feature.toLowerCase().includes('points')
        )
      );
      console.log('AllCards: After exclude points filter, cards count:', result.length);
    }
    
    // Age filter - IMPROVED: Better parsing and fallback logic
    if (filters.age_min !== undefined || filters.age_max !== undefined) {
      console.log('AllCards: Applying age filter:', { min: filters.age_min, max: filters.age_max });
      result = result.filter(card => {
        // First try to parse age_criteria field
        if (card.age_criteria) {
          const ageMatch = card.age_criteria.match(/(\d+)(?:\s*-\s*(\d+))?/);
          if (ageMatch) {
            const minAge = parseInt(ageMatch[1], 10);
            const maxAge = ageMatch[2] ? parseInt(ageMatch[2], 10) : minAge + 50;
            
            if (filters.age_min !== undefined && maxAge < filters.age_min) return false;
            if (filters.age_max !== undefined && minAge > filters.age_max) return false;
            return true;
          }
        }
        
        // Fallback to eligibility fields
        if (card.eligibility) {
          const minAge = card.eligibility.age_min;
          const maxAge = card.eligibility.age_max;
          
          if (filters.age_min !== undefined && maxAge < filters.age_min) return false;
          if (filters.age_max !== undefined && minAge > filters.age_max) return false;
          return true;
        }
        
        return true; // If no age data available, include the card
      });
      console.log('AllCards: After age filter, cards count:', result.length);
    }
    
    // Spending categories filter - exclude cards that have selected categories in exclusion_spends
    if (filters.spending_categories && filters.spending_categories.length > 0) {
      console.log('AllCards: Applying spending categories filter:', filters.spending_categories);
      result = result.filter(card => {
        if (!card.exclusion_spends) return true; // Include cards with no exclusion data
        
        const exclusionText = card.exclusion_spends.toLowerCase();
        const hasExcludedCategory = filters.spending_categories!.some(category => 
          exclusionText.includes(category.toLowerCase())
        );
        
        if (hasExcludedCategory) {
          console.log('AllCards: Card filtered out due to excluded spending category:', card.name, 'exclusion:', card.exclusion_spends);
        }
        
        return !hasExcludedCategory; // Exclude cards that have the selected category in their exclusion list
      });
      console.log('AllCards: After spending categories filter, cards count:', result.length);
    }
    
    // Eligibility filter
    if (filters.eligibleAliases && filters.eligibleAliases.length > 0) {
      result = result.filter(card => filters.eligibleAliases!.includes(card.seo_card_alias || ''));
      console.log('AllCards: After eligibility filter, cards count:', result.length);
    }

    // Sort the results
    const sortedResult = sortCards(result, filters.sort_by || 'rating-high');
    setFilteredCards(sortedResult);
    
    // If search was performed and we have results, scroll to cards section
    if (searchPerformed && sortedResult.length > 0) {
      setTimeout(() => {
        scrollToCardsSection();
      }, 300);
    }
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
          const aFee = parseInt(String(a.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
          const bFee = parseInt(String(b.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
          return aFee - bFee;
        });
      case 'fee-high':
        return sorted.sort((a, b) => {
          const aFee = parseInt(String(a.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
          const bFee = parseInt(String(b.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
          return bFee - aFee;
        });
      default:
        return sorted;
    }
  };

  const handleFiltersChange = (newFilters: CardFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSearchPerformed(false);
  };

  const handleClearEligibility = () => {
    setFilters(prev => ({ ...prev, eligibleAliases: undefined }));
    setEligibleAliases(null);
    setEligibleCount(0);
  };

  const handleRefresh = () => {
    fetchAllCards();
  };

  const handleAddToCompare = (card: Card) => {
    if (selectedCardsForCompare.length < 3) {
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
    const url = new URL(window.location.href);
    url.searchParams.delete('onboarding');
    window.history.replaceState({}, '', url.toString());
  };

  const handleCompareOnboardingComplete = () => {
    setShowCompareOnboarding(false);
    // Remove the onboarding parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('onboarding');
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value &&
        key !== 'eligiblityPayload' &&
        key !== 'cardGeniusPayload' &&
        (Array.isArray(value) ? value.length > 0 : value !== '')) {
        
        // Special handling for fee filters
        if (key === 'joining_fee_free' || key === 'annual_fee_free') {
          // Only count if it's true (Free is selected)
          if (value === true) count++;
        } else if (key === 'joining_fee_min' || key === 'joining_fee_max' || 
                   key === 'annual_fee_min' || key === 'annual_fee_max') {
          // Only count if the corresponding free flag is not true
          if (key.startsWith('joining_fee') && !filters.joining_fee_free) {
            count++;
          } else if (key.startsWith('annual_fee') && !filters.annual_fee_free) {
            count++;
          }
        } else if (key === 'domestic_lounges_min' || key === 'international_lounges_min') {
          if (value > 0) count++;
        } else {
          count++;
        }
      }
    });
    
    // Deduplicate fee range filters (min/max count as one filter)
    if (filters.joining_fee_min !== undefined && filters.joining_fee_max !== undefined && !filters.joining_fee_free) {
      count--; // Remove one count since min/max are counted separately above
    }
    if (filters.annual_fee_min !== undefined && filters.annual_fee_max !== undefined && !filters.annual_fee_free) {
      count--; // Remove one count since min/max are counted separately above
    }
    
    return count;
  };

  const sortBy = filters.sort_by || 'rating-high';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Search Header with ref */}
      <div ref={searchHeaderRef}>
      <SearchHeader
        searchQuery={pendingSearchQuery}
          onSearchChange={setPendingSearchQuery}
          onSearchSubmit={handleSearchSubmit}
      />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Filters Sidebar with ref */}
          <div className="lg:col-span-1">
            <motion.div 
              ref={filtersSectionRef}
              className="sticky top-24"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                cards={cards}
              />
            </motion.div>
            </div>
          
          {/* Enhanced Main Content with ref */}
          <div className="lg:col-span-3">
            {/* Enhanced Header Section */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Stats and Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cards</p>
                        <p className="text-lg font-bold text-foreground">
                  {loading ? (
                            <span className="flex items-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading...
                            </span>
                  ) : (
                            `${filteredCards.length} of ${cards.length}`
                  )}
                </p>
                      </div>
                    </div>
                    
                {getActiveFiltersCount() > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
                          <Filter className="h-3 w-3 mr-1" />
                          {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''}
                  </Badge>
                      </div>
                    )}
                    
                    {filters.eligibleAliases && filters.eligibleAliases.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 animate-badge-pulse">
                          <Shield className="h-3 w-3 mr-1" />
                          {filters.eligibleAliases.length} eligible
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearEligibility}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                {selectedCardsForCompare.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                          <GitCompare className="h-3 w-3 mr-1" />
                          {selectedCardsForCompare.length} selected
                  </Badge>
                      </div>
                )}
              </div>
                </div>
                
                {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                      className="border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  onClick={() => {
                        setEligibilityForm({ pincode: '', inhandIncome: '', empStatus: 'salaried' as 'salaried' | 'self_employed' });
                    setEligibilityError('');
                    setEligibleAliases(null);
                    setShowEligibilityModal(true);
                  }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                      <Shield className="h-4 w-4 mr-2" />
                  Check Eligibility
                </Button>
                  </motion.div>
              </div>
            </div>
            </motion.div>
            
            {/* Enhanced Cards Section with ref */}
            <motion.div
              ref={cardsSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
            {loading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                  <CardSkeleton key={index} viewMode="list" />
                    </motion.div>
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
                <motion.div 
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BadgeIcon className="h-10 w-10 text-gray-400" />
                </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-700">No cards found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or search terms to find the perfect credit card for you
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleClearFilters} variant="outline" className="border-gray-200">
                      <XCircle className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                    <Button 
                      onClick={() => setSearchQuery('')} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Clear Search
                </Button>
              </div>
                </motion.div>
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
                eligibleAliases={filters.eligibleAliases}
              />
            )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Widget */}
      <AnimatePresence>
      {showAIWidget && selectedCardForAI && (
        <AIWidget
          showAIWidget={showAIWidget}
          onClose={() => {
            setShowAIWidget(false);
            setSelectedCardForAI(null);
          }}
          selectedCard={selectedCardForAI}
        />
      )}
      </AnimatePresence>

      {/* Enhanced Floating Compare Button */}
      <AnimatePresence>
      {selectedCardsForCompare.length > 0 && (
          <motion.div 
            className="fixed bottom-6 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
          <Button
            onClick={handleCompareNow}
            size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl rounded-full px-6 py-3 h-auto"
          >
              <GitCompare className="h-5 w-5 mr-2" />
              Compare ({selectedCardsForCompare.length})
          </Button>
          </motion.div>
      )}
      </AnimatePresence>
  
      {/* Enhanced Comparison Modal */}
      <ComparisonModal
        isOpen={showComparisonModal}
        onClose={handleCloseComparison}
        selectedCards={selectedCardsForCompare}
      />

      {/* Enhanced Eligibility Modal */}
      <Dialog open={showEligibilityModal} onOpenChange={setShowEligibilityModal}>
        <DialogContent className="max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Check Your Eligibility</h2>
            <p className="text-gray-600">Enter your details to see which cards you're eligible for</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                placeholder="Enter your pincode"
                value={eligibilityForm.pincode}
                onChange={(e) => setEligibilityForm(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="income">Monthly In-Hand Income</Label>
              <Input
                id="income"
                placeholder="Enter your monthly income"
                value={eligibilityForm.inhandIncome}
                onChange={(e) => setEligibilityForm(prev => ({ ...prev, inhandIncome: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Employment Status</Label>
              <RadioGroup
                value={eligibilityForm.empStatus}
                onValueChange={(value: 'salaried' | 'self_employed') => 
                  setEligibilityForm(prev => ({ ...prev, empStatus: value }))
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="salaried" id="salaried" />
                  <Label htmlFor="salaried">Salaried</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self_employed" id="self_employed" />
                  <Label htmlFor="self_employed">Self Employed</Label>
              </div>
              </RadioGroup>
            </div>
            
            {eligibilityError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{eligibilityError}</p>
              </div>
            )}
            
            <Button
              onClick={async () => {
                  setEligibilityLoading(true);
                  setEligibilityError('');
                
                try {
                  const result = await cardService.checkEligibility(eligibilityForm);
                  setEligibleAliases(result.eligibleCards);
                  setEligibleCount(result.totalEligible);
                  setFilters(prev => ({ ...prev, eligibleAliases: result.eligibleCards }));
                  setShowEligibilityModal(false);
                    setShowCongrats(true);
                  
                  // Auto-scroll to cards section after eligibility check
                    setTimeout(() => {
                    scrollToCardsSection();
                  }, 500);
                } catch (error) {
                  setEligibilityError('Failed to check eligibility. Please try again.');
                  } finally {
                    setEligibilityLoading(false);
                  }
                }}
              disabled={eligibilityLoading || !eligibilityForm.pincode || !eligibilityForm.inhandIncome}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {eligibilityLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Check Eligibility
                </>
              )}
            </Button>
                </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Congratulations Modal */}
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md text-center">
          <div className="relative">
            <ConfettiAnimation />
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
                </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Congratulations!</h2>
            <p className="text-gray-600 mb-6">
              You're eligible for <span className="font-semibold text-green-600">{eligibleCount} credit cards</span>!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              We've filtered the results to show only the cards you're eligible for. You can still view all cards by clearing the eligibility filter.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setShowCongrats(false);
                  scrollToCardsSection();
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Eligible Cards
                </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCongrats(false);
                  handleClearEligibility();
                }}
                className="border-gray-200"
              >
                <X className="h-4 w-4 mr-2" />
                View All Cards
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Onboarding Overlays */}
      <AnimatePresence>
        {showAIOnboarding && (
          <AIOnboardingOverlay
            isVisible={showAIOnboarding}
            onClose={() => setShowAIOnboarding(false)}
            onComplete={handleAIOnboardingComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompareOnboarding && (
          <CompareOnboardingOverlay
            isVisible={showCompareOnboarding}
            onClose={() => setShowCompareOnboarding(false)}
            onComplete={handleCompareOnboardingComplete}
          />
        )}
      </AnimatePresence>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default AllCards;
