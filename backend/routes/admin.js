const router = require('express').Router();
const User = require('../models/user');
const Booking = require('../models/booking');
const Feedback = require('../models/feedback');
const { wrap } = require('../middleware/errors');
router.use(require('../middleware/auth'), require('../middleware/admin'));
router.get('/dashboard', wrap(async (req, res) => {
  const [users, bookings, reviews] = await Promise.all([
    User.find().select('username email contact location role createdAt').sort({ createdAt: -1 }),
    Booking.find().populate('userID', 'username email contact').sort({ createdAt: -1 }),
    Feedback.find().populate('userID', 'username email').sort({ createdAt: -1 })
  ]);
  res.json({ users, bookings, reviews });
}));
router.patch('/bookings/:id', wrap(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const update = {};
  if (status !== undefined) {
    if (!['Reserved', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid booking status.' });
    update.status = status;
  }
  if (paymentStatus !== undefined) {
    if (!['Pending', 'Paid'].includes(paymentStatus)) return res.status(400).json({ message: 'Invalid payment status.' });
    update.paymentStatus = paymentStatus;
  }
  if (!Object.keys(update).length) return res.status(400).json({ message: 'Choose a booking or payment status.' });
  const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('userID', 'username email contact');
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  res.json(booking);
}));
router.delete('/reviews/:id', wrap(async (req, res) => {
  const review = await Feedback.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  res.json({ message: 'Review removed.' });
}));
module.exports = router;
