#!/bin/bash

# Test E2E Setup Locally
echo "🧪 Testing E2E Setup Locally"
echo "============================"

# Check if Node.js and npm are available
echo "📋 Checking prerequisites..."
node --version || { echo "❌ Node.js not found"; exit 1; }
npm --version || { echo "❌ npm not found"; exit 1; }

# Check if MongoDB is running
echo "🔍 Checking MongoDB..."
if curl -s http://localhost:27017 > /dev/null 2>&1; then
    echo "✅ MongoDB appears to be running"
else
    echo "⚠️ MongoDB not detected on localhost:27017"
    echo "You may need to start MongoDB or use Docker:"
    echo "  docker run -d -p 27017:27017 --name mongo-test mongo:6.0"
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd 2-react-migrated-version/backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm ci
fi

cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm ci
fi

cd ../..
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm ci
fi

# Build frontend
echo "🔨 Building frontend..."
cd 2-react-migrated-version/frontend
REACT_APP_API_URL=http://localhost:6003/api/v1 npm run build

# Start backend
echo "🚀 Starting backend server..."
cd ../backend
NODE_ENV=test PORT=6003 npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend
echo "⏳ Waiting for backend to be ready..."
timeout 60s bash -c 'until curl -s http://localhost:6003/health > /dev/null 2>&1; do 
  echo "Waiting..."; 
  sleep 3; 
done' && echo "✅ Backend is ready!" || { echo "❌ Backend failed to start"; kill $BACKEND_PID 2>/dev/null; exit 1; }

# Start frontend
echo "🌐 Starting frontend server..."
cd ../frontend
PORT=6005 npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend  
echo "⏳ Waiting for frontend to be ready..."
timeout 60s bash -c 'until curl -s http://localhost:6005 > /dev/null 2>&1; do 
  echo "Waiting..."; 
  sleep 3; 
done' && echo "✅ Frontend is ready!" || { echo "❌ Frontend failed to start"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 1; }

# Run E2E tests
echo "🧪 Running E2E tests..."
cd ..
FRONTEND_URL=http://localhost:6005 BACKEND_URL=http://localhost:6003 node e2e-tests.js

# Store test result
E2E_RESULT=$?

# Cleanup
echo "🧹 Cleaning up..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
sleep 3
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "serve -s build" 2>/dev/null || true

# Final result
if [ $E2E_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 E2E tests completed successfully!"
    echo "✅ Your setup is ready for E2E testing"
    echo "✅ GitHub Actions E2E pipeline should work"
    exit 0
else
    echo ""
    echo "❌ E2E tests failed"
    echo "🔧 Fix the issues before running E2E pipeline"
    exit 1
fi