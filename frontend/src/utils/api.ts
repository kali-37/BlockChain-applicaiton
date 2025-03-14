import axios from 'axios';
import { refreshAccessToken } from './authenticator';

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000'
});

// Set auth token in headers
export const setAuthToken = (token: string): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Remove auth tokens from headers
export const removeAuthTokens = (): void => {
  delete api.defaults.headers.common['Authorization'];
};


// Setup axios interceptors for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh the token
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Retry the original request with new token
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);