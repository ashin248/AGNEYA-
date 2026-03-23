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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB safe
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images allowed'));
  },
}).single('image');

exports.uploadCustomBase = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image required' });
    }

    try {
      const { name, basePrice, description, stock } = req.body;

      if (!name || !basePrice) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Name and basePrice required' });
      }

      const imageUrl = `/uploads/custom-bases/${req.file.filename}`;

      const customBase = new CustomBase({
        name: name.trim(),
        basePrice: Number(basePrice),
        description: description?.trim() || '',
        stock: stock ? Number(stock) : 50,
        imageUrl,
      });

      await customBase.save();

      res.status(201).json({
        success: true,
        message: 'Custom base uploaded successfully',
        customBase,
      });
    } catch (error) {
      console.error('Save error:', error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};