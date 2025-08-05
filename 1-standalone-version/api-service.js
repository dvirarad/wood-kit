// API Service for Wood Kits Frontend
class APIService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/v1';
    this.adminSession = null;
  }

  // Generic fetch wrapper
  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products API
  async getProducts() {
    return this.fetch('/products');
  }

  async getProduct(productId) {
    return this.fetch(`/products/${productId}`);
  }

  async calculatePrice(productId, configuration) {
    return this.fetch(`/products/${productId}/calculate-price`, {
      method: 'POST',
      body: configuration
    });
  }

  // Orders API
  async createOrder(orderData) {
    return this.fetch('/orders', {
      method: 'POST',
      body: orderData
    });
  }

  async getOrder(orderId) {
    return this.fetch(`/orders/${orderId}`);
  }

  // Reviews API
  async getReviews(productId = null, language = 'en') {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    params.append('language', language);
    
    return this.fetch(`/reviews?${params.toString()}`);
  }

  async submitReview(reviewData) {
    return this.fetch('/reviews', {
      method: 'POST',
      body: reviewData
    });
  }

  // Admin API
  async adminLogin(username, password) {
    const response = await this.fetch('/admin/login', {
      method: 'POST',
      body: { username, password }
    });
    
    if (response.success) {
      this.adminSession = response.data;
      localStorage.setItem('adminSession', JSON.stringify(this.adminSession));
    }
    
    return response;
  }

  async getAdminDashboard() {
    return this.fetch('/admin/dashboard');
  }

  // Payment API
  async createPaymentIntent(orderId, amount, currency = 'ils') {
    return this.fetch('/payments/create-intent', {
      method: 'POST',
      body: { orderId, amount, currency }
    });
  }

  // Utility methods
  isAdminLoggedIn() {
    const session = localStorage.getItem('adminSession');
    if (!session) return false;
    
    const adminData = JSON.parse(session);
    return adminData.sessionExpires > Date.now();
  }

  adminLogout() {
    this.adminSession = null;
    localStorage.removeItem('adminSession');
  }
}

// Create global instance
window.apiService = new APIService();