import axios from 'axios';

const API_BASE = 'http://localhost:5000';

/**
 * Store Owner API Service
 */
export const storeOwnerService = {
  /**
   * Get store owner's dashboard
   */
  getDashboard: async () => {
    try {
      const response = await axios.get(`${API_BASE}/store-owner/dashboard`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch dashboard',
      };
    }
  },

  /**
   * Get store owner's ratings with pagination
   */
  getRatings: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/store-owner/ratings`, { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch ratings',
      };
    }
  },

  /**
   * Get store owner's statistics
   */
  getStatistics: async () => {
    try {
      const response = await axios.get(`${API_BASE}/store-owner/statistics`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch statistics',
      };
    }
  },

  /**
   * Get store owner's store information
   */
  getStore: async () => {
    try {
      const response = await axios.get(`${API_BASE}/store-owner/store`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch store',
      };
    }
  },
};
