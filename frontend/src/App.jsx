import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Loading } from './components/Loading';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStores } from './pages/AdminStores';
import { AdminUsers } from './pages/AdminUsers';
import { UserStores } from './pages/UserStores';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard';

/**
 * Layout Component with Navigation
 */
const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      window.location.href = '/';
    }
  };

  // Only show authenticated UI if user object exists AND has required fields
  const userIsLoggedIn = !!user && !!user.id && !!user.email;

  console.log('Layout render - user:', user, 'isAuthenticated:', isAuthenticated, 'userIsLoggedIn:', userIsLoggedIn);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <nav
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
            Store Rating Platform
          </a>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {userIsLoggedIn ? (
            <>
              <span>{user?.name}</span>
              <span style={{ fontSize: '0.9rem', color: '#ccc' }}>({user?.role})</span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={{ color: 'white', textDecoration: 'none' }}>
                Login
              </a>
              <a href="/signup" style={{ color: 'white', textDecoration: 'none' }}>
                Sign Up
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          borderTop: '1px solid #dee2e6',
        }}
      >
        <p>&copy; 2026 Store Rating Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

/**
 * Routes Wrapper
 */
const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading message="Initializing..." />;
  }

  return (
    <Layout>
      <Routes>
        {/* Home Page - Public, accessible to everyone */}
        <Route path="/" element={<Home />} />

        {/* Public Routes - Redirects to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute requiredRole="USER">
              <UserStores />
            </ProtectedRoute>
          }
        />

        {/* Role-specific Routes (will be implemented in Tasks 11-13) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminStores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/store-owner"
          element={
            <ProtectedRoute requiredRole="STORE_OWNER">
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Fallback - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

/**
 * Main App Component
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
