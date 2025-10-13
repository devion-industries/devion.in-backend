import apiClient, { setAuthToken, removeAuthToken } from './client';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from '../types/api';

export const authApi = {
  /**
   * Register a new user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
    
    // Store token and user data
    if (response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem('devion_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Login existing user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    
    // Store token and user data
    if (response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem('devion_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/api/auth/me');
    
    // Update stored user data
    localStorage.setItem('devion_user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put<{ message: string; user: User }>(
      '/api/auth/profile',
      data
    );
    
    // Update stored user data
    localStorage.setItem('devion_user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    removeAuthToken();
    window.location.href = '/';
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem('devion_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  },
};

