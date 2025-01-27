import { Flashcard, ReviewGrade } from '../types';

export function calculateNextReview(card: Flashcard, grade: ReviewGrade): Partial<Flashcard> {
  let { interval, easeFactor, repetitions } = card;
  
  switch (grade) {
    case 'again':
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      break;
      
    case 'hard':
      interval = Math.max(1, interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions++;
      break;
      
    case 'good':
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval *= easeFactor;
      repetitions++;
      break;
      
    case 'easy':
      interval *= easeFactor * 1.3;
      easeFactor += 0.15;
      repetitions++;
      break;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + Math.round(interval));

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview,
  };
}