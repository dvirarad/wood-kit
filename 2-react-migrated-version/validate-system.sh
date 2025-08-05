#!/bin/bash

echo "🧪 Validating Complete Wood Kits System..."

# Make scripts executable
chmod +x *.sh

# Clear ports first
echo "🔄 Clearing ports..."
./kill-ports.sh

sleep 2

# Test backend
echo ""
echo "🔍 Testing Backend..."
cd backend
node -c server.js
if [ $? -eq 0 ]; then
    echo "✅ Backend syntax is valid"
else
    echo "❌ Backend has syntax errors"
    exit 1
fi

# Start backend in background
echo "🚀 Starting backend for validation..."
node server.js &
BACKEND_PID=$!
sleep 5

# Test backend health
if curl -s http://localhost:6003/health | grep -q "success"; then
    echo "✅ Backend is responding correctly"
    BACKEND_OK=true
else
    echo "❌ Backend health check failed"
    BACKEND_OK=false
fi

# Kill backend
kill $BACKEND_PID 2>/dev/null
sleep 2

# Test frontend
echo ""
echo "🔍 Testing Frontend..."
cd ../frontend

# Check if TypeScript compiles
npx tsc --noEmit --skipLibCheck
if [ $? -eq 0 ]; then
    echo "✅ Frontend TypeScript is valid"
    FRONTEND_TS_OK=true
else
    echo "⚠️ Frontend TypeScript has warnings"
    FRONTEND_TS_OK=false
fi

# Test build
CI=true npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
    FRONTEND_BUILD_OK=true
else
    echo "❌ Frontend build failed"
    FRONTEND_BUILD_OK=false
fi

# Summary
echo ""
echo "📋 VALIDATION SUMMARY"
echo "===================="
if [ "$BACKEND_OK" = true ]; then
    echo "✅ Backend: WORKING"
else
    echo "❌ Backend: FAILED"
fi

if [ "$FRONTEND_TS_OK" = true ] && [ "$FRONTEND_BUILD_OK" = true ]; then
    echo "✅ Frontend: WORKING"
elif [ "$FRONTEND_BUILD_OK" = true ]; then
    echo "⚠️ Frontend: WORKING (with warnings)"
else
    echo "❌ Frontend: FAILED"
fi

# Final result
if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_BUILD_OK" = true ]; then
    echo ""
    echo "🎉 SYSTEM VALIDATED - READY TO RUN!"
    echo ""
    echo "Start with:"
    echo "  ./run-systems.sh"
    echo ""
    echo "Or manually:"
    echo "  Terminal 1: cd backend && node server.js"
    echo "  Terminal 2: cd frontend && npm start"
    echo ""
    echo "Access: http://localhost:6005"
    exit 0
else
    echo ""
    echo "❌ SYSTEM HAS ISSUES - CHECK ERRORS ABOVE"
    exit 1
fi