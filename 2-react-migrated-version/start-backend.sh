#!/bin/bash

# Wood Kits Backend Startup Script

echo "🪵 Starting Wood Kits Backend API..."
echo "📁 Current directory: $(pwd)"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if this is the backend
if ! grep -q "express" package.json; then
    echo "❌ Error: This doesn't appear to be the backend directory."
    echo "📂 Please navigate to: 2-react-migrated-version/backend/"
    exit 1
fi

echo "✅ Found backend configuration"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies found"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Environment file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your MongoDB URI and other settings"
        echo "📍 Key settings to update:"
        echo "   - MONGODB_URI (your MongoDB connection string)"
        echo "   - ADMIN_PASSWORD (secure password for admin access)"
        echo ""
        echo "⏸️ Pausing for 5 seconds so you can review this message..."
        sleep 5
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
else
    echo "✅ Environment file found"
fi

echo "🚀 Starting backend server..."
echo "🌐 API will be available at: http://localhost:5000"
echo "📊 API documentation at: http://localhost:5000/api/v1"
echo "🔄 To stop the server, press Ctrl+C"
echo ""

# Start the server
if npm run dev; then
    echo "✅ Backend started successfully!"
elif npm start; then
    echo "✅ Backend started in production mode!"
else
    echo "❌ Failed to start backend. Please check your configuration."
    exit 1
fi