import React, { useState } from 'react';
import { DeckList } from './DeckList';
import { StudySession } from './StudySession';
import { CardEditor } from './CardEditor';
import { Deck, Flashcard } from '../types';
import { PlusCircle, ArrowLeft, Trash2, FolderPlus } from 'lucide-react';

interface FlashcardsPageProps {
  decks: Deck[];
  onCreateDeck: (name: string, parentId?: string) => void;
  onUpdateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  onAddCard: (deckId: string, card: Flashcard) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  getAllCardsFromDeck: (deckId: string) => Flashcard[];
}

export function FlashcardsPage({
  decks,
  onCreateDeck,
  onUpdateCard,
  onAddCard,
  onDeleteCard,
  onDeleteDeck,
  getAllCardsFromDeck,
}: FlashcardsPageProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const handleStartStudy = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsStudying(true);
  };

  const handleExitStudy = () => {
    setIsStudying(false);
    setSelectedDeck(null);
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Flashcard>) => {
    if (selectedDeck) {
      onUpdateCard(selectedDeck.id, cardId, updates);
    }
  };

  const handleAddCard = (card: Flashcard) => {
    if (selectedDeck) {
      onAddCard(selectedDeck.id, card);
      setSelectedDeck({
        ...selectedDeck,
        cards: [...selectedDeck.cards, card],
      });
    }
    setIsAddingCard(false);
    setEditingCard(null);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setIsAddingCard(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (selectedDeck && confirm('Are you sure you want to delete this card?')) {
      onDeleteCard(selectedDeck.id, cardId);
      setSelectedDeck({
        ...selectedDeck,
        cards: selectedDeck.cards.filter(card => card.id !== cardId),
      });
    }
  };

  const handleCreateSubdeck = () => {
    const name = prompt('Enter subdeck name:');
    if (name && selectedDeck) {
      onCreateDeck(name, selectedDeck.id);
      // Update the selected deck with the new subdeck
      const updatedDeck = decks.find(d => d.id === selectedDeck.id);
      if (updatedDeck) {
        setSelectedDeck(updatedDeck);
      }
    }
  };

  const getSubdecks = (deckId: string): Deck[] => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck || !deck.subdecks) return [];
    return deck.subdecks
      .map(id => decks.find(d => d.id === id))
      .filter((d): d is Deck => d !== undefined);
  };

  if (isStudying && selectedDeck) {
    const allCards = getAllCardsFromDeck(selectedDeck.id);
    return (
      <StudySession
        cards={allCards}
        onUpdateCard={handleUpdateCard}
        onExit={handleExitStudy}
      />
    );
  }

  if (selectedDeck) {
    const subdecks = getSubdecks(selectedDeck.id);

    return (
      <div className="p-6 relative min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setSelectedDeck(null)}
            className="flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Decks</span>
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleCreateSubdeck}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-gray-100 border border-gray-700 rounded-lg hover:border-accent-purple transition-colors"
            >
              <FolderPlus size={20} />
              <span>Add Subdeck</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this deck?')) {
                  onDeleteDeck(selectedDeck.id);
                  setSelectedDeck(null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={20} />
              <span>Delete Deck</span>
            </button>
            <button
              onClick={() => setIsAddingCard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
            >
              <PlusCircle size={20} />
              <span>Add Flashcard</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-100 mb-6">{selectedDeck.name}</h2>

        {/* Subdecks Section */}
        {subdecks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Subdecks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subdecks.map(subdeck => (
                <div
                  key={subdeck.id}
                  className="p-6 bg-navy-light rounded-lg border border-gray-700 hover:border-accent-purple transition-colors"
                >
                  <h4 className="text-lg font-medium text-gray-100 mb-2">{subdeck.name}</h4>
                  <p className="text-gray-400 mb-4">{subdeck.cards.length} cards</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedDeck(subdeck)}
                      className="flex-1 px-3 py-2 text-gray-300 hover:text-gray-100 border border-gray-700 rounded-lg hover:border-accent-purple transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleStartStudy(subdeck)}
                      className="flex-1 px-3 py-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
                    >
                      Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Cards Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Cards</h3>
          {selectedDeck.cards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No cards in this deck yet.</p>
              <button
                onClick={() => setIsAddingCard(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
              >
                <PlusCircle size={20} />
                <span>Add Your First Card</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDeck.cards.map((card) => (
                <div
                  key={card.id}
                  className="p-6 bg-navy-light rounded-lg border border-gray-700 hover:border-accent-purple transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-gray-100 font-medium mb-2">{card.front}</p>
                      <p className="text-gray-400">{card.back}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {/* remove: nextReview display */}
                    {/* remove: lastGrade display */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAddingCard && (
          <CardEditor
            card={editingCard}
            onSave={handleAddCard}
            onClose={() => {
              setIsAddingCard(false);
              setEditingCard(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <DeckList
      decks={decks}
      onSelectDeck={setSelectedDeck}
      onStudyDeck={handleStartStudy}
      onCreateDeck={onCreateDeck}
    />
  );
}