// Pyramid Runner - 2D Platformer Game
class PyramidRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameMenu = document.getElementById('gameMenu');
        
        this.setupCanvas();
        this.initializeGame();
        this.setupEventListeners();
        
        this.gameRunning = false;
        this.gamePaused = false;
        this.lastTime = 0;
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const header = document.querySelector('.game-header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - headerHeight;
    }
    
    initializeGame() {
        // Game state
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.character = 'Aseio';
        
        // Player properties
        this.player = {
            x: 100,
            y: this.canvas.height - 150,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            speed: 5,
            jumpPower: -15,
            onGround: false,
            running: false,
            facing: 1 // 1 = right, -1 = left
        };
        
        // Camera
        this.camera = {
            x: 0,
            y: 0
        };
        
        // World properties
        this.gravity = 0.8;
        this.friction = 0.85;
        this.runMultiplier = 1.8;
        
        // Level data
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.hazards = [];
        
        this.generateLevel();
        this.updateUI();
    }
    
    generateLevel() {
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.hazards = [];
        
        const levelWidth = 3000;
        const groundY = this.canvas.height - 50;
        
        // Ground platforms
        for (let x = 0; x < levelWidth; x += 200) {
            this.platforms.push({
                x: x,
                y: groundY,
                width: 200,
                height: 50,
                type: 'ground'
            });
        }
        
        // Floating platforms
        const platformCount = 8 + (this.level * 2);
        for (let i = 0; i < platformCount; i++) {
            this.platforms.push({
                x: 300 + (i * 300) + Math.random() * 100,
                y: groundY - 100 - Math.random() * 200,
                width: 120 + Math.random() * 80,
                height: 20,
                type: 'platform'
            });
        }
        
        // Enemies
        const enemyCount = 3 + this.level;
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push({
                x: 400 + (i * 400) + Math.random() * 200,
                y: groundY - 30,
                width: 24,
                height: 24,
                velocityX: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()),
                patrolRange: 100 + Math.random() * 100,
                startX: 0,
                type: 'walker'
            });
        }
        
        // Set enemy start positions
        this.enemies.forEach(enemy => {
            enemy.startX = enemy.x;
        });
        
        // Collectibles (ancient artifacts)
        const collectibleCount = 5 + this.level;
        for (let i = 0; i < collectibleCount; i++) {
            this.collectibles.push({
                x: 200 + (i * 250) + Math.random() * 100,
                y: groundY - 80 - Math.random() * 150,
                width: 16,
                height: 16,
                type: 'artifact',
                value: 100 + (this.level * 50),
                collected: false
            });
        }
        
        // Hazards (spikes)
        const hazardCount = 2 + this.level;
        for (let i = 0; i < hazardCount; i++) {
            this.hazards.push({
                x: 600 + (i * 500) + Math.random() * 200,
                y: groundY - 20,
                width: 40,
                height: 20,
                type: 'spikes'
            });
        }
        
        // Level end goal (pyramid entrance)
        this.levelGoal = {
            x: levelWidth - 200,
            y: groundY - 100,
            width: 80,
            height: 100,
            type: 'pyramid'
        };
    }
    
    setupEventListeners() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
            
            // Prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
    }
    
    updateUI() {
        document.getElementById('currentLevel').textContent = this.level;
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentLives').textContent = this.lives;
        document.getElementById('currentCharacter').textContent = this.character;
    }
    
    handleInput() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Horizontal movement
        this.player.running = this.keys['shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const currentSpeed = this.player.speed * (this.player.running ? this.runMultiplier : 1);
        
        if (this.keys['a'] || this.keys['arrowleft'] || this.keys['ArrowLeft']) {
            this.player.velocityX = -currentSpeed;
            this.player.facing = -1;
        } else if (this.keys['d'] || this.keys['arrowright'] || this.keys['ArrowRight']) {
            this.player.velocityX = currentSpeed;
            this.player.facing = 1;
        } else {
            this.player.velocityX *= this.friction;
        }
        
        // Jump
        if ((this.keys['w'] || this.keys['arrowup'] || this.keys['ArrowUp'] || this.keys[' '] || this.keys['Space']) && this.player.onGround) {
            this.player.velocityY = this.player.jumpPower;
            this.player.onGround = false;
        }
        
        // Pause
        if (this.keys['p']) {
            this.keys['p'] = false; // Prevent repeated pausing
            this.togglePause();
        }
        
        // Restart level
        if (this.keys['r']) {
            this.keys['r'] = false;
            this.restartLevel();
        }
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.handleInput();
        this.updatePlayer();
        this.updateEnemies();
        this.updateCamera();
        this.checkCollisions();
        this.checkGoal();
    }
    
    updatePlayer() {
        // Apply gravity
        this.player.velocityY += this.gravity;
        
        // Update position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Platform collisions
        this.player.onGround = false;
        
        for (const platform of this.platforms) {
            if (this.isColliding(this.player, platform)) {
                // Landing on top
                if (this.player.velocityY > 0 && this.player.y < platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                }
                // Hit from below
                else if (this.player.velocityY < 0 && this.player.y > platform.y) {
                    this.player.y = platform.y + platform.height;
                    this.player.velocityY = 0;
                }
                // Hit from sides
                else if (this.player.velocityY === 0 || Math.abs(this.player.velocityY) < 2) {
                    if (this.player.x < platform.x) {
                        this.player.x = platform.x - this.player.width;
                    } else {
                        this.player.x = platform.x + platform.width;
                    }
                    this.player.velocityX = 0;
                }
            }
        }
        
        // World boundaries
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.velocityX = 0;
        }
        
        // Fall death
        if (this.player.y > this.canvas.height + 100) {
            this.playerDie();
        }
    }
    
    updateEnemies() {
        for (const enemy of this.enemies) {
            enemy.x += enemy.velocityX;
            
            // Patrol behavior
            const distanceFromStart = Math.abs(enemy.x - enemy.startX);
            if (distanceFromStart > enemy.patrolRange) {
                enemy.velocityX *= -1;
            }
            
            // Platform boundaries
            let onPlatform = false;
            for (const platform of this.platforms) {
                if (enemy.y + enemy.height >= platform.y && 
                    enemy.y + enemy.height <= platform.y + platform.height + 10 &&
                    enemy.x + enemy.width > platform.x && 
                    enemy.x < platform.x + platform.width) {
                    onPlatform = true;
                    break;
                }
            }
            
            if (!onPlatform) {
                enemy.velocityX *= -1;
                enemy.x += enemy.velocityX * 2; // Move back onto platform
            }
        }
    }
    
    updateCamera() {
        // Follow player with smooth camera
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.05;
        
        // Camera bounds
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.y = Math.max(-200, Math.min(200, this.camera.y));
    }
    
    checkCollisions() {
        // Enemy collisions
        for (const enemy of this.enemies) {
            if (this.isColliding(this.player, enemy)) {
                this.playerDie();
                return;
            }
        }
        
        // Hazard collisions
        for (const hazard of this.hazards) {
            if (this.isColliding(this.player, hazard)) {
                this.playerDie();
                return;
            }
        }
        
        // Collectible collisions
        for (const collectible of this.collectibles) {
            if (!collectible.collected && this.isColliding(this.player, collectible)) {
                collectible.collected = true;
                this.score += collectible.value;
                this.updateUI();
            }
        }
    }
    
    checkGoal() {
        if (this.isColliding(this.player, this.levelGoal)) {
            this.completeLevel();
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 70%, #8FBC8F 100%)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        this.renderPlatforms();
        this.renderEnemies();
        this.renderHazards();
        this.renderCollectibles();
        this.renderPlayer();
        this.renderGoal();
        
        // Restore context
        this.ctx.restore();
        
        if (this.gamePaused) {
            this.renderPauseScreen();
        }
    }
    
    renderPlatforms() {
        for (const platform of this.platforms) {
            this.ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#CD853F';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add some texture
            this.ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#DEB887';
            this.ctx.fillRect(platform.x, platform.y, platform.width, 5);
        }
    }
    
    renderPlayer() {
        // Simple character representation
        this.ctx.fillStyle = '#FF6B35'; // Orange/red color for Aseio
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Face direction indicator
        this.ctx.fillStyle = '#FFF';
        const eyeX = this.player.x + (this.player.facing > 0 ? 20 : 8);
        this.ctx.fillRect(eyeX, this.player.y + 8, 4, 4);
        
        // Running indicator
        if (this.player.running && this.player.onGround && Math.abs(this.player.velocityX) > 2) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.fillRect(this.player.x - 2, this.player.y - 2, this.player.width + 4, this.player.height + 4);
        }
    }
    
    renderEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.fillStyle = '#8B0000'; // Dark red
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Enemy eyes
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(enemy.x + 4, enemy.y + 4, 3, 3);
            this.ctx.fillRect(enemy.x + 17, enemy.y + 4, 3, 3);
        }
    }
    
    renderHazards() {
        for (const hazard of this.hazards) {
            if (hazard.type === 'spikes') {
                this.ctx.fillStyle = '#696969';
                this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                
                // Spike details
                this.ctx.fillStyle = '#2F2F2F';
                for (let i = 0; i < hazard.width; i += 8) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(hazard.x + i, hazard.y + hazard.height);
                    this.ctx.lineTo(hazard.x + i + 4, hazard.y);
                    this.ctx.lineTo(hazard.x + i + 8, hazard.y + hazard.height);
                    this.ctx.fill();
                }
            }
        }
    }
    
    renderCollectibles() {
        for (const collectible of this.collectibles) {
            if (!collectible.collected) {
                // Ancient artifact - golden with glow effect
                const time = Date.now() * 0.005;
                const glow = Math.sin(time) * 0.3 + 0.7;
                
                this.ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
                this.ctx.fillRect(collectible.x - 2, collectible.y - 2, collectible.width + 4, collectible.height + 4);
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
                
                // Artifact symbol
                this.ctx.fillStyle = '#B8860B';
                this.ctx.fillRect(collectible.x + 4, collectible.y + 2, 8, 2);
                this.ctx.fillRect(collectible.x + 6, collectible.y + 6, 4, 8);
            }
        }
    }
    
    renderGoal() {
        // Pyramid entrance
        const goal = this.levelGoal;
        this.ctx.fillStyle = '#DAA520';
        
        // Pyramid shape
        this.ctx.beginPath();
        this.ctx.moveTo(goal.x + goal.width / 2, goal.y);
        this.ctx.lineTo(goal.x, goal.y + goal.height);
        this.ctx.lineTo(goal.x + goal.width, goal.y + goal.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Entrance
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(goal.x + goal.width / 2 - 15, goal.y + goal.height - 30, 30, 30);
    }
    
    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    playerDie() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.respawnPlayer();
        }
    }
    
    respawnPlayer() {
        // Reset player to level start
        this.player.x = 100;
        this.player.y = this.canvas.height - 150;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = false;
    }
    
    completeLevel() {
        this.level++;
        this.score += 1000 * this.level; // Level completion bonus
        this.lives = Math.min(5, this.lives + 1); // Bonus life
        
        this.generateLevel();
        this.respawnPlayer();
        this.updateUI();
        
        // Show level complete message briefly
        setTimeout(() => {
            alert(`Level ${this.level - 1} Complete!\nBonus: ${1000 * (this.level - 1)} points\n+1 Life!`);
        }, 100);
    }
    
    gameOver() {
        this.gameRunning = false;
        alert(`Game Over!\nFinal Score: ${this.score}\nLevels Completed: ${this.level - 1}`);
        this.showMenu();
    }
    
    restartLevel() {
        this.generateLevel();
        this.respawnPlayer();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
    }
    
    gameLoop(currentTime) {
        if (this.lastTime === 0) this.lastTime = currentTime;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameMenu.classList.add('hidden');
        this.respawnPlayer();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    showMenu() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameMenu.classList.remove('hidden');
    }
}

// Initialize game
let game;

document.addEventListener('DOMContentLoaded', function() {
    game = new PyramidRunner();
});

// Global functions for UI
function startGame() {
    if (!game) {
        game = new PyramidRunner();
    }
    game.start();
}

function pauseGame() {
    if (game) {
        game.togglePause();
    }
}

function showMenu() {
    if (game) {
        game.showMenu();
    }
}

function selectCharacter() {
    alert('Character selection coming soon!');
}

function showLeaderboard() {
    alert('Leaderboard coming soon!');
}