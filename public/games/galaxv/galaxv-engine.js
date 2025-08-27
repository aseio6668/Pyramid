class GalexVGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER
        this.currentStage = 1;
        this.score = 0;
        this.lives = 3;
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        this.powerups = [];
        this.stars = [];
        
        // Stage system
        this.stageProgress = 0;
        this.stageLength = 10000; // Stage length in pixels
        this.enemySpawnTimer = 0;
        this.stageComplete = false;
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Initialize star field
        this.initStarField();
        
        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Prevent arrow keys from scrolling
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    initStarField() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 2 + 1,
                brightness: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    initializeGame() {
        this.gameState = 'PLAYING';
        this.currentStage = 1;
        this.score = 0;
        this.lives = 3;
        this.stageProgress = 0;
        this.stageComplete = false;
        
        // Clear all arrays
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        this.powerups = [];
        
        // Create player ship based on selected type
        this.createPlayer(selectedShipType);
        
        // Update UI
        this.updateUI();
        
        // Show stage indicator
        this.showStageIndicator();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    createPlayer(shipType) {
        const shipConfigs = [
            { // VIPER - Fast, weak
                symbol: '🔺',
                speed: 6,
                health: 2,
                fireRate: 8,
                bulletSpeed: 12,
                bulletDamage: 1,
                color: '#00ff41'
            },
            { // PHOENIX - Balanced
                symbol: '♦',
                speed: 4,
                health: 3,
                fireRate: 6,
                bulletSpeed: 10,
                bulletDamage: 2,
                color: '#ff6600'
            },
            { // TITAN - Slow, strong
                symbol: '⬟',
                speed: 2,
                health: 5,
                fireRate: 4,
                bulletSpeed: 8,
                bulletDamage: 3,
                color: '#0066ff'
            }
        ];
        
        const config = shipConfigs[shipType];
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            width: 40,
            height: 40,
            speed: config.speed,
            health: config.health,
            maxHealth: config.health,
            fireRate: config.fireRate,
            lastShot: 0,
            bulletSpeed: config.bulletSpeed,
            bulletDamage: config.bulletDamage,
            symbol: config.symbol,
            color: config.color,
            invulnerable: 0,
            powerLevel: 1,
            shield: false
        };
    }
    
    gameLoop(currentTime) {
        if (this.gameState !== 'PLAYING') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        // Update player
        this.updatePlayer(deltaTime);
        
        // Update bullets
        this.updateBullets(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update explosions
        this.updateExplosions(deltaTime);
        
        // Update powerups
        this.updatePowerups(deltaTime);
        
        // Update stars
        this.updateStars(deltaTime);
        
        // Spawn enemies
        this.spawnEnemies(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update stage progress
        this.updateStageProgress(deltaTime);
        
        // Check for game over
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    updatePlayer(deltaTime) {
        if (!this.player) return;
        
        // Movement
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.player.y += this.player.speed;
        }
        
        // Keep player on screen
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        
        // Shooting
        if (this.keys[' '] && Date.now() - this.player.lastShot > 1000 / this.player.fireRate) {
            this.playerShoot();
            this.player.lastShot = Date.now();
        }
        
        // Update invulnerability
        if (this.player.invulnerable > 0) {
            this.player.invulnerable -= deltaTime;
        }
    }
    
    playerShoot() {
        const centerX = this.player.x + this.player.width / 2;
        
        if (this.player.powerLevel === 1) {
            // Single shot
            this.bullets.push(this.createBullet(centerX, this.player.y, 0, -this.player.bulletSpeed, true));
        } else if (this.player.powerLevel === 2) {
            // Double shot
            this.bullets.push(this.createBullet(centerX - 10, this.player.y, 0, -this.player.bulletSpeed, true));
            this.bullets.push(this.createBullet(centerX + 10, this.player.y, 0, -this.player.bulletSpeed, true));
        } else if (this.player.powerLevel >= 3) {
            // Triple shot
            this.bullets.push(this.createBullet(centerX, this.player.y, 0, -this.player.bulletSpeed, true));
            this.bullets.push(this.createBullet(centerX - 15, this.player.y, -1, -this.player.bulletSpeed, true));
            this.bullets.push(this.createBullet(centerX + 15, this.player.y, 1, -this.player.bulletSpeed, true));
        }
    }
    
    createBullet(x, y, vx, vy, friendly = true) {
        return {
            x: x,
            y: y,
            width: 4,
            height: 12,
            vx: vx,
            vy: vy,
            damage: friendly ? this.player.bulletDamage : 1,
            friendly: friendly,
            color: friendly ? '#00ff41' : '#ff4444'
        };
    }
    
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Remove bullets that are off screen
            if (bullet.y < -20 || bullet.y > this.canvas.height + 20 || 
                bullet.x < -20 || bullet.x > this.canvas.width + 20) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    spawnEnemies(deltaTime) {
        this.enemySpawnTimer += deltaTime;
        
        const spawnRate = this.getEnemySpawnRate();
        if (this.enemySpawnTimer > spawnRate) {
            this.createEnemy();
            this.enemySpawnTimer = 0;
        }
    }
    
    getEnemySpawnRate() {
        // Spawn rate based on stage and progress
        const baseRate = 1000 - (this.currentStage * 100);
        const progressMultiplier = 1 - (this.stageProgress / this.stageLength) * 0.5;
        return Math.max(200, baseRate * progressMultiplier);
    }
    
    createEnemy() {
        const enemyTypes = this.getEnemyTypesForStage(this.currentStage);
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: enemyType.width,
            height: enemyType.height,
            health: enemyType.health,
            speed: enemyType.speed,
            symbol: enemyType.symbol,
            color: enemyType.color,
            pattern: enemyType.pattern,
            shootTimer: 0,
            shootRate: enemyType.shootRate || 2000,
            points: enemyType.points,
            angle: 0
        };
        
        this.enemies.push(enemy);
    }
    
    getEnemyTypesForStage(stage) {
        const allTypes = [
            // Stage 1: Basic enemies
            {
                symbol: '▼', width: 30, height: 30, health: 1, speed: 2,
                color: '#ff4444', pattern: 'straight', points: 100
            },
            {
                symbol: '◆', width: 35, height: 35, health: 2, speed: 1.5,
                color: '#ffaa00', pattern: 'zigzag', points: 150
            },
            // Stage 2: Advanced enemies
            {
                symbol: '◊', width: 40, height: 40, health: 3, speed: 2.5,
                color: '#ff00ff', pattern: 'circle', points: 200, shootRate: 1500
            },
            // Stage 3: Heavy enemies
            {
                symbol: '◄►', width: 50, height: 35, health: 4, speed: 1,
                color: '#00ffff', pattern: 'shooter', points: 300, shootRate: 1000
            },
            // Stage 4: Boss-like enemies
            {
                symbol: '♠', width: 60, height: 60, health: 6, speed: 0.8,
                color: '#ff0080', pattern: 'boss', points: 500, shootRate: 800
            }
        ];
        
        // Return enemy types appropriate for current stage
        return allTypes.slice(0, Math.min(stage + 1, allTypes.length));
    }
    
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Move enemy based on pattern
            this.moveEnemyByPattern(enemy, deltaTime);
            
            // Enemy shooting
            if (enemy.shootRate) {
                enemy.shootTimer += deltaTime;
                if (enemy.shootTimer > enemy.shootRate) {
                    this.enemyShoot(enemy);
                    enemy.shootTimer = 0;
                }
            }
            
            // Remove enemies that are off screen
            if (enemy.y > this.canvas.height + 50) {
                this.enemies.splice(i, 1);
            }
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                this.score += enemy.points;
                
                // Chance to drop powerup
                if (Math.random() < 0.1) {
                    this.createPowerup(enemy.x, enemy.y);
                }
                
                this.enemies.splice(i, 1);
                this.updateUI();
            }
        }
    }
    
    moveEnemyByPattern(enemy, deltaTime) {
        enemy.angle += deltaTime * 0.001;
        
        switch (enemy.pattern) {
            case 'straight':
                enemy.y += enemy.speed;
                break;
            case 'zigzag':
                enemy.y += enemy.speed;
                enemy.x += Math.sin(enemy.angle * 5) * 2;
                break;
            case 'circle':
                enemy.y += enemy.speed * 0.5;
                enemy.x += Math.cos(enemy.angle * 8) * 3;
                break;
            case 'shooter':
                enemy.y += enemy.speed;
                if (enemy.y > 50 && enemy.y < 200) {
                    enemy.x += Math.sin(enemy.angle * 3) * 1.5;
                }
                break;
            case 'boss':
                enemy.y += enemy.speed;
                if (enemy.y > 100) {
                    enemy.x += Math.sin(enemy.angle * 2) * 2;
                    enemy.y += Math.cos(enemy.angle * 1.5) * 0.5;
                }
                break;
        }
        
        // Keep enemies roughly on screen horizontally
        if (enemy.x < -20) enemy.x = -20;
        if (enemy.x > this.canvas.width - enemy.width + 20) {
            enemy.x = this.canvas.width - enemy.width + 20;
        }
    }
    
    enemyShoot(enemy) {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height;
        
        // Basic enemy bullet toward player
        const dx = this.player.x + this.player.width / 2 - centerX;
        const dy = this.player.y + this.player.height / 2 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const speed = 4;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        this.bullets.push(this.createBullet(centerX, centerY, vx, vy, false));
    }
    
    createPowerup(x, y) {
        const powerupTypes = [
            { symbol: '⚡', type: 'power', color: '#ffff00' },
            { symbol: '❤', type: 'health', color: '#ff0080' },
            { symbol: '🛡', type: 'shield', color: '#00aaff' },
            { symbol: '⭐', type: 'score', color: '#ff8800' }
        ];
        
        const powerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        this.powerups.push({
            x: x,
            y: y,
            width: 25,
            height: 25,
            symbol: powerup.symbol,
            type: powerup.type,
            color: powerup.color,
            bobOffset: 0
        });
    }
    
    updatePowerups(deltaTime) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += 2;
            powerup.bobOffset += deltaTime * 0.005;
            
            // Remove powerups that are off screen
            if (powerup.y > this.canvas.height + 30) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 40,
            life: 1,
            color: `hsl(${Math.random() * 60 + 10}, 100%, 60%)`
        });
    }
    
    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= deltaTime * 0.003;
            explosion.radius = explosion.maxRadius * (1 - explosion.life);
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    updateStars(deltaTime) {
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.friendly) continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(bullet, enemy)) {
                    enemy.health -= bullet.damage;
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Enemy bullets vs player
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.friendly || this.player.invulnerable > 0) continue;
            
            if (this.isColliding(bullet, this.player)) {
                this.playerHit();
                this.bullets.splice(i, 1);
            }
        }
        
        // Player vs enemies
        if (this.player.invulnerable <= 0) {
            for (const enemy of this.enemies) {
                if (this.isColliding(this.player, enemy)) {
                    this.playerHit();
                    enemy.health = 0; // Destroy enemy too
                    break;
                }
            }
        }
        
        // Player vs powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (this.isColliding(this.player, powerup)) {
                this.collectPowerup(powerup);
                this.powerups.splice(i, 1);
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    playerHit() {
        if (this.player.shield) {
            this.player.shield = false;
            this.player.invulnerable = 2000;
        } else {
            this.player.health--;
            if (this.player.health <= 0) {
                this.lives--;
                if (this.lives > 0) {
                    this.respawnPlayer();
                }
            }
            this.player.invulnerable = 2000;
        }
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.updateUI();
    }
    
    respawnPlayer() {
        this.player.health = this.player.maxHealth;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 60;
        this.player.invulnerable = 3000;
    }
    
    collectPowerup(powerup) {
        switch (powerup.type) {
            case 'power':
                this.player.powerLevel = Math.min(3, this.player.powerLevel + 1);
                break;
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
                break;
            case 'shield':
                this.player.shield = true;
                break;
            case 'score':
                this.score += 1000;
                break;
        }
        this.updateUI();
    }
    
    updateStageProgress(deltaTime) {
        if (!this.stageComplete) {
            this.stageProgress += deltaTime * 0.1;
            
            if (this.stageProgress >= this.stageLength) {
                this.completeStage();
            }
        }
    }
    
    completeStage() {
        this.stageComplete = true;
        this.currentStage++;
        this.score += 2000; // Stage completion bonus
        
        if (this.currentStage > 4) {
            this.gameWin();
        } else {
            this.stageProgress = 0;
            this.stageComplete = false;
            this.showStageIndicator();
            
            // Clear enemies and bullets for new stage
            this.enemies = [];
            this.bullets = this.bullets.filter(b => b.friendly);
        }
        
        this.updateUI();
    }
    
    showStageIndicator() {
        const indicator = document.getElementById('stageIndicator');
        document.getElementById('stageNumber').textContent = this.currentStage;
        indicator.classList.remove('hidden');
        
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    }
    
    gameWin() {
        this.gameState = 'GAME_OVER';
        // Show victory screen instead of game over
        alert(`MISSION ACCOMPLISHED!\nFinal Score: ${this.score}\nAll 4 stages completed!`);
        this.resetToMenu();
    }
    
    gameOver() {
        this.gameState = 'GAME_OVER';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    resetToMenu() {
        this.gameState = 'MENU';
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('shipSelection').style.display = 'block';
        selectedShipType = null;
        document.getElementById('startBtn').disabled = true;
        
        // Reset ship selection visual state
        document.querySelectorAll('.ship-card').forEach(card => {
            card.style.background = 'rgba(0, 255, 65, 0.1)';
            card.style.boxShadow = 'none';
        });
    }
    
    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('stage').textContent = this.currentStage;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render stars
        this.renderStars();
        
        // Render game objects
        this.renderPlayer();
        this.renderBullets();
        this.renderEnemies();
        this.renderPowerups();
        this.renderExplosions();
        
        // Render pause overlay
        if (this.gameState === 'PAUSED') {
            this.renderPauseOverlay();
        }
    }
    
    renderStars() {
        for (const star of this.stars) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, 2, 2);
        }
    }
    
    renderPlayer() {
        if (!this.player) return;
        
        const isInvulnerable = this.player.invulnerable > 0;
        const alpha = isInvulnerable && Math.sin(Date.now() * 0.02) > 0 ? 0.3 : 1;
        
        this.ctx.globalAlpha = alpha;
        
        // Player ship
        this.ctx.font = '30px monospace';
        this.ctx.fillStyle = this.player.color;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.player.symbol,
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2 + 10
        );
        
        // Shield effect
        if (this.player.shield) {
            this.ctx.strokeStyle = '#00aaff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                25 + Math.sin(Date.now() * 0.01) * 3,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        // Health bar
        this.renderHealthBar(this.player.x, this.player.y - 15, this.player.health, this.player.maxHealth);
        
        this.ctx.globalAlpha = 1;
    }
    
    renderHealthBar(x, y, health, maxHealth) {
        const width = 40;
        const height = 4;
        
        // Background
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(x, y, width, height);
        
        // Health
        const healthPercent = health / maxHealth;
        const healthWidth = width * healthPercent;
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff41' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
        this.ctx.fillRect(x, y, healthWidth, height);
    }
    
    renderBullets() {
        for (const bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
    
    renderEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.font = `${enemy.width}px monospace`;
            this.ctx.fillStyle = enemy.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                enemy.symbol,
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2 + enemy.width / 3
            );
            
            if (enemy.health > 1) {
                this.renderHealthBar(enemy.x, enemy.y - 10, enemy.health, enemy.health);
            }
        }
    }
    
    renderPowerups() {
        for (const powerup of this.powerups) {
            const bobY = powerup.y + Math.sin(powerup.bobOffset) * 3;
            
            this.ctx.font = '20px monospace';
            this.ctx.fillStyle = powerup.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                powerup.symbol,
                powerup.x + powerup.width / 2,
                bobY + powerup.height / 2 + 7
            );
        }
    }
    
    renderExplosions() {
        for (const explosion of this.explosions) {
            this.ctx.globalAlpha = explosion.life;
            this.ctx.fillStyle = explosion.color;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = '48px monospace';
        this.ctx.fillStyle = '#00ff41';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '20px monospace';
        this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}

// Initialize game when called from HTML
function initializeGame() {
    if (!window.game) {
        window.game = new GalexVGame();
    }
    window.game.initializeGame();
}