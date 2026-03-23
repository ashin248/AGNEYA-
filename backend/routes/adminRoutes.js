// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { adminLogin, adminLogout, isAdmin, getDailyRevenue, getTopProducts, getCustomerStats } = require('../controllers/adminController');

// Public route - anyone can try to login
router.post('/login', adminLogin);

// Protected routes (admin only)
router.get('/dashboard', isAdmin, (req, res) => {
  res.json({ success: true, message: 'Welcome to admin dashboard' });
});

// Analytics Routes
router.get('/analytics/daily-revenue', isAdmin, getDailyRevenue);
router.get('/analytics/top-products', isAdmin, getTopProducts);
router.get('/analytics/customer-stats', isAdmin, getCustomerStats);



// Logout
router.post('/logout', adminLogout);

module.exports = router;