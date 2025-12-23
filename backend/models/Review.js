const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  review: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
