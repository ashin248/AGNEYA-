// controllers/customBaseController.js
const CustomBase = require('../models/CustomBase');  // ← പുതിയ model
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = './uploads/custom-bases/';
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

const uploadArray = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB safe
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images allowed'));
  },
}).array('images', 10);

exports.uploadCustomBase = (req, res) => {
  uploadArray(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Images required' });
    }

    try {
      const { name, basePrice, description, stock } = req.body;

      if (!name || !basePrice) {
        req.files.forEach(file => fs.unlinkSync(file.path));
        return res.status(400).json({ success: false, message: 'Name and basePrice required' });
      }

      // Build absolute URLs
      const backendUrl = process.env.BACKEND_URL || `http://localhost:6060`;
      const imageUrls = req.files.map(file => `${backendUrl}/uploads/custom-bases/${file.filename}`);

      const customBase = new CustomBase({
        name: name.trim(),
        basePrice: Number(basePrice),
        description: description?.trim() || '',
        stock: stock ? Number(stock) : 50,
        imageUrl: imageUrls[0], // Main thumbnail
        imageUrls: imageUrls,
      });

      await customBase.save();

      res.status(201).json({
        success: true,
        message: 'Custom base uploaded successfully',
        customBase,
      });
    } catch (error) {
      console.error('Save error:', error.message);
      if (req.files) req.files.forEach(file => fs.unlinkSync(file.path));
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// Delete Custom Base
exports.deleteCustomBase = async (req, res) => {
  try {
    const customBase = await CustomBase.findById(req.params.id);
    if (!customBase) {
      return res.status(404).json({ success: false, message: 'Custom base not found' });
    }

    // Delete image files
    const imagesToDelete = customBase.imageUrls && customBase.imageUrls.length > 0 
      ? customBase.imageUrls 
      : [customBase.imageUrl];

    imagesToDelete.forEach(url => {
      if (url) {
        const filename = url.split('/').pop();
        const filePath = path.join(__dirname, '../uploads/custom-bases/', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await CustomBase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Custom base deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete custom base', error: error.message });
  }
};