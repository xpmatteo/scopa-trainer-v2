// Test script for findAllLegalMoves function
import * as model from './model.js';

// Initialize the game to get a valid state
model.initGameState();

// Get all legal moves for the current player
const legalMoves = model.findAllLegalMoves(model.gameState);

// Print all legal moves
console.log(`Found ${legalMoves.length} legal moves for the player:`);
legalMoves.forEach((move, index) => {
    console.log(`\nMove ${index + 1}: ${move.type.toUpperCase()}`);
    console.log(`Card: ${move.card.value} of ${move.card.suit}`);
    if (move.type === 'capture') {
        console.log(`Capturing: ${move.captureCards.map(c => `${c.value} of ${c.suit}`).join(', ')}`);
    }
    console.log(`Description: ${move.description}`);
});

// Get legal moves for AI
const aiLegalMoves = model.findAllLegalMoves(model.gameState, 'ai');
console.log(`\nFound ${aiLegalMoves.length} legal moves for the AI.`);

// Create a custom game state to test specific scenarios
const customState = {
    table: [
        { suit: 'coins', value: 1, id: 'coins-1' },
        { suit: 'cups', value: 2, id: 'cups-2' },
        { suit: 'swords', value: 3, id: 'swords-3' },
        { suit: 'coins', value: 4, id: 'coins-4' },
        { suit: 'clubs', value: 7, id: 'clubs-7' }
    ],
    playerHand: [
        { suit: 'coins', value: 7, id: 'coins-7' },
        { suit: 'cups', value: 5, id: 'cups-5' },
        { suit: 'swords', value: 1, id: 'swords-1' },
    ],
    aiHand: []
};

// Test with custom state
console.log('\n\n--- Testing with custom state ---');
const customMoves = model.findAllLegalMoves(customState);
console.log(`Found ${customMoves.length} legal moves for the custom state:`);
customMoves.forEach((move, index) => {
    console.log(`\nMove ${index + 1}: ${move.type.toUpperCase()}`);
    console.log(`Card: ${move.card.value} of ${move.card.suit}`);
    if (move.type === 'capture') {
        console.log(`Capturing: ${move.captureCards.map(c => `${c.value} of ${c.suit}`).join(', ')}`);
    }
    console.log(`Description: ${move.description}`);
});
