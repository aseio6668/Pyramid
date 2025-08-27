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
const { spawn } = require('child_process');

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

app.get('/games/fighterfame', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games', 'fighterfame', 'index.html'));
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

    // Game-specific data for FighterFame
    db.run(`CREATE TABLE IF NOT EXISTS fighterfame_data (
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

function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

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
    const image = createCaptchaImage(captcha);
    res.json({ image });
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
        
        // Initialize FighterFame data for new user
        db.run('INSERT INTO fighterfame_data (user_id) VALUES (?)', [userId], (ffErr) => {
            if (ffErr) console.error('Failed to initialize FighterFame data:', ffErr);
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

// Free funds endpoint
app.post('/api/claim-free-funds', requireAuth, (req, res) => {
    db.get('SELECT mc_balance FROM mastercredits_data WHERE user_id = ?', [req.session.userId], (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (!data) {
            return res.status(404).json({ success: false, message: 'Player data not found' });
        }
        
        if (data.mc_balance >= 1000) {
            return res.status(400).json({ success: false, message: 'You can only claim free funds when you have less than 1000 MC' });
        }
        
        const freeAmount = 10000;
        const newBalance = data.mc_balance + freeAmount;
        
        db.run('UPDATE mastercredits_data SET mc_balance = ? WHERE user_id = ?', [newBalance, req.session.userId], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ success: false, message: 'Failed to update balance' });
            }
            
            res.json({ 
                success: true, 
                newBalance: newBalance,
                amount: freeAmount
            });
        });
    });
});

// Platform profile endpoint
app.get('/api/profile', requireAuth, (req, res) => {
    // Get main user data
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get MasterCredits data
        db.get('SELECT * FROM mastercredits_data WHERE user_id = ?', [req.session.userId], (mcErr, mcData) => {
            // Get Pyramid Runner data
            db.get('SELECT * FROM pyramidrunner_data WHERE user_id = ?', [req.session.userId], (prErr, prData) => {
                res.json({
                    username: user.username,
                    level: user.platform_level,
                    experience: user.platform_experience,
                    avatar: user.avatar_path,
                    email: user.email,
                    createdAt: user.created_at,
                    unlockedAvatars: JSON.parse(user.unlocked_avatars || '[]'),
                    masterCreditsData: mcData ? {
                        balance: mcData.mc_balance,
                        level: mcData.level,
                        experience: mcData.experience,
                        skillPoints: mcData.skill_points,
                        unlockedEmojis: JSON.parse(mcData.unlocked_emojis || '[]')
                    } : null,
                    pyramidRunnerData: prData ? {
                        highScore: prData.high_score,
                        levelsCompleted: prData.levels_completed,
                        currentCharacter: prData.current_character,
                        unlockedCharacters: JSON.parse(prData.unlocked_characters || '[]')
                    } : null
                });
            });
        });
    });
});

// Legacy user endpoint for MasterCredits compatibility
app.get('/api/user', requireAuth, (req, res) => {
    db.get('SELECT * FROM users u LEFT JOIN mastercredits_data mc ON u.id = mc.user_id WHERE u.id = ?', [req.session.userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // If MasterCredits data doesn't exist, initialize it
        if (!user.mc_balance && user.mc_balance !== 0) {
            db.run('INSERT OR IGNORE INTO mastercredits_data (user_id) VALUES (?)', [req.session.userId], (initErr) => {
                if (initErr) console.error('Failed to initialize MasterCredits data:', initErr);
                
                // Re-fetch the user data with the initialized MC data
                db.get('SELECT * FROM users u LEFT JOIN mastercredits_data mc ON u.id = mc.user_id WHERE u.id = ?', [req.session.userId], (refetchErr, refetchedUser) => {
                    if (refetchErr || !refetchedUser) {
                        return res.status(404).json({ error: 'User not found after initialization' });
                    }
                    
                    res.json({
                        username: refetchedUser.username,
                        mcBalance: refetchedUser.mc_balance || 100000,
                        level: refetchedUser.level || 1,
                        experience: refetchedUser.experience || 0,
                        skillPoints: refetchedUser.skill_points || 0,
                        avatarPath: refetchedUser.avatar_path,
                        unlockedAvatars: JSON.parse(refetchedUser.unlocked_avatars || '[]'),
                        unlockedEmojis: JSON.parse(refetchedUser.unlocked_emojis || '[]')
                    });
                });
            });
        } else {
            res.json({
                username: user.username,
                mcBalance: user.mc_balance || 100000,
                level: user.level || 1,
                experience: user.experience || 0,
                skillPoints: user.skill_points || 0,
                avatarPath: user.avatar_path,
                unlockedAvatars: JSON.parse(user.unlocked_avatars || '[]'),
                unlockedEmojis: JSON.parse(user.unlocked_emojis || '[]')
            });
        }
    });
});

app.post('/api/handout', requireAuth, (req, res) => {
    db.get('SELECT last_handout, mc_balance FROM mastercredits_data WHERE user_id = ?', [req.session.userId], (err, mcData) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!mcData) {
            // Initialize MasterCredits data if it doesn't exist
            db.run('INSERT INTO mastercredits_data (user_id) VALUES (?)', [req.session.userId], (initErr) => {
                if (initErr) {
                    return res.status(500).json({ error: 'Failed to initialize game data' });
                }
                // Retry with new data
                return app.post('/api/handout', requireAuth, (req, res));
            });
            return;
        }
        
        const now = new Date();
        const lastHandout = mcData.last_handout ? new Date(mcData.last_handout) : null;
        
        if (lastHandout && (now - lastHandout) < 30000) {
            return res.status(400).json({ error: 'Must wait 30 seconds between handouts' });
        }
        
        if (mcData.mc_balance > 1000) {
            return res.status(400).json({ error: 'Can only get handout when balance is below 1000 MC' });
        }
        
        const handoutAmount = 10000;
        
        db.run('UPDATE mastercredits_data SET mc_balance = mc_balance + ?, last_handout = CURRENT_TIMESTAMP WHERE user_id = ?', 
            [handoutAmount, req.session.userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to process handout' });
            }
            
            res.json({ success: true, amount: handoutAmount, newBalance: mcData.mc_balance + handoutAmount });
        });
    });
});

app.post('/api/upload-avatar', requireAuth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const outputPath = `uploads/avatars/user_${req.session.userId}_${Date.now()}.jpg`;
        
        await sharp(req.file.path)
            .resize(150, 150)
            .jpeg({ quality: 80 })
            .toFile(outputPath);
        
        fs.unlinkSync(req.file.path);
        
        db.run('UPDATE users SET avatar_path = ? WHERE id = ?', [`/${outputPath}`, req.session.userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update avatar' });
            }
            
            res.json({ success: true, avatarPath: `/${outputPath}` });
        });
        
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to process avatar' });
    }
});

app.post('/api/select-avatar', requireAuth, (req, res) => {
    const { avatarPath } = req.body;
    
    if (!avatarPath) {
        return res.status(400).json({ error: 'Avatar path required' });
    }
    
    db.run('UPDATE users SET avatar_path = ? WHERE id = ?', [avatarPath, req.session.userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update avatar' });
        }
        
        res.json({ success: true });
    });
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

app.post('/api/play-game', requireAuth, (req, res) => {
    const { gameType, betAmount, action, choice, lines, playerHand, dealerHand } = req.body;
    
    if (!gameType || !betAmount) {
        return res.status(400).json({ error: 'Game type and bet amount required' });
    }
    
    db.get('SELECT mc_balance FROM mastercredits_data WHERE user_id = ?', [req.session.userId], (err, mcData) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!mcData) {
            return res.status(500).json({ error: 'MasterCredits data not found' });
        }
        
        if (betAmount > mcData.mc_balance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        const gameData = {
            betAmount: betAmount,
            action: action,
            choice: choice,
            lines: lines,
            playerHand: playerHand,
            dealerHand: dealerHand
        };
        
        // Handle Par4 golf betting game directly in Node.js
        if (gameType === 'par4') {
            handlePar4Game(req.body, mcData, (err, result) => {
                if (err) {
                    console.error('Par4 game error:', err);
                    return res.status(500).json({ error: 'Game processing failed' });
                }
                
                console.log('Par4 game result:', result);
                
                // Update balance
                const newBalance = result.newBalance;
                
                db.run('UPDATE mastercredits_data SET mc_balance = ? WHERE user_id = ?', [newBalance, req.session.userId], (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ error: 'Failed to update balance' });
                    }
                    
                    // Log game session
                    if (result.betAmount > 0) {
                        db.run('INSERT INTO game_sessions (user_id, game_name, game_type, bet_amount, payout, result) VALUES (?, ?, ?, ?, ?, ?)',
                            [req.session.userId, 'par4', 'golf_betting', result.betAmount, result.payout || 0, JSON.stringify(result.data)]);
                    }
                    
                    // Add experience
                    if (result.experienceGained > 0) {
                        updateUserStats(req.session.userId, result.experienceGained, (statErr, statResult) => {
                            if (!statErr && statResult.leveledUp) {
                                result.levelUp = statResult;
                            }
                            
                            res.json({
                                success: true,
                                gameType: 'par4',
                                betAmount: result.betAmount,
                                payout: result.payout,
                                newBalance: newBalance,
                                experienceGained: result.experienceGained,
                                data: result.data,
                                levelUp: result.levelUp
                            });
                        });
                    } else {
                        res.json({
                            success: true,
                            gameType: 'par4',
                            betAmount: result.betAmount,
                            payout: result.payout,
                            newBalance: newBalance,
                            experienceGained: result.experienceGained,
                            data: result.data
                        });
                    }
                });
            });
            return;
        }
        
        // Handle Pinata Party game directly in Node.js
        if (gameType === 'pinataparty') {
            handlePinataPartyGame(req.body, mcData, (err, result) => {
                if (err) {
                    console.error('Pinata Party game error:', err);
                    return res.status(500).json({ error: 'Game processing failed' });
                }
                
                console.log('Pinata Party game result:', result);
                
                // Update balance
                const newBalance = result.newBalance;
                
                db.run('UPDATE mastercredits_data SET mc_balance = ? WHERE user_id = ?', [newBalance, req.session.userId], (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ error: 'Failed to update balance' });
                    }
                    
                    // Log game session
                    db.run('INSERT INTO game_sessions (user_id, game_name, game_type, bet_amount, payout, result) VALUES (?, ?, ?, ?, ?, ?)',
                        [req.session.userId, 'pinataparty', 'party_game', result.betAmount, result.payout || 0, JSON.stringify(result.data)]);
                    
                    // Add experience
                    if (result.experienceGained > 0) {
                        updateUserStats(req.session.userId, result.experienceGained, (statErr, statResult) => {
                            if (!statErr && statResult.leveledUp) {
                                result.levelUp = statResult;
                            }
                            
                            res.json({
                                success: true,
                                gameType: 'pinataparty',
                                betAmount: result.betAmount,
                                payout: result.payout,
                                newBalance: newBalance,
                                experienceGained: result.experienceGained,
                                data: result.data,
                                levelUp: result.levelUp
                            });
                        });
                    } else {
                        res.json({
                            success: true,
                            gameType: 'pinataparty',
                            betAmount: result.betAmount,
                            payout: result.payout,
                            newBalance: newBalance,
                            experienceGained: result.experienceGained,
                            data: result.data
                        });
                    }
                });
            });
            return;
        }
        
        console.log(`Playing ${gameType} with data:`, gameData);
        callJavaGameEngine(gameType, gameData, (err, result) => {
            if (err) {
                console.error('Game engine error:', err);
                return res.status(500).json({ error: 'Game processing failed' });
            }
            
            console.log(`Game ${gameType} result:`, result);
            
            // For blackjack hit/stand and blacksmith sell, don't deduct bet again - it was already deducted on deal/forge
            const shouldDeductBet = !(
                (gameType === 'blackjack' && (action === 'hit' || action === 'stand')) ||
                (gameType === 'blacksmith' && action === 'sell')
            );
            const newBalance = mcData.mc_balance - (shouldDeductBet ? betAmount : 0) + (result.payout || 0);
            
            db.run('UPDATE mastercredits_data SET mc_balance = ? WHERE user_id = ?', [newBalance, req.session.userId], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ error: 'Failed to update balance' });
                }
                
                // Only log game sessions for initial bets, not hit/stand actions
                if (shouldDeductBet) {
                    db.run('INSERT INTO game_sessions (user_id, game_name, game_type, bet_amount, payout, result) VALUES (?, ?, ?, ?, ?, ?)',
                        [req.session.userId, 'mastercredits', gameType, betAmount, result.payout || 0, JSON.stringify(result.data)]);
                }
                
                if (result.experienceGained > 0) {
                    updateUserStats(req.session.userId, result.experienceGained, (statErr, statResult) => {
                        if (!statErr && statResult.leveledUp) {
                            result.levelUp = statResult;
                        }
                        
                        res.json({
                            success: true,
                            gameData: result.data,
                            payout: result.payout,
                            newBalance: newBalance + (statResult?.levelUpReward || 0),
                            experienceGained: result.experienceGained,
                            levelUp: result.levelUp
                        });
                    });
                } else {
                    res.json({
                        success: true,
                        gameData: result.data,
                        payout: result.payout,
                        newBalance: newBalance,
                        experienceGained: 0
                    });
                }
            });
        });
    });
});

function callJavaGameEngine(gameType, gameData, callback) {
    const isWindows = process.platform === 'win32';
    const classpath = isWindows 
        ? './java/build;./java/lib/*'
        : './java/build:./java/lib/*';
    
    const javaProcess = spawn('java', [
        '-cp', classpath,
        'com.mastercredits.GameEngine',
        gameType,
        JSON.stringify(gameData)
    ], {
        timeout: 10000, // 10 second timeout
        killSignal: 'SIGKILL'
    });
    
    let result = '';
    let error = '';
    let isFinished = false;
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
        if (!isFinished) {
            console.error('Java process timeout, killing...');
            javaProcess.kill('SIGKILL');
            callback(new Error('Java process timeout'));
        }
    }, 10000);
    
    javaProcess.stdout.on('data', (data) => {
        result += data.toString();
    });
    
    javaProcess.stderr.on('data', (data) => {
        error += data.toString();
    });
    
    javaProcess.on('error', (err) => {
        if (!isFinished) {
            isFinished = true;
            clearTimeout(timeout);
            console.error('Java process error:', err);
            callback(new Error(`Java process failed to start: ${err.message}`));
        }
    });
    
    javaProcess.on('close', (code, signal) => {
        if (!isFinished) {
            isFinished = true;
            clearTimeout(timeout);
            
            if (signal) {
                callback(new Error(`Java process killed with signal ${signal}`));
            } else if (code !== 0) {
                callback(new Error(`Java process exited with code ${code}: ${error}`));
            } else {
                try {
                    const parsed = JSON.parse(result.trim());
                    callback(null, parsed);
                } catch (e) {
                    callback(new Error(`Failed to parse Java result: ${e.message}`));
                }
            }
        }
    });
}

// Talent Tree API endpoints
app.get('/api/talents', requireAuth, (req, res) => {
    db.all('SELECT talent_id, points FROM mastercredits_talents WHERE user_id = ?', [req.session.userId], (err, talents) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load talents' });
        }
        
        const talentPoints = {};
        talents.forEach(talent => {
            talentPoints[talent.talent_id] = talent.points;
        });
        
        res.json({ talents: talentPoints });
    });
});

app.post('/api/talents/allocate', requireAuth, (req, res) => {
    const { talentId, points } = req.body;
    
    if (!talentId || points === undefined || points < 0 || points > 5) {
        return res.status(400).json({ error: 'Invalid talent allocation' });
    }
    
    // Get user's current skill points and talents
    db.get('SELECT skill_points FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: 'User not found' });
        }
        
        db.all('SELECT talent_id, points FROM mastercredits_talents WHERE user_id = ?', [req.session.userId], (err, currentTalents) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to load current talents' });
            }
            
            const talentPoints = {};
            currentTalents.forEach(talent => {
                talentPoints[talent.talent_id] = talent.points;
            });
            
            const currentPoints = talentPoints[talentId] || 0;
            const pointsDifference = points - currentPoints;
            
            if (pointsDifference > user.skill_points) {
                return res.status(400).json({ error: 'Insufficient skill points' });
            }
            
            // Check tier requirements
            const tierRequirements = validateTierRequirements(talentId, points, talentPoints);
            if (!tierRequirements.valid) {
                return res.status(400).json({ error: tierRequirements.error });
            }
            
            // Update or insert talent points
            db.run('INSERT OR REPLACE INTO mastercredits_talents (user_id, talent_id, points) VALUES (?, ?, ?)', 
                [req.session.userId, talentId, points], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update talent' });
                }
                
                // Update user skill points
                const newSkillPoints = user.skill_points - pointsDifference;
                db.run('UPDATE users SET skill_points = ? WHERE id = ?', [newSkillPoints, req.session.userId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update skill points' });
                    }
                    
                    res.json({ success: true, newSkillPoints, talentId, points });
                });
            });
        });
    });
});

function validateTierRequirements(talentId, points, currentTalents) {
    const talentTiers = {
        'pet-emojis': 1,
        'lore-mastery': 1,
        'lucky-charm': 1,
        'font-styles': 2,
        'stardom': 2,
        'profile-mastery': 2,
        'lucky': 2,
        'spooky': 2,
        'charming': 2,
        'blessing-of-fortune': 3,
        'evasion': 3
    };
    
    const talentTier = talentTiers[talentId];
    if (!talentTier) {
        return { valid: false, error: 'Unknown talent' };
    }
    
    // Tier 1 talents are always available
    if (talentTier === 1) {
        return { valid: true };
    }
    
    // Check if previous tier has enough points
    const tier1Talents = ['pet-emojis', 'lore-mastery', 'lucky-charm'];
    const tier2Talents = ['font-styles', 'stardom', 'profile-mastery', 'lucky', 'spooky', 'charming'];
    
    if (talentTier === 2) {
        const tier1Points = tier1Talents.reduce((sum, talent) => sum + (currentTalents[talent] || 0), 0);
        if (tier1Points < 5) {
            return { valid: false, error: 'Need 5 points in Tier 1 to unlock Tier 2' };
        }
    }
    
    if (talentTier === 3) {
        const tier2Points = tier2Talents.reduce((sum, talent) => sum + (currentTalents[talent] || 0), 0);
        if (tier2Points < 5) {
            return { valid: false, error: 'Need 5 points in Tier 2 to unlock Tier 3' };
        }
        
        // Blessing of Fortune requires Lucky 5/5
        if (talentId === 'blessing-of-fortune' && (currentTalents['lucky'] || 0) < 5) {
            return { valid: false, error: 'Requires Lucky 5/5' };
        }
    }
    
    return { valid: true };
}

app.post('/api/talents/reset', requireAuth, (req, res) => {
    // Get total points spent
    db.all('SELECT SUM(points) as totalPoints FROM mastercredits_talents WHERE user_id = ?', [req.session.userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to calculate reset' });
        }
        
        const pointsToRefund = result[0]?.totalPoints || 0;
        
        // Clear all talents and refund skill points
        db.run('DELETE FROM mastercredits_talents WHERE user_id = ?', [req.session.userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to reset talents' });
            }
            
            db.run('UPDATE users SET skill_points = skill_points + ? WHERE id = ?', [pointsToRefund, req.session.userId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to refund points' });
                }
                
                res.json({ success: true, pointsRefunded: pointsToRefund });
            });
        });
    });
});

cron.schedule('0 2 * * *', () => {
    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${backupDir}/backup-${timestamp}.db`;
    
    fs.copyFileSync('./database/mastercredits.db', backupFile);
    
    db.run('UPDATE admin_settings SET last_backup = CURRENT_TIMESTAMP WHERE id = 1');
    
    console.log(`Database backup created: ${backupFile}`);
});

