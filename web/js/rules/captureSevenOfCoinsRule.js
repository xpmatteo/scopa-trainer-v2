// Rule: Capture the Seven of Coins
// This rule evaluates moves based on their ability to capture the seven of coins.

/**
 * Evaluate a move based on the capture of the seven of coins.
 *
 * @param {Object} move - The move being evaluated.
 * @returns {number} 1 if the move captures the seven of coins, 0 otherwise.
 */
function captureSevenOfCoinsRule(move) {
    const capturesSevenOfCoins = move.captureCards.some(card => card.suit === 'coins' && card.value === 7);
    return capturesSevenOfCoins ? 1 : 0;
}

export default captureSevenOfCoinsRule;