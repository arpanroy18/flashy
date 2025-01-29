import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Flashcard } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { initializeFSRSCard } from '../utils/spaced-repetition';

interface CardEditorProps {
  card?: Flashcard | null;
  onSave: (card: Flashcard) => void;
  onClose: () => void;
}

export function CardEditor({ card, onSave, onClose }: CardEditorProps) {
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: Flashcard = {
      id: card?.id || uuidv4(),
      front,
      back,
      nextReview: card?.nextReview || new Date(),
      interval: card?.interval || 0,
      easeFactor: card?.easeFactor || 2.5,
      repetitions: card?.repetitions || 0,
      fsrs: card?.fsrs || initializeFSRSCard(),
    };
    onSave(newCard);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-navy-dark rounded-lg shadow-xl w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-gray-100">
            {card ? 'Edit Card' : 'New Card'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 bg-navy-dark">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Front
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-purple focus:border-accent-purple placeholder-gray-500"
              rows={3}
              required
              placeholder="Enter the question or prompt"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Back
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-purple focus:border-accent-purple placeholder-gray-500"
              rows={3}
              required
              placeholder="Enter the answer"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-purple hover:bg-accent-indigo text-gray-100 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}