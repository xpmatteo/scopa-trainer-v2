// Comprehensive test suite for findAllLegalMoves function
import * as model from './model.js';

// Create a card helper function
const card = (suit, value) => ({ suit, value, id: `${suit}-${value}` });

// Test case class for tabular test format
class LegalMovesTestCase {
    constructor(name, description, tableCards, playerHand, expectedMoves) {
        this.name = name;
        this.description = description;
        this.tableCards = tableCards;
        this.playerHand = playerHand;
        this.expectedMoves = expectedMoves;
    }

    run() {
        console.log(`\n==== Test Case: ${this.name} ====`);
        console.log(`Description: ${this.description}`);
        
        // Create game state
        const state = {
            table: this.tableCards,
            playerHand: this.playerHand,
            aiHand: []
        };
        
        // Print initial state
        console.log('\nInitial State:');
        console.log('Table Cards:', state.table.map(c => `${c.value} of ${c.suit}`).join(', '));
        console.log('Player Hand:', state.playerHand.map(c => `${c.value} of ${c.suit}`).join(', '));
        
        // Get all legal moves
        const actualMoves = model.findAllLegalMoves(state);
        
        // Print expected vs actual in tabular format
        console.log('\n=== Expected Moves ===');
        this._printMoves(this.expectedMoves);
        
        console.log('\n=== Actual Moves ===');
        this._printMoves(actualMoves);
        
        // Verify the number of moves matches
        const countMatch = actualMoves.length === this.expectedMoves.length;
        
        if (!countMatch) {
            console.log(`\n❌ TEST FAILED: Expected ${this.expectedMoves.length} moves but got ${actualMoves.length}`);
            return false;
        }
        
        // Verify each move matches (assuming order doesn't matter)
        const allMovesMatch = this._verifyMoves(actualMoves, this.expectedMoves);
        
        if (allMovesMatch) {
            console.log(`\n✅ TEST PASSED: All moves match expected output`);
            return true;
        } else {
            console.log(`\n❌ TEST FAILED: Actual moves don't match expected moves`);
            return false;
        }
    }
    
    _printMoves(moves) {
        if (moves.length === 0) {
            console.log("No moves available");
            return;
        }
        
        // Create HTML table for better display
        let tableHtml = '<table class="moves-table" style="width:100%; border-collapse:collapse; margin:10px 0; border:1px solid #ddd;">';
        
        // Add header row
        tableHtml += '<tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd; padding:8px; text-align:left;">Type</th>' +
                   '<th style="border:1px solid #ddd; padding:8px; text-align:left;">Card</th>' +
                   '<th style="border:1px solid #ddd; padding:8px; text-align:left;">Captures</th></tr>';
        
        // Add data rows
        moves.forEach((move, index) => {
            const rowStyle = index % 2 === 0 ? '' : 'background-color:#f9f9f9;';
            const cardStr = `${move.card.value} of ${move.card.suit}`;
            const capturesStr = move.type === 'capture' 
                ? move.captureCards.map(c => `${c.value} of ${c.suit}`).join(', ')
                : 'none';
                
            const typeStyle = move.type === 'capture' ? 'color:#007bff;' : 'color:#6c757d;';
            
            tableHtml += `<tr style="${rowStyle}">`;
            tableHtml += `<td style="border:1px solid #ddd; padding:8px; ${typeStyle}">${move.type}</td>`;
            tableHtml += `<td style="border:1px solid #ddd; padding:8px;">${cardStr}</td>`;
            tableHtml += `<td style="border:1px solid #ddd; padding:8px;">${capturesStr}</td>`;
            tableHtml += '</tr>';
        });
        
        tableHtml += '</table>';
        
        // Output the HTML table
        console.log(tableHtml);
    }
    
    _verifyMoves(actual, expected) {
        // Check if every expected move has a matching actual move
        for (const expectedMove of expected) {
            const matchingMove = actual.find(actualMove => 
                this._movesMatch(actualMove, expectedMove)
            );
            
            if (!matchingMove) {
                return false;
            }
        }
        
        // Check if every actual move has a matching expected move
        for (const actualMove of actual) {
            const matchingMove = expected.find(expectedMove => 
                this._movesMatch(actualMove, expectedMove)
            );
            
            if (!matchingMove) {
                return false;
            }
        }
        
        return true;
    }
    
    _movesMatch(move1, move2) {
        // Check if cards match
        if (move1.card.suit !== move2.card.suit || move1.card.value !== move2.card.value) {
            return false;
        }
        
        // Check if types match
        if (move1.type !== move2.type) {
            return false;
        }
        
        // If capture, check if captured cards match
        if (move1.type === 'capture') {
            // Check if number of captured cards matches
            if (move1.captureCards.length !== move2.captureCards.length) {
                return false;
            }
            
            // Check if every card in move1 has a matching card in move2
            for (const card1 of move1.captureCards) {
                const matchingCard = move2.captureCards.find(card2 => 
                    card1.suit === card2.suit && card1.value === card2.value
                );
                
                if (!matchingCard) {
                    return false;
                }
            }
        }
        
        return true;
    }
}

// Define all test cases

