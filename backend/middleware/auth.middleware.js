const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("token is:",token);
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (user.sessionToken !== decoded.sessionToken) {
        return res.status(401).json({
          error: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED'
        });
      }
      
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};
