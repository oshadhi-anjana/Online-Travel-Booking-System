const User = require('../models/user');
const { wrap } = require('./errors');
// Query the database on every request so a forged client role cannot grant access.
module.exports = wrap(async (req, res, next) => {
  const user = await User.findById(req.auth.id);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' });
  next();
});
