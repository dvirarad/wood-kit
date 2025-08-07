const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend/server');
const Product = require('../../backend/models/ProductSimple');

describe('Admin Product Management E2E Tests', () => {
  let adminToken;
  let testProductId;
  
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/wood-kits-test');
    }
    
    // Create test admin login
    const loginResponse = await request(app)
      .post('/api/v1/admin/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
    
    adminToken = loginResponse.body.token;
    
    // Create a test product
    const testProduct = new Product({
      productId: 'test-bookshelf-e2e',
      name: 'Test E2E Bookshelf',
      description: 'A test bookshelf for E2E testing',
      basePrice: 199,
      currency: 'NIS',
      dimensions: {
        height: { min: 100, max: 250, default: 180, multiplier: 0.5 },
        width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
        depth: { min: 25, max: 40, default: 30, multiplier: 0.4 }
      },
      options: {
        lacquer: { available: true, price: 0, basePrice: 45 },
        handrail: { available: false, price: 0 },
        color: {
          available: true,
          choices: new Map([
            ['ללא צביעה', 0],
            ['לבן', 0.35],
            ['שחור', 0.35],
            ['מייפל', 0.35],
            ['ירוק', 0.35],
            ['אגוז כהה', 0.35],
            ['אדמדם', 0.35],
            ['אלון', 0.35],
            ['אפור', 0.35]
          ])
        }
      },
      category: 'bookshelf',
      tags: ['test', 'e2e', 'bookshelf'],
      images: [
        {
          url: 'https://example.com/test-bookshelf.jpg',
          alt: 'Test Bookshelf',
          isPrimary: true
        }
      ],
      isActive: true,
      inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
      ratings: { average: 4.5, count: 10 }
    });
    
    const savedProduct = await testProduct.save();
    testProductId = savedProduct.productId;
  });
  
  afterAll(async () => {
    // Clean up test data
    await Product.deleteOne({ productId: testProductId });
    await mongoose.connection.close();
  });
  
  describe('GET /api/v1/products - Product Listing', () => {
    test('should get all products including test product', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const testProduct = response.body.data.find(p => p.productId === testProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct.name).toBe('Test E2E Bookshelf');
      expect(testProduct.basePrice).toBe(199);
    });
  });
  
  describe('Admin Authentication', () => {
    test('should require admin token for admin endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/admin/pricing')
        .expect(401);
        
      expect(response.body.success).toBe(false);
    });
    
    test('should access admin endpoints with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('Admin Product Management - Basic Info', () => {
    test('should update product name', async () => {
      const newName = 'Updated Test Bookshelf E2E';
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: newName
        })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newName);
      expect(response.body.data.productId).toBe(testProductId);
      
      // Verify in database
      const updatedProduct = await Product.findOne({ productId: testProductId });
      expect(updatedProduct.name).toBe(newName);
    });
    
    test('should update product description', async () => {
      const newDescription = 'Updated description for E2E testing with comprehensive features';
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: newDescription
        })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(newDescription);
      
      // Verify in database
      const updatedProduct = await Product.findOne({ productId: testProductId });
      expect(updatedProduct.description).toBe(newDescription);
    });
    
    test('should validate name length constraints', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '' // Empty name should fail
        })
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
    
    test('should validate description length constraints', async () => {
      const longDescription = 'x'.repeat(1001); // Exceeds 1000 char limit
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: longDescription
        })
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('Admin Product Management - Pricing & Dimensions', () => {
    test('should update base price', async () => {
      const newPrice = 250;
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          basePrice: newPrice
        })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.basePrice).toBe(newPrice);
      
      // Verify in database
      const updatedProduct = await Product.findOne({ productId: testProductId });
      expect(updatedProduct.basePrice).toBe(newPrice);
    });
    
    test('should update dimensions configuration', async () => {
      const newDimensions = {
        height: { min: 120, max: 280, default: 200, multiplier: 0.6 },
        width: { min: 70, max: 140, default: 90, multiplier: 0.4 },
        depth: { min: 30, max: 50, default: 35, multiplier: 0.5 }
      };
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dimensions: newDimensions
        })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.dimensions.height.min).toBe(120);
      expect(response.body.data.dimensions.width.multiplier).toBe(0.4);
      
      // Verify in database
      const updatedProduct = await Product.findOne({ productId: testProductId });
      expect(updatedProduct.dimensions.height.min).toBe(120);
      expect(updatedProduct.dimensions.width.multiplier).toBe(0.4);
    });
    
    test('should validate price constraints', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          basePrice: -10 // Negative price should fail
        })
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
    
    test('should validate dimension constraints', async () => {
      const invalidDimensions = {
        height: { min: -5, max: 250, default: 180, multiplier: 0.5 } // Negative min
      };
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dimensions: invalidDimensions
        })
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('Admin Product Management - Images', () => {
    test('should update product images', async () => {
      const newImages = [
        {
          url: 'https://example.com/bookshelf-1.jpg',
          alt: 'Test Bookshelf Front View',
          isPrimary: true
        },
        {
          url: 'https://example.com/bookshelf-2.jpg',
          alt: 'Test Bookshelf Side View',
          isPrimary: false
        },
        {
          url: 'https://example.com/bookshelf-3.jpg',
          alt: 'Test Bookshelf Detail',
          isPrimary: false
        }
      ];
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: newImages
        })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(3);
      
      const primaryImage = response.body.data.images.find(img => img.isPrimary);
      expect(primaryImage).toBeDefined();
      expect(primaryImage.url).toBe('https://example.com/bookshelf-1.jpg');
      
      // Verify in database
      const updatedProduct = await Product.findOne({ productId: testProductId });
      expect(updatedProduct.images).toHaveLength(3);
      expect(updatedProduct.images.find(img => img.isPrimary).url).toBe('https://example.com/bookshelf-1.jpg');
    });
    
    test('should validate image URL format', async () => {
      const invalidImages = [
        {
          url: 'not-a-valid-url',
          alt: 'Invalid URL',
          isPrimary: true
        }
      ];
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: invalidImages
        })
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
    
    test('should handle empty images array', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: []
        })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(0);
    });
  });
  
  describe('Admin Product Management - Complete Update', () => {
    test('should update all product fields simultaneously', async () => {
      const completeUpdate = {
        name: 'Complete Update Test Bookshelf',
        description: 'A comprehensive test of updating all product fields simultaneously',
        basePrice: 299,
        dimensions: {
          height: { min: 150, max: 300, default: 220, multiplier: 0.7 },
          width: { min: 80, max: 160, default: 100, multiplier: 0.5 },
          depth: { min: 35, max: 55, default: 40, multiplier: 0.6 }
        },
        options: {
          lacquer: { available: true, price: 0, basePrice: 50 },
          handrail: { available: true, price: 150 },
          color: {
            available: true,
            choices: {
              'ללא צביעה': 0,
              'לבן': 0.4,
              'שחור': 0.4,
              'מייפל': 0.35
            }
          }
        },
        images: [
          {
            url: 'https://example.com/complete-update-1.jpg',
            alt: 'Complete Update Primary',
            isPrimary: true
          },
          {
            url: 'https://example.com/complete-update-2.jpg',
            alt: 'Complete Update Secondary',
            isPrimary: false
          }
        ]
      };
      
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(completeUpdate)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(completeUpdate.name);
      expect(response.body.data.description).toBe(completeUpdate.description);
      expect(response.body.data.basePrice).toBe(completeUpdate.basePrice);
      expect(response.body.data.dimensions.height.min).toBe(150);
      expect(response.body.data.images).toHaveLength(2);
      
      // Verify complete update in database
      const updatedProduct = await Product.findOne({ productId: testProductId });
      expect(updatedProduct.name).toBe(completeUpdate.name);
      expect(updatedProduct.description).toBe(completeUpdate.description);
      expect(updatedProduct.basePrice).toBe(completeUpdate.basePrice);
      expect(updatedProduct.dimensions.height.min).toBe(150);
      expect(updatedProduct.dimensions.width.multiplier).toBe(0.5);
      expect(updatedProduct.images).toHaveLength(2);
      expect(updatedProduct.options.handrail.available).toBe(true);
      expect(updatedProduct.options.handrail.price).toBe(150);
    });
  });
  
  describe('Admin Product Management - Error Handling', () => {
    test('should handle non-existent product update', async () => {
      const response = await request(app)
        .put('/api/v1/admin/pricing/non-existent-product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name'
        })
        .expect(404);
        
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
    
    test('should handle invalid product ID format', async () => {
      const response = await request(app)
        .put('/api/v1/admin/pricing/invalid-product-id-format')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          basePrice: 200
        })
        .expect(404);
        
      expect(response.body.success).toBe(false);
    });
    
    test('should handle database constraint violations', async () => {
      // Try to set negative multiplier
      const response = await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dimensions: {
            height: { min: 100, max: 250, default: 180, multiplier: -0.5 } // Negative multiplier
          }
        })
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('Product Price Calculation Integration', () => {
    test('should calculate correct price after admin updates', async () => {
      // First, update the product with known dimensions and options
      await request(app)
        .put(`/api/v1/admin/pricing/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          basePrice: 200,
          dimensions: {
            height: { min: 100, max: 200, default: 150, multiplier: 1.0 },
            width: { min: 50, max: 100, default: 75, multiplier: 0.5 }
          },
          options: {
            color: {
              available: true,
              choices: {
                'ללא צביעה': 0,
                'לבן': 0.35
              }
            }
          }
        })
        .expect(200);
      
      // Now test price calculation with specific configuration
      const configuration = {
        dimensions: {
          height: 120, // 20 units above minimum (100)
          width: 60    // 10 units above minimum (50)
        },
        options: {
          color: 'לבן' // 35% markup
        }
      };
      
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({ configuration })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      // Base price: 200
      // Size adjustment: (20 * 1.0) + (10 * 0.5) = 20 + 5 = 25
      // Wood price after size adjustment: 200 + 25 = 225
      // Color cost: 225 * 0.35 = 78.75, rounded to nearest 5 = 80
      // Expected total: 225 + 80 = 305
      
      const pricing = response.body.data.pricing;
      expect(pricing.basePrice).toBe(200);
      expect(pricing.sizeAdjustment).toBe(25);
      expect(pricing.colorCost).toBe(Math.round(78.75 / 5) * 5); // Should be 80
      expect(pricing.totalPrice).toBe(225 + Math.round(78.75 / 5) * 5);
    });
  });
  
  describe('Admin Dashboard Integration', () => {
    test('should reflect updated products in admin dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/admin/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      const testProduct = response.body.data.find(p => p.productId === testProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct.name).toBeDefined();
      expect(testProduct.basePrice).toBeGreaterThan(0);
      expect(testProduct.dimensions).toBeDefined();
      expect(testProduct.lastUpdated).toBeDefined();
    });
  });
});