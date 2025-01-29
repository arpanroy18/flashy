import { FSRS, Rating, Card as FSRSCard } from 'ts-fsrs';
import { Flashcard, ReviewGrade } from '../types';

// Initialize FSRS with default parameters
const scheduler = new FSRS();

// Convert ReviewGrade to FSRS Rating
const gradeToRating: Record<ReviewGrade, Rating> = {
  'again': Rating.Again,
  'hard': Rating.Hard,
  'good': Rating.Good,
  'easy': Rating.Easy,
};

// Initialize a new FSRS card
export function initializeFSRSCard(): FSRSCard {
  return {
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 'New',
    last_review: new Date(),
  };
}

export function calculateNextReview(card: Flashcard, grade: ReviewGrade): Partial<Flashcard> {
  const now = new Date();
  const rating = gradeToRating[grade];
  
  // If the card doesn't have FSRS data, initialize it
  const currentFSRS = card.fsrs || initializeFSRSCard();

  try {
    // Get the next state from FSRS
    const [result] = scheduler.repeat(currentFSRS, now, rating);
    const nextState = result.card;

    // Update the card with new FSRS data
    return {
      fsrs: nextState,
      nextReview: nextState.due,
      interval: Math.ceil((nextState.due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      easeFactor: nextState.stability,
      repetitions: nextState.reps,
      lastReviewed: now,
      lastGrade: grade,
    };
  } catch (error) {
    console.error('Error calculating next review:', error);
    
    // Fallback to a simple spaced repetition if FSRS fails
    const fallbackInterval = grade === 'again' ? 1 :
                           grade === 'hard' ? 3 :
                           grade === 'good' ? 7 :
                           14; // easy
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + fallbackInterval);
    
    return {
      fsrs: {
        ...currentFSRS,
        due: nextReview,
        reps: currentFSRS.reps + 1,
        state: grade === 'again' ? 'Learning' : 'Review',
        last_review: now,
      },
      nextReview,
      interval: fallbackInterval,
      easeFactor: currentFSRS.stability,
      repetitions: currentFSRS.reps + 1,
      lastReviewed: now,
      lastGrade: grade,
    };
  }
}

export function isCardDue(card: Flashcard): boolean {
  // If card doesn't have FSRS data, it's considered due (new card)
  if (!card.fsrs) {
    return true;
  }

  const now = new Date();
  return card.fsrs.due <= now || card.fsrs.state === 'New' || card.fsrs.state === 'Learning';
}

export function getStudyStats(cards: Flashcard[]) {
  // Initialize any cards that don't have FSRS data
  const initializedCards = cards.map(card => {
    if (!card.fsrs) {
      return { ...card, fsrs: initializeFSRSCard() };
    }
    return card;
  });

  const dueCards = initializedCards.filter(card => isCardDue(card));
  const learningCards = initializedCards.filter(card => 
    card.fsrs.state === 'Learning' || card.fsrs.state === 'Relearning'
  );
  const reviewCards = initializedCards.filter(card => card.fsrs.state === 'Review');

  return {
    dueCount: dueCards.length,
    learningCount: learningCards.length,
    reviewCount: reviewCards.length,
    totalCards: initializedCards.length,
  };
}