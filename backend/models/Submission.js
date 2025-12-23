const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentAssignment",
        required: false
    },
    fileUpload: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ["submitted", "under-review", "approved", "rejected", "needs-revision"],
        default: "submitted"
    },
    feedback: {
        type: String
    },
    grade: {
        type: String
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviewedAt: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
submissionSchema.index({ student: 1, project: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
