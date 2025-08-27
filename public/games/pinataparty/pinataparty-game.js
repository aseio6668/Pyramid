// Pinata Party Game Engine
class PinataPartyGame {
    constructor() {
        this.currentUser = null;
        this.selectedPinataType = null;
        this.betAmount = 2000;
        this.prizes = [];
        this.totalPrizeValue = 0;
        
        // Prize database with themed items and realistic values
        this.prizeDatabase = {
            // Common prizes (70% chance, 0.3x - 1.5x bet value)
            common: [
                { name: 'Candy Cane', icon: '🍭', valueRange: [0.3, 0.8] },
                { name: 'Chocolate Bar', icon: '🍫', valueRange: [0.4, 0.9] },
                { name: 'Lollipop', icon: '🍬', valueRange: [0.2, 0.6] },
                { name: 'Gummy Bears', icon: '🧸', valueRange: [0.3, 0.7] },
                { name: 'Peppermint', icon: '🌿', valueRange: [0.25, 0.5] },
                { name: 'Bubble Gum', icon: '🫧', valueRange: [0.2, 0.4] },
                { name: 'Sweet Toffee', icon: '🍯', valueRange: [0.4, 0.8] },
                { name: 'Jelly Beans', icon: '🫘', valueRange: [0.3, 0.6] },
                { name: 'Caramel', icon: '🍮', valueRange: [0.5, 1.0] },
                { name: 'Fruit Snacks', icon: '🍓', valueRange: [0.3, 0.9] }
            ],
            
            // Uncommon prizes (20% chance, 0.8x - 2.5x bet value)
            uncommon: [
                { name: 'Golden Coin', icon: '🪙', valueRange: [1.2, 2.0] },
                { name: 'Silver Medal', icon: '🥈', valueRange: [0.8, 1.5] },
                { name: 'Party Hat', icon: '🎩', valueRange: [1.0, 1.8] },
                { name: 'Magic Wand', icon: '🪄', valueRange: [1.3, 2.2] },
                { name: 'Crystal Ball', icon: '🔮', valueRange: [1.1, 2.0] },
                { name: 'Lucky Horseshoe', icon: '🍀', valueRange: [0.9, 1.6] },
                { name: 'Treasure Chest', icon: '💎', valueRange: [1.4, 2.5] },
                { name: 'Golden Key', icon: '🗝️', valueRange: [1.0, 1.9] },
                { name: 'Magical Ring', icon: '💍', valueRange: [1.2, 2.1] },
                { name: 'Lucky Charm', icon: '🧿', valueRange: [0.8, 1.4] }
            ],
            
            // Rare prizes (8% chance, 1.5x - 5x bet value)
            rare: [
                { name: 'Gold Bar', icon: '🏆', valueRange: [2.0, 4.0] },
                { name: 'Diamond Ring', icon: '💍', valueRange: [2.5, 4.5] },
                { name: 'Crown Jewels', icon: '👑', valueRange: [3.0, 5.0] },
                { name: 'Golden Trophy', icon: '🏅', valueRange: [2.2, 3.8] },
                { name: 'Rare Gem', icon: '💎', valueRange: [2.8, 4.2] },
                { name: 'Ancient Coin', icon: '🪙', valueRange: [1.8, 3.5] },
                { name: 'Royal Scepter', icon: '🏺', valueRange: [2.3, 4.1] },
                { name: 'Mystic Orb', icon: '🌟', valueRange: [2.6, 4.4] }
            ],
            
            // Epic prizes (2% chance, 3x - 10x bet value)
            epic: [
                { name: 'Jackpot Coins', icon: '💰', valueRange: [5.0, 8.0] },
                { name: 'Royal Crown', icon: '👑', valueRange: [4.5, 7.5] },
                { name: 'Golden Statue', icon: '🗿', valueRange: [6.0, 10.0] },
                { name: 'Legendary Gem', icon: '💎', valueRange: [5.5, 9.0] },
                { name: 'Dragon Treasure', icon: '🐲', valueRange: [4.0, 8.5] }
            ]
        };
        
        this.pinataTypes = {
            donkey: { icon: '🫏', name: 'Classic Donkey', multiplier: 1.0 },
            star: { icon: '⭐', name: 'Lucky Star', multiplier: 1.1 },
            heart: { icon: '💖', name: 'Love Heart', multiplier: 1.05 },
            rainbow: { icon: '🌈', name: 'Rainbow Magic', multiplier: 1.15 }
        };
        
        this.init();
    }
    
    init() {
        this.checkAuthState();
        this.setupEventListeners();
    }
    
    checkAuthState() {
        fetch('/api/user', {
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Not authenticated');
        })
        .then(user => {
            this.currentUser = user;
            this.updateUserDisplay();
        })
        .catch(() => {
            this.showAuthRequired();
        });
    }
    
