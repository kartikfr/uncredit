
import React from 'react';
import { Card } from '@/services/api';
import CardItem from './CardItem';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Sparkles, TrendingUp } from 'lucide-react';

interface CardsListProps {
  cards: Card[];
  onAskAI: (card: Card) => void;
  onAddToCompare: (card: Card) => void;
  onRemoveFromCompare: (card: Card) => void;
  selectedCardsForCompare: Card[];
  eligibleAliases?: string[];
}

const CardsList: React.FC<CardsListProps> = ({
  cards,
  onAskAI,
  onAddToCompare,
  onRemoveFromCompare,
  selectedCardsForCompare,
  eligibleAliases
}) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Credit Cards</h3>
              <p className="text-sm text-gray-600">
                {cards.length} card{cards.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Smart Filtering</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div 
              key={card.id} 
              data-card-index={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <CardItem
                card={card}
                index={index}
                onAskAI={onAskAI}
                onAddToCompare={onAddToCompare}
                onRemoveFromCompare={onRemoveFromCompare}
                isInCompareList={selectedCardsForCompare.some(c => c.id === card.id)}
                canAddToCompare={selectedCardsForCompare.length < 3}
                eligibleAliases={eligibleAliases}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Empty State */}
      {cards.length === 0 && (
        <motion.div 
          className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">No cards found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Try adjusting your filters or search terms to discover the perfect credit card for you
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Explore All Cards
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CardsList;
