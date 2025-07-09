import { useState, useMemo, useEffect } from "react";
import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  useEffect(() => {
    console.log('AdvancedFilters filters:', filters);
  }, [filters]);

  // Extract unique card types from all cards
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
    
    // First try to get from card_network field
    cards.forEach(card => {
      if (card.card_network && card.card_network.trim()) {
        allNetworks.add(card.card_network);
      }
    });
    
    // If no networks found, use card_type as network categories
    if (allNetworks.size === 0) {
      cards.forEach(card => {
        if (card.card_type && card.card_type.trim()) {
          allNetworks.add(card.card_type);
        }
      });
    }
    
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

  return (
    <UICard className="shadow-card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            Filters
          </CardTitle>
          {/* Reset Filters Button */}
          <button
            className="ml-2 px-3 py-1 rounded bg-gray-100 text-sm text-muted-foreground hover:bg-gray-200 border border-gray-200"
            onClick={onClearFilters}
            type="button"
          >
            Reset Filters
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Card Tags */}
        <div style={{ border: '1px solid #eee', padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Card Tags</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={filters.selected_tags?.includes(tag) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.selected_tags || [];
                      onFiltersChange({
                        ...filters,
                        selected_tags: checked
                          ? [...current, tag]
                          : current.filter((t) => t !== tag),
                      });
                    }}
                  />
                  <label htmlFor={tag} className="text-sm text-muted-foreground">
                    {tag}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags available</p>
            )}
          </div>
        </div>
        {/* Age Criteria */}
        <div style={{ border: '1px solid #eee', padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Age Criteria</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Age:</span>
              <span className="text-sm font-medium">
                {filters.age_criteria || ageRange.min} years
              </span>
            </div>
            <Slider
              range={true}
              value={[parseInt(filters.age_criteria || ageRange.min.toString())]}
              onChange={(value) => {
                onFiltersChange({ ...filters, age_criteria: value[0].toString() });
              }}
              max={ageRange.max}
              min={ageRange.min}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{ageRange.min} years</span>
              <span>{ageRange.max} years</span>
            </div>
          </div>
        </div>
        {/* Card Network */}
        <div style={{ border: '1px solid #eee', padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Card Network</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableCardNetworks.length > 0 ? (
              availableCardNetworks.map((network) => (
                <div key={network} className="flex items-center space-x-2">
                  <Checkbox
                    id={network}
                    checked={filters.card_networks?.includes(network) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.card_networks || [];
                      onFiltersChange({
                        ...filters,
                        card_networks: checked
                          ? [...current, network]
                          : current.filter((n) => n !== network),
                      });
                    }}
                  />
                  <label htmlFor={network} className="text-sm text-muted-foreground">
                    {network}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>No networks available</p>
                <p className="text-xs mt-1">Network data not found in API response</p>
              </div>
            )}
          </div>
        </div>
        {/* Joining Fee */}
        <div style={{ border: '1px solid #eee', padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Joining Fee</div>
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                  checked={filters.joining_fee_min === 0 && filters.joining_fee_max === 0}
                  onChange={() => onFiltersChange({
                    ...filters,
                    joining_fee_min: 0,
                    joining_fee_max: 0,
                  })}
                />
                <span className="text-sm">Free</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                  checked={filters.joining_fee_min === 1 && filters.joining_fee_max === 500}
                  onChange={() => onFiltersChange({
                    ...filters,
                    joining_fee_min: 1,
                    joining_fee_max: 500,
                  })}
                />
                <span className="text-sm">₹1 - ₹500</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                  checked={filters.joining_fee_min === 501 && filters.joining_fee_max === 1000}
                  onChange={() => onFiltersChange({
                    ...filters,
                    joining_fee_min: 501,
                    joining_fee_max: 1000,
                  })}
                />
                <span className="text-sm">₹501 - ₹1000</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="joining_fee_bracket"
                  checked={filters.joining_fee_min === 1001 && filters.joining_fee_max === 20000}
                  onChange={() => onFiltersChange({
                    ...filters,
                    joining_fee_min: 1001,
                    joining_fee_max: 20000,
                  })}
                />
                <span className="text-sm">Above ₹1000</span>
              </label>
            </div>
          </div>
        </div>
        {/* Annual Fee */}
        <div style={{ border: '1px solid #eee', padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Annual Fee</div>
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                  checked={filters.annual_fee_min === 0 && filters.annual_fee_max === 0}
                  onChange={() => onFiltersChange({
                    ...filters,
                    annual_fee_min: 0,
                    annual_fee_max: 0,
                  })}
                />
                <span className="text-sm">Free</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                  checked={filters.annual_fee_min === 1 && filters.annual_fee_max === 500}
                  onChange={() => onFiltersChange({
                    ...filters,
                    annual_fee_min: 1,
                    annual_fee_max: 500,
                  })}
                />
                <span className="text-sm">₹1 - ₹500</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                  checked={filters.annual_fee_min === 501 && filters.annual_fee_max === 1000}
                  onChange={() => onFiltersChange({
                    ...filters,
                    annual_fee_min: 501,
                    annual_fee_max: 1000,
                  })}
                />
                <span className="text-sm">₹501 - ₹1000</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="annual_fee_bracket"
                  checked={filters.annual_fee_min === 1001 && filters.annual_fee_max === 20000}
                  onChange={() => onFiltersChange({
                    ...filters,
                    annual_fee_min: 1001,
                    annual_fee_max: 20000,
                  })}
                />
                <span className="text-sm">₹1001+</span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </UICard>
  );
}; 