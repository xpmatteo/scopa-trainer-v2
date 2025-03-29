// Game setup - run immediately
function start() {
    // Game state
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
    
    // DOM Elements
    const tableEl = document.querySelector('.table');
    const playerHandEl = document.querySelector('.player-hand');
    const aiHandEl = document.querySelector('.ai-hand');
    const messageEl = document.getElementById('message');
    const deckCountEl = document.getElementById('deck-count');
    const playerScoreEl = document.getElementById('player-score');
    const aiScoreEl = document.getElementById('ai-score');
    const playerCapturesEl = document.getElementById('player-captures');
    const aiCapturesEl = document.getElementById('ai-captures');
    const playerScopaEl = document.getElementById('player-scopa');
    const aiScopaEl = document.getElementById('ai-scopa');
    const newGameBtn = document.getElementById('new-game-btn');
    const helpBtn = document.getElementById('help-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const gameResultEl = document.getElementById('game-result');
    const finalScoreEl = document.getElementById('final-score');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // Move replay elements
    const prevMoveBtn = document.getElementById('prev-move-btn');
    const nextMoveBtn = document.getElementById('next-move-btn');
    const moveCounterEl = document.getElementById('move-counter');
    const moveDisplayEl = document.getElementById('move-display');
    
    // Card definitions
    const suits = ['coins', 'cups', 'swords', 'clubs'];
    const suitSymbols = {
        coins: '🪙',
        cups: '🏆',
        swords: '⚔️',
        clubs: '🍀'
    };
    
    // Event Listeners
    newGameBtn.addEventListener('click', function() {
        initGame();
    });
    
    helpBtn.addEventListener('click', function() {
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
    
    playAgainBtn.addEventListener('click', function() {
        gameOverModal.style.display = 'none';
        initGame();
    });
    
    // Move replay navigation
    let currentMoveIndex = 0;
    prevMoveBtn.addEventListener('click', function() {
        if (currentMoveIndex > 0) {
            currentMoveIndex--;
            displayMoveAtIndex(currentMoveIndex);
        }
    });
    
    nextMoveBtn.addEventListener('click', function() {
        if (currentMoveIndex < gameAnalysis.playerMoves.length - 1) {
            currentMoveIndex++;
            displayMoveAtIndex(currentMoveIndex);
        }
    });
    
    // Initialize game
    function initGame() {
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
        
        // Clear the display
        tableEl.innerHTML = '<div class="hand-label">Table</div>';
        playerHandEl.innerHTML = '<div class="hand-label">Your Hand</div>';
        aiHandEl.innerHTML = '<div class="hand-label">AI\'s Hand</div>';
        
        // Create and deal cards
        createDeck();
        shuffleDeck();
        dealInitialCards();
        
        // Render initial game state
        renderGame();
        
        // Update display
        updateScores();
        messageEl.textContent = 'Game started! Your turn to play.';
    }
    
    // Create a deck of Scopa cards (40 cards: 1-10 in 4 suits)
    function createDeck() {
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
        
        updateDeckCount();
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
            updateDeckCount();
            return true;
        }
        return false;
    }
    
    // Update deck count display
    function updateDeckCount() {
        deckCountEl.textContent = `Cards in deck: ${gameState.deck.length}`;
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
        
        gameState.table.forEach(card => {
            const cardEl = createCardElement(card);
            cardEl.addEventListener('click', function() {
                handleTableCardClick(card);
            });
            
            if (gameState.selectedTableCards.some(c => c.id === card.id)) {
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
        
        gameState.playerHand.forEach(card => {
            const cardEl = createCardElement(card);
            cardEl.addEventListener('click', function() {
                handlePlayerCardClick(card);
            });
            
            if (gameState.selectedCard && gameState.selectedCard.id === card.id) {
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
        
        gameState.aiHand.forEach(() => {
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
        suitEl.textContent = suitSymbols[card.suit];
        
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
        suitEl.textContent = suitSymbols[card.suit];
        
        cardEl.appendChild(valueEl);
        cardEl.appendChild(suitEl);
        
        return cardEl;
    }
    
    // Handle player card click
    function handlePlayerCardClick(card) {
        if (gameState.currentTurn !== 'player' || gameState.gameOver) return;
        
        // Deselect if the same card is clicked again
        if (gameState.selectedCard && gameState.selectedCard.id === card.id) {
            // If there are no possible captures, discard the card to the table
            if (findCaptures(card, gameState.table).length === 0) {
                playCard(card, []);
                return;
            }
            
            gameState.selectedCard = null;
            gameState.selectedTableCards = [];
            renderGame();
            messageEl.textContent = 'Select a card to play.';
            return;
        }
        
        // Select the card
        gameState.selectedCard = card;
        gameState.selectedTableCards = [];
        
        // Find possible captures
        const possibleCaptures = findCaptures(card, gameState.table);
        
        renderGame();
        
        if (possibleCaptures.length > 0) {
            messageEl.textContent = 'Select table card(s) to capture or select a different hand card.';
        } else {
            messageEl.textContent = 'No captures possible with this card. Click again to discard to table.';
        }
    }
    
    // Handle table card click
    function handleTableCardClick(card) {
        if (gameState.currentTurn !== 'player' || !gameState.selectedCard || gameState.gameOver) return;
        
        const selectedIndex = gameState.selectedTableCards.findIndex(c => c.id === card.id);
        
        if (selectedIndex > -1) {
            // Deselect the card
            gameState.selectedTableCards.splice(selectedIndex, 1);
        } else {
            // Select the card
            gameState.selectedTableCards.push(card);
        }
        
        renderTable();
        
        // Calculate sum of selected table cards
        const sumOfSelected = gameState.selectedTableCards.reduce((sum, c) => sum + c.value, 0);
        
        if (sumOfSelected === gameState.selectedCard.value) {
            // Perform the capture
            playCard(gameState.selectedCard, gameState.selectedTableCards);
        } else if (sumOfSelected > gameState.selectedCard.value) {
            messageEl.textContent = 'Sum exceeds your card value. Deselect some cards.';
        } else if (gameState.selectedTableCards.length > 0) {
            messageEl.textContent = `Sum: ${sumOfSelected}. Select more cards or deselect to try different combination.`;
        } else {
            messageEl.textContent = 'Select card(s) to capture or select a different hand card.';
        }
    }
    
    // Play a card from hand
    function playCard(card, tableCards) {
        if (gameState.currentTurn !== 'player' || gameState.gameOver) return;
        
        gameState.moveCount++;
        
        // Find all possible captures before making the move (for analysis)
        const allPossibleCaptures = findCaptures(card, gameState.table);
        
        // Remove the played card from hand
        const cardIndex = gameState.playerHand.findIndex(c => c.id === card.id);
        if (cardIndex === -1) return;
        gameState.playerHand.splice(cardIndex, 1);
        
        // Find what the AI would have done
        const aiRecommendation = computeAIRecommendation(gameState.playerHand.concat([card]), gameState.table);
        
        // Record this move for analysis
        recordPlayerMove(card, tableCards, allPossibleCaptures, aiRecommendation);
        
        // Check if we're capturing or discarding
        if (tableCards.length > 0) {
            // Capture
            captureCards('player', card, tableCards);
            
            // Check for scopa
            if (gameState.table.length === 0) {
                gameState.playerScopaCount++;
                playerScopaEl.textContent = `Scopa: ${gameState.playerScopaCount}`;
                messageEl.textContent = 'SCOPA! You cleared the table.';
            } else {
                messageEl.textContent = 'Cards captured!';
            }
        } else {
            // Discard to table
            gameState.table.push(card);
            messageEl.textContent = 'Card discarded to table.';
        }
        
        // Reset selections
        gameState.selectedCard = null;
        gameState.selectedTableCards = [];
        
        // Render the updated game state
        renderGame();
        
        // Check if the round is over
        if (gameState.playerHand.length === 0 && gameState.aiHand.length === 0) {
            if (gameState.deck.length > 0) {
                // Deal new hands
                dealNewHands();
                renderGame();
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
                return;
            }
        }
        
        // Switch turn to AI
        gameState.currentTurn = 'ai';
        setTimeout(aiTurn, 1000);
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
            playerCapturesEl.textContent = `Captures: ${gameState.playerCaptures.length}`;
        } else {
            gameState.aiCaptures.push(playedCard, ...capturedCards);
            aiCapturesEl.textContent = `Captures: ${gameState.aiCaptures.length}`;
        }
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
    
    // AI turn logic
    function aiTurn() {
        if (gameState.currentTurn !== 'ai' || gameState.gameOver) return;
        
        messageEl.textContent = 'AI is thinking...';
        
        setTimeout(() => {
            // Find the best move
            const bestMove = findBestAIMove();
            
            if (bestMove) {
                const { card, tableCards } = bestMove;
                
                // Remove card from AI's hand
                const cardIndex = gameState.aiHand.findIndex(c => c.id === card.id);
                gameState.aiHand.splice(cardIndex, 1);
                
                // Show the card being played
                const tempCardEl = createCardElement(card);
                tempCardEl.style.position = 'absolute';
                tempCardEl.style.top = '50%';
                tempCardEl.style.left = '50%';
                tempCardEl.style.transform = 'translate(-50%, -50%)';
                tempCardEl.style.zIndex = '10';
                aiHandEl.appendChild(tempCardEl);
                
                setTimeout(() => {
                    // Remove the temporary card
                    tempCardEl.remove();
                    
                    if (tableCards.length > 0) {
                        // Capture
                        captureCards('ai', card, tableCards);
                        
                        // Check for scopa
                        if (gameState.table.length === 0) {
                            gameState.aiScopaCount++;
                            aiScopaEl.textContent = `Scopa: ${gameState.aiScopaCount}`;
                            messageEl.textContent = 'AI got a SCOPA!';
                        } else {
                            messageEl.textContent = `AI captures with ${card.value} of ${card.suit}.`;
                        }
                    } else {
                        // Discard
                        gameState.table.push(card);
                        messageEl.textContent = `AI discards ${card.value} of ${card.suit} to table.`;
                    }
                    
                    // Render the updated game state
                    renderGame();
                    
                    // Check if the round is over
                    if (gameState.playerHand.length === 0 && gameState.aiHand.length === 0) {
                        if (gameState.deck.length > 0) {
                            // Deal new hands
                            dealNewHands();
                            renderGame();
                        } else {
                            // Last player to capture gets remaining table cards
                            if (gameState.table.length > 0) {
                                gameState.aiCaptures.push(...gameState.table);
                                gameState.table = [];
                            }
                            
                            // Game is over, calculate final scores
                            calculateFinalScores();
                            return;
                        }
                    }
                    
                    // Switch turn to player
                    gameState.currentTurn = 'player';
                    messageEl.textContent = 'Your turn to play.';
                }, 1000);
            }
        }, 1000);
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
    
    // Update scores display
    function updateScores() {
        playerScoreEl.textContent = gameState.playerScore;
        aiScoreEl.textContent = gameState.aiScore;
        playerCapturesEl.textContent = `Captures: ${gameState.playerCaptures.length}`;
        aiCapturesEl.textContent = `Captures: ${gameState.aiCaptures.length}`;
        playerScopaEl.textContent = `Scopa: ${gameState.playerScopaCount}`;
        aiScopaEl.textContent = `Scopa: ${gameState.aiScopaCount}`;
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
        
        // Update score display
        updateScores();
        
        // Calculate final game analysis stats
        calculateAnalysisStats();
        
        // Show game over modal
        showGameOverModal();
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
    
    // Game analysis data with enhanced tracking
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
    
    // Record player move for analysis
    function recordPlayerMove(card, tableCards, possibleCaptures, aiRecommendation) {
        // Don't record if game is over
        if (gameState.gameOver) return;
        
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
    
    // Calculate final stats for the game analysis
    function calculateAnalysisStats() {
        // Calculate capture rate
        const totalMoves = gameAnalysis.playerMoves.length;
        const captures = gameAnalysis.playerMoves.filter(m => m.action === 'capture').length;
        gameAnalysis.captureRate = totalMoves > 0 ? (captures / totalMoves) * 100 : 0;
    }
    
    // Display move at specified index
    function displayMoveAtIndex(index) {
        const move = gameAnalysis.playerMoves[index];
        if (!move) return;
        
        // Update move counter
        moveCounterEl.textContent = `Move ${index + 1} of ${gameAnalysis.playerMoves.length}`;
        
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
        nextMoveBtn.disabled = index === gameAnalysis.playerMoves.length - 1;
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
    
    // Show game over modal with enhanced analysis
    function showGameOverModal() {
        // Determine winner
        let resultText;
        if (gameState.playerScore > gameState.aiScore) {
            resultText = 'You Win!';
        } else if (gameState.aiScore > gameState.playerScore) {
            resultText = 'AI Wins!';
        } else {
            resultText = 'It\'s a Tie!';
        }
        
        // Generate analysis
        const analysis = generateGameAnalysis();
        
        gameResultEl.textContent = resultText;
        finalScoreEl.innerHTML = `Final Score: You ${gameState.playerScore} - ${gameState.aiScore} AI<br><br>
            <div style="text-align:left; font-size:14px; white-space:pre-wrap;">${analysis}</div>`;
        
        // Setup move replay
        if (gameAnalysis.playerMoves.length > 0) {
            currentMoveIndex = 0;
            displayMoveAtIndex(currentMoveIndex);
            moveCounterEl.textContent = `Move 1 of ${gameAnalysis.playerMoves.length}`;
            
            // Enable/disable navigation buttons
            prevMoveBtn.disabled = true;
            nextMoveBtn.disabled = gameAnalysis.playerMoves.length <= 1;
        }
        
        gameOverModal.style.display = 'flex';
    }
    
    // Start the game immediately
    initGame();
}

start();
