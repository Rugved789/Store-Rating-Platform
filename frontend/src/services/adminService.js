import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

/**
 * Admin API Service
 */
export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  getDashboard: async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/dashboard`, {
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
   * Get stores with pagination, sorting, and filtering
   */
  getStores: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/stores`, { 
        params,
        withCredentials: true
      });
      return { success: true, data: response.data.data, pagination: response.data.pagination };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch stores',
      };
    }
  },

  /**
   * Get users with pagination, sorting, and filtering
   */
  getUsers: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/users`, { 
        params,
        withCredentials: true
      });
      return { success: true, data: response.data.data, pagination: response.data.pagination };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch users',
      };
    }
  },

  /**
   * Get store by ID
   */
  getStore: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/stores/${id}`, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch store',
      };
    }
  },

  /**
   * Create new store
   */
  createStore: async (storeData) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/stores`, storeData, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to create store',
      };
    }
  },

  /**
   * Delete store
   */
  deleteStore: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/admin/stores/${id}`, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to delete store',
      };
    }
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/users`, userData, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to create user',
      };
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/admin/users/${id}`, {
        withCredentials: true
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to delete user',
      };
    }
  },
};
