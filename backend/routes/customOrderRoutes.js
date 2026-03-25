const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getCustomOrders, updateOrderStatus } = require('../controllers/orderController');

// Admin only routes for custom orders
router.get('/admin', protect, admin, getCustomOrders);
router.put('/:orderId/status', protect, admin, updateOrderStatus);

module.exports = router;
