import { Card as FSRSCard } from 'ts-fsrs';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  created: Date;
  modified: Date;
  score: number;
  interval: number;
  easeFactor: number;
  lastReviewed?: Date;
  nextReview: Date;
  retired: boolean;
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