// Backend API integration for products
import { api } from './api';

// Backend API interfaces - based on actual API response
interface BackendProduct {
  _id?: string;
  id?: string;
  productId: string;
  name?: any; // Can be string or object with language translations
  description?: any; // Can be string or object with language translations
  shortDescription?: any; // Can be string or object with language translations
  fullDescription?: any; // Can be string or object with language translations
  basePrice: number;
  currency: string;
  dimensions: {
    [key: string]: {
      min: number;
      max: number;
      default: number;
      multiplier: number;
      step?: number;
      visible?: boolean;
      editable?: boolean;
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
  shortDescription: { he: string; en: string };
  fullDescription: { he: string; en: string };
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
            step: config.step || 1,
            visible: config.visible !== false,
            editable: config.editable !== false,
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

    // Use backend name field if available, otherwise fallback to productId mapping
    const productNames = this.getProductNames(backendProduct.productId, backendProduct.name);
    const productDescriptions = this.getProductDescriptions(backendProduct.productId, backendProduct.description);
    const productShortDescriptions = this.getProductDescriptions(backendProduct.productId, backendProduct.shortDescription);
    const productFullDescriptions = this.getProductDescriptions(backendProduct.productId, backendProduct.fullDescription);

    return {
      id: backendProduct.id || '',
      productId: backendProduct.productId || '',
      name: productNames,
      description: productDescriptions,
      shortDescription: productShortDescriptions,
      fullDescription: productFullDescriptions,
      category: backendProduct.category || '',
      basePrice: backendProduct.basePrice || 0,
      images: (backendProduct.images || [])
        .map(img => ({
          url: img?.url || '',
          isPrimary: img?.isPrimary || false
        }))
        .filter(img => img.url && img.url.trim() !== '') // Remove empty URLs
        .concat(backendProduct.images?.length === 0 ? [{ // Add placeholder if no images
          url: 'https://via.placeholder.com/400x300?text=No+Image',
          isPrimary: true
        }] : []),
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

  // Helper function to get Hebrew/English names from backend data or productId fallback
  private getProductNames(productId: string, backendName?: any): { he: string; en: string } {
    // If backend provides structured name data, use it
    if (backendName && typeof backendName === 'object') {
      return {
        he: backendName.he || backendName.Hebrew || '',
        en: backendName.en || backendName.English || ''
      };
    }
    
    // If backend provides a simple string name, use it for Hebrew and try to create English
    if (backendName && typeof backendName === 'string' && backendName.trim() !== '') {
      return {
        he: backendName.trim(),
        en: backendName.trim() // For now, use same name for both languages
      };
    }
    
    // Fallback to hardcoded mapping for known productIds
    const nameMap: { [key: string]: { he: string; en: string } } = {
      'amsterdam-bookshelf': { he: 'ספרייה אמסטרדם', en: 'Amsterdam Bookshelf' },
      'venice-bookshelf': { he: 'ספרייה ונציה', en: 'Venice Bookshelf' },
      'garden-bench': { he: 'ספסל גן', en: 'Garden Bench' },
      'stairs': { he: 'מדרגות מותאמות', en: 'Custom Stairs' },
      'dog-bed': { he: 'מיטת כלב', en: 'Dog Bed' },
      'wooden-planter': { he: 'עציץ עץ', en: 'Wooden Planter' },
      'test-steps': { he: 'מדרגות מבחן', en: 'Test Steps' }
    };
    
    return nameMap[productId] || { he: 'מוצר ללא שם', en: 'Unnamed Product' };
  }

  // Helper function to get Hebrew/English descriptions from backend data or productId fallback
  private getProductDescriptions(productId: string, backendDescription?: any): { he: string; en: string } {
    // If backend provides structured description data, use it
    if (backendDescription && typeof backendDescription === 'object') {
      return {
        he: backendDescription.he || backendDescription.Hebrew || '',
        en: backendDescription.en || backendDescription.English || ''
      };
    }
    
    // If backend provides a simple string description, use it for Hebrew and try to create English
    if (backendDescription && typeof backendDescription === 'string' && backendDescription.trim() !== '') {
      return {
        he: backendDescription.trim(),
        en: backendDescription.trim() // For now, use same description for both languages
      };
    }
    
    // Fallback to hardcoded mapping for known productIds
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
      },
      'test-steps': {
        he: 'מוצר מדרגות מבחן עם קביעת מידות נכונה לבדיקת אינטגרציה בין אדמין ולקוח.',
        en: 'Test steps product with proper dimension configuration for testing admin/client integration.'
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

  // Calculate price using backend API
  async calculatePrice(productId: string, customizations: { 
    width?: number; 
    height?: number; 
    depth?: number; 
    length?: number; // Support old format for stairs
    steps?: number;  // Support steps for stairs
    color?: string 
  }): Promise<number> {
    try {
      const response = await api.post<{
        success: boolean;
        data: {
          pricing: {
            totalPrice: number;
            basePrice: number;
            sizeAdjustment: number;
            colorCost: number;
            optionsCost: number;
          };
        };
      }>(`/products/${productId}/calculate-price`, {
        configuration: {
          dimensions: customizations,
          color: customizations.color
        }
      });

      if (response.success && response.data?.pricing) {
        return response.data.pricing.totalPrice;
      }

      // Fallback to simplified frontend calculation if backend fails
      console.warn('Backend price calculation failed, using fallback');
      return this.fallbackCalculatePrice(productId, customizations);
    } catch (error) {
      console.error('Backend price calculation error:', error);
      return this.fallbackCalculatePrice(productId, customizations);
    }
  }

  // Fallback price calculation for when backend is unavailable
  private fallbackCalculatePrice(productId: string, customizations: { 
    width?: number; 
    height?: number; 
    depth?: number; 
    length?: number;
    steps?: number;
    color?: string 
  }): number {
    try {
      // Base prices for known products
      const productPrices: { [key: string]: { basePrice: number, dimensions: any } } = {
        'amsterdam-bookshelf': { 
          basePrice: 199, 
          dimensions: {
            width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
            height: { min: 100, max: 250, default: 180, multiplier: 0.5 },
            depth: { min: 25, max: 40, default: 30, multiplier: 0.4 }
          }
        },
        'venice-bookshelf': {
          basePrice: 249,
          dimensions: {
            width: { min: 70, max: 140, default: 90, multiplier: 0.35 },
            height: { min: 120, max: 300, default: 200, multiplier: 0.4 }
          }
        },
        'stairs': {
          basePrice: 299,
          dimensions: {
            length: { min: 150, max: 400, default: 250, multiplier: 0.8 },
            width: { min: 60, max: 120, default: 80, multiplier: 0.5 },
            height: { min: 50, max: 150, default: 100, multiplier: 0.6 },
            steps: { min: 3, max: 12, default: 6, multiplier: 15 }
          }
        },
        'test-steps': {
          basePrice: 150,
          dimensions: {
            width: { min: 30, max: 100, default: 60, multiplier: 0.4 },
            height: { min: 20, max: 80, default: 40, multiplier: 0.3 },
            steps: { min: 2, max: 8, default: 4, multiplier: 20 }
          }
        }
      };

      const productData = productPrices[productId];
      if (!productData) {
        console.warn(`No fallback price data for product: ${productId}`);
        return 0;
      }

      let totalPrice = productData.basePrice;
      let sizeAdjustment = 0;

      // Calculate size adjustments
      if (productData.dimensions && customizations) {
        Object.keys(customizations).forEach(key => {
          const dimensionValue = (customizations as any)[key];
          if (productData.dimensions[key] && typeof dimensionValue === 'number') {
            const difference = dimensionValue - productData.dimensions[key].default;
            sizeAdjustment += difference * productData.dimensions[key].multiplier;
          }
        });
      }

      totalPrice += sizeAdjustment;

      // Add color cost (40% increase for non-natural colors)
      let colorCost = 0;
      if (customizations.color && customizations.color !== 'ללא צבע' && customizations.color !== 'natural') {
        colorCost = Math.round(totalPrice * 0.4);
      }

      totalPrice += colorCost;

      return Math.max(Math.round(totalPrice), 0);
    } catch (error) {
      console.error('Fallback price calculation error:', error);
      return 0;
    }
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
      // Map _id to id for frontend compatibility
      return response.products.map((product: any) => ({
        ...product,
        id: product._id || product.id
      }));
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