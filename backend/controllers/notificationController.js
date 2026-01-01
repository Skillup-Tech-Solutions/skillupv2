const path = require('path');
const { sendNotification: sendPushNotification } = require('../services/pushNotificationService');



// Register FCM Token
exports.registerToken = async (req, res) => {
    try {
        const { token, platform, deviceId } = req.body;
        const userId = req.user.id || req.user._id;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const DeviceSession = require('../models/DeviceSession');

        // 1. Clear this token from any other device sessions (Token Leakage Fix)
        await DeviceSession.updateMany(
            { fcmToken: token, _id: { $ne: null } },
            { $set: { fcmToken: null } }
        );

        // 2. If deviceId is provided, update the specific device session
        if (deviceId) {
            const session = await DeviceSession.findOne({ userId, deviceId, isActive: true });
            if (session) {
                session.fcmToken = token;
                if (platform) session.platform = platform;
                await session.save();
                console.log(`[FCM] Token registered for device: ${deviceId}`);
                return res.status(200).json({ message: 'Token registered successfully' });
            }
        }

        // 3. Fallback: Find most recent active session for user and update it
        const recentSession = await DeviceSession.findOne({ userId, isActive: true })
            .sort({ lastActiveAt: -1 });

        if (recentSession) {
            recentSession.fcmToken = token;
            if (platform) recentSession.platform = platform;
            await recentSession.save();
            console.log(`[FCM] Token registered for recent device: ${recentSession.deviceId}`);
        } else {
            // No session exists - create a temporary one (legacy support)
            await DeviceSession.create({
                userId,
                deviceId: `legacy-${Date.now()}`,
                deviceName: 'Legacy Device',
                platform: platform || 'android',
                fcmToken: token
            });
            console.log(`[FCM] Token registered for legacy device`);
        }

        res.status(200).json({ message: 'Token registered successfully' });
    } catch (error) {
        console.error('[FCM] Registration Error:', error);
        res.status(500).json({ message: 'Server error during token registration' });
    }
};

// Unregister FCM Token (Logout)
exports.unregisterToken = async (req, res) => {
    try {
        const { token, deviceId } = req.body;
        const userId = req.user.id || req.user._id;

        const DeviceSession = require('../models/DeviceSession');

        if (deviceId) {
            // Clear token from specific device
            await DeviceSession.updateOne(
                { userId, deviceId },
                { $set: { fcmToken: null } }
            );
        } else if (token) {
            // Clear token wherever it exists
            await DeviceSession.updateMany(
                { fcmToken: token },
                { $set: { fcmToken: null } }
            );
        }

        res.status(200).json({ message: 'Token unregistered successfully' });
    } catch (error) {
        console.error('[FCM] Unregistration Error:', error);
        res.status(500).json({ message: 'Server error during token unregistration' });
    }
};


exports.sendNotification = async (req, res) => {
    try {
        const { title, body, target, targetUserIds, data } = req.body;
        const senderId = req.user.id || req.user._id;

        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        const stats = await sendPushNotification({
            title,
            body,
            target,
            targetUserIds,
            data,
            senderId
        });

        res.status(200).json({
            message: 'Notification sent successfully',
            stats
        });
    } catch (error) {
        console.error('[FCM] Send Error:', error);
        res.status(500).json({ message: 'Failed to send notification' });
    }
};

// Get History
exports.getNotificationHistory = async (req, res) => {
    try {
        const history = await Notification.find()
            .sort({ createdAt: -1 })
            .populate('sentBy', 'name email')
            .populate('targetUserIds', 'name email');

        res.status(200).json(history);
    } catch (error) {
        console.error('[FCM] History Error:', error);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};
