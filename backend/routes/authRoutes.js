// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  sendOTP,
  verifyOTP,
  completeRegistration,
  logout,
} = require('../controllers/authController');

// // Get current user from session
// router.get('/me', (req, res) => {
//   if (req.session && req.session.user) {
//     res.json({ success: true, user: req.session.user });
//   } else {
//     res.status(401).json({ success: false, message: 'Not authenticated' });
//   }
// });



// routes/authRoutes.js
router.get('/me', protect, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }
});





router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/complete-registration', completeRegistration);
router.post('/logout', logout);

module.exports = router;




// // routes/authRoutes.js
// const express = require('express');
// const router = express.Router();

// const {
//   sendOTP,
//   verifyOTP,
//   completeRegistration,
// } = require('../controllers/authController');

// router.post('/send-otp', sendOTP);
// router.post('/verify-otp', verifyOTP);
// router.post('/complete-registration', completeRegistration);

// module.exports = router;