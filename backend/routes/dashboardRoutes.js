const express = require('express');
const router = express.Router();
const { getDashboardCounts } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/dashboard-counts', getDashboardCounts);
router.get('/dashboard-counts/:month', getDashboardCounts);

module.exports = router;
