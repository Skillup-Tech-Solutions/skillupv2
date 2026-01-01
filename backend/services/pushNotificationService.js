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
            }).select('userId fcmToken deviceId platform');
        } else {
            deviceSessions = await DeviceSession.find({
                isActive: true,
                fcmToken: { $ne: null }
            }).select('userId fcmToken deviceId platform');
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
        if (deviceSessions.length > 0) {
            const channelMap = {
                'alert': 'skillup_alerts',
                'update': 'skillup_updates',
                'promo': 'skillup_promotions'
            };

            const priority = data?.priority || 'alert';
            const channelId = channelMap[priority] || 'skillup_alerts';
            const imageUrl = data?.image || data?.imageUrl || null;

            // Group tokens by platform for specialized payloads
            const androidTokens = [...new Set(deviceSessions.filter(s => s.platform === 'android').map(s => s.fcmToken))];
            const otherTokens = [...new Set(deviceSessions.filter(s => s.platform !== 'android').map(s => s.fcmToken))];

            const results = { successCount: 0, failureCount: 0, tokensToRemove: [] };

            const sendBatch = async (tokens, isAndroid) => {
                if (tokens.length === 0) return;

                const message = {
                    // Critical: On Android, we avoid the 'image' field in the 'notification' block 
                    // to prevent the OS from using it as a square thumbnail. 
                    // Instead, we pass it in 'data' for our custom MessagingService.java.
                    notification: {
                        title,
                        body,
                        ...(!isAndroid && imageUrl && { image: imageUrl })
                    },
                    data: {
                        ...data,
                        title, // Re-pass for reliability in custom service
                        body,
                        ...(imageUrl && { imageUrl: imageUrl, image: imageUrl }),
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
                            sound: 'default'
                            // Note: intentionally omitting imageUrl here too for the custom builder
                        }
                    },
                    apns: {
                        payload: { aps: { sound: 'default', badge: 1 } }
                    },
                    tokens: tokens,
                };

                const response = await admin.messaging().sendEachForMulticast(message);
                results.successCount += response.successCount;
                results.failureCount += response.failureCount;

                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        const errorMessage = resp.error?.message;
                        console.error(`[Push Service] Delivery failure for ${isAndroid ? 'Android' : 'Other'} token ${tokens[idx]}: ${errorCode} - ${errorMessage}`);

                        if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/unregistered'].includes(errorCode)) {
                            results.tokensToRemove.push(tokens[idx]);
                        }
                    }
                });
            };

            await Promise.all([
                sendBatch(androidTokens, true),
                sendBatch(otherTokens, false)
            ]);

            // Update stats in database
            await Notification.updateOne(
                { _id: notification._id },
                {
                    $set: {
                        'deliveryStats.successCount': results.successCount,
                        'deliveryStats.failureCount': results.failureCount,
                        status: results.successCount > 0 ? 'sent' : 'failed'
                    }
                }
            );

            if (results.tokensToRemove.length > 0) {
                await DeviceSession.updateMany(
                    { fcmToken: { $in: results.tokensToRemove } },
                    { $set: { fcmToken: null } }
                );
            }

            return {
                success: true,
                successCount: results.successCount,
                failureCount: results.failureCount,
                staleTokensRemoved: results.tokensToRemove.length
            };
        }

        return { success: true, message: 'No devices with FCM tokens found' };
    } catch (error) {
        console.error('[Push Service] Error:', error);
        throw error;
    }
};
