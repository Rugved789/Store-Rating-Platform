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
   * Configure axios globally for all requests
   */
  axios.defaults.baseURL = API_BASE;
  axios.defaults.withCredentials = true; // CRITICAL: Send cookies with every request

  /**
   * Check if user is already logged in (runs once on mount)
   */
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication on app load...');
      try {
        const response = await axios.get('/auth/me', {
          withCredentials: true
        });
        
        if (response.data.success && response.data.data.user) {
          console.log('✅ User authenticated:', response.data.data.user.email);
          setUser(response.data.data.user);
        } else {
          console.log('❌ Auth check returned no user data');
          setUser(null);
        }
      } catch (err) {
        console.log('❌ Auth check failed (not logged in):', err.response?.status);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array = runs only once on mount

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', email);
      setError(null);
      
      const response = await axios.post('/auth/login', 
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success && response.data.data.user) {
        console.log('✅ Login successful:', response.data.data.user.email);
        setUser(response.data.data.user);
        return { success: true, data: response.data.data };
      }
      
      throw new Error('Invalid login response');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      console.error('❌ Login error:', message);
      setError(message);
      setUser(null);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Signup user
   */
  const signup = useCallback(async (name, email, password) => {
    try {
      console.log('📝 Attempting signup with:', email);
      setError(null);
      
      const response = await axios.post('/auth/signup', 
        { name, email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log('✅ Signup successful, please login');
        return { success: true, message: 'Signup successful. Please login.' };
      }
      
      throw new Error('Invalid signup response');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Signup failed';
      console.error('❌ Signup error:', message);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Logout user
   * CRITICAL: Clear user state BEFORE redirecting
   */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Starting logout...');
      
      // Step 1: Clear frontend state immediately
      setUser(null);
      setError(null);
      
      // Step 2: Tell backend to clear cookie
      try {
        await axios.post('/auth/logout', {}, { withCredentials: true });
        console.log('✅ Backend logout successful');
      } catch (err) {
        console.warn('⚠️ Backend logout failed (but frontend cleared):', err.message);
        // Continue anyway - frontend is already cleared
      }
      
      return { success: true };
    } catch (err) {
      console.error('❌ Logout error:', err.message);
      // Even if error, still clear frontend
      setUser(null);
      return { success: true };
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
      const message = err.response?.data?.error || 'Password update failed';
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
        setUser(response.data.data.user);
        return { success: true, data: response.data.data.user };
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch profile';
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
    isAuthenticated: !!user && !!user.id,
    userRole: user?.role || null,
  };

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('🔄 Auth state updated:', {
      isAuthenticated: !!user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      loading
    });
  }, [user, loading]);

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
