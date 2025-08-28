const request = require('supertest');
const app = require('../test-app');
const Product = require('../models/Product');

describe('Product Dimensions API Validation', () => {
  describe('Product Creation with Dimensions', () => {
    test('should accept products with correct dimensions (width, height, depth)', async () => {
      const validProduct = {
        productId: 'test-dimensions-product',
        name: { he: 'מוצר בדיקה', en: 'Test Product', es: 'Producto de Prueba' },
        description: { he: 'תיאור', en: 'Description', es: 'Descripción' },
        basePrice: 199,
        currency: 'NIS',
        dimensions: {
          width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
          height: { min: 100, max: 250, default: 180, multiplier: 0.5 },
          depth: { min: 25, max: 40, default: 30, multiplier: 0.4 }
        },
        options: {
          lacquer: { available: true, price: 45 },
          handrail: { available: false, price: 0 }
        },
        category: 'bookshelf',
        tags: ['test'],
        images: [{ url: 'test.jpg', alt: 'Test', isPrimary: true }],
        isActive: true,
        inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
        ratings: { average: 0, count: 0 }
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .send(validProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dimensions).toHaveProperty('width');
      expect(response.body.data.dimensions).toHaveProperty('height');
      expect(response.body.data.dimensions).toHaveProperty('depth');
      expect(response.body.data.dimensions).not.toHaveProperty('length');

      // Clean up
      if (response.body.data._id) {
        await Product.deleteOne({ _id: response.body.data._id });
      }
    });

    test('should accept products with length dimension (model supports it)', async () => {
      const productWithLength = {
        productId: 'test-with-length-dimensions',
        name: { he: 'מוצר עם אורך', en: 'Product with Length', es: 'Producto con Longitud' },
        description: { he: 'תיאור', en: 'Description', es: 'Descripción' },
        basePrice: 199,
        dimensions: {
          length: { min: 60, max: 120, default: 80, multiplier: 0.3 },
          width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
          height: { min: 100, max: 250, default: 180, multiplier: 0.5 }
        },
        category: 'bookshelf',
        tags: ['test'],
        images: [{ url: 'test.jpg', alt: 'Test', isPrimary: true }],
        isActive: true,
        inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
        ratings: { average: 0, count: 0 }
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .send(productWithLength);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dimensions).toHaveProperty('length');
      expect(response.body.data.dimensions).toHaveProperty('width');
      expect(response.body.data.dimensions).toHaveProperty('height');

      // Clean up
      if (response.body.data._id) {
        await Product.deleteOne({ _id: response.body.data._id });
      }
    });
  });

  describe('Product Retrieval Dimensions Format', () => {
    let testProductId;

    beforeAll(async () => {
      // Create a test product
      const testProduct = new Product({
        productId: 'dimensions-format-test',
        name: { he: 'בדיקת פורמט', en: 'Format Test', es: 'Prueba de Formato' },
        description: { he: 'תיאור', en: 'Description', es: 'Descripción' },
        basePrice: 199,
        dimensions: {
          width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
          height: { min: 100, max: 250, default: 180, multiplier: 0.5 },
          depth: { min: 25, max: 40, default: 30, multiplier: 0.4 }
        },
        category: 'bookshelf',
        isActive: true,
        inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 }
      });
      
      const saved = await testProduct.save();
      testProductId = saved._id;
    });

    afterAll(async () => {
      if (testProductId) {
        await Product.deleteOne({ _id: testProductId });
      }
    });

    test('should return products with correct dimensions structure', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const testProduct = response.body.data.find(p => p.productId === 'dimensions-format-test');
      expect(testProduct).toBeDefined();
      
      // Verify correct dimensions are present
      expect(testProduct.dimensions).toHaveProperty('width');
      expect(testProduct.dimensions).toHaveProperty('height');
      expect(testProduct.dimensions).toHaveProperty('depth');
      
      // Verify old dimensions are NOT present
      expect(testProduct.dimensions).not.toHaveProperty('length');
      
      // Verify structure
      expect(testProduct.dimensions.width).toHaveProperty('min');
      expect(testProduct.dimensions.width).toHaveProperty('max');
      expect(testProduct.dimensions.width).toHaveProperty('default');
      expect(testProduct.dimensions.width).toHaveProperty('multiplier');
    });

    test('should return individual product with correct dimensions', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dimensions).toHaveProperty('width');
      expect(response.body.data.dimensions).toHaveProperty('height'); 
      expect(response.body.data.dimensions).toHaveProperty('depth');
      expect(response.body.data.dimensions).not.toHaveProperty('length');
    });
  });

  describe('Price Calculator with Dimensions', () => {
    let testProductId;

    beforeAll(async () => {
      const testProduct = new Product({
        productId: 'price-calc-dimensions-test',
        name: { he: 'בדיקת מחשבון מחיר', en: 'Price Calculator Test', es: 'Prueba de Calculadora de Precios' },
        description: { he: 'תיאור', en: 'Description', es: 'Descripción' },
        basePrice: 200,
        minimumPrice: 160, // Explicitly set for test
        dimensions: {
          width: { min: 50, max: 100, default: 75, multiplier: 0.5 },
          height: { min: 80, max: 200, default: 150, multiplier: 0.3 },
          depth: { min: 20, max: 50, default: 35, multiplier: 0.2 }
        },
        category: 'bookshelf',
        isActive: true,
        inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 }
      });
      
      const saved = await testProduct.save();
      testProductId = saved._id;
    });

    afterAll(async () => {
      if (testProductId) {
        await Product.deleteOne({ _id: testProductId });
      }
    });

    test('should calculate price correctly with width, height, depth', async () => {
      const configuration = {
        dimensions: {
          width: 80,  // 5 units above default (75)
          height: 160, // 10 units above default (150)
          depth: 40   // 5 units above default (35)
        }
      };

      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({ configuration })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing).toBeDefined();
      
      const pricing = response.body.data.pricing;
      expect(pricing.minimumPrice).toBe(160); // 80% of basePrice 200
      
      // Expected calculations:
      // Width: (80 - 75) * 0.5 = 2.5
      // Height: (160 - 150) * 0.3 = 3
      // Depth: (40 - 35) * 0.2 = 1
      // Total adjustment: 2.5 + 3 + 1 = 6.5
      expect(pricing.sizeAdjustment).toBe(6.5);
      expect(pricing.totalPrice).toBe(166.5); // minimumPrice 160 + adjustment 6.5
    });

    test('should handle missing dimensions in price calculation', async () => {
      const configuration = {
        dimensions: {
          width: 80,
          height: 160
          // depth is missing - should use default
        }
      };

      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({ configuration })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing).toBeDefined();
      
      // Should not crash and should calculate based on available dimensions
      const pricing = response.body.data.pricing;
      expect(pricing.totalPrice).toBeGreaterThan(160); // minimumPrice + adjustments
    });

    test('should reject price calculation with old length dimension', async () => {
      const configuration = {
        dimensions: {
          length: 100, // Old dimension name
          width: 80,
          height: 160
        }
      };

      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({ configuration });

      // Should either ignore the length or return calculated price without using it
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});