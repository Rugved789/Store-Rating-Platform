import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Loading } from '../components/Loading';

/**
 * Admin Dashboard - Statistics and Overview
 */
export const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    const result = await adminService.getDashboard();
    if (result.success) {
      setDashboard(result.data.dashboard);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#dc3545', fontSize: '1.1rem' }}>Error: {error}</p>
        <button
          onClick={fetchDashboard}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}
      >
        {/* Total Users */}
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '2.5rem', color: '#007bff', margin: '0' }}>
            {dashboard?.totalUsers || 0}
          </h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Total Users</p>
        </div>

        {/* Total Stores */}
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '2.5rem', color: '#28a745', margin: '0' }}>
            {dashboard?.totalStores || 0}
          </h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Total Stores</p>
        </div>

        {/* Total Ratings */}
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '2.5rem', color: '#ffc107', margin: '0' }}>
            {dashboard?.totalRatings || 0}
          </h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Total Ratings</p>
        </div>
      </div>

      {/* Action Links */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Management</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/admin/stores"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Manage Stores
          </a>
          <a
            href="/admin/users"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Manage Users
          </a>
        </div>
      </div>
    </div>
  );
};
