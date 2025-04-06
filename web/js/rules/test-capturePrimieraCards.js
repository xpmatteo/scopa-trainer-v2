import capturePrimieraCardsRule from './capturePrimieraCards.js';

// Mock data for testing
const mockCard = (suit, value) => ({ suit, value });
const mockMove = (captureCards) => ({ captureCards });

describe('capturePrimieraCardsRule', () => {
    it('returns 1 for capturing a seven', () => {
        const move = mockMove([mockCard('coins', 7)]);
        const gameState = { captureCards: [], opponentCaptureCards: [] };
        expect(capturePrimieraCardsRule(move, gameState)).toBe(1);
    });

    it('returns lower positive scores for other primiera-valuable cards', () => {
        const move = mockMove([mockCard('coins', 6), mockCard('cups', 1)]);
        const gameState = { captureCards: [], opponentCaptureCards: [] };
        expect(capturePrimieraCardsRule(move, gameState)).toBeCloseTo(1.5, 1);
    });

    it('returns 0 for non-primiera cards', () => {
        const move = mockMove([mockCard('coins', 8), mockCard('cups', 9)]);
        const gameState = { captureCards: [], opponentCaptureCards: [] };
        expect(capturePrimieraCardsRule(move, gameState)).toBe(0);
    });

    it('sums scores for multiple primiera-valuable cards', () => {
        const move = mockMove([mockCard('coins', 7), mockCard('cups', 6), mockCard('swords', 1)]);
        const gameState = { captureCards: [], opponentCaptureCards: [] };
        expect(capturePrimieraCardsRule(move, gameState)).toBeCloseTo(2.5, 1);
    });

    it('returns 0 if the primiera point has already been won', () => {
        const move = mockMove([mockCard('coins', 7)]);
        const gameState = { captureCards: [mockCard('coins', 7)], opponentCaptureCards: [mockCard('cups', 7)] };
        expect(capturePrimieraCardsRule(move, gameState)).toBe(0);
    });

    it('calculates score if the primiera point has not been won', () => {
        const move = mockMove([mockCard('coins', 7)]);
        const gameState = { captureCards: [], opponentCaptureCards: [] };
        expect(capturePrimieraCardsRule(move, gameState)).toBe(1);
    });
});