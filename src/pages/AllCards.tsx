
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
  X,
  Brain,
  Calculator
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cardService, Card, CardFilters } from '@/services/api';
import { SearchHeader } from '@/components/all-cards/SearchHeader';
import { AdvancedFilters } from '@/components/all-cards/AdvancedFilters';
import { CardSkeleton } from '@/components/all-cards/CardSkeleton';
import CardsList from '@/components/all-cards/CardsList';
import ComparisonModal from '@/components/all-cards/ComparisonModal';
import EnhancedComparisonModal from '@/components/all-cards/EnhancedComparisonModal';
import { AIWidget } from '@/components/all-cards/AIWidget';
import AIOnboardingOverlay from '@/components/all-cards/AIOnboardingOverlay';
import CompareOnboardingOverlay from '@/components/all-cards/CompareOnboardingOverlay';
import CardGeniusFilter from '@/components/all-cards/CardGeniusFilter';
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
  const [showCardGeniusFilter, setShowCardGeniusFilter] = useState(false);
  const [geniusFilteredCards, setGeniusFilteredCards] = useState<Card[]>([]);
  const [geniusResults, setGeniusResults] = useState<Record<string, any>>({});
  const [isGeniusFilterActive, setIsGeniusFilterActive] = useState(false);
  const [geniusSpendingValues, setGeniusSpendingValues] = useState<Record<string, number>>({});
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
      
      // Only update filteredCards if genius filter is not active
      if (!isGeniusFilterActive) {
        setFilteredCards(fetchedCards);
      } else {
        console.log('🔍 Genius filter is active, preserving filtered cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch all cards if genius filter is not active
    if (!isGeniusFilterActive) {
      fetchAllCards();
    } else {
      console.log('🔍 Genius filter is active, skipping fetchAllCards on lounge filter change');
    }
  }, [filters.domestic_lounges_min, filters.international_lounges_min, isGeniusFilterActive]); // Refetch when either lounge filter changes

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Listen for see details events
  useEffect(() => {
    const handleSeeDetails = (event: CustomEvent) => {
      const { card, geniusResults } = event.detail;
      // Add the card to comparison if not already there
      if (!selectedCardsForCompare.some(c => c.id === card.id)) {
        setSelectedCardsForCompare(prev => [...prev, card]);
      }
      // Open comparison modal
      setShowComparisonModal(true);
    };

    window.addEventListener('seeDetails', handleSeeDetails as EventListener);
    return () => {
      window.removeEventListener('seeDetails', handleSeeDetails as EventListener);
    };
  }, [selectedCardsForCompare]);
  
  // Monitor genius results changes for debugging
  useEffect(() => {
    console.log('🔍 GENIUS RESULTS CHANGED:', {
      isGeniusFilterActive,
      geniusResultsKeys: Object.keys(geniusResults),
      geniusFilteredCardsCount: geniusFilteredCards.length,
      sampleResult: Object.keys(geniusResults).length > 0 ? {
        alias: Object.keys(geniusResults)[0],
        netSavings: geniusResults[Object.keys(geniusResults)[0]]?.net_savings,
        totalSavingsYearly: geniusResults[Object.keys(geniusResults)[0]]?.total_savings_yearly,
        joiningFees: geniusResults[Object.keys(geniusResults)[0]]?.joining_fees
      } : null
    });
  }, [isGeniusFilterActive, geniusResults, geniusFilteredCards]);

  // Monitor filtered cards changes for debugging
  useEffect(() => {
    console.log('🔍 FILTERED CARDS CHANGED:', {
      filteredCardsCount: filteredCards.length,
      isGeniusFilterActive,
      geniusFilteredCardsCount: geniusFilteredCards.length,
      sampleFilteredCard: filteredCards.length > 0 ? {
        name: filteredCards[0].name,
        seo_card_alias: filteredCards[0].seo_card_alias,
        hasGeniusResult: !!geniusResults[filteredCards[0].seo_card_alias],
        netSavings: geniusResults[filteredCards[0].seo_card_alias]?.net_savings || 0
      } : null
    });
  }, [filteredCards, isGeniusFilterActive, geniusFilteredCards, geniusResults]);

  // Monitor filteredCards changes for debugging
  useEffect(() => {
    console.log('🔍 FILTERED CARDS STATE CHANGED:', {
      filteredCardsCount: filteredCards.length,
      isGeniusFilterActive,
      filteredCardsNames: filteredCards.map(c => c.name),
      geniusFilteredCardsCount: geniusFilteredCards.length
    });
  }, [filteredCards, isGeniusFilterActive, geniusFilteredCards]);

  // Apply filters and search when filters change
  useEffect(() => {
    console.log('🔍 Filters changed, applying filters and search');
    applyFiltersAndSearch();
  }, [filters, searchQuery, isGeniusFilterActive, geniusFilteredCards]);

  // Handle search query clearing when genius filter is active
  useEffect(() => {
    if (isGeniusFilterActive && searchQuery === '' && searchPerformed) {
      console.log('🔍 Search cleared, restoring genius-filtered cards');
      setFilteredCards(geniusFilteredCards);
      setSearchPerformed(false);
    }
  }, [searchQuery, isGeniusFilterActive, geniusFilteredCards, searchPerformed]);

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
      
      // If genius filter is active, search within genius-filtered cards
      if (isGeniusFilterActive) {
        const query = pendingSearchQuery.toLowerCase();
        const searchResults = geniusFilteredCards.filter(card => {
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
          
          return false;
        });
        
        console.log('🔍 Search within genius-filtered cards:', {
          query: pendingSearchQuery,
          totalGeniusCards: geniusFilteredCards.length,
          searchResults: searchResults.length
        });
        
        setFilteredCards(searchResults);
      }
      
      setTimeout(() => {
        scrollToCardsSection();
      }, 100);
    } else {
      // If search query is empty and genius filter is active, restore genius-filtered cards
      if (isGeniusFilterActive) {
        console.log('🔍 Empty search query, restoring genius-filtered cards');
        setFilteredCards(geniusFilteredCards);
        setSearchPerformed(false);
      }
      setSearchQuery('');
    }
  };

  useEffect(() => {
    // Don't apply filters if genius filter is active
    if (!isGeniusFilterActive) {
      applyFiltersAndSearch();
    }
  }, [cards, searchQuery, filters, isGeniusFilterActive]);

  // Restore genius-filtered cards when search query is cleared
  useEffect(() => {
    if (isGeniusFilterActive && !searchQuery.trim() && !searchPerformed) {
      console.log('🔍 Search query cleared, restoring genius-filtered cards');
      setFilteredCards(geniusFilteredCards);
    }
  }, [searchQuery, isGeniusFilterActive, geniusFilteredCards, searchPerformed]);

  // Monitor genius results changes for debugging
  useEffect(() => {
    console.log('🔍 GENIUS RESULTS CHANGED:', {
      isGeniusFilterActive,
      geniusResultsKeys: Object.keys(geniusResults),
      geniusFilteredCardsCount: geniusFilteredCards.length,
      filteredCardsCount: filteredCards.length,
      sampleResult: Object.keys(geniusResults).length > 0 ? {
        alias: Object.keys(geniusResults)[0],
        netSavings: geniusResults[Object.keys(geniusResults)[0]]?.net_savings,
        totalSavingsYearly: geniusResults[Object.keys(geniusResults)[0]]?.total_savings_yearly,
        joiningFees: geniusResults[Object.keys(geniusResults)[0]]?.joining_fees
      } : null
    });
  }, [isGeniusFilterActive, geniusResults, geniusFilteredCards, filteredCards]);

  // Monitor filteredCards state changes for debugging
  useEffect(() => {
    console.log('🔍 FILTERED CARDS CHANGED:', {
      filteredCardsCount: filteredCards.length,
      isGeniusFilterActive,
      geniusFilteredCardsCount: geniusFilteredCards.length,
      sampleFilteredCard: filteredCards.length > 0 ? {
        name: filteredCards[0].name,
        seo_card_alias: filteredCards[0].seo_card_alias,
        hasGeniusResult: !!geniusResults[filteredCards[0].seo_card_alias],
        netSavings: geniusResults[filteredCards[0].seo_card_alias]?.net_savings || 0
      } : null
    });
  }, [filteredCards, isGeniusFilterActive, geniusFilteredCards, geniusResults]);

  const applyFiltersAndSearch = () => {
    console.log('🔍 applyFiltersAndSearch called with isGeniusFilterActive:', isGeniusFilterActive);
    
    // If genius filter is active, apply filters to geniusFilteredCards instead of cards
    const baseCards = isGeniusFilterActive ? geniusFilteredCards : cards;
    let result = [...baseCards];

    console.log('AllCards: Starting filter application with filters:', filters);
    console.log('AllCards: Base cards count:', result.length);
    console.log('AllCards: Using cards from:', isGeniusFilterActive ? 'geniusFilteredCards' : 'cards');

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
    
    // If genius filter is active, we need to maintain the genius sorting (by net savings)
    // but also apply the user's sort preference if it's different from the default
    if (isGeniusFilterActive && filters.sort_by && filters.sort_by !== 'rating-high') {
      console.log('AllCards: Applying user sort preference to genius-filtered cards:', filters.sort_by);
      // The genius cards are already sorted by net savings, but we can apply additional sorting
      // For now, we'll keep the genius sorting as primary and apply user sorting as secondary
    }
    
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
    
    // If genius filter is active, we need to maintain net savings as primary sorting
    // but allow other sorting options as secondary sorting
    if (isGeniusFilterActive && geniusResults && Object.keys(geniusResults).length > 0) {
      // First sort by net savings (descending) as primary sort
      sorted.sort((a, b) => {
        const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
        const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
        return bNetSavings - aNetSavings;
      });
      
      // Then apply secondary sorting based on user preference
      switch (sortType) {
        case 'rating-high':
          return sorted.sort((a, b) => {
            const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
            const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
            if (Math.abs(aNetSavings - bNetSavings) < 100) { // If net savings are close, sort by rating
              return b.rating - a.rating;
            }
            return 0; // Keep net savings order
          });
        case 'rating-low':
          return sorted.sort((a, b) => {
            const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
            const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
            if (Math.abs(aNetSavings - bNetSavings) < 100) {
              return a.rating - b.rating;
            }
            return 0;
          });
        case 'name-asc':
          return sorted.sort((a, b) => {
            const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
            const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
            if (Math.abs(aNetSavings - bNetSavings) < 100) {
              return a.name.localeCompare(b.name);
            }
            return 0;
          });
        case 'name-desc':
          return sorted.sort((a, b) => {
            const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
            const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
            if (Math.abs(aNetSavings - bNetSavings) < 100) {
              return b.name.localeCompare(a.name);
            }
            return 0;
          });
        case 'fee-low':
          return sorted.sort((a, b) => {
            const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
            const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
            if (Math.abs(aNetSavings - bNetSavings) < 100) {
              const aFee = parseInt(String(a.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
              const bFee = parseInt(String(b.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
              return aFee - bFee;
            }
            return 0;
          });
        case 'fee-high':
          return sorted.sort((a, b) => {
            const aNetSavings = geniusResults[a.seo_card_alias]?.net_savings || 0;
            const bNetSavings = geniusResults[b.seo_card_alias]?.net_savings || 0;
            if (Math.abs(aNetSavings - bNetSavings) < 100) {
              const aFee = parseInt(String(a.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
              const bFee = parseInt(String(b.joining_fee).replace(/[^\d.]/g, ''), 10) || 0;
              return bFee - aFee;
            }
            return 0;
          });
        default:
          return sorted; // Keep net savings order
      }
    } else {
      // Normal sorting when genius filter is not active
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
    }
  };

  const handleFiltersChange = (newFilters: CardFilters) => {
    console.log('🔍 handleFiltersChange called with isGeniusFilterActive:', isGeniusFilterActive);
    
    // Update filters
    setFilters(newFilters);
    
    // If genius filter is active, apply the new filters to genius-filtered cards
    if (isGeniusFilterActive) {
      console.log('🔍 Applying new filters to genius-filtered cards');
      // The applyFiltersAndSearch will be called automatically by useEffect
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSearchPerformed(false);
    
    // Also clear genius filter when clearing all filters
    if (isGeniusFilterActive) {
      setIsGeniusFilterActive(false);
      setGeniusFilteredCards([]);
      setGeniusResults({});
      // Explicitly call BankKaro API to get fresh data when clearing genius filter
      console.log('🔄 Recalling BankKaro API after clearing all filters (including genius filter)');
      fetchAllCards();
    }
  };

  const handleClearEligibility = () => {
    setFilters(prev => ({ ...prev, eligibleAliases: undefined }));
    setEligibleAliases(null);
    setEligibleCount(0);
    
    // Also clear genius filter when clearing eligibility
    if (isGeniusFilterActive) {
      setIsGeniusFilterActive(false);
      setGeniusFilteredCards([]);
      setGeniusResults({});
      // Explicitly call BankKaro API to get fresh data when clearing genius filter
      console.log('🔄 Recalling BankKaro API after clearing eligibility (including genius filter)');
      fetchAllCards();
    }
  };

  const handleRefresh = () => {
    // If genius filter is active, clear it before refreshing
    if (isGeniusFilterActive) {
      setIsGeniusFilterActive(false);
      setGeniusFilteredCards([]);
      setGeniusResults({});
    }
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

  const handleSeeDetails = (card?: Card) => {
    if (card) {
      // Individual card clicked - navigate to card detail page
      window.open(`/card/${card.seo_card_alias || card.id}?tab=calculator`, '_blank');
    } else {
      // "See more detail" button clicked - open CardGeniusFilter with results tab
      if (isGeniusFilterActive && geniusFilteredCards.length > 0) {
        console.log('🔍 Opening CardGeniusFilter with existing spending values:', {
          existingSpendingValues: geniusSpendingValues,
          spendingValuesCount: Object.keys(geniusSpendingValues).length
        });
        setShowCardGeniusFilter(true);
        // The CardGeniusFilter will show results tab by default when genius results exist
        // and will have access to existingSpendingValues prop for editing
      }
    }
  };

  const handleIndividualCardDetails = (card: Card) => {
    // Individual card clicked - open compare card with spending as default tab
    setSelectedCardsForCompare([card]);
    setShowComparisonModal(true);
  };
  
  const handleCloseComparison = () => {
    setShowComparisonModal(false);
    // Deselect the card when comparison modal is closed
    setSelectedCardsForCompare([]);
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

  // Handle opening CardGeniusFilter with results tab
  const handleOpenGeniusResults = () => {
    console.log('🔍 Opening CardGeniusFilter with results tab');
    setShowCardGeniusFilter(true);
    // The CardGeniusFilter component will handle showing the results tab
  };



  // Handle Card Genius filter
  const handleApplyGenius = async (filteredCards: Card[], results: Record<string, any>, spendingValues: Record<string, number>) => {
    console.log('🔍 handleApplyGenius called with:', {
      filteredCardsCount: filteredCards.length,
      resultsKeys: Object.keys(results),
      sampleResult: Object.keys(results).length > 0 ? results[Object.keys(results)[0]] : null
    });
    
    // Close the modal immediately
    setShowCardGeniusFilter(false);
    
    try {
      console.log('🔄 STEP 1: Calling BankKaro API to get fresh card data...');
      
      // Step 1: Call BankKaro API to get fresh card data
      const bankKaroCards = await cardService.getCards({});
      console.log('🔄 BankKaro API Response:', {
        totalCards: bankKaroCards.length,
        sampleCards: bankKaroCards.slice(0, 3).map(card => ({
          name: card.name,
          seo_card_alias: card.seo_card_alias,
          id: card.id
        }))
      });
      
      // Step 2: Extract seo_card_alias from Card Genius results (include all cards with net savings data)
      const cardGeniusAliases = Object.keys(results).filter(alias => {
        const result = results[alias];
        return result && result.net_savings !== undefined; // Include all cards with net savings data (positive and negative)
      });
      
      console.log('🔄 Card Genius Aliases with net savings data:', {
        totalAliases: cardGeniusAliases.length,
        aliases: cardGeniusAliases,
        positiveSavings: cardGeniusAliases.filter(alias => results[alias]?.net_savings > 0).length,
        negativeSavings: cardGeniusAliases.filter(alias => results[alias]?.net_savings <= 0).length
      });
      
      // Step 3: Map BankKaro cards to Card Genius results using seo_card_alias
      const mappedCards: Card[] = [];
      const mappedResults: Record<string, any> = {};
      
      for (const bankKaroCard of bankKaroCards) {
        if (bankKaroCard.seo_card_alias && cardGeniusAliases.includes(bankKaroCard.seo_card_alias)) {
          const cardGeniusResult = results[bankKaroCard.seo_card_alias];
          if (cardGeniusResult && cardGeniusResult.net_savings !== undefined) {
            mappedCards.push(bankKaroCard);
            mappedResults[bankKaroCard.seo_card_alias] = cardGeniusResult;
          }
        }
      }
      
                          console.log('🔄 MAPPING RESULTS:', {
                      totalBankKaroCards: bankKaroCards.length,
                      cardGeniusAliasesWithNetSavings: cardGeniusAliases.length,
                      successfullyMappedCards: mappedCards.length,
                      positiveSavingsCards: mappedCards.filter(card => mappedResults[card.seo_card_alias]?.net_savings > 0).length,
                      negativeSavingsCards: mappedCards.filter(card => mappedResults[card.seo_card_alias]?.net_savings <= 0).length,
                      mappedCardsDetails: mappedCards.map(card => ({
                        name: card.name,
                        seo_card_alias: card.seo_card_alias,
                        netSavings: mappedResults[card.seo_card_alias]?.net_savings || 0
                      }))
                    });
      
      // Step 4: Sort mapped cards by net savings (descending)
      const sortedMappedCards = mappedCards.sort((a, b) => {
        const aNetSavings = mappedResults[a.seo_card_alias]?.net_savings || 0;
        const bNetSavings = mappedResults[b.seo_card_alias]?.net_savings || 0;
        return bNetSavings - aNetSavings;
      });
      
                          console.log('🔄 FINAL SORTED CARDS:', {
                      totalCards: sortedMappedCards.length,
                      positiveSavingsCards: sortedMappedCards.filter(card => mappedResults[card.seo_card_alias]?.net_savings > 0).length,
                      negativeSavingsCards: sortedMappedCards.filter(card => mappedResults[card.seo_card_alias]?.net_savings <= 0).length,
                      sortedCardsDetails: sortedMappedCards.map(card => ({
                        name: card.name,
                        seo_card_alias: card.seo_card_alias,
                        netSavings: mappedResults[card.seo_card_alias]?.net_savings || 0
                      }))
                    });
      
      // Step 5: Update state with properly mapped data
      setGeniusFilteredCards(sortedMappedCards);
      setGeniusResults(mappedResults);
      setGeniusSpendingValues(spendingValues);
      setIsGeniusFilterActive(true);
      setFilteredCards(sortedMappedCards);
      
      console.log('✅ GENIUS FILTER APPLIED SUCCESSFULLY:', {
        finalCardCount: sortedMappedCards.length,
        finalResultsCount: Object.keys(mappedResults).length,
        isGeniusFilterActive: true,
        sampleCard: sortedMappedCards.length > 0 ? {
          name: sortedMappedCards[0].name,
          seo_card_alias: sortedMappedCards[0].seo_card_alias,
          netSavings: mappedResults[sortedMappedCards[0].seo_card_alias]?.net_savings || 0
        } : null
      });
      
                          // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'fixed top-4 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300';
                    successMessage.innerHTML = `
                      <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Genius Filter applied! Showing ${sortedMappedCards.length} cards sorted by net savings.</span>
                      </div>
                    `;
    document.body.appendChild(successMessage);
    
    // Add confetti animation
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-[90]';
    confettiContainer.innerHTML = `
      <style>
        @keyframes confetti-fall {
          0% { transform: translateY(-40px) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) scale(0.8) rotate(360deg); opacity: 0; }
        }
      </style>
      ${[...Array(25)].map((_, i) => `
        <span
          style="
            position: absolute;
            left: ${Math.random() * 100}%;
            animation: confetti-fall 1.5s ease-in-out ${Math.random() * 0.5}s;
            background: hsl(${Math.random() * 360}, 80%, 60%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            opacity: 0.8;
          "
        ></span>
      `).join('')}
    `;
    document.body.appendChild(confettiContainer);
    
    // Remove success message and confetti after 3 seconds
    setTimeout(() => {
      successMessage.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(successMessage);
        document.body.removeChild(confettiContainer);
      }, 300);
    }, 3000);
    
    // Scroll to cards section
    setTimeout(() => {
      scrollToCardsSection();
    }, 500);
    
    } catch (error) {
      console.error('❌ Error applying genius filter:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 z-[100] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300';
      errorMessage.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Failed to apply Genius Filter. Please try again.</span>
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      // Remove error message after 5 seconds
      setTimeout(() => {
        errorMessage.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(errorMessage);
        }, 300);
      }, 5000);
      
      // Reset genius filter state on error
      setIsGeniusFilterActive(false);
      setGeniusFilteredCards([]);
      setGeniusResults({});
    }
  };

  const handleClearGeniusFilter = () => {
    console.log('🔍 Clearing genius filter');
    setIsGeniusFilterActive(false);
    setGeniusFilteredCards([]);
    setGeniusResults({});
    setGeniusSpendingValues({});
    setSearchQuery('');
    setSearchPerformed(false);
    // Explicitly call BankKaro API to get fresh data and show all cards without filter
    console.log('🔄 Recalling BankKaro API to show all cards without genius filter');
    fetchAllCards();
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
    
    // Add genius filter count
    if (isGeniusFilterActive) {
      count++;
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
                    
                    {isGeniusFilterActive && (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 animate-pulse">
                          <Brain className="h-3 w-3 mr-1" />
                          {geniusFilteredCards.length} genius filtered
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearGeniusFilter}
                          className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
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

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isGeniusFilterActive ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSeeDetails()}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          See more detail
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearGeniusFilter}
                          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-purple-200"
                          title="Remove Genius Filter"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setShowCardGeniusFilter(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Apply Genius
                      </Button>
                    )}
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
                geniusResults={geniusResults}
                isGeniusFilterActive={isGeniusFilterActive}
                onSeeDetails={handleIndividualCardDetails}
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
      <EnhancedComparisonModal
        isOpen={showComparisonModal}
        onClose={handleCloseComparison}
        selectedCards={selectedCardsForCompare}
        geniusResults={geniusResults}
        isGeniusFilterActive={isGeniusFilterActive}
        defaultTab={selectedCardsForCompare.length === 1 ? 'spending' : 'textual'}
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

      {/* Card Genius Filter Modal */}
      <CardGeniusFilter
        isOpen={showCardGeniusFilter}
        onClose={() => setShowCardGeniusFilter(false)}
        allCards={cards}
        selectedCards={selectedCardsForCompare}
        onApplyGenius={handleApplyGenius}
        showResultsTab={isGeniusFilterActive}
        existingResults={geniusResults}
        existingFilteredCards={geniusFilteredCards}
        onCardClick={handleIndividualCardDetails}
        existingSpendingValues={geniusSpendingValues}
      />


      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default AllCards;
