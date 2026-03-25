const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendOrderConfirmation } = require('../utils/emailService');
const User = require('../models/User'); // needed to get full user details 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order (Razorpay Integrated)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; // handle both session (_id) and JWT (id)
    if (!userId) {
       console.error("Order Create Error: No userId found in req.user", req.user);
       return res.status(401).json({ success: false, message: 'User ID not found' });
    }
    const { cartItems, amount, address } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 1. Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    console.log("Creating Razorpay order with options:", options);
    const razorpayOrder = await razorpay.orders.create(options);

    // 2. Save Pending Order in MongoDB with new schema (items array)
    const order = new Order({
      userId,
      items: cartItems, // expected to be [{productId, name, price, quantity, ...}]
      amount,
      address,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      status: 'Pending'
    });

    await order.save();

    // 3. Send Confirmation Email (Async)
    try {
      const fullUser = await User.findById(userId);
      if (fullUser && fullUser.email) {
        sendOrderConfirmation(fullUser, order).catch(e => console.error("Email hidden error:", e));
      }
    } catch (e) {
      console.error("Failed to trigger email:", e);
    }

    res.status(201).json({
      success: true,
      order,
      razorpayOrderId: razorpayOrder.id,
      razorpayAmount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (err) {
    console.error("DEBUG ORDER CREATE ERROR:", err); // As requested
    res.status(500).json({ 
      success: false, 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// 2. Confirm Payment (manual/admin override)
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionId, paymentMethod } = req.body;
    const userId = req.user._id || req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Check if user is owner OR admin
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    if (order.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.paymentStatus = 'Paid';
    order.orderStatus = 'Printing';
    order.status = 'Printing'; // keep for legacy
    order.paymentMethod = paymentMethod || 'UPI Manual';
    if (transactionId) {
      order.razorpayPaymentId = transactionId; // Store UTR here for record
    }
    order.paymentConfirmedAt = new Date();
    order.paymentConfirmedAt = new Date();
    await order.save();

    // 3. Send Success Email (Async)
    try {
      const { sendPaymentSuccess } = require('../utils/emailService');
      const fullUser = await require('../models/User').findById(order.userId);
      if (fullUser && fullUser.email) {
        sendPaymentSuccess(fullUser, order).catch(e => console.error("Email hidden error:", e));
      }
    } catch (e) {
      console.error("Failed to trigger email:", e);
    }

    // Loyalty Points Logic: 10 points for every ₹100 spent
    const pointsEarned = Math.floor(order.amount / 100) * 10;
    if (pointsEarned > 0) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsEarned } });
    }

    res.json({ success: true, message: 'Payment confirmed', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Get My Orders (user side)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const orders = await Order.find({ userId })
      .populate('items.productId', 'name imageUrl price basePrice type')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// 4. Admin: Get All "Ready Product" Orders (Filter out custom)
exports.getAllOrders = async (req, res) => {
  try {
    // Orders where NO item has a custom design
    const orders = await Order.find({
      "items.customDesignUrl": { $exists: false }
    })
      .populate('userId', 'email fullName mobile')
      .populate('items.productId', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// 6. Admin: Get All Custom Orders
exports.getCustomOrders = async (req, res) => {
  try {
    // Orders where at least one item HAS a custom design
    const customOrders = await Order.find({
      "items.customDesignUrl": { $exists: true, $ne: null }
    })
      .populate('userId', 'email fullName mobile')
      .populate('items.productId', 'name imageUrl') // this might be a CustomBase
      .sort({ createdAt: -1 });

    res.json({ success: true, customOrders });
  } catch (err) {
    console.error("Fetch Custom Orders Error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch custom orders' });
  }
};

// 5. Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, orderStatus, paymentStatus } = req.body;

    const updateData = { updatedAt: Date.now() };
    
    // Support both 'status' and 'orderStatus' fields for consistency
    const newStatus = status || orderStatus;
    
    if (newStatus) {
      updateData.orderStatus = newStatus;
      updateData.status = newStatus;
    }
    
    if (paymentStatus) {
       updateData.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};