import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eclipse as Flip, Brain } from 'lucide-react';
import { Flashcard, ReviewGrade } from '../types';
import { calculateNextReview, isCardDue, getStudyStats, initializeFSRSCard } from '../utils/spaced-repetition';

interface StudySessionProps {
  cards: Flashcard[];
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onExit: () => void;
}

export function StudySession({ cards, onUpdateCard, onExit }: StudySessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [studyPool, setStudyPool] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState(() => getStudyStats(cards));

  // Initialize study pool with due cards
  useEffect(() => {
    // Initialize any cards that don't have FSRS data
    const initializedCards = cards.map(card => {
      if (!card.fsrs) {
        return { ...card, fsrs: initializeFSRSCard() };
      }
      return card;
    });

    const dueCards = initializedCards.filter(isCardDue);
    setStudyPool(dueCards);
    setStats(getStudyStats(initializedCards));
  }, [cards]);
  
  if (studyPool.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-navy">
        <Brain size={48} className="text-accent-purple mb-4" />
        <h2 className="text-2xl font-bold text-gray-100 mb-4">All caught up!</h2>
        <p className="text-gray-300 mb-2">No cards due for review.</p>
        <p className="text-gray-400 mb-6">
          Cards in learning: {stats.learningCount} | 
          Cards in review: {stats.reviewCount}
        </p>
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

  const currentCard = studyPool[currentCardIndex];

  const handleGrade = (grade: ReviewGrade) => {
    const updates = calculateNextReview(currentCard, grade);
    onUpdateCard(currentCard.id, updates);
    
    // If the card is still learning/relearning, add it back to the pool
    if (updates.fsrs?.state !== 'Review') {
      setStudyPool(prev => [...prev.slice(currentCardIndex + 1), { ...currentCard, ...updates }]);
    } else {
      setStudyPool(prev => prev.slice(currentCardIndex + 1));
    }

    setCurrentCardIndex(prev => 
      prev < studyPool.length - 1 ? prev + 1 : 0
    );
    setIsShowingAnswer(false);
    setStats(getStudyStats([...cards, { ...currentCard, ...updates }]));
  };

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Deck</span>
          </button>
          <div className="text-sm text-gray-400">
            Learning: {stats.learningCount} | Review: {stats.reviewCount}
          </div>
        </div>
        
        <div className="bg-navy-light rounded-lg shadow-lg p-8 mb-6 min-h-[300px] border border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Card {currentCardIndex + 1} of {studyPool.length} | 
              State: {currentCard.fsrs?.state || 'New'}
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