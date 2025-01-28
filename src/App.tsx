import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { FlashcardsPage } from './components/FlashcardsPage';
import { v4 as uuidv4 } from 'uuid';
import { Deck, Flashcard, StudyStats } from './types';

const STORAGE_KEY = 'flashcards-data';
const STATS_KEY = 'study-stats';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'flashcards'>('dashboard');
  const [decks, setDecks] = useState<Deck[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.map((deck: Deck) => ({
        ...deck,
        cards: deck.cards.map(card => ({
          ...card,
          nextReview: new Date(card.nextReview),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined
        }))
      }));
    }
    return [
      {
        id: uuidv4(),
        name: 'Example Deck',
        cards: [
          {
            id: uuidv4(),
            front: 'What is the capital of France?',
            back: 'Paris',
            nextReview: new Date(),
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
          },
        ],
        gradeCount: { again: 0, hard: 0, good: 0, easy: 0 }
      },
    ];
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      return {
        ...parsedStats,
        lastStudyDate: parsedStats.lastStudyDate ? new Date(parsedStats.lastStudyDate) : undefined
      };
    }
    return {
      totalCards: 0,
      cardsStudied: 0,
      correctAnswers: 0,
      streak: 0,
      studyHistory: [
        { date: '2024-03-01', hours: 1.5 },
        { date: '2024-03-02', hours: 2.0 },
        { date: '2024-03-03', hours: 1.0 },
        { date: '2024-03-04', hours: 2.5 },
        { date: '2024-03-05', hours: 1.8 },
      ],
      subjectDistribution: [
        { name: 'Mathematics', value: 30 },
        { name: 'Science', value: 25 },
        { name: 'History', value: 20 },
        { name: 'Languages', value: 25 },
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const getAllCardsFromDeck = (deckId: string): Flashcard[] => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return [];

    let allCards = [...deck.cards];
    
    // Get cards from subdecks
    if (deck.subdecks) {
      deck.subdecks.forEach(subdeckId => {
        allCards = [...allCards, ...getAllCardsFromDeck(subdeckId)];
      });
    }

    return allCards;
  };

  const handleCreateDeck = (name: string, parentId?: string) => {
    const newDeck: Deck = {
      id: uuidv4(),
      name,
      cards: [],
      parentId,
      subdecks: [],
      gradeCount: { again: 0, hard: 0, good: 0, easy: 0 }
    };

    if (parentId) {
      setDecks(decks.map(deck => 
        deck.id === parentId
          ? { ...deck, subdecks: [...(deck.subdecks || []), newDeck.id] }
          : deck
      ));
    }

    setDecks([...decks, newDeck]);
    updateStats();
  };

  const handleUpdateCard = (deckId: string, cardId: string, updates: Partial<Flashcard>) => {
    setDecks(decks.map(deck => {
      if (deck.id !== deckId) return deck;

      // Update grade counts if there's a new grade
      let newGradeCount = { ...deck.gradeCount };
      if (updates.lastGrade) {
        // Decrease count for old grade if it exists
        const oldCard = deck.cards.find(c => c.id === cardId);
        if (oldCard?.lastGrade) {
          newGradeCount[oldCard.lastGrade]--;
        }
        // Increase count for new grade
        newGradeCount[updates.lastGrade]++;
      }

      return {
        ...deck,
        gradeCount: newGradeCount,
        cards: deck.cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      };
    }));
    updateStats();
  };

  const handleAddCard = (deckId: string, card: Flashcard) => {
    setDecks(decks.map(deck => {
      if (deck.id !== deckId) return deck;
      return {
        ...deck,
        cards: [...deck.cards, { ...card, id: uuidv4() }],
      };
    }));
    updateStats();
  };

  const handleDeleteCard = (deckId: string, cardId: string) => {
    setDecks(decks.map(deck => {
      if (deck.id !== deckId) return deck;
      return {
        ...deck,
        cards: deck.cards.filter(card => card.id !== cardId),
      };
    }));
    updateStats();
  };

  const handleDeleteDeck = (deckId: string) => {
    const deckToDelete = decks.find(d => d.id === deckId);
    if (!deckToDelete) return;

    // If this deck has a parent, remove it from parent's subdecks
    if (deckToDelete.parentId) {
      setDecks(decks.map(deck =>
        deck.id === deckToDelete.parentId
          ? { ...deck, subdecks: deck.subdecks?.filter(id => id !== deckId) }
          : deck
      ));
    }

    // Remove the deck and all its subdecks
    const allSubdeckIds = getAllSubdeckIds(deckId);
    setDecks(decks.filter(deck => !allSubdeckIds.includes(deck.id)));
    updateStats();
  };

  const getAllSubdeckIds = (deckId: string): string[] => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return [deckId];

    let ids = [deckId];
    if (deck.subdecks) {
      deck.subdecks.forEach(subdeckId => {
        ids = [...ids, ...getAllSubdeckIds(subdeckId)];
      });
    }
    return ids;
  };

  const updateStats = () => {
    const totalCards = decks.reduce((sum, deck) => sum + getAllCardsFromDeck(deck.id).length, 0);
    const cardsStudied = decks.reduce((sum, deck) => 
      sum + getAllCardsFromDeck(deck.id).filter(card => card.lastReviewed).length, 0);
    
    setStats(prev => ({
      ...prev,
      totalCards,
      cardsStudied,
    }));
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' ? (
        <Dashboard stats={stats} decks={decks} />
      ) : (
        <FlashcardsPage
          decks={decks}
          onCreateDeck={handleCreateDeck}
          onUpdateCard={handleUpdateCard}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onDeleteDeck={handleDeleteDeck}
          getAllCardsFromDeck={getAllCardsFromDeck}
        />
      )}
    </Layout>
  );
}

export default App;
