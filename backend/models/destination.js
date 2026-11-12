const mongoose = require('mongoose');
module.exports = mongoose.model('Destination', new mongoose.Schema({
  id: { type: String, required: true, unique: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  region: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, enum: ['Nature', 'Beach', 'Culture', 'Adventure'] },
  days: { type: Number, required: true, min: 1, max: 60 },
  price: { type: Number, required: true, min: 1, max: 10000000 },
  image: { type: String, required: true, maxlength: 2000 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  highlights: { type: [String], required: true }
}, { timestamps: true }));
