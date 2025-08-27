// Par4 Golf Betting Game Engine
class Par4Game {
    constructor() {
        this.currentUser = null;
        this.gameState = 'loading'; // loading, setup, playing, results
        this.canvas = null;
        this.ctx = null;
        
        // Game data
        this.course = null;
        this.golfer = null;
        this.baseBetAmount = 1000;
        this.pregameBets = [];
        this.liveBets = [];
        this.currentShot = 0;
        this.ballPosition = { x: 0, y: 0 };
        this.holePosition = { x: 0, y: 0 };
        this.shotHistory = [];
        
        // Game constants
        this.COUNTRIES = [
            { name: 'USA', flag: '🇺🇸' },
            { name: 'UK', flag: '🇬🇧' },
            { name: 'Germany', flag: '🇩🇪' },
            { name: 'Japan', flag: '🇯🇵' },
            { name: 'Australia', flag: '🇦🇺' },
            { name: 'Canada', flag: '🇨🇦' },
            { name: 'South Korea', flag: '🇰🇷' },
            { name: 'Spain', flag: '🇪🇸' },
            { name: 'Italy', flag: '🇮🇹' },
            { name: 'France', flag: '🇫🇷' },
            { name: 'Sweden', flag: '🇸🇪' },
            { name: 'Ireland', flag: '🇮🇪' }
        ];
        
        this.GOLFER_NAMES = [
            'Tiger Woods', 'Jack Nicklaus', 'Arnold Palmer', 'Gary Player', 'Jordan Spieth',
            'Rory McIlroy', 'Phil Mickelson', 'Brooks Koepka', 'Dustin Johnson', 'Justin Thomas',
            'Collin Morikawa', 'Xander Schauffele', 'Jon Rahm', 'Scottie Scheffler', 'Patrick Cantlay',
            'Tony Finau', 'Viktor Hovland', 'Cameron Smith', 'Shane Lowry', 'Hideki Matsuyama'
        ];
        
        this.COURSE_NAMES = [
            'Augusta National', 'Pebble Beach', 'St. Andrews', 'Pinehurst No. 2', 'Oakmont Country Club',
            'Bethpage Black', 'TPC Sawgrass', 'Whistling Straits', 'Royal Troon', 'Carnoustie',
            'The Old Course', 'Merion Golf Club', 'Shinnecock Hills', 'Congressional Country Club',
            'Baltusrol Golf Club', 'Winged Foot', 'Olympic Club', 'Torrey Pines', 'Kiawah Island'
        ];
        
        this.WEATHER_CONDITIONS = [
            { name: 'Perfect', icon: '☀️', windFactor: 1.0, difficultyModifier: 1.0 },
            { name: 'Partly Cloudy', icon: '⛅', windFactor: 1.1, difficultyModifier: 1.05 },
            { name: 'Overcast', icon: '☁️', windFactor: 1.15, difficultyModifier: 1.1 },
            { name: 'Light Breeze', icon: '🌤️', windFactor: 1.2, difficultyModifier: 1.15 },
            { name: 'Windy', icon: '💨', windFactor: 1.4, difficultyModifier: 1.3 },
            { name: 'Very Windy', icon: '🌪️', windFactor: 1.6, difficultyModifier: 1.5 }
        ];
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('golfCourse');
        this.ctx = this.canvas.getContext('2d');
        this.checkAuthState();
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
            this.startLoading();
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
        }
    }
    
    showAuthRequired() {
        // Show auth section, hide user profile
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('authSection').style.display = 'block';
        
        // Show message that authentication is required
        this.showNotification('Please login to play Par4 Golf Betting', 'info');
    }
    
    formatMC(amount) {
        return parseFloat(amount).toFixed(4);
    }
    
    startLoading() {
        this.gameState = 'loading';
        document.getElementById('loadingScreen').classList.add('active');
        
        // Simulate loading with progress bar
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            document.getElementById('loadingProgress').style.width = Math.min(100, progress) + '%';
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.generateGameData();
                    this.showSetupScreen();
                }, 500);
            }
        }, 100);
    }
    
    generateGameData() {
        // Generate course
        this.course = this.generateCourse();
        
        // Generate golfer
        this.golfer = this.generateGolfer();
        
        // Reset game state
        this.currentShot = 0;
        this.shotHistory = [];
        this.pregameBets = [];
        this.liveBets = [];
        
        // Set ball at tee position
        this.ballPosition = { x: 50, y: this.canvas.height / 2 };
        this.holePosition = { x: this.canvas.width - 50, y: this.canvas.height / 2 };
    }
    
    generateCourse() {
        const courseName = this.COURSE_NAMES[Math.floor(Math.random() * this.COURSE_NAMES.length)];
        const par = Math.floor(Math.random() * 3) + 3; // Par 3, 4, or 5
        const distance = par === 3 ? 120 + Math.random() * 80 : // 120-200 yards
                        par === 4 ? 250 + Math.random() * 150 : // 250-400 yards  
                        450 + Math.random() * 100; // 450-550 yards
        
        const weather = this.WEATHER_CONDITIONS[Math.floor(Math.random() * this.WEATHER_CONDITIONS.length)];
        const windSpeed = Math.floor(Math.random() * 15) + 5; // 5-20 mph
        const windDirection = Math.floor(Math.random() * 360); // degrees
        
        // Generate course layout obstacles
        const obstacles = [];
        const numObstacles = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < numObstacles; i++) {
            obstacles.push({
                type: ['bunker', 'water', 'trees', 'rough'][Math.floor(Math.random() * 4)],
                x: 100 + Math.random() * (this.canvas.width - 200),
                y: 50 + Math.random() * (this.canvas.height - 100),
                width: 30 + Math.random() * 50,
                height: 30 + Math.random() * 50
            });
        }
        
        return {
            name: courseName,
            par: par,
            distance: Math.round(distance),
            weather: weather,
            windSpeed: windSpeed,
            windDirection: windDirection,
            obstacles: obstacles,
            maxShots: par + 4 // Allow up to 4 over par
        };
    }
    
    generateGolfer() {
        const name = this.GOLFER_NAMES[Math.floor(Math.random() * this.GOLFER_NAMES.length)];
        const country = this.COUNTRIES[Math.floor(Math.random() * this.COUNTRIES.length)];
        
        // Generate stats (1.0 to 9.0, higher is better)
        const power = 1 + Math.random() * 8; // Affects distance
        const accuracy = 1 + Math.random() * 8; // Affects precision
        const putting = 1 + Math.random() * 8; // Affects short game
        
        return {
            name: name,
            country: country,
            stats: {
                power: Math.round(power * 10) / 10,
                accuracy: Math.round(accuracy * 10) / 10,
                putting: Math.round(putting * 10) / 10
            }
        };
    }
    
    showSetupScreen() {
        // Hide loading, show setup
        document.getElementById('loadingScreen').classList.remove('active');
        document.getElementById('setupScreen').classList.add('active');
        
        // Update course information
        document.getElementById('courseName').textContent = this.course.name;
        document.getElementById('coursePar').textContent = this.course.par;
        document.getElementById('courseDistance').textContent = `${this.course.distance}y`;
        document.getElementById('courseWeather').textContent = `${this.course.weather.icon} ${this.course.weather.name}`;
        document.getElementById('courseWind').textContent = `${this.course.windSpeed}mph`;
        
        // Update golfer information
        document.getElementById('golferName').textContent = this.golfer.name;
        document.getElementById('golferFlag').textContent = this.golfer.country.flag;
        document.getElementById('golferCountry').textContent = this.golfer.country.name;
        document.getElementById('golferPower').textContent = this.golfer.stats.power;
        document.getElementById('golferAccuracy').textContent = this.golfer.stats.accuracy;
        document.getElementById('golferPutting').textContent = this.golfer.stats.putting;
        
        // Generate course mini-map
        this.drawCourseMiniMap();
        
        // Calculate and display betting odds
        this.calculatePregameOdds();
        
        // Setup betting event listeners
        this.setupBettingInterface();
    }
    
    drawCourseMiniMap() {
        const miniMap = document.getElementById('courseMiniMap');
        miniMap.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 300 150">
                <!-- Fairway -->
                <rect x="10" y="50" width="280" height="50" fill="#4da54d" stroke="#2d8f2d" stroke-width="2"/>
                
                <!-- Tee -->
                <circle cx="25" cy="75" r="8" fill="#8B4513"/>
                <text x="25" y="80" text-anchor="middle" fill="white" font-size="10">T</text>
                
                <!-- Hole -->
                <circle cx="275" cy="75" r="6" fill="#000"/>
                <circle cx="275" cy="75" r="4" fill="#333"/>
                
                <!-- Obstacles -->
                ${this.course.obstacles.map((obs, i) => {
                    const x = 10 + (obs.x / this.canvas.width) * 280;
                    const y = 50 + (obs.y / this.canvas.height) * 50;
                    const w = (obs.width / this.canvas.width) * 280;
                    const h = (obs.height / this.canvas.height) * 50;
                    
                    const colors = {
                        bunker: '#DEB887',
                        water: '#4169E1',
                        trees: '#228B22',
                        rough: '#6B8E23'
                    };
                    
                    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colors[obs.type]}" rx="3"/>`;
                }).join('')}
                
                <!-- Par indicator -->
                <text x="150" y="20" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">Par ${this.course.par}</text>
                <text x="150" y="135" text-anchor="middle" fill="#ccc" font-size="10">${this.course.distance} yards</text>
            </svg>
        `;
    }
    
    calculatePregameOdds() {
        // Base odds calculation considering golfer stats and course conditions
        const avgStat = (this.golfer.stats.power + this.golfer.stats.accuracy + this.golfer.stats.putting) / 3;
        const difficulty = this.course.weather.difficultyModifier;
        const parDifficulty = this.course.par === 3 ? 0.8 : this.course.par === 4 ? 1.0 : 1.3;
        
        // Hole in one odds (very rare)
        const holeInOneBase = this.course.par === 3 ? 0.02 : this.course.par === 4 ? 0.005 : 0.001;
        const holeInOneChance = holeInOneBase * (avgStat / 5) / difficulty;
        const holeInOneOdds = Math.max(25, Math.round(1 / holeInOneChance));
        
        // Under par odds
        const underParChance = Math.max(0.05, Math.min(0.4, (avgStat / 5) / (difficulty * parDifficulty)));
        const underParOdds = Math.max(2, Math.round(1 / underParChance));
        
        // On par odds
        const onParChance = Math.max(0.2, Math.min(0.6, 0.4 * (avgStat / 5) / difficulty));
        const onParOdds = Math.max(1.5, Math.round(1 / onParChance * 10) / 10);
        
        // Update odds display
        document.getElementById('holeInOneOdds').textContent = `${holeInOneOdds}x`;
        document.getElementById('underParOdds').textContent = `${underParOdds}x`;
        document.getElementById('onParOdds').textContent = `${onParOdds}x`;
        
        // Store odds for later use
        this.pregameOdds = {
            holeInOne: holeInOneOdds,
            underPar: underParOdds,
            onPar: onParOdds,
            safePay: 1.0
        };
    }
    
    setupBettingInterface() {
        // Bet amount input
        const betAmountInput = document.getElementById('betAmount');
        betAmountInput.addEventListener('change', (e) => {
            this.baseBetAmount = Math.max(100, parseInt(e.target.value) || 1000);
        });
        
        // Bet option selection
        document.querySelectorAll('.bet-option').forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('selected');
                this.updateSelectedBets();
            });
        });
    }
    
    updateSelectedBets() {
        const selectedOptions = document.querySelectorAll('.bet-option.selected');
        const startBtn = document.getElementById('startGameBtn');
        
        // Require at least one bet to start
        startBtn.disabled = selectedOptions.length === 0 || !this.currentUser || this.currentUser.mcBalance < this.baseBetAmount;
        
        if (startBtn.disabled && this.currentUser) {
            if (selectedOptions.length === 0) {
                startBtn.textContent = '🚫 Select at least one bet';
            } else if (this.currentUser.mcBalance < this.baseBetAmount) {
                startBtn.textContent = '🚫 Insufficient balance';
            }
        } else if (!startBtn.disabled) {
            startBtn.textContent = '🏌️ Start Round';
        }
    }
    
    async startGame() {
        if (!this.currentUser) {
            this.showNotification('Please login to play', 'error');
            return;
        }
        
        // Get selected bets
        const selectedOptions = document.querySelectorAll('.bet-option.selected');
        if (selectedOptions.length === 0) {
            this.showNotification('Please select at least one bet option', 'error');
            return;
        }
        
        // Calculate total bet amount
        let totalBetAmount = 0;
        this.pregameBets = [];
        
        selectedOptions.forEach(option => {
            const betType = option.dataset.bet;
            this.pregameBets.push({
                type: betType,
                amount: this.baseBetAmount,
                odds: this.pregameOdds[this.camelCase(betType)] || 1
            });
            totalBetAmount += this.baseBetAmount;
        });
        
        // Check if user has enough balance
        if (this.currentUser.mcBalance < totalBetAmount) {
            this.showNotification('Insufficient balance for selected bets', 'error');
            return;
        }
        
        try {
            // Place bets on server
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'par4',
                    betAmount: totalBetAmount,
                    action: 'start_round',
                    gameData: {
                        course: this.course,
                        golfer: this.golfer,
                        pregameBets: this.pregameBets
                    }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update user balance
                this.currentUser.mcBalance = result.newBalance;
                this.updateUserDisplay();
                
                // Start the golf round
                this.startGolfRound();
            } else {
                this.showNotification(result.error || 'Failed to start game', 'error');
            }
        } catch (error) {
            this.showNotification('Network error', 'error');
        }
    }
    
    startGolfRound() {
        this.gameState = 'playing';
        
        // Hide setup, show game screen
        document.getElementById('setupScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        
        // Initialize game display
        this.currentShot = 1;
        this.updateGameDisplay();
        this.drawCourse();
        this.updateLiveBettingOptions();
    }
    
    updateGameDisplay() {
        document.getElementById('currentShot').textContent = this.currentShot;
        document.getElementById('maxShots').textContent = this.course.maxShots;
        
        // Calculate distance to hole
        const distance = this.calculateDistance(this.ballPosition, this.holePosition);
        document.getElementById('distanceToHole').textContent = `${Math.round(distance)}y`;
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Convert pixel distance to yards (approximate)
        return (pixelDistance / this.canvas.width) * this.course.distance;
    }
    
    drawCourse() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background (sky and ground)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.7, '#90EE90'); // Light green
        gradient.addColorStop(1, '#228B22'); // Forest green
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fairway
        this.ctx.fillStyle = '#4da54d';
        this.ctx.fillRect(20, this.canvas.height * 0.3, this.canvas.width - 40, this.canvas.height * 0.4);
        
        // Draw obstacles
        this.course.obstacles.forEach(obstacle => {
            const colors = {
                bunker: '#DEB887',
                water: '#4169E1', 
                trees: '#228B22',
                rough: '#6B8E23'
            };
            
            this.ctx.fillStyle = colors[obstacle.type];
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Add obstacle labels
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(obstacle.type.toUpperCase(), obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
        });
        
        // Draw tee
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(30, this.canvas.height/2 - 10, 20, 20);
        
        // Draw hole
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.holePosition.x, this.holePosition.y, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw flag
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.holePosition.x, this.holePosition.y);
        this.ctx.lineTo(this.holePosition.x, this.holePosition.y - 30);
        this.ctx.stroke();
        
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.holePosition.x, this.holePosition.y - 30, 15, 10);
        
        // Draw golf ball
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.ballPosition.x, this.ballPosition.y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw shot history (trajectory)
        if (this.shotHistory.length > 0) {
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            
            let prevPos = { x: 50, y: this.canvas.height / 2 };
            this.shotHistory.forEach(shot => {
                this.ctx.moveTo(prevPos.x, prevPos.y);
                this.ctx.lineTo(shot.endPosition.x, shot.endPosition.y);
                prevPos = shot.endPosition;
            });
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    updateLiveBettingOptions() {
        const distance = this.calculateDistance(this.ballPosition, this.holePosition);
        
        // Calculate current shot odds
        const holeThisShotChance = this.calculateShotSuccessChance(distance);
        const holeThisShotMultiplier = Math.max(2, Math.round(1 / holeThisShotChance));
        
        const nextTwoShotsChance = Math.min(0.7, holeThisShotChance + 0.3);
        const nextTwoShotsMultiplier = Math.max(1.2, Math.round((1 / nextTwoShotsChance) * 10) / 10);
        
        // Update display
        document.getElementById('holeThisShotMultiplier').querySelector('.mult-value').textContent = `${holeThisShotMultiplier}x`;
        document.getElementById('nextShotMultiplier').querySelector('.mult-value').textContent = `${nextTwoShotsMultiplier}x`;
        
        // Store current multipliers
        this.currentMultipliers = {
            holeThisShot: holeThisShotMultiplier,
            nextTwoShots: nextTwoShotsMultiplier
        };
    }
    
    calculateShotSuccessChance(distance) {
        // Base chance depends on distance
        let baseChance;
        if (distance < 10) {
            baseChance = 0.8; // Very close to hole
        } else if (distance < 50) {
            baseChance = 0.4; // Close
        } else if (distance < 150) {
            baseChance = 0.2; // Medium distance
        } else if (distance < 300) {
            baseChance = 0.1; // Long shot
        } else {
            baseChance = 0.05; // Very long shot
        }
        
        // Adjust for golfer stats
        const avgStat = (this.golfer.stats.power + this.golfer.stats.accuracy + this.golfer.stats.putting) / 3;
        const statModifier = avgStat / 5; // Convert to 0-1.8 range
        
        // Adjust for weather
        const weatherModifier = 1 / this.course.weather.difficultyModifier;
        
        return Math.min(0.9, baseChance * statModifier * weatherModifier);
    }
    
    async placeLiveBet() {
        if (!this.currentUser) return;
        
        const betAmount = this.baseBetAmount;
        if (this.currentUser.mcBalance < betAmount) {
            this.showNotification('Insufficient balance for live bet', 'error');
            return;
        }
        
        // Create live bet
        const liveBet = {
            type: 'hole_this_shot',
            amount: betAmount,
            multiplier: this.currentMultipliers.holeThisShot,
            shot: this.currentShot
        };
        
        this.liveBets.push(liveBet);
        
        // Update balance locally (will be confirmed by server)
        this.currentUser.mcBalance -= betAmount;
        this.updateUserDisplay();
        
        // Add to active bets display
        this.updateActiveBetsDisplay();
        
        this.showNotification(`Live bet placed: ${betAmount} MC at ${liveBet.multiplier}x odds`, 'success');
    }
    
    waitForNextShot() {
        this.showNotification('Waiting for shot result...', 'info');
        document.getElementById('betNowBtn').disabled = true;
        document.getElementById('waitBtn').disabled = true;
    }
    
    updateActiveBetsDisplay() {
        const activeBetsList = document.getElementById('activeBetsList');
        activeBetsList.innerHTML = '';
        
        // Show pregame bets
        this.pregameBets.forEach(bet => {
            const betElement = document.createElement('div');
            betElement.className = 'active-bet';
            betElement.innerHTML = `
                <span class="bet-description">${this.formatBetType(bet.type)}</span>
                <span class="bet-potential">+${Math.round(bet.amount * bet.odds)} MC</span>
            `;
            activeBetsList.appendChild(betElement);
        });
        
        // Show live bets
        this.liveBets.forEach(bet => {
            const betElement = document.createElement('div');
            betElement.className = 'active-bet';
            betElement.innerHTML = `
                <span class="bet-description">Shot ${bet.shot} (${bet.multiplier}x)</span>
                <span class="bet-potential">+${Math.round(bet.amount * bet.multiplier)} MC</span>
            `;
            activeBetsList.appendChild(betElement);
        });
        
        if (this.pregameBets.length === 0 && this.liveBets.length === 0) {
            activeBetsList.innerHTML = '<div style="color: #ccc; text-align: center;">No active bets</div>';
        }
    }
    
    formatBetType(type) {
        const types = {
            'hole-in-one': 'Hole in One',
            'under-par': 'Under Par',
            'on-par': 'On Par', 
            'safe-play': 'Safe Play'
        };
        return types[type] || type;
    }
    
    async takeShot() {
        document.getElementById('takeShot').disabled = true;
        document.getElementById('shotStatus').textContent = 'Taking shot...';
        
        // Simulate shot with animation
        await this.animateShot();
        
        // Calculate shot result
        const shotResult = this.calculateShotResult();
        
        // Update game state
        this.shotHistory.push(shotResult);
        this.ballPosition = shotResult.endPosition;
        this.currentShot++;
        
        // Check for game end conditions
        if (this.checkGameEnd(shotResult)) {
            this.endGame();
        } else {
            // Continue game
            this.updateGameDisplay();
            this.updateLiveBettingOptions();
            this.drawCourse();
            
            // Re-enable controls
            document.getElementById('takeShot').disabled = false;
            document.getElementById('betNowBtn').disabled = false;
            document.getElementById('waitBtn').disabled = false;
            document.getElementById('shotStatus').textContent = 'Ready for next shot...';
        }
    }
    
    async animateShot() {
        return new Promise(resolve => {
            let progress = 0;
            const startPos = { ...this.ballPosition };
            const targetDistance = Math.random() * 100 + 50; // Random shot distance
            const targetAngle = (Math.random() - 0.5) * 0.5; // Random angle variation
            
            const targetPos = {
                x: Math.min(this.canvas.width - 50, startPos.x + targetDistance * Math.cos(targetAngle)),
                y: Math.max(50, Math.min(this.canvas.height - 50, startPos.y + targetDistance * Math.sin(targetAngle)))
            };
            
            const animateFrame = () => {
                progress += 0.05;
                
                if (progress <= 1) {
                    // Update ball position
                    this.ballPosition.x = startPos.x + (targetPos.x - startPos.x) * progress;
                    this.ballPosition.y = startPos.y + (targetPos.y - startPos.y) * progress;
                    
                    this.drawCourse();
                    requestAnimationFrame(animateFrame);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animateFrame);
        });
    }
    
    calculateShotResult() {
        const distance = this.calculateDistance(this.ballPosition, this.holePosition);
        const shotPower = 50 + Math.random() * 100; // Base shot power
        
        // Calculate success based on golfer stats and conditions
        const powerFactor = this.golfer.stats.power / 5;
        const accuracyFactor = this.golfer.stats.accuracy / 5;
        const weatherFactor = 1 / this.course.weather.difficultyModifier;
        
        // Determine if shot is successful (reaches hole)
        const successChance = this.calculateShotSuccessChance(distance);
        const isSuccessful = Math.random() < successChance;
        
        let endPosition;
        if (isSuccessful && distance < 200) {
            // Ball reaches hole
            endPosition = { ...this.holePosition };
        } else {
            // Calculate new position based on shot
            const shotDistance = shotPower * powerFactor * weatherFactor;
            const accuracy = (0.8 + Math.random() * 0.4) * accuracyFactor; // 0.8-1.2 * accuracy
            
            const directionToHole = Math.atan2(this.holePosition.y - this.ballPosition.y, this.holePosition.x - this.ballPosition.x);
            const actualDirection = directionToHole + (Math.random() - 0.5) * (2 - accuracy) * 0.5;
            
            endPosition = {
                x: Math.max(50, Math.min(this.canvas.width - 50, this.ballPosition.x + shotDistance * Math.cos(actualDirection))),
                y: Math.max(50, Math.min(this.canvas.height - 50, this.ballPosition.y + shotDistance * Math.sin(actualDirection)))
            };
        }
        
        return {
            shotNumber: this.currentShot,
            startPosition: { ...this.ballPosition },
            endPosition: endPosition,
            isHole: isSuccessful && distance < 200,
            distance: this.calculateDistance(this.ballPosition, endPosition)
        };
    }
    
    checkGameEnd(shotResult) {
        // Game ends if ball is in hole or max shots reached
        const distanceToHole = this.calculateDistance(shotResult.endPosition, this.holePosition);
        return distanceToHole < 10 || this.currentShot >= this.course.maxShots;
    }
    
    async endGame() {
        // Calculate final results
        const finalDistance = this.calculateDistance(this.ballPosition, this.holePosition);
        const isHole = finalDistance < 10;
        const shotsOverPar = this.currentShot - this.course.par;
        
        // Calculate payouts
        const payouts = this.calculatePayouts(isHole, shotsOverPar);
        
        // Send results to server
        try {
            const response = await fetch('/api/play-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    gameType: 'par4',
                    action: 'end_round',
                    gameData: {
                        shotsUsed: this.currentShot,
                        isHole: isHole,
                        shotsOverPar: shotsOverPar,
                        payouts: payouts
                    }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser.mcBalance = result.newBalance;
                this.updateUserDisplay();
            }
        } catch (error) {
            console.error('Failed to update results:', error);
        }
        
        // Show results screen
        this.showResults(isHole, shotsOverPar, payouts);
    }
    
    calculatePayouts(isHole, shotsOverPar) {
        let totalPayout = 0;
        const payouts = [];
        
        // Check pregame bets
        this.pregameBets.forEach(bet => {
            let won = false;
            
            switch (bet.type) {
                case 'hole-in-one':
                    won = this.currentShot === 1 && isHole;
                    break;
                case 'under-par':
                    won = isHole && shotsOverPar < 0;
                    break;
                case 'on-par':
                    won = isHole && shotsOverPar === 0;
                    break;
                case 'safe-play':
                    won = isHole; // Always pays out if finished
                    break;
            }
            
            if (won) {
                const payout = bet.amount * bet.odds;
                totalPayout += payout;
                payouts.push({
                    type: bet.type,
                    amount: bet.amount,
                    payout: payout,
                    description: this.formatBetType(bet.type)
                });
            }
        });
        
        // Check live bets
        this.liveBets.forEach(bet => {
            if (bet.type === 'hole_this_shot') {
                // Check if ball went in hole on the bet shot
                const shotResult = this.shotHistory[bet.shot - 1];
                if (shotResult && shotResult.isHole) {
                    const payout = bet.amount * bet.multiplier;
                    totalPayout += payout;
                    payouts.push({
                        type: 'live_bet',
                        amount: bet.amount,
                        payout: payout,
                        description: `Shot ${bet.shot} Success`
                    });
                }
            }
        });
        
        return { total: totalPayout, breakdown: payouts };
    }
    
    showResults(isHole, shotsOverPar, payouts) {
        // Hide game screen, show results
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('resultsScreen').classList.add('active');
        
        // Update result text
        const resultText = isHole ? 
            (this.currentShot === 1 ? 'HOLE IN ONE!' : 
             shotsOverPar < 0 ? 'UNDER PAR!' :
             shotsOverPar === 0 ? 'ON PAR!' : 'FINISHED!') : 
            'ROUND OVER';
        
        document.getElementById('roundResult').textContent = resultText;
        
        // Update score display
        const scoreText = isHole ? 
            (shotsOverPar === 0 ? 'Par' : 
             shotsOverPar > 0 ? `Par +${shotsOverPar}` : 
             `Par ${shotsOverPar}`) : 'Did not finish';
        
        document.getElementById('finalScore').textContent = scoreText;
        document.getElementById('shotsTaken').textContent = this.currentShot;
        
        // Update payout breakdown
        const payoutBreakdown = document.getElementById('payoutBreakdown');
        payoutBreakdown.innerHTML = '';
        
        if (payouts.breakdown.length > 0) {
            payouts.breakdown.forEach(payout => {
                const payoutItem = document.createElement('div');
                payoutItem.className = 'payout-item';
                payoutItem.innerHTML = `
                    <span class="payout-description">${payout.description}</span>
                    <span class="payout-value">+${this.formatMC(payout.payout)} MC</span>
                `;
                payoutBreakdown.appendChild(payoutItem);
            });
        } else {
            payoutBreakdown.innerHTML = '<div style="text-align: center; color: #ccc;">No winning bets this round</div>';
        }
        
        document.getElementById('totalPayout').textContent = `${this.formatMC(payouts.total)} MC`;
    }
    
    camelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
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
let par4Game;

function initializePar4Game() {
    par4Game = new Par4Game();
}

function setBetAmount(amount) {
    document.getElementById('betAmount').value = amount;
    par4Game.baseBetAmount = amount;
    par4Game.updateSelectedBets();
}

function startGame() {
    if (par4Game) {
        par4Game.startGame();
    }
}

function placeLiveBet() {
    if (par4Game) {
        par4Game.placeLiveBet();
    }
}

function waitForNextShot() {
    if (par4Game) {
        par4Game.waitForNextShot();
    }
}

function takeShot() {
    if (par4Game) {
        par4Game.takeShot();
    }
}

function newGame() {
    if (par4Game) {
        // Reset to setup screen
        document.getElementById('resultsScreen').classList.remove('active');
        par4Game.startLoading();
    }
}

// CSS animations
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