// controllers/adminController.js
const adminLogin = (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  const correctPassword = process.env.ADMIN_PASSWORD || 'supersecret123';

  if (password === correctPassword) {
    req.session.isAdmin = true;
    req.session.adminLoggedInAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid password',
    });
  }
};

// Admin logout
const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: 'Admin logged out',
    });
  });
};

// Middleware to check if admin is logged in
const isAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized - Admin access required',
  });
};

// Analytics: Get Daily Revenue (Past 30 days)
const getDailyRevenue = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const formattedData = revenueData.map(item => ({
      date: item._id,
      total: item.total,
      count: item.count
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    console.error("Daily Revenue Error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue data' });
  }
};

// Analytics: Get Top Selling Products
const getTopProducts = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          count: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (err) {
    console.error("Top Products Error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch top products' });
  }
};

// Analytics: Get Customer Stats (Top Users)
const getCustomerStats = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const User = require('../models/User');

    const customerStats = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$amount" }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 }
    ]);

    // Populate user details manually or using $lookup
    const populatedStats = await Promise.all(customerStats.map(async (stat) => {
      const user = await User.findById(stat._id).select('fullName email');
      return {
        ...stat,
        fullName: user?.fullName,
        email: user?.email
      };
    }));

    res.json({ success: true, data: populatedStats });
  } catch (err) {
    console.error("Customer Stats Error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch customer stats' });
  }
};

module.exports = { adminLogin, adminLogout, isAdmin, getDailyRevenue, getTopProducts, getCustomerStats };
