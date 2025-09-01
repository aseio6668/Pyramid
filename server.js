const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sharp = require('sharp');
const cron = require('node-cron');
const { spawn, exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: ['http://localhost:3000', 'https://games.aseiotech.com'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
    secret: 'mastercredits-casino-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Define routes BEFORE static middleware to avoid conflicts
// Platform routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'index.html'));
});

app.get('/games', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'index.html'));
});

app.get('/games/mastercredits', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'mastercredits', 'index.html'));
});

app.get('/games/pyramidrunner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'pyramidrunner', 'index.html'));
});

app.get('/games/galaxv', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'galaxv', 'index.html'));
});

app.get('/games/famousfighter', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'famousfighter', 'index.html'));
});

app.get('/games/par4', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'par4', 'index.html'));
});

app.get('/games/pinataparty', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'pinataparty', 'index.html'));
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const db = new sqlite3.Database('./pyramid.db');

db.serialize(() => {
    // Platform Users - main user table for all games
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        platform_level INTEGER DEFAULT 1,
        platform_experience INTEGER DEFAULT 0,
        avatar_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        unlocked_avatars TEXT DEFAULT '[]',
        muted_users TEXT DEFAULT '[]'
    )`);

    // Game-specific data for MasterCredits Casino
    db.run(`CREATE TABLE IF NOT EXISTS mastercredits_data (
        user_id INTEGER PRIMARY KEY,
        mc_balance REAL DEFAULT 100000.0000,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        skill_points INTEGER DEFAULT 0,
        last_handout DATETIME,
        unlocked_emojis TEXT DEFAULT '[]',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Game-specific data for Pyramid Runner (placeholder for future)
    db.run(`CREATE TABLE IF NOT EXISTS pyramidrunner_data (
        user_id INTEGER PRIMARY KEY,
        high_score INTEGER DEFAULT 0,
        levels_completed INTEGER DEFAULT 0,
        current_character TEXT DEFAULT 'default',
        unlocked_characters TEXT DEFAULT '[]',
        power_ups TEXT DEFAULT '[]',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Game-specific data for GalexV
    db.run(`CREATE TABLE IF NOT EXISTS galaxv_data (
        user_id INTEGER PRIMARY KEY,
        high_score INTEGER DEFAULT 0,
        stages_completed INTEGER DEFAULT 0,
        total_kills INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        favorite_ship TEXT DEFAULT 'viper',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Game-specific data for FamousFighter
    db.run(`CREATE TABLE IF NOT EXISTS famousfighter_data (
        user_id INTEGER PRIMARY KEY,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        tournament_wins INTEGER DEFAULT 0,
        favorite_fighter TEXT DEFAULT 'ryu',
        win_streak INTEGER DEFAULT 0,
        total_fights INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Unified game sessions for all games
    db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        game_name TEXT,
        game_type TEXT,
        bet_amount REAL,
        payout REAL,
        result TEXT,
        platform_experience_gained INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Platform-wide chat messages
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        message TEXT,
        game_context TEXT DEFAULT 'platform',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_system BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // MasterCredits specific talents
    db.run(`CREATE TABLE IF NOT EXISTS mastercredits_talents (
        user_id INTEGER,
        talent_id TEXT,
        points INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, talent_id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Platform admin settings
    db.run(`CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY,
        admin_password TEXT DEFAULT '$2b$10$rQZ1vQZ1vQZ1vQZ1vQZ1vO',
        last_backup DATETIME,
        maintenance_mode BOOLEAN DEFAULT 0
    )`);

    db.run(`INSERT OR IGNORE INTO admin_settings (id, admin_password) VALUES (1, ?);`, [bcrypt.hashSync('admin', 10)]);
});

const upload = multer({
    dest: 'uploads/avatars/',
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'));
        }
    }
});

function requireAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function createCaptchaImage(text) {
    const width = 120;
    const height = 40;
    const canvas = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="noise" patternUnits="userSpaceOnUse" width="4" height="4">
                <rect width="1" height="1" fill="#${Math.floor(Math.random()*16777215).toString(16)}"/>
                <rect x="2" y="2" width="1" height="1" fill="#${Math.floor(Math.random()*16777215).toString(16)}"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#noise)" opacity="0.1"/>
        <text x="10" y="28" font-family="Arial, monospace" font-size="20" font-weight="bold" 
              fill="#${Math.floor(Math.random()*16777215).toString(16)}" 
              transform="rotate(${(Math.random()-0.5)*20} 60 20)">
            ${text}
        </text>
        <line x1="${Math.random()*width}" y1="0" x2="${Math.random()*width}" y2="${height}" 
              stroke="#${Math.floor(Math.random()*16777215).toString(16)}" stroke-width="1"/>
        <line x1="0" y1="${Math.random()*height}" x2="${width}" y2="${Math.random()*height}" 
              stroke="#${Math.floor(Math.random()*16777215).toString(16)}" stroke-width="1"/>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}

app.get('/admin', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/admin/check', requireAdmin, (req, res) => {
    res.json({ success: true });
});

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
    const queries = [
        'SELECT COUNT(*) as totalUsers FROM users',
        'SELECT COUNT(*) as activeUsers FROM users WHERE DATE(last_login) = DATE("now")',
        'SELECT SUM(mc_balance) as totalMC FROM users',
        'SELECT COUNT(*) as gamesPlayed FROM game_sessions WHERE DATE(timestamp) = DATE("now")'
    ];
    
    Promise.all(queries.map(query => 
        new Promise((resolve, reject) => {
            db.get(query, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        })
    )).then(results => {
        res.json({
            totalUsers: results[0].totalUsers,
            activeUsers: results[1].activeUsers,
            totalMC: results[2].totalMC || 0,
            gamesPlayed: results[3].gamesPlayed
        });
    }).catch(err => {
        res.status(500).json({ error: 'Failed to load dashboard data' });
    });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
    db.all('SELECT id, username, level, mc_balance, last_login, created_at FROM users ORDER BY created_at DESC LIMIT 100', (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load users' });
        }
        res.json(users);
    });
});

