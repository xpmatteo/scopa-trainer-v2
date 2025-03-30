// Tests for the scoreBreakdown function

describe('Score Breakdown Tests', function() {
    // Import functions from model.js
    let model;
    
    beforeEach(function() {
        // Import the module for testing
        if (typeof window.modelModule !== 'undefined') {
            model = window.modelModule;
        } else {
            console.error('Model module not available as window.modelModule');
            // Try to import directly
            try {
                import('./model.js').then(module => {
                    model = module;
                    console.log('Model module imported directly');
                });
            } catch (e) {
                console.error('Failed to import model module:', e);
            }
        }
    });
    
    // Helper function to create a mock game state for testing
    function createMockGameState(playerCaptures = [], aiCaptures = [], playerScopaCount = 0, aiScopaCount = 0) {
        return {
            playerCaptures: [...playerCaptures],
            aiCaptures: [...aiCaptures],
            playerScopaCount: playerScopaCount,
            aiScopaCount: aiScopaCount
        };
    }
    
    // Helper function to create a card with specified suit and value
    function createCard(suit, value) {
        return { suit, value, id: `${suit}-${value}` };
    }
    
    describe('Basic Initialization Tests', function() {
        it('should handle empty game state', function() {
            const gameState = createMockGameState();
            const breakdown = model.scoreBreakdown(gameState);
            
            // Verify all counts are zero
            expect(breakdown.player.cardsCaptured).toBe(0);
            expect(breakdown.ai.cardsCaptured).toBe(0);
            expect(breakdown.player.coinsCaptured).toBe(0);
            expect(breakdown.ai.coinsCaptured).toBe(0);
            expect(breakdown.player.hasSetteBello).toBe(false);
            expect(breakdown.ai.hasSetteBello).toBe(false);
            expect(breakdown.player.primieraCards.sevens).toBe(0);
            expect(breakdown.player.primieraCards.sixes).toBe(0);
            expect(breakdown.player.primieraCards.aces).toBe(0);
            expect(breakdown.ai.primieraCards.sevens).toBe(0);
            expect(breakdown.ai.primieraCards.sixes).toBe(0);
            expect(breakdown.ai.primieraCards.aces).toBe(0);
            
            // Verify no advantages
            expect(breakdown.player.cardAdvantage).toBe(null);
            expect(breakdown.ai.cardAdvantage).toBe(null);
            expect(breakdown.player.coinAdvantage).toBe(null);
            expect(breakdown.ai.coinAdvantage).toBe(null);
            expect(breakdown.player.primieraAdvantage).toBe(null);
            expect(breakdown.ai.primieraAdvantage).toBe(null);
        });
    });
    
    describe('Card Counting Tests', function() {
        it('should correctly count cards captured', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('cups', 2),
                createCard('swords', 3)
            ];
            const aiCaptures = [
                createCard('clubs', 4),
                createCard('coins', 5)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(3);
            expect(breakdown.ai.cardsCaptured).toBe(2);
        });
        
        it('should detect player normal card advantage', function() {
            const playerCaptures = Array(12).fill().map((_, i) => createCard('coins', (i % 10) + 1));
            const aiCaptures = Array(8).fill().map((_, i) => createCard('cups', (i % 10) + 1));
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(12);
            expect(breakdown.ai.cardsCaptured).toBe(8);
            expect(breakdown.player.cardAdvantage).toBe('normal');
            expect(breakdown.ai.cardAdvantage).toBe(null);
        });
        
        it('should detect player strong card advantage (21+ cards)', function() {
            const playerCaptures = Array(21).fill().map((_, i) => createCard('coins', (i % 10) + 1));
            const aiCaptures = Array(8).fill().map((_, i) => createCard('cups', (i % 10) + 1));
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(21);
            expect(breakdown.ai.cardsCaptured).toBe(8);
            expect(breakdown.player.cardAdvantage).toBe('strong');
            expect(breakdown.ai.cardAdvantage).toBe(null);
        });
        
        it('should detect AI normal card advantage', function() {
            const playerCaptures = Array(8).fill().map((_, i) => createCard('coins', (i % 10) + 1));
            const aiCaptures = Array(12).fill().map((_, i) => createCard('cups', (i % 10) + 1));
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(8);
            expect(breakdown.ai.cardsCaptured).toBe(12);
            expect(breakdown.player.cardAdvantage).toBe(null);
            expect(breakdown.ai.cardAdvantage).toBe('normal');
        });
        
        it('should detect AI strong card advantage (21+ cards)', function() {
            const playerCaptures = Array(8).fill().map((_, i) => createCard('coins', (i % 10) + 1));
            const aiCaptures = Array(21).fill().map((_, i) => createCard('cups', (i % 10) + 1));
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(8);
            expect(breakdown.ai.cardsCaptured).toBe(21);
            expect(breakdown.player.cardAdvantage).toBe(null);
            expect(breakdown.ai.cardAdvantage).toBe('strong');
        });
        
        it('should handle tied card counts (no advantage)', function() {
            const playerCaptures = Array(10).fill().map((_, i) => createCard('coins', (i % 10) + 1));
            const aiCaptures = Array(10).fill().map((_, i) => createCard('cups', (i % 10) + 1));
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(10);
            expect(breakdown.ai.cardsCaptured).toBe(10);
            expect(breakdown.player.cardAdvantage).toBe(null);
            expect(breakdown.ai.cardAdvantage).toBe(null);
        });
    });
    
    describe('Coin Counting Tests', function() {
        it('should correctly count coins captured', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('coins', 3),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.coinsCaptured).toBe(2);
            expect(breakdown.ai.coinsCaptured).toBe(1);
        });
        
        it('should detect player normal coin advantage', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('coins', 3),
                createCard('coins', 5),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.coinsCaptured).toBe(3);
            expect(breakdown.ai.coinsCaptured).toBe(1);
            expect(breakdown.player.coinAdvantage).toBe('normal');
            expect(breakdown.ai.coinAdvantage).toBe(null);
        });
        
        it('should detect player strong coin advantage (6+ coins)', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('coins', 2),
                createCard('coins', 3),
                createCard('coins', 4),
                createCard('coins', 5),
                createCard('coins', 6),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 10),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.coinsCaptured).toBe(6);
            expect(breakdown.ai.coinsCaptured).toBe(1);
            expect(breakdown.player.coinAdvantage).toBe('strong');
            expect(breakdown.ai.coinAdvantage).toBe(null);
        });
        
        it('should detect AI normal coin advantage', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('coins', 3),
                createCard('coins', 5),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.coinsCaptured).toBe(1);
            expect(breakdown.ai.coinsCaptured).toBe(3);
            expect(breakdown.player.coinAdvantage).toBe(null);
            expect(breakdown.ai.coinAdvantage).toBe('normal');
        });
        
        it('should detect AI strong coin advantage (6+ coins)', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('coins', 3),
                createCard('coins', 4),
                createCard('coins', 5),
                createCard('coins', 6),
                createCard('coins', 8),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.coinsCaptured).toBe(1);
            expect(breakdown.ai.coinsCaptured).toBe(6);
            expect(breakdown.player.coinAdvantage).toBe(null);
            expect(breakdown.ai.coinAdvantage).toBe('strong');
        });
        
        it('should handle tied coin counts (no advantage)', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('coins', 3),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('coins', 5),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.coinsCaptured).toBe(2);
            expect(breakdown.ai.coinsCaptured).toBe(2);
            expect(breakdown.player.coinAdvantage).toBe(null);
            expect(breakdown.ai.coinAdvantage).toBe(null);
        });
    });
    
    describe('Settebello Tests', function() {
        it('should detect when player has the 7 of coins', function() {
            const playerCaptures = [
                createCard('coins', 7),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.hasSetteBello).toBe(true);
            expect(breakdown.ai.hasSetteBello).toBe(false);
        });
        
        it('should detect when AI has the 7 of coins', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 7),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.hasSetteBello).toBe(false);
            expect(breakdown.ai.hasSetteBello).toBe(true);
        });
        
        it('should handle when neither player has the 7 of coins', function() {
            const playerCaptures = [
                createCard('coins', 1),
                createCard('cups', 2)
            ];
            const aiCaptures = [
                createCard('coins', 2),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.hasSetteBello).toBe(false);
            expect(breakdown.ai.hasSetteBello).toBe(false);
        });
    });
    
    describe('Primiera Card Tests', function() {
        it('should correctly count primiera-valuable cards', function() {
            const playerCaptures = [
                createCard('coins', 7),
                createCard('cups', 7),
                createCard('swords', 6),
                createCard('clubs', 1),
                createCard('clubs', 2),
            ];
            const aiCaptures = [
                createCard('coins', 1),
                createCard('cups', 6),
                createCard('clubs', 4)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.primieraCards.sevens).toBe(2);
            expect(breakdown.player.primieraCards.sixes).toBe(1);
            expect(breakdown.player.primieraCards.aces).toBe(1);
            expect(breakdown.ai.primieraCards.sevens).toBe(0);
            expect(breakdown.ai.primieraCards.sixes).toBe(1);
            expect(breakdown.ai.primieraCards.aces).toBe(1);
        });
        
        it('should detect player normal primiera advantage', function() {
            const playerCaptures = [
                createCard('coins', 7),
                createCard('cups', 6),
                createCard('swords', 1),
                createCard('clubs', 4),
            ];
            const aiCaptures = [
                createCard('coins', 1),
                createCard('cups', 2)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            const playerPrimieraTotal = 
                breakdown.player.primieraCards.sevens + 
                breakdown.player.primieraCards.sixes + 
                breakdown.player.primieraCards.aces;
            
            const aiPrimieraTotal = 
                breakdown.ai.primieraCards.sevens + 
                breakdown.ai.primieraCards.sixes + 
                breakdown.ai.primieraCards.aces;
            
            expect(playerPrimieraTotal).toBe(3);
            expect(aiPrimieraTotal).toBe(1);
            expect(breakdown.player.primieraAdvantage).toBe('normal');
            expect(breakdown.ai.primieraAdvantage).toBe(null);
        });
        
        it('should detect player strong primiera advantage (7+ primiera cards)', function() {
            const playerCaptures = [
                createCard('coins', 7),
                createCard('cups', 7),
                createCard('swords', 7),
                createCard('clubs', 7),
                createCard('coins', 6),
                createCard('cups', 6),
                createCard('swords', 1),
            ];
            const aiCaptures = [
                createCard('coins', 1),
                createCard('cups', 2)
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.primieraCards.sevens + 
                   breakdown.player.primieraCards.sixes + 
                   breakdown.player.primieraCards.aces).toBe(7);
            expect(breakdown.player.primieraAdvantage).toBe('strong');
            expect(breakdown.ai.primieraAdvantage).toBe(null);
        });
        
        it('should detect AI primiera advantage', function() {
            const playerCaptures = [
                createCard('coins', 2),
                createCard('cups', 3)
            ];
            const aiCaptures = [
                createCard('coins', 7),
                createCard('cups', 6),
                createCard('swords', 1),
                createCard('clubs', 4),
            ];
            
            const gameState = createMockGameState(playerCaptures, aiCaptures);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.primieraCards.sevens + 
                   breakdown.player.primieraCards.sixes + 
                   breakdown.player.primieraCards.aces).toBe(0);
            expect(breakdown.ai.primieraCards.sevens + 
                   breakdown.ai.primieraCards.sixes + 
                   breakdown.ai.primieraCards.aces).toBe(3);
            expect(breakdown.player.primieraAdvantage).toBe(null);
            expect(breakdown.ai.primieraAdvantage).toBe('normal');
        });
    });
    
    describe('Scopa Counting Tests', function() {
        it('should correctly count scopa points', function() {
            const gameState = createMockGameState([], [], 2, 3);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.scopaCount).toBe(2);
            expect(breakdown.ai.scopaCount).toBe(3);
        });
    });
    
    describe('Edge Cases', function() {
        it('should handle all cards captured by one player', function() {
            const playerCaptures = Array(40).fill().map((_, i) => {
                const suit = ['coins', 'cups', 'swords', 'clubs'][Math.floor(i / 10)];
                const value = (i % 10) + 1;
                return createCard(suit, value);
            });
            
            const gameState = createMockGameState(playerCaptures, []);
            const breakdown = model.scoreBreakdown(gameState);
            
            expect(breakdown.player.cardsCaptured).toBe(40);
            expect(breakdown.ai.cardsCaptured).toBe(0);
            expect(breakdown.player.coinsCaptured).toBe(10);
            expect(breakdown.ai.coinsCaptured).toBe(0);
            expect(breakdown.player.cardAdvantage).toBe('strong');
            expect(breakdown.player.coinAdvantage).toBe('strong');
            expect(breakdown.ai.cardAdvantage).toBe(null);
            expect(breakdown.ai.coinAdvantage).toBe(null);
        });
    });
});
