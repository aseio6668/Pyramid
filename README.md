# AseioTech Pyramid Gaming Platform

A comprehensive web-based gaming platform featuring multiple handcrafted games for education and entertainment. Built with Node.js, Java, and SQLite for easy deployment and scalability.

## 🎮 Platform Features

- **Unified Account System**: Single login for all games with centralized profile management
- **Multiple Games**: 
  - 🎰 **MasterCredits Casino**: Complete fake-money casino with blackjack, slots, coinflip, and more
  - 🏃 **Pyramid Runner**: Classic 2D platformer adventure game
  - 🚀 **More Coming Soon**: FPS, Fighting, and Multiplayer games in development
- **Cross-Game Progression**: Platform-wide user levels and achievement tracking
- **Social Features**: Global chat, leaderboards, and community features
- **Admin Panel**: Comprehensive management tools for games and users
- **Educational Focus**: All games designed for learning and entertainment - completely free with no ads

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Java JDK (v8 or higher)
- Git (optional)

### Installation

1. **Clone or download the project**
```bash
git clone <repository-url>
cd pyramid
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

6. **Visit your gaming platform**
   - Main platform: http://localhost:3000
   - MasterCredits Casino: http://localhost:3000/games/mastercredits  
   - Pyramid Runner: http://localhost:3000/games/pyramidrunner
   - Admin panel: http://localhost:3000/admin (admin/admin)

## 📁 File Structure

```
pyramid/
├── server.js                     # Main Node.js server
├── package.json                  # Node.js dependencies
├── public/                       # Static web files
│   ├── platform.html            # Main platform page
│   ├── index.html               # MasterCredits Casino
│   ├── pyramidrunner.html       # Pyramid Runner game
│   ├── admin.html               # Admin panel
│   ├── css/
│   │   ├── platform.css         # Platform styling
│   │   └── styles.css           # Game-specific styling
│   ├── js/
│   │   ├── platform.js          # Platform management
│   │   ├── app.js               # MasterCredits game logic
│   │   ├── pyramidrunner.js     # Pyramid Runner game
│   │   ├── games.js             # Game interfaces
│   │   └── talents.js           # Talent tree system
│   └── games/                   # Individual game assets
├── java/                         # Java game engine (for MasterCredits)
│   ├── src/com/mastercredits/
│   │   └── GameEngine.java      # Casino game logic processor
│   ├── build/                   # Compiled Java classes
│   └── lib/                     # Java dependencies
├── database/                     # SQLite database
├── uploads/                      # User avatars
├── backups/                      # Automatic backups
└── README.md                    # This file
```

## 🎯 Games Overview

### MasterCredits Casino
A comprehensive fake-money casino featuring:
- **Games**: Blackjack, Coinflip, Starbound Slots, Dice games, and Blacksmith Forge
- **Starting Balance**: 100,000 MC (MasterCredits)
- **Free Handouts**: 10,000 MC when balance drops below 1,000 MC
- **Progression**: Level-based XP system with skill points and talents
- **Betting Limits**: 
  - Blackjack: 1,000 - 100,000 MC per hand
  - Coinflip: 500 - 50,000 MC per flip
  - Starbound Slots: 100 - 10,000 MC per line (1-20 lines)

### Pyramid Runner
A 2D platformer adventure featuring:
- **Character**: Play as Aseio, an ancient explorer
- **Quest**: Find the Pyramid of Infinite Knowledge
- **Gameplay**: Classic platforming with jumping, running, and exploration
- **Scoring**: High score system with multiple levels
- **Theme**: Ancient Egyptian adventure setting

## 👑 Admin Features

Access the admin panel at `/admin` with credentials `admin/admin` (changeable in settings).

### Platform Dashboard
- Cross-game user statistics and activity
- Individual game performance metrics  
- Real-time system monitoring across all games

### User Management
- View all platform users and their progress
- Search and filter users by game activity
- Modify user stats across different games
- Platform-wide user level management

### Game Analytics
- MasterCredits casino performance tracking
- Pyramid Runner high score leaderboards
- Cross-game engagement metrics
- Revenue simulation analytics (fake money)

### System Tools
- Manual database backups for all game data
- Global chat moderation tools
- Platform maintenance mode toggle
- Game-specific configuration management

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
   pm2 start server.js --name "pyramid-platform"
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
docker build -t pyramid-platform .
docker run -p 3000:3000 pyramid-platform
```

## 🔒 Security Notes

- **Educational Platform**: All games are free and for entertainment/education only
- **No Real Transactions**: No real money or payments involved anywhere on the platform
- **Secure Admin Access**: Change the admin password on first setup
- **Regular Backups**: Automated daily backups at 2 AM for all platform data
- **Chat Moderation**: Platform-wide chat filtering and spam prevention
- **Rate Limiting**: Protection against automated abuse across all games
- **Safe Gaming**: All games designed to promote fun without gambling addiction risks

## 🎨 Customization

### Platform Themes
- Edit `public/css/platform.css` for main platform styling
- Edit `public/css/styles.css` for individual game themes
- Customize the pyramid visual hierarchy and game icons

### Adding New Games
1. Create new HTML file in `public/` directory
2. Add corresponding JavaScript file in `public/js/`
3. Update `public/platform.html` to include new game in navigation
4. Add game routes in `server.js`

### MasterCredits Casino Customization
Modify `java/src/com/mastercredits/GameEngine.java` to adjust:
- Payout rates and game balance
- New casino game mechanics
- Talent tree configurations

### Pyramid Runner Customization
Edit `public/js/pyramidrunner.js` to modify:
- Level designs and challenges
- Character mechanics and physics
- Scoring and progression systems

### Platform Features
- Add custom avatar images to `uploads/avatars/` (recommended: 150x150px)
- Customize cross-game progression in platform JavaScript
- Modify unified user experience elements

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
DEBUG=pyramid:* npm start
```

## 📞 Support

For issues and support:
1. Check the console logs
2. Verify all prerequisites are installed
3. Ensure database permissions are correct
4. Try restarting the application

## 🚀 Future Development

The Pyramid platform is designed for continuous expansion:
- **Upcoming Games**: FPS shooters, fighting games, multiplayer experiences
- **Platform Features**: Achievement system, tournaments, social features
- **Educational Content**: Game development tutorials, coding challenges
- **Community Tools**: User-generated content, modding support

## 📄 License

This project is provided as-is for educational and entertainment purposes. All games are free and designed to promote learning and fun without any monetary risk.

**Educational Mission**: The AseioTech Pyramid platform demonstrates web development techniques, game design principles, and full-stack development practices.

---

Made with ❤️ by AseioTech for education and entertainment! 🔺