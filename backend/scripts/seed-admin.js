const User = require('../models/user');
async function ensureAdmin({ resetPassword = false } = {}) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (!require('validator').isEmail(email) || password.length < 8 || Buffer.byteLength(password) > 72) throw new Error('Configure a valid ADMIN_EMAIL and ADMIN_PASSWORD.');
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, password, username: 'Serandib Admin', contact: 'Not provided', location: 'Sri Lanka', role: 'admin' });
    await user.save();
  } else if (user.role !== 'admin' || resetPassword) {
    user.role = 'admin';
    if (resetPassword) user.password = password;
    await user.save();
  }
}
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  (async () => {
    try {
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.');
      await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 10000 });
      await ensureAdmin({ resetPassword: true });
      console.log('Admin account configured successfully.');
    } catch (err) { console.error(err.message); process.exitCode = 1; }
    finally { await mongoose.disconnect(); }
  })();
}
module.exports = { ensureAdmin };
