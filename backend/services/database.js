const mongoose = require('mongoose');
let connectionPromise;
let initialized = false;
async function connectDatabase() {
  if (!process.env.MONGODB_URL || !process.env.SECRET_KEY) throw new Error('Set MONGODB_URL and SECRET_KEY in the server environment.');
  if (mongoose.connection.readyState === 1 && initialized) return;
  if (!connectionPromise) {
    connectionPromise = (async () => {
      if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS:10000, maxPoolSize:5 });
      await require('../scripts/seed-admin').ensureAdmin();
      initialized = true;
    })().finally(() => { connectionPromise = undefined; });
  }
  return connectionPromise;
}
module.exports = { connectDatabase };
