// src/services/srs.ts

const MIN_EASE = 1.3;
const MAX_EASE = 3.0; // Updated to new max
const INITIAL_EASE = 1.7;

interface SRSCardUpdate {
  score: number;
  interval: number;
  easeFactor: number;
  lastReviewed: Date;
  nextReview: Date;
  retired: boolean;
  stayInSession: boolean;
}

export const calculateNextReview = (
  card: Flashcard,
  rating: 'again' | 'hard' | 'good' | 'easy'
): SRSCardUpdate => {
  const now = new Date();
  let newScore = card.score || 0;
  let newInterval = card.interval || 1;
  let newEase = card.easeFactor || INITIAL_EASE;
  let stayInSession = false;

  switch (rating) {
    case 'again':
      newScore = Math.max(0, newScore - 20);
      newInterval = 1; // Reset to 1 day
      newEase = Math.max(MIN_EASE, newEase - 0.15);
      stayInSession = true;
      break;
      
    case 'hard':
      newScore = Math.min(100, newScore + 10);
      newInterval = Math.ceil(newInterval * 1.2);
      newEase = Math.max(MIN_EASE, newEase - 0.05);
      stayInSession = true;
      break;
      
    case 'good':
      newScore = Math.min(100, newScore + 25);
      newInterval = Math.ceil(newInterval * newEase);
      newEase = Math.min(MAX_EASE, newEase + 0.05);
      break;
      
    case 'easy':
      newScore = Math.min(100, newScore + 40);
      newInterval = Math.ceil(newInterval * newEase * 2);
      newEase = Math.min(MAX_EASE, newEase + 0.1);
      break;
  }

  // Card retires at score 100
  const retired = newScore >= 100;

  return {
    score: newScore,
    interval: newInterval,
    easeFactor: newEase,
    lastReviewed: now,
    nextReview: new Date(now.getTime() + newInterval * 86400000), // Convert days to milliseconds
    retired,
    stayInSession: !retired && stayInSession
  };
};

// Helper function to sort cards by score (lowest first)
export const sortByScore = (cards: Flashcard[]): Flashcard[] => {
  return [...cards].sort((a, b) => (a.score || 0) - (b.score || 0));
};

// Helper to check if a card needs review
export const needsReview = (card: Flashcard): boolean => {
  if (card.retired) return false;
  if (!card.nextReview) return true;
  return new Date(card.nextReview) <= new Date();
};