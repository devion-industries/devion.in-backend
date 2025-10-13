import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('devion_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ error: ApiError }>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = error.response.data?.error || {
        message: 'An error occurred',
      };

      // Handle 401 Unauthorized - Clear token and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('devion_token');
        localStorage.removeItem('devion_user');
        window.location.href = '/dashboard'; // Will redirect to landing if not logged in
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      } as ApiError);
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      } as ApiError);
    }
  }
);

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }
  return 'An unexpected error occurred';
};

// Token management
export const setAuthToken = (token: string) => {
  localStorage.setItem('devion_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('devion_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('devion_token');
  localStorage.removeItem('devion_user');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export default apiClient;

