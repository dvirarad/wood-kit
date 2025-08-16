// Shared product management service that connects admin and client
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
  priceModifier: number; // 0.4 for 40% increase
  options: string[];
}

export interface ManagedProduct {
  id: string;
  name: { he: string; en: string };
  description: { he: string; en: string };
  category: string;
  basePrice: number;
  dimensions: {
    length: DimensionConfig;
    width: DimensionConfig;
    height: DimensionConfig;
  };
  colorOptions?: ColorConfig;
  images: Array<{ url: string; isPrimary: boolean }>;
  inventory: {
    inStock: boolean;
    quantity: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Convert ManagedProduct to the format expected by client-side Product interface
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
  // Add dimension configuration for product customization
  customization?: {
    dimensions: {
      length?: DimensionConfig;
      width?: DimensionConfig;
      height?: DimensionConfig;
    };
    colorOptions?: ColorConfig;
  };
}

class ProductManagerService {
  private readonly STORAGE_KEY = 'wood_kits_products';
  private products: ManagedProduct[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
    // Initialize with some default products if none exist
    if (this.products.length === 0) {
      this.initializeDefaultProducts();
    }
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

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.products = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      this.products = [];
    }
  }

  private initializeDefaultProducts() {
    const defaultProducts: ManagedProduct[] = [
      {
        id: '1',
        name: { he: 'ארון ספרים אמסטרדם', en: 'Amsterdam Bookshelf' },
        description: { he: 'ארון ספרים יפה ומעוצב מעץ מלא', en: 'Beautiful designed solid wood bookshelf' },
        category: 'furniture',
        basePrice: 800,
        dimensions: {
          length: { min: 60, max: 200, default: 120, step: 10, visible: true, editable: true, priceModifier: 2.5 },
          width: { min: 20, max: 50, default: 30, step: 5, visible: true, editable: true, priceModifier: 3.0 },
          height: { min: 80, max: 220, default: 180, step: 10, visible: true, editable: true, priceModifier: 2.0 }
        },
        colorOptions: {
          enabled: true,
          priceModifier: 0.4,
          options: ['ללא צבע', 'דובדבן', 'אגוז', 'לבן', 'שחור', 'אלון', 'מייפל', 'ירוק', 'אפור']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500', isPrimary: false }
        ],
        inventory: { inStock: true, quantity: 10 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: { he: 'ספסל גן', en: 'Garden Bench' },
        description: { he: 'ספסל גן מעץ מלא עמיד בפני מזג אוויר', en: 'Weather-resistant solid wood garden bench' },
        category: 'גן',
        basePrice: 600,
        dimensions: {
          length: { min: 100, max: 180, default: 150, step: 10, visible: true, editable: true, priceModifier: 2.0 },
          width: { min: 35, max: 50, default: 40, step: 5, visible: true, editable: false, priceModifier: 1.5 },
          height: { min: 40, max: 50, default: 45, step: 2, visible: false, editable: false, priceModifier: 1.0 }
        },
        colorOptions: {
          enabled: true,
          priceModifier: 0.4,
          options: ['ללא צבע', 'דובדבן', 'אגוז', 'לבן', 'שחור', 'אלון', 'מייפל', 'ירוק', 'אפור']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500', isPrimary: true }
        ],
        inventory: { inStock: true, quantity: 5 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: { he: 'מיטת כלב מעוצבת', en: 'Designer Dog Bed' },
        description: { he: 'מיטה נוחה וחמה לכלב שלכם', en: 'Comfortable and warm bed for your dog' },
        category: 'חיות מחמד',
        basePrice: 320,
        dimensions: {
          length: { min: 40, max: 100, default: 70, step: 5, visible: true, editable: true, priceModifier: 1.5 },
          width: { min: 30, max: 80, default: 50, step: 5, visible: true, editable: true, priceModifier: 1.5 },
          height: { min: 10, max: 20, default: 15, step: 2, visible: false, editable: false, priceModifier: 2.0 }
        },
        colorOptions: {
          enabled: true,
          priceModifier: 0.4,
          options: ['ללא צבע', 'דובדבן', 'אגוז', 'לבן', 'שחור', 'אלון', 'מייפל', 'ירוק', 'אפור']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500', isPrimary: true }
        ],
        inventory: { inStock: true, quantity: 8 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.products = defaultProducts;
    this.saveToStorage();
  }

  // Admin methods
  getAllProducts(): ManagedProduct[] {
    return [...this.products];
  }

  getProduct(id: string): ManagedProduct | null {
    return this.products.find(p => p.id === id) || null;
  }

  addProduct(product: Omit<ManagedProduct, 'id' | 'createdAt' | 'updatedAt'>): ManagedProduct {
    const newProduct: ManagedProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.push(newProduct);
    this.saveToStorage();
    this.notifyListeners();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Omit<ManagedProduct, 'id' | 'createdAt'>>): ManagedProduct | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage();
    this.notifyListeners();
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  // Client methods - convert to format expected by existing product service
  getClientProducts(options?: { language?: string; limit?: number }): ClientProduct[] {
    let products = this.products.filter(p => p.inventory.inStock);

    if (options?.limit) {
      products = products.slice(0, options.limit);
    }

    return products.map(this.toClientProduct);
  }

  getClientProduct(id: string): ClientProduct | null {
    const product = this.products.find(p => p.id === id);
    return product ? this.toClientProduct(product) : null;
  }

  private toClientProduct(managedProduct: ManagedProduct): ClientProduct {
    return {
      id: managedProduct.id,
      productId: managedProduct.id,
      name: managedProduct.name,
      description: managedProduct.description,
      category: managedProduct.category,
      basePrice: managedProduct.basePrice,
      images: managedProduct.images,
      inventory: managedProduct.inventory,
      ratings: {
        average: 4.5, // Default rating
        count: Math.floor(Math.random() * 50) + 10 // Random review count
      },
      customization: {
        dimensions: managedProduct.dimensions,
        colorOptions: managedProduct.colorOptions
      }
    };
  }

  // Calculate price based on customizations
  calculatePrice(productId: string, customizations: { length?: number; width?: number; height?: number; color?: string }): number {
    const product = this.getProduct(productId);
    if (!product) return 0;

    let totalPrice = product.basePrice;

    // Add costs for each dimension
    Object.entries(customizations).forEach(([dimension, value]) => {
      if (dimension !== 'color' && typeof value === 'number' && product.dimensions[dimension as keyof typeof product.dimensions]) {
        const config = product.dimensions[dimension as keyof typeof product.dimensions];
        const extraUnits = Math.max(0, value - config.min);
        totalPrice += extraUnits * config.priceModifier;
      }
    });

    // Add color cost (40% increase if color is selected and not "ללא צבע")
    if (customizations.color && product.colorOptions?.enabled && customizations.color !== 'ללא צבע') {
      totalPrice += totalPrice * product.colorOptions.priceModifier;
    }

    return totalPrice;
  }
}

// Create singleton instance
export const productManager = new ProductManagerService();
export default productManager;