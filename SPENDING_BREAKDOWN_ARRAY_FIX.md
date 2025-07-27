# Spending Breakdown Array Fix

## Issue Identified
The API response structure for card recommendations includes a `spending_breakdown_array` field that contains detailed breakdown information, but the original implementation was only handling the object-based `spending_breakdown` format.

## API Response Structure
Based on the console output, the `spending_breakdown_array` contains objects with the following structure:

```javascript
{
  cashback_percentage: "5",
  explanation: ['<div>On spends of ₹1.68L on <b>Amazon</b> you get 5% Cashback, which is <b>₹8,400</b>.</div>'],
  maxCap: 5000,
  on: "amazon_spends",
  savings: 700,
  spend: 14000,
  totalMaxCap: 5000
}
```

## Changes Made

### 1. Updated TypeScript Interfaces

**Before:**
```typescript
interface SpendingBreakdown {
  on: string;
  spend: number;
  points_earned: number;
  savings: number;
  explanation: string[];
  conv_rate: number;
  maxCap?: number;
}
```

**After:**
```typescript
interface SpendingBreakdown {
  on: string;
  spend: number;
  points_earned?: number;  // Made optional
  savings: number;
  explanation: string[];
  conv_rate?: number;      // Made optional
  cashback_percentage?: string;  // Added for cashback cards
  maxCap?: number;
  totalMaxCap?: number;    // Added
}
```

**Added to CardRecommendation interface:**
```typescript
spending_breakdown_array?: SpendingBreakdown[];  // Added array format support
```

### 2. Updated Data Processing Logic

**Modified `getCategoriesWithSpending` function:**
```typescript
const getCategoriesWithSpending = (card: CardRecommendation): SpendingBreakdown[] => {
  // Use spending_breakdown_array if available, otherwise fall back to spending_breakdown object
  if (card.spending_breakdown_array && Array.isArray(card.spending_breakdown_array)) {
    return card.spending_breakdown_array.filter(breakdown => 
      breakdown.spend > 0 && spendingData[breakdown.on] > 0
    );
  }
  
  // Fallback to object format
  return Object.values(card.spending_breakdown || {}).filter(breakdown => 
    breakdown.spend > 0 && spendingData[breakdown.on] > 0
  );
};
```

### 3. Updated Table Display

**Modified table headers:**
- Changed "Points Earned" to "Rewards" (to accommodate both points and cashback)
- Changed "Conversion Rate" to "Rate" (to accommodate both conversion rates and cashback percentages)

**Updated table cells to handle both formats:**
```typescript
// Rewards column
{breakdown.points_earned ? (
  <span>{formatNumber(breakdown.points_earned)} points</span>
) : breakdown.cashback_percentage ? (
  <span>{breakdown.cashback_percentage}% cashback</span>
) : (
  <span>-</span>
)}

// Rate column
{breakdown.conv_rate ? (
  <span>₹{breakdown.conv_rate}</span>
) : breakdown.cashback_percentage ? (
  <span>{breakdown.cashback_percentage}%</span>
) : (
  <span>-</span>
)}
```

## Benefits of This Fix

1. **Dual Format Support**: Now handles both points-based and cashback-based credit cards
2. **Backward Compatibility**: Still supports the original object-based format as fallback
3. **Better User Experience**: Clear display of rewards type (points vs cashback)
4. **Accurate Data**: Uses the correct API response structure (`spending_breakdown_array`)
5. **Type Safety**: Updated TypeScript interfaces ensure proper type checking

## Testing

The implementation now correctly displays:
- **Points-based cards**: Shows points earned and conversion rate
- **Cashback-based cards**: Shows cashback percentage and percentage rate
- **Mixed cards**: Handles both formats in the same response
- **Fallback support**: Works with older API response formats

## Files Modified

1. `src/components/calculator/CardRecommendationsTable.tsx` - Main component with all the fixes
2. `src/components/calculator/index.ts` - Updated exports

The fix ensures that the `points_earned` field (and other reward-related data) is properly displayed from the `spending_breakdown_array` in the API response, while maintaining support for both points-based and cashback-based credit cards. 