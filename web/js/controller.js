// Controller - handles interactions between model and UI

import * as model from './model.js';

// DOM elements - will be initialized in setup function
let tableEl;
let playerHandEl;
let aiHandEl;
let messageEl;
let deckCountEl;
let playerScoreEl;
let aiScoreEl;
let playerCapturesEl;
let aiCapturesEl;
let playerScopaEl;
let aiScopaEl;
let gameOverModal;
let gameResultEl;
let finalScoreEl;
let prevMoveBtn;
let nextMoveBtn;
let moveCounterEl;
let moveDisplayEl;

// Replay state
let currentMoveIndex = 0;

// Setup controller
function setup() {
    // Initialize DOM elements
    tableEl = document.querySelector('.table');
    playerHandEl = document.querySelector('.player-hand');
    aiHandEl = document.querySelector('.ai-hand');
    messageEl = document.getElementById('message');
    deckCountEl = document.getElementById('deck-count');
    playerScoreEl = document.getElementById('player-score');
    aiScoreEl = document.getElementById('ai-score');
    playerCapturesEl = document.getElementById('player-captures');
    aiCapturesEl = document.getElementById('ai-captures');
    playerScopaEl = document.getElementById('player-scopa');
    aiScopaEl = document.getElementById('ai-scopa');
    gameOverModal = document.getElementById('game-over-modal');
    gameResultEl = document.getElementById('game-result');
    finalScoreEl = document.getElementById('final-score');
    prevMoveBtn = document.getElementById('prev-move-btn');
    nextMoveBtn = document.getElementById('next-move-btn');
    moveCounterEl = document.getElementById('move-counter');
    moveDisplayEl = document.getElementById('move-display');
}

// Initialize game
function initGame() {
    model.initGameState();
    renderGame();
    updateScores();
    messageEl.textContent = 'Game started! Your turn to play.';
    updateDeckCount();
}

// Update deck count display
function updateDeckCount() {
    deckCountEl.textContent = `Cards in deck: ${model.gameState.deck.length}`;
}

// Update scores display
function updateScores() {
    playerScoreEl.textContent = model.gameState.playerScore;
    aiScoreEl.textContent = model.gameState.aiScore;
    playerCapturesEl.textContent = `Captures: ${model.gameState.playerCaptures.length}`;
    aiCapturesEl.textContent = `Captures: ${model.gameState.aiCaptures.length}`;
    playerScopaEl.textContent = `Scopa: ${model.gameState.playerScopaCount}`;
    aiScopaEl.textContent = `Scopa: ${model.gameState.aiScopaCount}`;
}

// Render the game state
function renderGame() {
    renderTable();
    renderPlayerHand();
    renderAIHand();
}

// Render table cards
function renderTable() {
    // Clear existing cards but keep label
    const label = tableEl.querySelector('.hand-label');
    tableEl.innerHTML = '';
    tableEl.appendChild(label);
    
    model.gameState.table.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('click', function() {
            handleTableCardClick(card);
        });
        
        if (model.gameState.selectedTableCards.some(c => c.id === card.id)) {
            cardEl.classList.add('selected');
        }
        
        tableEl.appendChild(cardEl);
    });
}

// Render player's hand
function renderPlayerHand() {
    // Clear existing cards but keep label
    const label = playerHandEl.querySelector('.hand-label');
    playerHandEl.innerHTML = '';
    playerHandEl.appendChild(label);
    
    model.gameState.playerHand.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('click', function() {
            handlePlayerCardClick(card);
        });
        
        if (model.gameState.selectedCard && model.gameState.selectedCard.id === card.id) {
            cardEl.classList.add('selected');
        }
        
        playerHandEl.appendChild(cardEl);
    });
}

// Render AI's hand (face down)
function renderAIHand() {
    // Clear existing cards but keep label
    const label = aiHandEl.querySelector('.hand-label');
    aiHandEl.innerHTML = '';
    aiHandEl.appendChild(label);
    
    model.gameState.aiHand.forEach(() => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-back';
        aiHandEl.appendChild(cardEl);
    });
}

