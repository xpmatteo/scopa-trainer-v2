// Rule: Capture Coins
// This rule evaluates moves based on their ability to capture coin cards.

/**
 * Evaluate a move based on the capture of coin cards.
 *
 * @param {Object} move - The move being evaluated.
 * @param {Object} aiGameState - The game state as known to the AI.
 * @param {Array} aiGameState.captureCards - Cards captured by AI.
 * @param {Array} aiGameState.opponentCaptureCards - Cards captured by the opponent.
 * @returns {number} A score between -1 and 1.
 */
function captureCoinsRule(move, aiGameState) {
    // Check if either player has already captured 6 or more coin cards
    const aiCoinCount = aiGameState.captureCards.filter(card => card.suit === 'coins').length;
    const opponentCoinCount = aiGameState.opponentCaptureCards.filter(card => card.suit === 'coins').length;

    if (aiCoinCount >= 6 || opponentCoinCount >= 6) {
        return 0; // Indifferent if the coin card limit is reached
    }

    // Check if the move captures any coin cards
    const capturesCoins = move.captureCards.some(card => card.suit === 'coins');

    return capturesCoins ? 1 : 0;
}

export default captureCoinsRule;