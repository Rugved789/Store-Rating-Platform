import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

/**
 * User API Service
 */
export const userService = {
  /**
   * Get stores with pagination, sorting, filtering, and search
   */
  getStores: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/stores`, { 
        params,
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get stores error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch stores',
      };
    }
  },

  /**
   * Submit or update rating for a store
   */
  submitRating: async (storeId, rating) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/stores/${storeId}/ratings`, {
        rating,
      }, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit rating',
      };
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch profile',
      };
    }
  },
};
