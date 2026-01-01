const DeviceSession = require("../models/DeviceSession");
const RefreshToken = require("../models/RefreshToken");
const { emitDeviceRevoked, emitAllDevicesRevoked } = require("../services/socketService");

/**
 * Device Session Controller
 * Manages user device sessions for multi-device login handling
 */

// Get all active devices for the current user
exports.getDeviceSessions = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const currentDeviceId = req.headers['x-device-id'];

        const sessions = await DeviceSession.getActiveSessionsForUser(userId);

        // Mark the current device in the response
        const sessionsWithCurrentFlag = sessions.map(session => ({
            _id: session._id,
            deviceId: session.deviceId,
            deviceName: session.deviceName,
            platform: session.platform,
            lastActiveAt: session.lastActiveAt,
            createdAt: session.createdAt,
            isCurrent: session.deviceId === currentDeviceId,
            hasFcmToken: !!session.fcmToken
        }));

        res.status(200).json({
            count: sessions.length,
            devices: sessionsWithCurrentFlag
        });
    } catch (error) {
        console.error('[DeviceSession] Get sessions error:', error);
        res.status(500).json({ message: 'Failed to fetch device sessions' });
    }
};

// Revoke a single device session
exports.revokeSession = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const sessionId = req.params.id;
        const currentDeviceId = req.headers['x-device-id'];

        const session = await DeviceSession.findOne({
            _id: sessionId,
            userId: userId,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ message: 'Device session not found' });
        }

        // Prevent revoking current device through this endpoint
        if (session.deviceId === currentDeviceId) {
            return res.status(400).json({
                message: 'Cannot revoke current device. Use logout instead.'
            });
        }

        // Revoke the session
        await session.revoke();

        // Also revoke all refresh tokens for this device session
        await RefreshToken.updateMany(
            { deviceSessionId: session._id },
            { isRevoked: true }
        );

        console.log(`[DeviceSession] Revoked session for device: ${session.deviceId}`);

        // Emit socket event to force immediate logout on revoked device
        emitDeviceRevoked(userId, session.deviceId, session.deviceName);

        res.status(200).json({
            message: 'Device session revoked successfully',
            revokedDevice: session.deviceName
        });
    } catch (error) {
        console.error('[DeviceSession] Revoke session error:', error);
        res.status(500).json({ message: 'Failed to revoke device session' });
    }
};

// Revoke all device sessions except current
exports.revokeAllSessions = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const currentDeviceId = req.headers['x-device-id'];

        if (!currentDeviceId) {
            return res.status(400).json({
                message: 'Device ID header (x-device-id) is required'
            });
        }

        // Get all sessions to revoke (except current)
        const sessionsToRevoke = await DeviceSession.find({
            userId,
            isActive: true,
            deviceId: { $ne: currentDeviceId }
        });

        // Revoke each session and its refresh tokens
        for (const session of sessionsToRevoke) {
            await session.revoke();
            await RefreshToken.updateMany(
                { deviceSessionId: session._id },
                { isRevoked: true }
            );
        }

        console.log(`[DeviceSession] Revoked ${sessionsToRevoke.length} sessions for user: ${userId}`);

        // Emit socket event to force immediate logout on all revoked devices
        emitAllDevicesRevoked(userId, currentDeviceId);

        res.status(200).json({
            message: 'All other devices logged out successfully',
            revokedCount: sessionsToRevoke.length
        });
    } catch (error) {
        console.error('[DeviceSession] Revoke all sessions error:', error);
        res.status(500).json({ message: 'Failed to revoke device sessions' });
    }
};

// Helper function to create or update device session (used by login)
exports.createOrUpdateSession = async (userId, deviceInfo, ipAddress, userAgent) => {
    const { deviceId, deviceName, platform } = deviceInfo;

    let session = await DeviceSession.findOne({ userId, deviceId });

    if (session) {
        // Reactivate if revoked, update last active
        session.isActive = true;
        session.revokedAt = null;
        session.lastActiveAt = new Date();
        session.ipAddress = ipAddress;
        session.userAgent = userAgent;
        if (deviceName) session.deviceName = deviceName;
        if (platform) session.platform = platform;
        await session.save();
    } else {
        // Create new session
        session = await DeviceSession.create({
            userId,
            deviceId,
            deviceName: deviceName || 'Unknown Device',
            platform: platform || 'web',
            ipAddress,
            userAgent,
            lastActiveAt: new Date()
        });
    }

    return session;
};

// Update last active timestamp (called by middleware)
exports.updateLastActive = async (userId, deviceId) => {
    if (!deviceId) return;

    await DeviceSession.updateOne(
        { userId, deviceId, isActive: true },
        { $set: { lastActiveAt: new Date() } }
    );
};
