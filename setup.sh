#!/bin/bash

# MasterCredits Casino Setup Script
echo "🎰 Setting up MasterCredits Casino..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is required but not installed."
    echo "Please install Java JDK 8 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p java/lib java/build database uploads/avatars backups public/images/avatars

# Download Gson library for Java
echo "☕ Downloading Java JSON library..."
if command -v curl &> /dev/null; then
    curl -L "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar" -o java/lib/gson-2.10.1.jar
elif command -v wget &> /dev/null; then
    wget "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar" -O java/lib/gson-2.10.1.jar
else
    echo "⚠️ Could not download Gson library. Please download manually:"
    echo "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar"
    echo "Save it to: java/lib/gson-2.10.1.jar"
fi

# Compile Java code
echo "🔧 Compiling Java game engine..."
npm run compile-java

# Create a simple logo placeholder (SVG)
echo "🎨 Creating logo placeholder..."
cat > public/images/logo.png << 'EOF'
<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="20" fill="#FFD700" stroke="#1a1a2e" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#1a1a2e">MC</text>
</svg>
EOF

# Create default avatar
echo "👤 Creating default avatar..."
cat > public/images/avatars/default.png << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
    <circle cx="75" cy="75" r="70" fill="#4169E1" stroke="#FFD700" stroke-width="5"/>
    <circle cx="60" cy="60" r="8" fill="#FFD700"/>
    <circle cx="90" cy="60" r="8" fill="#FFD700"/>
    <path d="M 55 95 Q 75 115 95 95" stroke="#FFD700" stroke-width="3" fill="none"/>
</svg>
EOF

# Generate some example avatars
echo "🖼️ Generating example avatars..."
for i in {1..10}; do
    color1=$(printf "#%06x\n" $((RANDOM % 16777215)))
    color2=$(printf "#%06x\n" $((RANDOM % 16777215)))
    
    cat > "public/images/avatars/avatar$i.png" << EOF
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
    <circle cx="75" cy="75" r="70" fill="$color1" stroke="#FFD700" stroke-width="3"/>
    <circle cx="60" cy="60" r="8" fill="#FFD700"/>
    <circle cx="90" cy="60" r="8" fill="#FFD700"/>
    <circle cx="75" cy="85" r="5" fill="#FFD700"/>
    <path d="M 55 105 Q 75 125 95 105" stroke="#FFD700" stroke-width="2" fill="none"/>
</svg>
EOF
done

# Set permissions
echo "🔒 Setting permissions..."
chmod 755 setup.sh
chmod 755 server.js
chmod -R 755 public/
chmod -R 755 database/ uploads/ backups/ 2>/dev/null || true

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start MasterCredits Casino:"
echo "   npm start"
echo ""
echo "🌐 Then visit:"
echo "   http://localhost:3000     - Main casino"
echo "   http://localhost:3000/admin - Admin panel (admin/admin)"
echo ""
echo "📝 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo "   (Change these in the admin panel!)"
echo ""
echo "🎰 Have fun gambling with fake money!"