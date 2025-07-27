import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plane, Utensils, Home, Car, Heart, Wifi, Zap } from 'lucide-react';

export interface SpendingCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  questions: string[];
}

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

const SPENDING_CATEGORIES: SpendingCategory[] = [
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'from-blue-500 to-blue-600',
    description: 'Online and offline shopping expenses',
    questions: [
      'Amazon spends',
      'Flipkart spends', 
      'Other online shopping',
      'Offline shopping'
    ]
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    color: 'from-purple-500 to-purple-600',
    description: 'Flights, hotels, and travel expenses',
    questions: [
      'Hotel stays (annual)',
      'Flights (annual)',
      'Domestic lounge usage',
      'International lounge usage'
    ]
  },
  {
    id: 'food',
    name: 'Food & Dining',
    icon: Utensils,
    color: 'from-orange-500 to-orange-600',
    description: 'Dining out and food delivery',
    questions: [
      'Dining out',
      'Online food ordering',
      'Grocery shopping online'
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    description: 'Bills and utility expenses',
    questions: [
      'Electricity bills',
      'Water bills',
      'Mobile phone bills',
      'WiFi bills'
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: Car,
    color: 'from-green-500 to-green-600',
    description: 'Fuel and transportation costs',
    questions: [
      'Fuel expenses',
      'Car/bike insurance'
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
    description: 'Health, education, and lifestyle',
    questions: [
      'Health insurance',
      'School fees',
      'Rent payments'
    ]
  }
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoryToggle
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Spending Categories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the categories that best represent your spending habits. 
          We'll find the best credit cards for your specific needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPENDING_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onCategoryToggle(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${category.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  {isSelected && (
                    <Badge className="bg-blue-600 text-white">
                      Selected
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-lg font-semibold mb-2">
                  {category.name}
                </CardTitle>
                
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Includes:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {category.questions.slice(0, 3).map((question, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {question}
                      </li>
                    ))}
                    {category.questions.length > 3 && (
                      <li className="text-blue-600 font-medium">
                        +{category.questions.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="text-center mt-6">
          <Badge variant="secondary" className="text-sm">
            {selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
          </Badge>
        </div>
      )}
    </div>
  );
};

export { SPENDING_CATEGORIES }; 