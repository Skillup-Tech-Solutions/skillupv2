const mongoose = require("mongoose");
const crypto = require("crypto");

const LiveSessionSchema = new mongoose.Schema({
    // Basic Info
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },

    // Session Type & Reference
    sessionType: {
        type: String,
        enum: ["COURSE", "PROJECT", "INTERNSHIP"],
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'sessionType'
    },
    referenceName: {
        type: String,
        default: ""
    },

    // Host Information
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hostName: {
        type: String,
        default: ""
    },

    // Scheduling
    scheduledAt: {
        type: Date,
        required: true
    },
    durationMinutes: {
        type: Number,
        default: 60
    },

    // Session Status
    status: {
        type: String,
        enum: ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"],
        default: "SCHEDULED"
    },

    // Meeting Details
    roomId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Participant Tracking (includes userId and device info for transfer feature)
    participants: [{
        userId: String, // Unique user identifier
        name: String,
        email: String,
        deviceId: String, // Device identifier for multi-device support
        platform: { type: String, enum: ['android', 'ios', 'web'], default: 'web' },
        joinedAt: { type: Date, default: Date.now },
        leftAt: Date
    }],
    maxParticipants: {
        type: Number,
        default: 0
    },

    // Session Lifecycle Timestamps
    startedAt: Date,
    endedAt: Date,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-update updatedAt on save
LiveSessionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Generate unique room ID with crypto-secure random if not set
    if (!this.roomId) {
        const prefix = this.sessionType.toLowerCase().substring(0, 3);
        const timestamp = Date.now().toString(36);
        // Use crypto for secure random component
        const randomBytes = crypto.randomBytes(8).toString('hex');
        this.roomId = `skillup-${prefix}-${timestamp}-${randomBytes}`;
    }

    next();
});

// Indexes for efficient querying
LiveSessionSchema.index({ status: 1 });
LiveSessionSchema.index({ sessionType: 1, referenceId: 1 });
LiveSessionSchema.index({ scheduledAt: 1 });
LiveSessionSchema.index({ hostId: 1 });

module.exports = mongoose.model("LiveSession", LiveSessionSchema);
