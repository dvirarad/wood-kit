const mongoose = require('mongoose');

// Mock external services before any modules are loaded
jest.mock('@sendgrid/mail');
jest.mock('stripe');

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Set test environment variables
  process.env.SENDGRID_API_KEY = 'SG.test_api_key_for_testing';
  process.env.SENDGRID_FROM_EMAIL = 'test@woodkits.com';
  process.env.ADMIN_EMAIL = 'admin@woodkits.com';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing';
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD = 'admin123';
  process.env.JWT_SECRET = 'test_jwt_secret_for_testing';
  
  // Connect to test database
  // Use CI MongoDB URI if available (for GitHub Actions), otherwise use local
  const MONGODB_URI = process.env.MONGODB_URI || 
                      process.env.MONGODB_URI_TEST || 
                      'mongodb://localhost:27017/woodkits_test';
  
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log(`Connected to test database: ${mongoose.connection.name}`);
    } catch (error) {
      console.error('Failed to connect to test database:', error.message);
      // Don't throw error - let tests continue and fail gracefully if needed
    }
  }
});

afterAll(async () => {
  // Clean up and close database connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    await mongoose.disconnect();
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);