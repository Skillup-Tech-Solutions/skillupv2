const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    targetAudience: {
        type: String,
        enum: ["all", "students"],
        default: "all"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
announcementSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes
announcementSchema.index({ isActive: 1, targetAudience: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
