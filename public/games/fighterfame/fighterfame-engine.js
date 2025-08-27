class FighterFameGame {
    constructor() {
        console.log('FighterFameGame constructor starting...');
        
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Canvas 2D context not available');
        }
        
        console.log('Canvas initialized successfully');
        
        this.gameState = 'MENU'; // MENU, CHARACTER_SELECT, STAGE_SELECT, FIGHTING, ROUND_END
        
        // Game settings
        this.roundTime = 99;
        this.currentRoundTime = 99;
        this.roundTimer = null;
        
        // Fighters
        this.player1 = null;
        this.player2 = null;
        this.currentStage = null;
        
        // Input handling
        this.keys = {};
        this.inputBuffer = [];
        this.setupEventListeners();
        
        // Game mechanics
        this.gravity = 0.8;
        this.groundY = this.canvas.height - 80;
        
        // Audio context
        this.audioContext = null;
        this.sounds = {};
        
        // Initialize audio
        console.log('Initializing audio...');
        this.initAudio();
        
        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        // Define fighters and stages
        console.log('Initializing fighters and stages...');
        this.initializeFighters();
        this.initializeStages();
        
        console.log('FighterFameGame constructor completed successfully');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.recordInput(e.key.toLowerCase(), true);
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.recordInput(e.key.toLowerCase(), false);
            e.preventDefault();
        });
    }
    
    recordInput(key, pressed) {
        this.inputBuffer.push({
            key: key,
            pressed: pressed,
            time: Date.now()
        });
        
        // Keep buffer size manageable
        if (this.inputBuffer.length > 20) {
            this.inputBuffer.shift();
        }
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    createSounds() {
        // Create procedural sound effects
        this.sounds = {
            punch: this.createSoundEffect([200, 150, 100], [0.1, 0.05, 0.02]),
            kick: this.createSoundEffect([180, 120, 80], [0.15, 0.08, 0.03]),
            block: this.createSoundEffect([300, 200], [0.08, 0.04]),
            special: this.createSoundEffect([400, 300, 200, 100], [0.2, 0.15, 0.1, 0.05]),
            ko: this.createSoundEffect([100, 80, 60, 40], [0.3, 0.25, 0.2, 0.15])
        };
    }
    
    createSoundEffect(frequencies, durations) {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            
            let time = this.audioContext.currentTime;
            for (let i = 0; i < frequencies.length; i++) {
                oscillator.frequency.linearRampToValueAtTime(frequencies[i], time + durations[i]);
                gainNode.gain.linearRampToValueAtTime(0, time + durations[i]);
                time += durations[i];
            }
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(time);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    initializeFighters() {
        this.fighterTemplates = [
            {
                id: 'ryu',
                name: 'Ryu',
                avatar: '🥋',
                style: 'Shotokan Karate',
                stats: { speed: 7, power: 8, defense: 7, special: 9 },
                color: '#ffffff',
                attacks: {
                    lightPunch: { damage: 8, speed: 4, range: 40 },
                    heavyPunch: { damage: 15, speed: 8, range: 45 },
                    lightKick: { damage: 10, speed: 5, range: 50 },
                    heavyKick: { damage: 18, speed: 10, range: 55 }
                },
                specialMoves: [
                    { name: 'Hadoken', input: ['↓', '↘', '→', 'punch'], damage: 25, type: 'projectile' },
                    { name: 'Shoryuken', input: ['→', '↓', '↘', 'punch'], damage: 30, type: 'uppercut' },
                    { name: 'Tatsumaki', input: ['↓', '↙', '←', 'kick'], damage: 20, type: 'hurricane' }
                ]
            },
            {
                id: 'chun',
                name: 'Chun-Li',
                avatar: '👩‍🦵',
                style: 'Chinese Kenpo',
                stats: { speed: 9, power: 6, defense: 6, special: 8 },
                color: '#4169E1',
                attacks: {
                    lightPunch: { damage: 6, speed: 3, range: 35 },
                    heavyPunch: { damage: 12, speed: 6, range: 40 },
                    lightKick: { damage: 12, speed: 4, range: 60 },
                    heavyKick: { damage: 22, speed: 9, range: 65 }
                },
                specialMoves: [
                    { name: 'Kikoken', input: ['←', '→', 'punch'], damage: 20, type: 'projectile' },
                    { name: 'Lightning Legs', input: ['kick', 'kick', 'kick'], damage: 35, type: 'multi' },
                    { name: 'Spinning Bird', input: ['↓', 'kick'], damage: 25, type: 'spinning' }
                ]
            },
            {
                id: 'ken',
                name: 'Ken',
                avatar: '🔥',
                style: 'Shotokan + Flashy',
                stats: { speed: 8, power: 8, defense: 6, special: 8 },
                color: '#FFD700',
                attacks: {
                    lightPunch: { damage: 7, speed: 3, range: 42 },
                    heavyPunch: { damage: 16, speed: 7, range: 47 },
                    lightKick: { damage: 11, speed: 4, range: 52 },
                    heavyKick: { damage: 19, speed: 9, range: 57 }
                },
                specialMoves: [
                    { name: 'Hadoken', input: ['↓', '↘', '→', 'punch'], damage: 23, type: 'projectile' },
                    { name: 'Shoryuken', input: ['→', '↓', '↘', 'punch'], damage: 32, type: 'uppercut' },
                    { name: 'Tatsumaki', input: ['↓', '↙', '←', 'kick'], damage: 22, type: 'hurricane' }
                ]
            },
            {
                id: 'zangief',
                name: 'Zangief',
                avatar: '🤼',
                style: 'Wrestling',
                stats: { speed: 4, power: 10, defense: 9, special: 7 },
                color: '#FF4500',
                attacks: {
                    lightPunch: { damage: 12, speed: 6, range: 38 },
                    heavyPunch: { damage: 25, speed: 12, range: 43 },
                    lightKick: { damage: 15, speed: 8, range: 48 },
                    heavyKick: { damage: 30, speed: 15, range: 53 }
                },
                specialMoves: [
                    { name: 'Lariat', input: ['punch', 'punch', 'punch'], damage: 40, type: 'spinning' },
                    { name: 'Piledriver', input: ['grapple'], damage: 50, type: 'throw' },
                    { name: 'Bear Hug', input: ['←', '→', 'punch'], damage: 35, type: 'grab' }
                ]
            },
            {
                id: 'blanka',
                name: 'Blanka',
                avatar: '⚡',
                style: 'Beast Mode',
                stats: { speed: 8, power: 7, defense: 8, special: 9 },
                color: '#00FF00',
                attacks: {
                    lightPunch: { damage: 9, speed: 4, range: 36 },
                    heavyPunch: { damage: 17, speed: 8, range: 41 },
                    lightKick: { damage: 11, speed: 5, range: 54 },
                    heavyKick: { damage: 20, speed: 10, range: 59 }
                },
                specialMoves: [
                    { name: 'Electric Thunder', input: ['punch', 'punch', 'punch'], damage: 30, type: 'electric' },
                    { name: 'Rolling Ball', input: ['←', '→', 'kick'], damage: 25, type: 'rolling' },
                    { name: 'Beast Roll', input: ['↓', 'kick'], damage: 22, type: 'slide' }
                ]
            },
            {
                id: 'dhalsim',
                name: 'Dhalsim',
                avatar: '🧘',
                style: 'Yoga Master',
                stats: { speed: 5, power: 6, defense: 5, special: 10 },
                color: '#800080',
                attacks: {
                    lightPunch: { damage: 7, speed: 5, range: 80 },
                    heavyPunch: { damage: 14, speed: 9, range: 90 },
                    lightKick: { damage: 10, speed: 6, range: 75 },
                    heavyKick: { damage: 18, speed: 11, range: 85 }
                },
                specialMoves: [
                    { name: 'Yoga Fire', input: ['↓', '↘', '→', 'punch'], damage: 22, type: 'projectile' },
                    { name: 'Yoga Flame', input: ['←', '→', 'punch'], damage: 28, type: 'flame' },
                    { name: 'Teleport', input: ['↓', '↓', 'punch'], damage: 0, type: 'teleport' }
                ]
            }
        ];
    }
    
    initializeStages() {
        this.stageTemplates = [
            {
                id: 'dojo',
                name: 'Training Dojo',
                preview: '🏯',
                background: '#8B4513',
                accent: '#FFD700',
                description: 'A traditional Japanese training hall'
            },
            {
                id: 'street',
                name: 'City Streets',
                preview: '🏙️',
                background: '#2F4F4F',
                accent: '#FF6347',
                description: 'Urban fighting in the concrete jungle'
            },
            {
                id: 'temple',
                name: 'Ancient Temple',
                preview: '🏛️',
                background: '#8A2BE2',
                accent: '#FFD700',
                description: 'Mystical ruins with ancient power'
            },
            {
                id: 'forest',
                name: 'Bamboo Forest',
                preview: '🎋',
                background: '#228B22',
                accent: '#90EE90',
                description: 'Fight among the swaying bamboo'
            },
            {
                id: 'volcano',
                name: 'Volcanic Crater',
                preview: '🌋',
                background: '#DC143C',
                accent: '#FF4500',
                description: 'Intense battles on molten ground'
            },
            {
                id: 'arctic',
                name: 'Frozen Wasteland',
                preview: '🏔️',
                background: '#B0E0E6',
                accent: '#00CED1',
                description: 'Slippery ice stage with blizzards'
            }
        ];
    }
    
    populateCharacters() {
        const grid = document.getElementById('characterGrid');
        grid.innerHTML = '';
        
        this.fighterTemplates.forEach((fighter, index) => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.onclick = () => this.selectCharacter(index);
            
            card.innerHTML = `
                <div class="character-avatar">${fighter.avatar}</div>
                <div class="character-name">${fighter.name}</div>
                <div class="character-style">${fighter.style}</div>
                <div class="character-stats">
                    <div class="stat-row">
                        <span>Speed:</span>
                        <span>${'★'.repeat(fighter.stats.speed)}</span>
                    </div>
                    <div class="stat-row">
                        <span>Power:</span>
                        <span>${'★'.repeat(fighter.stats.power)}</span>
                    </div>
                    <div class="stat-row">
                        <span>Defense:</span>
                        <span>${'★'.repeat(fighter.stats.defense)}</span>
                    </div>
                    <div class="stat-row">
                        <span>Special:</span>
                        <span>${'★'.repeat(fighter.stats.special)}</span>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
    
    selectCharacter(index) {
        // Remove previous selections
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select character
        document.querySelectorAll('.character-card')[index].classList.add('selected');
        
        if (gameMode === 'vs') {
            if (!selectedFighters.player1) {
                selectedFighters.player1 = this.fighterTemplates[index];
                // Now select Player 2
                alert('Player 1 selected! Now Player 2 choose your fighter.');
            } else if (!selectedFighters.player2) {
                selectedFighters.player2 = this.fighterTemplates[index];
                document.getElementById('startFightBtn').disabled = false;
            }
        } else if (gameMode === 'arcade') {
            selectedFighters.player1 = this.fighterTemplates[index];
            // Randomly select CPU opponent
            let cpuIndex;
            do {
                cpuIndex = Math.floor(Math.random() * this.fighterTemplates.length);
            } while (cpuIndex === index);
            
            selectedFighters.player2 = this.fighterTemplates[cpuIndex];
            document.getElementById('startFightBtn').disabled = false;
        }
    }
    
    selectStage() {
        document.getElementById('characterSelect').classList.add('hidden');
        document.getElementById('stageSelect').classList.remove('hidden');
        this.populateStages();
    }
    
    populateStages() {
        const grid = document.getElementById('stageGrid');
        grid.innerHTML = '';
        
        this.stageTemplates.forEach((stage, index) => {
            const card = document.createElement('div');
            card.className = 'stage-card';
            card.onclick = () => {
                // Remove previous selections
                document.querySelectorAll('.stage-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedStage = stage;
                document.getElementById('startStageBtn').disabled = false;
            };
            
            card.innerHTML = `
                <div class="stage-preview" style="background: linear-gradient(135deg, ${stage.background}, ${stage.accent})">
                    ${stage.preview}
                </div>
                <h3>${stage.name}</h3>
                <p>${stage.description}</p>
            `;
            
            grid.appendChild(card);
        });
    }
    
    startFight() {
        // Hide menus
        document.getElementById('stageSelect').classList.add('hidden');
        document.getElementById('controlsDisplay').classList.remove('hidden');
        document.getElementById('moveList').classList.remove('hidden');
        
        // Initialize fighters
        this.createFighter(selectedFighters.player1, 1);
        this.createFighter(selectedFighters.player2, 2);
        this.currentStage = selectedStage;
        
        // Update UI
        document.getElementById('player1Name').textContent = selectedFighters.player1.name;
        document.getElementById('player2Name').textContent = selectedFighters.player2.name;
        
        // Start round
        this.gameState = 'FIGHTING';
        this.currentRoundTime = this.roundTime;
        this.startRoundTimer();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    createFighter(template, playerNum) {
        const fighter = {
            ...template,
            // Position
            x: playerNum === 1 ? 200 : this.canvas.width - 250,
            y: this.groundY,
            width: 50,
            height: 80,
            
            // Physics
            vx: 0,
            vy: 0,
            onGround: true,
            facing: playerNum === 1 ? 1 : -1,
            
            // Combat
            health: 100,
            maxHealth: 100,
            blocking: false,
            hitstun: 0,
            blockstun: 0,
            invulnerable: 0,
            
            // Animation
            currentAnimation: 'idle',
            animationFrame: 0,
            animationTimer: 0,
            
            // Input (for AI)
            isAI: playerNum === 2 && gameMode === 'arcade',
            aiTimer: 0,
            aiState: 'neutral',
            
            // Combat state
            attacking: false,
            attackTimer: 0,
            lastAttack: null,
            comboCount: 0,
            
            playerNum: playerNum
        };
        
        if (playerNum === 1) {
            this.player1 = fighter;
        } else {
            this.player2 = fighter;
        }
    }
    
    startRoundTimer() {
        this.roundTimer = setInterval(() => {
            this.currentRoundTime--;
            document.getElementById('roundTimer').textContent = this.currentRoundTime;
            
            if (this.currentRoundTime <= 0) {
                this.endRound('TIME');
            }
        }, 1000);
    }
    
    gameLoop(currentTime) {
        if (this.gameState !== 'FIGHTING') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        // Update fighters
        if (this.player1) this.updateFighter(this.player1, deltaTime);
        if (this.player2) this.updateFighter(this.player2, deltaTime);
        
        // Check for round end conditions
        this.checkRoundEnd();
    }
    
    updateFighter(fighter, deltaTime) {
        // Handle input
        if (fighter.isAI) {
            this.handleAI(fighter, deltaTime);
        } else {
            this.handlePlayerInput(fighter);
        }
        
        // Update physics
        this.updatePhysics(fighter, deltaTime);
        
        // Update combat states
        this.updateCombatStates(fighter, deltaTime);
        
        // Update animation
        this.updateAnimation(fighter, deltaTime);
    }
    
    handlePlayerInput(fighter) {
        if (fighter.hitstun > 0 || fighter.blockstun > 0) return;
        
        const playerNum = fighter.playerNum;
        let moveKeys, attackKeys;
        
        if (playerNum === 1) {
            moveKeys = { left: 'a', right: 'd', up: 'w', down: 's', block: 's' };
            attackKeys = { lp: 'j', hp: 'k', lk: 'i', hk: 'o' };
        } else {
            moveKeys = { left: 'arrowleft', right: 'arrowright', up: 'arrowup', down: 'arrowdown', block: 'arrowdown' };
            attackKeys = { lp: 'numpad1', hp: 'numpad2', lk: 'numpad4', hk: 'numpad5' };
        }
        
        // Movement
        if (this.keys[moveKeys.left]) {
            fighter.vx = -fighter.stats.speed * 0.8;
            fighter.facing = -1;
            fighter.currentAnimation = 'walk';
        } else if (this.keys[moveKeys.right]) {
            fighter.vx = fighter.stats.speed * 0.8;
            fighter.facing = 1;
            fighter.currentAnimation = 'walk';
        } else {
            fighter.vx *= 0.8;
            if (Math.abs(fighter.vx) < 0.1) {
                fighter.vx = 0;
                if (fighter.onGround) fighter.currentAnimation = 'idle';
            }
        }
        
        // Jump
        if (this.keys[moveKeys.up] && fighter.onGround) {
            fighter.vy = -15;
            fighter.onGround = false;
            fighter.currentAnimation = 'jump';
        }
        
        // Crouch/Block
        if (this.keys[moveKeys.down] || this.keys[moveKeys.block]) {
            if (fighter.onGround) {
                fighter.blocking = true;
                fighter.currentAnimation = 'crouch';
            }
        } else {
            fighter.blocking = false;
        }
        
        // Attacks
        if (!fighter.attacking) {
            if (this.keys[attackKeys.lp]) {
                this.performAttack(fighter, 'lightPunch');
            } else if (this.keys[attackKeys.hp]) {
                this.performAttack(fighter, 'heavyPunch');
            } else if (this.keys[attackKeys.lk]) {
                this.performAttack(fighter, 'lightKick');
            } else if (this.keys[attackKeys.hk]) {
                this.performAttack(fighter, 'heavyKick');
            }
        }
        
        // Check for special moves
        this.checkSpecialMoves(fighter);
    }
    
    handleAI(fighter, deltaTime) {
        fighter.aiTimer += deltaTime;
        
        const opponent = fighter === this.player1 ? this.player2 : this.player1;
        const distance = Math.abs(fighter.x - opponent.x);
        
        // AI Decision Making
        if (fighter.aiTimer > 500 + Math.random() * 1000) {
            fighter.aiTimer = 0;
            
            if (distance > 150) {
                // Approach opponent
                fighter.vx = fighter.facing * fighter.stats.speed * 0.6;
                fighter.currentAnimation = 'walk';
            } else if (distance < 80) {
                // Close combat
                if (Math.random() < 0.4) {
                    // Attack
                    const attacks = ['lightPunch', 'heavyPunch', 'lightKick', 'heavyKick'];
                    const attack = attacks[Math.floor(Math.random() * attacks.length)];
                    this.performAttack(fighter, attack);
                } else {
                    // Block or retreat
                    fighter.blocking = Math.random() < 0.6;
                    if (!fighter.blocking) {
                        fighter.vx = -fighter.facing * fighter.stats.speed * 0.4;
                    }
                }
            } else {
                // Mid range - special moves or projectiles
                if (Math.random() < 0.3) {
                    this.performSpecialMove(fighter, 0); // First special move
                }
            }
        }
        
        // Update physics
        fighter.vx *= 0.9;
        if (Math.abs(fighter.vx) < 0.1) {
            fighter.vx = 0;
            if (fighter.onGround && !fighter.attacking && !fighter.blocking) {
                fighter.currentAnimation = 'idle';
            }
        }
    }
    
    performAttack(fighter, attackType) {
        if (fighter.attacking) return;
        
        const attack = fighter.attacks[attackType];
        fighter.attacking = true;
        fighter.attackTimer = attack.speed * 16; // Convert to milliseconds
        fighter.lastAttack = { type: attackType, ...attack };
        fighter.currentAnimation = attackType;
        
        // Check hit
        setTimeout(() => {
            this.checkHit(fighter, attack);
            this.playSound(attackType.includes('punch') ? 'punch' : 'kick');
        }, attack.speed * 8); // Hit happens halfway through animation
    }
    
    checkHit(attacker, attack) {
        const defender = attacker === this.player1 ? this.player2 : this.player1;
        
        const distance = Math.abs(attacker.x - defender.x);
        const facing = attacker.facing;
        
        // Check if attack connects
        if (distance <= attack.range && 
            ((facing === 1 && attacker.x < defender.x) || (facing === -1 && attacker.x > defender.x))) {
            
            if (defender.blocking && defender.facing !== facing) {
                // Blocked
                this.applyBlockstun(defender, attack.damage * 0.1);
                this.playSound('block');
            } else {
                // Hit
                this.applyDamage(defender, attack.damage);
                this.applyHitstun(defender, attack.damage * 0.2);
                attacker.comboCount++;
            }
        }
    }
    
    applyDamage(fighter, damage) {
        fighter.health = Math.max(0, fighter.health - damage);
        this.updateHealthBars();
        
        if (fighter.health <= 0) {
            this.endRound('KO');
        }
    }
    
    applyHitstun(fighter, duration) {
        fighter.hitstun = duration;
        fighter.currentAnimation = 'hit';
        fighter.vx = -fighter.facing * 3; // Knockback
    }
    
    applyBlockstun(fighter, duration) {
        fighter.blockstun = duration;
        fighter.currentAnimation = 'block';
    }
    
    checkSpecialMoves(fighter) {
        // Simplified special move detection
        // In a real implementation, you'd check input sequences
        
        // For now, use simple key combinations
        if (this.keys['q']) { // Special move trigger
            if (fighter.specialMoves && fighter.specialMoves.length > 0) {
                this.performSpecialMove(fighter, 0);
            }
        }
    }
    
    performSpecialMove(fighter, moveIndex) {
        if (fighter.attacking || !fighter.specialMoves[moveIndex]) return;
        
        const move = fighter.specialMoves[moveIndex];
        fighter.attacking = true;
        fighter.attackTimer = 1000; // Special moves take longer
        fighter.currentAnimation = 'special';
        
        setTimeout(() => {
            this.executeSpecialMove(fighter, move);
            this.playSound('special');
        }, 500);
    }
    
    executeSpecialMove(fighter, move) {
        const opponent = fighter === this.player1 ? this.player2 : this.player1;
        
        switch (move.type) {
            case 'projectile':
                // Create projectile (simplified)
                this.createProjectile(fighter, move);
                break;
            case 'uppercut':
                // Powerful close-range attack
                if (Math.abs(fighter.x - opponent.x) < 80) {
                    this.applyDamage(opponent, move.damage);
                    this.applyHitstun(opponent, move.damage * 0.3);
                }
                break;
            case 'hurricane':
                // Spinning attack
                if (Math.abs(fighter.x - opponent.x) < 100) {
                    this.applyDamage(opponent, move.damage);
                }
                break;
            default:
                // Generic special attack
                if (Math.abs(fighter.x - opponent.x) < 120) {
                    this.applyDamage(opponent, move.damage);
                }
        }
    }
    
    createProjectile(fighter, move) {
        // Simplified projectile - just check if opponent is in line
        const opponent = fighter === this.player1 ? this.player2 : this.player1;
        
        setTimeout(() => {
            if ((fighter.facing === 1 && fighter.x < opponent.x) || 
                (fighter.facing === -1 && fighter.x > opponent.x)) {
                this.applyDamage(opponent, move.damage);
            }
        }, 300);
    }
    
    updatePhysics(fighter, deltaTime) {
        // Gravity
        if (!fighter.onGround) {
            fighter.vy += this.gravity;
        }
        
        // Position update
        fighter.x += fighter.vx;
        fighter.y += fighter.vy;
        
        // Ground collision
        if (fighter.y >= this.groundY) {
            fighter.y = this.groundY;
            fighter.vy = 0;
            fighter.onGround = true;
        }
        
        // Screen boundaries
        fighter.x = Math.max(fighter.width/2, Math.min(this.canvas.width - fighter.width/2, fighter.x));
    }
    
    updateCombatStates(fighter, deltaTime) {
        // Update timers
        if (fighter.hitstun > 0) {
            fighter.hitstun -= deltaTime;
            if (fighter.hitstun <= 0) {
                fighter.currentAnimation = 'idle';
            }
        }
        
        if (fighter.blockstun > 0) {
            fighter.blockstun -= deltaTime;
            if (fighter.blockstun <= 0) {
                fighter.currentAnimation = 'idle';
            }
        }
        
        if (fighter.attackTimer > 0) {
            fighter.attackTimer -= deltaTime;
            if (fighter.attackTimer <= 0) {
                fighter.attacking = false;
                fighter.currentAnimation = 'idle';
            }
        }
        
        if (fighter.invulnerable > 0) {
            fighter.invulnerable -= deltaTime;
        }
    }
    
    updateAnimation(fighter, deltaTime) {
        fighter.animationTimer += deltaTime;
        
        // Simple animation frame cycling
        if (fighter.animationTimer > 200) {
            fighter.animationFrame = (fighter.animationFrame + 1) % 4;
            fighter.animationTimer = 0;
        }
    }
    
    updateHealthBars() {
        const p1HealthPercent = (this.player1.health / this.player1.maxHealth) * 100;
        const p2HealthPercent = (this.player2.health / this.player2.maxHealth) * 100;
        
        document.getElementById('player1Health').style.width = p1HealthPercent + '%';
        document.getElementById('player2Health').style.width = p2HealthPercent + '%';
    }
    
    checkRoundEnd() {
        if (this.player1.health <= 0) {
            this.endRound(this.player2.name + ' WINS');
        } else if (this.player2.health <= 0) {
            this.endRound(this.player1.name + ' WINS');
        }
    }
    
    endRound(result) {
        this.gameState = 'ROUND_END';
        
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
        }
        
        // Show result
        document.getElementById('resultText').textContent = result;
        document.getElementById('resultDetails').textContent = this.getResultDetails(result);
        document.getElementById('fightResult').classList.remove('hidden');
        
        // Play appropriate sound
        if (result.includes('WINS')) {
            this.playSound('ko');
        }
    }
    
    getResultDetails(result) {
        if (result === 'TIME') {
            const p1Health = this.player1.health;
            const p2Health = this.player2.health;
            if (p1Health > p2Health) {
                return this.player1.name + ' wins by decision!';
            } else if (p2Health > p1Health) {
                return this.player2.name + ' wins by decision!';
            } else {
                return 'Draw match!';
            }
        }
        return 'Knocked out!';
    }
    
    continueGame() {
        // In arcade mode, continue to next opponent
        // In VS mode, return to character select
        if (gameMode === 'arcade') {
            // Select new random opponent
            let newOpponentIndex;
            do {
                newOpponentIndex = Math.floor(Math.random() * this.fighterTemplates.length);
            } while (this.fighterTemplates[newOpponentIndex].id === selectedFighters.player2.id);
            
            selectedFighters.player2 = this.fighterTemplates[newOpponentIndex];
            
            // Reset and restart
            document.getElementById('fightResult').classList.add('hidden');
            this.startFight();
        } else {
            returnToMenu();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.currentStage ? this.currentStage.background : '#2F4F4F';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render stage background
        this.renderStage();
        
        // Render fighters
        if (this.player1) this.renderFighter(this.player1);
        if (this.player2) this.renderFighter(this.player2);
        
        // Render effects
        this.renderEffects();
    }
    
    renderStage() {
        if (!this.currentStage) return;
        
        // Ground
        this.ctx.fillStyle = this.currentStage.accent;
        this.ctx.fillRect(0, this.groundY + 80, this.canvas.width, 20);
        
        // Simple background elements based on stage
        this.ctx.font = '60px monospace';
        this.ctx.fillStyle = this.currentStage.accent + '40';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < 3; i++) {
            const x = (this.canvas.width / 4) * (i + 1);
            const y = this.canvas.height * 0.3;
            this.ctx.fillText(this.currentStage.preview, x, y);
        }
    }
    
    renderFighter(fighter) {
        this.ctx.save();
        
        // Apply invulnerability flashing
        if (fighter.invulnerable > 0 && Math.floor(Date.now() / 100) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Fighter body
        this.ctx.fillStyle = fighter.color;
        this.ctx.fillRect(fighter.x - fighter.width/2, fighter.y - fighter.height, fighter.width, fighter.height);
        
        // Fighter symbol
        this.ctx.font = '40px monospace';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(fighter.avatar, fighter.x, fighter.y - fighter.height/2 + 15);
        
        // Animation effects
        if (fighter.attacking) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            const attackX = fighter.x + (fighter.facing * 60);
            this.ctx.arc(attackX, fighter.y - 40, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        if (fighter.blocking) {
            this.ctx.strokeStyle = '#00AAFF';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(fighter.x - 30, fighter.y - fighter.height - 5, 60, fighter.height + 10);
        }
        
        this.ctx.restore();
    }
    
    renderEffects() {
        // Render any active effects like projectiles, particles, etc.
        // This would be expanded in a full implementation
    }
}

// Global functions to be called from HTML
function populateCharacters() {
    if (window.game) {
        window.game.populateCharacters();
    }
}

function selectStage() {
    if (window.game) {
        window.game.selectStage();
    }
}

function startFight() {
    if (window.game) {
        window.game.startFight();
    }
}

function continueGame() {
    if (window.game) {
        window.game.continueGame();
    }
}

// Initialize game when engine loads
window.game = new FighterFameGame();