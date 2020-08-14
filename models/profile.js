const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  trackName: String,
  trackUrl: String,
  startAt: Number,
  endAt: Number,
  finalCheck: String,
  finalCheckSeconds: Number,
})

module.exports = mongoose.model('Profile', ProfileSchema);