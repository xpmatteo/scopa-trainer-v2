// Main - initializes the game and sets up event listeners

import * as model from './model.js';
import * as controller from './controller.js';

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize controller
    controller.setup();
    
    // Add event listeners
    setupEventListeners();
    
    // Start the game
    controller.initGame();
});

// Set up event listeners for buttons and game interactions
function setupEventListeners() {
    // New game button
    document.getElementById('new-game-btn').addEventListener('click', function() {
        controller.initGame();
    });
    
    // Help button
    document.getElementById('help-btn').addEventListener('click', function() {
        alert(`Scopa Rules:
            
1. Goal: Earn the most points by capturing cards from the table.
2. Gameplay: On your turn, you can either capture card(s) or discard a card.
3. Capturing: You can capture one or more cards if their sum equals your played card's value.
4. Scopa: If you clear all cards from the table, you earn a scopa point.
5. Scoring:
- Most cards: 1 point
- Most coins: 1 point
- 7 of coins (Sette Bello): 1 point
- Primera (highest value in each suit): 1 point
- Each scopa: 1 point

Special card values for Primera: 7=21, 6=18, 1=16, 5=15, 4=14, 3=13, 2=12, 8,9,10=10`);
    });
    
    // Play again button
    document.getElementById('play-again-btn').addEventListener('click', function() {
        document.getElementById('game-over-modal').style.display = 'none';
        controller.initGame();
    });
    
    // Move replay navigation
    let currentMoveIndex = 0;
    
    document.getElementById('prev-move-btn').addEventListener('click', function() {
        if (currentMoveIndex > 0) {
            currentMoveIndex--;
            controller.displayMoveAtIndex(currentMoveIndex);
        }
    });
    
    document.getElementById('next-move-btn').addEventListener('click', function() {
        if (currentMoveIndex < model.gameAnalysis.playerMoves.length - 1) {
            currentMoveIndex++;
            controller.displayMoveAtIndex(currentMoveIndex);
        }
    });
}
