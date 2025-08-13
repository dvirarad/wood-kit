// Authentication service for admin login
import { api } from './api';

interface LoginResponse {
  token: string;
  admin: {
    id: string;
    username: string;
  };
  message: string;
}

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  recentOrders: any[];
  topProducts: any[];
}

class AuthService {
  private readonly TOKEN_KEY = 'adminToken';
  private readonly ADMIN_KEY = 'adminData';

  // Admin login
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/admin/login', {
        username,
        password
      });

      // Store token and admin data
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(response.admin));

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Admin logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
  }

  // Check if admin is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  // Get stored admin token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get stored admin data
  getAdminData(): any {
    const adminData = localStorage.getItem(this.ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  }

  // Get admin dashboard stats
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const token = this.getToken();
      const stats = await api.get<AdminStats>('/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return stats;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  // Seed database (for development/testing)
  async seedDatabase(): Promise<void> {
    try {
      const token = this.getToken();
      await api.post('/admin/seed', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to seed database:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;