#!/bin/bash

echo "🪵 Testing Wood Kits Backend..."
echo "================================"

cd backend

# Kill any existing processes on port 5000
echo "🔍 Clearing port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Check Node.js version
echo "📍 Node.js version: $(node --version)"
echo "📍 npm version: $(npm --version)"

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing dependencies..."
    npm install
fi

# Check .env file
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file missing"
    exit 1
fi

# Test server startup
echo "🚀 Testing server startup..."
timeout 30s npm start &
SERVER_PID=$!

# Wait for server to start
sleep 8

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -s http://localhost:5000/health; then
    echo ""
    echo "✅ Backend is working correctly!"
else
    echo "❌ Backend health check failed"
fi

# Stop server
kill $SERVER_PID 2>/dev/null || true
sleep 2
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "✅ Backend test completed"