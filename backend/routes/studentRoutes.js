const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { studentOnly } = require("../middleware/roleAuth");
const submissionController = require("../controllers/submissionController");
const upload = require("../config/multer");

// Import new controllers
const studentAuthController = require("../controllers/studentAuthController");
const studentProfileController = require("../controllers/studentProfileController");

// ===== Public Routes (No Auth Required) =====

// Student Self Signup
router.post("/signup", studentAuthController.signup);

// Activate Account (from invite link)
router.post("/activate", studentAuthController.activate);

// Validate activation token
router.get("/validate-token/:token", studentAuthController.validateToken);

// ===== Protected Student Routes =====
router.use(auth);
router.use(studentOnly);

// Get my profile
router.get("/me", studentProfileController.getMe);

// Update my profile
router.put("/me", studentProfileController.updateMe);

// Get my courses
router.get("/my-courses", studentProfileController.getMyCourses);

// Get my internships
router.get("/my-internships", studentProfileController.getMyInternships);

// Get my projects
router.get("/my-projects", studentProfileController.getMyProjects);

// Get all my assignments
router.get("/my-assignments", studentProfileController.getMyAssignments);

// Get dashboard stats
router.get("/dashboard", studentProfileController.getDashboard);

// Get announcements
router.get("/announcements", studentProfileController.getAnnouncements);

// Submission routes
router.post("/submissions", submissionController.createSubmission);
router.get("/my-submissions", submissionController.getMySubmissions);
router.put("/submissions/:id/resubmit", submissionController.resubmitProject);

// ===== PROJECT WORKFLOW ROUTES =====

// Get single project assignment with all details
router.get("/projects/:assignmentId", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        })
            .populate("itemId")
            .populate("submission")
            .populate("requirementSubmission.submittedBy", "name email")
            .populate("adminReview.reviewedBy", "name email")
            .populate("deliveryFiles.uploadedBy", "name email");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const sendProjectEmail = require("../utils/sendProjectMail");

// Submit project requirement
// Submit project requirement
router.post("/projects/:assignmentId/submit-requirement", upload.array("files"), async (req, res) => {
    try {
        const { topic, projectType, collegeGuidelines, notes } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Project topic is required" });
        }

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        }).populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Don't allow if already submitted
        if (assignment.requirementSubmission?.submittedAt) {
            return res.status(400).json({ message: "Requirement already submitted" });
        }

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => ({
            fileName: file.originalname,
            filePath: file.path || file.location, // Support local or S3/B2
            uploadedAt: new Date()
        })) : [];

        assignment.requirementSubmission = {
            topic,
            projectType: projectType || "other",
            collegeGuidelines: collegeGuidelines || "",
            notes: notes || "",
            attachments: attachments,
            submittedBy: req.user.id,
            submittedByRole: "student",
            submittedAt: new Date()
        };
        assignment.status = "requirement-submitted";

        await assignment.save();

        // Send email to Admin
        await sendProjectEmail("REQUIREMENT_SUBMITTED", { email: process.env.ADMIN_EMAIL || "admin@skillup.com", name: "Admin" }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            studentName: req.user.name,
            topic: topic,
            type: projectType
        });

        // Send confirmation to student
        await sendProjectEmail("REQUIREMENT_RECEIVED", { email: req.user.email, name: req.user.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name
        });

        res.status(200).json({
            message: "Requirement submitted successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get delivery files for download
router.get("/projects/:assignmentId/delivery-files", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        }).select("deliveryFiles status");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!["ready-for-download", "delivered", "completed"].includes(assignment.status)) {
            return res.status(400).json({ message: "Files not ready for download yet" });
        }

        res.status(200).json(assignment.deliveryFiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark as delivered (when student downloads)
router.post("/projects/:assignmentId/mark-delivered", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project",
            status: "ready-for-download"
        }).populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found or not ready" });
        }

        assignment.status = "delivered";
        await assignment.save();

        const projectTitle = assignment.itemId.title || assignment.itemId.name;

        // Send email to Admin (Student Downloaded)
        await sendProjectEmail("STUDENT_DOWNLOADED", { email: process.env.ADMIN_EMAIL || "admin@skillup.com", name: "Admin" }, {
            projectTitle,
            studentName: req.user.name
        });

        // Send Feedback Request to Student
        await sendProjectEmail("FEEDBACK_REQUEST", { email: req.user.email, name: req.user.name }, {
            projectTitle
        });

        res.status(200).json({
            message: "Marked as delivered",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit feedback
router.post("/projects/:assignmentId/feedback", async (req, res) => {
    try {
        const { rating, comments } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        });

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!["delivered", "completed"].includes(assignment.status)) {
            return res.status(400).json({ message: "Can only give feedback after delivery" });
        }

        assignment.feedback = {
            rating,
            comments: comments || "",
            submittedAt: new Date()
        };

        // Mark as completed if feedback is given
        assignment.status = "completed";
        assignment.completedAt = new Date();

        await assignment.save();

        res.status(200).json({
            message: "Feedback submitted successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== COURSE WORKFLOW ROUTES =====

const b2Service = require("../utils/b2Service");


// Upload course assignment
router.post("/courses/:assignmentId/upload-assignment", upload.single("file"), async (req, res) => {
    try {
        const { notes } = req.body;

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "course"
        });

        if (!assignment) {
            return res.status(404).json({ message: "Course assignment not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "course-submissions");

        assignment.courseSubmissions.push({
            fileName: req.file.originalname,
            filePath: uploadResult.url,
            uploadedBy: req.user.id,
            uploadedByRole: "student",
            uploadedAt: new Date(),
            notes: notes || ""
        });

        await assignment.save();

        res.status(200).json({
            message: "Assignment uploaded successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== PAYMENT PROOF UPLOAD =====

// Upload payment proof for any assignment type (course/project/internship)
router.post("/assignments/:assignmentId/upload-payment-proof", upload.single("proofFile"), async (req, res) => {
    try {
        const { paymentMethod, transactionId } = req.body;

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id
        }).populate("itemId").populate("student", "name email");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (assignment.payment?.status !== "pending") {
            return res.status(400).json({ message: "Payment is not pending for this assignment" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No proof file uploaded" });
        }

        // Upload to B2
        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "payment-proofs");

        // Update payment with proof details
        assignment.payment.proofFile = uploadResult.url;
        assignment.payment.proofUploadedAt = new Date();
        assignment.payment.paymentMethod = paymentMethod || "other";
        if (transactionId) {
            assignment.payment.transactionId = transactionId;
        }

        await assignment.save();

        // Notify Admin
        const itemName = assignment.itemId?.name || assignment.itemId?.title || "Item";
        const itemType = assignment.itemType.charAt(0).toUpperCase() + assignment.itemType.slice(1);

        // Send email notification to admin
        try {
            const sendProjectEmail = require("../utils/sendProjectMail");
            await sendProjectEmail("PAYMENT_PROOF_UPLOADED", {
                email: process.env.ADMIN_EMAIL || "admin@skillup.com",
                name: "Admin"
            }, {
                studentName: req.user.name,
                itemType: itemType,
                itemName: itemName,
                amount: assignment.payment.amount,
                paymentMethod: paymentMethod || "other"
            });
        } catch (emailErr) {
            console.error("Failed to send admin notification:", emailErr);
        }

        res.status(200).json({
            message: "Payment proof uploaded successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

