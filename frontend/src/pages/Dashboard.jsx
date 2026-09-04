import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

/**
 * Dashboard Page - Beautiful and functional home page
 */
export const Dashboard = () => {
  const { user, userRole } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="banner-subtitle">
            {userRole === 'ADMIN' && 'Manage your platform with power and control'}
            {userRole === 'STORE_OWNER' && 'Monitor your store\'s reputation and customer ratings'}
            {userRole === 'USER' && 'Discover amazing stores and share your ratings'}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Section */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon role-badge">👤</div>
            <h3>Role</h3>
            <p className="stat-value">
              {userRole === 'ADMIN' && 'Administrator'}
              {userRole === 'STORE_OWNER' && 'Store Owner'}
              {userRole === 'USER' && 'Regular User'}
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✉️</div>
            <h3>Email</h3>
            <p className="stat-value">{user?.email}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <h3>Member Since</h3>
            <p className="stat-value">
              {new Date(user?.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Role-Specific Sections */}
        <div className="dashboard-sections">
          {/* ADMIN SECTION */}
          {userRole === 'ADMIN' && (
            <div className="dashboard-section admin-section">
              <div className="section-header">
                <h2>👨‍💼 Admin Dashboard</h2>
                <p>Full control over your platform</p>
              </div>
              <div className="section-grid">
                <Link to="/admin/stores" className="action-card primary">
                  <div className="action-icon">🏪</div>
                  <h3>Manage Stores</h3>
                  <p>Create, edit, and remove stores from your platform</p>
                  <div className="action-arrow">→</div>
                </Link>
                <Link to="/admin/users" className="action-card primary">
                  <div className="action-icon">👥</div>
                  <h3>Manage Users</h3>
                  <p>View all users and manage their accounts</p>
                  <div className="action-arrow">→</div>
                </Link>
                <Link to="/admin" className="action-card primary">
                  <div className="action-icon">📊</div>
                  <h3>Dashboard Stats</h3>
                  <p>View platform statistics and analytics</p>
                  <div className="action-arrow">→</div>
                </Link>
              </div>
            </div>
          )}

          {/* USER SECTION */}
          {userRole === 'USER' && (
            <div className="dashboard-section user-section">
              <div className="section-header">
                <h2>🛍️ Explore & Rate</h2>
                <p>Discover great stores and share your feedback</p>
              </div>
              <div className="section-grid">
                <Link to="/stores" className="action-card success">
                  <div className="action-icon">🔍</div>
                  <h3>Browse Stores</h3>
                  <p>Explore all available stores and see ratings from other users</p>
                  <div className="action-arrow">→</div>
                </Link>
              </div>
              <div className="features">
                <h3>What you can do:</h3>
                <ul>
                  <li>✨ Search and filter stores by name or location</li>
                  <li>⭐ See average ratings from all users</li>
                  <li>📝 Submit your own ratings (1-5 stars)</li>
                  <li>🔄 Update your ratings anytime</li>
                  <li>🎯 Help others find great stores</li>
                </ul>
              </div>
            </div>
          )}

          {/* STORE OWNER SECTION */}
          {userRole === 'STORE_OWNER' && (
            <div className="dashboard-section owner-section">
              <div className="section-header">
                <h2>📈 Store Owner Dashboard</h2>
                <p>Monitor and improve your store's reputation</p>
              </div>
              <div className="section-grid">
                <Link to="/store-owner" className="action-card warning">
                  <div className="action-icon">📊</div>
                  <h3>View Dashboard</h3>
                  <p>See your store's ratings, statistics, and customer feedback</p>
                  <div className="action-arrow">→</div>
                </Link>
                <Link to="/store-owner" className="action-card warning">
                  <div className="action-icon">⭐</div>
                  <h3>Store Ratings</h3>
                  <p>View detailed breakdown of ratings from your customers</p>
                  <div className="action-arrow">→</div>
                </Link>
              </div>
              <div className="features">
                <h3>Your insights:</h3>
                <ul>
                  <li>⭐ Real-time average rating</li>
                  <li>📊 Rating distribution (1-5 stars)</li>
                  <li>👥 Total number of customer ratings</li>
                  <li>📈 Track your reputation over time</li>
                  <li>🎯 Improve based on customer feedback</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/dashboard" className="quick-action">
              <span className="action-label">🏠 Home</span>
            </Link>
            {userRole === 'USER' && (
              <Link to="/stores" className="quick-action">
                <span className="action-label">🛍️ Browse</span>
              </Link>
            )}
            {userRole === 'ADMIN' && (
              <Link to="/admin" className="quick-action">
                <span className="action-label">⚙️ Admin</span>
              </Link>
            )}
            {userRole === 'STORE_OWNER' && (
              <Link to="/store-owner" className="quick-action">
                <span className="action-label">📈 Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
