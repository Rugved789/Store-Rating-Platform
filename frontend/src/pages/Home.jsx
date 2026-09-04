import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home Page
 * Public landing page with welcome message and call-to-action
 */
export const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '600px' }}>
        {/* Logo/Title */}
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Store Rating Platform
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Discover and rate your favorite stores. Share your experiences with our community.
        </p>

        {/* Description */}
        <p style={{ fontSize: '1rem', marginBottom: '3rem', opacity: 0.8, lineHeight: '1.6' }}>
          Browse through thousands of stores, read authentic reviews, and help others make informed decisions.
        </p>

        {/* Call to Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
          >
            Login
          </button>

          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Features */}
        <div
          style={{
            marginTop: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <p style={{ fontSize: '0.9rem' }}>Authentic Reviews</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</div>
            <p style={{ fontSize: '0.9rem' }}>Thousands of Stores</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <p style={{ fontSize: '0.9rem' }}>Active Community</p>
          </div>
        </div>
      </div>
    </div>
  );
};
