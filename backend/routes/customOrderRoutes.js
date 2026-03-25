const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/authMiddleware');
const { getCustomOrders, updateOrderStatus } = require('../controllers/orderController');

// Admin only routes for custom orders
router.get('/admin', adminProtect, getCustomOrders);
router.put('/:orderId/status', adminProtect, updateOrderStatus);

module.exports = router;
