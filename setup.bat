@echo off
echo 🎰 Setting up MasterCredits Casino...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is required but not installed.
    echo Please install Java JDK 8 or higher.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
call npm install

REM Create necessary directories
echo 📁 Creating directories...
if not exist "java\lib" mkdir java\lib
if not exist "java\build" mkdir java\build
if not exist "database" mkdir database
if not exist "uploads\avatars" mkdir uploads\avatars
if not exist "backups" mkdir backups
if not exist "public\images\avatars" mkdir public\images\avatars

REM Download Gson library for Java (using PowerShell)
echo ☕ Downloading Java JSON library...
powershell -Command "& {Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar' -OutFile 'java\lib\gson-2.10.1.jar'}"

REM Compile Java code
echo 🔧 Compiling Java game engine...
call npm run compile-java

REM Create a simple logo placeholder
echo 🎨 Creating logo placeholder...
echo ^<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"^> > public\images\logo.png
echo ^<circle cx="25" cy="25" r="20" fill="#FFD700" stroke="#1a1a2e" stroke-width="2"/^> >> public\images\logo.png
echo ^<text x="25" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#1a1a2e"^>MC^</text^> >> public\images\logo.png
echo ^</svg^> >> public\images\logo.png

REM Create default avatar
echo 👤 Creating default avatar...
echo ^<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"^> > public\images\avatars\default.png
echo ^<circle cx="75" cy="75" r="70" fill="#4169E1" stroke="#FFD700" stroke-width="5"/^> >> public\images\avatars\default.png
echo ^<circle cx="60" cy="60" r="8" fill="#FFD700"/^> >> public\images\avatars\default.png
echo ^<circle cx="90" cy="60" r="8" fill="#FFD700"/^> >> public\images\avatars\default.png
echo ^<path d="M 55 95 Q 75 115 95 95" stroke="#FFD700" stroke-width="3" fill="none"/^> >> public\images\avatars\default.png
echo ^</svg^> >> public\images\avatars\default.png

REM Generate some example avatars
echo 🖼️ Generating example avatars...
for /L %%i in (1,1,10) do (
    echo ^<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"^> > public\images\avatars\avatar%%i.png
    echo ^<circle cx="75" cy="75" r="70" fill="#4169E1" stroke="#FFD700" stroke-width="3"/^> >> public\images\avatars\avatar%%i.png
    echo ^<circle cx="60" cy="60" r="8" fill="#FFD700"/^> >> public\images\avatars\avatar%%i.png
    echo ^<circle cx="90" cy="60" r="8" fill="#FFD700"/^> >> public\images\avatars\avatar%%i.png
    echo ^<circle cx="75" cy="85" r="5" fill="#FFD700"/^> >> public\images\avatars\avatar%%i.png
    echo ^<path d="M 55 105 Q 75 125 95 105" stroke="#FFD700" stroke-width="2" fill="none"/^> >> public\images\avatars\avatar%%i.png
    echo ^</svg^> >> public\images\avatars\avatar%%i.png
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 To start MasterCredits Casino:
echo    npm start
echo.
echo 🌐 Then visit:
echo    http://localhost:3000     - Main casino
echo    http://localhost:3000/admin - Admin panel (admin/admin)
echo.
echo 📝 Default admin credentials:
echo    Username: admin
echo    Password: admin
echo    (Change these in the admin panel!)
echo.
echo 🎰 Have fun gambling with fake money!
pause