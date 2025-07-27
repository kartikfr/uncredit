import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator as CalculatorIcon, Target, ArrowRight, ArrowLeft, Coins, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
import { CardSavingsCalculator } from '@/components/calculator/CardSavingsCalculator';
import { CategoryBasedCardFinder } from '@/components/calculator/CategoryBasedCardFinder';
import ScrollToTop from "@/components/ui/ScrollToTop";

type CalculatorMode = 'selection' | 'card-savings' | 'category-finder';

const Calculator = () => {
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('selection');

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleModeSelect = (mode: 'card-savings' | 'category-finder') => {
    setCurrentMode(mode);
  };

  const handleBackToSelection = () => {
    setCurrentMode('selection');
  };

  const calculatorOptions = [
    {
      id: 'card-savings',
      title: 'Calculate Savings on Card',
      description: 'Choose a specific credit card and calculate your potential rewards and savings',
      icon: CalculatorIcon,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700',
      features: [
        'Select from available credit cards',
        'Calculate rewards for specific card',
        'View detailed savings breakdown',
        'Compare with other cards'
      ]
    },
    {
      id: 'category-finder',
      title: 'Find Best Card by Category',
      description: 'Select your spending categories and discover the best credit cards for your needs',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700',
      features: [
        'Choose spending categories',
        'Input your spending amounts',
        'Get personalized recommendations',
        'Find cards optimized for your lifestyle'
      ]
    }
  ];

  const renderSelectionMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <CalculatorIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reward Calculator</h1>
                <p className="text-sm text-muted-foreground">Calculate Your Credit Card Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <CalculatorIcon className="h-12 w-12 md:h-16 md:w-16 mr-2 md:mr-4 animate-calculator-float" />
              <Coins className="h-12 w-12 md:h-16 md:w-16 animate-reward-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
              Choose Your Calculator! 💰
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed px-4">
              Select how you'd like to calculate your credit card rewards and savings
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Calculator Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
            {calculatorOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Card
                  key={option.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-300"
                  onClick={() => handleModeSelect(option.id as 'card-savings' | 'category-finder')}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r ${option.color} group-hover:${option.hoverColor} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300`}>
                        <IconComponent className="h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {option.description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">What you'll get:</h4>
                      <ul className="space-y-2">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className={`w-full bg-gradient-to-r ${option.color} hover:${option.hoverColor} text-white font-semibold py-3 transition-all duration-300 group-hover:scale-105`}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-blue-200 hover-lift">
              <div className="flex items-center mb-3">
                <Coins className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-900">Reward Calculation</h4>
              </div>
              <p className="text-sm text-blue-700">Calculate potential rewards based on your spending patterns</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-purple-200 hover-lift">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-semibold text-purple-900">Smart Recommendations</h4>
              </div>
              <p className="text-sm text-purple-700">Get personalized card recommendations based on your lifestyle</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-blue-200 sm:col-span-2 md:col-span-1 hover-lift">
              <div className="flex items-center mb-3">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-900">Detailed Analysis</h4>
              </div>
              <p className="text-sm text-blue-700">Get comprehensive breakdown of savings and benefits</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8 md:mt-12">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-center mb-6">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Choose Your Method</h4>
                    <p className="text-sm text-gray-600">Select between card-specific or category-based calculation</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Input Your Data</h4>
                    <p className="text-sm text-gray-600">Provide spending information or select specific cards</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Get Results</h4>
                    <p className="text-sm text-gray-600">View detailed savings analysis and recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardSavingsMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <CardSavingsCalculator onBack={handleBackToSelection} />
    </div>
  );

  const renderCategoryFinderMode = () => (
    <CategoryBasedCardFinder onBack={handleBackToSelection} />
  );

  return (
    <>
      {currentMode === 'selection' && renderSelectionMode()}
      {currentMode === 'card-savings' && renderCardSavingsMode()}
      {currentMode === 'category-finder' && renderCategoryFinderMode()}
      <ScrollToTop />
    </>
  );
};

export default Calculator;