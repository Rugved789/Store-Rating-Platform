import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Unauthorized Page
 * Shows when user lacks required role for a page
 */
export const Unauthorized = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <Link to="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>
        Go to Dashboard
      </Link>
    </div>
  );
};
