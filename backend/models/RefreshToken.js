const mongoose = require("mongoose");

/**
 * RefreshToken Model
 * Stores refresh tokens for persistent user sessions
 */
const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    userAgent: {
        type: String,
        default: ""
    },
    ipAddress: {
        type: String,
        default: ""
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// TTL index to auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for user lookup
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
