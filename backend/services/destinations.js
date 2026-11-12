const Destination = require('../models/destination');
const initial = require('../data/destinations');
exports.list = async () => {
  const stored = await Destination.find().sort({ createdAt: -1 }).lean();
  const merged = new Map(initial.map(trip => [trip.id, trip]));
  for (const trip of stored) merged.set(trip.id, trip);
  return [...merged.values()];
};
exports.find = async id => await Destination.findOne({ id }).lean() || initial.find(d => d.id === id);
exports.validate = body => {
  const { id, name, region, category, days, price, image, description, highlights } = body;
  const text = (v, max) => typeof v === 'string' && !!v.trim() && v.length <= max;
  let validImage = image === '/images/feedbackIMG.jpeg';
  try { const u = new URL(image); validImage = u.protocol === 'https:' && !u.username && !u.password; } catch {}
  if (!text(id, 100) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !text(name, 120) || !text(region, 120) ||
    !['Nature','Beach','Culture','Adventure'].includes(category) || !Number.isInteger(days) || days < 1 || days > 60 ||
    typeof price !== 'number' || !Number.isFinite(price) || price < 1 || price > 10000000 || !validImage || !text(image, 2000) ||
    !text(description, 2000) || !Array.isArray(highlights) || highlights.length < 1 || highlights.length > 10 || !highlights.every(h => text(h, 160))) return null;
  return { id, name: name.trim(), region: region.trim(), category, days, price, image, description: description.trim(), highlights: highlights.map(h => h.trim()) };
};
