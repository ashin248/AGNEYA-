// --------------------------------------controllers/authController.js
const User = require('../models/User');
const { setOTP } = require('../utils/otpGenerator');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    const otp = setOTP(user);
    await user.save();

    const { error } = await resend.emails.send({
      from: 'Agneya <onboarding@resend.dev>',
      to: email,
      subject: 'Agneya Login OTP',
      html: `
        <h2>Agneya Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="font-size: 48px; letter-spacing: 10px;">${otp}</h1>
        <p>Valid for 10 minutes only.</p>
        <p>If this wasn't you, ignore this email.</p>
        <br><small>Agneya Printing Solutions</small>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otp || user.otp.code !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    user.otp = undefined;
    await user.save();

    // Store in session
    req.session.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile,
      address: user.address,
      profileComplete: user.profileComplete,
    };

    res.status(200).json({
      success: true,
      message: 'OTP verified & session created',
      token: jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      ),
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.completeRegistration = async (req, res) => {
  const {
    email,
    fullName,
    mobile,
    addressLine,
    city,
    landmark,
    pincode,
    state,
  } = req.body;

  if (!email || !fullName || !mobile || !landmark) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = fullName.trim();
    user.mobile = mobile.trim();
    user.address = {
      addressLine: addressLine?.trim() || '',
      city: city?.trim() || '',
      landmark: landmark.trim(),
      pincode: pincode?.trim() || '',
      state: state?.trim() || '',
      country: 'India',
    };
    user.profileComplete = true;

    await user.save();

    // Update session
    req.session.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile,
      address: user.address,
      profileComplete: true,
    };

    res.status(200).json({
      success: true,
      message: 'Profile completed',
      token: jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      ),
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};
