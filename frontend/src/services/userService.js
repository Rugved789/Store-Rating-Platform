import axios from 'axios';

const API_BASE = 'http://localhost:5000';

/**
 * User API Service
 */
export const userService = {
  /**
   * Get stores with pagination, sorting, filtering, and search
   */
  getStores: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/stores`, { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch stores',
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
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to submit rating',
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
