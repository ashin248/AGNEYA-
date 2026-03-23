// controllers/readyProductController.js
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const AdmZip = require('adm-zip');

// Single ready product multer setup
const singleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = './uploads/products/';
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploadSingle = multer({
  storage: singleStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images (jpg, jpeg, png, webp) allowed'));
  },
}).single('image');

// Single Ready Product
exports.uploadReadyProduct = (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image required' });
    }

    try {
      const { name, price, originalPrice, discount, category, description, stock } = req.body;

      if (!name || !price) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Name and price required' });
      }

      const imageUrl = `/uploads/products/${req.file.filename}`;

      const product = new Product({
        name: name.trim(),
        type: 'ready',
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discount: discount ? Number(discount) : 0,
        category,
        description: description?.trim(),
        stock: stock ? Number(stock) : 50,
        imageUrl,
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: 'Ready product uploaded successfully',
        product,
      });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
};

// Bulk Ready Products (CSV + ZIP)
exports.bulkUploadReady = async (req, res) => {
  const uploadBulk = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }).fields([
    { name: 'productsCsv', maxCount: 1 },
    { name: 'imagesZip', maxCount: 1 },
  ]);

  uploadBulk(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files['productsCsv'] || !req.files['imagesZip']) {
      return res.status(400).json({ success: false, message: 'CSV and ZIP required' });
    }

    try {
      const csvFile = req.files['productsCsv'][0];
      const zipFile = req.files['imagesZip'][0];

      // Extract ZIP
      const zip = new AdmZip(zipFile.buffer);
      const uploadDir = path.join(__dirname, '../uploads/products/bulk-' + Date.now());
      fs.mkdirSync(uploadDir, { recursive: true });
      zip.extractAllTo(uploadDir, true);

      // Parse CSV
      const results = [];
      const parser = csv({ separator: ',' });
      parser.on('data', (data) => results.push(data));
      parser.on('end', async () => {
        const inserted = [];
        for (const row of results) {
          const {
            name, price, originalPrice, discount, category, description, stock, imageFilename,
          } = row;

          if (!name || !price || !imageFilename) continue;

          const imagePath = path.join(uploadDir, imageFilename.trim());
          if (!fs.existsSync(imagePath)) continue;

          const newFilename = `${Date.now()}-${imageFilename}`;
          const destPath = path.join(__dirname, '../uploads/products', newFilename);
          fs.renameSync(imagePath, destPath);

          const product = new Product({
            name: name.trim(),
            type: 'ready',
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            discount: discount ? Number(discount) : 0,
            category,
            description,
            stock: stock ? Number(stock) : 50,
            imageUrl: `/uploads/products/${newFilename}`,
          });

          await product.save();
          inserted.push(product.name);
        }

        fs.rmSync(uploadDir, { recursive: true, force: true });

        res.status(201).json({
          success: true,
          message: `Bulk upload completed: ${inserted.length} products added`,
          insertedCount: inserted.length,
        });
      });

      parser.write(csvFile.buffer);
      parser.end();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
    }
  });
};