app.get('/api/admin/game-stats', requireAdmin, (req, res) => {
    const queries = {
        blackjack: 'SELECT COUNT(*) as count, SUM(bet_amount) as totalBet, SUM(payout) as totalPayout FROM game_sessions WHERE game_type = "blackjack"',
        coinflip: 'SELECT COUNT(*) as count, SUM(bet_amount) as totalBet, SUM(payout) as totalPayout FROM game_sessions WHERE game_type = "coinflip"',
        starbound: 'SELECT COUNT(*) as count, SUM(bet_amount) as totalBet, SUM(payout) as totalPayout FROM game_sessions WHERE game_type = "starbound"',
        total: 'SELECT SUM(payout) as totalPayout FROM game_sessions'
    };
    
    const promises = Object.entries(queries).map(([key, query]) =>
        new Promise((resolve, reject) => {
            db.get(query, (err, row) => {
                if (err) reject(err);
                else resolve([key, row]);
            });
        })
    );
    
    Promise.all(promises).then(results => {
        const data = {};
        results.forEach(([key, row]) => {
            data[key] = row;
        });
        data.totalPayout = data.total.totalPayout || 0;
        res.json(data);
    }).catch(err => {
        res.status(500).json({ error: 'Failed to load game stats' });
    });
});

app.get('/api/admin/chat-logs', requireAdmin, (req, res) => {
    db.all('SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 50', (err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load chat logs' });
        }
        res.json(messages);
    });
});

app.get('/api/admin/settings', requireAdmin, (req, res) => {
    db.get('SELECT * FROM admin_settings WHERE id = 1', (err, settings) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load settings' });
        }
        res.json(settings);
    });
});

app.post('/api/admin/backup', requireAdmin, (req, res) => {
    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${backupDir}/manual-backup-${timestamp}.db`;
    
    try {
        fs.copyFileSync('./database/mastercredits.db', backupFile);
        
        db.run('UPDATE admin_settings SET last_backup = CURRENT_TIMESTAMP WHERE id = 1', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update backup timestamp' });
            }
            res.json({ success: true, backupFile });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    db.get('SELECT admin_password FROM admin_settings WHERE id = 1', (err, row) => {
        if (err || !row || !bcrypt.compareSync(currentPassword, row.admin_password)) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        
        db.run('UPDATE admin_settings SET admin_password = ? WHERE id = 1', [hashedPassword], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ error: 'Failed to update password' });
            }
            res.json({ success: true });
        });
    });
});


app.get('/api/captcha', (req, res) => {
    const captcha = generateCaptcha();
    req.session.captcha = captcha;
    const svgImage = createCaptchaImage(captcha);
    
    // Convert SVG to data URL for proper image display
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImage)}`;
    
    res.json({ image: dataUrl });
});

