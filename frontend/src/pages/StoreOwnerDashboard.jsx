import React, { useState, useEffect } from 'react';
import { storeOwnerService } from '../services/storeOwnerService';
import { Loading } from '../components/Loading';

/**
 * Store Owner Dashboard - View store, ratings, and statistics
 */
export const StoreOwnerDashboard = () => {
  const [store, setStore] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  useEffect(() => {
    fetchDashboard();
  }, [pagination.page]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardResult, statsResult, ratingsResult] = await Promise.all([
        storeOwnerService.getDashboard(),
        storeOwnerService.getStatistics(),
        storeOwnerService.getRatings({ page: pagination.page, limit: pagination.limit }),
      ]);

      if (dashboardResult.success) {
        setStore(dashboardResult.data.dashboard.store);
        // Update pagination from dashboard ratings
        if (dashboardResult.data.dashboard.ratings) {
          setRatings(dashboardResult.data.dashboard.ratings);
        }
      } else {
        setError(dashboardResult.error);
      }

      if (statsResult.success) {
        setStatistics(statsResult.data.statistics);
      }

      if (ratingsResult.success) {
        setRatings(ratingsResult.data.ratings);
        setPagination(ratingsResult.data.pagination);
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
      <h1 style={{ marginBottom: '2rem' }}>Store Owner Dashboard</h1>

      {/* Store Information */}
      {store && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6',
          }}
        >
          <h2>Store Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Store Name
              </label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{store.name}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Email
              </label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{store.email}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Address
              </label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{store.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Average Rating Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: 0, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              Average Rating
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffc107', margin: '0.5rem 0' }}>
              {statistics.averageRating || 'N/A'}
            </div>
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>out of 5</p>
          </div>

          {/* Total Ratings Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: 0, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              Total Ratings
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#007bff', margin: '0.5rem 0' }}>
              {statistics.totalRatings || 0}
            </div>
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>customer reviews</p>
          </div>

          {/* Rating Distribution */}
          <div style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Rating Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div
                  key={star}
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ⭐ {star}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                    {statistics.ratingDistribution[star] || 0}
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                    {((statistics.ratingDistribution[star] || 0) / (statistics.totalRatings || 1) * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ratings Table */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #dee2e6' }}>
          <h2 style={{ margin: 0 }}>Customer Ratings</h2>
        </div>

        {ratings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No ratings yet
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.95rem',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Rating</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>{rating.userName}</td>
                  <td style={{ padding: '1rem' }}>{rating.userEmail}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                      }}
                    >
                      ⭐ {rating.rating}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPagination((prev) => ({ ...prev, page }))}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: page === pagination.page ? '#007bff' : '#f8f9fa',
                color: page === pagination.page ? 'white' : '#333',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
