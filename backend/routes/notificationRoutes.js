const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.post('/register-token', auth, notificationController.registerToken);
router.post('/unregister-token', auth, notificationController.unregisterToken);
router.post('/send', auth, notificationController.sendNotification);
router.get('/history', auth, notificationController.getNotificationHistory);

module.exports = router;
