const Submission = require("../models/Submission");
const StudentAssignment = require("../models/StudentAssignment");
const User = require("../models/User");
const Project = require("../models/Project");

// Get all submissions (Admin only)
exports.getAllSubmissions = async (req, res) => {
    try {
        const { status, projectId } = req.query;

        const query = {};
        if (status) query.status = status;
        if (projectId) query.project = projectId;

        const submissions = await Submission.find(query)
            .populate('student', 'name email')
            .populate('project', 'name description')
            .populate('reviewedBy', 'name email')
            .sort({ submittedAt: -1 });

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get submission by ID (Admin)
exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('student', 'name email mobile')
            .populate('project', 'name description requirements')
            .populate('reviewedBy', 'name email');

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.status(200).json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Review submission - provide feedback (Admin only)
exports.reviewSubmission = async (req, res) => {
    const { status, feedback, grade } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }

    if (!["submitted", "under-review", "approved", "rejected", "needs-revision"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const updated = await Submission.findByIdAndUpdate(
            req.params.id,
            {
                status,
                feedback,
                grade,
                reviewedBy: req.user.id,
                reviewedAt: Date.now()
            },
            { new: true }
        ).populate('student', 'name email')
            .populate('project', 'name');

        // If approved, update the assignment progress to 100%
        if (status === "approved" && submission.assignment) {
            await StudentAssignment.findByIdAndUpdate(
                submission.assignment,
                { progress: 100, status: "completed", completedAt: Date.now() }
            );
        }

        res.status(200).json({
            message: "Submission reviewed successfully",
            submission: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create submission (Student only)
exports.createSubmission = async (req, res) => {
    const { projectId, fileUpload, fileName, description } = req.body;

    if (!projectId || !fileUpload) {
        return res.status(400).json({ message: "Project ID and file upload are required" });
    }

    try {
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if student has this project assigned
        const assignment = await StudentAssignment.findOne({
            student: req.user.id,
            itemType: "project",
            itemId: projectId
        });

        if (!assignment) {
            return res.status(403).json({ message: "This project is not assigned to you" });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({
            student: req.user.id,
            project: projectId,
            status: { $nin: ["rejected", "needs-revision"] }
        });

        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this project" });
        }

        const submission = await Submission.create({
            student: req.user.id,
            project: projectId,
            assignment: assignment._id,
            fileUpload,
            fileName,
            description,
            status: "submitted"
        });

        // Update assignment status to in-progress and link submission
        await StudentAssignment.findByIdAndUpdate(assignment._id, {
            status: "in-progress",
            progress: 50,
            submission: submission._id
        });

        res.status(201).json({
            message: "Submission created successfully",
            submission
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get student's own submissions (Student only)
exports.getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ student: req.user.id })
            .populate('project', 'name description dueDate')
            .populate('reviewedBy', 'name')
            .sort({ submittedAt: -1 });

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Resubmit project (Student only - for rejected or needs-revision)
exports.resubmitProject = async (req, res) => {
    const { fileUpload, fileName, description } = req.body;

    if (!fileUpload) {
        return res.status(400).json({ message: "File upload is required" });
    }

    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        if (submission.student.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!["rejected", "needs-revision"].includes(submission.status)) {
            return res.status(400).json({ message: "Can only resubmit rejected or needs-revision submissions" });
        }

        const updated = await Submission.findByIdAndUpdate(
            req.params.id,
            {
                fileUpload,
                fileName,
                description,
                status: "submitted",
                submittedAt: Date.now(),
                feedback: null,
                reviewedBy: null,
                reviewedAt: null
            },
            { new: true }
        );

        res.status(200).json({
            message: "Project resubmitted successfully",
            submission: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
