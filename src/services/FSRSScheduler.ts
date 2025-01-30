import { fsrs, generatorParameters, Card as FSRSCard, Rating } from 'ts-fsrs';

export class FSRSScheduler {
    private scheduler;

    constructor() {
        const params = generatorParameters({
            enable_fuzz: true,
            enable_short_term: true,
            // Default parameters that work well for most cases
            request_retention: 0.9,
            maximum_interval: 36500,
            w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05],
        });
        this.scheduler = fsrs(params);
    }

    // Convert our app's card to FSRS format
    private toFSRSCard(card: FlashCard): FSRSCard {
        return {
            due: new Date(card.nextReviewDate),
            stability: card.stability || 0,
            difficulty: card.difficulty || 0,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: card.reviewCount || 0,
            lapses: card.lapses || 0,
            state: card.state || 'New',
            last_review: card.lastReviewDate ? new Date(card.lastReviewDate) : new Date(),
        };
    }

    isDue(card: FlashCard): boolean {
        const now = new Date();
        const fsrsCard = this.toFSRSCard(card);
        return fsrsCard.due <= now || fsrsCard.state !== 'Review';
    }

    scheduleCard(card: FlashCard, rating: Rating): FlashCard {
        const now = new Date();
        const fsrsCard = this.toFSRSCard(card);
        const [scheduled] = this.scheduler.repeat(fsrsCard, now);
        const result = this.scheduler.next(scheduled.card, now, rating);

        return {
            ...card,
            nextReviewDate: result.card.due.toISOString(),
            stability: result.card.stability,
            difficulty: result.card.difficulty,
            state: result.card.state,
            lastReviewDate: now.toISOString(),
            reviewCount: (card.reviewCount || 0) + 1,
            lapses: result.card.lapses,
        };
    }
} 