// Test Case 1: Basic discard when no captures possible
const testCase1 = new LegalMovesTestCase(
    'Basic Discard',
    'When no captures are possible, all cards should be discard moves',
    [card('coins', 2), card('cups', 3)],
    [card('swords', 7), card('clubs', 10)],
    [
        { type: 'discard', card: card('swords', 7), captureCards: [] },
        { type: 'discard', card: card('clubs', 10), captureCards: [] }
    ]
);

// Test Case 2: Basic direct match capture
const testCase2 = new LegalMovesTestCase(
    'Direct Match Capture',
    'Player should be able to capture cards of matching value',
    [card('coins', 3), card('cups', 7)],
    [card('swords', 3), card('clubs', 5)],
    [
        { type: 'capture', card: card('swords', 3), captureCards: [card('coins', 3)] },
        { type: 'discard', card: card('clubs', 5), captureCards: [] }
    ]
);

// Test Case 3: Simple combination capture
const testCase3 = new LegalMovesTestCase(
    'Combination Capture',
    'Player should be able to capture combinations that sum to card value',
    [card('coins', 1), card('cups', 2), card('swords', 4)],
    [card('clubs', 3)],
    [
        { type: 'capture', card: card('clubs', 3), captureCards: [card('coins', 1), card('cups', 2)] }
    ]
);

// Test Case 4: Multiple capture options
const testCase4 = new LegalMovesTestCase(
    'Multiple Capture Options',
    'Player should see all possible valid captures',
    [card('coins', 1), card('cups', 2), card('swords', 3), card('clubs', 4)],
    [card('coins', 5)],
    [
        { type: 'capture', card: card('coins', 5), captureCards: [card('coins', 1), card('clubs', 4)] },
        { type: 'capture', card: card('coins', 5), captureCards: [card('cups', 2), card('swords', 3)] }
    ]
);

// Test Case 5: Empty table
const testCase5 = new LegalMovesTestCase(
    'Empty Table',
    'When table is empty, all cards should be discard moves',
    [],
    [card('coins', 7), card('cups', 3)],
    [
        { type: 'discard', card: card('coins', 7), captureCards: [] },
        { type: 'discard', card: card('cups', 3), captureCards: [] }
    ]
);

// Test Case 6: Single card capture rule
// If a single card can be captured, combinations should not be offered
const testCase6 = new LegalMovesTestCase(
    'Single Card Capture Rule',
    'If a direct match exists, combinations should not be offered',
    [card('coins', 5), card('cups', 2), card('swords', 3)],
    [card('clubs', 5)],
    [
        { type: 'capture', card: card('clubs', 5), captureCards: [card('coins', 5)] }
    ]
);

// Test Case 7: Multiple direct matches
const testCase7 = new LegalMovesTestCase(
    'Multiple Direct Matches',
    'Player should be able to choose which matching card to capture',
    [card('coins', 4), card('cups', 4), card('swords', 4)],
    [card('clubs', 4)],
    [
        { type: 'capture', card: card('clubs', 4), captureCards: [card('coins', 4)] },
        { type: 'capture', card: card('clubs', 4), captureCards: [card('cups', 4)] },
        { type: 'capture', card: card('clubs', 4), captureCards: [card('swords', 4)] }
    ]
);

// Test Case 8: Complex combinations
const testCase8 = new LegalMovesTestCase(
    'Complex Combinations',
    'Player should see all possible combinations up to 4 cards',
    [card('coins', 1), card('cups', 2), card('swords', 3), card('clubs', 4), card('coins', 2)],
    [card('cups', 10)],
    [
        { type: 'capture', card: card('cups', 10), captureCards: [card('coins', 1), card('cups', 2), card('swords', 3), card('clubs', 4)] },
        { type: 'capture', card: card('cups', 10), captureCards: [card('coins', 1), card('swords', 3), card('clubs', 4), card('coins', 2)] }
    ]
);

// Test Case 9: Edge case - 10 value cards
const testCase9 = new LegalMovesTestCase(
    'Face Card Values',
    'Face cards (8, 9, 10) should have correct capture behavior',
    [card('coins', 8), card('cups', 9), card('swords', 10)],
    [card('clubs', 8), card('clubs', 9), card('clubs', 10)],
    [
        { type: 'capture', card: card('clubs', 8), captureCards: [card('coins', 8)] },
        { type: 'capture', card: card('clubs', 9), captureCards: [card('cups', 9)] },
        { type: 'capture', card: card('clubs', 10), captureCards: [card('swords', 10)] }
    ]
);

// Test Case 10: Mix of direct and combinations
const testCase10 = new LegalMovesTestCase(
    'Mix of Direct and Combinations',
    'Cards can be both directly captured and part of combinations',
    [card('coins', 2), card('cups', 3), card('swords', 5)],
    [card('clubs', 5)],
    [
        { type: 'capture', card: card('clubs', 5), captureCards: [card('swords', 5)] }
    ]
);

// Run all test cases
console.log('========== LEGAL MOVES TEST SUITE ==========');

const testCases = [
    testCase1, testCase2, testCase3, testCase4, testCase5,
    testCase6, testCase7, testCase8, testCase9, testCase10
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach(testCase => {
    const passed = testCase.run();
    if (passed) {
        passedTests++;
    } else {
        failedTests++;
    }
});

console.log('\n========== TEST SUMMARY ==========');
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
