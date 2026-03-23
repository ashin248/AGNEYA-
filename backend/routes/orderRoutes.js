const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

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
router.get('/all', protect, admin, getAllOrders);
router.put('/update-status/:orderId', protect, admin, updateOrderStatus);

module.exports = router;
