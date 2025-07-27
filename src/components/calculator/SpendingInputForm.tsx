import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Calculator, Target, TrendingUp } from 'lucide-react';
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

interface SpendingInputFormProps {
  selectedCategories: string[];
  onComplete: (spendingData: Record<string, number>) => void;
  onBack: () => void;
}

export const SpendingInputForm: React.FC<SpendingInputFormProps> = ({
  selectedCategories,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spendingData, setSpendingData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Filter questions based on selected categories
  const filteredQuestions = API_QUESTIONS.filter(question => 
    selectedCategories.includes(question.category)
  );

  const progress = ((currentStep + 1) / filteredQuestions.length) * 100;
  const currentQuestion = filteredQuestions[currentStep];

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

  const nextStep = () => {
    if (currentStep < filteredQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Spending Input - Step {currentStep + 1} of {filteredQuestions.length}
                </h2>
                <p className="text-sm text-gray-600">
                  Tell us about your spending habits
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {(() => {
                const categoryInfo = getCategoryInfo(currentQuestion.category);
                const IconComponent = categoryInfo?.icon || Target;
                return (
                  <div className={`p-4 rounded-full bg-gradient-to-r ${categoryInfo?.color || 'from-gray-500 to-gray-600'}`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                );
              })()}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.label}
            </h3>
            
            <div className="text-4xl font-bold text-blue-600 mb-6">
              {formatCurrency(spendingData[currentQuestion.key] || 0)}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <Slider
              value={[spendingData[currentQuestion.key] || 0]}
              onValueChange={(value) => updateSpending(currentQuestion.key, value)}
              max={currentQuestion.max}
              min={currentQuestion.min}
              step={currentQuestion.step}
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatCurrency(currentQuestion.min)}</span>
              <span>{formatCurrency(currentQuestion.max)}</span>
            </div>
          </div>

          {/* Category Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {getCategoryInfo(currentQuestion.category)?.name} Category
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {getCategoryInfo(currentQuestion.category)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
          className="px-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            className="px-6"
          >
            Back to Categories
          </Button>
          
          <Button
            onClick={nextStep}
            disabled={loading}
            className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentStep === filteredQuestions.length - 1 ? (
              <>
                {loading ? 'Processing...' : 'Find Best Cards'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 