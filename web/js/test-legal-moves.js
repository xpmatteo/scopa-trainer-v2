// Jasmine test suite for Scopa legal moves
import * as model from './model.js';

// Create a card helper function
const card = (suit, value) => ({ suit, value, id: `${suit}-${value}` });

describe('Scopa Legal Moves', function() {
    // Custom matcher for comparing moves
    beforeEach(function() {
        jasmine.addMatchers({
            toEqualMove: function() {
                return {
                    compare: function(actual, expected) {
                        const result = { pass: true };
                        
                        // Check if cards match
                        if (actual.card.suit !== expected.card.suit || actual.card.value !== expected.card.value) {
                            result.pass = false;
                            result.message = `Expected card ${expected.card.value} of ${expected.card.suit} but got ${actual.card.value} of ${actual.card.suit}`;
                            return result;
                        }
                        
                        // Check if types match
                        if (actual.type !== expected.type) {
                            result.pass = false;
                            result.message = `Expected move type ${expected.type} but got ${actual.type}`;
                            return result;
                        }
                        
                        // If capture, check if captured cards match
                        if (actual.type === 'capture') {
                            // Check if number of captured cards matches
                            if (actual.captureCards.length !== expected.captureCards.length) {
                                result.pass = false;
                                result.message = `Expected ${expected.captureCards.length} captured cards but got ${actual.captureCards.length}`;
                                return result;
                            }
                            
                            // Check if every card in expected has a matching card in actual
                            for (const expectedCard of expected.captureCards) {
                                const matchingCard = actual.captureCards.find(actualCard => 
                                    actualCard.suit === expectedCard.suit && actualCard.value === expectedCard.value
                                );
                                
                                if (!matchingCard) {
                                    result.pass = false;
                                    result.message = `Expected captured card ${expectedCard.value} of ${expectedCard.suit} but it was not found`;
                                    return result;
                                }
                            }
                            
                            // Check if every card in actual has a matching card in expected
                            for (const actualCard of actual.captureCards) {
                                const matchingCard = expected.captureCards.find(expectedCard => 
                                    expectedCard.suit === actualCard.suit && expectedCard.value === actualCard.value
                                );
                                
                                if (!matchingCard) {
                                    result.pass = false;
                                    result.message = `Found unexpected captured card ${actualCard.value} of ${actualCard.suit}`;
                                    return result;
                                }
                            }
                        }
                        
                        return result;
                    }
                };
            }
        });
    });

    // Helper function to verify all moves match
    function verifyMoves(actual, expected) {
        // Check if the number of moves matches
        expect(actual.length).toBe(expected.length);
        
        // Check if every expected move has a matching actual move
        for (const expectedMove of expected) {
            const matchingMove = actual.find(actualMove => {
                // Compare card
                if (actualMove.card.suit !== expectedMove.card.suit || 
                    actualMove.card.value !== expectedMove.card.value) {
                    return false;
                }
                
                // Compare type
                if (actualMove.type !== expectedMove.type) {
                    return false;
                }
                
                // If capture, compare captured cards
                if (actualMove.type === 'capture') {
                    // Check if number of captured cards matches
                    if (actualMove.captureCards.length !== expectedMove.captureCards.length) {
                        return false;
                    }
                    
                    // Check if every card in expectedMove has a matching card in actualMove
                    for (const expectedCard of expectedMove.captureCards) {
                        const matchingCard = actualMove.captureCards.find(actualCard => 
                            actualCard.suit === expectedCard.suit && actualCard.value === expectedCard.value
                        );
                        
                        if (!matchingCard) {
                            return false;
                        }
                    }
                }
                
                return true;
            });
            
            expect(matchingMove).toBeDefined(`Expected to find move: ${JSON.stringify(expectedMove)}`);
        }
        
        // Check if every actual move has a matching expected move
        for (const actualMove of actual) {
            const matchingMove = expected.find(expectedMove => {
                // Compare card
                if (actualMove.card.suit !== expectedMove.card.suit || 
                    actualMove.card.value !== expectedMove.card.value) {
                    return false;
                }
                
                // Compare type
                if (actualMove.type !== expectedMove.type) {
                    return false;
                }
                
                // If capture, compare captured cards
                if (actualMove.type === 'capture') {
                    // Check if number of captured cards matches
                    if (actualMove.captureCards.length !== expectedMove.captureCards.length) {
                        return false;
                    }
                    
                    // Check if every card in actualMove has a matching card in expectedMove
                    for (const actualCard of actualMove.captureCards) {
                        const matchingMove = expectedMove.captureCards.find(expectedCard => 
                            expectedCard.suit === actualCard.suit && expectedCard.value === actualCard.value
                        );
                        
                        if (!matchingMove) {
                            return false;
                        }
                    }
                }
                
                return true;
            });
            
            expect(matchingMove).toBeDefined(`Found unexpected move: ${JSON.stringify(actualMove)}`);
        }
    }

    // Test Case 1: Basic discard when no captures possible
    it('should allow only discards when no captures are possible', function() {
        const tableCards = [card('coins', 2), card('cups', 3)];
        const playerHand = [card('swords', 7), card('clubs', 10)];
        const expectedMoves = [
            { type: 'discard', card: card('swords', 7), captureCards: [] },
            { type: 'discard', card: card('clubs', 10), captureCards: [] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 2: Basic direct match capture
    it('should allow direct card value matches for captures', function() {
        const tableCards = [card('coins', 3), card('cups', 7)];
        const playerHand = [card('swords', 3), card('clubs', 5)];
        const expectedMoves = [
            { type: 'capture', card: card('swords', 3), captureCards: [card('coins', 3)] },
            { type: 'discard', card: card('clubs', 5), captureCards: [] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 3: Simple combination capture
    it('should allow capturing combinations of cards that sum to the played card value', function() {
        const tableCards = [card('coins', 1), card('cups', 2), card('swords', 4)];
        const playerHand = [card('clubs', 3)];
        const expectedMoves = [
            { type: 'capture', card: card('clubs', 3), captureCards: [card('coins', 1), card('cups', 2)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 4: Multiple capture options
    it('should allow multiple valid capture combinations', function() {
        const tableCards = [card('coins', 1), card('cups', 2), card('swords', 3), card('clubs', 4)];
        const playerHand = [card('coins', 5)];
        const expectedMoves = [
            { type: 'capture', card: card('coins', 5), captureCards: [card('coins', 1), card('clubs', 4)] },
            { type: 'capture', card: card('coins', 5), captureCards: [card('cups', 2), card('swords', 3)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 5: Empty table
    it('should only allow discards when the table is empty', function() {
        const tableCards = [];
        const playerHand = [card('coins', 7), card('cups', 3)];
        const expectedMoves = [
            { type: 'discard', card: card('coins', 7), captureCards: [] },
            { type: 'discard', card: card('cups', 3), captureCards: [] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 6: Single card capture rule
    it('should only offer direct matches when available (not combinations)', function() {
        const tableCards = [card('coins', 5), card('cups', 2), card('swords', 3)];
        const playerHand = [card('clubs', 5)];
        const expectedMoves = [
            { type: 'capture', card: card('clubs', 5), captureCards: [card('coins', 5)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 7: Multiple direct matches
    it('should offer each direct match as a separate capture option', function() {
        const tableCards = [card('coins', 4), card('cups', 4), card('swords', 4)];
        const playerHand = [card('clubs', 4)];
        const expectedMoves = [
            { type: 'capture', card: card('clubs', 4), captureCards: [card('coins', 4)] },
            { type: 'capture', card: card('clubs', 4), captureCards: [card('cups', 4)] },
            { type: 'capture', card: card('clubs', 4), captureCards: [card('swords', 4)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 8: Complex combinations
    it('should handle complex combinations of multiple cards', function() {
        const tableCards = [card('coins', 1), card('cups', 2), card('swords', 3), card('clubs', 4), card('coins', 2)];
        const playerHand = [card('cups', 10)];
        const expectedMoves = [
            { type: 'capture', card: card('cups', 10), captureCards: [card('coins', 1), card('cups', 2), card('swords', 3), card('clubs', 4)] },
            { type: 'capture', card: card('cups', 10), captureCards: [card('coins', 1), card('swords', 3), card('clubs', 4), card('coins', 2)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 9: Face card values
    it('should handle face cards correctly', function() {
        const tableCards = [card('coins', 8), card('cups', 9), card('swords', 10)];
        const playerHand = [card('clubs', 8), card('clubs', 9), card('clubs', 10)];
        const expectedMoves = [
            { type: 'capture', card: card('clubs', 8), captureCards: [card('coins', 8)] },
            { type: 'capture', card: card('clubs', 9), captureCards: [card('cups', 9)] },
            { type: 'capture', card: card('clubs', 10), captureCards: [card('swords', 10)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });

    // Test Case 10: Mix of direct and combinations
    it('should prefer direct matches over combinations', function() {
        const tableCards = [card('coins', 2), card('cups', 3), card('swords', 5)];
        const playerHand = [card('clubs', 5)];
        const expectedMoves = [
            { type: 'capture', card: card('clubs', 5), captureCards: [card('swords', 5)] }
        ];
        
        const state = { table: tableCards, playerHand: playerHand, aiHand: [] };
        const actualMoves = model.findAllLegalMoves(state);
        
        verifyMoves(actualMoves, expectedMoves);
    });
});
