import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminProducts from '../AdminProducts';

// Mock the backend service
jest.mock('../../services/backendProductService', () => ({
  backendProductService: {
    getProducts: jest.fn(),
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  }
}));

// Mock Material-UI components that might cause issues in tests
jest.mock('@mui/material/Dialog', () => {
  return function MockDialog({ children, open }: { children: React.ReactNode; open: boolean }) {
    return open ? <div data-testid="dialog">{children}</div> : null;
  };
});

describe('AdminProducts', () => {
  const mockProduct = {
    id: '1',
    productId: 'amsterdam-bookshelf',
    name: { he: 'ספרייה אמסטרדם', en: 'Amsterdam Bookshelf' },
    description: { he: 'תיאור', en: 'Description' },
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
    tags: ['modern'],
    images: [{ url: 'test.jpg', alt: 'Test', isPrimary: true }],
    inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
    ratings: { average: 4.5, count: 10 }
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful authentication
    const { backendProductService } = require('../../services/backendProductService');
    backendProductService.getProducts.mockResolvedValue([mockProduct]);
  });

  describe('Dimension Handling', () => {
    test('should handle products with correct dimensions (width, height, depth)', async () => {
      render(<AdminProducts />);
      
      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('ספרייה אמסטרדם')).toBeInTheDocument();
      });

      // Click edit button to open dialog
      const editButton = screen.getByLabelText(/edit/i);
      fireEvent.click(editButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Check that all three dimensions are rendered without errors
      expect(screen.getByDisplayValue('60')).toBeInTheDocument(); // width min
      expect(screen.getByDisplayValue('120')).toBeInTheDocument(); // width max
      expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // height min
      expect(screen.getByDisplayValue('250')).toBeInTheDocument(); // height max
      expect(screen.getByDisplayValue('25')).toBeInTheDocument(); // depth min
      expect(screen.getByDisplayValue('40')).toBeInTheDocument(); // depth max
    });

    test('should handle products with missing dimensions gracefully', async () => {
      const productWithMissingDimensions = {
        ...mockProduct,
        dimensions: {
          width: { min: 60, max: 120, default: 80, multiplier: 0.3 }
          // height and depth are missing
        }
      };

      const { backendProductService } = require('../../services/backendProductService');
      backendProductService.getProducts.mockResolvedValue([productWithMissingDimensions]);

      render(<AdminProducts />);
      
      await waitFor(() => {
        expect(screen.getByText('ספרייה אמסטרדם')).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/edit/i);
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Should show 0 for missing dimensions (safe fallback)
      const inputs = screen.getAllByDisplayValue('0');
      expect(inputs.length).toBeGreaterThan(0); // Should have fallback values for missing dimensions
    });

    test('should handle completely missing dimensions object', async () => {
      const productWithoutDimensions = {
        ...mockProduct,
        dimensions: undefined
      };

      const { backendProductService } = require('../../services/backendProductService');
      backendProductService.getProducts.mockResolvedValue([productWithoutDimensions]);

      render(<AdminProducts />);
      
      await waitFor(() => {
        expect(screen.getByText('ספרייה אמסטרדם')).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/edit/i);
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Should not crash and show fallback values
      const inputs = screen.getAllByDisplayValue('0');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Price Calculator', () => {
    test('should calculate price correctly with all dimensions', async () => {
      render(<AdminProducts />);
      
      await waitFor(() => {
        expect(screen.getByText('ספרייה אמסטרדם')).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/edit/i);
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Should show calculated price without errors
      expect(screen.getByText(/תצוגה מקדימה של מחיר/)).toBeInTheDocument();
      expect(screen.getByText(/₪/)).toBeInTheDocument();
    });

    test('should handle price calculation with missing dimensions', async () => {
      const productWithPartialDimensions = {
        ...mockProduct,
        dimensions: {
          width: { min: 60, max: 120, default: 80, multiplier: 0.3 }
          // Only width dimension available
        }
      };

      const { backendProductService } = require('../../services/backendProductService');
      backendProductService.getProducts.mockResolvedValue([productWithPartialDimensions]);

      render(<AdminProducts />);
      
      await waitFor(() => {
        expect(screen.getByText('ספרייה אמסטרדם')).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/edit/i);
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Should calculate price without crashing
      expect(screen.getByText(/תצוגה מקדימה של מחיר/)).toBeInTheDocument();
    });
  });

  describe('Dimension Updates', () => {
    test('should update dimension values correctly', async () => {
      render(<AdminProducts />);
      
      await waitFor(() => {
        expect(screen.getByText('ספרייה אמסטרדם')).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/edit/i);
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Update width minimum value
      const widthMinInput = screen.getByDisplayValue('60');
      fireEvent.change(widthMinInput, { target: { value: '70' } });

      expect(widthMinInput).toHaveValue(70);
    });
  });

  describe('Error Prevention', () => {
    test('should not crash with malformed product data', async () => {
      const malformedProduct = {
        id: '1',
        productId: 'test-product',
        name: null, // Malformed name
        basePrice: 'invalid', // Invalid price type
        dimensions: {
          width: null, // Null dimension
          height: { min: 'invalid' }, // Invalid min type
          depth: {} // Empty dimension object
        }
      };

      const { backendProductService } = require('../../services/backendProductService');
      backendProductService.getProducts.mockResolvedValue([malformedProduct]);

      // Should not throw an error
      expect(() => {
        render(<AdminProducts />);
      }).not.toThrow();
    });
  });
});