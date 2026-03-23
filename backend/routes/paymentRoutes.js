const express = require("express");
const router = express.Router();
const { verifyPayment, getRazorpayKey } = require("../controllers/paymentController");
const { createOrder } = require("../controllers/orderController");

// Payment routes
router.get("/key", getRazorpayKey);
router.post("/order", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;
