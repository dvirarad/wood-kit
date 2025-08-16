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
  
  // Connect to test database
  const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/woodkits_test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
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