// Game model - contains core game logic and state

// Card definitions
const suits = ['coins', 'cups', 'swords', 'clubs'];
const suitSymbols = {
    coins: '🪙',
    cups: '🏆',
    swords: '⚔️',
    clubs: '🍀'
};

// Game state with initial values
const gameState = {
    deck: [],
    table: [],
    playerHand: [],
    aiHand: [],
    playerCaptures: [],
    aiCaptures: [],
    playerScopaCount: 0,
    aiScopaCount: 0,
    playerScore: 0,
    aiScore: 0,
    selectedCard: null,
    selectedTableCards: [],
    currentTurn: 'player', // 'player' or 'ai'
    gameOver: false,
    moveCount: 0
};

// Game analysis data
const gameAnalysis = {
    playerMoves: [],
    optimalMoves: 0,
    goodMoves: 0,
    mediocreMoves: 0,
    badMoves: 0,
    missedScopa: 0,
    missedSette: 0,
    captureRate: 0,
    moveCount: 0
};

// Reset game analysis
function resetGameAnalysis() {
    gameAnalysis.playerMoves = [];
    gameAnalysis.optimalMoves = 0;
    gameAnalysis.goodMoves = 0;
    gameAnalysis.mediocreMoves = 0;
    gameAnalysis.badMoves = 0;
    gameAnalysis.missedScopa = 0;
    gameAnalysis.missedSette = 0;
    gameAnalysis.captureRate = 0;
    gameAnalysis.moveCount = 0;
}

// Initialize game state
function initGameState() {
    // Reset game state
    gameState.deck = [];
    gameState.table = [];
    gameState.playerHand = [];
    gameState.aiHand = [];
    gameState.playerCaptures = [];
    gameState.aiCaptures = [];
    gameState.playerScopaCount = 0;
    gameState.aiScopaCount = 0;
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.selectedCard = null;
    gameState.selectedTableCards = [];
    gameState.currentTurn = 'player';
    gameState.gameOver = false;
    gameState.moveCount = 0;
    
    // Reset game analysis
    resetGameAnalysis();
    
    // Create and deal cards
    createDeck();
    shuffleDeck();
    dealInitialCards();
    
    return gameState;
}