// Create a card element
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.suit}`;
    cardEl.dataset.cardId = card.id;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'card-value';
    valueEl.textContent = card.value;
    
    const suitEl = document.createElement('div');
    suitEl.className = 'card-suit';
    suitEl.textContent = model.suitSymbols[card.suit];
    
    cardEl.appendChild(valueEl);
    cardEl.appendChild(suitEl);
    
    return cardEl;
}

// Create a small card element for replay visualization
function createSmallCardElement(card, highlight = false) {
    const cardEl = document.createElement('div');
    cardEl.className = `small-card ${card.suit}`;
    if (highlight) {
        cardEl.classList.add('highlight-card');
    }
    
    const valueEl = document.createElement('div');
    valueEl.className = 'card-value';
    valueEl.textContent = card.value;
    
    const suitEl = document.createElement('div');
    suitEl.className = 'card-suit';
    suitEl.textContent = model.suitSymbols[card.suit];
    
    cardEl.appendChild(valueEl);
    cardEl.appendChild(suitEl);
    
    return cardEl;
}

// Handle player card click
function handlePlayerCardClick(card) {
    if (model.gameState.currentTurn !== 'player' || model.gameState.gameOver) return;
    
    // Deselect if the same card is clicked again
    if (model.gameState.selectedCard && model.gameState.selectedCard.id === card.id) {
        // If there are no possible captures, discard the card to the table
        if (model.findCaptures(card, model.gameState.table).length === 0) {
            playCard(card, []);
            return;
        }
        
        model.gameState.selectedCard = null;
        model.gameState.selectedTableCards = [];
        renderGame();
        messageEl.textContent = 'Select a card to play.';
        return;
    }
    
    // Select the card
    model.gameState.selectedCard = card;
    model.gameState.selectedTableCards = [];
    
    // Find possible captures
    const possibleCaptures = model.findCaptures(card, model.gameState.table);
    
    renderGame();
    
    if (possibleCaptures.length > 0) {
        messageEl.textContent = 'Select table card(s) to capture or select a different hand card.';
    } else {
        messageEl.textContent = 'No captures possible with this card. Click again to discard to table.';
    }
}

// Handle table card click
function handleTableCardClick(card) {
    if (model.gameState.currentTurn !== 'player' || !model.gameState.selectedCard || model.gameState.gameOver) return;
    
    const selectedIndex = model.gameState.selectedTableCards.findIndex(c => c.id === card.id);
    
    if (selectedIndex > -1) {
        // Deselect the card
        model.gameState.selectedTableCards.splice(selectedIndex, 1);
    } else {
        // Select the card
        model.gameState.selectedTableCards.push(card);
    }
    
    renderTable();
    
    // Calculate sum of selected table cards
    const sumOfSelected = model.gameState.selectedTableCards.reduce((sum, c) => sum + c.value, 0);
    
    if (sumOfSelected === model.gameState.selectedCard.value) {
        // Perform the capture
        playCard(model.gameState.selectedCard, model.gameState.selectedTableCards);
    } else if (sumOfSelected > model.gameState.selectedCard.value) {
        messageEl.textContent = 'Sum exceeds your card value. Deselect some cards.';
    } else if (model.gameState.selectedTableCards.length > 0) {
        messageEl.textContent = `Sum: ${sumOfSelected}. Select more cards or deselect to try different combination.`;
    } else {
        messageEl.textContent = 'Select card(s) to capture or select a different hand card.';
    }
}

// Play a card from hand
function playCard(card, tableCards) {
    const result = model.playPlayerCard(card, tableCards);
    if (!result) return;
    
    if (result.action === 'capture') {
        if (result.scopaScored) {
            messageEl.textContent = 'SCOPA! You cleared the table.';
        } else {
            messageEl.textContent = 'Cards captured!';
        }
    } else {
        messageEl.textContent = 'Card discarded to table.';
    }
    
    // Update UI
    renderGame();
    updateScores();
    
    // Check if the game is over
    if (model.gameState.gameOver) {
        showGameOverModal();
        return;
    }
    
    // If round is over, deal new hands
    if (result.roundOver) {
        renderGame();
    }
    
    // Execute AI turn after a delay
    setTimeout(aiTurn, 1000);
}

// AI turn logic
function aiTurn() {
    if (model.gameState.currentTurn !== 'ai' || model.gameState.gameOver) return;
    
    messageEl.textContent = 'AI is thinking...';
    
    setTimeout(() => {
        const result = model.executeAITurn();
        
        if (result) {
            // Show the card being played
            const tempCardEl = createCardElement(result.card);
            tempCardEl.style.position = 'absolute';
            tempCardEl.style.top = '50%';
            tempCardEl.style.left = '50%';
            tempCardEl.style.transform = 'translate(-50%, -50%)';
            tempCardEl.style.zIndex = '10';
            aiHandEl.appendChild(tempCardEl);
            
            setTimeout(() => {
                // Remove the temporary card
                tempCardEl.remove();
                
                if (result.action === 'capture') {
                    if (result.scopaScored) {
                        messageEl.textContent = 'AI got a SCOPA!';
                    } else {
                        messageEl.textContent = `AI captures with ${result.card.value} of ${result.card.suit}.`;
                    }
                } else {
                    messageEl.textContent = `AI discards ${result.card.value} of ${result.card.suit} to table.`;
                }
                
                // Update the UI
                renderGame();
                updateScores();
                
                // Check if the game is over
                if (model.gameState.gameOver) {
                    showGameOverModal();
                    return;
                }
                
                // If round is over, deal new hands
                if (result.roundOver) {
                    renderGame();
                }
                
                messageEl.textContent = 'Your turn to play.';
            }, 1000);
        }
    }, 1000);
}

// Display move at specified index for the replay analysis
function displayMoveAtIndex(index) {
    const move = model.gameAnalysis.playerMoves[index];
    if (!move) return;
    
    // Update move counter
    moveCounterEl.textContent = `Move ${index + 1} of ${model.gameAnalysis.playerMoves.length}`;
    
    // Create move display
    const moveDisplay = document.createElement('div');
    
    // Add move number
    const moveNumber = document.createElement('div');
    moveNumber.className = 'move-number';
    moveNumber.textContent = `Move ${move.moveNumber}`;
    moveDisplay.appendChild(moveNumber);
    
    // Create visualization of the move
    const visualization = document.createElement('div');
    visualization.className = 'replay-visualization';
    
    // Player's hand section
    const handSection = document.createElement('div');
    handSection.className = 'replay-section';
    const handTitle = document.createElement('div');
    handTitle.className = 'section-title';
    handTitle.textContent = 'Your Hand';
    handSection.appendChild(handTitle);
    
    // Add player's hand cards
    move.playerHand.forEach(card => {
        const isPlayedCard = card.id === move.card.id;
        const cardEl = createSmallCardElement(card, isPlayedCard);
        handSection.appendChild(cardEl);
    });
    
    // Table section
    const tableSection = document.createElement('div');
    tableSection.className = 'replay-section';
    const tableTitle = document.createElement('div');
    tableTitle.className = 'section-title';
    tableTitle.textContent = 'Table';
    tableSection.appendChild(tableTitle);
    
    // Add table cards
    move.tableState.forEach(card => {
        const isSelected = move.capturedCards.some(c => c.id === card.id);
        const cardEl = createSmallCardElement(card, isSelected);
        tableSection.appendChild(cardEl);
    });
    
    // Add sections to visualization
    visualization.appendChild(handSection);
    visualization.appendChild(tableSection);
    moveDisplay.appendChild(visualization);
    
    // Add move description
    const moveDesc = document.createElement('div');
    moveDesc.className = 'move-description';
    if (move.action === 'capture') {
        moveDesc.innerHTML = `You played the <strong>${move.card.value} of ${move.card.suit}</strong> and captured ${move.capturedCards.length} card(s): ${move.capturedCards.map(c => `${c.value} of ${c.suit}`).join(', ')}.`;
    } else {
        moveDesc.innerHTML = `You played the <strong>${move.card.value} of ${move.card.suit}</strong> and discarded it to the table.`;
    }
    moveDisplay.appendChild(moveDesc);
    
    // Add move evaluation
    const moveEval = document.createElement('div');
    moveEval.className = `move-evaluation ${move.rating}`;
    moveEval.innerHTML = `<strong>Evaluation:</strong> ${move.reason}`;
    moveDisplay.appendChild(moveEval);
    
    // Add AI recommendation if it differs from player's move
    const aiRec = move.aiRecommendation;
    if (aiRec) {
        const aiMatch = aiRec.card.id === move.card.id && 
                       aiRec.tableCards.length === move.capturedCards.length &&
                       aiRec.tableCards.every(card => move.capturedCards.some(c => c.id === card.id));
        
        if (!aiMatch) {
            const aiAlt = document.createElement('div');
            aiAlt.className = 'ai-alternative';
            
            let aiMoveText = '';
            if (aiRec.tableCards.length > 0) {
                aiMoveText = `The AI would have played the <strong>${aiRec.card.value} of ${aiRec.card.suit}</strong> to capture: ${aiRec.tableCards.map(c => `${c.value} of ${c.suit}`).join(', ')}.`;
            } else {
                aiMoveText = `The AI would have discarded the <strong>${aiRec.card.value} of ${aiRec.card.suit}</strong>.`;
            }
            
            aiAlt.innerHTML = `<strong>AI's recommendation:</strong> ${aiMoveText}<br><em>Reasoning: ${aiRec.reasoning}</em>`;
            moveDisplay.appendChild(aiAlt);
        }
    }
    
    // Replace current display
    moveDisplayEl.innerHTML = '';
    moveDisplayEl.appendChild(moveDisplay);
    
    // Update button states
    prevMoveBtn.disabled = index === 0;
    nextMoveBtn.disabled = index === model.gameAnalysis.playerMoves.length - 1;
}

