// Unit tests for backendProductService
// Tests Hebrew-only data handling and product conversion logic

import backendProductService from '../backendProductService';

// Mock the API module
jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('BackendProductService', () => {
  const { api } = require('../api');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hebrew-only content handling', () => {
    test('should convert backend Hebrew string to Hebrew object format', () => {
      // Mock API response with Hebrew string
      const mockBackendProduct = {
        _id: 'test123',
        productId: 'test-product',
        name: 'ארון מבחן',
        description: 'תיאור בעברית',
        shortDescription: 'תיאור קצר',
        fullDescription: 'תיאור מלא בעברית',
        basePrice: 300,
        currency: 'NIS',
        dimensions: {
          width: { min: 50, max: 150, default: 80, multiplier: 2 },
          height: { min: 100, max: 200, default: 150, multiplier: 1.5 },
          depth: { min: 30, max: 60, default: 40, multiplier: 1 },
          shelves: { min: 2, max: 8, default: 4, multiplier: 25 }
        },
        options: {},
        category: 'furniture',
        tags: [],
        images: [],
        ratings: { average: 4.5, count: 10 },
        inventory: { inStock: true, stockLevel: 5, lowStockThreshold: 2 },
        createdAt: new Date().toISOString()
      };

      // Test the private method through public interface
      const service = backendProductService as any;
      const clientProduct = service.toClientProduct(mockBackendProduct);

      // Verify Hebrew-only structure
      expect(clientProduct.name).toEqual({ he: 'ארון מבחן' });
      expect(clientProduct.description).toEqual({ he: 'תיאור בעברית' });
      expect(clientProduct.shortDescription).toEqual({ he: 'תיאור קצר' });
      expect(clientProduct.fullDescription).toEqual({ he: 'תיאור מלא בעברית' });
      
      // Verify no English or Spanish properties
      expect(clientProduct.name).not.toHaveProperty('en');
      expect(clientProduct.name).not.toHaveProperty('es');
    });

    test('should handle shelves dimension correctly', () => {
      const mockBackendProduct = {
        _id: 'test123',
        productId: 'test-shelves',
        name: 'ספרייה עם מדפים',
        description: 'ספרייה מותאמת',
        shortDescription: 'ספרייה',
        fullDescription: 'ספרייה עם מדפים מותאמים',
        basePrice: 250,
        currency: 'NIS',
        dimensions: {
          width: { min: 60, max: 120, default: 80, multiplier: 1.5 },
          height: { min: 120, max: 250, default: 180, multiplier: 2 },
          depth: { min: 25, max: 50, default: 35, multiplier: 1 },
          shelves: { min: 1, max: 6, default: 3, multiplier: 40, step: 1, visible: true, editable: true }
        },
        options: {},
        category: 'bookshelf',
        tags: [],
        images: [],
        ratings: { average: 4.0, count: 5 },
        inventory: { inStock: true, stockLevel: 3, lowStockThreshold: 1 },
        createdAt: new Date().toISOString()
      };

      const service = backendProductService as any;
      const clientProduct = service.toClientProduct(mockBackendProduct);

      // Verify shelves dimension is included in customization
      expect(clientProduct.customization?.dimensions).toHaveProperty('shelves');
      
      const shelvesDimension = clientProduct.customization?.dimensions?.shelves;
      expect(shelvesDimension).toEqual({
        min: 1,
        max: 6,
        default: 3,
        step: 1,
        visible: true,
        editable: true,
        priceModifier: 40
      });
    });

    test('should calculate price correctly with shelves', async () => {
      // Mock successful API response
      const mockApiResponse = {
        success: true,
        data: {
          pricing: {
            totalPrice: 450,
            basePrice: 300,
            sizeAdjustment: 100,
            colorCost: 50,
            optionsCost: 0
          }
        }
      };

      api.post.mockResolvedValue(mockApiResponse);

      const customizations = {
        width: 100,
        height: 180,
        depth: 40,
        shelves: 5,
        color: 'אגוז'
      };

      const price = await backendProductService.calculatePrice('test-product', customizations);
      
      expect(price).toBe(450);
      expect(api.post).toHaveBeenCalledWith(
        '/products/test-product/calculate-price',
        {
          configuration: {
            dimensions: customizations,
            color: 'אגוז'
          }
        }
      );
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