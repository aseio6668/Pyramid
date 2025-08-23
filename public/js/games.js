class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameState = {};
    }

    playGame(gameType) {
        this.currentGame = gameType;
        const modal = document.getElementById('game-modal');
        const title = document.getElementById('gameTitle');
        const content = document.getElementById('gameContent');
        
        switch (gameType) {
            case 'blackjack':
                title.textContent = '☕ Coffee Blackjack';
                content.innerHTML = this.createBlackjackInterface();
                break;
            case 'coinflip':
                title.textContent = '🤠 Western Coinflip';
                content.innerHTML = this.createCoinflipInterface();
                break;
            case 'starbound':
                title.textContent = '🚀 Starbound Slots';
                content.innerHTML = this.createStarboundInterface();
                break;
            case 'mastersdice':
                title.textContent = '🎲 Master\'s Dice';
                content.innerHTML = this.createMastersDiceInterface();
                break;
        }
        
        modal.classList.remove('hidden');
    }

    createBlackjackInterface() {
        return `
            <div class="blackjack-game">
                <div class="coffee-theme-bg">
                    <div class="game-header">
                        <h4>☕ Welcome to Coffee Blackjack ☕</h4>
                        <p>Get as close to 21 as possible without going over!</p>
                    </div>
                    
                    <div class="betting-section">
                        <label for="blackjackBet">Your Bet (MC):</label>
                        <input type="number" id="blackjackBet" min="1000" max="100000" step="1000" value="10000">
                        <button id="dealCards" onclick="gameManager.dealBlackjack()">☕ Deal Cards</button>
                    </div>
                    
                    <div id="blackjackTable" class="card-table" style="display: none;">
                        <div class="dealer-section">
                            <h4>☕ Dealer's Hand</h4>
                            <div id="dealerCards" class="card-container"></div>
                            <div id="dealerScore" class="score-display"></div>
                        </div>
                        
                        <div class="player-section">
                            <h4>☕ Your Hand</h4>
                            <div id="playerCards" class="card-container"></div>
                            <div id="playerScore" class="score-display"></div>
                        </div>
                        
                        <div id="blackjackActions" class="game-actions">
                            <button id="hitBtn" onclick="gameManager.hitBlackjack()">☕ Hit</button>
                            <button id="standBtn" onclick="gameManager.standBlackjack()">☕ Stand</button>
                        </div>
                        
                        <div id="blackjackResult" class="game-result"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createCoinflipInterface() {
        return `
            <div class="coinflip-game">
                <div class="western-theme-bg">
                    <div class="game-header">
                        <h4>🤠 Welcome to the Wild West Coinflip 🤠</h4>
                        <p>Call it in the air, partner!</p>
                    </div>
                    
                    <div class="betting-section">
                        <label for="coinflipBet">Your Bet (MC):</label>
                        <input type="number" id="coinflipBet" min="500" max="50000" step="500" value="5000">
                    </div>
                    
                    <div class="choice-section">
                        <h4>🪙 Make Your Call</h4>
                        <div class="coin-choices">
                            <button class="choice-btn heads-btn" onclick="gameManager.flipCoin('heads')">
                                <div class="coin-face">🤠</div>
                                <span>HEADS</span>
                            </button>
                            <button class="choice-btn tails-btn" onclick="gameManager.flipCoin('tails')">
                                <div class="coin-face">⭐</div>
                                <span>TAILS</span>
                            </button>
                        </div>
                    </div>
                    
                    <div id="coinAnimation" class="coin-animation" style="display: none;">
                        <div class="spinning-coin">🪙</div>
                        <p>The coin is spinning...</p>
                    </div>
                    
                    <div id="coinflipResult" class="game-result"></div>
                </div>
            </div>
        `;
    }

    createStarboundInterface() {
        return `
            <div class="starbound-game">
                <div class="space-theme-bg">
                    <div class="game-header">
                        <h4>🚀 Starbound: Space Dogs Adventure 🐕</h4>
                        <p>Help our space dogs explore the galaxy!</p>
                    </div>
                    
                    <div class="betting-section">
                        <div class="bet-controls">
                            <label for="starboundBet">Bet per Line (MC):</label>
                            <input type="number" id="starboundBet" min="100" max="10000" step="100" value="1000">
                            
                            <label for="starboundLines">Number of Lines:</label>
                            <select id="starboundLines">
                                <option value="1">1 Line</option>
                                <option value="5">5 Lines</option>
                                <option value="10" selected>10 Lines</option>
                                <option value="15">15 Lines</option>
                                <option value="20">20 Lines</option>
                            </select>
                            
                            <div class="total-bet">
                                Total Bet: <span id="totalBet">10,000 MC</span>
                            </div>
                        </div>
                        
                        <button id="spinReels" onclick="gameManager.spinStarbound()">🚀 Launch Mission!</button>
                    </div>
                    
                    <div class="slot-machine">
                        <div class="paytable">
                            <h4>🎯 Mission Rewards</h4>
                            <div class="payout-grid">
                                <div class="payout-row"><span>🐕🐕🐕</span> <span>50x</span></div>
                                <div class="payout-row"><span>🚀🚀🚀</span> <span>25x</span></div>
                                <div class="payout-row"><span>⭐⭐⭐</span> <span>15x</span></div>
                                <div class="payout-row"><span>🌟🌟🌟</span> <span>10x</span></div>
                                <div class="payout-row"><span>🛸🛸🛸</span> <span>8x</span></div>
                                <div class="payout-row"><span>🐾🐾🐾</span> <span>5x</span></div>
                            </div>
                        </div>
                        
                        <div class="reels-container">
                            <div id="reel1" class="reel"></div>
                            <div id="reel2" class="reel"></div>
                            <div id="reel3" class="reel"></div>
                            <div id="reel4" class="reel"></div>
                            <div id="reel5" class="reel"></div>
                        </div>
                        
                        <div class="paylines">
                            <div class="payline-indicators">
                                <div class="line-indicator active">Line 1</div>
                                <div class="line-indicator active">Line 5</div>
                                <div class="line-indicator active">Line 10</div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="starboundResult" class="game-result"></div>
                </div>
            </div>
        `;
    }

    createMastersDiceInterface() {
        return `
            <div class="mastersdice-game">
                <div class="dice-theme-bg">
                    <div class="game-header">
                        <h4>🎲 Master's Dice: Predict the Future 🎲</h4>
                        <p>Roll the dice and predict the outcome!</p>
                    </div>
                    
                    <div class="betting-section">
                        <label for="diceBet">Your Bet (MC):</label>
                        <input type="number" id="diceBet" min="1000" max="75000" step="1000" value="5000">
                    </div>
                    
                    <div class="dice-setup">
                        <div class="dice-controls">
                            <div class="control-group">
                                <label>Number of Dice:</label>
                                <div class="dice-count-buttons">
                                    <button class="dice-count-btn active" data-count="1" onclick="gameManager.selectDiceCount(1)">1 Die</button>
                                    <button class="dice-count-btn" data-count="2" onclick="gameManager.selectDiceCount(2)">2 Dice</button>
                                    <button class="dice-count-btn" data-count="3" onclick="gameManager.selectDiceCount(3)">3 Dice</button>
                                    <button class="dice-count-btn" data-count="4" onclick="gameManager.selectDiceCount(4)">4 Dice</button>
                                </div>
                            </div>
                            
                            <div class="control-group">
                                <label>Dice Type:</label>
                                <div class="dice-type-buttons">
                                    <button class="dice-type-btn" data-sides="4" onclick="gameManager.selectDiceType(4)">d4 (1-4)</button>
                                    <button class="dice-type-btn active" data-sides="6" onclick="gameManager.selectDiceType(6)">d6 (1-6)</button>
                                    <button class="dice-type-btn" data-sides="12" onclick="gameManager.selectDiceType(12)">d12 (1-12)</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="prediction-section">
                            <h4>🔮 Make Your Prediction</h4>
                            <div class="prediction-options">
                                <button class="prediction-btn" data-prediction="sum_exact" onclick="gameManager.selectPrediction('sum_exact')">
                                    <span class="prediction-title">Exact Sum</span>
                                    <span class="prediction-desc">Predict the exact total</span>
                                    <span class="prediction-payout" id="exactSumPayout">0x</span>
                                </button>
                                <button class="prediction-btn" data-prediction="sum_range" onclick="gameManager.selectPrediction('sum_range')">
                                    <span class="prediction-title">Sum Range</span>
                                    <span class="prediction-desc">High or Low range</span>
                                    <span class="prediction-payout" id="sumRangePayout">1.8x</span>
                                </button>
                                <button class="prediction-btn" data-prediction="all_same" onclick="gameManager.selectPrediction('all_same')">
                                    <span class="prediction-title">All Same</span>
                                    <span class="prediction-desc">All dice show same number</span>
                                    <span class="prediction-payout" id="allSamePayout">0x</span>
                                </button>
                                <button class="prediction-btn" data-prediction="contains_number" onclick="gameManager.selectPrediction('contains_number')">
                                    <span class="prediction-title">Contains Number</span>
                                    <span class="prediction-desc">At least one die shows X</span>
                                    <span class="prediction-payout" id="containsNumberPayout">0x</span>
                                </button>
                            </div>
                            
                            <div id="predictionDetails" class="prediction-details" style="display: none;"></div>
                        </div>
                    </div>
                    
                    <div id="diceAnimation" class="dice-animation" style="display: none;">
                        <div class="rolling-dice">
                            <div class="dice-container" id="diceContainer"></div>
                            <p>🎲 Rolling dice... 🎲</p>
                        </div>
                    </div>
                    
                    <div class="dice-display" id="diceDisplay">
                        <div class="dice-area" id="diceArea">
                            <div class="dice" id="dice1">🎲</div>
                        </div>
                    </div>
                    
                    <div class="roll-section">
                        <button id="rollDice" onclick="gameManager.rollMastersDice()" disabled>🎲 Roll Dice</button>
                    </div>
                    
                    <div id="mastersDiceResult" class="game-result"></div>
                </div>
            </div>
        `;
    }

    async dealBlackjack() {
        const betAmount = parseFloat(document.getElementById('blackjackBet').value);
        
        if (betAmount < 1000 || betAmount > 100000) {
            this.showGameMessage('Bet must be between 1,000 and 100,000 MC', 'error');
            return;
        }
        
        if (betAmount > app.currentUser.mcBalance) {
            this.showGameMessage('Insufficient balance', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'blackjack',
                    betAmount: betAmount,
                    action: 'deal'
                })
            });
            
            const result = await response.json();
            console.log('Blackjack deal result:', result);
            
            if (result.success) {
                this.gameState = result.gameData;
                this.updateBlackjackDisplay(result.gameData);
                document.getElementById('blackjackTable').style.display = 'block';
                document.getElementById('dealCards').style.display = 'none';
                if (app.currentUser) {
                    app.currentUser.mcBalance = result.newBalance;
                    app.updateUserDisplay();
                }
            } else {
                console.error('Blackjack error:', result.error);
                this.showGameMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Blackjack network error:', error);
            this.showGameMessage('Game error occurred - check console', 'error');
        }
    }

    async hitBlackjack() {
        try {
            const betAmount = parseFloat(document.getElementById('blackjackBet').value);
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'blackjack',
                    betAmount: betAmount,
                    action: 'hit',
                    playerHand: this.gameState.playerHand,
                    dealerHand: this.gameState.dealerHand
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.gameState = result.gameData;
                this.updateBlackjackDisplay(result.gameData);
                
                if (result.gameData.gameState === 'finished') {
                    this.endBlackjackGame(result);
                }
            } else {
                this.showGameMessage(result.error, 'error');
            }
        } catch (error) {
            this.showGameMessage('Game error occurred', 'error');
        }
    }

    async standBlackjack() {
        try {
            const betAmount = parseFloat(document.getElementById('blackjackBet').value);
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'blackjack',
                    betAmount: betAmount,
                    action: 'stand',
                    playerHand: this.gameState.playerHand,
                    dealerHand: this.gameState.dealerHand
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.gameState = result.gameData;
                this.updateBlackjackDisplay(result.gameData);
                this.endBlackjackGame(result);
            } else {
                this.showGameMessage(result.error, 'error');
            }
        } catch (error) {
            this.showGameMessage('Game error occurred', 'error');
        }
    }

    updateBlackjackDisplay(gameData) {
        const playerCards = document.getElementById('playerCards');
        const dealerCards = document.getElementById('dealerCards');
        const playerScore = document.getElementById('playerScore');
        const dealerScore = document.getElementById('dealerScore');
        
        playerCards.innerHTML = gameData.playerHand.map(card => {
            if (card.suit === 'Hidden') return `<div class="card coffee-card">☕</div>`;
            
            // Parse card suit and value from the suit string (e.g. "♠7" or "♥K")
            const cardText = card.suit.replace('?', '');
            const suitSymbol = this.getSuitSymbol(cardText);
            const rank = this.getCardRank(cardText, card.value);
            
            return `<div class="card coffee-card">
                <div class="card-rank">${rank}</div>
                <div class="card-suit">${suitSymbol}</div>
            </div>`;
        }).join('');
        
        dealerCards.innerHTML = gameData.dealerHand.map(card => {
            if (card.suit === 'Hidden') return `<div class="card coffee-card card-back">☕</div>`;
            
            const cardText = card.suit.replace('?', '');
            const suitSymbol = this.getSuitSymbol(cardText);
            const rank = this.getCardRank(cardText, card.value);
            
            return `<div class="card coffee-card">
                <div class="card-rank">${rank}</div>
                <div class="card-suit">${suitSymbol}</div>
            </div>`;
        }).join('');
        
        playerScore.textContent = `Score: ${gameData.playerScore}`;
        
        if (gameData.dealerScore !== undefined) {
            dealerScore.textContent = `Score: ${gameData.dealerScore}`;
        } else {
            dealerScore.textContent = 'Score: ?';
        }
    }

    getSuitSymbol(cardText) {
        if (cardText.includes('A') || cardText.includes('2') || cardText.includes('3') || 
            cardText.includes('4') || cardText.includes('5') || cardText.includes('6') ||
            cardText.includes('7') || cardText.includes('8') || cardText.includes('9') ||
            cardText.includes('10') || cardText.includes('J') || cardText.includes('Q') || 
            cardText.includes('K')) {
            // Randomly assign suits for now since Java doesn't preserve them properly
            const suits = ['♠', '♥', '♦', '♣'];
            return suits[Math.floor(Math.random() * suits.length)];
        }
        return '☕'; // Default coffee symbol
    }

    getCardRank(cardText, value) {
        if (cardText.includes('A')) return 'A';
        if (cardText.includes('K')) return 'K';
        if (cardText.includes('Q')) return 'Q';
        if (cardText.includes('J')) return 'J';
        return value.toString();
    }

    endBlackjackGame(result) {
        document.getElementById('blackjackActions').style.display = 'none';
        
        let message = '';
        let messageClass = '';
        
        switch (result.gameData.result) {
            case 'player_blackjack':
                message = '☕ Blackjack! Perfect brew! ☕';
                messageClass = 'success';
                break;
            case 'player_wins':
                message = '☕ You win! Great hand! ☕';
                messageClass = 'success';
                break;
            case 'dealer_wins':
                message = '☕ Dealer wins. Better luck next time! ☕';
                messageClass = 'error';
                break;
            case 'player_bust':
                message = '☕ Bust! Too much caffeine! ☕';
                messageClass = 'error';
                break;
            case 'dealer_bust':
                message = '☕ Dealer bust! You win! ☕';
                messageClass = 'success';
                break;
            case 'push':
                message = '☕ It\'s a push! Even match! ☕';
                messageClass = 'info';
                break;
        }
        
        const payout = result.payout || 0;
        if (payout > 0) {
            message += ` Won: ${app.formatMC(payout)} MC`;
        }
        
        document.getElementById('blackjackResult').innerHTML = `
            <div class="result-message ${messageClass}">${message}</div>
            <button onclick="gameManager.resetBlackjack()">☕ New Hand</button>
        `;
        
        app.currentUser.mcBalance = result.newBalance;
        app.updateUserDisplay();
    }

    async flipCoin(choice) {
        const betAmount = parseFloat(document.getElementById('coinflipBet').value);
        
        if (betAmount < 500 || betAmount > 50000) {
            this.showGameMessage('Bet must be between 500 and 50,000 MC', 'error');
            return;
        }
        
        if (betAmount > app.currentUser.mcBalance) {
            this.showGameMessage('Insufficient balance', 'error');
            return;
        }
        
        document.getElementById('coinAnimation').style.display = 'block';
        document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
        
        setTimeout(async () => {
            try {
                const response = await fetch('/api/play-game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        gameType: 'coinflip',
                        betAmount: betAmount,
                        choice: choice
                    })
                });
                
                const result = await response.json();
                
                document.getElementById('coinAnimation').style.display = 'none';
                
                if (result.success) {
                    this.showCoinflipResult(result);
                    app.currentUser.mcBalance = result.newBalance;
                    app.updateUserDisplay();
                } else {
                    this.showGameMessage(result.error, 'error');
                }
                
                document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = false);
                
            } catch (error) {
                document.getElementById('coinAnimation').style.display = 'none';
                this.showGameMessage('Game error occurred', 'error');
                document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = false);
            }
        }, 2000);
    }

    showCoinflipResult(result) {
        const gameData = result.gameData;
        const isWin = gameData.result === 'win';
        const coinIcon = gameData.coinResult === 'heads' ? '🤠' : '⭐';
        
        let message = `🪙 The coin landed on: ${coinIcon} ${gameData.coinResult.toUpperCase()}`;
        
        if (isWin) {
            message += `<br>🤠 You win ${app.formatMC(result.payout)} MC! 🤠`;
        } else {
            message += `<br>💔 You lose! Better luck next time, partner!`;
        }
        
        document.getElementById('coinflipResult').innerHTML = `
            <div class="result-message ${isWin ? 'success' : 'error'}">${message}</div>
            <button onclick="gameManager.resetCoinflip()">🤠 Flip Again</button>
        `;
    }

    async spinStarbound() {
        const betPerLine = parseFloat(document.getElementById('starboundBet').value);
        const numLines = parseInt(document.getElementById('starboundLines').value);
        const totalBet = betPerLine * numLines;
        
        if (betPerLine < 100 || betPerLine > 10000) {
            this.showGameMessage('Bet per line must be between 100 and 10,000 MC', 'error');
            return;
        }
        
        if (totalBet > app.currentUser.mcBalance) {
            this.showGameMessage('Insufficient balance', 'error');
            return;
        }
        
        this.animateReels();
        
        setTimeout(async () => {
            try {
                const response = await fetch('/api/play-game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        gameType: 'starbound',
                        betAmount: totalBet,
                        lines: numLines
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.showStarboundResult(result);
                    app.currentUser.mcBalance = result.newBalance;
                    app.updateUserDisplay();
                } else {
                    this.showGameMessage(result.error, 'error');
                }
                
            } catch (error) {
                this.showGameMessage('Game error occurred', 'error');
            }
        }, 3000);
    }

    animateReels() {
        const symbols = ['🐕', '🚀', '⭐', '🌟', '🛸', '🐾', '🔥', '💎'];
        const symbolMap = {
            'DOG': '🐕',
            'ROCKET': '🚀', 
            'STAR': '⭐',
            'SHINE': '🌟',
            'UFO': '🛸',
            'PAW': '🐾',
            'FIRE': '🔥',
            'GEM': '💎'
        };
        
        for (let i = 1; i <= 5; i++) {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = '';
            
            for (let j = 0; j < 3; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'symbol spinning';
                symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                reel.appendChild(symbol);
            }
        }
    }

    showStarboundResult(result) {
        const gameData = result.gameData;
        const symbolMap = {
            'DOG': '🐕',
            'ROCKET': '🚀', 
            'STAR': '⭐',
            'SHINE': '🌟',
            'UFO': '🛸',
            'PAW': '🐾',
            'FIRE': '🔥',
            'GEM': '💎'
        };
        
        for (let i = 1; i <= 5; i++) {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = '';
            
            for (let j = 0; j < 3; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                const symbolText = gameData.reels[i-1][j];
                symbol.textContent = symbolMap[symbolText] || symbolText;
                reel.appendChild(symbol);
            }
        }
        
        let message = '';
        const totalPayout = result.payout || 0;
        
        if (gameData.winningLines && gameData.winningLines.length > 0) {
            message = `🚀 Mission Success! 🚀<br>`;
            message += `Winning combinations: ${gameData.winningLines.length}<br>`;
            message += `Total payout: ${app.formatMC(totalPayout)} MC`;
        } else {
            message = `🛸 No matches this time. Keep exploring! 🛸`;
        }
        
        document.getElementById('starboundResult').innerHTML = `
            <div class="result-message ${totalPayout > 0 ? 'success' : 'info'}">${message}</div>
            <button onclick="gameManager.resetStarbound()">🚀 New Mission</button>
        `;
    }

    resetBlackjack() {
        document.getElementById('blackjackTable').style.display = 'none';
        document.getElementById('dealCards').style.display = 'block';
        document.getElementById('blackjackActions').style.display = 'block';
        document.getElementById('blackjackResult').innerHTML = '';
        this.gameState = {};
    }

    resetCoinflip() {
        document.getElementById('coinflipResult').innerHTML = '';
        document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = false);
    }

    resetStarbound() {
        document.getElementById('starboundResult').innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`reel${i}`).innerHTML = '';
        }
    }

    selectDiceCount(count) {
        document.querySelectorAll('.dice-count-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-count="${count}"]`).classList.add('active');
        this.updateDiceDisplay(count);
        this.updatePayouts();
    }

    selectDiceType(sides) {
        document.querySelectorAll('.dice-type-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-sides="${sides}"]`).classList.add('active');
        this.updatePayouts();
    }

    selectPrediction(type) {
        document.querySelectorAll('.prediction-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-prediction="${type}"]`).classList.add('active');
        document.getElementById('rollDice').disabled = false;
    }

    updateDiceDisplay(count) {
        const diceArea = document.getElementById('diceArea');
        diceArea.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const die = document.createElement('div');
            die.className = 'dice';
            die.id = `dice${i+1}`;
            die.textContent = '🎲';
            diceArea.appendChild(die);
        }
    }

    updatePayouts() {
        // Simple payout calculation for now
        document.getElementById('exactSumPayout').textContent = '25x';
        document.getElementById('allSamePayout').textContent = '50x';
        document.getElementById('containsNumberPayout').textContent = '3x';
    }

    rollMastersDice() {
        this.showGameMessage('Master\'s Dice coming soon!', 'info');
    }

    closeGame() {
        document.getElementById('game-modal').classList.add('hidden');
        this.currentGame = null;
        this.gameState = {};
    }

    showGameMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;
        
        const gameContent = document.getElementById('gameContent');
        gameContent.insertBefore(notification, gameContent.firstChild);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

const gameManager = new GameManager();

window.playGame = gameManager.playGame.bind(gameManager);
window.closeGame = gameManager.closeGame.bind(gameManager);
window.gameManager = gameManager;

document.getElementById('starboundBet')?.addEventListener('input', () => {
    const betPerLine = parseFloat(document.getElementById('starboundBet').value) || 0;
    const numLines = parseInt(document.getElementById('starboundLines').value) || 1;
    const totalBet = betPerLine * numLines;
    document.getElementById('totalBet').textContent = `${app.formatMC(totalBet)} MC`;
});

document.getElementById('starboundLines')?.addEventListener('change', () => {
    const betPerLine = parseFloat(document.getElementById('starboundBet').value) || 0;
    const numLines = parseInt(document.getElementById('starboundLines').value) || 1;
    const totalBet = betPerLine * numLines;
    document.getElementById('totalBet').textContent = `${app.formatMC(totalBet)} MC`;
});