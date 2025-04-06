import captureSevenOfCoinsRule from './captureSevenOfCoinsRule.js';

// Mock data for testing
const mockCard = (suit, value) => ({ suit, value });
const mockMove = (captureCards) => ({ captureCards });

describe('captureSevenOfCoinsRule', () => {
    it('returns 1 if the move captures the seven of coins', () => {
        const move = mockMove([mockCard('coins', 3), mockCard('coins', 7)]);
        expect(captureSevenOfCoinsRule(move)).toBe(1);
    });

    it('returns 0 if the move does not capture the seven of coins', () => {
        const move = mockMove([mockCard('coins', 5)]);
        expect(captureSevenOfCoinsRule(move)).toBe(0);
    });

    it('returns 0 if the move captures nothing', () => {
        const move = mockMove([]);
        expect(captureSevenOfCoinsRule(move)).toBe(0);
    });
});