// Show game over modal with analysis
function showGameOverModal() {
    // Determine winner
    let resultText;
    if (model.gameState.playerScore > model.gameState.aiScore) {
        resultText = 'You Win!';
    } else if (model.gameState.aiScore > model.gameState.playerScore) {
        resultText = 'AI Wins!';
    } else {
        resultText = 'It\'s a Tie!';
    }
    
    // Generate analysis
    const analysis = model.generateGameAnalysis();
    
    gameResultEl.textContent = resultText;
    finalScoreEl.innerHTML = `Final Score: You ${model.gameState.playerScore} - ${model.gameState.aiScore} AI<br><br>
        <div style="text-align:left; font-size:14px; white-space:pre-wrap;">${analysis}</div>`;
    
    // Setup move replay
    if (model.gameAnalysis.playerMoves.length > 0) {
        currentMoveIndex = 0;
        displayMoveAtIndex(currentMoveIndex);
        moveCounterEl.textContent = `Move 1 of ${model.gameAnalysis.playerMoves.length}`;
        
        // Enable/disable navigation buttons
        prevMoveBtn.disabled = true;
        nextMoveBtn.disabled = model.gameAnalysis.playerMoves.length <= 1;
    }
    
    gameOverModal.style.display = 'flex';
}

export {
    setup,
    initGame,
    renderGame,
    updateScores,
    handlePlayerCardClick,
    handleTableCardClick,
    aiTurn,
    displayMoveAtIndex,
    showGameOverModal
};
