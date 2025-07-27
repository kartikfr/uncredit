import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, TrendingUp, ArrowRight, ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategorySelector, SPENDING_CATEGORIES } from './CategorySelector';
import { ConsolidatedSpendingInput } from './ConsolidatedSpendingInput';
import { CardRecommendationsTable } from './CardRecommendationsTable';

interface CategoryBasedCardFinderProps {
  onBack?: () => void;
}

type FlowStep = 'categories' | 'spending' | 'results';

export const CategoryBasedCardFinder: React.FC<CategoryBasedCardFinderProps> = ({
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('categories');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [spendingData, setSpendingData] = useState<Record<string, number>>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoriesComplete = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category to continue.');
      return;
    }
    setCurrentStep('spending');
  };

  const handleSpendingComplete = async (data: Record<string, number>) => {
    setSpendingData(data);
    setCurrentStep('results');
    await fetchRecommendations(data);
  };

  const handleBackToCategories = () => {
    setCurrentStep('categories');
    setSelectedCategories([]);
    setSpendingData({});
    setRecommendations([]);
    setError('');
  };

  const handleBackToSpending = () => {
    setCurrentStep('spending');
    setRecommendations([]);
    setError('');
  };

  const fetchRecommendations = async (spendingData: Record<string, number>) => {
    setLoading(true);
    setError('');
    
    try {
      const payload = { ...spendingData, selected_card_id: null };
      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      console.log('Card Genius API response:', data);
      
      let cards = [];
      if (Array.isArray(data.savings)) {
        cards = data.savings;
      }
      
      setRecommendations(cards);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (card: any) => {
    // Navigate to card detail page with calculator tab
    navigate(`/card/${card.card_id || card.id}?tab=calculator`, {
      state: { 
        card: card,
        seo_card_alias: card.seo_card_alias
      }
    });
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const getCategoryInfo = (categoryId: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.id === categoryId);
  };

  const renderCategoriesStep = () => (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
            <Target className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find Best Card by Category
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select your spending categories and we'll find the best credit cards for your needs
        </p>
      </div>

      <CategorySelector
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />

      <div className="flex justify-between items-center">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="px-6">
            ← Back to Calculator Options
          </Button>
        )}
        
        <Button
          onClick={handleCategoriesComplete}
          disabled={selectedCategories.length === 0}
          className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Continue to Spending Input
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderSpendingStep = () => (
    <ConsolidatedSpendingInput
      selectedCategories={selectedCategories}
      onComplete={handleSpendingComplete}
      onBack={handleBackToCategories}
    />
  );

  const renderResultsStep = () => (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {loading ? (
        <Card className="text-center py-12">
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Finding the best cards for you...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800">{error}</p>
            </div>
            <Button onClick={handleBackToSpending} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any cards matching your criteria. Try adjusting your spending categories.
            </p>
            <Button onClick={handleBackToCategories} variant="outline">
              ← Back to Categories
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CardRecommendationsTable
          recommendations={recommendations}
          spendingData={spendingData}
          onBack={handleBackToSpending}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      {currentStep === 'categories' && renderCategoriesStep()}
      {currentStep === 'spending' && renderSpendingStep()}
      {currentStep === 'results' && renderResultsStep()}
    </div>
  );
}; 