const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendPaymentSuccess } = require("../utils/emailService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Order logic moved to orderController.js

// 2. Signature Verification Endpoint
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      // Update Order Status in MongoDB
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "Paid",
          orderStatus: "Printing",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // 3. Send Success Email (Async)
      try {
        const fullUser = await User.findById(order.userId);
        if (fullUser && fullUser.email) {
          sendPaymentSuccess(fullUser, order).catch(e => console.error("Email hidden error:", e));
        }
      } catch (e) {
        console.error("Failed to trigger email:", e);
      }

      res.status(200).json({ success: true, message: "Payment verified successfully", order });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// 3. Get Razorpay Key
exports.getRazorpayKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};
