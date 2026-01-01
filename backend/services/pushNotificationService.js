const admin = require('firebase-admin');
const DeviceSession = require('../models/DeviceSession');
const Notification = require('../models/Notification');
const { emitNotification, emitNotificationToAll } = require('./socketService');

// Initialize Firebase Admin if not already initialized
try {
    if (!admin.apps.length) {
        let credential;

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
        } else {
            try {
                const serviceAccount = require('../config/firebase-service-account.json');
                credential = admin.credential.cert(serviceAccount);
            } catch (fileError) {
                console.warn('[Firebase] No credentials found - push notifications will not work');
            }
        }

        if (credential) {
            admin.initializeApp({ credential });
            console.log('[Firebase] Admin SDK initialized in Push Service');
        }
    }
} catch (error) {
    console.error('[Firebase] Init Error:', error.message);
}

/**
 * Send notification to users via FCM and Socket.IO
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification message body
 * @param {string} options.target - 'all' or 'specific'
 * @param {Array} [options.targetUserIds] - Required if target is 'specific'
 * @param {Object} [options.data] - Custom data payload
 * @param {string} [options.senderId] - ID of the user sending the notification
 */
exports.sendNotification = async ({ title, body, target, targetUserIds, data = {}, senderId = null }) => {
    try {
        let deviceSessions;
        if (target === 'specific' && targetUserIds && targetUserIds.length > 0) {
            deviceSessions = await DeviceSession.find({
                userId: { $in: targetUserIds },
                isActive: true,
                fcmToken: { $ne: null }
            }).select('userId fcmToken deviceId');
        } else {
            deviceSessions = await DeviceSession.find({
                isActive: true,
                fcmToken: { $ne: null }
            }).select('userId fcmToken deviceId');
        }

        const actualUserIds = [...new Set(deviceSessions.map(s => s.userId.toString()))];
        const tokens = deviceSessions.map(s => s.fcmToken);
        const uniqueTokens = [...new Set(tokens)];

        // 1. Save to History
        const notification = await Notification.create({
            title,
            body,
            target,
            targetUserIds: actualUserIds,
            sentBy: senderId,
            status: 'sent',
            data: data || {}
        });

        // 2. Emit via Socket.IO for in-app real-time feedback
        const socketPayload = {
            _id: notification._id,
            title,
            body,
            data: data || {},
            createdAt: notification.createdAt
        };

        if (target === 'specific') {
            actualUserIds.forEach(uid => emitNotification(uid, socketPayload));
        } else {
            emitNotificationToAll(socketPayload);
        }

        // 3. Send via FCM for background/push delivery
        if (uniqueTokens.length > 0) {
            const channelMap = {
                'alert': 'skillup_alerts',
                'update': 'skillup_updates',
                'promo': 'skillup_promotions'
            };

            const priority = data?.priority || 'alert';
            const channelId = channelMap[priority] || 'skillup_alerts';
            const imageUrl = data?.image || data?.imageUrl || null;

            const message = {
                notification: {
                    title,
                    body,
                    ...(imageUrl && { image: imageUrl })
                },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    channel_id: channelId,
                    priority: priority
                },
                android: {
                    priority: priority === 'alert' ? 'high' : 'normal',
                    notification: {
                        channelId: channelId,
                        icon: 'ic_notification',
                        color: '#3b82f6',
                        sound: 'default',
                        ...(imageUrl && { imageUrl: imageUrl })
                    }
                },
                apns: {
                    payload: { aps: { sound: 'default', badge: 1 } }
                },
                tokens: uniqueTokens,
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            // Update stats in database
            await Notification.updateOne(
                { _id: notification._id },
                {
                    $set: {
                        'deliveryStats.successCount': response.successCount,
                        'deliveryStats.failureCount': response.failureCount,
                        status: response.successCount > 0 ? 'sent' : 'failed'
                    }
                }
            );

            // Clean up stale tokens
            const tokensToRemove = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    const errorMessage = resp.error?.message;
                    console.error(`[Push Service] Delivery failure for token ${uniqueTokens[idx]}: ${errorCode} - ${errorMessage}`);

                    if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/unregistered'].includes(errorCode)) {
                        tokensToRemove.push(uniqueTokens[idx]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                await DeviceSession.updateMany(
                    { fcmToken: { $in: tokensToRemove } },
                    { $set: { fcmToken: null } }
                );
            }

            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                staleTokensRemoved: tokensToRemove.length
            };
        }

        return { success: true, message: 'No devices with FCM tokens found' };
    } catch (error) {
        console.error('[Push Service] Error:', error);
        throw error;
    }
};