app.post('/api/register', (req, res) => {
    const { username, password, email, captcha } = req.body;
    
    if (!req.session.captcha || captcha !== req.session.captcha) {
        return res.status(400).json({ error: 'Invalid captcha' });
    }
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (!/^[a-zA-Z0-9]{1,12}$/.test(username)) {
        return res.status(400).json({ error: 'Username must be 1-12 characters, letters and numbers only' });
    }
    
    if (password.length < 4 || password.length > 30) {
        return res.status(400).json({ error: 'Password must be 4-30 characters' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email || null], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'Registration failed' });
        }
        
        const userId = this.lastID;
        
        // Initialize MasterCredits data for new user
        db.run('INSERT INTO mastercredits_data (user_id) VALUES (?)', [userId], (mcErr) => {
            if (mcErr) console.error('Failed to initialize MasterCredits data:', mcErr);
        });
        
        // Initialize Pyramid Runner data for new user
        db.run('INSERT INTO pyramidrunner_data (user_id) VALUES (?)', [userId], (prErr) => {
            if (prErr) console.error('Failed to initialize Pyramid Runner data:', prErr);
        });
        
        // Initialize GalexV data for new user
        db.run('INSERT INTO galaxv_data (user_id) VALUES (?)', [userId], (gvErr) => {
            if (gvErr) console.error('Failed to initialize GalexV data:', gvErr);
        });
        
        // Initialize FamousFighter data for new user
        db.run('INSERT INTO famousfighter_data (user_id) VALUES (?)', [userId], (ffErr) => {
            if (ffErr) console.error('Failed to initialize FamousFighter data:', ffErr);
        });
        
        req.session.userId = userId;
        req.session.username = username;
        delete req.session.captcha;
        
        res.json({ 
            success: true, 
            username: username,
            level: 1,
            avatar: null
        });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin') {
        db.get('SELECT admin_password FROM admin_settings WHERE id = 1', (err, row) => {
            if (err || !row || !bcrypt.compareSync(password, row.admin_password)) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            
            req.session.isAdmin = true;
            req.session.username = 'admin';
            res.json({ success: true, isAdmin: true });
        });
        return;
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        res.json({ 
            success: true, 
            username: user.username,
            level: user.platform_level,
            experience: user.platform_experience,
            avatar: user.avatar_path,
            createdAt: user.created_at
        });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Simple talent endpoints (no authentication required)
app.get('/api/talents', (req, res) => {
    // Return empty talents for simplified mode
    res.json([]);
});

app.post('/api/talents/allocate', (req, res) => {
    // Talents disabled in simplified mode
    res.json({ success: false, message: 'Talents disabled in simplified mode' });
});

app.post('/api/talents/reset', (req, res) => {
    // Talents disabled in simplified mode
    res.json({ success: false, message: 'Talents disabled in simplified mode' });
});

function updateUserStats(userId, experienceGained, callback) {
    db.get('SELECT level, experience, skill_points FROM mastercredits_data WHERE user_id = ?', [userId], (err, mcData) => {
        if (err) return callback(err);
        
        if (!mcData) {
            return callback(new Error('MasterCredits data not found'));
        }
        
        let newExp = mcData.experience + experienceGained;
        let newLevel = mcData.level;
        let newSkillPoints = mcData.skill_points;
        let leveledUp = false;
        
        const expNeeded = newLevel * 1000;
        
        while (newExp >= expNeeded) {
            newExp -= expNeeded;
            newLevel++;
            newSkillPoints += 10;
            leveledUp = true;
        }
        
        db.run('UPDATE mastercredits_data SET level = ?, experience = ?, skill_points = ? WHERE user_id = ?', 
            [newLevel, newExp, newSkillPoints, userId], (err) => {
            if (err) return callback(err);
            
            if (leveledUp) {
                const levelUpReward = newLevel * 5000;
                db.run('UPDATE mastercredits_data SET mc_balance = mc_balance + ? WHERE user_id = ?', [levelUpReward, userId]);
                
                // Sync MasterCredits level with platform level
                db.run('UPDATE users SET platform_level = ?, platform_experience = platform_experience + ? WHERE id = ?', 
                    [newLevel, experienceGained, userId]);
            } else {
                // Still add experience to platform even if no level up
                db.run('UPDATE users SET platform_experience = platform_experience + ? WHERE id = ?', 
                    [experienceGained, userId]);
            }
            
            callback(null, { leveledUp, newLevel, newSkillPoints, levelUpReward: leveledUp ? newLevel * 5000 : 0 });
        });
    });
}

// Par4 Golf Betting Game Handler
function handlePar4Game(requestData, mcData, callback) {
    const { betAmount, action, gameData } = requestData;
    
    if (action === 'start_round') {
        // Starting a new round - deduct bet amount
        const totalBetAmount = betAmount;
        const newBalance = mcData.mc_balance - totalBetAmount;
        
        if (newBalance < 0) {
            return callback(new Error('Insufficient balance'));
        }
        
        // Generate basic experience for starting a round
        const experienceGained = Math.floor(totalBetAmount / 1000) + 5; // Base 5 + bonus based on bet
        
        callback(null, {
            success: true,
            betAmount: totalBetAmount,
            payout: 0,
            newBalance: newBalance,
            experienceGained: experienceGained,
            data: {
                action: 'round_started',
                course: gameData.course,
                golfer: gameData.golfer,
                bets: gameData.pregameBets
            }
        });
    } else if (action === 'end_round') {
        // Ending a round - calculate payouts
        const { shotsUsed, isHole, shotsOverPar, payouts } = gameData;
        
        // Calculate experience based on performance
        let experienceGained = 10; // Base experience
        if (isHole) {
            experienceGained += 15; // Bonus for completing hole
            if (shotsOverPar <= 0) {
                experienceGained += 20; // Bonus for par or better
            }
            if (shotsUsed === 1) {
                experienceGained += 50; // Huge bonus for hole in one
            }
        }
        
        // Add bet amount to experience calculation
        experienceGained += Math.floor(payouts.total / 5000);
        
        const newBalance = mcData.mc_balance + payouts.total;
        
        callback(null, {
            success: true,
            betAmount: 0, // No bet deduction on round end
            payout: payouts.total,
            newBalance: newBalance,
            experienceGained: experienceGained,
            data: {
                action: 'round_ended',
                shotsUsed: shotsUsed,
                isHole: isHole,
                shotsOverPar: shotsOverPar,
                payouts: payouts
            }
        });
    } else {
        callback(new Error('Invalid Par4 action'));
    }
}

// Pinata Party Game Handler
function handlePinataPartyGame(requestData, mcData, callback) {
    const { betAmount, action, gameData } = requestData;
    
    if (action === 'break_pinata') {
        const newBalance = mcData.mc_balance - betAmount;
        
        if (newBalance < 0) {
            return callback(new Error('Insufficient balance'));
        }
        
        // Generate prizes based on the game's prize system
        const { prizes, totalValue } = gameData.prizes;
        const netResult = totalValue - betAmount;
        const finalBalance = newBalance + totalValue;
        
        // Calculate experience based on performance
        let experienceGained = 5; // Base experience
        experienceGained += Math.floor(betAmount / 1000); // Bet size bonus
        
        if (netResult > 0) {
            experienceGained += Math.floor(netResult / 2000); // Win bonus
        }
        
        // Bonus for big wins
        if (totalValue >= betAmount * 3) {
            experienceGained += 15; // Big win bonus
        }
        if (totalValue >= betAmount * 5) {
            experienceGained += 25; // Epic win bonus
        }
        
        callback(null, {
            success: true,
            betAmount: betAmount,
            payout: totalValue,
            newBalance: finalBalance,
            experienceGained: experienceGained,
            data: {
                action: 'pinata_broken',
                prizes: prizes,
                totalValue: totalValue,
                netResult: netResult
            }
        });
    } else {
        callback(new Error('Invalid Pinata Party action'));
    }
}

// Master's Dice Game Handler
function handleMastersDiceGame(requestData, mcData, callback) {
    const { betAmount, gameData } = requestData;
    const { diceCount, diceSides, predictionType, predictionDetails } = gameData;
    
    const newBalance = mcData.mc_balance - betAmount;
    
    if (newBalance < 0) {
        return callback(new Error('Insufficient balance'));
    }
    
    // Roll the dice
    const diceResults = [];
    for (let i = 0; i < diceCount; i++) {
        diceResults.push(Math.floor(Math.random() * diceSides) + 1);
    }
    
    // Calculate prediction result
    const predictionResult = calculateDicePrediction(diceResults, predictionType, predictionDetails, diceSides, diceCount);
    
    // Calculate payout
    let payout = 0;
    if (predictionResult.success) {
        payout = betAmount * predictionResult.multiplier;
    }
    
    const finalBalance = newBalance + payout;
    
    // Calculate experience based on performance
    let experienceGained = 3; // Base experience
    experienceGained += Math.floor(betAmount / 2000); // Bet size bonus
    
    if (predictionResult.success) {
        experienceGained += Math.floor(payout / 5000); // Win bonus
        // Bonus for difficult predictions
        if (predictionResult.multiplier >= 10) {
            experienceGained += 10; // High odds bonus
        }
    }
    
    callback(null, {
        success: true,
        betAmount: betAmount,
        payout: payout,
        newBalance: finalBalance,
        experienceGained: experienceGained,
        data: {
            diceResults: diceResults,
            predictionResult: predictionResult,
            payout: payout
        }
    });
}

function calculateDicePrediction(diceResults, predictionType, predictionDetails, diceSides, diceCount) {
    const sum = diceResults.reduce((acc, val) => acc + val, 0);
    let success = false;
    let multiplier = 1.0;
    let description = '';
    
    switch (predictionType) {
        case 'sum_exact':
            const targetSum = predictionDetails.targetSum || sum;
            success = sum === targetSum;
            description = `Exact sum ${targetSum}`;
            // Higher multipliers for harder to achieve sums
            const minSum = diceCount;
            const maxSum = diceCount * diceSides;
            const totalOutcomes = Math.pow(diceSides, diceCount);
            // Approximate probability calculation
            const probability = Math.max(0.001, 1.0 / (maxSum - minSum + 1));
            multiplier = Math.min(50, Math.round((1.0 / probability) * 0.8));
            break;
            
        case 'sum_range':
            const midPoint = (diceCount + diceCount * diceSides) / 2;
            const isHigh = sum > midPoint;
            success = true; // Always succeeds, just determines high or low
            description = isHigh ? 'High range' : 'Low range';
            multiplier = 1.8; // Low risk, low reward
            break;
            
        case 'all_same':
            success = diceResults.every(die => die === diceResults[0]);
            description = 'All dice same number';
            // Probability is (diceSides) / (diceSides^diceCount)
            const allSameProbability = diceSides / Math.pow(diceSides, diceCount);
            multiplier = Math.round((1.0 / allSameProbability) * 0.8);
            break;
            
        case 'contains_number':
            const targetNumber = predictionDetails.targetNumber || 1;
            success = diceResults.includes(targetNumber);
            description = `Contains ${targetNumber}`;
            // Probability that at least one die shows the target
            const doesntContainProbability = Math.pow((diceSides - 1) / diceSides, diceCount);
            const containsProbability = 1 - doesntContainProbability;
            multiplier = Math.max(1.2, Math.round((1.0 / containsProbability) * 0.9 * 10) / 10);
            break;
            
        default:
            description = 'Unknown prediction';
            break;
    }
    
    return {
        success: success,
        multiplier: multiplier,
        description: description
    };
}

// Process games without database interaction
function processSimpleGame(req, res, gameType, betAmount, currentBalance) {
    const { action, choice, lines, playerHand, dealerHand, gameData } = req.body;
    const newBalance = currentBalance - betAmount;
    
    console.log(`Processing ${gameType} game with bet ${betAmount}`);
    
    // For guest games, we use the same Java game engine but don't save to database
    const gameDataForJava = {
        betAmount: betAmount,
        action: action,
        choice: choice,
        lines: lines || 1,
        playerHand: playerHand || [],
        dealerHand: dealerHand || [],
        gameData: gameData || {}
    };
    
    // Handle Node.js games (Par4, Pinata Party, Master's Dice) directly
    if (gameType === 'par4') {
        handlePar4Game(req.body, { mc_balance: currentBalance }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Game processing failed' });
            }
            res.json({
                success: true,
                gameType: gameType,
                betAmount: betAmount,
                payout: result.payout,
                newBalance: result.newBalance,
                experienceGained: 0,
                gameData: result.data
            });
        });
        return;
    }
    
    if (gameType === 'pinataparty') {
        handlePinataPartyGame(req.body, { mc_balance: currentBalance }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Game processing failed' });
            }
            res.json({
                success: true,
                gameType: gameType,
                betAmount: betAmount,
                payout: result.payout,
                newBalance: result.newBalance,
                experienceGained: 0,
                gameData: result.data
            });
        });
        return;
    }
    
    if (gameType === 'mastersdice') {
        handleMastersDiceGame(req.body, { mc_balance: currentBalance }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Game processing failed' });
            }
            res.json({
                success: true,
                gameType: gameType,
                betAmount: betAmount,
                payout: result.payout,
                newBalance: result.newBalance,
                experienceGained: 0,
                gameData: result.data
            });
        });
        return;
    }
    
    // For Java games (blackjack, coinflip, starbound, blacksmith), call Java engine
    const gameDataJson = JSON.stringify(gameDataForJava);
    const javaCommand = `java -cp "./java/build:./java/lib/*" com.mastercredits.GameEngine "${gameType}" '${gameDataJson}'`;
    
    exec(javaCommand, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error('Java execution error:', error);
            return res.status(500).json({ error: 'Game processing failed' });
        }
        
        try {
            const result = JSON.parse(stdout);
            
            if (result.success) {
                // Calculate new balance for guest
                const payout = result.payout || 0;
                const finalBalance = newBalance + payout;
                
                res.json({
                    success: true,
                    gameType: gameType,
                    betAmount: betAmount,
                    payout: payout,
                    newBalance: finalBalance,
                    experienceGained: 0,
                    gameData: result.data
                });
            } else {
                res.status(500).json({ error: result.error || 'Game failed' });
            }
        } catch (parseError) {
            console.error('Java result parsing error:', parseError);
            res.status(500).json({ error: 'Game processing failed' });
        }
    });
}

