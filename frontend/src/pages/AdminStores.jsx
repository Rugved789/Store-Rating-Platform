import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { validateName, validateEmail } from '../utils/validation';
import { Loading } from '../components/Loading';

/**
 * Admin Stores Management Page
 */
export const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchStores();
  }, [pagination.page]);

  const fetchStores = async () => {
    setLoading(true);
    setError('');

    const result = await adminService.getStores({
      page: pagination.page,
      limit: pagination.limit,
    });

    if (result.success) {
      setStores(result.data.stores);
      setPagination(result.data.pagination);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }

    if (!formData.address) {
      errors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      errors.address = 'Address must be at most 400 characters';
    }

    if (!formData.ownerId) {
      errors.ownerId = 'Owner ID is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);

    const result = await adminService.createStore(formData);

    if (result.success) {
      setFormSuccess('Store created successfully!');
      setFormData({ name: '', email: '', address: '', ownerId: '' });
      setShowForm(false);
      setTimeout(() => {
        fetchStores();
        setFormSuccess('');
      }, 1000);
    } else {
      setFormError(result.error);
    }

    setFormLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await adminService.deleteStore(id);

    if (result.success) {
      fetchStores();
      setDeleteConfirm(null);
    } else {
      setError(result.error);
      setDeleteConfirm(null);
    }
  };

  if (loading && stores.length === 0) {
    return <Loading message="Loading stores..." />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Stores</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: showForm ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

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

      {/* Create Store Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6',
          }}
        >
          <h2>Add New Store</h2>

          {formError && (
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
              {formError}
            </div>
          )}

          {formSuccess && (
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
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Store Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter store name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: formErrors.name ? '1px solid #dc3545' : '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
              {formErrors.name && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {formErrors.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Store Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="Enter store email"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: formErrors.email ? '1px solid #dc3545' : '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
              {formErrors.email && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {formErrors.email}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="Enter store address"
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: formErrors.address ? '1px solid #dc3545' : '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              {formErrors.address && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {formErrors.address}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Owner ID
              </label>
              <input
                type="text"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleFormChange}
                placeholder="Enter owner ID"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: formErrors.ownerId ? '1px solid #dc3545' : '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
              {formErrors.ownerId && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {formErrors.ownerId}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: formLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: formLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              {formLoading ? 'Creating...' : 'Create Store'}
            </button>
          </form>
        </div>
      )}

      {/* Stores Table */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Address</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No stores found
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>{store.name}</td>
                  <td style={{ padding: '1rem' }}>{store.email}</td>
                  <td style={{ padding: '1rem' }}>{store.address}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {deleteConfirm === store.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDelete(store.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(store.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
