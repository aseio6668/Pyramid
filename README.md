# MasterCredits Casino

A fun, fake-money casino website featuring classic games with unique themes. Built with Node.js, Java, and SQLite for easy hosting and deployment.

## 🎮 Features

- **User System**: Registration with homebrew captcha, secure login, profile management
- **Games**: 
  - ☕ **Coffee Blackjack**: Classic 21 with a caffeinated twist
  - 🤠 **Western Coinflip**: Old west coin tossing adventure  
  - 🚀 **Starbound Slots**: Space dogs exploring the galaxy
- **Progression**: Level system with experience points and skill rewards
- **Social**: Global chat with autonomous moderation
- **Management**: Full admin panel with user management and backups
- **Currency**: MasterCredits (MC) - fake money for entertainment only

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Java JDK (v8 or higher)
- Git (optional)

### Installation

1. **Clone or download the project**
```bash
git clone <repository-url>
cd mastercredits
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Download Java JSON library**
```bash
# Create java/lib directory if it doesn't exist
mkdir -p java/lib

# Download Gson library for Java JSON processing
curl -L "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar" -o java/lib/gson-2.10.1.jar
```

4. **Compile Java game engine**
```bash
npm run compile-java
```

5. **Start the server**
```bash
npm start
```

6. **Visit your casino**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin (admin/admin)

## 📁 File Structure

```
mastercredits/
├── server.js                 # Main Node.js server
├── package.json              # Node.js dependencies
├── public/                   # Static web files
│   ├── index.html           # Main website
│   ├── admin.html           # Admin panel
│   ├── css/styles.css       # All styling
│   └── js/
│       ├── app.js           # Main client application
│       └── games.js         # Game interfaces
├── java/                     # Java game engine
│   ├── src/com/mastercredits/
│   │   └── GameEngine.java  # Game logic processor
│   ├── build/               # Compiled Java classes
│   └── lib/                 # Java dependencies
├── database/                 # SQLite database
├── uploads/                  # User avatars
├── backups/                  # Automatic backups
└── README.md                # This file
```

## 🎯 Game Configuration

### Default Settings
- Starting balance: 100,000 MC
- Free handout: 10,000 MC (when balance < 1,000 MC)
- Handout cooldown: 30 seconds
- Experience per level: Level × 1000 XP
- Skill points per level: 10 points
- Level up bonus: Level × 5,000 MC

### Game Limits
- **Blackjack**: 1,000 - 100,000 MC per hand
- **Coinflip**: 500 - 50,000 MC per flip
- **Starbound**: 100 - 10,000 MC per line (1-20 lines)

## 👑 Admin Features

Access the admin panel at `/admin` with credentials `admin/admin` (changeable in settings).

### Dashboard
- User statistics and activity
- Game play metrics
- Real-time system monitoring

### User Management
- View all users and their stats
- Search and filter users
- Modify user balances and levels

### Game Analytics
- Track game performance
- Monitor house edge
- View payout statistics

### System Tools
- Manual database backups
- Chat moderation tools
- Maintenance mode toggle

## 🔧 Deployment

### Standard Web Hosting

1. **Upload files** to your web host's public_html directory
2. **Install Node.js** on your hosting account (if supported)
3. **Set environment variables**:
   ```bash
   export PORT=3000
   ```
4. **Start the application**:
   ```bash
   npm start
   ```

### VPS/Dedicated Server

1. **Install prerequisites** (Node.js, Java)
2. **Clone/upload** the project files
3. **Run setup**:
   ```bash
   npm install
   npm run build
   ```
4. **Use PM2 for production**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mastercredits"
   pm2 startup
   pm2 save
   ```

### Docker (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:16
RUN apt-get update && apt-get install -y default-jdk
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t mastercredits .
docker run -p 3000:3000 mastercredits
```

## 🔒 Security Notes

- **No real money**: This is entertainment only - no real currency transactions
- **Secure passwords**: Change the admin password on first setup
- **Regular backups**: Automated daily backups at 2 AM
- **Chat moderation**: Automatic profanity filtering and spam prevention
- **Rate limiting**: Protection against automated abuse

## 🎨 Customization

### Themes
Edit `public/css/styles.css` to customize the early 2000s aesthetic with modern touches.

### Games
Modify `java/src/com/mastercredits/GameEngine.java` to adjust:
- Payout rates
- Game mechanics  
- New game types

### Avatars
Add your own avatar images to `public/images/avatars/` (recommended: 150x150px)

## 🐛 Troubleshooting

### Common Issues

**Java compilation fails:**
```bash
# Ensure Java is installed
java -version
javac -version

# Check Java library path
ls java/lib/
```

**Database errors:**
```bash
# Check database permissions
ls -la database/
```

**Port already in use:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Logs
Check console output for detailed error messages. Enable debug mode:
```bash
DEBUG=mastercredits:* npm start
```

## 📞 Support

For issues and support:
1. Check the console logs
2. Verify all prerequisites are installed
3. Ensure database permissions are correct
4. Try restarting the application

## 📄 License

This project is provided as-is for entertainment purposes. No real money gambling is supported or endorsed.

**Important**: This is a fake money casino for entertainment only. No real money transactions occur.

---

Made with ❤️ for fun and entertainment!