io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('join-chat', (userData) => {
        socket.userData = userData;
    });
    
    socket.on('chat-message', (data) => {
        if (!socket.userData) return;
        
        const message = data.message.trim();
        if (!message || message.length > 200) return;
        
        const profanityFilter = ['fuck', 'shit', 'damn', 'bitch', 'ass'];
        const hasProfanity = profanityFilter.some(word => 
            message.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasProfanity) {
            socket.emit('chat-error', 'Message contains inappropriate content');
            return;
        }
        
        db.run('INSERT INTO chat_messages (user_id, username, message) VALUES (?, ?, ?)',
            [socket.userData.userId, socket.userData.username, message]);
        
        io.emit('chat-message', {
            username: socket.userData.username,
            message: message,
            timestamp: new Date().toISOString(),
            level: socket.userData.level || 1
        });
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}
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
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Close the HTTP server
    server.close((err) => {
        if (err) {
            console.error('Error closing HTTP server:', err);
            process.exit(1);
        }
        console.log('HTTP server closed');
        
        // Close database connection
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    process.exit(1);
                }
                console.log('Database connection closed');
                
                // Close all socket connections
                io.close(() => {
                    console.log('Socket.IO connections closed');
                    console.log('Graceful shutdown complete');
                    process.exit(0);
                });
            });
        } else {
            process.exit(0);
        }
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, 10000);
}

// Handle various shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;