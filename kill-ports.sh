#!/bin/bash

echo "🔥 Killing all processes on ports 6005 and 6003..."

# Kill port 6003 (backend)
echo "🔍 Killing port 6003..."
lsof -ti:6003 | xargs kill -9 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
sleep 2

# Kill port 6005 (frontend)  
echo "🔍 Killing port 6005..."
lsof -ti:6005 | xargs kill -9 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
sleep 2

# Final verification
if lsof -ti:6003 >/dev/null 2>&1; then
    echo "❌ Port 6003 still in use"
    lsof -i:6003
else
    echo "✅ Port 6003 cleared"
fi

if lsof -ti:6005 >/dev/null 2>&1; then
    echo "❌ Port 6005 still in use"  
    lsof -i:6005
else
    echo "✅ Port 6005 cleared"
fi

echo "🎯 Ports cleared! You can now run ./run-systems.sh"