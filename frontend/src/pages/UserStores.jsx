import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { Loading } from '../components/Loading';

/**
 * User Stores List Page - Browse stores and submit ratings
 */
export const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [ratingForm, setRatingForm] = useState({
    storeId: null,
    rating: 5,
  });

  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [pagination.page, filters]);

  const fetchStores = async () => {
    setLoading(true);
    setError('');

    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.search) {
      params.search = filters.search;
    }

    const result = await userService.getStores(params);

    if (result.success) {
      setStores(result.data.stores);
      setPagination(result.data.pagination);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRatingSubmit = async (storeId, rating) => {
    setRatingError('');
    setRatingSuccess('');

    if (!rating || rating < 1 || rating > 5) {
      setRatingError('Rating must be between 1 and 5');
      return;
    }

    setRatingLoading(true);

    const result = await userService.submitRating(storeId, rating);

    if (result.success) {
      setRatingSuccess('Rating submitted successfully!');
      setRatingForm({ storeId: null, rating: 5 });
      setTimeout(() => {
        fetchStores();
        setRatingSuccess('');
      }, 1000);
    } else {
      setRatingError(result.error);
    }

    setRatingLoading(false);
  };

  if (loading && stores.length === 0) {
    return <Loading message="Loading stores..." />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Browse Stores</h1>

      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb',
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Search & Filter</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or address"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            >
              <option value="name">Name</option>
              <option value="averageRating">Rating</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Order
            </label>
            <select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        {stores.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
            No stores found
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Store Header */}
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>{store.name}</h2>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                  {store.email}
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{store.address}</p>
              </div>

              {/* Rating Info */}
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                  {store.averageRating || 'N/A'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {store.totalRatings || 0} ratings
                </div>
              </div>

              {/* User's Rating */}
              {store.userRating && (
                <div
                  style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  Your rating: ⭐ {store.userRating}
                </div>
              )}

              {/* Rating Form */}
              <div style={{ marginTop: 'auto' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingForm({ storeId: store.id, rating: star })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor:
                          ratingForm.storeId === store.id && ratingForm.rating >= star
                            ? '#ffc107'
                            : '#f8f9fa',
                        color: '#333',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleRatingSubmit(store.id, ratingForm.storeId === store.id ? ratingForm.rating : 5)}
                  disabled={ratingLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: ratingLoading ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: ratingLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                  }}
                >
                  {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Messages */}
      {ratingError && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb',
          }}
        >
          {ratingError}
        </div>
      )}

      {ratingSuccess && (
        <div
          style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #c3e6cb',
          }}
        >
          {ratingSuccess}
        </div>
      )}

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
