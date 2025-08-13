import { api } from './api';

export interface OrderItem {
  productId: string;
  configuration: {
    dimensions: {
      [key: string]: number;
    };
    options: {
      [key: string]: boolean;
    };
  };
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateOrderRequest {
  customer: Customer;
  items: OrderItem[];
  notes?: string;
  language?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customer: Customer;
  items: Array<{
    product: string;
    productId: string;
    name: string;
    configuration: {
      dimensions: { [key: string]: number };
      options: { [key: string]: boolean };
    };
    pricing: {
      basePrice: number;
      sizeAdjustment: number;
      optionsCost: number;
      unitPrice: number;
    };
    quantity: number;
    totalPrice: number;
  }>;
  pricing: {
    subtotal: number;
    taxRate: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  currency: string;
  status: string;
  paymentStatus: string;
  notes: {
    customer?: string;
    admin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    id: string;
    total: number;
    currency: string;
    status: string;
    estimatedDelivery: string;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    return api.post<CreateOrderResponse>('/orders', orderData);
  }

  async getOrder(orderId: string, email?: string): Promise<OrderResponse> {
    const endpoint = email 
      ? `/orders/${orderId}?email=${encodeURIComponent(email)}`
      : `/orders/${orderId}`;
    return api.get<OrderResponse>(endpoint);
  }
}

export const orderService = new OrderService();