import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Restricts access based on authentication and role
 */
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Check if user is authenticated (has user object with id)
  if (!isAuthenticated || !user || !user.id) {
    console.warn('Not authenticated - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`Role mismatch - required: ${requiredRole}, actual: ${userRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 * Shows the component if user is NOT authenticated
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Only allow access if NOT authenticated (no user object)
  if (isAuthenticated && user && user.id) {
    console.warn('User already authenticated - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
