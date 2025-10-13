// Export all API functions
export { authApi } from './auth';
export { portfolioApi } from './portfolio';
export { marketApi } from './market';

// Export client utilities
export {
  default as apiClient,
  handleApiError,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
} from './client';

// Export types
export * from '../types/api';

