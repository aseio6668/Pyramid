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
            case 'blacksmith':
                title.textContent = '🔨 Blacksmith Forge';
                content.innerHTML = this.createBlacksmithInterface();
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
                            <h4>🎯 Mission Rewards (Improved!)</h4>
                            <div class="payout-grid">
                                <div class="payout-section">
                                    <h5>3+ Consecutive</h5>
                                    <div class="payout-row"><span>🐕🐕🐕+</span> <span>25x</span></div>
                                    <div class="payout-row"><span>🚀🚀🚀+</span> <span>15x</span></div>
                                    <div class="payout-row"><span>⭐⭐⭐+</span> <span>10x</span></div>
                                    <div class="payout-row"><span>🌟🌟🌟+</span> <span>8x</span></div>
                                </div>
                                <div class="payout-section">
                                    <h5>Pairs (2 in row)</h5>
                                    <div class="payout-row small"><span>🐕🐕</span> <span>2x</span></div>
                                    <div class="payout-row small"><span>🚀🚀</span> <span>1.5x</span></div>
                                    <div class="payout-row small"><span>⭐⭐</span> <span>1.2x</span></div>
                                    <div class="payout-row small"><span>Others</span> <span>0.2x+</span></div>
                                </div>
                                <div class="bonus-info">
                                    <p><strong>🌟 Scatter Bonus:</strong> 6+ same symbols anywhere!</p>
                                    <p><strong>💫 More ways to win!</strong> Pairs pay too!</p>
                                </div>
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

    createBlacksmithInterface() {
        return `
            <div class="blacksmith-game">
                <div class="forge-theme-bg">
                    <div class="game-header">
                        <h4>🔨 Welcome to the Forge 🔨</h4>
                        <p>Forge items with the master craftsman and choose your reward!</p>
                    </div>
                    
                    <div class="blacksmith-character">
                        <div class="game-master">
                            <div class="dog-blacksmith">🐕‍🔧</div>
                            <div class="speech-bubble">
                                "Welcome, adventurer! I'll forge 3 items for you. Choose wisely - each holds different treasures!"
                            </div>
                        </div>
                    </div>
                    
                    <div class="betting-section">
                        <label for="blacksmithBet">Your Investment (MC):</label>
                        <input type="number" id="blacksmithBet" min="2500" max="150000" step="2500" value="10000">
                        <button id="startForging" onclick="gameManager.startForging()">🔨 Begin Forging</button>
                    </div>
                    
                    <div id="forgingAnimation" class="forging-area" style="display: none;">
                        <div class="forge-fire">🔥</div>
                        <div class="forging-progress">
                            <div class="hammer">🔨</div>
                            <div class="anvil">⚒️</div>
                        </div>
                        <div class="forge-status">The master is forging your items...</div>
                    </div>
                    
                    <div id="itemSelection" class="item-cards" style="display: none;">
                        <h4>🎁 Choose Your Item (Pick 1 of 4 Forged Items)</h4>
                        <div class="items-grid">
                            <div class="item-card" onclick="gameManager.selectForgedItem(0)">
                                <div class="item-icon" id="item0Icon">⚔️</div>
                                <div class="item-name" id="item0Name">Mysterious Item</div>
                                <div class="item-quality" id="item0Quality">Unknown Quality</div>
                            </div>
                            <div class="item-card" onclick="gameManager.selectForgedItem(1)">
                                <div class="item-icon" id="item1Icon">🛡️</div>
                                <div class="item-name" id="item1Name">Mysterious Item</div>
                                <div class="item-quality" id="item1Quality">Unknown Quality</div>
                            </div>
                            <div class="item-card" onclick="gameManager.selectForgedItem(2)">
                                <div class="item-icon" id="item2Icon">💎</div>
                                <div class="item-name" id="item2Name">Mysterious Item</div>
                                <div class="item-quality" id="item2Quality">Unknown Quality</div>
                            </div>
                            <div class="item-card" onclick="gameManager.selectForgedItem(3)">
                                <div class="item-icon" id="item3Icon">🏺</div>
                                <div class="item-name" id="item3Name">Mysterious Item</div>
                                <div class="item-quality" id="item3Quality">Unknown Quality</div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="merchantSection" class="merchant-area" style="display: none;">
                        <div class="shady-merchant">
                            <div class="merchant-character">
                                <div class="dog-merchant">🐕‍💼</div>
                                <div class="speech-bubble merchant-speech">
                                    "Psst... I'll buy that from you. Let's see what it's really worth..."
                                </div>
                            </div>
                            <div class="selected-item-display">
                                <div class="item-showcase">
                                    <div class="showcase-icon" id="selectedItemIcon">⚔️</div>
                                    <div class="showcase-name" id="selectedItemName">Selected Item</div>
                                    <div class="showcase-quality" id="selectedItemQuality">Quality Rating</div>
                                </div>
                                <button id="sellToMerchant" onclick="gameManager.sellToMerchant()">💰 Sell to Merchant</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="blacksmithResult" class="game-result"></div>
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
        
        // Check MC balance
        const currentBalance = window.PlatformAPI ? window.PlatformAPI.getCurrentBalance() : 100000;
        console.log('DEBUG: Blackjack deal - currentBalance:', currentBalance, 'betAmount:', betAmount);
        if (betAmount > currentBalance) {
            this.showGameMessage('Insufficient balance', 'error');
            return;
        }
        
        const requestData = {
            gameType: 'blackjack',
            betAmount: betAmount,
            action: 'deal',
            currentBalance: currentBalance
        };
        console.log('DEBUG: Blackjack deal API request:', requestData);
        
        try {
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            console.log('Blackjack deal result:', result);
            
            if (result.success) {
                this.gameState = result.gameData;
                this.updateBlackjackDisplay(result.gameData);
                document.getElementById('blackjackTable').style.display = 'block';
                document.getElementById('dealCards').style.display = 'none';
                this.updateBalance(result.newBalance);
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
                    dealerHand: this.gameState.dealerHand,
                    currentBalance: window.PlatformAPI ? window.PlatformAPI.getCurrentBalance() : 100000
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
                    dealerHand: this.gameState.dealerHand,
                    currentBalance: window.PlatformAPI ? window.PlatformAPI.getCurrentBalance() : 100000
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
        
        this.updateBalance(result.newBalance);
    }

    async flipCoin(choice) {
        const betAmount = parseFloat(document.getElementById('coinflipBet').value);
        
        if (betAmount < 500 || betAmount > 50000) {
            this.showGameMessage('Bet must be between 500 and 50,000 MC', 'error');
            return;
        }
        
        // Check MC balance
        const currentBalance = window.PlatformAPI ? window.PlatformAPI.getCurrentBalance() : 100000;
        console.log('DEBUG: Coinflip - currentBalance:', currentBalance, 'betAmount:', betAmount);
        if (betAmount > currentBalance) {
            this.showGameMessage('Insufficient balance', 'error');
            return;
        }
        
        const requestData = {
            gameType: 'coinflip',
            betAmount: betAmount,
            choice: choice,
            currentBalance: currentBalance
        };
        console.log('DEBUG: Coinflip API request:', requestData);
        
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
                    body: JSON.stringify(requestData)
                });
                
                const result = await response.json();
                
                document.getElementById('coinAnimation').style.display = 'none';
                
                if (result.success) {
                    this.showCoinflipResult(result);
                    this.updateBalance(result.newBalance);
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
        
        // PRIORITY: Use Pyramid Panel user first, then fallback to MasterCredits Casino
        const user = (window.PlatformAPI && window.PlatformAPI.getCurrentUser()) || (app && app.currentUser);
        if (!user || typeof user.mcBalance === 'undefined') {
            this.showGameMessage('Game not available - please refresh the page', 'error');
            return;
        }
        
        if (totalBet > user.mcBalance) {
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
                        lines: numLines,
                        currentBalance: currentBalance
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.showStarboundResult(result);
                    this.updateBalance(result.newBalance);
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
            'GEM': '💎',
            'BONE': '🦴',
            'PLANET': '🪐',
            'COMET': '☄️',
            'ASTEROID': '🌑'
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
            message = `🚀 <strong>Mission Success!</strong> 🚀<br>`;
            
            gameData.winningLines.forEach(line => {
                const symbol = symbolMap[line.symbol] || line.symbol;
                const winType = line.type || 'consecutive';
                
                if (winType === 'scatter') {
                    message += `🌟 Scatter Bonus: ${symbol}×${line.count} anywhere = ${app.formatMC(line.payout)} MC<br>`;
                } else if (winType === 'pair') {
                    message += `💫 Pair Win: ${symbol}×${line.count} on line ${line.line + 1} = ${app.formatMC(line.payout)} MC<br>`;
                } else {
                    message += `Line ${line.line + 1}: ${symbol}×${line.count} = ${app.formatMC(line.payout)} MC<br>`;
                }
            });
            
            message += `<strong>Total: ${app.formatMC(totalPayout)} MC</strong>`;
        } else {
            message = `🛸 No matches this time. But now pairs pay too! Try again! 🛸`;
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
        
        const detailsDiv = document.getElementById('predictionDetails');
        detailsDiv.innerHTML = '';
        
        // Show prediction-specific input fields
        if (type === 'sum_exact') {
            const diceCount = parseInt(document.querySelector('.dice-count-btn.active').dataset.count);
            const diceSides = parseInt(document.querySelector('.dice-type-btn.active').dataset.sides);
            const minSum = diceCount;
            const maxSum = diceCount * diceSides;
            
            detailsDiv.innerHTML = `
                <label for="targetSum">Target Sum (${minSum}-${maxSum}):</label>
                <input type="number" id="targetSum" min="${minSum}" max="${maxSum}" value="${Math.floor((minSum + maxSum) / 2)}">
            `;
            detailsDiv.style.display = 'block';
        } else if (type === 'contains_number') {
            const diceSides = parseInt(document.querySelector('.dice-type-btn.active').dataset.sides);
            
            detailsDiv.innerHTML = `
                <label for="targetNumber">Target Number (1-${diceSides}):</label>
                <input type="number" id="targetNumber" min="1" max="${diceSides}" value="1">
            `;
            detailsDiv.style.display = 'block';
        } else {
            detailsDiv.style.display = 'none';
        }
        
        document.getElementById('rollDice').disabled = false;
        this.updatePayouts();
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
        const diceCount = parseInt(document.querySelector('.dice-count-btn.active').dataset.count);
        const diceSides = parseInt(document.querySelector('.dice-type-btn.active').dataset.sides);
        
        // Calculate realistic payouts based on probability
        
        // All same payout
        const allSameProbability = diceSides / Math.pow(diceSides, diceCount);
        const allSameMultiplier = Math.round((1.0 / allSameProbability) * 0.8);
        document.getElementById('allSamePayout').textContent = `${allSameMultiplier}x`;
        
        // Contains number payout (average for any number)
        const doesntContainProbability = Math.pow((diceSides - 1) / diceSides, diceCount);
        const containsProbability = 1 - doesntContainProbability;
        const containsMultiplier = Math.max(1.2, Math.round((1.0 / containsProbability) * 0.9 * 10) / 10);
        document.getElementById('containsNumberPayout').textContent = `${containsMultiplier}x`;
        
        // Update exact sum payout if that prediction is selected
        if (document.querySelector('[data-prediction="sum_exact"]').classList.contains('active')) {
            const minSum = diceCount;
            const maxSum = diceCount * diceSides;
            const exactSumProbability = Math.max(0.001, 1.0 / (maxSum - minSum + 1));
            const exactSumMultiplier = Math.min(50, Math.round((1.0 / exactSumProbability) * 0.8));
            document.getElementById('exactSumPayout').textContent = `${exactSumMultiplier}x`;
        } else {
            document.getElementById('exactSumPayout').textContent = '25x';
        }
    }

    async rollMastersDice() {
        if (!this.validateUser()) return;
        
        const betAmount = parseInt(document.getElementById('diceBet').value);
        if (isNaN(betAmount) || betAmount < 1000) {
            this.showGameMessage('Minimum bet is 1,000 MC', 'error');
            return;
        }
        
        const diceCount = parseInt(document.querySelector('.dice-count-btn.active').dataset.count);
        const diceSides = parseInt(document.querySelector('.dice-type-btn.active').dataset.sides);
        const selectedPrediction = document.querySelector('.prediction-btn.active');
        
        if (!selectedPrediction) {
            this.showGameMessage('Please select a prediction', 'error');
            return;
        }
        
        const predictionType = selectedPrediction.dataset.prediction;
        
        // Show animation
        document.getElementById('diceDisplay').style.display = 'none';
        document.getElementById('diceAnimation').style.display = 'block';
        document.getElementById('rollDice').disabled = true;
        
        try {
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'mastersdice',
                    betAmount: betAmount,
                    gameData: {
                        diceCount: diceCount,
                        diceSides: diceSides,
                        predictionType: predictionType,
                        predictionDetails: this.getCurrentPredictionDetails()
                    },
                    currentBalance: window.PlatformAPI ? window.PlatformAPI.getCurrentBalance() : 100000
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update balance
                this.updateBalance(result.newBalance);
                
                // Show dice results with animation
                await this.animateDiceRoll(result.gameData.diceResults);
                
                // Show final results
                this.showMastersDiceResults(result);
            } else {
                this.showGameMessage(result.error || 'Game failed', 'error');
            }
        } catch (error) {
            this.showGameMessage('Network error', 'error');
        }
        
        document.getElementById('rollDice').disabled = false;
    }
    
    getCurrentPredictionDetails() {
        const predictionType = document.querySelector('.prediction-btn.active').dataset.prediction;
        const details = {};
        
        if (predictionType === 'sum_exact') {
            details.targetSum = parseInt(document.getElementById('targetSum')?.value) || 0;
        } else if (predictionType === 'contains_number') {
            details.targetNumber = parseInt(document.getElementById('targetNumber')?.value) || 1;
        }
        
        return details;
    }
    
    async animateDiceRoll(diceResults) {
        const diceContainer = document.getElementById('diceContainer');
        diceContainer.innerHTML = '';
        
        // Create dice elements
        diceResults.forEach((result, index) => {
            const die = document.createElement('div');
            die.className = 'rolling-die';
            die.id = `rollDie${index + 1}`;
            die.textContent = '🎲';
            diceContainer.appendChild(die);
        });
        
        // Animate for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show results
        document.getElementById('diceAnimation').style.display = 'none';
        document.getElementById('diceDisplay').style.display = 'block';
        
        const diceArea = document.getElementById('diceArea');
        diceResults.forEach((result, index) => {
            const dieElement = document.getElementById(`dice${index + 1}`);
            if (dieElement) {
                dieElement.textContent = this.getDieFace(result);
                dieElement.classList.add('result-die');
            }
        });
    }
    
    getDieFace(value) {
        const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return faces[value] || `[${value}]`;
    }
    
    showMastersDiceResults(result) {
        const resultDiv = document.getElementById('mastersDiceResult');
        const { diceResults, predictionResult, payout } = result.gameData;
        const sum = diceResults.reduce((acc, val) => acc + val, 0);
        
        let resultText = `<div class="dice-result">`;
        resultText += `<h4>🎲 Dice Results: ${diceResults.join(', ')} (Sum: ${sum})</h4>`;
        resultText += `<p><strong>Prediction:</strong> ${predictionResult.description}</p>`;
        
        if (predictionResult.success) {
            resultText += `<p class="win-result">🎉 YOU WIN! +${this.formatMC(payout)} MC</p>`;
        } else {
            resultText += `<p class="lose-result">😞 You lose. Better luck next time!</p>`;
        }
        
        resultText += `</div>`;
        resultDiv.innerHTML = resultText;
        
        this.showGameMessage(predictionResult.success ? 'You won!' : 'You lost', predictionResult.success ? 'success' : 'error');
    }

    validateUser() {
        // Always valid - no user system required
        return true;
    }

    updateBalance(newBalance) {
        // Update MC balance in platform storage
        if (window.PlatformAPI && window.PlatformAPI.updateMCBalance) {
            window.PlatformAPI.updateMCBalance(newBalance);
        }
        
        // Update app balance if it exists (legacy support)
        if (window.app && window.app.updateBalance) {
            window.app.updateBalance(newBalance);
        }
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

    async startForging() {
        const betAmount = parseFloat(document.getElementById('blacksmithBet').value);
        
        if (betAmount < 2500 || betAmount > 150000) {
            this.showGameMessage('Investment must be between 2,500 and 150,000 MC', 'error');
            return;
        }

        // PRIORITY: Use Pyramid Panel user first, then fallback to MasterCredits Casino
        const user = (window.PlatformAPI && window.PlatformAPI.getCurrentUser()) || (app && app.currentUser);
        if (!user || typeof user.mcBalance === 'undefined') {
            this.showGameMessage('Game not available - please refresh the page', 'error');
            return;
        }
        
        if (user.mcBalance < betAmount) {
            this.showGameMessage('Insufficient balance for this investment', 'error');
            return;
        }

        // Hide betting section and show forging animation
        document.getElementById('startForging').style.display = 'none';
        document.getElementById('forgingAnimation').style.display = 'block';

        // Show forging animation for 3 seconds
        setTimeout(() => {
            this.showForgedItems(betAmount);
        }, 3000);
    }

    showForgedItems(betAmount) {
        // Hide forging animation
        document.getElementById('forgingAnimation').style.display = 'none';
        
        // Generate 4 random items with different multipliers
        const items = this.generateForgedItems();
        
        // Store the items for selection
        this.forgedItems = items;
        this.currentBet = betAmount;
        
        // Display the items
        for (let i = 0; i < 4; i++) {
            document.getElementById(`item${i}Icon`).textContent = items[i].icon;
            document.getElementById(`item${i}Name`).textContent = items[i].name;
            document.getElementById(`item${i}Quality`).textContent = items[i].quality;
        }
        
        // Show item selection
        document.getElementById('itemSelection').style.display = 'block';
    }

    generateForgedItems() {
        const itemPool = [
            { icon: '⚔️', name: 'Iron Sword', quality: 'Common' },
            { icon: '🛡️', name: 'Steel Shield', quality: 'Common' },
            { icon: '🏺', name: 'Ancient Vase', quality: 'Common' },
            { icon: '⚒️', name: 'War Hammer', quality: 'Uncommon' },
            { icon: '💎', name: 'Rare Gem', quality: 'Rare' },
            { icon: '👑', name: 'Golden Crown', quality: 'Rare' },
            { icon: '💰', name: 'Treasure Chest', quality: 'Epic' },
            { icon: '🔮', name: 'Crystal Orb', quality: 'Epic' },
            { icon: '🗡️', name: 'Dragon Blade', quality: 'Legendary' },
            { icon: '💍', name: 'Magic Ring', quality: 'Legendary' },
            { icon: '🏮', name: 'Mystic Lantern', quality: 'Rare' },
            { icon: '⚱️', name: 'Soul Jar', quality: 'Epic' },
            { icon: '🎭', name: 'Theater Mask', quality: 'Uncommon' },
            { icon: '🔱', name: 'Trident of Power', quality: 'Legendary' },
            { icon: '💀', name: 'Cursed Skull', quality: 'Cursed' },
            { icon: '🌟', name: 'Shooting Star', quality: 'Mythic' },
            { icon: '🦄', name: 'Unicorn Horn', quality: 'Mythic' },
            { icon: '🐉', name: 'Dragon Scale', quality: 'Mythic' },
            { icon: '🔥', name: 'Eternal Flame', quality: 'Artifact' }
        ];

        // Select 4 random items from the pool
        const selectedItems = [];
        const usedIndices = new Set();
        
        while (selectedItems.length < 4) {
            const randomIndex = Math.floor(Math.random() * itemPool.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                selectedItems.push(itemPool[randomIndex]);
            }
        }
        
        return selectedItems;
    }

    selectForgedItem(index) {
        if (!this.forgedItems || !this.currentBet) return;
        
        const selectedItem = this.forgedItems[index];
        this.selectedItem = selectedItem;
        this.selectedItemIndex = index;
        
        // Hide item selection and show merchant
        document.getElementById('itemSelection').style.display = 'none';
        
        // Display selected item in merchant section
        document.getElementById('selectedItemIcon').textContent = selectedItem.icon;
        document.getElementById('selectedItemName').textContent = selectedItem.name;
        document.getElementById('selectedItemQuality').textContent = `${selectedItem.quality} Quality`;
        
        // Show merchant section
        document.getElementById('merchantSection').style.display = 'block';
    }

    async sellToMerchant() {
        if (!this.selectedItem || !this.currentBet) return;
        
        try {
            // Call backend to deduct bet and determine merchant payout
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'blacksmith',
                    betAmount: this.currentBet,
                    action: 'sell',
                    itemIndex: this.selectedItemIndex,
                    selectedItem: this.selectedItem,
                    currentBalance: window.PlatformAPI ? window.PlatformAPI.getCurrentBalance() : 100000
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.updateBalance(result.newBalance);
                
                this.displayMerchantResult(result);
            } else {
                this.showGameMessage(result.error, 'error');
            }
        } catch (error) {
            this.showGameMessage('Failed to sell to merchant', 'error');
        }
    }

    displayMerchantResult(gameResult) {
        // Hide merchant section
        document.getElementById('merchantSection').style.display = 'none';
        
        const payout = gameResult.payout || 0;
        const profit = payout - this.currentBet;
        const merchantMultiplier = gameResult.data?.merchantMultiplier || gameResult.gameData?.merchantMultiplier || 0;
        
        let message = `🐕‍💼 The merchant examined your ${this.selectedItem.icon} ${this.selectedItem.name}<br>`;
        message += `💰 Merchant paid: ${app.formatMC(payout)} MC (${merchantMultiplier}x multiplier)<br>`;
        
        if (profit > 0) {
            message += `🎉 Profit: +${app.formatMC(profit)} MC`;
        } else if (profit < 0) {
            message += `💸 Loss: ${app.formatMC(Math.abs(profit))} MC`;
        } else {
            message += `🤝 Break even!`;
        }
        
        if (gameResult.experienceGained > 0) {
            message += `<br>⭐ +${gameResult.experienceGained} XP gained!`;
        }
        
        const messageClass = profit > 0 ? 'success' : profit < 0 ? 'error' : 'info';
        
        document.getElementById('blacksmithResult').innerHTML = `
            <div class="result-message ${messageClass}">${message}</div>
            <button onclick="gameManager.resetBlacksmith()">🔨 Forge Again</button>
        `;
    }

    resetBlacksmith() {
        // Reset all game elements
        document.getElementById('startForging').style.display = 'inline-block';
        document.getElementById('forgingAnimation').style.display = 'none';
        document.getElementById('itemSelection').style.display = 'none';
        document.getElementById('merchantSection').style.display = 'none';
        document.getElementById('blacksmithResult').innerHTML = '';
        
        // Clear game state
        this.forgedItems = null;
        this.selectedItem = null;
        this.selectedItemIndex = null;
        this.currentBet = 0;
        
        // Reset bet amount
        document.getElementById('blacksmithBet').value = '10000';
    }
}

const gameManager = new GameManager();

window.playGame = gameManager.playGame.bind(gameManager);
window.closeGame = gameManager.closeGame.bind(gameManager);
window.gameManager = gameManager;

// Function to update Starbound total bet display
function updateStarboundTotalBet() {
    const betInput = document.getElementById('starboundBet');
    const linesInput = document.getElementById('starboundLines');
    const totalDisplay = document.getElementById('totalBet');
    
    if (!betInput || !linesInput || !totalDisplay) return;
    
    const betPerLine = parseFloat(betInput.value) || 0;
    const numLines = parseInt(linesInput.value) || 1;
    const totalBet = betPerLine * numLines;
    
    // Use app.formatMC if available, otherwise format manually
    if (window.app && window.app.formatMC) {
        totalDisplay.textContent = `${app.formatMC(totalBet)} MC`;
    } else {
        totalDisplay.textContent = `${totalBet.toLocaleString()} MC`;
    }
    
    console.log(`Updated Starbound total bet: ${betPerLine} x ${numLines} = ${totalBet} MC`);
}

// Set up event listeners with delayed initialization
setTimeout(() => {
    const betInput = document.getElementById('starboundBet');
    const linesInput = document.getElementById('starboundLines');
    
    if (betInput) {
        betInput.addEventListener('input', updateStarboundTotalBet);
        // Update immediately when page loads
        updateStarboundTotalBet();
    }
    
    if (linesInput) {
        linesInput.addEventListener('change', updateStarboundTotalBet);
    }
}, 1000); // Delay to ensure elements exist and app is loaded

// Also add event listeners with the old method as backup
document.getElementById('starboundBet')?.addEventListener('input', updateStarboundTotalBet);
document.getElementById('starboundLines')?.addEventListener('change', updateStarboundTotalBet);