    updateUserDisplay() {
        if (this.currentUser) {
            document.getElementById('profileUsername').textContent = this.currentUser.username;
            document.getElementById('profileMcBalance').textContent = `MC: ${this.formatMC(this.currentUser.mcBalance)}`;
            document.getElementById('playerBalance').textContent = this.formatMC(this.currentUser.mcBalance);
            
            // Show user profile section, hide auth section
            document.getElementById('userProfile').style.display = 'flex';
            document.getElementById('authSection').style.display = 'none';
            
            // Update bet validation
            this.updateBetValidation();
        }
    }
    
    showAuthRequired() {
        // Show auth section, hide user profile
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('authSection').style.display = 'block';
        
        this.showNotification('Please login to play Pinata Party', 'info');
    }
    
    setupEventListeners() {
        // Bet amount input
        const betAmountInput = document.getElementById('betAmount');
        betAmountInput.addEventListener('input', (e) => {
            this.betAmount = Math.max(500, parseInt(e.target.value) || 500);
            this.updateBetValidation();
        });
    }
    
    updateBetValidation() {
        const startBtn = document.getElementById('startGameBtn');
        if (!this.currentUser) {
            startBtn.disabled = true;
            startBtn.textContent = '🚫 Login Required';
            return;
        }
        
        if (!this.selectedPinataType) {
            startBtn.disabled = true;
            startBtn.textContent = '🪅 Select a Pinata';
            return;
        }
        
        if (this.currentUser.mcBalance < this.betAmount) {
            startBtn.disabled = true;
            startBtn.textContent = '🚫 Insufficient Balance';
            return;
        }
        
        startBtn.disabled = false;
        startBtn.textContent = '🏏 Hit the Pinata!';
    }
    
    selectPinata(type) {
        // Remove previous selection
        document.querySelectorAll('.pinata-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked pinata
        const selectedOption = document.querySelector(`[data-type="${type}"]`);
        selectedOption.classList.add('selected');
        
        this.selectedPinataType = type;
        this.updateBetValidation();
    }
    
    setBetAmount(amount) {
        document.getElementById('betAmount').value = amount;
        this.betAmount = amount;
        this.updateBetValidation();
    }
    
    async startPinataParty() {
        if (!this.currentUser || !this.selectedPinataType) {
            this.showNotification('Please login and select a pinata', 'error');
            return;
        }
        
        if (this.currentUser.mcBalance < this.betAmount) {
            this.showNotification('Insufficient balance', 'error');
            return;
        }
        
        try {
            // Place bet on server
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'pinataparty',
                    betAmount: this.betAmount,
                    action: 'break_pinata',
                    gameData: {
                        pinataType: this.selectedPinataType
                    }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update user balance
                this.currentUser.mcBalance = result.newBalance;
                this.updateUserDisplay();
                
                // Generate prizes and start animation
                this.generatePrizes();
                this.startPinataAnimation();
            } else {
                this.showNotification(result.error || 'Failed to start game', 'error');
            }
        } catch (error) {
            this.showNotification('Network error', 'error');
        }
    }
    
    generatePrizes() {
        this.prizes = [];
        this.totalPrizeValue = 0;
        
        const pinataMultiplier = this.pinataTypes[this.selectedPinataType].multiplier;
        const numPrizes = 3 + Math.floor(Math.random() * 4); // 3-6 prizes
        
        for (let i = 0; i < numPrizes; i++) {
            const rarity = this.rollRarity();
            const prizePool = this.prizeDatabase[rarity];
            const selectedPrize = prizePool[Math.floor(Math.random() * prizePool.length)];
            
            // Calculate prize value with some randomness
            const valueMultiplier = selectedPrize.valueRange[0] + 
                Math.random() * (selectedPrize.valueRange[1] - selectedPrize.valueRange[0]);
            
            const prizeValue = Math.round(this.betAmount * valueMultiplier * pinataMultiplier);
            
            this.prizes.push({
                name: selectedPrize.name,
                icon: selectedPrize.icon,
                value: prizeValue,
                rarity: rarity
            });
            
            this.totalPrizeValue += prizeValue;
        }
    }
    
    rollRarity() {
        const roll = Math.random() * 100;
        
        if (roll < 2) return 'epic';      // 2% chance
        if (roll < 10) return 'rare';     // 8% chance
        if (roll < 30) return 'uncommon'; // 20% chance
        return 'common';                  // 70% chance
    }
    
    async startPinataAnimation() {
        // Hide betting section, show game play area
        document.getElementById('bettingSection').classList.add('hidden');
        document.getElementById('gamePlayArea').classList.remove('hidden');
        
        // Set up pinata display
        const pinataDisplay = document.getElementById('pinataDisplay');
        const pinataInfo = this.pinataTypes[this.selectedPinataType];
        pinataDisplay.textContent = pinataInfo.icon;
        
        // Start party atmosphere
        this.createConfetti();
        
        // Animation sequence
        await this.swingAnimation();
        await this.breakPinata();
        this.showPrizes();
    }
    
    createConfetti() {
        const confetti = document.getElementById('confetti');
        const colors = ['#FF6B9D', '#C44569', '#F8B500', '#40E0D0', '#9B59B6', '#FFD700'];
        
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 3 + 's';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.appendChild(piece);
        }
        
