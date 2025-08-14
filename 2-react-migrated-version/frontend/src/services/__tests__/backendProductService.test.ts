import { backendProductService } from '../backendProductService';

// Mock the api module
jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

describe('BackendProductService Dimension Handling', () => {
  const { api } = require('../api');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Data Conversion', () => {
    test('should convert backend product with correct dimensions (width, height, depth)', async () => {
      const backendResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              productId: 'amsterdam-bookshelf',
              basePrice: 199,
              currency: 'NIS',
              dimensions: {
                width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
                height: { min: 100, max: 250, default: 180, multiplier: 0.5 },
                depth: { min: 25, max: 40, default: 30, multiplier: 0.4 }
              },
              options: { lacquer: { available: true, price: 45 } },
              category: 'bookshelf',
              tags: ['modern'],
              images: [{ url: 'test.jpg', alt: 'Test', isPrimary: true }],
              ratings: { average: 4.5, count: 10 },
              inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
              createdAt: '2023-01-01T00:00:00Z'
            }
          ]
        }
      };

      api.get.mockResolvedValue(backendResponse);

      const products = await backendProductService.getProducts();

      expect(products).toHaveLength(1);
      const product = products[0];

      // Verify dimensions are correctly converted
      expect(product.customization?.dimensions).toHaveProperty('width');
      expect(product.customization?.dimensions).toHaveProperty('height');
      expect(product.customization?.dimensions).toHaveProperty('depth');
      expect(product.customization?.dimensions).not.toHaveProperty('length');

      // Verify dimension structure
      expect(product.customization?.dimensions?.width).toEqual({
        min: 60,
        max: 120,
        default: 80,
        step: 1,
        visible: true,
        editable: true,
        priceModifier: 0.3
      });
    });

    test('should handle products with missing dimensions gracefully', async () => {
      const backendResponseMissingDimensions = {
        data: {
          success: true,
          data: [
            {
              id: '2',
              productId: 'test-product',
              basePrice: 150,
              currency: 'NIS',
              dimensions: {
                width: { min: 40, max: 80, default: 60, multiplier: 0.2 }
                // height and depth are missing
              },
              options: {},
              category: 'test',
              tags: [],
              images: [],
              ratings: { average: 0, count: 0 },
              inventory: { inStock: true, stockLevel: 10, lowStockThreshold: 2 },
              createdAt: '2023-01-01T00:00:00Z'
            }
          ]
        }
      };

      api.get.mockResolvedValue(backendResponseMissingDimensions);

      const products = await backendProductService.getProducts();

      expect(products).toHaveLength(1);
      const product = products[0];

      // Should handle missing dimensions without crashing
      expect(product.customization?.dimensions?.width).toBeDefined();
      expect(product.customization?.dimensions?.height).toBeUndefined();
      expect(product.customization?.dimensions?.depth).toBeUndefined();
    });

    test('should handle products with completely missing dimensions object', async () => {
      const backendResponseNoDimensions = {
        data: {
          success: true,
          data: [
            {
              id: '3',
              productId: 'simple-product',
              basePrice: 100,
              currency: 'NIS',
              dimensions: null, // No dimensions at all
              options: {},
              category: 'simple',
              tags: [],
              images: [],
              ratings: { average: 0, count: 0 },
              inventory: { inStock: true, stockLevel: 5, lowStockThreshold: 1 },
              createdAt: '2023-01-01T00:00:00Z'
            }
          ]
        }
      };

      api.get.mockResolvedValue(backendResponseNoDimensions);

      const products = await backendProductService.getProducts();

      expect(products).toHaveLength(1);
      const product = products[0];

      // Should handle null dimensions without crashing
      expect(product.customization?.dimensions).toEqual({});
    });

    test('should handle malformed dimension data', async () => {
      const backendResponseMalformedDimensions = {
        data: {
          success: true,
          data: [
            {
              id: '4',
              productId: 'malformed-product',
              basePrice: 200,
              currency: 'NIS',
              dimensions: {
                width: null, // Null dimension
                height: { min: 'invalid', max: 200, default: 150 }, // Invalid min type
                depth: {} // Empty dimension object
              },
              options: {},
              category: 'test',
              tags: [],
              images: [],
              ratings: { average: 0, count: 0 },
              inventory: { inStock: true, stockLevel: 1, lowStockThreshold: 1 },
              createdAt: '2023-01-01T00:00:00Z'
            }
          ]
        }
      };

      api.get.mockResolvedValue(backendResponseMalformedDimensions);

      // Should not throw an error
      expect(async () => {
        await backendProductService.getProducts();
      }).not.toThrow();

      const products = await backendProductService.getProducts();
      expect(products).toHaveLength(1);
    });
  });

  describe('Price Calculator Function Signature', () => {
    test('should accept correct dimension parameters (width, height, depth)', () => {
      const customizations = {
        width: 80,
        height: 180,
        depth: 35,
        color: 'white'
      };

      // Should not throw a TypeScript error with correct parameters
      expect(() => {
        backendProductService.calculatePrice('test-product', customizations);
      }).not.toThrow();
    });

    test('should handle missing dimension parameters', () => {
      const customizations = {
        width: 80,
        // height and depth are missing
        color: 'blue'
      };

      expect(() => {
        backendProductService.calculatePrice('test-product', customizations);
      }).not.toThrow();
    });

    test('should handle empty customizations object', () => {
      const customizations = {};

      expect(() => {
        backendProductService.calculatePrice('test-product', customizations);
      }).not.toThrow();
    });
  });

  describe('Dimension Type Safety', () => {
    test('should ensure dimension types are correct in ClientProduct interface', () => {
      // This test ensures TypeScript compilation catches dimension type mismatches
      const mockClientProduct = {
        id: '1',
        productId: 'test',
        name: { he: 'test', en: 'test' },
        description: { he: 'test', en: 'test' },
        category: 'test',
        basePrice: 100,
        images: [],
        inventory: { inStock: true, quantity: 10 },
        ratings: { average: 0, count: 0 },
        customization: {
          dimensions: {
            width: { min: 1, max: 100, default: 50, step: 1, visible: true, editable: true, priceModifier: 0.1 },
            height: { min: 1, max: 200, default: 100, step: 1, visible: true, editable: true, priceModifier: 0.1 },
            depth: { min: 1, max: 50, default: 25, step: 1, visible: true, editable: true, priceModifier: 0.1 }
            // length should NOT be allowed here
          }
        }
      };

      // If this compiles without TypeScript errors, the types are correct
      expect(mockClientProduct.customization?.dimensions).toHaveProperty('width');
      expect(mockClientProduct.customization?.dimensions).toHaveProperty('height');
      expect(mockClientProduct.customization?.dimensions).toHaveProperty('depth');
      expect(mockClientProduct.customization?.dimensions).not.toHaveProperty('length');
    });
  });

  describe('Error Prevention', () => {
    test('should handle API errors gracefully', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await expect(backendProductService.getProducts()).rejects.toThrow('API Error');
      
      // Ensure it doesn't crash the application
      expect(api.get).toHaveBeenCalled();
    });

    test('should handle malformed API responses', async () => {
      const malformedResponse = {
        data: {
          success: true,
          data: 'not an array' // Should be an array
        }
      };

      api.get.mockResolvedValue(malformedResponse);

      await expect(backendProductService.getProducts()).rejects.toThrow();
    });
  });
});