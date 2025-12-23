const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
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

    // Requirements & Tasks
    requirements: {
        type: String
    },
    tasks: [{
        type: String
    }],

    // Required Deliverables (e.g., Report, PPT, Source Code)
    deliverables: [{
        type: String
    }],

    // Deadline
    deadline: {
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

    // Project Type
    projectType: {
        type: String,
        enum: ["individual", "group"],
        default: "individual"
    },
    maxGroupSize: {
        type: Number,
        default: 1
    },

    // Skills Required
    skills: [{
        type: String
    }],

    // Status
    status: {
        type: String,
        enum: ["Active", "Assigned", "In Progress", "Submitted", "Completed", "Cancelled"],
        default: "Active"
    },

    // Reference Attachments (sample files, example reports)
    attachments: [{
        fileName: String,
        filePath: String,
        description: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Grading Info
    maxScore: {
        type: Number,
        default: 100
    },
    passingScore: {
        type: Number,
        default: 40
    },

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
ProjectSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes
ProjectSchema.index({ status: 1 });

module.exports = mongoose.model("Project", ProjectSchema);
