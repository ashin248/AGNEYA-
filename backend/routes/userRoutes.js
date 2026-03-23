const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

router.get('/profile', isAuthenticated, userController.getProfile);
router.put('/addresses', isAuthenticated, userController.updateAddresses);
router.post('/designs', isAuthenticated, userController.saveDesign);
router.get('/designs', isAuthenticated, userController.getDesignHistory);

module.exports = router;