// Create a deck of Scopa cards (40 cards: 1-10 in 4 suits)
function createDeck() {
    gameState.deck = [];
    for (const suit of suits) {
        for (let value = 1; value <= 10; value++) {
            gameState.deck.push({
                suit: suit,
                value: value,
                id: `${suit}-${value}`
            });
        }
    }
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck() {
    for (let i = gameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
    }
}

// Deal initial cards: 3 to each player and 4 to the table
function dealInitialCards() {
    // Deal to table first
    for (let i = 0; i < 4; i++) {
        gameState.table.push(gameState.deck.pop());
    }
    
    // Deal 3 cards to each player
    for (let i = 0; i < 3; i++) {
        gameState.playerHand.push(gameState.deck.pop());
        gameState.aiHand.push(gameState.deck.pop());
    }
}

// Deal new cards to players (3 each) when hands are empty
function dealNewHands() {
    if (gameState.deck.length > 0) {
        for (let i = 0; i < 3 && gameState.deck.length > 0; i++) {
            gameState.playerHand.push(gameState.deck.pop());
            if (gameState.deck.length > 0) {
                gameState.aiHand.push(gameState.deck.pop());
            }
        }
        return true;
    }
    return false;
}

// Find possible captures for a card
function findCaptures(card, tableCards) {
    const possibleCaptures = [];
    
    // Check for direct matches
    const directMatches = tableCards.filter(t => t.value === card.value);
    if (directMatches.length > 0) {
        directMatches.forEach(match => {
            possibleCaptures.push([match]);
        });
    }
    
// Find all combinations using a more comprehensive approach
// This recursive function finds all combinations of cards that sum to a target value
const findAllCombinations = (cards, targetValue, maxCards = 4) => {
    const results = [];
    
    // Helper function to find combinations
    const findCombination = (startIndex, currentSum, currentCombination) => {
        // If we found a valid combination
        if (currentSum === targetValue && currentCombination.length > 0) {
            results.push([...currentCombination]);
            return;
        }
        
        // If sum exceeds target or we've reached max cards, stop this branch
        if (currentSum > targetValue || currentCombination.length >= maxCards) {
            return;
        }
        
        // Try adding each remaining card to our combination
        for (let i = startIndex; i < cards.length; i++) {
            // Skip duplicates to avoid identical combinations
            if (i > startIndex && JSON.stringify(cards[i]) === JSON.stringify(cards[i-1])) continue;
            
            currentCombination.push(cards[i]);
            findCombination(i + 1, currentSum + cards[i].value, currentCombination);
            currentCombination.pop();
        }
    };
    
    // Sort cards to help with duplicate detection
    const sortedCards = [...cards].sort((a, b) => a.value - b.value);
    
    // Start recursive search
    findCombination(0, 0, []);
    return results;
};

// Check for combinations using the comprehensive algorithm
// Only find combinations of 2 or more cards
if (tableCards.length >= 2) {
    const combinations = findAllCombinations(tableCards, card.value);
    for (const combo of combinations) {
        if (combo.length >= 2) { // Only add combinations of 2+ cards
            possibleCaptures.push(combo);
        }
    }
}
    
    return possibleCaptures;
}

// Capture cards function
function captureCards(player, playedCard, capturedCards) {
    // Remove captured cards from table
    capturedCards.forEach(card => {
        const index = gameState.table.findIndex(c => c.id === card.id);
        if (index > -1) {
            gameState.table.splice(index, 1);
        }
    });
    
    // Add to player's captures
    if (player === 'player') {
        gameState.playerCaptures.push(playedCard, ...capturedCards);
    } else {
        gameState.aiCaptures.push(playedCard, ...capturedCards);
    }
    
    // Check for scopa
    if (gameState.table.length === 0) {
        if (player === 'player') {
            gameState.playerScopaCount++;
            return true; // Return true to indicate a scopa was scored
        } else {
            gameState.aiScopaCount++;
            return true;
        }
    }
    
    return false; // No scopa
}

/**
 * Get the current game state from the AI's perspective
 * This contains only information that would be available to the AI player
 * @returns {Object} AI's view of the game state
 */
function getAIGameState() {
    // Calculate outstanding cards (not in AI hand, not on table, not in capture piles)
    const outstandingCards = calculateOutstandingCards();
    
    return {
        tableCards: [...gameState.table],
        handCards: [...gameState.aiHand],
        captureCards: [...gameState.aiCaptures],
        opponentCaptureCards: [...gameState.playerCaptures],
        outstandingCards: outstandingCards
    };
}

/**
 * Calculate cards that are not visible to the AI
 * These could be in the deck or in the opponent's hand
 * @returns {Array} Array of cards not visible to the AI
 */
function calculateOutstandingCards() {
    const visibleCards = [
        ...gameState.table,
        ...gameState.aiHand,
        ...gameState.aiCaptures,
        ...gameState.playerCaptures
    ].map(card => card.id);
    
    // Create a full deck
    const allCards = [];
    for (const suit of suits) {
        for (let value = 1; value <= 10; value++) {
            allCards.push({
                suit: suit,
                value: value,
                id: `${suit}-${value}`
            });
        }
    }
    
    // Filter out visible cards
    return allCards.filter(card => !visibleCards.includes(card.id));
}

/**
 * Get player state for move analysis and AI recommendations
 * @param {Array} playerHand - The player's current hand
 * @param {Array} tableState - The current state of the table
 * @returns {Object} Player and table state for analysis
 */
function getPlayerAnalysisState(playerHand, tableState) {
    return {
        tableCards: [...tableState],
        handCards: [...playerHand],
        captureCards: [...gameState.playerCaptures],
        opponentCaptureCards: [...gameState.aiCaptures],
        outstandingCards: [] // Not needed for analysis
    };
}

/**
 * Execute a move for the specified player
 * @param {string} player - The player making the move ('player' or 'ai')
 * @param {Object} card - The card being played
 * @param {Array} tableCards - The table cards being captured (empty array for discard)
 * @returns {Object} Result of the move
 */
function executeMove(player, card, tableCards) {
    // Remove the played card from the player's hand
    const hand = player === 'player' ? gameState.playerHand : gameState.aiHand;
    const cardIndex = hand.findIndex(c => c.id === card.id);
    
    if (cardIndex === -1) return null;
    hand.splice(cardIndex, 1);
    
    gameState.moveCount++;
    let scopaScored = false;
    
    // Check if capturing or discarding
    if (tableCards.length > 0) {
        // Capture
        scopaScored = captureCards(player, card, tableCards);
    } else {
        // Discard to table
        gameState.table.push(card);
    }
    
    // Check if the round is over
    const roundOver = checkRoundEnd();
    
    // Switch turn
    gameState.currentTurn = player === 'player' ? 'ai' : 'player';
    
    // For player moves, record for analysis
    let moveData = null;
    if (player === 'player') {
        // Reset selections
        gameState.selectedCard = null;
        gameState.selectedTableCards = [];
    }
    
    return {
        action: tableCards.length > 0 ? 'capture' : 'discard',
        card: card,
        tableCards: tableCards,
        scopaScored,
        roundOver,
        moveData
    };
}

// Play a card from player's hand
function playPlayerCard(card, tableCards) {
    gameState.moveCount++;
    
    // Create a temp state to analyze all legal moves before we change the actual state
    const tempState = {
        table: [...gameState.table],
        playerHand: [...gameState.playerHand],
        aiHand: [] // Not needed for this function
    };
    
    // Find all legal moves available before making the move (for analysis)
    const legalMoves = findAllLegalMoves(tempState);
    
    // Extract possible captures for this card from the legal moves
    const legalMovesForCard = legalMoves.filter(move => move.card.id === card.id);
    const allPossibleCaptures = legalMovesForCard
        .filter(move => move.type === 'capture')
        .map(move => move.captureCards);
    
    // Remove the played card from hand
    const cardIndex = gameState.playerHand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return null;
    gameState.playerHand.splice(cardIndex, 1);
    
    // Get player analysis state for AI recommendation
    const playerAnalysisState = getPlayerAnalysisState(gameState.playerHand.concat([card]), gameState.table);
    
    // For AI recommendations, we need to get the legal moves for the temp state
    const playerLegalMoves = findAllLegalMoves(tempState, 'player');
    
    // We need this to be added in controller.js which has access to the ai module
    // This is a placeholder that will be updated later
    let aiRecommendation = null;
    
    // Record this move for analysis
    const moveData = recordPlayerMove(card, tableCards, allPossibleCaptures, aiRecommendation);
    
    let scopaScored = false;
    
    // Check if we're capturing or discarding
    if (tableCards.length > 0) {
        // Capture
        scopaScored = captureCards('player', card, tableCards);
    } else {
        // Discard to table
        gameState.table.push(card);
    }
    
    // Reset selections
    gameState.selectedCard = null;
    gameState.selectedTableCards = [];
    
    // Check if the round is over
    const roundOver = checkRoundEnd();
    
    // Switch turn to AI
    gameState.currentTurn = 'ai';
    
    return {
        action: tableCards.length > 0 ? 'capture' : 'discard',
        scopaScored,
        roundOver,
        moveData
    };
}

// Check if the round is over and handle end-of-round actions
function checkRoundEnd() {
    if (gameState.playerHand.length === 0 && gameState.aiHand.length === 0) {
        if (gameState.deck.length > 0) {
            // Deal new hands
            dealNewHands();
            return true;
        } else {
            // Last player to capture gets remaining table cards
            if (gameState.table.length > 0) {
                const lastPlayer = gameState.currentTurn;
                if (lastPlayer === 'player') {
                    gameState.playerCaptures.push(...gameState.table);
                } else {
                    gameState.aiCaptures.push(...gameState.table);
                }
                gameState.table = [];
            }
            
            // Game is over, calculate final scores
            calculateFinalScores();
            return true;
        }
    }
    
    return false;
}

// Record player move for analysis
function recordPlayerMove(card, tableCards, possibleCaptures, aiRecommendation) {
    // Don't record if game is over
    if (gameState.gameOver) return null;
    
    const move = {
        moveNumber: gameState.moveCount,
        card: card,
        action: tableCards.length > 0 ? 'capture' : 'discard',
        capturedCards: [...tableCards],
        allPossibleCaptures: possibleCaptures,
        tableState: JSON.parse(JSON.stringify(gameState.table)),
        playerHand: JSON.parse(JSON.stringify(gameState.playerHand.concat([card]))),
        wasOptimal: false,
        rating: '',
        reason: '',
        aiRecommendation: aiRecommendation
    };
    
    // Analyze if this was optimal
    analyzePlayerMove(move);
    
    // Add to analysis
    gameAnalysis.playerMoves.push(move);
    gameAnalysis.moveCount++;
    
    return move;
}

// Analyze if a player move was optimal
function analyzePlayerMove(move) {
    // Case 1: Player captured cards
    if (move.action === 'capture') {
        // Check if this would clear the table (scopa)
        const wouldClearTable = move.capturedCards.length === move.tableState.length;
        if (wouldClearTable) {
            move.wasOptimal = true;
            move.rating = 'good';
            move.reason = 'Perfect! You earned a Scopa by clearing the table!';
            gameAnalysis.optimalMoves++;
            return;
        }
        
        // Check if captured setteBello
        const capturedSette = move.capturedCards.some(c => c.suit === 'coins' && c.value === 7);
        if (capturedSette) {
            move.wasOptimal = true;
            move.rating = 'good';
            move.reason = 'Excellent! You captured the valuable 7 of coins (Sette Bello)!';
            gameAnalysis.optimalMoves++;
            return;
        }
        
        // Check if captured high-value primera cards
        const highValueCapture = move.capturedCards.some(c => c.value === 7 || c.value === 6 || c.value === 1);
        if (highValueCapture) {
            move.wasOptimal = true;
            move.rating = 'good';
            move.reason = 'Good move! You captured valuable cards for Primera scoring.';
            gameAnalysis.goodMoves++;
            return;
        }
        
        // Default for captures - at least decent
        move.rating = 'mediocre';
        move.reason = 'Decent move. You made a capture, which is generally good.';
        gameAnalysis.mediocreMoves++;
        return;
    }
    
    // Case 2: Player discarded
    if (move.allPossibleCaptures.length > 0) {
        // Missed capture opportunity
        move.rating = 'bad';
        move.reason = 'Poor move. You missed a capture opportunity.';
        gameAnalysis.badMoves++;
        
        // Check if missed scopa
        const missedScopa = move.allPossibleCaptures.some(capCards => 
            capCards.length === move.tableState.length);
        if (missedScopa) {
            move.rating = 'bad';
            move.reason = 'Bad move! You missed a Scopa opportunity!';
            gameAnalysis.missedScopa++;
        }
        
        // Check if missed setteBello
        const setteBelloOnTable = move.tableState.some(c => c.suit === 'coins' && c.value === 7);
        const couldCaptureSette = setteBelloOnTable && move.allPossibleCaptures.some(capCards => 
            capCards.some(c => c.suit === 'coins' && c.value === 7));
        if (couldCaptureSette) {
            move.rating = 'bad';
            move.reason = 'Bad move! You missed capturing the 7 of coins!';
            gameAnalysis.missedSette++;
        }
        
        return;
    }
    
    // Strategic discard (no capture possible)
    // Compare with AI recommendation
    if (move.aiRecommendation && move.aiRecommendation.tableCards.length === 0 && 
        move.card.id === move.aiRecommendation.card.id) {
        // Match with AI's recommendation for discard
        move.rating = 'mediocre';
        move.reason = 'Good strategic discard. No captures were possible, and this discard minimizes risk.';
        gameAnalysis.mediocreMoves++;
    } else {
        move.rating = 'mediocre';
        move.reason = 'Acceptable move. No captures were possible, so you had to discard.';
        gameAnalysis.mediocreMoves++;
    }
}

// Calculate final scores
function calculateFinalScores() {
    gameState.gameOver = true;
    
    // Calculate points for most cards
    const playerCardCount = gameState.playerCaptures.length;
    const aiCardCount = gameState.aiCaptures.length;
    
    if (playerCardCount > aiCardCount) {
        gameState.playerScore += 1;
    } else if (aiCardCount > playerCardCount) {
        gameState.aiScore += 1;
    }
    
    // Points for most coins
    const playerCoins = gameState.playerCaptures.filter(card => card.suit === 'coins').length;
    const aiCoins = gameState.aiCaptures.filter(card => card.suit === 'coins').length;
    
    if (playerCoins > aiCoins) {
        gameState.playerScore += 1;
    } else if (aiCoins > playerCoins) {
        gameState.aiScore += 1;
    }
    
    // Points for sette bello (7 of coins)
    const playerHasSette = gameState.playerCaptures.some(card => card.suit === 'coins' && card.value === 7);
    const aiHasSette = gameState.aiCaptures.some(card => card.suit === 'coins' && card.value === 7);
    
    if (playerHasSette) {
        gameState.playerScore += 1;
    } else if (aiHasSette) {
        gameState.aiScore += 1;
    }
    
    // Points for primera (highest value card in each suit)
    const primeraPoints = getPrimeraPoints();
    if (primeraPoints.player > primeraPoints.ai) {
        gameState.playerScore += 1;
    } else if (primeraPoints.ai > primeraPoints.player) {
        gameState.aiScore += 1;
    }
    
    // Add points for scopas
    gameState.playerScore += gameState.playerScopaCount;
    gameState.aiScore += gameState.aiScopaCount;
    
    // Calculate final game analysis stats
    calculateAnalysisStats();
    
    return {
        playerScore: gameState.playerScore,
        aiScore: gameState.aiScore,
        playerCardCount,
        aiCardCount,
        playerCoins,
        aiCoins,
        playerHasSette,
        aiHasSette,
        primeraPoints,
        playerScopaCount: gameState.playerScopaCount,
        aiScopaCount: gameState.aiScopaCount
    };
}

// Calculate primera points (highest card in each suit)
function getPrimeraPoints() {
    const primeraValues = {
        7: 21,
        6: 18,
        1: 16,
        5: 15,
        4: 14,
        3: 13,
        2: 12,
        8: 10,
        9: 10,
        10: 10
    };
    
    const playerSuitValues = {};
    const aiSuitValues = {};
    
    // Initialize with 0
    for (const suit of suits) {
        playerSuitValues[suit] = 0;
        aiSuitValues[suit] = 0;
    }
    
    // Find highest value card in each suit for player
    for (const card of gameState.playerCaptures) {
        const currentValue = primeraValues[card.value] || 0;
        if (currentValue > playerSuitValues[card.suit]) {
            playerSuitValues[card.suit] = currentValue;
        }
    }
    
    // Find highest value card in each suit for AI
    for (const card of gameState.aiCaptures) {
        const currentValue = primeraValues[card.value] || 0;
        if (currentValue > aiSuitValues[card.suit]) {
            aiSuitValues[card.suit] = currentValue;
        }
    }
    
    // Sum up the values
    const playerTotal = Object.values(playerSuitValues).reduce((a, b) => a + b, 0);
    const aiTotal = Object.values(aiSuitValues).reduce((a, b) => a + b, 0);
    
    return { player: playerTotal, ai: aiTotal };
}

// Calculate final stats for the game analysis
function calculateAnalysisStats() {
    // Calculate capture rate
    const totalMoves = gameAnalysis.playerMoves.length;
    const captures = gameAnalysis.playerMoves.filter(m => m.action === 'capture').length;
    gameAnalysis.captureRate = totalMoves > 0 ? (captures / totalMoves) * 100 : 0;
}

// Generate game analysis summary
function generateGameAnalysis() {
    // Calculate capture rate
    const totalMoves = gameAnalysis.playerMoves.length;
    const captures = gameAnalysis.playerMoves.filter(m => m.action === 'capture').length;
    gameAnalysis.captureRate = totalMoves > 0 ? (captures / totalMoves) * 100 : 0;
    
    // Generate summary text
    let analysisText = '--- GAME ANALYSIS ---\n\n';
    
    // Overall rating
    let overallRating = 'Average';
    if (gameAnalysis.optimalMoves > totalMoves * 0.6) {
        overallRating = 'Excellent';
    } else if (gameAnalysis.optimalMoves + gameAnalysis.goodMoves > totalMoves * 0.7) {
        overallRating = 'Very Good';
    } else if (gameAnalysis.badMoves > totalMoves * 0.4) {
        overallRating = 'Needs Improvement';
    } else if (gameAnalysis.badMoves > totalMoves * 0.6 || gameAnalysis.missedScopa > 2) {
        overallRating = 'Poor';
    }
    
    analysisText += `Overall performance: ${overallRating}\n\n`;
    
    // Move quality breakdown
    analysisText += `Move Quality Breakdown:\n`;
    analysisText += `Optimal moves: ${gameAnalysis.optimalMoves}\n`;
    analysisText += `Good moves: ${gameAnalysis.goodMoves}\n`;
    analysisText += `Mediocre moves: ${gameAnalysis.mediocreMoves}\n`;
    analysisText += `Bad moves: ${gameAnalysis.badMoves}\n\n`;
    
    // Strategic observations
    analysisText += `Strategic Observations:\n`;
    analysisText += `- Capture rate: ${gameAnalysis.captureRate.toFixed(1)}%\n`;
    if (gameAnalysis.missedScopa > 0) {
        analysisText += `- Missed Scopa opportunities: ${gameAnalysis.missedScopa}\n`;
    }
    if (gameAnalysis.missedSette > 0) {
        analysisText += `- Missed opportunity to capture the valuable 7 of coins: ${gameAnalysis.missedSette} times\n`;
    }
    
    // Tips based on play
    analysisText += `\nTips for Improvement:\n`;
    if (gameAnalysis.missedScopa > 0) {
        analysisText += `- Pay closer attention to opportunities to clear the table\n`;
    }
    if (gameAnalysis.missedSette > 0) {
        analysisText += `- Prioritize capturing the 7 of coins when possible\n`;
    }
    if (gameAnalysis.badMoves > totalMoves * 0.3) {
        analysisText += `- Review the possible captures before making your move\n`;
    }
    if (gameAnalysis.captureRate < 50) {
        analysisText += `- Try to capture more often than discarding\n`;
    }
    
    return analysisText;
}

// Find all legal moves for a given game state
function findAllLegalMoves(state, player = 'player') {
    const legalMoves = [];
    const hand = player === 'player' ? state.playerHand : state.aiHand;
    
    // For each card in the player's hand
    for (const card of hand) {
        // Find all possible captures
        const possibleCaptures = findCaptures(card, state.table);
        
        if (possibleCaptures.length > 0) {
            // Check for direct matches (single card captures)
            const directMatches = possibleCaptures.filter(capture => 
                capture.length === 1 && capture[0].value === card.value
            );
            
            // Apply Scopa rule: if direct matches exist, only allow those
            // (no combinations allowed when a direct match is available)
            const allowedCaptures = directMatches.length > 0 ? directMatches : possibleCaptures;
            
            // For each valid capture, add a capture move
            allowedCaptures.forEach(captureCards => {
                legalMoves.push({
                    type: 'capture',
                    card: card,
                    captureCards: captureCards,
                    description: `Play ${card.value} of ${card.suit} to capture ${captureCards.map(c => `${c.value} of ${c.suit}`).join(', ')}`
                });
            });
        } else {
            // If no captures possible, add a discard move
            legalMoves.push({
                type: 'discard',
                card: card,
                captureCards: [],
                description: `Play ${card.value} of ${card.suit} to the table (discard)`
            });
        }
    }
    
    return legalMoves;
}

// Export all the necessary functions and objects
export {
    suits,
    suitSymbols,
    gameState,
    gameAnalysis,
    initGameState,
    dealNewHands,
    findCaptures,
    findAllLegalMoves,
    playPlayerCard,
    executeMove,
    getAIGameState,
    getPlayerAnalysisState,
    generateGameAnalysis
};
