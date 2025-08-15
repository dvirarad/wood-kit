/**
 * E2E Integration Test: Product Display Issues Fix Verification
 * 
 * This test verifies that the client-side product display issues have been fixed:
 * 1. Product images display correctly
 * 2. Price calculations work properly with admin dimension configurations  
 * 3. Integration between admin product edits and client product display
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:6003/api/v1';

describe('Product Display Integration Tests', () => {
  
  describe('1. Image Display Issues', () => {
    test('Products should have valid image URLs that work', async () => {
      // Get all products
      const response = await axios.get(`${API_BASE_URL}/products?language=he&limit=10`);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
      
      // Check each product has valid images
      for (const product of response.data.data) {
        expect(product.images).toBeInstanceOf(Array);
        expect(product.images.length).toBeGreaterThan(0);
        
        for (const image of product.images) {
          expect(image.url).toBeTruthy();
          expect(image.url).not.toMatch(/^\/images\//); // Should not be local file paths
          
          if (image.isPrimary) {
            // Verify primary image URL is accessible (simplified check)
            expect(image.url).toMatch(/^https?:\/\//);
          }
        }
      }
    });
  });

  describe('2. Price Calculation Integration', () => {
    test('Backend price calculation API should work correctly', async () => {
      const testCases = [
        {
          productId: 'stairs',
          configuration: {
            dimensions: { width: 80, height: 100, length: 250, steps: 6 },
            color: 'דובדבן'
          },
          expectedProperties: ['basePrice', 'sizeAdjustment', 'colorCost', 'totalPrice']
        },
        {
          productId: 'test-steps',
          configuration: {
            dimensions: { width: 60, height: 120 },
            color: 'אלון'
          },
          expectedProperties: ['basePrice', 'sizeAdjustment', 'colorCost', 'totalPrice']
        }
      ];

      for (const testCase of testCases) {
        const response = await axios.post(
          `${API_BASE_URL}/products/${testCase.productId}/calculate-price`,
          { configuration: testCase.configuration }
        );
        
        expect(response.data.success).toBe(true);
        expect(response.data.data.productId).toBe(testCase.productId);
        expect(response.data.data.pricing).toBeDefined();
        
        // Verify all expected pricing properties exist
        for (const prop of testCase.expectedProperties) {
          expect(response.data.data.pricing[prop]).toBeDefined();
          expect(typeof response.data.data.pricing[prop]).toBe('number');
        }
        
        // Verify total price is reasonable
        expect(response.data.data.pricing.totalPrice).toBeGreaterThan(0);
        console.log(`✓ ${testCase.productId}: ₪${response.data.data.pricing.totalPrice}`);
      }
    });
  });

  describe('3. Admin Dimension Configuration Integration', () => {
    test('test-steps product should have proper dimension configuration', async () => {
      const response = await axios.get(`${API_BASE_URL}/products/test-steps`);
      expect(response.data.success).toBe(true);
      
      const product = response.data.data;
      expect(product.dimensions).toBeDefined();
      
      // Verify width dimension (should be visible and editable with step=5)
      const width = product.dimensions.width;
      expect(width).toBeDefined();
      expect(width.step).toBe(5);
      expect(width.visible).toBe(true);
      expect(width.editable).toBe(true);
      expect(width.min).toBeDefined();
      expect(width.max).toBeDefined();
      expect(width.default).toBeDefined();
      
      // Verify height dimension (should have step=10, but may not be visible/editable)
      const height = product.dimensions.height;
      expect(height).toBeDefined();
      expect(height.step).toBe(10);
      
      console.log('✓ test-steps dimensions properly configured:', {
        width: `${width.min}-${width.max} (step: ${width.step}, visible: ${width.visible})`,
        height: `${height.min}-${height.max} (step: ${height.step}, visible: ${height.visible})`
      });
    });
    
    test('Dimension settings should affect price calculations correctly', async () => {
      // Test with default dimensions
      const defaultResponse = await axios.post(
        `${API_BASE_URL}/products/test-steps/calculate-price`,
        { configuration: { dimensions: { width: 50 } } } // Default width from DB
      );
      
      // Test with modified dimensions (should change price)
      const modifiedResponse = await axios.post(
        `${API_BASE_URL}/products/test-steps/calculate-price`, 
        { configuration: { dimensions: { width: 80 } } } // Increased width
      );
      
      expect(defaultResponse.data.success).toBe(true);
      expect(modifiedResponse.data.success).toBe(true);
      
      const defaultPrice = defaultResponse.data.data.pricing.totalPrice;
      const modifiedPrice = modifiedResponse.data.data.pricing.totalPrice;
      
      // Price should change when dimensions change
      expect(modifiedPrice).not.toBe(defaultPrice);
      expect(modifiedPrice).toBeGreaterThan(defaultPrice); // Larger dimensions = higher price
      
      console.log('✓ Dimension changes affect pricing:', {
        default: `₪${defaultPrice}`,
        modified: `₪${modifiedPrice}`,
        difference: `₪${modifiedPrice - defaultPrice}`
      });
    });
  });

  describe('4. Data Synchronization Between Admin and Client', () => {
    test('Client should receive properly formatted product data', async () => {
      const response = await axios.get(`${API_BASE_URL}/products/test-steps?language=he`);
      expect(response.data.success).toBe(true);
      
      const product = response.data.data;
      
      // Verify localized content
      expect(product.name).toBeTruthy();
      expect(product.description).toBeTruthy();
      
      // Verify proper data types and structure
      expect(typeof product.basePrice).toBe('number');
      expect(product.basePrice).toBeGreaterThan(0);
      expect(product.currency).toBe('NIS');
      expect(product.inventory).toBeDefined();
      expect(typeof product.inventory.inStock).toBe('boolean');
      
      // Verify dimensions are properly structured
      if (product.dimensions) {
        Object.keys(product.dimensions).forEach(dimensionKey => {
          const dim = product.dimensions[dimensionKey];
          expect(typeof dim.min).toBe('number');
          expect(typeof dim.max).toBe('number');
          expect(typeof dim.default).toBe('number');
          expect(typeof dim.multiplier).toBe('number');
          expect(typeof dim.visible).toBe('boolean');
          expect(typeof dim.editable).toBe('boolean');
        });
      }
      
      console.log('✓ Client receives properly formatted data for test-steps');
    });
  });

  describe('5. End-to-End Integration Verification', () => {
    test('Complete flow: fetch product -> calculate price -> verify data consistency', async () => {
      // 1. Fetch product data
      const productResponse = await axios.get(`${API_BASE_URL}/products/test-steps`);
      expect(productResponse.data.success).toBe(true);
      const product = productResponse.data.data;
      
      // 2. Use product dimensions to calculate price
      const widthDimension = product.dimensions.width;
      const testWidth = widthDimension.default + widthDimension.step; // Use a step-aligned value
      
      const priceResponse = await axios.post(
        `${API_BASE_URL}/products/test-steps/calculate-price`,
        { 
          configuration: { 
            dimensions: { width: testWidth },
            color: 'ללא צבע'
          }
        }
      );
      
      expect(priceResponse.data.success).toBe(true);
      
      // 3. Verify data consistency
      expect(priceResponse.data.data.productId).toBe(product.productId);
      expect(priceResponse.data.data.pricing.basePrice).toBe(product.basePrice);
      
      console.log('✓ End-to-end integration test passed:', {
        productId: product.productId,
        basePrice: product.basePrice,
        testWidth: testWidth,
        calculatedPrice: priceResponse.data.data.pricing.totalPrice,
        hasWorkingImages: product.images.length > 0
      });
    });
  });
});

console.log('\n🧪 Running Product Display Integration Tests...\n');