// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { adminLogin, adminLogout, getDailyRevenue, getTopProducts, getCustomerStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - anyone can try to login
router.post('/login', adminLogin);

// Protected routes (admin only)
router.get('/dashboard', protect, admin, (req, res) => {
  res.json({ success: true, message: 'Welcome to admin dashboard' });
});

// Analytics Routes
router.get('/analytics/daily-revenue', protect, admin, getDailyRevenue);
router.get('/analytics/top-products', protect, admin, getTopProducts);
router.get('/analytics/customer-stats', protect, admin, getCustomerStats);

// Alias for frontend compatibility (matches CustomerInsights.jsx call)
router.get('/customers/stats', protect, admin, getCustomerStats);

// Logout
router.post('/logout', adminLogout);

module.exports = router;