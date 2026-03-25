const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/authMiddleware');

const {
  createOrder,
  confirmPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// User routes
router.post('/create', protect, createOrder);
router.post('/confirm-payment/:orderId', protect, confirmPayment);
router.get('/my-orders', protect, getMyOrders);

// Admin only routes
router.get('/all', adminProtect, getAllOrders);
router.put('/update-status/:orderId', adminProtect, updateOrderStatus);
router.put('/:orderId/status', adminProtect, updateOrderStatus); // Matches OrderManagement.jsx call

module.exports = router;
