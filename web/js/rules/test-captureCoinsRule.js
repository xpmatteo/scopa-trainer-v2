import captureCoinsRule from './captureCoinsRule.js';

// Mock data for testing
const mockCard = (suit, value) => ({ suit, value });

const mockMove = (captureCards) => ({ captureCards });

const mockGameState = (aiCaptured, opponentCaptured) => ({
    captureCards: aiCaptured,
    opponentCaptureCards: opponentCaptured,
});

describe('captureCoinsRule', () => {
    it('returns 1 if the move captures any coin cards', () => {
        const move = mockMove([mockCard('coins', 5)]);
        const gameState = mockGameState([], []);
        expect(captureCoinsRule(move, gameState)).toBe(1);
    });

    it('returns 0 if the move does not capture any coin cards', () => {
        const move = mockMove([mockCard('swords', 7)]);
        const gameState = mockGameState([], []);
        expect(captureCoinsRule(move, gameState)).toBe(0);
    });

    it('returns 0 if AI has already captured 6 or more coin cards', () => {
        const move = mockMove([mockCard('coins', 5)]);
        const gameState = mockGameState(
            [mockCard('coins', 1), mockCard('coins', 2), mockCard('coins', 3), mockCard('coins', 4), mockCard('coins', 5), mockCard('coins', 6)],
            []
        );
        expect(captureCoinsRule(move, gameState)).toBe(0);
    });

    it('returns 0 if the opponent has already captured 6 or more coin cards', () => {
        const move = mockMove([mockCard('coins', 5)]);
        const gameState = mockGameState(
            [],
            [mockCard('coins', 1), mockCard('coins', 2), mockCard('coins', 3), mockCard('coins', 4), mockCard('coins', 5), mockCard('coins', 6)]
        );
        expect(captureCoinsRule(move, gameState)).toBe(0);
    });

    it('returns 1 if the move captures coins and neither player has 6 or more coins', () => {
        const move = mockMove([mockCard('coins', 5), mockCard('swords', 7)]);
        const gameState = mockGameState(
            [mockCard('coins', 1), mockCard('coins', 2)],
            [mockCard('coins', 3), mockCard('coins', 4)]
        );
        expect(captureCoinsRule(move, gameState)).toBe(1);
    });
});