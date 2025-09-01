// FamousFighter - Advanced 2D Fighting Game
class FamousFighter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.initializeGame();
        this.setupEventListeners();
        
        // Start rendering immediately to show background
        this.startMenuRendering();
        
        console.log('FamousFighter initialized successfully');
    }

    initializeGame() {
        // Game state
        this.gameState = 'menu'; // menu, fighterSelect, fighting, gameOver
        this.currentScreen = 'menu';
        
        // Round management
        this.currentRound = 1;
        this.maxRounds = 3;
        this.player1Wins = 0;
        this.player2Wins = 0;
        
        // Fight timer
        this.fightTimer = 99;
        this.timerInterval = null;
        
        // Selected fighters
        this.selectedFighters = {
            player1: null,
            player2: null
        };
        
        // Input handling
        this.keys = {};
        this.inputBuffer = {
            player1: [],
            player2: []
        };
        
        // Initialize fighters data
        this.initializeFighters();
        
        // Initialize default demo fighters for display
        this.initializeDemoFighters();
        
        // Animation frame
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        console.log('Game initialized with', this.fighters.length, 'fighters');
    }

    initializeFighters() {
        this.fighters = [
            {
                id: 'razor',
                name: 'Razor',
                avatar: '🗡️',
                origin: 'Shadow Realm',
                race: 'Shadow-Human',
                personality: 'Silent but deadly assassin',
                nationality: 'Unknown',
                description: 'A mysterious warrior from the shadow realm, Razor moves with supernatural speed and precision.',
                stats: {
                    speed: 9,
                    power: 7,
                    defense: 6,
                    technique: 8
                },
                specialties: ['Quick strikes', 'Shadow combos'],
                moves: {
                    lightPunch: {
                        damage: 8,
                        speed: 12,
                        hitbox: { x: 0, y: -20, width: 35, height: 15 },
                        animation: 'razorJab',
                        startup: 3,
                        recovery: 8
                    },
                    heavyPunch: {
                        damage: 15,
                        speed: 8,
                        hitbox: { x: 0, y: -25, width: 45, height: 20 },
                        animation: 'razorSlash',
                        startup: 8,
                        recovery: 15
                    },
                    kick: {
                        damage: 12,
                        speed: 10,
                        hitbox: { x: 0, y: -15, width: 40, height: 25 },
                        animation: 'razorKick',
                        startup: 5,
                        recovery: 12
                    },
                    jumpPunch: {
                        damage: 14,
                        speed: 9,
                        hitbox: { x: 0, y: -30, width: 38, height: 18 },
                        animation: 'razorDive',
                        startup: 6,
                        recovery: 10
                    }
                }
            },
            {
                id: 'blaze',
                name: 'Blaze',
                avatar: '🔥',
                origin: 'Fire Mountains',
                race: 'Phoenix-Human',
                personality: 'Hot-headed and explosive',
                nationality: 'Volcanic Islands',
                description: 'Born from the flames, Blaze channels the power of fire in devastating attacks.',
                stats: {
                    speed: 7,
                    power: 9,
                    defense: 5,
                    technique: 6
                },
                specialties: ['Power attacks', 'Fire combos'],
                moves: {
                    lightPunch: {
                        damage: 10,
                        speed: 9,
                        hitbox: { x: 0, y: -22, width: 38, height: 18 },
                        animation: 'blazeJab',
                        startup: 4,
                        recovery: 10
                    },
                    heavyPunch: {
                        damage: 18,
                        speed: 6,
                        hitbox: { x: 0, y: -28, width: 50, height: 25 },
                        animation: 'blazeInferno',
                        startup: 12,
                        recovery: 18
                    },
                    kick: {
                        damage: 13,
                        speed: 8,
                        hitbox: { x: 0, y: -18, width: 42, height: 28 },
                        animation: 'blazeFlame',
                        startup: 6,
                        recovery: 14
                    },
                    jumpPunch: {
                        damage: 16,
                        speed: 7,
                        hitbox: { x: 0, y: -32, width: 45, height: 22 },
                        animation: 'blazeMeteor',
                        startup: 8,
                        recovery: 12
                    }
                }
            },
            {
                id: 'frost',
                name: 'Frost',
                avatar: '❄️',
                origin: 'Ice Peaks',
                race: 'Ice-Human',
                personality: 'Cool and calculating',
                nationality: 'Arctic Territories',
                description: 'Master of ice magic, Frost combines graceful movements with freezing attacks.',
                stats: {
                    speed: 8,
                    power: 6,
                    defense: 8,
                    technique: 9
                },
                specialties: ['Counter-attacks', 'Ice techniques'],
                moves: {
                    lightPunch: {
                        damage: 7,
                        speed: 11,
                        hitbox: { x: 0, y: -19, width: 32, height: 16 },
                        animation: 'frostJab',
                        startup: 2,
                        recovery: 7
                    },
                    heavyPunch: {
                        damage: 14,
                        speed: 9,
                        hitbox: { x: 0, y: -26, width: 48, height: 22 },
                        animation: 'frostFreeze',
                        startup: 6,
                        recovery: 13
                    },
                    kick: {
                        damage: 11,
                        speed: 12,
                        hitbox: { x: 0, y: -16, width: 36, height: 24 },
                        animation: 'frostSlide',
                        startup: 4,
                        recovery: 9
                    },
                    jumpPunch: {
                        damage: 13,
                        speed: 10,
                        hitbox: { x: 0, y: -28, width: 40, height: 20 },
                        animation: 'frostDrop',
                        startup: 5,
                        recovery: 11
                    }
                }
            },
            {
                id: 'storm',
                name: 'Storm',
                avatar: '⚡',
                origin: 'Sky Temples',
                race: 'Storm-Human',
                personality: 'Unpredictable and electric',
                nationality: 'Cloud Kingdom',
                description: 'Controls the power of lightning and thunder, striking with shocking speed.',
                stats: {
                    speed: 10,
                    power: 7,
                    defense: 4,
                    technique: 7
                },
                specialties: ['Lightning speed', 'Chain combos'],
                moves: {
                    lightPunch: {
                        damage: 9,
                        speed: 14,
                        hitbox: { x: 0, y: -21, width: 33, height: 14 },
                        animation: 'stormZap',
                        startup: 2,
                        recovery: 6
                    },
                    heavyPunch: {
                        damage: 16,
                        speed: 10,
                        hitbox: { x: 0, y: -27, width: 47, height: 23 },
                        animation: 'stormBolt',
                        startup: 7,
                        recovery: 14
                    },
                    kick: {
                        damage: 12,
                        speed: 13,
                        hitbox: { x: 0, y: -17, width: 39, height: 26 },
                        animation: 'stormKick',
                        startup: 3,
                        recovery: 10
                    },
                    jumpPunch: {
                        damage: 15,
                        speed: 11,
                        hitbox: { x: 0, y: -29, width: 41, height: 19 },
                        animation: 'stormDive',
                        startup: 4,
                        recovery: 9
                    }
                }
            },
            {
                id: 'terra',
                name: 'Terra',
                avatar: '🌍',
                origin: 'Earth Core',
                race: 'Earth-Human',
                personality: 'Steady and immovable',
                nationality: 'Mountain Clans',
                description: 'Draws power from the earth itself, with rock-solid defense and crushing attacks.',
                stats: {
                    speed: 5,
                    power: 8,
                    defense: 10,
                    technique: 5
                },
                specialties: ['Heavy armor', 'Ground pounds'],
                moves: {
                    lightPunch: {
                        damage: 11,
                        speed: 7,
                        hitbox: { x: 0, y: -23, width: 40, height: 20 },
                        animation: 'terraJab',
                        startup: 5,
                        recovery: 12
                    },
                    heavyPunch: {
                        damage: 20,
                        speed: 4,
                        hitbox: { x: 0, y: -30, width: 55, height: 28 },
                        animation: 'terraSmash',
                        startup: 15,
                        recovery: 22
                    },
                    kick: {
                        damage: 14,
                        speed: 6,
                        hitbox: { x: 0, y: -19, width: 44, height: 30 },
                        animation: 'terraQuake',
                        startup: 8,
                        recovery: 16
                    },
                    jumpPunch: {
                        damage: 17,
                        speed: 5,
                        hitbox: { x: 0, y: -33, width: 48, height: 26 },
                        animation: 'terraCrash',
                        startup: 10,
                        recovery: 15
                    }
                }
            },
            {
                id: 'mystic',
                name: 'Mystic',
                avatar: '🔮',
                origin: 'Astral Plane',
                race: 'Feline-Human',
                personality: 'Wise and mysterious',
                nationality: 'Ancient Temples',
                description: 'A feline-human hybrid with mystical powers and incredible agility.',
                stats: {
                    speed: 8,
                    power: 6,
                    defense: 7,
                    technique: 10
                },
                specialties: ['Magic attacks', 'Teleports'],
                moves: {
                    lightPunch: {
                        damage: 8,
                        speed: 13,
                        hitbox: { x: 0, y: -18, width: 30, height: 12 },
                        animation: 'mysticClaw',
                        startup: 2,
                        recovery: 8
                    },
                    heavyPunch: {
                        damage: 13,
                        speed: 11,
                        hitbox: { x: 0, y: -24, width: 42, height: 18 },
                        animation: 'mysticOrb',
                        startup: 5,
                        recovery: 11
                    },
                    kick: {
                        damage: 10,
                        speed: 14,
                        hitbox: { x: 0, y: -14, width: 34, height: 22 },
                        animation: 'mysticLeap',
                        startup: 3,
                        recovery: 8
                    },
                    jumpPunch: {
                        damage: 12,
                        speed: 12,
                        hitbox: { x: 0, y: -26, width: 36, height: 16 },
                        animation: 'mysticDash',
                        startup: 4,
                        recovery: 10
                    }
                }
            }
        ];
    }

    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        // Add to input buffer for combo detection
        if (this.gameState === 'fighting') {
            this.addToInputBuffer(e.code);
        }
        
        // Prevent default for game keys
        const gameKeys = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 
                         'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Digit1', 'Digit2', 'Digit3'];
        if (gameKeys.includes(e.code)) {
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    addToInputBuffer(keyCode) {
        const timestamp = Date.now();
        
        // Player 1 keys
        if (['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL'].includes(keyCode)) {
            this.inputBuffer.player1.push({ key: keyCode, time: timestamp });
            // Keep buffer size manageable
            if (this.inputBuffer.player1.length > 10) {
                this.inputBuffer.player1.shift();
            }
        }
        
        // Player 2 keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Digit1', 'Digit2', 'Digit3'].includes(keyCode)) {
            this.inputBuffer.player2.push({ key: keyCode, time: timestamp });
            if (this.inputBuffer.player2.length > 10) {
                this.inputBuffer.player2.shift();
            }
        }
    }

    // Menu System
    showMenu() {
        this.gameState = 'menu';
        this.currentScreen = 'menu';
        document.getElementById('gameMenu').classList.remove('hidden');
        document.getElementById('fighterSelect').classList.add('hidden');
        document.getElementById('controlsScreen').classList.add('hidden');
        document.getElementById('fightersScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }

    showFighterSelect() {
        this.gameState = 'fighterSelect';
        this.currentScreen = 'fighterSelect';
        this.generateFighterSelection();
        document.getElementById('gameMenu').classList.add('hidden');
        document.getElementById('fighterSelect').classList.remove('hidden');
    }

    showControls() {
        this.currentScreen = 'controls';
        document.getElementById('gameMenu').classList.add('hidden');
        document.getElementById('controlsScreen').classList.remove('hidden');
    }

    showFighters() {
        this.currentScreen = 'fighters';
        this.generateFighterProfiles();
        document.getElementById('gameMenu').classList.add('hidden');
        document.getElementById('fightersScreen').classList.remove('hidden');
    }

    generateFighterSelection() {
        const grid = document.getElementById('fighterGrid');
        grid.innerHTML = '';
        
        this.fighters.forEach(fighter => {
            const card = document.createElement('div');
            card.className = 'fighter-card';
            card.setAttribute('data-fighter-id', fighter.id);
            
            card.innerHTML = `
                <div class="fighter-avatar">${fighter.avatar}</div>
                <div class="fighter-name">${fighter.name}</div>
                <div class="fighter-origin">${fighter.origin}</div>
                <div class="fighter-stats">
                    <div class="stat">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${fighter.stats.speed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Power</span>
                        <span class="stat-value">${fighter.stats.power}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Defense</span>
                        <span class="stat-value">${fighter.stats.defense}</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => this.selectFighter(fighter.id, card));
            grid.appendChild(card);
        });
    }

    selectFighter(fighterId, cardElement) {
        // Remove previous selections
        document.querySelectorAll('.fighter-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new fighter
        cardElement.classList.add('selected');
        
        // For now, both players use the same fighter (single player mode)
        // TODO: Implement proper player selection
        this.selectedFighters.player1 = fighterId;
        this.selectedFighters.player2 = this.fighters[Math.floor(Math.random() * this.fighters.length)].id;
        
        // Enable start button
        document.getElementById('startFightBtn').disabled = false;
    }

    generateFighterProfiles() {
        const profiles = document.getElementById('fighterProfiles');
        profiles.innerHTML = '';
        
        this.fighters.forEach(fighter => {
            const profile = document.createElement('div');
            profile.className = 'fighter-profile';
            
            profile.innerHTML = `
                <div class="profile-avatar">${fighter.avatar}</div>
                <div class="fighter-name">${fighter.name}</div>
                <div class="fighter-origin">${fighter.origin}</div>
                <div class="profile-details">
                    <h4>Background</h4>
                    <p><strong>Race:</strong> ${fighter.race}</p>
                    <p><strong>Nationality:</strong> ${fighter.nationality}</p>
                    <p><strong>Personality:</strong> ${fighter.personality}</p>
                    <p>${fighter.description}</p>
                    <h4>Specialties</h4>
                    <p>${fighter.specialties.join(', ')}</p>
                </div>
                <div class="profile-stats">
                    <div class="stat">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${fighter.stats.speed}/10</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Power</span>
                        <span class="stat-value">${fighter.stats.power}/10</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Defense</span>
                        <span class="stat-value">${fighter.stats.defense}/10</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Technique</span>
                        <span class="stat-value">${fighter.stats.technique}/10</span>
                    </div>
                </div>
            `;
            
            profiles.appendChild(profile);
        });
    }

    startFight() {
        if (!this.selectedFighters.player1 || !this.selectedFighters.player2) {
            console.log('No fighters selected');
            return;
        }
        
        this.gameState = 'fighting';
        this.currentScreen = 'fighting';
        
        // Hide menus
        document.getElementById('fighterSelect').classList.add('hidden');
        
        // Initialize fight
        this.initializeFight();
        
        // Start game loop
        this.startGameLoop();
    }

    initializeFight() {
        // Reset round data
        this.currentRound = 1;
        this.player1Wins = 0;
        this.player2Wins = 0;
        this.fightTimer = 99;
        
        // Initialize player objects
        const fighter1Data = this.fighters.find(f => f.id === this.selectedFighters.player1);
        const fighter2Data = this.fighters.find(f => f.id === this.selectedFighters.player2);
        
        this.player1 = this.createFighter(fighter1Data, 1);
        this.player2 = this.createFighter(fighter2Data, 2);
        
        // Update UI
        document.getElementById('player1Name').textContent = fighter1Data.name;
        document.getElementById('player2Name').textContent = fighter2Data.name;
        this.updateHealthBars();
        this.updateRoundDisplay();
        
        // Start fight timer
        this.startTimer();
        
        console.log('Fight initialized:', fighter1Data.name, 'vs', fighter2Data.name);
    }

    createFighter(fighterData, playerNumber) {
        const startX = playerNumber === 1 ? 200 : 1000;
        
        return {
            id: fighterData.id,
            name: fighterData.name,
            avatar: fighterData.avatar,
            playerNumber: playerNumber,
            
            // Position and physics
            x: startX,
            y: 450, // Ground level
            width: 60,
            height: 100,
            velocityX: 0,
            velocityY: 0,
            onGround: true,
            facing: playerNumber === 1 ? 1 : -1, // 1 = right, -1 = left
            
            // Combat stats
            health: 100,
            maxHealth: 100,
            
            // State
            state: 'idle', // idle, walking, jumping, attacking, blocking, hit, knocked
            animation: 'idle',
            animationFrame: 0,
            animationTimer: 0,
            
            // Combat system
            isBlocking: false,
            blockType: 'none', // none, high, low, back
            isAttacking: false,
            attackType: null,
            attackFrame: 0,
            attackStartup: 0,
            attackRecovery: 0,
            canAct: true,
            
            // Fighter data reference
            fighterData: fighterData,
            
            // Hit effects
            hitStun: 0,
            knockback: 0,
            invincible: 0
        };
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.fightTimer--;
            document.getElementById('fightTimer').textContent = this.fightTimer;
            
            if (this.fightTimer <= 0) {
                this.timeOut();
            }
        }, 1000);
    }

    timeOut() {
        clearInterval(this.timerInterval);
        
        // Determine winner by health
        if (this.player1.health > this.player2.health) {
            this.roundWin(1);
        } else if (this.player2.health > this.player1.health) {
            this.roundWin(2);
        } else {
            // Draw - continue fighting or sudden death
            this.fightTimer = 30;
            this.startTimer();
        }
    }

    roundWin(winner) {
        if (winner === 1) {
            this.player1Wins++;
        } else {
            this.player2Wins++;
        }
        
        // Check if match is complete
        const winsNeeded = Math.ceil(this.maxRounds / 2);
        if (this.player1Wins >= winsNeeded || this.player2Wins >= winsNeeded) {
            this.matchComplete(winner);
        } else {
            this.nextRound();
        }
    }

    nextRound() {
        this.currentRound++;
        
        // Reset fighters
        this.player1.health = this.player1.maxHealth;
        this.player2.health = this.player2.maxHealth;
        this.player1.x = 200;
        this.player2.x = 1000;
        this.player1.state = 'idle';
        this.player2.state = 'idle';
        
        // Reset timer
        this.fightTimer = 99;
        this.startTimer();
        
        this.updateHealthBars();
        this.updateRoundDisplay();
    }

    matchComplete(winner) {
        clearInterval(this.timerInterval);
        this.gameState = 'gameOver';
        
        const winnerName = winner === 1 ? this.player1.name : this.player2.name;
        document.getElementById('gameOverTitle').textContent = `${winnerName} Wins!`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    rematch() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.initializeFight();
    }

    updateHealthBars() {
        const p1Health = (this.player1.health / this.player1.maxHealth) * 100;
        const p2Health = (this.player2.health / this.player2.maxHealth) * 100;
        
        document.getElementById('player1Health').style.width = p1Health + '%';
        document.getElementById('player2Health').style.width = p2Health + '%';
    }

    updateRoundDisplay() {
        document.getElementById('roundText').textContent = `Round ${this.currentRound}`;
    }

    startGameLoop() {
        const loop = (currentTime) => {
            if (this.gameState === 'fighting') {
                this.update(currentTime);
                this.render();
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    }

    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState !== 'fighting') return;
        
        // Update both fighters
        this.updateFighter(this.player1, deltaTime);
        this.updateFighter(this.player2, deltaTime);
        
        // Handle input
        this.handleFighterInput(this.player1);
        this.handleFighterInput(this.player2);
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateHealthBars();
    }

    updateFighter(fighter, deltaTime) {
        // Update timers
        fighter.animationTimer += deltaTime;
        if (fighter.hitStun > 0) fighter.hitStun--;
        if (fighter.invincible > 0) fighter.invincible--;
        
        // Handle attack frames
        if (fighter.isAttacking) {
            fighter.attackFrame++;
            
            if (fighter.attackFrame >= fighter.attackStartup + fighter.attackRecovery) {
                fighter.isAttacking = false;
                fighter.attackType = null;
                fighter.attackFrame = 0;
                fighter.canAct = true;
                fighter.state = 'idle';
            }
        }
        
        // Physics
        fighter.y += fighter.velocityY;
        fighter.x += fighter.velocityX;
        
        // Gravity
        if (!fighter.onGround) {
            fighter.velocityY += 0.8; // gravity
        }
        
        // Ground collision
        if (fighter.y >= 450) {
            fighter.y = 450;
            fighter.velocityY = 0;
            fighter.onGround = true;
        }
        
        // Stage boundaries
        fighter.x = Math.max(50, Math.min(1150, fighter.x));
        
        // Friction
        fighter.velocityX *= 0.85;
        
        // Update animations
        this.updateFighterAnimation(fighter, deltaTime);
    }

    updateFighterAnimation(fighter, deltaTime) {
        // Simple animation cycling
        if (fighter.animationTimer >= 100) { // 100ms per frame
            fighter.animationFrame++;
            fighter.animationTimer = 0;
        }
        
        // Determine current animation based on state
        if (fighter.isAttacking) {
            fighter.animation = fighter.attackType;
        } else if (!fighter.onGround) {
            fighter.animation = 'jump';
        } else if (Math.abs(fighter.velocityX) > 1) {
            fighter.animation = 'walk';
        } else if (fighter.isBlocking) {
            fighter.animation = 'block';
        } else {
            fighter.animation = 'idle';
        }
    }

    handleFighterInput(fighter) {
        if (!fighter.canAct || fighter.hitStun > 0) return;
        
        const isPlayer1 = fighter.playerNumber === 1;
        const leftKey = isPlayer1 ? 'KeyA' : 'ArrowLeft';
        const rightKey = isPlayer1 ? 'KeyD' : 'ArrowRight';
        const upKey = isPlayer1 ? 'KeyW' : 'ArrowUp';
        const downKey = isPlayer1 ? 'KeyS' : 'ArrowDown';
        const lightPunchKey = isPlayer1 ? 'KeyJ' : 'Digit1';
        const heavyPunchKey = isPlayer1 ? 'KeyK' : 'Digit2';
        const kickKey = isPlayer1 ? 'KeyL' : 'Digit3';
        
        // Reset blocking
        fighter.isBlocking = false;
        fighter.blockType = 'none';
        
        // Movement
        if (this.keys[leftKey]) {
            if (!fighter.isAttacking) {
                fighter.velocityX = -3;
                fighter.facing = -1;
                
                // Backstep blocking - if facing opponent and backing away
                const opponent = fighter.playerNumber === 1 ? this.player2 : this.player1;
                if ((fighter.facing === 1 && opponent.x < fighter.x) || 
                    (fighter.facing === -1 && opponent.x > fighter.x)) {
                    fighter.isBlocking = true;
                    fighter.blockType = 'back';
                }
            }
        }
        
        if (this.keys[rightKey]) {
            if (!fighter.isAttacking) {
                fighter.velocityX = 3;
                fighter.facing = 1;
                
                // Backstep blocking
                const opponent = fighter.playerNumber === 1 ? this.player2 : this.player1;
                if ((fighter.facing === 1 && opponent.x < fighter.x) || 
                    (fighter.facing === -1 && opponent.x > fighter.x)) {
                    fighter.isBlocking = true;
                    fighter.blockType = 'back';
                }
            }
        }
        
        // Crouching/Low block
        if (this.keys[downKey]) {
            fighter.isBlocking = true;
            fighter.blockType = 'low';
        }
        
        // Standing block (when not moving and not crouching)
        if (!this.keys[leftKey] && !this.keys[rightKey] && !this.keys[downKey]) {
            const opponent = fighter.playerNumber === 1 ? this.player2 : this.player1;
            // Auto-block when opponent is close and attacking
            if (Math.abs(fighter.x - opponent.x) < 100 && opponent.isAttacking) {
                fighter.isBlocking = true;
                fighter.blockType = 'high';
            }
        }
        
        // Jumping
        if (this.keys[upKey] && fighter.onGround && !fighter.isAttacking) {
            fighter.velocityY = -15;
            fighter.onGround = false;
        }
        
        // Attacks
        if (this.keys[lightPunchKey] && !fighter.isAttacking) {
            this.performAttack(fighter, 'lightPunch');
        }
        
        if (this.keys[heavyPunchKey] && !fighter.isAttacking) {
            this.performAttack(fighter, 'heavyPunch');
        }
        
        if (this.keys[kickKey] && !fighter.isAttacking) {
            this.performAttack(fighter, 'kick');
        }
        
        // Jump attacks
        if (!fighter.onGround && (this.keys[lightPunchKey] || this.keys[heavyPunchKey] || this.keys[kickKey])) {
            if (!fighter.isAttacking) {
                this.performAttack(fighter, 'jumpPunch');
            }
        }
    }

    performAttack(fighter, attackType) {
        const moveData = fighter.fighterData.moves[attackType];
        if (!moveData) return;
        
        fighter.isAttacking = true;
        fighter.attackType = attackType;
        fighter.attackFrame = 0;
        fighter.attackStartup = moveData.startup;
        fighter.attackRecovery = moveData.recovery;
        fighter.canAct = false;
        fighter.state = 'attacking';
        
        console.log(`${fighter.name} performs ${attackType}`);
    }

    checkCollisions() {
        // Check if attacks hit
        this.checkAttackHit(this.player1, this.player2);
        this.checkAttackHit(this.player2, this.player1);
    }

    checkAttackHit(attacker, defender) {
        if (!attacker.isAttacking || attacker.attackFrame < attacker.attackStartup) return;
        if (defender.invincible > 0) return;
        
        const moveData = attacker.fighterData.moves[attacker.attackType];
        if (!moveData) return;
        
        // Calculate hitbox position
        const hitboxX = attacker.x + (attacker.facing * moveData.hitbox.x);
        const hitboxY = attacker.y + moveData.hitbox.y;
        const hitboxWidth = moveData.hitbox.width;
        const hitboxHeight = moveData.hitbox.height;
        
        // Check collision with defender
        if (hitboxX < defender.x + defender.width &&
            hitboxX + hitboxWidth > defender.x &&
            hitboxY < defender.y + defender.height &&
            hitboxY + hitboxHeight > defender.y) {
            
            // Check if attack is blocked
            if (this.checkBlock(attacker, defender, attacker.attackType)) {
                this.handleBlock(attacker, defender);
            } else {
                this.handleHit(attacker, defender, moveData);
            }
        }
    }

    checkBlock(attacker, defender, attackType) {
        if (!defender.isBlocking) return false;
        
        const moveData = attacker.fighterData.moves[attackType];
        const isLowAttack = attackType === 'kick' || moveData.hitbox.y > -10;
        const isHighAttack = !isLowAttack;
        
        // Check block compatibility
        if (defender.blockType === 'high' && isHighAttack) return true;
        if (defender.blockType === 'low' && isLowAttack) return true;
        if (defender.blockType === 'back') return true; // Backstep blocks all
        
        return false;
    }

    handleBlock(attacker, defender) {
        console.log(`${defender.name} blocks ${attacker.name}'s attack`);
        
        // Small pushback
        defender.velocityX += attacker.facing * 2;
        
        // Attacker gets slight recovery penalty
        attacker.attackRecovery += 3;
    }

    handleHit(attacker, defender, moveData) {
        console.log(`${attacker.name} hits ${defender.name} with ${attacker.attackType} for ${moveData.damage} damage`);
        
        // Apply damage
        defender.health -= moveData.damage;
        defender.health = Math.max(0, defender.health);
        
        // Apply hitstun and knockback
        defender.hitStun = 15;
        defender.velocityX = attacker.facing * (moveData.damage / 2);
        
        // Visual effects
        this.createHitEffect(defender.x, defender.y - 50);
        
        // Camera shake effect
        this.shakeCamera(5);
        
        // Check for KO
        if (defender.health <= 0) {
            this.knockout(defender.playerNumber === 1 ? 2 : 1);
        }
    }

    createHitEffect(x, y) {
        // Simple visual effect - could be enhanced with particles
        console.log(`Hit effect at ${x}, ${y}`);
    }

    shakeCamera(intensity) {
        // Simple screen shake effect
        this.canvas.style.transform = `translate(${Math.random() * intensity - intensity/2}px, ${Math.random() * intensity - intensity/2}px)`;
        setTimeout(() => {
            this.canvas.style.transform = 'translate(0, 0)';
        }, 100);
    }

    knockout(winner) {
        console.log(`Player ${winner} wins by KO!`);
        this.roundWin(winner);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw fighters
        this.drawFighter(this.player1);
        this.drawFighter(this.player2);
        
        // Draw hitboxes (for debugging)
        if (false) { // Set to true for hitbox visualization
            this.drawHitboxes();
        }
    }

    drawBackground() {
        // Dynamic gradient background with time-based changes
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const timeOffset = Date.now() * 0.0001;
        
        // Sky colors that shift slightly over time
        const skyColor1 = `hsl(${200 + Math.sin(timeOffset) * 20}, 70%, 75%)`;
        const skyColor2 = `hsl(${180 + Math.cos(timeOffset * 0.7) * 15}, 60%, 65%)`;
        const groundColor = `hsl(${90 + Math.sin(timeOffset * 0.5) * 10}, 50%, 35%)`;
        
        gradient.addColorStop(0, skyColor1);
        gradient.addColorStop(0.3, skyColor2);
        gradient.addColorStop(0.4, '#228b22'); // Forest green
        gradient.addColorStop(1, '#1a5f1a'); // Darker green
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw animated clouds
        this.drawClouds();
        
        // Draw dynamic mountains in background
        this.drawMountains();
        
        // Draw animated trees
        this.drawTrees();
        
        // Draw arena boundaries with energy effects
        this.drawArenaBoundaries();
        
        // Draw ground with texture
        this.drawGroundTexture();
    }

    drawClouds() {
        const cloudPositions = [
            { baseX: 100, y: 80, size: 40 },
            { baseX: 300, y: 60, size: 35 },
            { baseX: 500, y: 90, size: 45 },
            { baseX: 800, y: 70, size: 38 },
            { baseX: 1000, y: 85, size: 42 }
        ];
        
        const timeOffset = Date.now() * 0.00005;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        cloudPositions.forEach((cloud, index) => {
            const x = cloud.baseX + Math.sin(timeOffset + index) * 20;
            const y = cloud.y + Math.cos(timeOffset * 0.7 + index) * 5;
            
            // Draw cloud as overlapping circles
            for (let i = 0; i < 4; i++) {
                this.ctx.beginPath();
                this.ctx.arc(
                    x + (i * cloud.size * 0.3),
                    y + Math.sin(i) * cloud.size * 0.1,
                    cloud.size * (0.6 + Math.sin(timeOffset + i) * 0.1),
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
    }

    drawMountains() {
        this.ctx.fillStyle = 'rgba(100, 100, 120, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 400);
        
        // Generate mountain silhouette
        for (let x = 0; x <= this.canvas.width; x += 50) {
            const baseHeight = 350 + Math.sin(x * 0.005) * 80;
            const noise = Math.sin(x * 0.02) * 30;
            this.ctx.lineTo(x, baseHeight + noise);
        }
        
        this.ctx.lineTo(this.canvas.width, 400);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Second mountain layer
        this.ctx.fillStyle = 'rgba(80, 80, 100, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 350);
        
        for (let x = 0; x <= this.canvas.width; x += 40) {
            const baseHeight = 300 + Math.sin(x * 0.003 + 1) * 60;
            const noise = Math.sin(x * 0.025) * 25;
            this.ctx.lineTo(x, baseHeight + noise);
        }
        
        this.ctx.lineTo(this.canvas.width, 350);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawTrees() {
        const treePositions = [50, 150, 1050, 1150];
        const timeOffset = Date.now() * 0.001;
        
        treePositions.forEach((x, index) => {
            const sway = Math.sin(timeOffset + index) * 3;
            
            // Tree trunk
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x - 8 + sway, 480, 16, 70);
            
            // Tree leaves (multiple layers for depth)
            const leafColors = ['rgba(34, 139, 34, 0.8)', 'rgba(0, 100, 0, 0.6)', 'rgba(46, 125, 50, 0.7)'];
            
            leafColors.forEach((color, layerIndex) => {
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                const leafX = x + sway * (1 - layerIndex * 0.3);
                const leafY = 470 - layerIndex * 10;
                const leafSize = 35 - layerIndex * 5;
                this.ctx.arc(leafX, leafY, leafSize, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }

    drawArenaBoundaries() {
        const time = Date.now() * 0.002;
        
        // Left boundary with energy effect
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(time) * 0.3})`;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(100, 450);
        this.ctx.lineTo(100, 550);
        this.ctx.stroke();
        
        // Right boundary with energy effect
        this.ctx.strokeStyle = `rgba(255, 0, 255, ${0.5 + Math.sin(time + Math.PI) * 0.3})`;
        this.ctx.beginPath();
        this.ctx.moveTo(1100, 450);
        this.ctx.lineTo(1100, 550);
        this.ctx.stroke();
        
        // Energy particles
        for (let i = 0; i < 3; i++) {
            const leftX = 100 + Math.sin(time + i) * 5;
            const leftY = 480 + i * 20 + Math.cos(time + i) * 10;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time + i) * 0.4})`;
            this.ctx.fillRect(leftX, leftY, 3, 3);
            
            const rightX = 1100 + Math.sin(time + i + Math.PI) * 5;
            const rightY = 480 + i * 20 + Math.cos(time + i + Math.PI) * 10;
            this.ctx.fillStyle = `rgba(255, 0, 255, ${0.6 + Math.sin(time + i + Math.PI) * 0.4})`;
            this.ctx.fillRect(rightX, rightY, 3, 3);
        }
    }

    drawGroundTexture() {
        // Main ground line with gradient
        const groundGradient = this.ctx.createLinearGradient(0, 545, 0, 555);
        groundGradient.addColorStop(0, '#8B4513');
        groundGradient.addColorStop(1, '#A0522D');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, 545, this.canvas.width, 10);
        
        // Ground details and cracks
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
        this.ctx.lineWidth = 1;
        
        // Add some texture lines
        for (let x = 0; x < this.canvas.width; x += 30) {
            const offset = Math.sin(x * 0.01) * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 550 + offset);
            this.ctx.lineTo(x + 15, 555 + offset);
            this.ctx.stroke();
        }
        
        // Fighting arena center circle
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, 550, 200, 0, Math.PI, true);
        this.ctx.stroke();
    }

    initializeDemoFighters() {
        // Create demo fighters for display even when not in fighting mode
        this.player1 = {
            id: 'razor',
            name: 'Razor',
            avatar: '🗡️',
            x: 300,
            y: 480,
            width: 60,
            height: 70,
            health: 100,
            maxHealth: 100,
            facing: 1,
            isAttacking: false,
            isBlocking: false,
            hitStun: 0,
            fighterData: this.fighters[0] // Razor
        };

        this.player2 = {
            id: 'blaze',
            name: 'Blaze',
            avatar: '🔥',
            x: 840,
            y: 480,
            width: 60,
            height: 70,
            health: 100,
            maxHealth: 100,
            facing: -1,
            isAttacking: false,
            isBlocking: false,
            hitStun: 0,
            fighterData: this.fighters[1] // Blaze
        };
    }

    startMenuRendering() {
        // Start the rendering loop for menu/demo mode
        const menuLoop = () => {
            if (this.gameState === 'menu') {
                this.renderMenuMode();
                requestAnimationFrame(menuLoop);
            }
        };
        requestAnimationFrame(menuLoop);
    }

    renderMenuMode() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw demo fighters in idle poses
        if (this.player1 && this.player2) {
            this.drawFighter(this.player1);
            this.drawFighter(this.player2);
        }
        
        // Draw game title on canvas
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText('FAMOUSFIGHTER', this.canvas.width / 2, 200);
        this.ctx.fillText('FAMOUSFIGHTER', this.canvas.width / 2, 200);
        
        // Draw subtitle
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText('Championship Arena', this.canvas.width / 2, 240);
        this.ctx.fillText('Championship Arena', this.canvas.width / 2, 240);
    }

    drawFighter(fighter) {
        this.ctx.save();
        
        // Determine current state for sprite generation
        let state = 'idle';
        if (fighter.isAttacking) state = 'attacking';
        else if (fighter.isBlocking) state = 'blocking';
        else if (fighter.hitStun > 0) state = 'hit';
        
        // Generate sprite based on current state
        const sprite = this.generateFighterSprite(fighter, state);
        
        // Calculate sprite position (centered on fighter position)
        const spriteX = fighter.x + fighter.width/2 - 40; // 40 is half of sprite size (80)
        const spriteY = fighter.y - 20; // Offset to align with fighter bottom
        
        // Flip sprite if facing left
        if (fighter.facing === -1) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(sprite, -(spriteX + 80), spriteY, 80, 80);
        } else {
            this.ctx.drawImage(sprite, spriteX, spriteY, 80, 80);
        }
        
        // Draw name above fighter
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(fighter.name, fighter.x + fighter.width/2, fighter.y - 25);
        this.ctx.fillText(fighter.name, fighter.x + fighter.width/2, fighter.y - 25);
        
        // Draw health bar above name
        const healthBarWidth = 60;
        const healthBarHeight = 6;
        const healthBarX = fighter.x + fighter.width/2 - healthBarWidth/2;
        const healthBarY = fighter.y - 40;
        
        // Health bar background
        this.ctx.fillStyle = 'rgba(100, 0, 0, 0.8)';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar fill
        const healthPercent = fighter.health / 100;
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
        
        // Health bar border
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Draw impact effects for hits
        if (fighter.hitStun > 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            const sparkCount = 6;
            for (let i = 0; i < sparkCount; i++) {
                const angle = (Math.PI * 2 * i) / sparkCount;
                const distance = 15 + Math.random() * 10;
                const sparkX = fighter.x + fighter.width/2 + Math.cos(angle) * distance;
                const sparkY = fighter.y + fighter.height/2 + Math.sin(angle) * distance;
                this.ctx.fillRect(sparkX, sparkY, 3, 3);
            }
        }
        
        this.ctx.restore();
    }

    getFighterColor(fighterId) {
        const colors = {
            'razor': '#4a4a4a',    // Dark gray
            'blaze': '#ff4500',    // Red-orange
            'frost': '#87ceeb',    // Sky blue
            'storm': '#9932cc',    // Dark violet
            'terra': '#8b4513',    // Saddle brown
            'mystic': '#dda0dd'    // Plum
        };
        return colors[fighterId] || '#666666';
    }

    generateFighterSprite(fighter, state = 'idle') {
        const spriteCanvas = document.createElement('canvas');
        const spriteCtx = spriteCanvas.getContext('2d');
        const size = 80;
        spriteCanvas.width = size;
        spriteCanvas.height = size;

        const fighterData = this.fighters.find(f => f.id === fighter.id);
        if (!fighterData) return null;

        // Base colors
        const primaryColor = this.getFighterColor(fighter.id);
        const secondaryColor = this.lightenColor(primaryColor, 20);
        const shadowColor = this.darkenColor(primaryColor, 30);
        
        // Animation frame offset
        const animOffset = Math.sin(Date.now() * 0.01) * 2;
        
        // Draw body (torso)
        spriteCtx.fillStyle = primaryColor;
        spriteCtx.fillRect(size/2 - 12, size/2 - 5, 24, 30);
        
        // Draw head
        spriteCtx.fillStyle = this.lightenColor(primaryColor, 40);
        spriteCtx.beginPath();
        spriteCtx.arc(size/2, size/2 - 15, 10, 0, Math.PI * 2);
        spriteCtx.fill();
        
        // Draw eyes based on fighter type
        this.drawFighterEyes(spriteCtx, size/2, size/2 - 15, fighter.id);
        
        // Draw arms (animated for idle)
        spriteCtx.fillStyle = secondaryColor;
        const armY = size/2 - 3 + animOffset;
        spriteCtx.fillRect(size/2 - 20, armY, 8, 20);
        spriteCtx.fillRect(size/2 + 12, armY, 8, 20);
        
        // Draw legs
        spriteCtx.fillStyle = shadowColor;
        spriteCtx.fillRect(size/2 - 8, size/2 + 25, 6, 20);
        spriteCtx.fillRect(size/2 + 2, size/2 + 25, 6, 20);
        
        // Draw special effects based on fighter
        this.drawFighterEffects(spriteCtx, size, fighter.id, state);
        
        // Draw stance/pose indicators
        if (state === 'attacking') {
            spriteCtx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            spriteCtx.fillRect(0, 0, size, size);
        } else if (state === 'blocking') {
            spriteCtx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            spriteCtx.fillRect(0, 0, size, size);
        }
        
        return spriteCanvas;
    }

    drawFighterEyes(ctx, x, y, fighterId) {
        ctx.fillStyle = 'white';
        ctx.fillRect(x - 4, y - 2, 3, 3);
        ctx.fillRect(x + 1, y - 2, 3, 3);
        
        // Pupil color based on fighter
        const eyeColors = {
            'razor': '#ff0000',
            'blaze': '#ffff00',
            'frost': '#00ffff',
            'storm': '#ff00ff',
            'terra': '#00ff00',
            'mystic': '#ffffff'
        };
        
        ctx.fillStyle = eyeColors[fighterId] || '#000000';
        ctx.fillRect(x - 3, y - 1, 1, 1);
        ctx.fillRect(x + 2, y - 1, 1, 1);
    }

    drawFighterEffects(ctx, size, fighterId, state) {
        const centerX = size / 2;
        const centerY = size / 2;
        
        switch(fighterId) {
            case 'razor':
                // Shadow trail effect
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(centerX - 15, centerY - 20, 30, 40);
                break;
                
            case 'blaze':
                // Fire particles
                for (let i = 0; i < 5; i++) {
                    const x = centerX + (Math.random() - 0.5) * 20;
                    const y = centerY + 20 + Math.random() * 10;
                    ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, 0.6)`;
                    ctx.fillRect(x, y, 2, 4);
                }
                break;
                
            case 'frost':
                // Ice crystals
                ctx.strokeStyle = 'rgba(173, 216, 230, 0.8)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 3; i++) {
                    const x = centerX + (Math.random() - 0.5) * 25;
                    const y = centerY + (Math.random() - 0.5) * 25;
                    this.drawSnowflake(ctx, x, y, 4);
                }
                break;
                
            case 'storm':
                // Lightning sparks
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    const x1 = centerX + (Math.random() - 0.5) * 30;
                    const y1 = centerY + (Math.random() - 0.5) * 30;
                    const x2 = x1 + (Math.random() - 0.5) * 10;
                    const y2 = y1 + (Math.random() - 0.5) * 10;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                break;
                
            case 'terra':
                // Rock particles
                ctx.fillStyle = 'rgba(139, 69, 19, 0.6)';
                for (let i = 0; i < 4; i++) {
                    const x = centerX + (Math.random() - 0.5) * 25;
                    const y = centerY + 15 + Math.random() * 10;
                    ctx.fillRect(x, y, 3, 3);
                }
                break;
                
            case 'mystic':
                // Magical aura
                const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 25);
                gradient.addColorStop(0, 'rgba(221, 160, 221, 0.3)');
                gradient.addColorStop(1, 'rgba(221, 160, 221, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, size, size);
                break;
        }
    }

    drawSnowflake(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.moveTo(x - size*0.7, y - size*0.7);
        ctx.lineTo(x + size*0.7, y + size*0.7);
        ctx.moveTo(x + size*0.7, y - size*0.7);
        ctx.lineTo(x - size*0.7, y + size*0.7);
        ctx.stroke();
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }

    drawHitboxes() {
        // Debug function to visualize hitboxes
        [this.player1, this.player2].forEach(fighter => {
            if (fighter.isAttacking && fighter.attackFrame >= fighter.attackStartup) {
                const moveData = fighter.fighterData.moves[fighter.attackType];
                if (moveData) {
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        fighter.x + (fighter.facing * moveData.hitbox.x),
                        fighter.y + moveData.hitbox.y,
                        moveData.hitbox.width,
                        moveData.hitbox.height
                    );
                }
            }
        });
    }

    gameLoop(currentTime) {
        this.update(currentTime);
        this.render();
        
        if (this.gameState === 'fighting') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FamousFighter();
});