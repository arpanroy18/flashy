export interface Flashcard {
  id: string;
  front: string;
  back: string;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed?: Date;
  lastGrade?: ReviewGrade;
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  parentId?: string;
  subdecks?: string[]; // IDs of child decks
  gradeCount: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

export interface StudyStats {
  totalCards: number;
  cardsStudied: number;
  correctAnswers: number;
  streak: number;
  lastStudyDate?: Date;
  studyHistory: {
    date: string;
    hours: number;
  }[];
  subjectDistribution: {
    name: string;
    value: number;
  }[];
}
