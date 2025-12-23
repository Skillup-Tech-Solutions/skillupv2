const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },

    // Duration & Timing
    duration: {
        type: String,
        default: ""
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    mode: {
        type: String,
        enum: ["online", "offline", "hybrid"],
        default: "online"
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    timing: {
        type: String,
        default: ""
    },

    // Pricing
    price: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },

    // Instructor
    trainer: {
        type: String
    },

    // File Uploads
    fileupload: {
        type: String // Syllabus PDF or course image
    },
    attachments: [{
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Status
    status: {
        type: String,
        enum: ["Active", "Inactive", "Completed", "Upcoming"],
        default: "Active"
    },
    showOnLandingPage: {
        type: Boolean,
        default: true
    },

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
CourseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes
CourseSchema.index({ status: 1 });

module.exports = mongoose.model("Course", CourseSchema);
