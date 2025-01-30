import React, { useState } from 'react';
import { PlusCircle, Settings, FolderPlus } from 'lucide-react';
import { Deck } from '../types';

interface DeckListProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onStudyDeck: (deck: Deck) => void;
  onCreateDeck: (name: string, parentId?: string) => void;
}

export function DeckList({ decks, onSelectDeck, onStudyDeck, onCreateDeck }: DeckListProps) {
  const [expandedDecks, setExpandedDecks] = useState<Set<string>>(new Set());

  const toggleExpand = (deckId: string) => {
    setExpandedDecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
      } else {
        newSet.add(deckId);
      }
      return newSet;
    });
  };

  const renderDeck = (deck: Deck, level = 0) => {
    const hasSubdecks = deck.subdecks && deck.subdecks.length > 0;
    const isExpanded = expandedDecks.has(deck.id);
    const subdecks = deck.subdecks?.map(id => decks.find(d => d.id === id)).filter(Boolean) as Deck[];

    return (
      <div key={deck.id} className="h-full" style={{ marginLeft: `${level * 1.5}rem` }}>
        <div className="h-full p-6 bg-navy-light rounded-lg shadow-lg border border-gray-700 hover:border-accent-purple transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              {hasSubdecks && (
                <button
                  onClick={() => toggleExpand(deck.id)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              {deck.name}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onCreateDeck(prompt('Enter subdeck name:') || '', deck.id)}
                className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                title="Add Subdeck"
              >
                <FolderPlus size={20} />
              </button>
            </div>
          </div>
          
          <p className="text-gray-400 mb-4">{deck.cards.length} cards</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => onStudyDeck(deck)}
              className="flex-1 px-3 py-2 text-gray-300 hover:text-gray-100 border border-gray-700 rounded-lg hover:border-accent-purple bg-accent-purple hover:bg-accent-indigo transition-colors"
            >
              Study
            </button>
            <button
              onClick={() => onSelectDeck(deck)}
              className="px-3 py-2 text-gray-300 hover:text-gray-100 border border-gray-700 rounded-lg hover:border-accent-purple transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {hasSubdecks && isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subdecks.map(subdeck => renderDeck(subdeck, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelDecks = decks.filter(deck => !deck.parentId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Your Decks</h2>
        <button
          onClick={() => onCreateDeck(prompt('Enter deck name:') || '')}
          className="flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
        >
          <PlusCircle size={20} />
          <span>New Deck</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-6 max-w-7xl mx-auto">
        {topLevelDecks.map(deck => renderDeck(deck))}
      </div>
    </div>
  );
}