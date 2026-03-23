// -------------------------------------/middleware/authController.js


exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  
  req.session.user = {
    email: user.email,
    fullName: user.fullName,
    _id: user._id,
    profileComplete: user.profileComplete,
  };

  res.status(200).json({
    success: true,
    message: 'OTP verified',
    user: req.session.user,
  });
};