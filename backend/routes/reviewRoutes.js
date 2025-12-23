const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  deleteReview
} = require('../controllers/reviewController');

router.post('/reviews', createReview);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
