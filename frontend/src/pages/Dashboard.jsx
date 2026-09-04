import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard Page (Placeholder)
 * Role-specific dashboards will be implemented in later tasks
 */
export const Dashboard = () => {
  const { user, userRole } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Your role: {userRole}</p>

      {userRole === 'ADMIN' && (
        <div>
          <h2>Admin Dashboard</h2>
          <p>Go to admin pages to manage stores and users.</p>
          <Link
            to="/admin"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Go to Admin Dashboard
          </Link>
        </div>
      )}

      {userRole === 'USER' && (
        <div>
          <h2>User Dashboard</h2>
          <p>Browse stores and submit your ratings.</p>
          <Link
            to="/stores"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Browse Stores
          </Link>
        </div>
      )}

      {userRole === 'STORE_OWNER' && (
        <div>
          <h2>Store Owner Dashboard</h2>
          <p>View your store ratings and statistics.</p>
          <Link
            to="/store-owner"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffc107',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Go to Store Owner Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};
