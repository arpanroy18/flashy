import { useState, useEffect } from 'react';
import { Rating } from 'ts-fsrs';

export function StudyView() {
    const [studyPool, setStudyPool] = useState<FlashCard[]>([]);
    const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);

    useEffect(() => {
        // Initialize study pool with due cards
        const initializeStudyPool = async () => {
            const allCards = await fetchCards(); // Your existing fetch function
            setStudyPool(allCards); // no due filtering
            setCurrentCard(allCards[0] || null);
        };

        initializeStudyPool();
    }, []);

    const handleRating = async (rating: Rating) => {
        const newPool = studyPool.slice(1); 
        setStudyPool(newPool);
        setCurrentCard(newPool[0] || null);
    };

    if (!currentCard) {
        return <div>No cards due for review!</div>;
    }

    return (
        <div>
            <div className="card-content">
                {/* ... existing card display code ... */}
            </div>
            <div className="rating-buttons">
                <button onClick={() => handleRating(Rating.Again)}>Again</button>
                <button onClick={() => handleRating(Rating.Hard)}>Hard</button>
                <button onClick={() => handleRating(Rating.Good)}>Good</button>
                <button onClick={() => handleRating(Rating.Easy)}>Easy</button>
            </div>
        </div>
    );
}