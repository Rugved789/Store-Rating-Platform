import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

/**
 * Authentication Context
 * Manages user authentication state and API calls
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Configure axios to use credentials (cookies)
   */
  axios.defaults.baseURL = API_BASE;
  axios.defaults.withCredentials = true;

  /**
   * Check if user is already logged in (on mount)
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        // User not authenticated, which is expected
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/login', { email, password });

      if (response.data.success) {
        setUser(response.data.data.user);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Signup user
   */
  const signup = useCallback(async (name, email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/signup', { name, email, password });

      if (response.data.success) {
        // Don't auto-login after signup
        return { success: true, message: 'Signup successful. Please login.' };
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      await axios.post('/auth/logout');
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Logout failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Update user password
   */
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await axios.post('/auth/update-password', {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        return { success: true, message: 'Password updated successfully' };
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Password update failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Get user profile
   */
  const getProfile = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get('/auth/profile');

      if (response.data.success) {
        setUser(response.data.data);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to fetch profile';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    signup,
    logout,
    updatePassword,
    getProfile,
    isAuthenticated: !!user,
    userRole: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
