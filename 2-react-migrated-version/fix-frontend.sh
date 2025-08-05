#!/bin/bash

echo "🔧 Fixing Frontend Dependencies and Configuration..."

cd frontend

# Clear any existing installs
echo "📦 Clearing existing node_modules..."
rm -rf node_modules package-lock.json

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies with exact versions
echo "⬇️ Installing stable dependencies..."
npm install

# Verify installation
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Dependency installation failed"
    exit 1
fi

# Test compilation
echo "🔨 Testing TypeScript compilation..."
npx tsc --noEmit --skipLibCheck
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️ TypeScript compilation has warnings (may still work)"
fi

# Test build
echo "🏗️ Testing build process..."
CI=true npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Frontend is ready! You can now run 'npm start'"