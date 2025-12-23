const express = require('express');
const router = express.Router();
const { categoryMailSubmission } = require('../controllers/categoryMailController');

router.post('/category-mail', categoryMailSubmission);

module.exports = router;