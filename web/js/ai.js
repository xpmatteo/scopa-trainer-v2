// AI module - pure functions for AI decision making

/**
 * Make an AI decision based on the limited information available to the AI
 * @param {Array} legalMoves - All legal moves available to the AI
 * @param {Object} aiGameState - The game state as known to the AI
 * @param {Array} aiGameState.tableCards - Cards visible on the table
 * @param {Array} aiGameState.handCards - Cards in AI's hand
 * @param {Array} aiGameState.captureCards - Cards captured by AI
 * @param {Array} aiGameState.opponentCaptureCards - Cards captured by opponent
 * @param {Array} aiGameState.outstandingCards - Cards that could be in deck or opponent's hand
 * @returns {Object} The chosen move and rationale
 */
function makeAIDecision(legalMoves, aiGameState) {
    // Separate capture and discard moves
    const captureMoves = legalMoves.filter(move => move.type === 'capture');
    const discardMoves = legalMoves.filter(move => move.type === 'discard');
    
    // If no legal moves, something is wrong
    if (legalMoves.length === 0) {
        return {
            move: null,
            rationale: "No legal moves available"
        };
    }

    // If no capture moves, return a strategic discard
    if (captureMoves.length === 0) {
        // For now, just random discard (could be enhanced with strategic logic)
        const randomDiscard = discardMoves[Math.floor(Math.random() * discardMoves.length)];
        return { 
            move: { card: randomDiscard.card, tableCards: [] },
            rationale: "No captures possible. Discarding card."
        };
    }
    
    // Priority 1: Find any capture that would result in a scopa
    const scopaMove = captureMoves.find(move => 
        move.captureCards.length === aiGameState.tableCards.length
    );
    if (scopaMove) {
        return { 
            move: { card: scopaMove.card, tableCards: scopaMove.captureCards },
            rationale: "Playing for a scopa by clearing the table"
        };
    }
    
    // Priority 2: Capture the 7 of coins if possible
    const setteMove = captureMoves.find(move => 
        move.captureCards.some(c => c.suit === 'coins' && c.value === 7)
    );
    if (setteMove) {
        return { 
            move: { card: setteMove.card, tableCards: setteMove.captureCards },
            rationale: "Capturing the valuable 7 of coins (Sette Bello)"
        };
    }
    
    // Priority 3: Capture as many cards as possible
    // Sort moves by number of cards captured (descending)
    captureMoves.sort((a, b) => b.captureCards.length - a.captureCards.length);
    const mostCardMove = captureMoves[0];
    
    return { 
        move: { card: mostCardMove.card, tableCards: mostCardMove.captureCards },
        rationale: `Capturing ${mostCardMove.captureCards.length} cards to maximize card count`
    };
}

/**
 * Recommend a move for the player (used for analysis)
 * @param {Array} legalMoves - All legal moves available to the player
 * @param {Object} playerGameState - The game state as known to the player
 * @returns {Object} The recommended move, tableCards, reasoning and priority
 */
function recommendMove(legalMoves, playerGameState) {
    // Use the same decision making logic as the AI
    const decision = makeAIDecision(legalMoves, playerGameState);
    
    // Convert the AI decision format to the recommendation format expected by the analysis
    return {
        card: decision.move.card,
        tableCards: decision.move.tableCards,
        reasoning: decision.rationale,
        priority: getPriorityFromRationale(decision.rationale)
    };
}

/**
 * Helper function to convert rationale text to a priority level
 * @param {string} rationale - The reasoning behind a decision
 * @returns {string} Priority level (Highest, High, Medium-High, Medium, Low, Lowest)
 */
function getPriorityFromRationale(rationale) {
    if (rationale.includes("scopa") || rationale.includes("clearing the table")) {
        return "Highest";
    } else if (rationale.includes("7 of coins") || rationale.includes("Sette Bello")) {
        return "High";
    } else if (rationale.includes("coin cards")) {
        return "Medium-High";
    } else if (rationale.includes("maximize card count")) {
        return "Medium";
    } else if (rationale.includes("No captures possible")) {
        return "Low";
    } else {
        return "Lowest";
    }
}

/**
 * Find possible captures for a card
 * Utility function needed for the AI's recommendMove function
 */
function findCaptures(card, tableCards) {
    const possibleCaptures = [];
    
    // Check for direct matches
    const directMatches = tableCards.filter(t => t.value === card.value);
    if (directMatches.length > 0) {
        directMatches.forEach(match => {
            possibleCaptures.push([match]);
        });
    }
    
    // Find all combinations using a comprehensive approach
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

export {
    makeAIDecision,
    recommendMove
};
