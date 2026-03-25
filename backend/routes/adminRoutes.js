// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { adminLogin, adminLogout, getDailyRevenue, getTopProducts, getCustomerStats } = require('../controllers/adminController');
const { adminProtect } = require('../middleware/authMiddleware');

// Public route - anyone can try to login
router.post('/login', adminLogin);

// Protected routes (admin only)
router.get('/dashboard', adminProtect, (req, res) => {
  res.json({ success: true, message: 'Welcome to admin dashboard' });
});

// Analytics Routes
router.get('/analytics/daily-revenue', adminProtect, getDailyRevenue);
router.get('/analytics/top-products', adminProtect, getTopProducts);
router.get('/analytics/customer-stats', adminProtect, getCustomerStats);

// Alias for frontend compatibility (matches CustomerInsights.jsx call)
router.get('/customers/stats', adminProtect, getCustomerStats);

// Logout
router.post('/logout', adminLogout);

module.exports = router;