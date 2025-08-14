const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');

describe('Price Calculator API Tests', () => {
  let testProductId;

  beforeAll(async () => {
    // Wait for database connection
    let retries = 30;
    while (mongoose.connection.readyState !== 1 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }

    // Create a test product for price calculation
    const testProduct = new Product({
      productId: 'test-price-calculator',
      name: {
        en: 'Test Price Calculator Product',
        he: 'מוצר בדיקת מחשבון מחיר',
        es: 'Producto de Prueba Calculadora de Precios'
      },
      description: {
        en: 'Test product for price calculator testing',
        he: 'מוצר בדיקה לבדיקת מחשבון מחיר',
        es: 'Producto de prueba para pruebas de calculadora de precios'
      },
      basePrice: 100,
      currency: 'NIS',
      dimensions: {
        length: { min: 50, max: 200, default: 100, multiplier: 1.0 },
        width: { min: 30, max: 100, default: 50, multiplier: 0.8 },
        height: { min: 20, max: 80, default: 40, multiplier: 0.6 }
      },
      options: {
        lacquer: { available: true, price: 50 },
        handrail: { available: true, price: 100 },
        premium_wood: { available: true, price: 200 }
      },
      colorOptions: {
        enabled: true,
        priceModifier: 0.3,
        options: [
          { name: { en: 'Natural', he: 'טבעי', es: 'Natural' }, value: 'natural', priceAdjustment: 0, available: true },
          { name: { en: 'Walnut', he: 'אגוז', es: 'Nogal' }, value: 'walnut', priceAdjustment: 75, available: true },
          { name: { en: 'Oak', he: 'אלון', es: 'Roble' }, value: 'oak', priceAdjustment: 100, available: true }
        ]
      },
      category: 'furniture',
      tags: ['test'],
      images: [],
      isActive: true,
      inventory: { inStock: true, stockLevel: 100, lowStockThreshold: 10 }
    });

    const savedProduct = await testProduct.save();
    testProductId = savedProduct._id;
  });

  afterAll(async () => {
    // Clean up test product
    if (testProductId) {
      await Product.deleteOne({ _id: testProductId });
    }
  });

  describe('Basic Price Calculation', () => {
    test('should calculate base price for default dimensions', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: {
              length: 100,
              width: 50,
              height: 40
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing.totalPrice).toBeGreaterThan(0);
      expect(response.body.data.pricing.basePrice).toBe(100);
      expect(response.body.data.pricing.sizeAdjustment).toBeDefined();
      expect(response.body.data.pricing.optionsCost).toBeDefined();
      expect(response.body.data.pricing.colorCost).toBeDefined();
    });

    test('should calculate price with custom dimensions', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: {
              length: 150, // 50% larger than default (100)
              width: 75,   // 50% larger than default (50)
              height: 60   // 50% larger than default (40)
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing.totalPrice).toBeGreaterThan(0);
      
      // Should have positive size adjustment for larger dimensions
      expect(response.body.data.pricing.sizeAdjustment).toBeGreaterThanOrEqual(0);
    });

    test('should calculate price with minimum dimensions', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: {
              length: 50, // minimum
              width: 30,  // minimum
              height: 20  // minimum
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing.totalPrice).toBeGreaterThan(0);
      
      // Should have negative size adjustment for smaller dimensions
      expect(response.body.data.pricing.sizeAdjustment).toBeLessThanOrEqual(0);
    });

    test('should calculate price with maximum dimensions', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: {
              length: 200, // maximum
              width: 100,  // maximum
              height: 80   // maximum
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing.totalPrice).toBeGreaterThan(100);
      
      // Should be most expensive due to largest dimensions
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.woodPrice).toBeGreaterThan(100);
    });
  });

  describe('Options Price Calculation', () => {
    test('should add lacquer option price', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            options: {
              lacquer: true
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.optionsPrice).toBe(50);
      expect(breakdown.options.lacquer).toBe(50);
    });

    test('should add handrail option price', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            options: {
              handrail: true
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.optionsPrice).toBe(100);
      expect(breakdown.options.handrail).toBe(100);
    });

    test('should add multiple options price', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            options: {
              lacquer: true,
              handrail: true,
              premium_wood: true
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.optionsPrice).toBe(350); // 50 + 100 + 200
      expect(breakdown.options.lacquer).toBe(50);
      expect(breakdown.options.handrail).toBe(100);
      expect(breakdown.options.premium_wood).toBe(200);
    });
  });

  describe('Color Options Price Calculation', () => {
    test('should add natural color (no extra cost)', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            color: 'natural'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      // Natural should use the base wood price calculation
      expect(breakdown.colorPrice).toBeGreaterThanOrEqual(0);
    });

    test('should add walnut color with adjustment', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            color: 'walnut'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.colorPrice).toBeGreaterThan(0);
      // Should include the walnut price adjustment
      expect(breakdown.colorPrice).toBeGreaterThanOrEqual(75);
    });

    test('should add oak color with adjustment', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            color: 'oak'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.colorPrice).toBeGreaterThan(0);
      // Should include the oak price adjustment
      expect(breakdown.colorPrice).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Complex Price Calculation', () => {
    test('should calculate price with dimensions, options, and color', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: {
              length: 150,
              width: 75,
              height: 60
            },
            options: {
              lacquer: true,
              handrail: true
            },
            color: 'walnut'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      
      // Should have all components
      expect(breakdown.woodPrice).toBeGreaterThan(100); // Larger dimensions
      expect(breakdown.optionsPrice).toBe(150); // lacquer + handrail
      expect(breakdown.colorPrice).toBeGreaterThan(0); // walnut color
      
      // Total should be sum of all components
      const expectedTotal = breakdown.woodPrice + breakdown.optionsPrice + breakdown.colorPrice;
      expect(breakdown.totalPrice).toBe(expectedTotal);
    });

    test('should handle edge case with invalid color', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            color: 'invalid_color'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should fallback to base pricing without color adjustment
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.colorPrice).toBeGreaterThanOrEqual(0);
    });

    test('should handle edge case with invalid options', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            options: {
              invalid_option: true,
              lacquer: true
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const breakdown = response.body.data.pricing.breakdown;
      expect(breakdown.optionsPrice).toBe(50); // Only lacquer should be counted
      expect(breakdown.options.lacquer).toBe(50);
      expect(breakdown.options.invalid_option).toBeUndefined();
    });
  });

  describe('Input Validation', () => {
    test('should handle missing configuration', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should use default values
    });

    test('should handle dimensions outside valid range', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: {
              length: 300, // above max (200)
              width: 10,   // below min (30)
              height: 40
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should clamp to valid ranges or use defaults
    });

    test('should handle invalid product ID', async () => {
      const response = await request(app)
        .post('/api/v1/products/invalid_product_id/calculate-price')
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 }
          }
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should handle malformed request body', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: "invalid"
          }
        })
        .expect(200);

      // Should handle gracefully and use defaults
      expect(response.body.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should calculate price quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({
          configuration: {
            dimensions: { length: 100, width: 50, height: 40 },
            options: { lacquer: true, handrail: true },
            color: 'walnut'
          }
        })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle concurrent price calculations', async () => {
      const requests = Array(10).fill().map(() => 
        request(app)
          .post(`/api/v1/products/${testProductId}/calculate-price`)
          .send({
            configuration: {
              dimensions: { length: 100, width: 50, height: 40 },
              options: { lacquer: true },
              color: 'natural'
            }
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.pricing.totalPrice).toBeGreaterThan(0);
      });
    });
  });
});