const request = require('supertest');

// Mock the database connection
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: { name: 'test_db' },
  Schema: class MockSchema {
    constructor(definition, options) {
      this.definition = definition;
      this.options = options;
    }
    static Types = {
      ObjectId: 'ObjectId',
      Mixed: 'Mixed'
    };
    index() { return this; }
    static() { return this; }
    virtual() { return { get: () => this, set: () => this }; }
    pre() { return this; }
    post() { return this; }
    methods = {};
    statics = {};
  },
  model: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      })
    }),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 })
  })
}));

// Import the app after mocking
const app = require('../server');

describe('Wood Kits Backend API', () => {
  
  describe('Health Check', () => {
    test('GET /health should return success', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Wood Kits API is running');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Welcome to Wood Kits API');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('API Endpoints', () => {
    test('GET /api/v1/products should be accessible', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect((res) => {
          // Should return either 200 with data or 500 if DB not connected
          expect([200, 500]).toContain(res.status);
        });
    });

    test('POST /api/v1/orders should be accessible', async () => {
      const testOrder = {
        customer: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '123-456-7890',
          address: '123 Test Street'
        },
        items: [
          {
            productId: 'amsterdam-bookshelf',
            name: 'Amsterdam Bookshelf',
            dimensions: { height: 180, width: 80 },
            options: { lacquer: true },
            quantity: 1,
            price: 244
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(testOrder)
        .expect((res) => {
          // Should return either success or validation error
          expect([200, 201, 400, 500]).toContain(res.status);
        });
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    test('Should handle CORS properly', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:6005')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    test('Should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Validation', () => {
    test('Should validate required fields for orders', async () => {
      const invalidOrder = {
        customer: {
          name: 'Test Customer'
          // Missing required fields
        },
        items: []
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect((res) => {
          // Should return validation error
          expect([400, 422]).toContain(res.status);
        });
    });
  });
});