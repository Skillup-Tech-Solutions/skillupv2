const mongoose = require("mongoose");

/**
 * DeviceSession Model
 * Tracks user devices for multi-device login and session management
 * Binds FCM tokens directly to devices for targeted push notifications
 */
const deviceSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    deviceName: {
        type: String,
        default: "Unknown Device"
    },
    platform: {
        type: String,
        enum: ["android", "ios", "web"],
        default: "web"
    },
    userAgent: {
        type: String,
        default: ""
    },
    ipAddress: {
        type: String,
        default: ""
    },
    fcmToken: {
        type: String,
        default: null
    },
    lastActiveAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    revokedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound indexes for efficient queries
deviceSessionSchema.index({ userId: 1, isActive: 1 });
deviceSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
deviceSessionSchema.index({ fcmToken: 1 }, { sparse: true });

// Update lastActiveAt timestamp
deviceSessionSchema.methods.touch = function () {
    this.lastActiveAt = new Date();
    return this.save();
};

// Revoke session
deviceSessionSchema.methods.revoke = function () {
    this.isActive = false;
    this.revokedAt = new Date();
    this.fcmToken = null;
    return this.save();
};

// Static method to get all active sessions for a user
deviceSessionSchema.statics.getActiveSessionsForUser = function (userId) {
    return this.find({ userId, isActive: true }).sort({ lastActiveAt: -1 });
};

// Static method to get all FCM tokens for a user
deviceSessionSchema.statics.getFcmTokensForUser = function (userId) {
    return this.find({ userId, isActive: true, fcmToken: { $ne: null } })
        .select('fcmToken platform deviceId');
};

// Static method to revoke all sessions except current
deviceSessionSchema.statics.revokeAllExcept = async function (userId, currentDeviceId) {
    const sessions = await this.find({
        userId,
        isActive: true,
        deviceId: { $ne: currentDeviceId }
    });

    for (const session of sessions) {
        await session.revoke();
    }

    return sessions.length;
};

module.exports = mongoose.model("DeviceSession", deviceSessionSchema);
