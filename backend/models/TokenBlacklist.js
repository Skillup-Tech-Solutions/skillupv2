const mongoose = require("mongoose");

/**
 * TokenBlacklist Model
 * Stores revoked access tokens (for logout functionality)
 * Uses TTL index to auto-delete expired entries
 */
const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reason: {
        type: String,
        enum: ["logout", "password_change", "admin_revoke"],
        default: "logout"
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// TTL index - MongoDB will auto-delete documents after expiresAt
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
