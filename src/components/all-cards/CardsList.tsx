
import React from 'react';
import { Card } from '@/services/api';
import CardItem from './CardItem';

interface CardsListProps {
  cards: Card[];
  onAskAI: (card: Card) => void;
  onAddToCompare: (card: Card) => void;
  onRemoveFromCompare: (card: Card) => void;
  selectedCardsForCompare: Card[];
}

const CardsList: React.FC<CardsListProps> = ({
  cards,
  onAskAI,
  onAddToCompare,
  onRemoveFromCompare,
  selectedCardsForCompare
}) => {
  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <div key={card.id} data-card-index={index}>
          <CardItem
            card={card}
            index={index}
            onAskAI={onAskAI}
            onAddToCompare={onAddToCompare}
            onRemoveFromCompare={onRemoveFromCompare}
            isInCompareList={selectedCardsForCompare.some(c => c.id === card.id)}
            canAddToCompare={selectedCardsForCompare.length < 3}
          />
        </div>
      ))}
    </div>
  );
};

export default CardsList;
