const router = require('express').Router();
const User = require('../models/user');
const Booking = require('../models/booking');
const Feedback = require('../models/feedback');
const { wrap } = require('../middleware/errors');
router.use(require('../middleware/auth'), require('../middleware/admin'));
router.get('/dashboard', wrap(async (req, res) => {
  const [users, bookings, reviews, destinations] = await Promise.all([
    User.find().select('username email contact location role createdAt').sort({ createdAt: -1 }),
    Booking.find().populate('userID', 'username email contact').sort({ createdAt: -1 }),
    Feedback.find().populate('userID', 'username email').sort({ createdAt: -1 }),
    require('../services/destinations').list()
  ]);
  res.json({ users, bookings, reviews, destinations });
}));
router.patch('/bookings/:id', wrap(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const update = {};
  if (status !== undefined) {
    if (!['Reserved', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid booking status.' });
    update.status = status;
  }
  if (paymentStatus !== undefined) {
    if (!['Pending', 'Under review', 'Paid'].includes(paymentStatus)) return res.status(400).json({ message: 'Invalid payment status.' });
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
router.post('/destinations', wrap(async (req,res) => {
  const destination = require('../services/destinations').validate(req.body);
  if (!destination) return res.status(400).json({ message:'Enter all destination details, a unique lowercase URL ID, a valid HTTPS image URL, 1–60 days, a positive price, and 1–10 highlights.' });
  if (require('../data/destinations').some(d => d.id === destination.id)) return res.status(409).json({ message:'That destination URL ID is already in use.' });
  res.status(201).json(await require('../models/destination').create(destination));
}));
router.put('/destinations/:id', wrap(async (req,res) => {
  const catalog = require('../services/destinations');
  if (req.body.id !== req.params.id) return res.status(400).json({ message:'The destination URL ID cannot be changed.' });
  const destination = catalog.validate(req.body);
  if (!destination) return res.status(400).json({ message:'Please check the destination details, image URL, price, duration, and highlights.' });
  if (!await catalog.find(req.params.id)) return res.status(404).json({ message:'Destination not found.' });
  const pending = await Booking.exists({ destinationId:req.params.id, status:{$in:['Reserved','Confirmed']} });
  if (pending) return res.status(409).json({ message:'This destination has pending reservations (Reserved or Confirmed). Complete or cancel them before editing.' });
  // Built-in trips become persisted overrides; existing booking snapshots are untouched.
  const saved = await require('../models/destination').findOneAndUpdate({ id:req.params.id }, { $set:destination }, { new:true, upsert:true, runValidators:true });
  res.json(saved);
}));
module.exports = router;
