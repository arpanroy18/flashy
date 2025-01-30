// src/services/srs.ts
const MIN_EASE = 1.3;
const MAX_EASE = 2.5;
const RETIREMENT_INTERVAL = 180; // Days

export const calculateNextReview = (
  card: Flashcard,
  rating: 'again' | 'hard' | 'good' | 'easy'
): Flashcard => {
  const now = new Date();
  let newInterval = card.interval;
  let newEase = card.easeFactor;
  let newConsecutive = card.consecutiveCorrect;

  switch (rating) {
    case 'again':
      newInterval = 1;
      newEase = Math.max(MIN_EASE, card.easeFactor - 0.15);
      newConsecutive = 0;
      break;
      
    case 'hard':
      newInterval = Math.ceil(card.interval * 1.2);
      newConsecutive += 1;
      break;
      
    case 'good':
      newInterval = Math.ceil(card.interval * card.easeFactor);
      newEase = Math.min(MAX_EASE, card.easeFactor + 0.05);
      newConsecutive += 1;
      break;
      
    case 'easy':
      newInterval = Math.ceil(card.interval * card.easeFactor * 1.5);
      newEase = Math.min(MAX_EASE, card.easeFactor + 0.1);
      newConsecutive += 1;
      break;
  }

  // Check retirement criteria
  const retired = newInterval >= RETIREMENT_INTERVAL || newConsecutive >= 5;

  return {
    ...card,
    interval: retired ? card.interval : newInterval,
    easeFactor: newEase,
    consecutiveCorrect: retired ? 0 : newConsecutive,
    lastReviewed: now,
    nextReview: new Date(now.getTime() + newInterval * 86400000),
    retired: card.retired || retired
  };
};