import { FSRS, Rating, Card as FSRSCard } from 'ts-fsrs';
import { Flashcard, ReviewGrade } from '../types';

// Constants for the FSRS algorithm
const FORGETTING_CURVE_DECAY = 0.9; // Retention target (90%)
const MIN_STABILITY = 0.1;
const MAX_STABILITY = 365 * 2; // 2 years
const DIFFICULTY_RANGE = { min: 1, max: 10 };

// Initialize FSRS with optimized parameters
const fsrs = new FSRS({
  request_retention: FORGETTING_CURVE_DECAY,
  maximum_interval: MAX_STABILITY,
  w: [1.0, 1.0, 5.0, -0.5, -0.5, 0.2, 1.4, -0.12, 0.8, 2.0, -0.2, 0.2, 1.0],
  enable_fuzz: true
});

// Convert our ReviewGrade to FSRS Rating
const gradeToRating: Record<ReviewGrade, Rating> = {
  'again': Rating.Again,
  'hard': Rating.Hard,
  'good': Rating.Good,
  'easy': Rating.Easy
};

// Calculate retrievability based on time elapsed and stability
function calculateRetrievability(elapsedDays: number, stability: number): number {
  return Math.exp(-elapsedDays / stability);
}

// Update difficulty based on user response
function updateDifficulty(currentDifficulty: number, grade: ReviewGrade): number {
  const difficultyModifiers = {
    'again': 1.2,  // Increase difficulty significantly
    'hard': 1.1,   // Increase difficulty slightly
    'good': 1.0,   // Keep difficulty the same
    'easy': 0.9    // Decrease difficulty
  };

  const newDifficulty = currentDifficulty * difficultyModifiers[grade];
  return Math.min(Math.max(newDifficulty, DIFFICULTY_RANGE.min), DIFFICULTY_RANGE.max);
}

// Calculate optimal interval based on stability and retrievability target
function calculateOptimalInterval(stability: number): number {
  return Math.ceil(stability * -Math.log(FORGETTING_CURVE_DECAY));
}

export function calculateNextReview(card: Flashcard, grade: ReviewGrade): Partial<Flashcard> {
  const now = new Date();
  const rating = gradeToRating[grade];
  
  try {
    // Calculate elapsed time since last review
    const elapsedDays = card.lastReviewed
      ? (now.getTime() - card.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    // Create FSRS card state with current memory parameters
    const fsrsCard: FSRSCard = {
      due: card.nextReview || now,
      stability: card.easeFactor || MIN_STABILITY,
      difficulty: card.difficulty || DIFFICULTY_RANGE.min,
      elapsed_days: elapsedDays,
      scheduled_days: card.interval || 0,
      reps: card.repetitions || 0,
      lapses: card.lapses || 0,
      state: card.state || 0,
      last_review: card.lastReviewed || now
    };

    // Get scheduling info from FSRS
    const [scheduling] = fsrs.repeat(fsrsCard, now, rating);
    
    // Calculate retrievability at the time of review
    const retrievability = calculateRetrievability(elapsedDays, fsrsCard.stability);
    
    // Update difficulty based on performance
    const newDifficulty = updateDifficulty(fsrsCard.difficulty, grade);
    
    // Calculate optimal interval based on new stability
    const optimalInterval = calculateOptimalInterval(scheduling.stability);
    
    // Apply interval modifier based on difficulty
    const difficultyModifier = Math.pow(0.972, newDifficulty - DIFFICULTY_RANGE.min);
    const finalInterval = Math.ceil(optimalInterval * difficultyModifier);
    
    // Calculate next review date
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + finalInterval);
    
    return {
      fsrs: {
        ...scheduling,
        difficulty: newDifficulty
      },
      nextReview,
      interval: finalInterval,
      easeFactor: scheduling.stability,
      difficulty: newDifficulty,
      retrievability,
      repetitions: scheduling.reps,
      lapses: scheduling.lapses,
      state: scheduling.state,
      lastReviewed: now,
      lastGrade: grade
    };
  } catch (error) {
    console.error('FSRS calculation error:', error);
    
    // Enhanced fallback scheduling with exponential backoff
    const baseInterval = grade === 'again' ? 1 :
                        grade === 'hard' ? 3 :
                        grade === 'good' ? 7 :
                        14; // easy
    
    const repetitionModifier = Math.pow(1.5, (card.repetitions || 0));
    const fallbackInterval = Math.min(
      Math.ceil(baseInterval * repetitionModifier),
      MAX_STABILITY
    );
    
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + fallbackInterval);
    
    return {
      nextReview,
      interval: fallbackInterval,
      easeFactor: card.easeFactor || 2.5,
      difficulty: card.difficulty || DIFFICULTY_RANGE.min,
      repetitions: (card.repetitions || 0) + 1,
      lapses: grade === 'again' ? (card.lapses || 0) + 1 : (card.lapses || 0),
      state: 0,
      lastReviewed: now,
      lastGrade: grade
    };
  }
}

export function isCardDue(card: Flashcard): boolean {
  const now = new Date();
  
  if (!card.nextReview) return true;
  
  // Calculate current retrievability
  const elapsedDays = (now.getTime() - (card.lastReviewed?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24);
  const retrievability = calculateRetrievability(elapsedDays, card.easeFactor || MIN_STABILITY);
  
  // Card is due if:
  // 1. It's never been reviewed
  // 2. Current time is past the next review date
  // 3. Retrievability has dropped below target threshold
  return !card.lastReviewed || 
         card.nextReview <= now || 
         retrievability < FORGETTING_CURVE_DECAY;
}

export function getInitialCardState(now: Date = new Date()): Partial<Flashcard> {
  const initialCard: FSRSCard = {
    due: now,
    stability: MIN_STABILITY,
    difficulty: DIFFICULTY_RANGE.min,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    last_review: now
  };

  return {
    fsrs: initialCard,
    nextReview: now,
    interval: 0,
    easeFactor: MIN_STABILITY,
    difficulty: DIFFICULTY_RANGE.min,
    retrievability: 1.0,
    repetitions: 0,
    lapses: 0,
    state: 0
  };
}