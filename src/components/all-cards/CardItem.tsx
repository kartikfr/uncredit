
import React from 'react';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle, Plus, X, Eye, CreditCard, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/services/api';

interface CardItemProps {
  card: Card;
  index: number;
  onAskAI: (card: Card) => void;
  onAddToCompare: (card: Card) => void;
  onRemoveFromCompare: (card: Card) => void;
  isInCompareList: boolean;
  canAddToCompare: boolean;
}

const CardItem: React.FC<CardItemProps> = ({ 
  card, 
  index, 
  onAskAI,
  onAddToCompare,
  onRemoveFromCompare,
  isInCompareList,
  canAddToCompare
}) => {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatUserCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getCardTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'rewards': 'bg-blue-100 text-blue-800',
      'cashback': 'bg-green-100 text-green-800',
      'travel': 'bg-purple-100 text-purple-800',
      'shopping': 'bg-orange-100 text-orange-800',
      'fuel': 'bg-red-100 text-red-800',
      'premium': 'bg-yellow-100 text-yellow-800',
      'student': 'bg-pink-100 text-pink-800',
      'business': 'bg-indigo-100 text-indigo-800',
    };
    return typeColors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <UICard 
      className="hover-lift shadow-card animate-slide-up group"
      style={{animationDelay: `${index * 50}ms`}}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Card Info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Card Image */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <CreditCard className={`h-6 w-6 text-white ${card.image ? 'hidden' : ''}`} />
              </div>
              
              {/* Commission Badge */}
              {card.commission && (
                <Badge className="absolute -top-2 -right-2 bg-accent text-white text-xs px-1 py-0">
                  {card.commission}
                </Badge>
              )}

              {/* Compare Button Overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInCompareList) {
                    onRemoveFromCompare(card);
                  } else if (canAddToCompare) {
                    onAddToCompare(card);
                  }
                }}
                disabled={!isInCompareList && !canAddToCompare}
                className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isInCompareList 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : canAddToCompare 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={isInCompareList ? 'Remove from comparison' : canAddToCompare ? 'Add to comparison' : 'Maximum 3 cards can be compared'}
              >
                {isInCompareList ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </button>
            </div>
            
            {/* Card Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
                    {card.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{card.bank_name}</p>
                  
                  {/* Card Type Badge */}
                  <Badge 
                    className={`text-xs ${getCardTypeColor(card.card_type)}`}
                  >
                    {card.card_type}
                  </Badge>
                </div>
                
                {/* Rating Section */}
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent text-accent mr-1" />
                    <span className="text-sm font-medium">{formatRating(card.rating)}</span>
                  </div>
                  {card.user_rating_count > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{formatUserCount(card.user_rating_count)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Network and Features */}
              <div className="flex items-center space-x-3 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {card.card_network}
                </Badge>
                {card.key_features?.[0] && (
                  <Badge className="bg-accent/10 text-accent text-xs">
                    {card.key_features[0]}
                  </Badge>
                )}
                {card.age_criteria && (
                  <Badge variant="outline" className="text-xs">
                    Age: {card.age_criteria}
                  </Badge>
                )}
              </div>

              {/* Fees Information */}
              <div className="flex items-center space-x-6 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Joining Fee: </span>
                  <span className="font-medium text-foreground">
                    {card.joining_fee_text ? card.joining_fee_text : (card.joining_fee ? `₹${card.joining_fee}` : 'Free')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Annual Fee: </span>
                  <span className="font-medium text-foreground">
                    {card.annual_fee_text ? card.annual_fee_text : (card.annual_fee ? `₹${card.annual_fee}` : 'Free')}
                  </span>
                </div>
              </div>

              {/* Key Features Preview */}
              {card.key_features && card.key_features.length > 0 && (
                <div className="space-y-1 mb-2">
                  {card.key_features.slice(0, 2).map((feature, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground flex items-start">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {feature}
                    </p>
                  ))}
                  {card.key_features.length > 2 && (
                    <p className="text-xs text-primary font-medium">
                      +{card.key_features.length - 2} more features
                    </p>
                  )}
                </div>
              )}

              {/* Tags Display */}
              {card.tags && Array.isArray(card.tags) && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.slice(0, 3).map((tag: any, idx) => {
                    const tagText = typeof tag === 'string' ? tag : (tag.name || tag.header || '');
                    return tagText ? (
                      <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                        {tagText}
                      </Badge>
                    ) : null;
                  })}
                  {card.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{card.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end space-y-3 flex-shrink-0 ml-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAskAI(card)}
              className="border-primary text-primary hover:bg-primary/5 group-hover:border-primary/80 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 group-hover:bg-primary/80 transition-colors"
              asChild
            >
              <Link to={`/card/${card.id}`} state={{ card }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </UICard>
  );
};

export default CardItem;
