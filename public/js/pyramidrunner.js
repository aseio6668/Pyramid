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
        this.levelCompleted = false;
        this.lastCompletedLevel = 0;
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
        this.levelCompleted = false;
        this.lastCompletedLevel = 0;
        
        // Player properties with animation
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
            facing: 1, // 1 = right, -1 = left
            // Animation properties
            animationFrame: 0,
            animationTimer: 0,
            currentAnimation: 'idle',
            animations: {
                idle: { frames: 4, speed: 0.1 },
                walk: { frames: 6, speed: 0.15 },
                run: { frames: 8, speed: 0.2 },
                jump: { frames: 1, speed: 0.1 }
            }
        };
        
        // Animation and effects system
        this.time = 0;
        this.particles = [];
        
        // Screen effects
        this.screenShake = {
            intensity: 0,
            duration: 0,
            timer: 0
        };
        
        // Victory effects
        this.victoryMode = false;
        this.victoryTimer = 0;
        
        // Background layers for parallax
        this.backgroundLayers = [];
        this.initializeBackground();
        
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
    
    initializeBackground() {
        // Background layers for parallax scrolling effect
        this.backgroundLayers = [
            {
                // Sky layer
                type: 'gradient',
                colors: ['#87CEEB', '#FFE5B4', '#DEB887'],
                parallax: 0
            },
            {
                // Distant mountains/pyramids
                type: 'mountains',
                parallax: 0.1,
                y: this.canvas.height * 0.3,
                color: '#8B7355'
            },
            {
                // Mid-distance dunes
                type: 'dunes',
                parallax: 0.3,
                y: this.canvas.height * 0.6,
                color: '#DAA520'
            },
            {
                // Foreground dunes
                type: 'dunes',
                parallax: 0.5,
                y: this.canvas.height * 0.75,
                color: '#F4A460'
            }
        ];
    }
    
    generateLevel() {
        this.levelCompleted = false; // Reset completion flag for new level
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
        
        // Update global time for animations
        this.time += deltaTime * 0.001;
        
        this.handleInput();
        this.updatePlayer();
        this.updateAnimations(deltaTime);
        this.updateParticles(deltaTime);
        this.updateEnemies();
        this.updateCamera();
        this.checkCollisions();
        this.checkGoal();
    }
    
    updateAnimations(deltaTime) {
        // Determine current animation based on player state
        let newAnimation = 'idle';
        
        if (!this.player.onGround) {
            newAnimation = 'jump';
        } else if (Math.abs(this.player.velocityX) > 0.1) {
            newAnimation = this.player.running ? 'run' : 'walk';
        }
        
        // Change animation if needed
        if (newAnimation !== this.player.currentAnimation) {
            this.player.currentAnimation = newAnimation;
            this.player.animationFrame = 0;
            this.player.animationTimer = 0;
        }
        
        // Update animation frame with smoother timing
        const currentAnim = this.player.animations[this.player.currentAnimation];
        this.player.animationTimer += deltaTime * 0.001;
        
        // Smoother animation timing based on movement speed
        let animSpeed = currentAnim.speed;
        if (this.player.currentAnimation === 'run' && Math.abs(this.player.velocityX) > 0) {
            // Adjust animation speed based on movement speed for more natural feel
            animSpeed = currentAnim.speed * (3 / Math.abs(this.player.velocityX));
        }
        
        if (this.player.animationTimer >= animSpeed) {
            this.player.animationFrame = (this.player.animationFrame + 1) % currentAnim.frames;
            this.player.animationTimer = 0;
        }
    }
    
    updateParticles(deltaTime) {
        // Update and remove old particles
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime * 0.001;
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            particle.vy += 50 * deltaTime * 0.001; // gravity on particles
            return particle.life > 0;
        });
        
        // Update screen shake
        if (this.screenShake.timer > 0) {
            this.screenShake.timer -= deltaTime * 0.001;
            if (this.screenShake.timer <= 0) {
                this.screenShake.intensity = 0;
            }
        }
        
        // Update victory effects
        if (this.victoryMode) {
            this.victoryTimer += deltaTime * 0.001;
        }
        
        // Add dust particles when running on ground
        if (this.player.onGround && Math.abs(this.player.velocityX) > 2 && Math.random() < 0.3) {
            this.addDustParticle();
        }
    }
    
    addDustParticle() {
        this.particles.push({
            x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 20,
            y: this.player.y + this.player.height - 5,
            vx: (Math.random() - 0.5) * 20 - this.player.velocityX * 0.5,
            vy: -Math.random() * 20 - 10,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            size: 2 + Math.random() * 2,
            color: '#D2B48C'
        });
    }
    
    updatePlayer() {
        // Apply gravity
        this.player.velocityY += this.gravity;
        
        // Smooth movement with sub-pixel precision for less jittery movement
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Round positions to reduce sub-pixel rendering issues
        this.player.x = Math.round(this.player.x * 100) / 100;
        this.player.y = Math.round(this.player.y * 100) / 100;
        
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
                
                // Collection effects
                this.shakeScreen(2, 0.3);
                
                // Add collection particles
                for (let i = 0; i < 8; i++) {
                    this.particles.push({
                        x: collectible.x + collectible.width / 2,
                        y: collectible.y + collectible.height / 2,
                        vx: (Math.random() - 0.5) * 150,
                        vy: (Math.random() - 0.5) * 150 - 50,
                        life: 1 + Math.random() * 0.5,
                        color: '#FFD700'
                    });
                }
            }
        }
    }
    
    checkGoal() {
        if (this.isColliding(this.player, this.levelGoal) && !this.levelCompleted && !this.victoryMode) {
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
        // Render beautiful Egyptian desert background
        this.renderBackground();
        
        // Save context for camera transform
        this.ctx.save();
        
        // Apply screen shake effect
        let shakeX = 0, shakeY = 0;
        if (this.screenShake.intensity > 0) {
            shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
            shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
        }
        
        this.ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);
        
        // Render world elements
        this.renderPlatforms();
        this.renderEnemies();
        this.renderHazards();
        this.renderCollectibles();
        this.renderParticles();
        this.renderPlayer();
        this.renderGoal();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements
        this.renderSun();
        this.renderForegroundEffects();
        
        if (this.gamePaused) {
            this.renderPauseScreen();
        }
    }
    
    renderBackground() {
        // Desert sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');    // Light sky blue
        gradient.addColorStop(0.3, '#FFE5B4');  // Peach/orange
        gradient.addColorStop(0.7, '#DEB887');  // Tan
        gradient.addColorStop(1, '#F4A460');    // Sandy brown
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render parallax background layers
        for (const layer of this.backgroundLayers) {
            if (layer.type === 'mountains') {
                this.renderMountains(layer);
            } else if (layer.type === 'dunes') {
                this.renderDunes(layer);
            }
        }
    }
    
    renderSun() {
        const sunX = this.canvas.width * 0.8 - this.camera.x * 0.02;
        const sunY = this.canvas.height * 0.15;
        const sunRadius = 40;
        
        // Sun glow
        const sunGlow = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
        sunGlow.addColorStop(0, 'rgba(255, 255, 0, 0.3)');
        sunGlow.addColorStop(0.5, 'rgba(255, 200, 0, 0.1)');
        sunGlow.addColorStop(1, 'rgba(255, 200, 0, 0)');
        
        this.ctx.fillStyle = sunGlow;
        this.ctx.fillRect(sunX - sunRadius * 2, sunY - sunRadius * 2, sunRadius * 4, sunRadius * 4);
        
        // Sun body
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
        sunGradient.addColorStop(0, '#FFFF00');
        sunGradient.addColorStop(0.8, '#FFD700');
        sunGradient.addColorStop(1, '#FFA500');
        
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderMountains(layer) {
        const offsetX = this.camera.x * layer.parallax;
        const mountainCount = 8;
        const mountainWidth = this.canvas.width / mountainCount * 2;
        
        this.ctx.fillStyle = layer.color;
        this.ctx.globalAlpha = 0.6;
        
        for (let i = 0; i < mountainCount + 2; i++) {
            const x = (i * mountainWidth) - offsetX;
            const baseHeight = this.canvas.height * 0.3 + Math.sin(i * 0.7) * 50;
            // Use consistent seed-based height instead of Math.random()
            const seedValue = Math.sin(i * 2.5) * Math.cos(i * 1.8) * 0.5 + 0.5; // Consistent 0-1 value
            const peakHeight = baseHeight + seedValue * 100;
            
            // Draw pyramid-like mountain
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height);
            this.ctx.lineTo(x + mountainWidth * 0.3, layer.y);
            this.ctx.lineTo(x + mountainWidth * 0.5, layer.y - peakHeight * 0.3);
            this.ctx.lineTo(x + mountainWidth * 0.7, layer.y);
            this.ctx.lineTo(x + mountainWidth, this.canvas.height);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    renderDunes(layer) {
        const offsetX = this.camera.x * layer.parallax;
        const duneCount = 6;
        const duneWidth = this.canvas.width / duneCount * 2;
        
        this.ctx.fillStyle = layer.color;
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(-offsetX, this.canvas.height);
        
        for (let i = 0; i < duneCount + 2; i++) {
            const x = (i * duneWidth) - offsetX;
            const height = layer.y + Math.sin(i * 0.5 + this.time * 0.1) * 20;
            
            // Smooth dune curves
            this.ctx.quadraticCurveTo(
                x + duneWidth * 0.3, height - 30,
                x + duneWidth * 0.5, height
            );
            this.ctx.quadraticCurveTo(
                x + duneWidth * 0.7, height + 20,
                x + duneWidth, height + 10
            );
        }
        
        this.ctx.lineTo(this.canvas.width * 2, this.canvas.height);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
    }
    
    renderForegroundEffects() {
        const time = Date.now() * 0.001;
        
        // Enhanced heat shimmer effect with multiple waves
        this.ctx.globalAlpha = 0.15;
        for (let i = 0; i < 3; i++) {
            const shimmerY = this.canvas.height * (0.6 + i * 0.1) + Math.sin(time * (2 + i)) * 8;
            const shimmerIntensity = 0.05 + Math.sin(time * (3 + i)) * 0.03;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${shimmerIntensity})`;
            this.ctx.fillRect(0, shimmerY, this.canvas.width, 1 + i);
        }
        
        // Floating sand particles in the air
        for (let i = 0; i < 15; i++) {
            const particleTime = time + i * 0.3;
            const x = (i * this.canvas.width / 15 + Math.sin(particleTime * 0.5) * 30) % this.canvas.width;
            const y = this.canvas.height * 0.3 + Math.sin(particleTime * 0.7) * 100;
            const size = 1 + Math.sin(particleTime * 2) * 0.5;
            const alpha = 0.2 + Math.sin(particleTime * 1.5) * 0.1;
            
            this.ctx.fillStyle = `rgba(222, 184, 135, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Desert wind effect - subtle color overlay
        const windIntensity = 0.02 + Math.sin(time * 0.5) * 0.01;
        this.ctx.fillStyle = `rgba(244, 164, 96, ${windIntensity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Mystical energy sparkles around collectibles
        this.collectibles.forEach(collectible => {
            if (collectible.collected) return;
            
            for (let i = 0; i < 3; i++) {
                const sparkleTime = time * 4 + i * (Math.PI * 2 / 3);
                const radius = 25 + Math.sin(sparkleTime) * 10;
                const angle = sparkleTime;
                const sparkleX = collectible.x + collectible.width/2 + Math.cos(angle) * radius;
                const sparkleY = collectible.y + collectible.height/2 + Math.sin(angle) * radius;
                const sparkleAlpha = 0.4 + Math.sin(sparkleTime * 2) * 0.3;
                
                this.ctx.fillStyle = `rgba(255, 215, 0, ${sparkleAlpha})`;
                this.ctx.beginPath();
                this.ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    renderPlatforms() {
        for (const platform of this.platforms) {
            if (platform.type === 'ground') {
                this.renderSandGround(platform);
            } else {
                this.renderStonePlatform(platform);
            }
        }
    }
    
    renderSandGround(platform) {
        // Sand base
        const sandGradient = this.ctx.createLinearGradient(
            platform.x, platform.y, 
            platform.x, platform.y + platform.height
        );
        sandGradient.addColorStop(0, '#F4A460'); // Sandy brown
        sandGradient.addColorStop(0.3, '#DEB887'); // Burly wood  
        sandGradient.addColorStop(1, '#CD853F');   // Peru
        
        this.ctx.fillStyle = sandGradient;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Sand texture details
        this.ctx.fillStyle = 'rgba(218, 165, 32, 0.3)';
        for (let x = platform.x; x < platform.x + platform.width; x += 8) {
            const height = 2 + Math.sin(x * 0.1 + this.time) * 1;
            this.ctx.fillRect(x, platform.y, 4, height);
        }
        
        // Occasional small rocks
        if (platform.width > 100) {
            for (let i = 0; i < 3; i++) {
                const rockX = platform.x + (i + 1) * (platform.width / 4) + Math.sin(this.time + i) * 20;
                const rockY = platform.y - 2;
                
                this.ctx.fillStyle = '#8B7355';
                this.ctx.fillRect(rockX, rockY, 4 + Math.random() * 4, 3 + Math.random() * 3);
            }
        }
    }
    
    renderStonePlatform(platform) {
        // Stone base with Egyptian styling
        const stoneGradient = this.ctx.createLinearGradient(
            platform.x, platform.y,
            platform.x, platform.y + platform.height
        );
        stoneGradient.addColorStop(0, '#D2B48C'); // Tan
        stoneGradient.addColorStop(0.5, '#BC9A6A'); // Darker tan
        stoneGradient.addColorStop(1, '#8B7355');   // Dark tan
        
        this.ctx.fillStyle = stoneGradient;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Stone block divisions
        this.ctx.fillStyle = '#8B7355';
        const blockWidth = 40;
        for (let x = platform.x; x < platform.x + platform.width; x += blockWidth) {
            this.ctx.fillRect(x, platform.y, 2, platform.height);
        }
        
        // Horizontal lines
        this.ctx.fillRect(platform.x, platform.y, platform.width, 2);
        this.ctx.fillRect(platform.x, platform.y + platform.height - 2, platform.width, 2);
        
        // Ancient hieroglyph-like decorations (simple)
        if (platform.width > 80) {
            this.ctx.fillStyle = '#654321';
            const centerX = platform.x + platform.width / 2;
            const centerY = platform.y + platform.height / 2;
            
            // Simple eye symbol
            this.ctx.fillRect(centerX - 6, centerY - 2, 12, 4);
            this.ctx.fillRect(centerX - 2, centerY - 4, 4, 8);
        }
    }
    
    renderParticles() {
        for (const particle of this.particles) {
            // Handle both old and new particle formats
            const maxLife = particle.maxLife || 1;
            const alpha = Math.max(0, particle.life / maxLife);
            this.ctx.globalAlpha = alpha;
            
            const size = (particle.size || 3) * alpha;
            this.ctx.fillStyle = particle.color;
            
            // For victory particles, make them sparkle
            if (this.victoryMode && particle.color !== '#DEB887') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                
                // Draw as a star shape for victory particles
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 4) / 5;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
                
                this.ctx.shadowBlur = 0;
            } else {
                // Regular dust particles
                this.ctx.fillRect(
                    particle.x - size / 2, 
                    particle.y - size / 2, 
                    size, 
                    size
                );
            }
        }
        this.ctx.globalAlpha = 1;
    }
    
    renderPlayer() {
        const p = this.player;
        const centerX = p.x + p.width / 2;
        const centerY = p.y + p.height / 2;
        
        // Save context for character transformations
        this.ctx.save();
        
        // Flip sprite if facing left
        if (p.facing < 0) {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-centerX * 2, 0);
        }
        
        // Running glow effect
        if (p.running && p.onGround && Math.abs(p.velocityX) > 2) {
            const glowIntensity = Math.sin(this.time * 10) * 0.5 + 0.5;
            this.ctx.globalAlpha = glowIntensity * 0.3;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(p.x - 4, p.y - 4, p.width + 8, p.height + 8);
            this.ctx.globalAlpha = 1;
        }
        
        // Character body (Ancient Egyptian explorer style)
        this.drawAseoCharacter();
        
        this.ctx.restore();
    }
    
    drawAseoCharacter() {
        const p = this.player;
        const frame = p.animationFrame;
        const bobOffset = p.onGround && p.currentAnimation !== 'idle' ? 
            Math.sin(frame * 0.5) * 2 : 0;
        
        // Body (tunic)
        const bodyGradient = this.ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        bodyGradient.addColorStop(0, '#8B4513');  // Brown
        bodyGradient.addColorStop(0.6, '#CD853F'); // Tan
        bodyGradient.addColorStop(1, '#DEB887');   // Light tan
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.fillRect(p.x + 6, p.y + 12 + bobOffset, p.width - 12, p.height - 20);
        
        // Head
        this.ctx.fillStyle = '#FDBCB4'; // Skin tone
        this.ctx.fillRect(p.x + 8, p.y + 2 + bobOffset, p.width - 16, 14);
        
        // Hair (black)
        this.ctx.fillStyle = '#2F1B14';
        this.ctx.fillRect(p.x + 8, p.y + bobOffset, p.width - 16, 6);
        
        // Eyes
        this.ctx.fillStyle = '#000';
        const eyeX = p.facing > 0 ? p.x + 12 : p.x + 8;
        this.ctx.fillRect(eyeX, p.y + 6 + bobOffset, 2, 2);
        this.ctx.fillRect(eyeX + 6, p.y + 6 + bobOffset, 2, 2);
        
        // Arms (animated based on movement)
        const armOffset = p.currentAnimation === 'walk' || p.currentAnimation === 'run' ? 
            Math.sin(frame * 0.8) * 3 : 0;
        
        this.ctx.fillStyle = '#FDBCB4';
        // Left arm
        this.ctx.fillRect(p.x + 2, p.y + 14 + bobOffset + armOffset, 6, 16);
        // Right arm  
        this.ctx.fillRect(p.x + p.width - 8, p.y + 14 + bobOffset - armOffset, 6, 16);
        
        // Legs (animated walking)
        const legOffset = p.currentAnimation === 'walk' || p.currentAnimation === 'run' ? 
            Math.sin(frame * 1.2) * 4 : 0;
        
        this.ctx.fillStyle = '#8B4513';
        // Left leg
        this.ctx.fillRect(p.x + 8, p.y + p.height - 12 + bobOffset + legOffset, 6, 12);
        // Right leg
        this.ctx.fillRect(p.x + p.width - 14, p.y + p.height - 12 + bobOffset - legOffset, 6, 12);
        
        // Equipment/accessories
        this.drawPlayerAccessories();
    }
    
    drawPlayerAccessories() {
        const p = this.player;
        const bobOffset = p.onGround && p.currentAnimation !== 'idle' ? 
            Math.sin(p.animationFrame * 0.5) * 2 : 0;
        
        // Explorer hat
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(p.x + 6, p.y - 2 + bobOffset, p.width - 12, 4);
        this.ctx.fillRect(p.x + 8, p.y - 4 + bobOffset, p.width - 16, 4);
        
        // Belt
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(p.x + 6, p.y + 24 + bobOffset, p.width - 12, 3);
        
        // Backpack (small)
        this.ctx.fillStyle = '#4A4A4A';
        this.ctx.fillRect(p.x + p.width - 6, p.y + 10 + bobOffset, 4, 8);
    }
    
    renderEnemies() {
        for (const enemy of this.enemies) {
            this.drawDesertScorpion(enemy);
        }
    }
    
    drawDesertScorpion(enemy) {
        const time = this.time + enemy.x * 0.01;
        const bodyBob = Math.sin(time * 4) * 1;
        
        // Main body (segmented)
        this.ctx.fillStyle = '#8B4513';
        
        // Body segments
        for (let i = 0; i < 3; i++) {
            const segmentX = enemy.x + i * 6;
            const segmentY = enemy.y + 8 + bodyBob + Math.sin(time * 3 + i * 0.5) * 0.5;
            const segmentSize = 8 - i;
            
            this.ctx.fillRect(segmentX, segmentY, segmentSize, segmentSize);
        }
        
        // Head/front segment
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(enemy.x, enemy.y + 6 + bodyBob, 10, 10);
        
        // Eyes (glowing red)
        this.ctx.fillStyle = '#FF0000';
        const glowIntensity = Math.sin(time * 6) * 0.3 + 0.7;
        this.ctx.globalAlpha = glowIntensity;
        this.ctx.fillRect(enemy.x + 2, enemy.y + 7 + bodyBob, 2, 2);
        this.ctx.fillRect(enemy.x + 6, enemy.y + 7 + bodyBob, 2, 2);
        this.ctx.globalAlpha = 1;
        
        // Legs (animated)
        this.ctx.fillStyle = '#8B4513';
        const legOffset = Math.sin(time * 8) * 2;
        
        for (let side = 0; side < 2; side++) {
            const y = enemy.y + 16 + bodyBob + (side === 0 ? legOffset : -legOffset);
            const startX = enemy.x + 2;
            
            // 3 legs per side
            for (let leg = 0; leg < 3; leg++) {
                const x = startX + leg * 4;
                this.ctx.fillRect(x, y, 2, 4);
            }
        }
        
        // Tail with stinger
        const tailX = enemy.x + 18;
        const tailY = enemy.y + 4 + bodyBob + Math.sin(time * 2) * 3;
        
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(tailX, tailY, 4, 6);
        
        // Stinger
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(tailX + 1, tailY - 2, 2, 4);
        
        // Claws/pincers
        this.ctx.fillStyle = '#654321';
        const clawOffset = Math.sin(time * 5) * 1;
        this.ctx.fillRect(enemy.x - 3, enemy.y + 8 + bodyBob + clawOffset, 4, 3);
        this.ctx.fillRect(enemy.x - 3, enemy.y + 12 + bodyBob - clawOffset, 4, 3);
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
                this.drawAncientArtifact(collectible);
            }
        }
    }
    
    drawAncientArtifact(collectible) {
        const time = this.time + collectible.x * 0.01;
        const glow = Math.sin(time * 3) * 0.4 + 0.6;
        const float = Math.sin(time * 2) * 3;
        
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2 + float;
        
        // Magical glow aura
        const glowGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 20
        );
        glowGradient.addColorStop(0, `rgba(255, 215, 0, ${glow * 0.6})`);
        glowGradient.addColorStop(0.5, `rgba(255, 215, 0, ${glow * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(centerX - 20, centerY - 20, 40, 40);
        
        // Ancient Egyptian amulet shape (ankh-like)
        this.ctx.fillStyle = '#FFD700'; // Gold
        
        // Main vertical staff
        this.ctx.fillRect(centerX - 2, centerY - 8, 4, 16);
        
        // Horizontal bar
        this.ctx.fillRect(centerX - 6, centerY - 4, 12, 4);
        
        // Top loop (simplified oval)
        this.ctx.fillRect(centerX - 4, centerY - 12, 8, 8);
        this.ctx.fillStyle = '#DAA520'; // Dark goldenrod for inner loop
        this.ctx.fillRect(centerX - 2, centerY - 10, 4, 4);
        
        // Decorative gems
        this.ctx.fillStyle = `rgba(255, 0, 0, ${glow})`;
        this.ctx.fillRect(centerX - 1, centerY - 2, 2, 2);
        
        this.ctx.fillStyle = `rgba(0, 0, 255, ${glow})`;
        this.ctx.fillRect(centerX - 1, centerY + 2, 2, 2);
        
        // Sparkle effects
        if (Math.random() < 0.3) {
            this.addSparkleEffect(centerX, centerY);
        }
    }
    
    addSparkleEffect(x, y) {
        // Add sparkle particles
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.3 + Math.random() * 0.2,
                maxLife: 0.5,
                size: 1 + Math.random() * 2,
                color: Math.random() < 0.5 ? '#FFD700' : '#FFFFFF'
            });
        }
    }
    
    renderGoal() {
        // Enhanced Egyptian Pyramid with mystical portal
        const goal = this.levelGoal;
        const time = Date.now() * 0.001;
        
        // Pyramid shadow
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(goal.x + goal.width / 2 + 5, goal.y + 5);
        this.ctx.lineTo(goal.x + 5, goal.y + goal.height + 5);
        this.ctx.lineTo(goal.x + goal.width + 5, goal.y + goal.height + 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Main pyramid structure with gradient
        const gradient = this.ctx.createLinearGradient(goal.x, goal.y, goal.x + goal.width, goal.y + goal.height);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.3, '#DAA520');
        gradient.addColorStop(0.7, '#B8860B');
        gradient.addColorStop(1, '#8B7355');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(goal.x + goal.width / 2, goal.y);
        this.ctx.lineTo(goal.x, goal.y + goal.height);
        this.ctx.lineTo(goal.x + goal.width, goal.y + goal.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Pyramid outline
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Stone block details
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = 1;
        for (let i = 1; i < 6; i++) {
            const y = goal.y + (goal.height / 6) * i;
            const inset = (goal.width / 12) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(goal.x + inset, y);
            this.ctx.lineTo(goal.x + goal.width - inset, y);
            this.ctx.stroke();
        }
        
        // Mystical entrance portal
        const portalX = goal.x + goal.width / 2;
        const portalY = goal.y + goal.height - 25;
        const portalWidth = 35;
        const portalHeight = 35;
        
        // Portal glow effect
        const glowGradient = this.ctx.createRadialGradient(portalX, portalY, 0, portalX, portalY, 50);
        glowGradient.addColorStop(0, `rgba(255, 215, 0, ${0.6 + Math.sin(time * 3) * 0.2})`);
        glowGradient.addColorStop(0.5, `rgba(218, 165, 32, ${0.3 + Math.sin(time * 2) * 0.1})`);
        glowGradient.addColorStop(1, 'rgba(218, 165, 32, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(portalX, portalY, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Portal entrance
        this.ctx.fillStyle = `rgba(25, 25, 112, ${0.8 + Math.sin(time * 4) * 0.2})`;
        this.ctx.beginPath();
        this.ctx.arc(portalX, portalY, portalWidth / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Portal energy swirls
        for (let i = 0; i < 3; i++) {
            const angle = time * 2 + (i * Math.PI * 2) / 3;
            const radius = 15 + Math.sin(time * 3 + i) * 5;
            const x = portalX + Math.cos(angle) * radius;
            const y = portalY + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `rgba(255, 215, 0, ${0.7 + Math.sin(time * 5 + i) * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Hieroglyphs on pyramid sides
        this.ctx.fillStyle = '#8B4513';
        this.ctx.font = '16px Arial';
        
        // Left side hieroglyphs
        const leftHieroglyphs = ['𓂀', '𓆃', '𓇯'];
        leftHieroglyphs.forEach((glyph, i) => {
            this.ctx.fillText(glyph, goal.x + 15, goal.y + goal.height - 60 + (i * 20));
        });
        
        // Right side hieroglyphs
        const rightHieroglyphs = ['𓈖', '𓊪', '𓋹'];
        rightHieroglyphs.forEach((glyph, i) => {
            this.ctx.fillText(glyph, goal.x + goal.width - 25, goal.y + goal.height - 60 + (i * 20));
        });
        
        // Energy particles around the pyramid
        for (let i = 0; i < 5; i++) {
            const particleTime = time + i * 0.5;
            const x = goal.x + (goal.width * (0.2 + (i * 0.15))) + Math.sin(particleTime * 2) * 10;
            const y = goal.y + goal.height - Math.abs(Math.sin(particleTime * 1.5)) * 30;
            const alpha = 0.3 + Math.sin(particleTime * 3) * 0.2;
            
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
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
    
    shakeScreen(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.timer = duration;
    }
    
    addVictoryParticles() {
        // Fireworks-style particles from the pyramid
        const goal = this.levelGoal;
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: goal.x + goal.width / 2,
                y: goal.y + goal.height / 2,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 300 - 100,
                life: 2 + Math.random(),
                color: ['#FFD700', '#FF6347', '#32CD32', '#FF1493', '#00BFFF'][Math.floor(Math.random() * 5)]
            });
        }
    }

    completeLevel() {
        // Prevent multiple completions
        this.levelCompleted = true;
        
        // Victory effects
        this.victoryMode = true;
        this.victoryTimer = 0;
        this.shakeScreen(5, 0.8);
        this.addVictoryParticles();
        
        const completedLevel = this.level; // Store current level before incrementing
        this.level++;
        this.score += 1000 * this.level; // Level completion bonus
        this.lives = Math.min(5, this.lives + 1); // Bonus life
        this.lastCompletedLevel = completedLevel;
        
        // Show victory animation briefly before continuing
        setTimeout(() => {
            this.victoryMode = false;
            this.levelCompleted = false; // Reset for next level
            this.generateLevel();
            this.respawnPlayer();
            this.updateUI();
            
            // Show level complete message only once per level
            setTimeout(() => {
                const levelToShow = this.lastCompletedLevel;
                if (levelToShow > 0) {
                    alert(`Level ${levelToShow} Complete!\nBonus: ${1000 * levelToShow} points\n+1 Life!`);
                    this.lastCompletedLevel = 0; // Reset to prevent showing again
                }
            }, 100);
        }, 2000); // Show victory effects for 2 seconds
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
        
        // Limit to 60 FPS for smoother performance
        if (deltaTime >= 16.67) { // ~60fps
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
        }
        
        if (this.gameRunning && !this.gamePaused) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
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