        // Clean up confetti after animation
        setTimeout(() => {
            confetti.innerHTML = '';
        }, 5000);
    }
    
    async swingAnimation() {
        return new Promise(resolve => {
            const batDisplay = document.getElementById('batDisplay');
            const actionStatus = document.getElementById('actionStatus');
            const swingCounter = document.getElementById('swingCounter');
            
            let swings = 0;
            const totalSwings = 2 + Math.floor(Math.random() * 3); // 2-4 swings
            
            const swingInterval = setInterval(() => {
                swings++;
                swingCounter.textContent = `Swings: ${swings}`;
                actionStatus.textContent = `Swing ${swings}!`;
                
                // Add swinging animation
                batDisplay.classList.add('swinging');
                
                setTimeout(() => {
                    batDisplay.classList.remove('swinging');
                }, 800);
                
                if (swings >= totalSwings) {
                    clearInterval(swingInterval);
                    actionStatus.textContent = 'Final swing!';
                    setTimeout(resolve, 1000);
                }
            }, 1200);
        });
    }
    
    async breakPinata() {
        return new Promise(resolve => {
            const pinataDisplay = document.getElementById('pinataDisplay');
            const actionStatus = document.getElementById('actionStatus');
            
            actionStatus.textContent = 'CRACK!';
            
            // Add breaking animation
            pinataDisplay.classList.add('breaking');
            
            setTimeout(() => {
                pinataDisplay.classList.remove('breaking');
                pinataDisplay.classList.add('broken');
                actionStatus.textContent = 'Pinata exploded!';
                
                setTimeout(resolve, 800);
            }, 500);
        });
    }
    
    showPrizes() {
        // Hide game play area, show prize section
        document.getElementById('gamePlayArea').classList.add('hidden');
        document.getElementById('prizeSection').classList.remove('hidden');
        
        // Display prizes
        const prizesList = document.getElementById('prizesList');
        prizesList.innerHTML = '';
        
        this.prizes.forEach((prize, index) => {
            setTimeout(() => {
                const prizeElement = document.createElement('div');
                prizeElement.className = `prize-item ${prize.rarity}`;
                prizeElement.innerHTML = `
                    <span class="prize-icon">${prize.icon}</span>
                    <div class="prize-name">${prize.name}</div>
                    <div class="prize-value">${this.formatMC(prize.value)} MC</div>
                `;
                prizesList.appendChild(prizeElement);
            }, index * 200);
        });
        
        // Update summary after all prizes are shown
        setTimeout(() => {
            this.updatePrizeSummary();
        }, this.prizes.length * 200 + 500);
    }
    
    updatePrizeSummary() {
        document.getElementById('betAmountDisplay').textContent = `${this.formatMC(this.betAmount)} MC`;
        document.getElementById('prizeValueDisplay').textContent = `${this.formatMC(this.totalPrizeValue)} MC`;
        
        const result = this.totalPrizeValue - this.betAmount;
        const resultDisplay = document.getElementById('resultDisplay');
        
        resultDisplay.textContent = `${result >= 0 ? '+' : ''}${this.formatMC(result)} MC`;
        
        // Style based on result
        resultDisplay.classList.remove('profit', 'loss', 'break-even');
        if (result > 0) {
            resultDisplay.classList.add('profit');
        } else if (result < 0) {
            resultDisplay.classList.add('loss');
        } else {
            resultDisplay.classList.add('break-even');
        }
        
        // Send final results to server
        this.sendGameResults(result);
    }
    
    async sendGameResults(netResult) {
        try {
            await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'pinataparty',
                    action: 'complete_game',
                    betAmount: 0, // No additional bet deduction
                    gameData: {
                        prizes: this.prizes,
                        totalPrizeValue: this.totalPrizeValue,
                        netResult: netResult,
                        pinataType: this.selectedPinataType
                    }
                })
            });
        } catch (error) {
            console.error('Failed to send game results:', error);
        }
    }
    
    playAgain() {
        // Reset game state
        this.selectedPinataType = null;
        this.prizes = [];
        this.totalPrizeValue = 0;
        
        // Reset UI
        document.getElementById('prizeSection').classList.add('hidden');
        document.getElementById('bettingSection').classList.remove('hidden');
        
        // Clear pinata selection
        document.querySelectorAll('.pinata-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Update validation
        this.updateBetValidation();
        
        // Refresh balance
        this.checkAuthState();
    }
    
    formatMC(amount) {
        return parseFloat(amount).toFixed(4);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            info: '#3498db',
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick events
let pinataGame;

function initializePinataParty() {
    pinataGame = new PinataPartyGame();
}

function selectPinata(type) {
    if (pinataGame) {
        pinataGame.selectPinata(type);
    }
}

function setBetAmount(amount) {
    if (pinataGame) {
        pinataGame.setBetAmount(amount);
    }
}

function startPinataParty() {
    if (pinataGame) {
        pinataGame.startPinataParty();
    }
}

function playAgain() {
    if (pinataGame) {
        pinataGame.playAgain();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);