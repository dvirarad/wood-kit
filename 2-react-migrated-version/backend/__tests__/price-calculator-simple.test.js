const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');

describe('Price Calculator API - Simple Tests', () => {
  let testProductId;

  beforeAll(async () => {
    // Wait for database connection
    let retries = 30;
    while (mongoose.connection.readyState !== 1 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }

    // Use existing product for testing (should be there from seed data)
    const existingProduct = await Product.findOne({ isActive: true });
    if (existingProduct) {
      testProductId = existingProduct._id;
    }
  });

  describe('Basic Price Calculation', () => {
    test('should calculate price successfully', async () => {
      if (!testProductId) {
        console.log('No product found, skipping test');
        return;
      }

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
      expect(response.body.data.pricing.basePrice).toBeGreaterThan(0);
      expect(typeof response.body.data.pricing.sizeAdjustment).toBe('number');
      expect(typeof response.body.data.pricing.optionsCost).toBe('number');
      expect(typeof response.body.data.pricing.colorCost).toBe('number');
    });

    test('should calculate price with options', async () => {
      if (!testProductId) {
        console.log('No product found, skipping test');
        return;
      }

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
      expect(response.body.data.pricing.totalPrice).toBeGreaterThan(0);
      expect(response.body.data.pricing.optionsCost).toBeGreaterThanOrEqual(0);
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

    test('should handle empty configuration', async () => {
      if (!testProductId) {
        console.log('No product found, skipping test');
        return;
      }

      const response = await request(app)
        .post(`/api/v1/products/${testProductId}/calculate-price`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing.totalPrice).toBeGreaterThan(0);
    });
  });
});