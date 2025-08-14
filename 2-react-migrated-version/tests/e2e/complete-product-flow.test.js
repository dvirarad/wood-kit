const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend/server');
const Product = require('../../backend/models/Product');

describe('Complete Product Flow E2E Tests', () => {
  let adminToken;
  let testProduct;
  let productId;
  
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/wood-kits-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
    
    // Clear existing test data
    await Product.deleteMany({ productId: /^test-/ });
    
    // Get admin token
    const loginResponse = await request(app)
      .post('/api/v1/admin/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
    
    if (loginResponse.body.token) {
      adminToken = loginResponse.body.token;
    } else {
      // Create test admin if doesn't exist
      console.log('No admin token received, using test setup');
      adminToken = 'test-admin-token'; // Fallback for testing
    }
  });
  
  afterAll(async () => {
    // Clean up test data
    if (productId) {
      await Product.deleteOne({ _id: productId });
    }
    await Product.deleteMany({ productId: /^test-/ });
    await mongoose.connection.close();
  });
  
  describe('Step 1: Admin adds a new product', () => {
    test('should successfully create a new product via admin API', async () => {
      const newProductData = {
        productId: `test-bookshelf-${Date.now()}`,
        name: {
          he: 'ספרייה לבדיקה',
          en: 'Test Bookshelf',
          es: 'Estantería de Prueba'
        },
        description: {
          he: 'ספרייה לבדיקת המערכת',
          en: 'Bookshelf for system testing',
          es: 'Estantería para pruebas del sistema'
        },
        basePrice: 299,
        currency: 'NIS',
        dimensions: {
          height: { 
            min: 100, max: 250, default: 180, multiplier: 0.5,
            visible: true, editable: true,
            label: { he: 'גובה', en: 'Height', es: 'Altura' }
          },
          width: { 
            min: 60, max: 120, default: 80, multiplier: 0.3,
            visible: true, editable: true,
            label: { he: 'רוחב', en: 'Width', es: 'Ancho' }
          },
          depth: { 
            min: 25, max: 40, default: 30, multiplier: 0.4,
            visible: true, editable: true,
            label: { he: 'עומק', en: 'Depth', es: 'Profundidad' }
          }
        },
        options: {
          lacquer: { available: true, price: 45 },
          handrail: { available: false, price: 0 }
        },
        colorOptions: {
          enabled: true,
          priceModifier: 0.4,
          options: [
            {
              name: { he: 'ללא צבע', en: 'Natural', es: 'Natural' },
              value: 'natural',
              priceAdjustment: 0,
              available: true
            },
            {
              name: { he: 'לבן', en: 'White', es: 'Blanco' },
              value: 'white',
              priceAdjustment: 0,
              available: true
            },
            {
              name: { he: 'שחור', en: 'Black', es: 'Negro' },
              value: 'black',
              priceAdjustment: 10,
              available: true
            }
          ]
        },
        category: 'bookshelf',
        tags: ['test', 'bookshelf', 'customizable'],
        images: [{
          url: 'https://example.com/test-bookshelf.jpg',
          alt: 'Test Bookshelf',
          isPrimary: true
        }],
        isActive: true,
        inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
        ratings: { average: 0, count: 0 }
      };
      
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProductData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.productId).toBe(newProductData.productId);
      expect(response.body.data.name.he).toBe(newProductData.name.he);
      expect(response.body.data.basePrice).toBe(newProductData.basePrice);
      expect(response.body.data.dimensions.height.min).toBe(100);
      expect(response.body.data.colorOptions.enabled).toBe(true);
      expect(response.body.data.colorOptions.options).toHaveLength(3);
      
      // Store for next tests
      testProduct = response.body.data;
      productId = testProduct._id;
    });
    
    test('should verify product appears in admin products list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);
      
      const createdProduct = response.body.products.find(p => p._id === productId);
      expect(createdProduct).toBeDefined();
      expect(createdProduct.name.he).toBe('ספרייה לבדיקה');
      expect(createdProduct.isActive).toBe(true);
    });
  });
  
  describe('Step 2: Product appears on public product listing', () => {
    test('should find the new product in public products API', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const publicProduct = response.body.data.find(p => p.id === productId);
      expect(publicProduct).toBeDefined();
      expect(publicProduct.productId).toBe(testProduct.productId);
      expect(publicProduct.basePrice).toBe(testProduct.basePrice);
    });
    
    test('should get detailed product information', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${productId}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.productId).toBe(testProduct.productId);
      expect(response.body.data.dimensions).toBeDefined();
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.inventory.inStock).toBe(true);
    });
  });
  
  describe('Step 3: Product customization and pricing', () => {
    test('should calculate price with custom dimensions', async () => {
      const configuration = {
        dimensions: {
          height: 200, // 20 units above default (180)
          width: 100,  // 20 units above default (80)  
          depth: 35    // 5 units above default (30)
        }
      };
      
      const response = await request(app)
        .post(`/api/v1/products/${productId}/calculate-price`)
        .send({ configuration })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing).toBeDefined();
      
      const pricing = response.body.data.pricing;
      expect(pricing.basePrice).toBe(299);
      
      // Size adjustment: (20 * 0.5) + (20 * 0.3) + (5 * 0.4) = 10 + 6 + 2 = 18
      expect(pricing.sizeAdjustment).toBe(18);
      expect(pricing.totalPrice).toBe(299 + 18); // 317
    });
    
    test('should calculate price with color selection', async () => {
      const configuration = {
        dimensions: {
          height: 180, // default
          width: 80,   // default
          depth: 30    // default
        },
        color: 'white'
      };
      
      const response = await request(app)
        .post(`/api/v1/products/${productId}/calculate-price`)
        .send({ configuration })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      const pricing = response.body.data.pricing;
      expect(pricing.basePrice).toBe(299);
      expect(pricing.sizeAdjustment).toBe(0); // All default dimensions
      
      // Color cost should be applied (40% modifier)
      const expectedColorCost = Math.round(299 * 0.4);
      expect(pricing.colorCost).toBe(expectedColorCost);
      expect(pricing.totalPrice).toBe(299 + expectedColorCost);
    });
    
    test('should calculate price with both custom dimensions and color', async () => {
      const configuration = {
        dimensions: {
          height: 200, // 20 above default
          width: 90,   // 10 above default
          depth: 35    // 5 above default
        },
        color: 'black', // Has 10 NIS additional adjustment
        options: {
          lacquer: true // 45 NIS
        }
      };
      
      const response = await request(app)
        .post(`/api/v1/products/${productId}/calculate-price`)
        .send({ configuration })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      const pricing = response.body.data.pricing;
      expect(pricing.basePrice).toBe(299);
      
      // Size adjustment: (20 * 0.5) + (10 * 0.3) + (5 * 0.4) = 10 + 3 + 2 = 15
      expect(pricing.sizeAdjustment).toBe(15);
      
      // Wood price after size: 299 + 15 = 314
      // Color cost: (314 * 0.4) + 10 = 125.6 + 10 = 135.6, rounded
      // Lacquer cost: 45
      // Total should include all components
      expect(pricing.optionsCost).toBeGreaterThan(0);
      expect(pricing.totalPrice).toBeGreaterThan(400);
    });
  });
  
  describe('Step 4: Order creation (cart simulation)', () => {
    test('should create an order with the customized product', async () => {
      const orderData = {
        customer: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '0501234567',
          address: {
            street: '123 Test Street',
            city: 'Tel Aviv',
            postalCode: '12345',
            country: 'Israel'
          }
        },
        items: [{
          productId: testProduct.productId,
          quantity: 1,
          configuration: {
            dimensions: {
              height: 200,
              width: 90,
              depth: 35
            },
            color: 'white',
            options: {
              lacquer: true
            }
          },
          customization: {
            personalizedMessage: 'Custom bookshelf for testing'
          }
        }],
        deliveryPreference: 'standard',
        notes: 'E2E test order'
      };
      
      const response = await request(app)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.orderId).toBeDefined();
      expect(response.body.data.customer.name).toBe(orderData.customer.name);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe(testProduct.productId);
      expect(response.body.data.pricing.total).toBeGreaterThan(0);
      expect(response.body.data.status).toBe('pending');
      
      // Store order ID for cleanup if needed
      const orderId = response.body.data.orderId;
      
      // Verify order can be retrieved
      const orderResponse = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .expect(200);
        
      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.orderId).toBe(orderId);
      expect(orderResponse.body.data.items[0].configuration.color).toBe('white');
    });
  });
  
  describe('Step 5: Admin can view and manage orders', () => {
    test('should see the new order in admin dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalOrders).toBeGreaterThan(0);
      expect(response.body.data.recentOrders).toBeDefined();
      
      // Should have at least our test order
      const recentOrders = response.body.data.recentOrders;
      expect(Array.isArray(recentOrders)).toBe(true);
    });
  });
  
  describe('Step 6: Product reviews flow', () => {
    test('should allow submitting a review for the product', async () => {
      const reviewData = {
        productId: testProduct.productId,
        customer: {
          name: 'Test Reviewer',
          email: 'reviewer@example.com'
        },
        rating: 5,
        title: 'Excellent bookshelf!',
        comment: 'Perfect customization options and great quality.',
        verified: false
      };
      
      const response = await request(app)
        .post('/api/v1/reviews')
        .send(reviewData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.title).toBe(reviewData.title);
      expect(response.body.data.status).toBe('pending'); // Should require moderation
    });
    
    test('should see pending review in admin panel', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reviews/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const testReview = response.body.data.find(r => 
        r.product && r.product.productId === testProduct.productId
      );
      expect(testReview).toBeDefined();
      expect(testReview.rating).toBe(5);
      expect(testReview.status).toBe('pending');
    });
  });
  
  describe('Step 7: Product updates and inventory management', () => {
    test('should update product inventory after order', async () => {
      const updateData = {
        inventory: {
          inStock: true,
          stockLevel: 45, // Reduced by 1 after order
          lowStockThreshold: 5
        }
      };
      
      const response = await request(app)
        .put(`/api/v1/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.inventory.stockLevel).toBe(45);
    });
    
    test('should update product pricing', async () => {
      const updateData = {
        basePrice: 349, // Increased price
        colorOptions: {
          enabled: true,
          priceModifier: 0.35, // Reduced color modifier
          options: [
            {
              name: { he: 'ללא צבע', en: 'Natural', es: 'Natural' },
              value: 'natural',
              priceAdjustment: 0,
              available: true
            },
            {
              name: { he: 'לבן', en: 'White', es: 'Blanco' },
              value: 'white',
              priceAdjustment: 0,
              available: true
            },
            {
              name: { he: 'כחול', en: 'Blue', es: 'Azul' },
              value: 'blue',
              priceAdjustment: 15,
              available: true
            }
          ]
        }
      };
      
      const response = await request(app)
        .put(`/api/v1/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.basePrice).toBe(349);
      expect(response.body.data.colorOptions.priceModifier).toBe(0.35);
      expect(response.body.data.colorOptions.options).toHaveLength(3);
      
      // Verify new color option
      const blueOption = response.body.data.colorOptions.options.find(opt => opt.value === 'blue');
      expect(blueOption).toBeDefined();
      expect(blueOption.name.he).toBe('כחול');
      expect(blueOption.priceAdjustment).toBe(15);
    });
  });
  
  describe('Step 8: Complete workflow validation', () => {
    test('should verify end-to-end data consistency', async () => {
      // Get product from public API
      const productResponse = await request(app)
        .get(`/api/v1/products/${productId}`)
        .expect(200);
      
      // Get product from admin API
      const adminResponse = await request(app)
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      const adminProduct = adminResponse.body.products.find(p => p._id === productId);
      
      // Verify consistency
      expect(productResponse.body.data.id).toBe(adminProduct._id);
      expect(productResponse.body.data.basePrice).toBe(adminProduct.basePrice);
      expect(productResponse.body.data.inventory.inStock).toBe(adminProduct.inventory.inStock);
      
      // Test final price calculation with updated pricing
      const finalPriceResponse = await request(app)
        .post(`/api/v1/products/${productId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { height: 200, width: 90, depth: 35 },
            color: 'blue',
            options: { lacquer: true }
          }
        })
        .expect(200);
      
      const finalPricing = finalPriceResponse.body.data.pricing;
      expect(finalPricing.basePrice).toBe(349); // Updated price
      expect(finalPricing.totalPrice).toBeGreaterThan(400); // Should include all costs
    });
    
    test('should handle product deactivation', async () => {
      // Deactivate product
      const deactivateResponse = await request(app)
        .put(`/api/v1/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);
      
      expect(deactivateResponse.body.data.isActive).toBe(false);
      
      // Verify it doesn't appear in public listing
      const publicResponse = await request(app)
        .get('/api/v1/products')
        .expect(200);
      
      const deactivatedProduct = publicResponse.body.data.find(p => p.id === productId);
      expect(deactivatedProduct).toBeUndefined();
      
      // But should still be accessible by direct ID for existing orders
      const directResponse = await request(app)
        .get(`/api/v1/products/${productId}`)
        .expect(200);
      
      expect(directResponse.body.success).toBe(true);
    });
  });
});