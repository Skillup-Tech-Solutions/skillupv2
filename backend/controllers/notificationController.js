const admin = require('firebase-admin');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');

// Initialize Firebase Admin - supports both ENV vars (production) and file (local dev)
try {
    if (!admin.apps.length) {
        let credential;

        // Option 1: Environment variable (for Render/production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
            console.log('[Firebase] Using credentials from FIREBASE_SERVICE_ACCOUNT env var');
        }
        // Option 2: File-based (for local development)
        else {
            try {
                const serviceAccount = require('../config/firebase-service-account.json');
                credential = admin.credential.cert(serviceAccount);
                console.log('[Firebase] Using credentials from firebase-service-account.json file');
            } catch (fileError) {
                console.warn('[Firebase] No credentials found - push notifications will not work');
                console.warn('[Firebase] Set FIREBASE_SERVICE_ACCOUNT env var or add config/firebase-service-account.json');
            }
        }

        if (credential) {
            admin.initializeApp({ credential });
            console.log('[Firebase] Admin SDK initialized successfully');
        }
    }
} catch (error) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
}

// Register FCM Token
exports.registerToken = async (req, res) => {
    try {
        const { token, platform } = req.body;
        const userId = req.user.id || req.user._id;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // 1. Cleanup: Remove this token from any other users (Token Leakage Fix)
        await User.updateMany(
            { fcmTokens: { $elemMatch: { token: token } } },
            { $pull: { fcmTokens: { token: token } } }
        );

        // 2. Add token to current user if not already present
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tokenExists = user.fcmTokens.some(t => t.token === token);
        if (!tokenExists) {
            user.fcmTokens.push({ token, platform: platform || 'android' });
            await user.save();
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
        const { token } = req.body;
        const userId = req.user.id || req.user._id;

        await User.findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { token: token } }
        });

        res.status(200).json({ message: 'Token unregistered successfully' });
    } catch (error) {
        console.error('[FCM] Unregistration Error:', error);
        res.status(500).json({ message: 'Server error during token unregistration' });
    }
};

// Send Notification
exports.sendNotification = async (req, res) => {
    try {
        const { title, body, target, targetUserIds, data } = req.body;
        const senderId = req.user.id || req.user._id;

        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        let query = {};
        if (target === 'specific' && targetUserIds && targetUserIds.length > 0) {
            query = { _id: { $in: targetUserIds } };
        }

        const users = await User.find(query).select('fcmTokens');
        const tokens = users.flatMap(u => u.fcmTokens.map(t => t.token));
        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length === 0) {
            // Save empty notification to history anyway
            await Notification.create({
                title, body, target, targetUserIds, sentBy: senderId,
                status: 'sent',
                deliveryStats: { successCount: 0, failureCount: 0 },
                data: data || {}
            });
            return res.status(200).json({ message: 'No devices found for delivery', stats: { successCount: 0, failureCount: 0 } });
        }

        const message = {
            notification: { title, body },
            data: data || {},
            tokens: uniqueTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Save to history
        await Notification.create({
            title, body, target, targetUserIds, sentBy: senderId,
            status: 'sent',
            deliveryStats: {
                successCount: response.successCount,
                failureCount: response.failureCount
            },
            data: data || {}
        });

        res.status(200).json({
            message: 'Notification sent successfully',
            stats: {
                successCount: response.successCount,
                failureCount: response.failureCount
            }
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
