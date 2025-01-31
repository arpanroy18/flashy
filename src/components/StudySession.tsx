import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eclipse as Flip } from 'lucide-react';
import { Flashcard, ReviewGrade } from '../types';
import { calculateNextReview, sortByScore, needsReview } from '../services/srs';

interface StudySessionProps {
  cards: Flashcard[];
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onExit: () => void;
}

export function StudySession({ cards, onUpdateCard, onExit }: StudySessionProps) {
  const [studyPool, setStudyPool] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  
  // Initialize study pool with cards that need review, sorted by score
  useEffect(() => {
    const reviewableCards = cards.filter(needsReview);
    setStudyPool(sortByScore(reviewableCards));
  }, [cards]);

  const handleGrade = (grade: ReviewGrade) => {
    if (!currentCard) return;

    // Calculate next review parameters
    const updates = calculateNextReview(currentCard, grade);
    
    // Update card in parent component
    onUpdateCard(currentCard.id, {
      score: updates.score,
      interval: updates.interval,
      easeFactor: updates.easeFactor,
      lastReviewed: updates.lastReviewed,
      nextReview: updates.nextReview,
      retired: updates.retired,
      lastGrade: grade
    });

    let newPool = [...studyPool];
    
    // Remove card from current position
    newPool.splice(currentCardIndex, 1);
    
    // Update the card with new values
    const updatedCard = {
      ...currentCard,
      score: updates.score,
      interval: updates.interval,
      easeFactor: updates.easeFactor,
      lastReviewed: updates.lastReviewed,
      nextReview: updates.nextReview,
      retired: updates.retired,
      lastGrade: grade
    };

    // Handle card based on grade and retirement status
    if (updates.retired) {
      // Card has reached score 100, remove it completely
      newPool = newPool.filter(card => card.id !== currentCard.id);
    } else if (grade === 'again' || grade === 'hard') {
      // Keep card in pool for Again/Hard responses
      const newPosition = Math.min(
        currentCardIndex + 2 + Math.floor(Math.random() * 2),
        newPool.length
      );
      newPool.splice(newPosition, 0, updatedCard);
    } else {
      // Good/Easy responses remove the card from the current session
      // unless it's not yet mastered (score < 100)
      if (updates.score < 100) {
        // Card exits the session but will be available in future sessions
      }
    }

    // If no cards left, exit
    if (newPool.length === 0) {
      onExit();
      return;
    }
    
    // Resort remaining cards by score
    newPool = sortByScore(newPool);
    setStudyPool(newPool);
    setCurrentCardIndex(prev => prev >= newPool.length - 1 ? 0 : prev);
    setIsShowingAnswer(false);
  };

  const currentCard = studyPool[currentCardIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">Study Session Complete!</h2>
          <p className="text-gray-400 mb-6">No more cards to review at this time.</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
          >
            Return to Deck
          </button>
        </div>
      </div>
    );
  }

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
          <div className="text-gray-400">
            Cards remaining: {studyPool.length}
          </div>
        </div>
        
        <div className="bg-navy-light rounded-lg shadow-lg p-8 mb-6 min-h-[300px] border border-gray-700">
          <div className="text-center">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400">
                Card {currentCardIndex + 1} of {studyPool.length}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Score:</span>
                <div className="bg-gray-700 rounded-full h-2 w-24">
                  <div
                    className="bg-green-500 rounded-full h-2"
                    style={{ width: `${currentCard.score || 0}%` }}
                  />
                </div>
                <span className="text-gray-300">{currentCard.score || 0}/100</span>
              </div>
            </div>
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
              title="Score -20, Reset interval to 1 day"
            >
              Again
            </button>
            <button
              onClick={() => handleGrade('hard')}
              className="py-3 px-4 bg-orange-600 hover:bg-orange-700 text-gray-100 rounded-lg transition-colors"
              title="Score +10, Interval ×1.2"
            >
              Hard
            </button>
            <button
              onClick={() => handleGrade('good')}
              className="py-3 px-4 bg-green-600 hover:bg-green-700 text-gray-100 rounded-lg transition-colors"
              title="Score +25, Interval ×EF"
            >
              Good
            </button>
            <button
              onClick={() => handleGrade('easy')}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-lg transition-colors"
              title="Score +40, Interval ×EF ×2"
            >
              Easy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}