app.post('/api/play-game', (req, res) => {
    const { gameType, betAmount, action, choice, lines, playerHand, dealerHand, currentBalance } = req.body;
    
    // Debug logging
    console.log('✅ Play-game request:', { gameType, betAmount, currentBalance, hasSession: !!req.session.userId });
    
    if (!gameType || !betAmount) {
        return res.status(400).json({ error: 'Game type and bet amount required' });
    }
    
    // Use provided balance or default
    const balance = parseFloat(currentBalance || 100000);
    
    if (betAmount > balance) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Process game without database
    processSimpleGame(req, res, gameType, betAmount, balance);
});

// Catch-all for missing API endpoints
app.use('/api/*', (req, res) => {
    console.log('❌ Missing API endpoint:', req.method, req.originalUrl);
    res.status(404).json({ error: 'API endpoint not found' });
});

// Socket.IO for chat
io.on('connection', (socket) => {
    console.log('User connected to chat');

    socket.on('join-chat', (data) => {
        socket.username = data.username || 'Player';
        socket.level = data.level || 1;
    });

    socket.on('chat-message', (data) => {
        const message = {
            username: socket.username || 'Player',
            message: data.message,
            timestamp: new Date()
        };
        
        io.emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from chat');
    });
});

// File uploads directory
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
if (!fs.existsSync('./uploads/avatars')) {
    fs.mkdirSync('./uploads/avatars');
}

server.listen(PORT, () => {
    console.log(`MasterCredits Casino server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('Received SIGINT, starting graceful shutdown...');
    server.close(() => {
        console.log('HTTP server closed');
        io.close(() => {
            console.log('Socket.IO connections closed');
            console.log('Graceful shutdown complete');
            process.exit(0);
        });
    });
});

module.exports = app;