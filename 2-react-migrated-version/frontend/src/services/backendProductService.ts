// Backend API integration for products
import { api } from './api';

// Backend API interfaces - based on actual API response
interface BackendProduct {
  id: string;
  productId: string;
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
  category: string;
  tags: string[];
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
    _id?: string;
  }>;
  ratings: {
    average: number;
    count: number;
  };
  inventory: {
    inStock: boolean;
    stockLevel: number;
    lowStockThreshold: number;
  };
  createdAt: string;
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
      width?: DimensionConfig;
      height?: DimensionConfig;
      depth?: DimensionConfig;
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
    // Convert backend dimensions to frontend format - handle missing dimensions
    const dimensions: { [key: string]: DimensionConfig } = {};
    if (backendProduct.dimensions && typeof backendProduct.dimensions === 'object') {
      Object.entries(backendProduct.dimensions).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          dimensions[key] = {
            min: config.min || 0,
            max: config.max || 100,
            default: config.default || 50,
            step: 5, // Default step
            visible: true,
            editable: true,
            priceModifier: config.multiplier || 0
          };
        }
      });
    }

    // Add default color options
    const colorOptions: ColorConfig = {
      enabled: true,
      priceModifier: 0.4, // 40% increase
      options: ['ללא צבע', 'דובדבן', 'אגוז', 'לבן', 'שחור', 'אלון', 'מייפל', 'ירוק', 'אפור']
    };

    // Create Hebrew names from productId since backend doesn't have localized names
    const productNames = this.getProductNames(backendProduct.productId);
    const productDescriptions = this.getProductDescriptions(backendProduct.productId);

    return {
      id: backendProduct.id || '',
      productId: backendProduct.productId || '',
      name: productNames,
      description: productDescriptions,
      category: backendProduct.category || '',
      basePrice: backendProduct.basePrice || 0,
      images: (backendProduct.images || []).map(img => ({
        url: img?.url || '',
        isPrimary: img?.isPrimary || false
      })),
      inventory: {
        inStock: backendProduct.inventory?.inStock || false,
        quantity: backendProduct.inventory?.stockLevel || 0
      },
      ratings: {
        average: backendProduct.ratings?.average || 0,
        count: backendProduct.ratings?.count || 0
      },
      customization: {
        dimensions,
        colorOptions
      }
    };
  }

  // Helper function to get Hebrew/English names from productId
  private getProductNames(productId: string): { he: string; en: string } {
    const nameMap: { [key: string]: { he: string; en: string } } = {
      'amsterdam-bookshelf': { he: 'ספרייה אמסטרדם', en: 'Amsterdam Bookshelf' },
      'venice-bookshelf': { he: 'ספרייה ונציה', en: 'Venice Bookshelf' },
      'garden-bench': { he: 'ספסל גן', en: 'Garden Bench' },
      'stairs': { he: 'מדרגות מותאמות', en: 'Custom Stairs' },
      'dog-bed': { he: 'מיטת כלב', en: 'Dog Bed' },
      'wooden-planter': { he: 'עציץ עץ', en: 'Wooden Planter' }
    };
    
    return nameMap[productId] || { he: productId, en: productId };
  }

  // Helper function to get Hebrew/English descriptions from productId
  private getProductDescriptions(productId: string): { he: string; en: string } {
    const descMap: { [key: string]: { he: string; en: string } } = {
      'amsterdam-bookshelf': { 
        he: 'ספרייה מודרנית עם קווים נקיים. התאימו גובה ורוחב כדי להתאים לחלל שלכם בצורה מושלמת.', 
        en: 'Modern bookshelf with clean lines. Customize height and width to fit your space perfectly.' 
      },
      'venice-bookshelf': { 
        he: 'ספרייה בעיצוב קלאסי עם קימורים אלגנטיים. בחרו את המידות שלכם להתאמה מושלמת.', 
        en: 'Classic design bookshelf with elegant curves. Choose your dimensions for the perfect fit.' 
      },
      'garden-bench': { 
        he: 'ספסל גן מעץ מלא עמיד בפני מזג אוויר', 
        en: 'Weather-resistant solid wood garden bench' 
      },
      'stairs': { 
        he: 'מדרגות עץ לשימוש פנימי. מידות הניתנות להתאמה מלאה עם מעקה אופציונלי.', 
        en: 'Wooden stairs for indoor use. Fully customizable dimensions with optional handrail.' 
      },
      'dog-bed': { 
        he: 'מיטה נוחה וחמה לכלב שלכם', 
        en: 'Comfortable and warm bed for your dog' 
      },
      'wooden-planter': { 
        he: 'עציץ עץ מעוצב לגינה שלכם', 
        en: 'Designed wooden planter for your garden' 
      }
    };
    
    return descMap[productId] || { he: 'תיאור המוצר', en: 'Product description' };
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
      
      console.log('Raw API response:', response);
      console.log('Raw API data:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid API response format:', response);
        return [];
      }
      
      const convertedProducts = response.data.map((product, index) => {
        console.log(`Converting product ${index}:`, product);
        const converted = this.toClientProduct(product);
        console.log(`Converted product ${index}:`, converted);
        return converted;
      });
      
      return convertedProducts;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  async getClientProduct(id: string): Promise<ClientProduct | null> {
    try {
      const response = await api.get<{
        success: boolean;
        data: BackendProduct;
        meta?: any;
      }>(`/products/${id}`);
      
      console.log('Raw product API response:', response);
      
      if (!response.success || !response.data) {
        console.error('Invalid product API response format:', response);
        return null;
      }
      
      const converted = this.toClientProduct(response.data);
      console.log('Converted product:', converted);
      return converted;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      return null;
    }
  }

  // Calculate price based on customizations (frontend calculation for now)
  calculatePrice(productId: string, customizations: { 
    width?: number; 
    height?: number; 
    depth?: number; 
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