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
    
    // Check for combinations (simplified algorithm - not exhaustive)
    for (let i = 0; i < tableCards.length; i++) {
        for (let j = i + 1; j < tableCards.length; j++) {
            if (tableCards[i].value + tableCards[j].value === card.value) {
                possibleCaptures.push([tableCards[i], tableCards[j]]);
            }
            
            // Try 3-card combinations
            for (let k = j + 1; k < tableCards.length; k++) {
                if (tableCards[i].value + tableCards[j].value + tableCards[k].value === card.value) {
                    possibleCaptures.push([tableCards[i], tableCards[j], tableCards[k]]);
                }
                
                // Try 4-card combinations (not common but possible)
                for (let l = k + 1; l < tableCards.length; l++) {
                    if (tableCards[i].value + tableCards[j].value + tableCards[k].value + tableCards[l].value === card.value) {
                        possibleCaptures.push([tableCards[i], tableCards[j], tableCards[k], tableCards[l]]);
                    }
                }
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

// Play a card from player's hand
function playPlayerCard(card, tableCards) {
    gameState.moveCount++;
    
    // Find all possible captures before making the move (for analysis)
    const allPossibleCaptures = findCaptures(card, gameState.table);
    
    // Remove the played card from hand
    const cardIndex = gameState.playerHand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return null;
    gameState.playerHand.splice(cardIndex, 1);
    
    // Find what the AI would have done
    const aiRecommendation = computeAIRecommendation(gameState.playerHand.concat([card]), gameState.table);
    
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

// Execute AI turn
function executeAITurn() {
    if (gameState.currentTurn !== 'ai' || gameState.gameOver) return null;
    
    // Find the best move
    const bestMove = findBestAIMove();
    
    if (bestMove) {
        const { card, tableCards } = bestMove;
        
        // Remove card from AI's hand
        const cardIndex = gameState.aiHand.findIndex(c => c.id === card.id);
        gameState.aiHand.splice(cardIndex, 1);
        
        let scopaScored = false;
        
        if (tableCards.length > 0) {
            // Capture
            scopaScored = captureCards('ai', card, tableCards);
        } else {
            // Discard
            gameState.table.push(card);
        }
        
        // Check if the round is over
        const roundOver = checkRoundEnd();
        
        // Switch turn to player
        gameState.currentTurn = 'player';
        
        return {
            card,
            tableCards,
            action: tableCards.length > 0 ? 'capture' : 'discard',
            scopaScored,
            roundOver
        };
    }
    
    return null;
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

// Find the best move for the AI
function findBestAIMove() {
    // Priority 1: Find any capture that would result in a scopa
    for (const card of gameState.aiHand) {
        const possibleCaptures = findCaptures(card, gameState.table);
        
        for (const capture of possibleCaptures) {
            if (capture.length === gameState.table.length) {
                return { card, tableCards: capture };
            }
        }
    }
    
    // Priority 2: Capture the 7 of coins if possible
    const setteBello = gameState.table.find(card => card.suit === 'coins' && card.value === 7);
    if (setteBello) {
        for (const card of gameState.aiHand) {
            const possibleCaptures = findCaptures(card, gameState.table);
            
            for (const capture of possibleCaptures) {
                if (capture.some(c => c.suit === 'coins' && c.value === 7)) {
                    return { card, tableCards: capture };
                }
            }
        }
    }
    
    // Priority 3: Capture as many cards as possible
    let bestCapture = null;
    let mostCards = 0;
    
    for (const card of gameState.aiHand) {
        const possibleCaptures = findCaptures(card, gameState.table);
        
        for (const capture of possibleCaptures) {
            if (capture.length > mostCards) {
                mostCards = capture.length;
                bestCapture = { card, tableCards: capture };
            }
        }
    }
    
    if (bestCapture) {
        return bestCapture;
    }
    
    // Priority 4: Discard a card that doesn't help the player
    const aiCard = gameState.aiHand[Math.floor(Math.random() * gameState.aiHand.length)];
    return { card: aiCard, tableCards: [] };
}

// Compute what the AI would recommend for the player
function computeAIRecommendation(playerHand, tableState) {
    // Same logic as findBestAIMove but applied to player's hand
    let recommendation = null;
    
    // Priority 1: Find any capture that would result in a scopa
    for (const card of playerHand) {
        const possibleCaptures = findCaptures(card, tableState);
        
        for (const capture of possibleCaptures) {
            if (capture.length === tableState.length) {
                return { 
                    card, 
                    tableCards: capture,
                    reasoning: "This creates a scopa by clearing the table",
                    priority: "Highest"
                };
            }
        }
    }
    
    // Priority 2: Capture the 7 of coins if possible
    const setteBello = tableState.find(card => card.suit === 'coins' && card.value === 7);
    if (setteBello) {
        for (const card of playerHand) {
            const possibleCaptures = findCaptures(card, tableState);
            
            for (const capture of possibleCaptures) {
                if (capture.some(c => c.suit === 'coins' && c.value === 7)) {
                    return { 
                        card, 
                        tableCards: capture,
                        reasoning: "This captures the valuable 7 of coins (Sette Bello)",
                        priority: "High"
                    };
                }
            }
        }
    }
    
    // Priority 3: Capture as many coins as possible
    let bestCoinsCapture = null;
    let mostCoins = 0;
    
    for (const card of playerHand) {
        const possibleCaptures = findCaptures(card, tableState);
        
        for (const capture of possibleCaptures) {
            const coinCount = capture.filter(c => c.suit === 'coins').length;
            if (coinCount > mostCoins) {
                mostCoins = coinCount;
                bestCoinsCapture = { 
                    card, 
                    tableCards: capture,
                    reasoning: `This captures ${coinCount} coin cards, helping secure the 'most coins' point`,
                    priority: "Medium-High"
                };
            }
        }
    }
    
    if (bestCoinsCapture && mostCoins > 0) {
        return bestCoinsCapture;
    }
    
    // Priority 4: Capture high-value primera cards
    const primeraCards = tableState.filter(c => c.value === 7 || c.value === 6 || c.value === 1 || c.value === 5);
    if (primeraCards.length > 0) {
        for (const card of playerHand) {
            const possibleCaptures = findCaptures(card, tableState);
            
            for (const capture of possibleCaptures) {
                if (capture.some(c => c.value === 7 || c.value === 6 || c.value === 1 || c.value === 5)) {
                    return { 
                        card, 
                        tableCards: capture,
                        reasoning: "This captures high-value primera cards",
                        priority: "Medium"
                    };
                }
            }
        }
    }
    
    // Priority 5: Capture as many cards as possible
    let bestCapture = null;
    let mostCards = 0;
    
    for (const card of playerHand) {
        const possibleCaptures = findCaptures(card, tableState);
        
        for (const capture of possibleCaptures) {
            if (capture.length > mostCards) {
                mostCards = capture.length;
                bestCapture = { 
                    card, 
                    tableCards: capture,
                    reasoning: `This captures ${capture.length} cards, helping secure the 'most cards' point`,
                    priority: "Medium"
                };
            }
        }
    }
    
    if (bestCapture) {
        return bestCapture;
    }
    
    // Priority 6: Strategic discard (avoid making combinations easy to capture)
    // Find the card that creates the fewest potential captures
    let bestDiscard = null;
    let lowestRisk = Infinity;
    
    for (const card of playerHand) {
        // Calculate risk by checking how many new combinations this card would create
        const potentialTableAfterDiscard = [...tableState, card];
        let riskScore = 0;
        
        for (let i = 1; i <= 10; i++) {
            const possibleCaptures = findCaptures({value: i}, potentialTableAfterDiscard);
            riskScore += possibleCaptures.length;
        }
        
        if (riskScore < lowestRisk) {
            lowestRisk = riskScore;
            bestDiscard = { 
                card, 
                tableCards: [],
                reasoning: "No captures possible. This discard creates the fewest potential captures for the opponent",
                priority: "Low"
            };
        }
    }
    
    return bestDiscard || { 
        card: playerHand[0], 
        tableCards: [],
        reasoning: "No good options available. Discarding this card is as good as any other.",
        priority: "Lowest"
    };
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
            // For each possible capture, add a capture move
            possibleCaptures.forEach(captureCards => {
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
    executeAITurn,
    generateGameAnalysis
};
