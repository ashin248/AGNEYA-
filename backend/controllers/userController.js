const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update addresses
exports.updateAddresses = async (req, res) => {
  const { addresses } = req.body;
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.addresses = addresses;
    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add to design history
exports.saveDesign = async (req, res) => {
  const { name, canvasData, previewUrl } = req.body;
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.designHistory.push({ name, canvasData, previewUrl });
    await user.save();
    res.status(200).json({ success: true, designHistory: user.designHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get design history
exports.getDesignHistory = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select('designHistory');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, designHistory: user.designHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
