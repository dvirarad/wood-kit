#!/bin/bash

echo "🪵 Testing Wood Kits Frontend..."
echo "================================="

cd frontend

# Kill any existing processes on port 3000
echo "🔍 Clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

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
    echo "📋 Frontend config: $(cat .env)"
else
    echo "❌ .env file missing"
    exit 1
fi

# Check if TypeScript compiles
echo "🔍 Testing TypeScript compilation..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
fi

# Test build process (quick check)
echo "🔨 Testing build process..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
fi

echo "✅ Frontend test completed"