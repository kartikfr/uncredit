import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Calculator, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { SPENDING_CATEGORIES, SpendingCategory } from './CategorySelector';

// API Questions mapping based on CardGenius structure
const API_QUESTIONS = [
  { key: "amazon_spends", label: "How much do you spend on Amazon in a month? 🛍️", min: 0, max: 50000, step: 500, category: 'shopping' },
  { key: "flipkart_spends", label: "How much do you spend on Flipkart in a month? 📦", min: 0, max: 50000, step: 500, category: 'shopping' },
  { key: "grocery_spends_online", label: "How much do you spend on groceries (Blinkit,Zepto etc.) every month? 🥦", min: 0, max: 20000, step: 500, category: 'food' },
  { key: "online_food_ordering", label: "How much do you spend on food delivery apps in a month? 🛵🍜", min: 0, max: 15000, step: 250, category: 'food' },
  { key: "other_online_spends", label: "How much do you spend on other online shopping? 💸", min: 0, max: 30000, step: 500, category: 'shopping' },
  { key: "other_offline_spends", label: "How much do you spend at local shops or offline stores monthly? 🏪", min: 0, max: 30000, step: 500, category: 'shopping' },
  { key: "dining_or_going_out", label: "How much do you spend on dining out in a month? 🥗", min: 0, max: 20000, step: 500, category: 'food' },
  { key: "fuel", label: "How much do you spend on fuel in a month? ⛽", min: 0, max: 15000, step: 500, category: 'transport' },
  { key: "school_fees", label: "How much do you pay in school fees monthly?", min: 0, max: 50000, step: 1000, category: 'lifestyle' },
  { key: "rent", label: "How much do you pay for house rent every month?", min: 0, max: 100000, step: 1000, category: 'lifestyle' },
  { key: "mobile_phone_bills", label: "How much do you spend on recharging your mobile or Wi-Fi monthly? 📱", min: 0, max: 5000, step: 100, category: 'utilities' },
  { key: "electricity_bills", label: "What's your average monthly electricity bill? ⚡️", min: 0, max: 10000, step: 200, category: 'utilities' },
  { key: "water_bills", label: "And what about your monthly water bill? 💧", min: 0, max: 5000, step: 100, category: 'utilities' },
  { key: "hotels_annual", label: "How much do you spend on hotel stays in a year? 🛌", min: 0, max: 200000, step: 5000, category: 'travel' },
  { key: "flights_annual", label: "How much do you spend on flights in a year? ✈️", min: 0, max: 300000, step: 5000, category: 'travel' },
  { key: "insurance_health_annual", label: "How much do you pay for health or term insurance annually? 🛡️", min: 0, max: 100000, step: 2000, category: 'lifestyle' },
  { key: "insurance_car_or_bike_annual", label: "How much do you pay for car or bike insurance annually?", min: 0, max: 50000, step: 1000, category: 'transport' },
  { key: "domestic_lounge_usage_quarterly", label: "How often do you visit domestic airport lounges in a year? 🇮🇳", min: 0, max: 50, step: 1, category: 'travel' },
  { key: "international_lounge_usage_quarterly", label: "Plus, what about international airport lounges?", min: 0, max: 20, step: 1, category: 'travel' },
];

interface ConsolidatedSpendingInputProps {
  selectedCategories: string[];
  onComplete: (spendingData: Record<string, number>) => void;
  onBack: () => void;
}

export const ConsolidatedSpendingInput: React.FC<ConsolidatedSpendingInputProps> = ({
  selectedCategories,
  onComplete,
  onBack
}) => {
  const [spendingData, setSpendingData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Filter questions based on selected categories
  const filteredQuestions = API_QUESTIONS.filter(question => 
    selectedCategories.includes(question.category)
  );

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const updateSpending = (key: string, value: number[]) => {
    setSpendingData(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleInputChange = (key: string, value: number) => {
    setSpendingData(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Initialize all spending data with 0 for unselected categories
      const completeSpendingData: Record<string, number> = {};
      API_QUESTIONS.forEach(q => {
        completeSpendingData[q.key] = spendingData[q.key] || 0;
      });
      
      onComplete(completeSpendingData);
    } catch (error) {
      console.error('Error submitting spending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.id === categoryId);
  };

  const getTotalSpending = () => {
    return filteredQuestions.reduce((total, question) => {
      return total + (spendingData[question.key] || 0);
    }, 0);
  };

  if (filteredQuestions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
          <p className="text-gray-600 mb-4">
            Please select at least one spending category to continue.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
            <Calculator className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Input Your Spending Amounts
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Adjust the sliders or enter amounts directly for each category. We'll find the best cards for your spending patterns.
        </p>
      </div>

      {/* Selected Categories Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Selected Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(categoryId => {
              const categoryInfo = getCategoryInfo(categoryId);
              const IconComponent = categoryInfo?.icon || Target;
              return (
                <Badge key={categoryId} variant="secondary" className="flex items-center gap-2">
                  <IconComponent className="h-3 w-3" />
                  {categoryInfo?.name}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spending Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuestions.map((question) => {
          const categoryInfo = getCategoryInfo(question.category);
          const IconComponent = categoryInfo?.icon || Target;
          const currentValue = spendingData[question.key] || 0;
          
          return (
            <Card key={question.key} className="hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary/10 rounded-full mr-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <label className="font-semibold text-gray-800 text-lg">
                    {question.label}
                  </label>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm text-gray-500">
                      {question.key.includes("lounge") ? "times" : question.key.includes('annual') ? 'per year' : 'per month'}
                    </span>
                  </div>
                  
                  <Slider
                    min={question.min}
                    max={Math.max(question.max, currentValue)}
                    step={question.step}
                    value={[currentValue]}
                    onValueChange={(val) => updateSpending(question.key, val)}
                    className="w-full"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">₹</span>
                      <input
                        type="number"
                        min={0}
                        className="border-2 border-gray-200 rounded-lg px-4 py-3 w-32 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        value={currentValue}
                        onChange={(e) => handleInputChange(question.key, Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {currentValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {question.key.includes("lounge") ? "visits" : question.key.includes('annual') ? 'yearly' : 'monthly'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Spending Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Monthly Spending</h3>
                <p className="text-sm text-gray-600">Across all selected categories</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(getTotalSpending())}
              </div>
              <div className="text-sm text-green-600">per month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline" className="px-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Finding Best Cards...
            </>
          ) : (
            <>
              Find Best Cards
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}; 