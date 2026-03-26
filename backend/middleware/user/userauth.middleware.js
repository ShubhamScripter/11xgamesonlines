module.exports = (req, res, next) => {
  // This middleware assumes you have already found the user in your controller
  // If you want to check before calling the controller, you can check req.body.username

  // Option 1: Check after finding user in controller (recommended)
  // Option 2: Check here by querying the DB (shown below)

  const User = require('../../models/user.model');
  console.log(req.body)
  const { username } = req.body;

  User.findOne({ username }).then(user => {
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    if (user.role !== 'user') {
      return res.status(403).json({ error: 'Admins cannot login from user panel' });
    }
    next();
  }).catch(() => {
    return res.status(500).json({ error: 'Server error' });
  });
};