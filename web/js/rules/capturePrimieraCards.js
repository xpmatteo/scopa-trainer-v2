// Rule: Capture Primiera Cards
// This rule evaluates moves based on their ability to capture primiera-valuable cards.

/**
 * Evaluate a move based on the capture of primiera-valuable cards.
 *
 * @param {Object} move - The move being evaluated.
 * @param {Object} gameState - The current state of the game.
 * @returns {number} A score based on the primiera value of the captured cards.
 */
function capturePrimieraCardsRule(move, gameState) {
    const primieraValues = {
        7: 1, // Highest score for sevens
        6: 0.8,
        1: 0.7,
        5: 0.6,
        4: 0.5,
        3: 0.4,
        2: 0.3
    };

    // Compute if the primiera point has already been won
    const aiPrimieraScore = computePrimieraScore(gameState.captureCards);
    const opponentPrimieraScore = computePrimieraScore(gameState.opponentCaptureCards);

    if (aiPrimieraScore >= opponentPrimieraScore && opponentPrimieraScore > 0) {
        return 0; // Primiera point has already been won
    }

    return move.captureCards.reduce((score, card) => {
        return score + (primieraValues[card.value] || 0);
    }, 0);
}

/**
 * Compute the primiera score for a set of captured cards.
 *
 * @param {Array} capturedCards - The cards captured by a player.
 * @returns {number} The primiera score.
 */
function computePrimieraScore(capturedCards) {
    const primieraOrder = [7, 6, 1, 5, 4, 3, 2];
    const suits = ['coins', 'cups', 'swords', 'clubs'];

    return suits.reduce((totalScore, suit) => {
        const bestCard = capturedCards
            .filter(card => card.suit === suit && primieraOrder.includes(card.value))
            .sort((a, b) => primieraOrder.indexOf(a.value) - primieraOrder.indexOf(b.value))[0];

        return totalScore + (bestCard ? primieraOrder.indexOf(bestCard.value) + 1 : 0);
    }, 0);
}

export default capturePrimieraCardsRule;