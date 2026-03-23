const jwt = require('jsonwebtoken');

// Protect routes requiring authentication
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') &&
    req.headers.authorization !== 'Bearer null' &&
    req.headers.authorization !== 'Bearer undefined'
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret);
      
      // Attach user object to the request
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } 
  // Fallback to Express session 
  else if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } 
  else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Admin only middleware
exports.admin = (req, res, next) => {
  if (
    (req.user && req.user.isAdmin) || 
    (req.session && req.session.isAdmin) ||
    (req.user && req.user.role === 'admin')
  ) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
