const Review = require('../models/Review');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { email, review, name } = req.body;
    const newReview = new Review({ email, review, name });
    const saved = await newReview.save();
    res.status(201).json({ message: 'Review created successfully', data: saved });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get All Reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Reviews fetched successfully', data: reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Delete Review by ID
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
