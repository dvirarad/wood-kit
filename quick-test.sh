#!/bin/bash

echo "🔧 Quick Backend Test..."
cd backend

# Kill any existing process on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Start backend and test
echo "Starting backend..."
timeout 15s npm start &
SERVER_PID=$!

sleep 8

echo "Testing backend health..."
if curl -s http://localhost:5000/health | grep -q "success"; then
    echo "✅ Backend is working!"
    curl -s http://localhost:5000/health | jq .
else
    echo "❌ Backend test failed"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true