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
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
