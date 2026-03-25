// routes/productRoutes.js
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const CustomBase = require('../models/CustomBase');

const {
  uploadReadyProduct,
  bulkUploadReady,
  deleteReadyProduct,
} = require('../controllers/readyProductController');

const { uploadCustomBase, deleteCustomBase } = require('../controllers/customBaseController');
const { adminProtect } = require('../middleware/authMiddleware');

// Ready products endpoints
router.get('/ready', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch ready products' });
  }
});

router.post('/ready', adminProtect, uploadReadyProduct);
router.post('/bulk-ready', adminProtect, bulkUploadReady);
router.delete('/ready/:id', adminProtect, deleteReadyProduct);

// Custom bases endpoints
router.get('/custom-bases', async (req, res) => {
  try {
    const customBases = await CustomBase.find();
    res.json({ success: true, customBases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch custom bases' });
  }
});

router.post('/custom-base', adminProtect, uploadCustomBase);
router.delete('/custom-base/:id', adminProtect, deleteCustomBase);

module.exports = router;