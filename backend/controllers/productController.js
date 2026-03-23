// controllers/productController.js 
const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};