const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
    // Basic Info
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },

    // Company Info
    company: {
        type: String,
        required: true
    },
    department: {
        type: String
    },

    // Duration & Mode
    duration: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["on-site", "remote", "hybrid"],
        default: "on-site"
    },

    // Dates
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // Mentor Info
    mentor: {
        type: String,
        required: true
    },
    mentorEmail: {
        type: String
    },

    // Tasks & Responsibilities
    dailyTasks: {
        type: String
    },
    responsibilities: [{
        type: String
    }],

    // Skills
    skills: [{
        type: String
    }],

    // Compensation
    stipend: {
        type: Number,
        default: 0
    },
    stipendFrequency: {
        type: String,
        enum: ["monthly", "weekly", "one-time", "none"],
        default: "monthly"
    },

    // Status
    status: {
        type: String,
        enum: ["Active", "Completed", "Ongoing", "Upcoming", "Cancelled"],
        default: "Active"
    },

    // Attachments
    attachments: [{
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Admin who created
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
InternshipSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes
InternshipSchema.index({ status: 1 });

module.exports = mongoose.model("Internship", InternshipSchema);
