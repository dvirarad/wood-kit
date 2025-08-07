#!/bin/bash

# Wood Kits Frontend Startup Script
# This script helps avoid common React startup issues

echo "🪵 Starting Wood Kits React Frontend..."
echo "📁 Current directory: $(pwd)"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if this is the React frontend
if ! grep -q "react-scripts" package.json; then
    echo "❌ Error: This doesn't appear to be the React frontend directory."
    echo "📂 Please navigate to: 2-react-migrated-version/frontend/"
    exit 1
fi

echo "✅ Found React frontend configuration"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies found"
fi

# Check if react-scripts is properly installed
if [ ! -f "node_modules/react-scripts/scripts/start.js" ]; then
    echo "🔧 React scripts missing or corrupted. Reinstalling..."
    rm -rf node_modules package-lock.json
    npm install
fi

echo "🚀 Starting React development server..."
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔄 To stop the server, press Ctrl+C"
echo ""

# Try different methods to start the React app
if npm start; then
    echo "✅ React app started successfully!"
elif npx react-scripts start; then
    echo "✅ React app started with npx!"
else
    echo "❌ Failed to start React app. Please check the troubleshooting section in README.md"
    exit 1
fi