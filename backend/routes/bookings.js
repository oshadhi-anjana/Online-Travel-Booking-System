const router = require('express').Router();
const express = require('express');
const Booking = require('../models/booking');
const User = require('../models/user');
const destinations = require('../services/destinations');
const { wrap } = require('../middleware/errors');
const { MAX_SLIP_BYTES, slipType } = require('../services/payment-slips');
router.use(require('../middleware/auth'));
router.get('/', wrap(async (req,res) => res.json(await Booking.find({userID:req.auth.id}).sort({createdAt:-1}))));
router.post('/', wrap(async (req,res) => {
  const { destinationId, startDate, guests } = req.body;
  if (typeof destinationId !== 'string') return res.status(400).json({ message: 'Choose a valid destination.' });
  const trip = await destinations.find(destinationId);
  const today = new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Colombo'});
  const valid = typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && !Number.isNaN(Date.parse(startDate)) && new Date(startDate).toISOString().slice(0,10) === startDate;
  if (!trip || !valid || startDate < today || !Number.isInteger(guests) || guests < 1 || guests > 12) return res.status(400).json({message:'Choose a valid trip, a date from today onward, and 1–12 travellers.'});
  res.status(201).json(await Booking.create({userID:req.auth.id,destination:trip.name,destinationId:trip.id,startDate,guests,total:trip.price*guests,days:trip.days}));
}));
router.patch('/:id/cancel', wrap(async (req,res) => {
  const b = await Booking.findOneAndUpdate({_id:req.params.id,userID:req.auth.id,status:{$in:['Reserved','Confirmed']}},{status:'Cancelled'},{new:true});
  if (!b) return res.status(404).json({message:'Active reservation not found.'});
  res.json(b);
}));
router.put('/:id/payment-slip', express.raw({ type: () => true, limit: MAX_SLIP_BYTES }), wrap(async (req,res) => {
  const type = slipType(req.body);
  if (!type) return res.status(400).json({ message: 'Attach a PNG, JPEG, or PDF payment slip up to 5 MB.' });
  const slip = { name: `payment-slip-${req.params.id}.${type.extension}`, mime: type.mime, size: req.body.length, uploadedAt: new Date(), data: req.body };
  // Only the owner may submit evidence; uploading never confirms a payment.
  const booking = await Booking.findOneAndUpdate({ _id:req.params.id, userID:req.auth.id, status:{$in:['Reserved','Confirmed']}, paymentStatus:{$ne:'Paid'}, paymentSlip:{$exists:false} }, { $set:{ paymentSlip:slip, paymentStatus:'Under review' } }, { new:true, runValidators:true });
  if (!booking) return res.status(409).json({ message:'A payment slip can only be uploaded once for your unpaid active booking. An existing slip cannot be edited or replaced.' });
  // Explicitly exclude binary data even if a database adapter returns it after update.
  const result = booking.toObject();
  if (result.paymentSlip) delete result.paymentSlip.data;
  res.json(result);
}));
router.get('/:id/payment-slip', wrap(async (req,res) => {
  const booking = await Booking.findById(req.params.id).select('+paymentSlip.data');
  if (!booking) return res.status(404).json({ message:'Payment slip not found.' });
  if (String(booking.userID) !== req.auth.id) {
    const user = await User.findById(req.auth.id);
    if (user?.role !== 'admin') return res.status(403).json({ message:'You cannot access this payment slip.' });
  }
  if (!booking.paymentSlip?.data) return res.status(404).json({ message:'No payment slip has been attached.' });
  res.set({ 'Content-Type':booking.paymentSlip.mime, 'Content-Disposition':`attachment; filename="payment-slip.${booking.paymentSlip.mime === 'application/pdf' ? 'pdf' : booking.paymentSlip.mime === 'image/png' ? 'png' : 'jpg'}"`, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
  res.send(booking.paymentSlip.data);
}));
module.exports = router;
