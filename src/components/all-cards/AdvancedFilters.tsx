import { useState, useMemo, useEffect } from "react";
import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter, X, ChevronDown, ChevronUp, Tag, CreditCard, DollarSign, Calendar, Users, Award, Shield, Zap, BarChart3 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import { CardFilters, Card } from "@/services/api";

interface AdvancedFiltersProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  onClearFilters: () => void;
  cards?: Card[];
}

export const AdvancedFilters = ({ filters, onFiltersChange, onClearFilters, cards = [] }: AdvancedFiltersProps) => {
  // Changed to single expanded section for accordion behavior
  const [expandedSection, setExpandedSection] = useState<string>('sort');

  useEffect(() => {
    console.log('AdvancedFilters filters:', filters);
  }, [filters]);

  // Debug logging for filter changes
  const handleFilterChange = (newFilters: CardFilters) => {
    console.log('AdvancedFilters: Filter change triggered:', newFilters);
    onFiltersChange(newFilters);
  };

  // Extract unique card types from all cards (for Card Network filter)
  const availableCardTypes = useMemo(() => {
    const allCardTypes = new Set<string>();
    cards.forEach(card => {
      if (card.card_type) {
        allCardTypes.add(card.card_type);
      }
    });
    return Array.from(allCardTypes).sort();
  }, [cards]);

  // Extract unique card networks from all cards (using card_type as network categories)
  const availableCardNetworks = useMemo(() => {
    const allNetworks = new Set<string>();
    
    // Use card_type field for network filtering (as per user request)
      cards.forEach(card => {
        if (card.card_type && card.card_type.trim()) {
          allNetworks.add(card.card_type);
        }
      });
    
    return Array.from(allNetworks).sort();
  }, [cards]);

  // Extract unique tags from all cards
  const availableTags = useMemo(() => {
    const allTags = new Set<string>();
    cards.forEach(card => {
      if (Array.isArray(card.tags)) {
        card.tags.forEach((tag: any) => {
          if (typeof tag === 'string') {
            allTags.add(tag);
          } else if (tag && typeof tag === 'object' && tag.name) {
            allTags.add(tag.name);
          } else if (tag && typeof tag === 'object' && tag.header) {
            allTags.add(tag.header);
          }
        });
      }
    });
    return Array.from(allTags).sort();
  }, [cards]);

  // Extract numeric joining fees from all cards
  const joiningFeeNumbers = useMemo(() => {
    const nums: number[] = [];
    cards.forEach(card => {
      let fee = card.joining_fee;
      if (typeof fee === 'string') {
        // Remove currency symbols, commas, and whitespace
        fee = fee.replace(/[^\d.]/g, '');
      }
      const num = parseInt(fee, 10);
      // Ignore non-numeric, zero, or 'Free' values
      if (!isNaN(num) && num >= 0) {
        nums.push(num);
      }
    });
    return nums.length > 0 ? nums : [];
  }, [cards]);

  // Set min/max for slider: always allow 0 to 20000
  const minJoiningFee = 0;
  const maxJoiningFee = 20000;

  // Controlled state for slider (from filters)
  const joiningFeeRange = [
    filters.joining_fee_min !== undefined ? Number(filters.joining_fee_min) : minJoiningFee,
    filters.joining_fee_max !== undefined ? Number(filters.joining_fee_max) : maxJoiningFee
  ];

  // Extract age range from age_criteria field
  const ageRange = useMemo(() => {
    const allAges: number[] = [];
    
    cards.forEach(card => {
      if (card.age_criteria) {
        // Parse age_criteria like "21-60" or "18+" or "25-65 years"
        const ageMatch = card.age_criteria.match(/(\d+)(?:\s*-\s*(\d+))?/);
        if (ageMatch) {
          const minAge = parseInt(ageMatch[1], 10);
          const maxAge = ageMatch[2] ? parseInt(ageMatch[2], 10) : minAge + 50; // Default range if no max
          
          if (!isNaN(minAge)) allAges.push(minAge);
          if (!isNaN(maxAge)) allAges.push(maxAge);
        }
      }
      // Fallback to eligibility fields if age_criteria is not available
      if (card.eligibility?.age_min) allAges.push(card.eligibility.age_min);
      if (card.eligibility?.age_max) allAges.push(card.eligibility.age_max);
    });
    
    if (allAges.length === 0) return { min: 18, max: 70 };
    
    return {
      min: Math.min(...allAges),
      max: Math.max(...allAges)
    };
  }, [cards]);

  // Extract unique annual_fee values from all cards
  const annualFeeOptions = useMemo(() => Array.from(new Set(cards.map(c => c.annual_fee_text || c.annual_fee).filter(Boolean))), [cards]);

  // Extract numeric annual fees from all cards
  const annualFeeNumbers = useMemo(() => {
    const nums: number[] = [];
    cards.forEach(card => {
      let fee = card.annual_fee_text || card.annual_fee;
      if (typeof fee === 'string') {
        fee = fee.replace(/[^\d.]/g, '');
      }
      const num = parseInt(fee, 10);
      if (!isNaN(num) && num >= 0) {
        nums.push(num);
      }
    });
    return nums.length > 0 ? nums : [];
  }, [cards]);

  const minAnnualFee = annualFeeNumbers.length > 0 ? Math.min(...annualFeeNumbers) : 0;
  const maxAnnualFee = annualFeeNumbers.length > 0 ? Math.max(...annualFeeNumbers) : 10000;

  const annualFeeRange = [
    filters.annual_fee_min !== undefined ? Number(filters.annual_fee_min) : minAnnualFee,
    filters.annual_fee_max !== undefined ? Number(filters.annual_fee_max) : maxAnnualFee
  ];

  // Extract unique spending categories from all cards' exclusion_spends
  const availableSpendingCategories = useMemo(() => {
    const allCategories = new Set<string>();
    cards.forEach(card => {
      if (card.exclusion_spends) {
        // Handle different delimiters: comma, newline, bullet points, etc.
        const categories = card.exclusion_spends
          .split(/[,\n\r•\u2022]/) // Split by comma, newline, bullet points
          .map(cat => cat.trim())
          .filter(cat => cat.length > 0); // Remove empty strings
        
        categories.forEach((cat: string) => {
          // Clean up the category name
          const cleaned = cat
            .replace(/^\s*[-•\u2022]\s*/, '') // Remove leading bullets/dashes
            .replace(/\s+/, ' ') // Normalize whitespace
            .trim();
          
          if (cleaned && cleaned.length > 0) {
            allCategories.add(cleaned);
          }
        });
      }
    });
    return Array.from(allCategories).sort();
  }, [cards]);

  // Accordion behavior: only one section can be expanded at a time
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <UICard className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-4">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Filter className="h-5 w-5 mr-2" />
              Smart Filters
          </CardTitle>
            <div className="flex items-center space-x-2">
              {getActiveFiltersCount() > 0 && (
                <Badge className="bg-white/20 text-white border-white/30">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
            onClick={onClearFilters}
                className="text-white hover:bg-white/20 h-8 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
        </div>
      </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Sort By Section - MOVED TO TOP */}
              <motion.div 
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('sort')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Sort By</h3>
                  </div>
                  {expandedSection === 'sort' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                
                <AnimatePresence>
                  {expandedSection === 'sort' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3"
                    >
                      <Select
                        value={filters.sort_by || "rating-high"}
                        onValueChange={(value) => handleFilterChange({ ...filters, sort_by: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                          <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                          <SelectItem value="name-asc">Name: A to Z</SelectItem>
                          <SelectItem value="name-desc">Name: Z to A</SelectItem>
                          <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                          <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Card Tags Section */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('tags')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Card Tags</h3>
                  </div>
                  {expandedSection === 'tags' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                
                <AnimatePresence>
                  {expandedSection === 'tags' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3 max-h-48 overflow-y-auto"
                    >
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                          <motion.div 
                            key={tag} 
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                  <Checkbox
                    id={tag}
                    checked={filters.selected_tags?.includes(tag) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.selected_tags || [];
                                handleFilterChange({
                        ...filters,
                        selected_tags: checked
                          ? [...current, tag]
                          : current.filter((t) => t !== tag),
                      });
                    }}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                            <label htmlFor={tag} className="text-sm text-gray-700 font-medium cursor-pointer flex-1">
                    {tag}
                  </label>
                          </motion.div>
              ))
            ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No tags available</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Age Criteria Section */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('age')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Age Criteria</h3>
                  </div>
                  {expandedSection === 'age' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
                
                <AnimatePresence>
                  {expandedSection === 'age' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-4"
                    >
            <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Your Age:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {filters.age_min || ageRange.min} years
              </span>
            </div>
            <Slider
              range={true}
                        value={[filters.age_min || ageRange.min]}
              onChange={(value) => {
                          handleFilterChange({ 
                            ...filters, 
                            age_min: value[0],
                            age_max: value[0] // Set both min and max to the same value for single age selection
                          });
              }}
              max={ageRange.max}
              min={ageRange.min}
              step={1}
              className="w-full"
            />
                      <div className="flex justify-between text-xs text-gray-500">
              <span>{ageRange.min} years</span>
              <span>{ageRange.max} years</span>
            </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Card Network Section - FIXED: Now uses card_type field */}
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('network')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Card Network</h3>
          </div>
                  {expandedSection === 'network' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
        </div>
                
                <AnimatePresence>
                  {expandedSection === 'network' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3 max-h-48 overflow-y-auto"
                    >
            {availableCardNetworks.length > 0 ? (
              availableCardNetworks.map((network) => (
                          <motion.div 
                            key={network} 
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                  <Checkbox
                    id={network}
                    checked={filters.card_networks?.includes(network) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.card_networks || [];
                                handleFilterChange({
                        ...filters,
                        card_networks: checked
                          ? [...current, network]
                          : current.filter((n) => n !== network),
                      });
                    }}
                              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                            <label htmlFor={network} className="text-sm text-gray-700 font-medium cursor-pointer flex-1">
                    {network}
                  </label>
                          </motion.div>
              ))
            ) : (
                        <div className="text-sm text-gray-500 text-center py-4">
                <p>No networks available</p>
                <p className="text-xs mt-1">Network data not found in API response</p>
              </div>
            )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Joining Fee Section */}
              <motion.div 
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('joining_fee')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Joining Fee</h3>
          </div>
                  {expandedSection === 'joining_fee' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
        </div>
                
                <AnimatePresence>
                  {expandedSection === 'joining_fee' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3"
                    >
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                            checked={filters.joining_fee_free === true}
                            onChange={() => handleFilterChange({
                    ...filters,
                              joining_fee_free: true,
                              joining_fee_min: undefined,
                              joining_fee_max: undefined,
                  })}
                            className="text-orange-600 focus:ring-orange-500"
                />
                          <span className="text-sm font-medium text-gray-700">Free</span>
              </label>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                            checked={filters.joining_fee_min === 1 && filters.joining_fee_max === 500 && !filters.joining_fee_free}
                            onChange={() => handleFilterChange({
                    ...filters,
                              joining_fee_free: undefined,
                    joining_fee_min: 1,
                    joining_fee_max: 500,
                  })}
                            className="text-orange-600 focus:ring-orange-500"
                />
                          <span className="text-sm font-medium text-gray-700">₹1 - ₹500</span>
              </label>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                            checked={filters.joining_fee_min === 501 && filters.joining_fee_max === 1000 && !filters.joining_fee_free}
                            onChange={() => handleFilterChange({
                    ...filters,
                              joining_fee_free: undefined,
                    joining_fee_min: 501,
                    joining_fee_max: 1000,
                  })}
                            className="text-orange-600 focus:ring-orange-500"
                />
                          <span className="text-sm font-medium text-gray-700">₹501 - ₹1000</span>
              </label>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                            checked={filters.joining_fee_min === 1001 && filters.joining_fee_max === 20000 && !filters.joining_fee_free}
                            onChange={() => handleFilterChange({
                    ...filters,
                              joining_fee_free: undefined,
                    joining_fee_min: 1001,
                    joining_fee_max: 20000,
                  })}
                            className="text-orange-600 focus:ring-orange-500"
                />
                          <span className="text-sm font-medium text-gray-700">Above ₹1000</span>
              </label>
            </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Annual Fee Section */}
              <motion.div 
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('annual_fee')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Annual Fee</h3>
          </div>
                  {expandedSection === 'annual_fee' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
        </div>
                
                <AnimatePresence>
                  {expandedSection === 'annual_fee' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3"
                    >
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                            checked={filters.annual_fee_free === true}
                            onChange={() => handleFilterChange({
                    ...filters,
                              annual_fee_free: true,
                              annual_fee_min: undefined,
                              annual_fee_max: undefined,
                  })}
                            className="text-indigo-600 focus:ring-indigo-500"
                />
                          <span className="text-sm font-medium text-gray-700">Free</span>
              </label>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                            checked={filters.annual_fee_min === 1 && filters.annual_fee_max === 500 && !filters.annual_fee_free}
                            onChange={() => handleFilterChange({
                    ...filters,
                              annual_fee_free: undefined,
                    annual_fee_min: 1,
                    annual_fee_max: 500,
                  })}
                            className="text-indigo-600 focus:ring-indigo-500"
                />
                          <span className="text-sm font-medium text-gray-700">₹1 - ₹500</span>
              </label>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                            checked={filters.annual_fee_min === 501 && filters.annual_fee_max === 1000 && !filters.annual_fee_free}
                            onChange={() => handleFilterChange({
                    ...filters,
                              annual_fee_free: undefined,
                    annual_fee_min: 501,
                    annual_fee_max: 1000,
                  })}
                            className="text-indigo-600 focus:ring-indigo-500"
                />
                          <span className="text-sm font-medium text-gray-700">₹501 - ₹1000</span>
              </label>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                            checked={filters.annual_fee_min === 1001 && filters.annual_fee_max === 20000 && !filters.annual_fee_free}
                            onChange={() => handleFilterChange({
                    ...filters,
                              annual_fee_free: undefined,
                    annual_fee_min: 1001,
                    annual_fee_max: 20000,
                  })}
                            className="text-indigo-600 focus:ring-indigo-500"
                />
                          <span className="text-sm font-medium text-gray-700">Above ₹1000</span>
              </label>
            </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Rating Section */}
              <motion.div 
                className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('rating')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
          </div>
                    <h3 className="font-semibold text-gray-800">Rating</h3>
        </div>
                  {expandedSection === 'rating' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
                
                <AnimatePresence>
                  {expandedSection === 'rating' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3"
                    >
                      <Select
                        value={filters.rating?.toString() || ""}
                        onValueChange={(value) => handleFilterChange({ ...filters, rating: parseInt(value) })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select minimum rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="2">2+ Stars</SelectItem>
                          <SelectItem value="1">1+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Spending Categories Section */}
              <motion.div 
                className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('spending_categories')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Spending Categories</h3>
                      <p className="text-xs text-gray-500">Filter out cards that exclude these categories</p>
              </div>
            </div>
                  {expandedSection === 'spending_categories' ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                
                <AnimatePresence>
                  {expandedSection === 'spending_categories' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-3"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs text-blue-700">
                          💡 <strong>How it works:</strong> Select spending categories you want rewards on. 
                          Cards that exclude these categories from rewards will be filtered out.
                        </p>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
              {availableSpendingCategories.length > 0 ? (
                          availableSpendingCategories.map((category) => (
                            <motion.div 
                              key={category} 
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                        <Checkbox
                                id={category}
                                checked={filters.spending_categories?.includes(category) || false}
                          onCheckedChange={(checked) => {
                            const current = filters.spending_categories || [];
                                  handleFilterChange({
                              ...filters,
                              spending_categories: checked
                                      ? [...current, category]
                                      : current.filter((c) => c !== category),
                            });
                          }}
                                className="data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                              />
                              <label htmlFor={category} className="text-sm text-gray-700 font-medium cursor-pointer flex-1">
                                {category}
                        </label>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No spending categories available</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </ScrollArea>
      </CardContent>
    </UICard>
    </motion.div>
  );
}; 