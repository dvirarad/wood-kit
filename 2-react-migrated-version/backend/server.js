const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');
const paymentRoutes = require('./routes/payments');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 6003;

// Security middleware
app.use(helmet());
app.use(compression());

// No rate limiting needed

// CORS configuration - temporarily allow all origins for debugging
const corsOptions = {
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle text/plain content type for JSON data (needed for some frontend requests)
app.use('/api/v1/admin/products', express.text({ type: 'text/plain', limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Wood Kits API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wood Kits API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/woodkits')
.then(async () => {
  console.log('✅ Connected to MongoDB');
  console.log(`📍 Database: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('🔌 MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('🔌 MongoDB connection closed.');
    process.exit(0);
  });
});

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('🚀 Wood Kits API Server Started');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;