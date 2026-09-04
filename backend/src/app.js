const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const storeOwnerRoutes = require('./routes/storeOwnerRoutes');
const errorHandler = require('./middleware/errorHandler');

/**
 * Express Application Setup
 * Middleware pipeline and route assembly
 */
const app = express();

// Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Cookie parsing
app.use(cookieParser());

// Middleware: CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes: Authentication (public and auth required)
app.use('/auth', authRoutes);

// Routes: Admin (auth + admin role required)
app.use('/admin', adminRoutes);

// Routes: User (auth required or public for signup)
// User routes are mounted at /auth (not /user)
// Routes: /auth/signup, /auth/stores, /auth/stores/:storeId/ratings, /auth/update-password, /auth/profile
app.use('/auth', userRoutes);

// Routes: Store Owner (auth + store owner role required)
app.use('/store-owner', storeOwnerRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Middleware: Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
