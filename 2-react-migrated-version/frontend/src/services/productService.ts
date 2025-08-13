import { api } from './api';

export interface Product {
  id: string;
  productId: string;
  name: {
    en: string;
    he: string;
    es?: string;
  };
  description: {
    en: string;
    he: string;
    es?: string;
  };
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
    lacquer?: {
      available: boolean;
      price: number;
    };
    handrail?: {
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

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta: {
    language: string;
    resultsPerPage: number;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
  meta: {
    language: string;
  };
}

export interface PriceCalculationRequest {
  dimensions: {
    [key: string]: number;
  };
  options?: {
    [key: string]: boolean;
  };
}

export interface PriceCalculationResponse {
  success: boolean;
  data: {
    productId: string;
    pricing: {
      basePrice: number;
      sizeAdjustment: number;
      colorCost?: number;
      lacquerCost?: number;
      handrailCost?: number;
      totalPrice: number;
    };
    currency: string;
  };
}

class ProductService {
  async getProducts(params?: {
    category?: string;
    active?: string;
    language?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return api.get<ProductsResponse>(endpoint);
  }

  async getProduct(productId: string, language: string = 'he'): Promise<SingleProductResponse> {
    return api.get<SingleProductResponse>(`/products/${productId}?language=${language}`);
  }

  async calculatePrice(productId: string, data: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return api.post<PriceCalculationResponse>(`/products/${productId}/calculate-price`, data);
  }

  async getCategories(): Promise<{ success: boolean; data: string[] }> {
    return api.get<{ success: boolean; data: string[] }>('/products/meta/categories');
  }
}

export const productService = new ProductService();