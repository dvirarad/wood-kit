const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 6003;

console.log('1. Starting minimal server...');

// Basic middleware
app.use(express.json());

console.log('2. Middleware configured...');

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Minimal server is running',
    timestamp: new Date().toISOString()
  });
});

console.log('3. Routes configured...');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/woodkits')
.then(() => {
  console.log('4. Connected to MongoDB');
  
  // Start server
  app.listen(PORT, () => {
    console.log('5. Server listening on port', PORT);
    console.log('Test: curl http://localhost:6003/health');
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

console.log('6. Script completed setup');