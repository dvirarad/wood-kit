// Backend API integration for products
import { api } from './api';

// Backend API interfaces
interface BackendProduct {
  id: string;
  productId: string;
  name: { he: string; en: string };
  description: { he: string; en: string };
  category: string;
  basePrice: number;
  currency: string;
  dimensions: {
    [key: string]: {
      min: number;
      max: number;
      default: number;
      multiplier: number;
    };
  };
  options: {
    [key: string]: {
      available: boolean;
      price: number;
    };
  };
  tags: string[];
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  isActive: boolean;
  inventory: {
    inStock: boolean;
    stockLevel: number;
    lowStockThreshold: number;
  };
  ratings: {
    average: number;
    count: number;
  };
}

// Convert backend product to frontend format
export interface ClientProduct {
  id: string;
  productId: string;
  name: { he: string; en: string };
  description: { he: string; en: string };
  category: string;
  basePrice: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  inventory: {
    inStock: boolean;
    quantity: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  customization?: {
    dimensions: {
      length?: DimensionConfig;
      width?: DimensionConfig;
      height?: DimensionConfig;
    };
    colorOptions?: ColorConfig;
  };
}

interface DimensionConfig {
  min: number;
  max: number;
  default: number;
  step: number;
  visible: boolean;
  editable: boolean;
  priceModifier: number;
}

interface ColorConfig {
  enabled: boolean;
  priceModifier: number;
  options: string[];
}

class BackendProductService {
  private listeners: Array<() => void> = [];

  // Convert backend product to frontend format
  private toClientProduct(backendProduct: BackendProduct): ClientProduct {
    // Convert backend dimensions to frontend format
    const dimensions: { [key: string]: DimensionConfig } = {};
    Object.entries(backendProduct.dimensions).forEach(([key, config]) => {
      dimensions[key] = {
        min: config.min,
        max: config.max,
        default: config.default,
        step: 5, // Default step
        visible: true,
        editable: true,
        priceModifier: config.multiplier
      };
    });

    // Add default color options
    const colorOptions: ColorConfig = {
      enabled: true,
      priceModifier: 0.4, // 40% increase
      options: ['ללא צבע', 'דובדבן', 'אגוז', 'לבן', 'שחור', 'אלון', 'מייפל', 'ירוק', 'אפור']
    };

    return {
      id: backendProduct.id,
      productId: backendProduct.productId,
      name: backendProduct.name,
      description: backendProduct.description,
      category: backendProduct.category,
      basePrice: backendProduct.basePrice,
      images: backendProduct.images.map(img => ({
        url: img.url,
        isPrimary: img.isPrimary
      })),
      inventory: {
        inStock: backendProduct.inventory.inStock,
        quantity: backendProduct.inventory.stockLevel
      },
      ratings: backendProduct.ratings,
      customization: {
        dimensions,
        colorOptions
      }
    };
  }

  // Event listener system for real-time updates
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Client methods - get products from backend API
  async getClientProducts(options?: { language?: string; limit?: number }): Promise<ClientProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.language) queryParams.append('language', options.language);
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      
      const response = await api.get<{
        success: boolean;
        data: BackendProduct[];
        pagination: any;
      }>(`/products?${queryParams.toString()}`);
      
      return response.data.map(this.toClientProduct);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  async getClientProduct(id: string): Promise<ClientProduct | null> {
    try {
      const product = await api.get<BackendProduct>(`/products/${id}`);
      return this.toClientProduct(product);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      return null;
    }
  }

  // Calculate price based on customizations (frontend calculation for now)
  calculatePrice(productId: string, customizations: { 
    length?: number; 
    width?: number; 
    height?: number; 
    color?: string 
  }): number {
    // For now, use frontend calculation
    // TODO: Could be moved to backend API call in the future
    return 0; // Placeholder - will need to implement based on backend logic
  }

  // Admin methods - manage products via backend API
  async getAllProducts(): Promise<any[]> {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get<{products: BackendProduct[]}>('/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.products;
    } catch (error) {
      console.error('Failed to fetch admin products:', error);
      return [];
    }
  }

  async addProduct(productData: any): Promise<any> {
    try {
      const token = localStorage.getItem('adminToken');
      const product = await api.post<BackendProduct>('/admin/products', productData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      this.notifyListeners();
      return product;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: any): Promise<any> {
    try {
      const token = localStorage.getItem('adminToken');
      const product = await api.put<BackendProduct>(`/admin/products/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      this.notifyListeners();
      return product;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      return false;
    }
  }
}

// Create singleton instance
export const backendProductService = new BackendProductService();
export default backendProductService;