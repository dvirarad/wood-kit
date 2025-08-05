#!/bin/bash

# Wood Kits - Complete System Startup Script
# This script will handle all dependency installation and startup issues

echo "🪵 Wood Kits - Starting Full System..."
echo "=============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔍 Checking for processes on port $port..."
    
    # Multiple methods to ensure port is cleared
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
    
    # Try again with different approach
    pkill -f "node.*$port" 2>/dev/null || true
    sleep 1
    
    # Final check with force kill
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "⚠️  Port $port still in use, force killing..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "❌ Failed to clear port $port"
        return 1
    else
        echo "✅ Cleared port $port"
        return 0
    fi
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Clear ports
kill_port 6005
kill_port 6003

# Backend Setup
echo ""
echo "🔧 Setting up Backend..."
echo "========================"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Backend dependency installation failed"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Backend .env file missing"
    exit 1
else
    echo "✅ Backend .env file found"
fi

echo "🚀 Starting backend server..."
# Start backend in background
npm start &
BACKEND_PID=$!
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    # Test backend health
    if curl -s http://localhost:6003/health > /dev/null; then
        echo "✅ Backend health check passed"
    else
        echo "⚠️  Backend started but health check failed"
    fi
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Frontend Setup
echo ""
echo "🔧 Setting up Frontend..."  
echo "========================="
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Frontend dependency installation failed"
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Frontend .env file missing"
    exit 1
else
    echo "✅ Frontend .env file found"
fi

echo "🚀 Starting frontend server..."
# Start frontend in background
npm start &
FRONTEND_PID=$!
sleep 10

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    # Test frontend
    if curl -s http://localhost:6005 > /dev/null; then
        echo "✅ Frontend is accessible"
    else
        echo "⚠️  Frontend started but not accessible yet"
    fi
else
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 BOTH SYSTEMS STARTED SUCCESSFULLY!"
echo "======================================"
echo "🔗 Frontend: http://localhost:6005"
echo "🔗 Backend API: http://localhost:6003/api/v1"
echo "🔗 Backend Health: http://localhost:6003/health"
echo ""
echo "💡 To stop both services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📝 Backend PID: $BACKEND_PID"
echo "📝 Frontend PID: $FRONTEND_PID"

# Wait for user input to stop
echo ""
echo "Press ENTER to stop both services, or Ctrl+C to keep running..."
read

# Cleanup
echo "🛑 Stopping services..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "✅ Services stopped"