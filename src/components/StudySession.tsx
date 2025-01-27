import React, { useState } from 'react';
import { ArrowLeft, Eclipse as Flip } from 'lucide-react';
import { Flashcard, ReviewGrade } from '../types';
import { calculateNextReview } from '../utils/spaced-repetition';

interface StudySessionProps {
  cards: Flashcard[];
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onExit: () => void;
}

export function StudySession({ cards, onUpdateCard, onExit }: StudySessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const dueCards = cards.filter(card => card.nextReview <= new Date());
  
  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-navy">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">All caught up!</h2>
        <p className="text-gray-300 mb-6">No cards due for review.</p>
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 text-accent-purple hover:text-accent-indigo transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Decks</span>
        </button>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];

  const handleGrade = (grade: ReviewGrade) => {
    const updates = {
      ...calculateNextReview(currentCard, grade),
      lastGrade: grade,
      lastReviewed: new Date()
    };
    onUpdateCard(currentCard.id, updates);
    
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsShowingAnswer(false);
    } else {
      onExit();
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-gray-300 hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Deck</span>
        </button>
        
        <div className="bg-navy-light rounded-lg shadow-lg p-8 mb-6 min-h-[300px] border border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Card {currentCardIndex + 1} of {dueCards.length}
            </p>
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-100 mb-4">{currentCard.front}</h3>
              {isShowingAnswer && (
                <p className="text-gray-300 mt-6 pt-6 border-t border-gray-700">{currentCard.back}</p>
              )}
            </div>
          </div>
        </div>

        {!isShowingAnswer ? (
          <button
            onClick={() => setIsShowingAnswer(true)}
            className="w-full py-3 flex items-center justify-center gap-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
          >
            <Flip size={20} />
            <span>Show Answer</span>
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => handleGrade('again')}
              className="py-3 px-4 bg-red-600 hover:bg-red-700 text-gray-100 rounded-lg transition-colors"
            >
              Again
            </button>
            <button
              onClick={() => handleGrade('hard')}
              className="py-3 px-4 bg-orange-600 hover:bg-orange-700 text-gray-100 rounded-lg transition-colors"
            >
              Hard
            </button>
            <button
              onClick={() => handleGrade('good')}
              className="py-3 px-4 bg-green-600 hover:bg-green-700 text-gray-100 rounded-lg transition-colors"
            >
              Good
            </button>
            <button
              onClick={() => handleGrade('easy')}
              className="py-3 px-4 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
            >
              Easy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}