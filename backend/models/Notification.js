const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    target: {
        type: String,
        enum: ['all', 'specific'],
        default: 'all'
    },
    targetUserIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    deliveryStats: {
        successCount: { type: Number, default: 0 },
        failureCount: { type: Number, default: 0 }
    },
    // Per-user delivery tracking
    deliveryResults: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['delivered', 'failed', 'pending'], default: 'pending' },
        deviceId: { type: String },
        platform: { type: String },
        errorCode: { type: String },
        errorMessage: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
