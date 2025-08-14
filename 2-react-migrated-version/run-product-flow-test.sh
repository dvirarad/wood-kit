#!/bin/bash

echo "🚀 Running Complete Product Flow E2E Test"
echo "======================================="

# Kill any existing processes on port 6003
echo "🧹 Cleaning up existing processes..."
kill -9 $(lsof -ti:6003) 2>/dev/null || true
sleep 2

# Set environment variables for testing
export NODE_ENV=test
export MONGODB_TEST_URI=${MONGODB_TEST_URI:-"mongodb://localhost:27017/wood-kits-test"}
export ADMIN_USERNAME=${ADMIN_USERNAME:-"admin"}
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin123"}
export PORT=6003

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! mongosh --quiet --eval "db.adminCommand('ismaster')" > /dev/null 2>&1; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    exit 1
fi

echo "✅ MongoDB is running"

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start backend server in test mode
echo "🔧 Starting backend server for testing..."
cd backend
NODE_ENV=test PORT=6003 node server.js &
BACKEND_PID=$!
cd ..

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if ! curl -s http://localhost:6003/health > /dev/null; then
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend server is running"

# Run the E2E test
echo "🧪 Running complete product flow test..."
npx jest tests/e2e/complete-product-flow.test.js --verbose --detectOpenHandles --forceExit --testTimeout=30000

TEST_EXIT_CODE=$?

# Clean up
echo "🧹 Cleaning up..."
kill $BACKEND_PID 2>/dev/null
sleep 2

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed! Complete product flow working correctly."
    echo ""
    echo "Test Summary:"
    echo "- ✅ Admin can add products with full customization options"
    echo "- ✅ Products appear in public API with correct data"
    echo "- ✅ Price calculation works with dimensions and colors"
    echo "- ✅ Orders can be created with customized products"
    echo "- ✅ Admin dashboard reflects new orders and products"
    echo "- ✅ Review system works end-to-end"
    echo "- ✅ Product updates and inventory management working"
    echo "- ✅ Data consistency maintained across all APIs"
else
    echo ""
    echo "❌ Some tests failed. Please check the output above."
fi

exit $TEST_EXIT_CODE