import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

/**
 * Store Owner API Service
 */
export const storeOwnerService = {
  /**
   * Get store owner's dashboard
   */
  getDashboard: async () => {
    try {
      const response = await axios.get(`${API_BASE}/store-owner/dashboard`, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard',
      };
    }
  },

  /**
   * Get store owner's ratings with pagination
   */
  getRatings: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/store-owner/ratings`, { 
        params,
        withCredentials: true
      });
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
