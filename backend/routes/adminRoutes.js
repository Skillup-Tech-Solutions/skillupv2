const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleAuth");

// Controllers
const studentController = require("../controllers/studentController");
const assignmentController = require("../controllers/assignmentController");
const internshipController = require("../controllers/internshipController");
const projectController = require("../controllers/projectController");
const announcementController = require("../controllers/announcementController");
const submissionController = require("../controllers/submissionController");
const sendProjectEmail = require("../utils/sendProjectMail");
const sendCourseMail = require("../utils/sendCourseMail");
const projectFlowController = require("../controllers/projectFlowController");

// All routes require authentication and admin role
router.use(auth);
router.use(adminOnly);

// ===== Student Management Routes =====
router.post("/students", studentController.createStudent);
router.get("/students", studentController.getAllStudents);
router.get("/students/:id", studentController.getStudentById);
router.put("/students/:id", studentController.updateStudent);
router.delete("/students/:id", studentController.deleteStudent);
router.post("/students/:id/suspend", studentController.suspendStudent);
router.post("/students/:id/activate", studentController.activateStudent);
router.post("/students/:id/invite", studentController.sendInvite);
router.post("/students/:id/resend-invite", studentController.resendInvite);

// ===== Assignment Routes =====
router.post("/assignments", assignmentController.assignToStudent);
router.post("/assignments/bulk", assignmentController.bulkAssignToStudent);
router.delete("/assignments/:id", assignmentController.removeAssignment);
router.put("/assignments/:id/progress", assignmentController.updateProgress);
router.get("/assignments/student/:studentId", assignmentController.getStudentAssignments);
router.get("/students/:id/assignments", assignmentController.getStudentAssignments); // Alias for StudentDetail page
router.get("/assignments", assignmentController.getAllAssignments);

// ===== Internship Routes =====
router.post("/internships", internshipController.createInternship);
router.get("/internships", internshipController.getAllInternships);
router.get("/internships/:id", internshipController.getInternshipById);
router.put("/internships/:id", internshipController.updateInternship);
router.delete("/internships/:id", internshipController.deleteInternship);
router.post("/internships/:id/toggle-status", internshipController.toggleInternshipStatus);

// ===== Project Routes =====
router.post("/projects", projectController.createProject);
router.get("/projects", projectController.getAllProjects);
router.get("/projects/:id", projectController.getProjectById);
router.put("/projects/:id", projectController.updateProject);
router.delete("/projects/:id", projectController.deleteProject);
router.post("/projects/:id/toggle-status", projectController.toggleProjectStatus);

// ===== Announcement Routes =====
router.post("/announcements", announcementController.createAnnouncement);
router.get("/announcements", announcementController.getAllAnnouncements);
router.get("/announcements/:id", announcementController.getAnnouncementById);
router.put("/announcements/:id", announcementController.updateAnnouncement);
router.delete("/announcements/:id", announcementController.deleteAnnouncement);
router.post("/announcements/:id/toggle-status", announcementController.toggleAnnouncementStatus);

// ===== Submission Routes =====
router.get("/submissions", submissionController.getAllSubmissions);
router.get("/submissions/:id", submissionController.getSubmissionById);
router.put("/submissions/:id/review", submissionController.reviewSubmission);

// PROJECT WORKFLOW ROUTES (Admin) =====
const reportController = require("../controllers/reportController");

// Reports
router.get("/project-assignments/report", reportController.generateProjectReport);

// New Flow Routes
router.post("/project-assignments/:id/trigger-email", projectFlowController.triggerAssignmentEmail);
router.post("/project-assignments/:id/resend-email", projectFlowController.resendAssignmentEmail);
router.post("/project-assignments/:id/submit-requirement", projectFlowController.submitRequirementAdmin); // Overrides old inline if placed correctly or need to remove old one
router.post("/project-assignments/:id/request-advance", projectFlowController.requestAdvancePayment);
router.post("/project-assignments/:id/start-work", projectFlowController.markInProgress);
router.post("/project-assignments/:id/ready-for-demo", projectFlowController.markReadyForDemo);
router.post("/project-assignments/:id/request-final", projectFlowController.requestFinalPayment);
router.post("/project-assignments/:id/ready-for-download", projectFlowController.markReadyForDownload);
router.post("/project-assignments/:id/delivered", projectFlowController.markDelivered);

const b2Service = require("../utils/b2Service");
const StudentAssignment = require("../models/StudentAssignment");

// File upload config (Memory storage from global config or inline)
// We already updated config/multer.js to use memory storage, so we can require it or use inline memory storage if specific limtis needed.
// Reusing the global one is cleaner if limits match.
const upload = require("../config/multer");

// Payment controller (admin)
const paymentController = require("../controllers/paymentController");

// Admin Payment Settings endpoints
router.get('/payment/settings', paymentController.getSettings);
router.put('/payment/settings', paymentController.updateSettings);
router.post('/payment/settings/upload-qr', upload.single('qr'), paymentController.uploadQR);

// Get all project assignments
router.get("/project-assignments", async (req, res) => {
    try {
        const { status } = req.query;
        const query = { itemType: "project" };

        if (status) {
            query.status = status;
        }

        const assignments = await StudentAssignment.find(query)
            .populate("student", "name email mobile")
            .populate("itemId")
            .populate("requirementSubmission.submittedBy", "name email")
            .populate("assignedBy", "name email")
            .sort({ assignedAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all project assignments with submitted requirements
router.get("/project-requirements", async (req, res) => {
    try {
        const { status } = req.query;
        const query = { itemType: "project" };

        if (status) {
            query.status = status;
        }

        const assignments = await StudentAssignment.find(query)
            .populate("student", "name email mobile")
            .populate("itemId")
            .populate("requirementSubmission.submittedBy", "name email")
            .populate("assignedBy", "name email")
            .sort({ "requirementSubmission.submittedAt": -1, assignedAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single project assignment details
router.get("/project-assignments/:id", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email mobile")
            .populate("itemId")
            .populate("requirementSubmission.submittedBy", "name email")
            .populate("adminReview.reviewedBy", "name email")
            .populate("deliveryFiles.uploadedBy", "name email")
            .populate("assignedBy", "name email");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin submits requirement on behalf of student - MOVED to projectFlowController
// router.post("/project-assignments/:id/submit-requirement", async (req, res) => { ... });

// Admin reviews/approves requirement
router.put("/project-assignments/:id/review", async (req, res) => {
    try {
        const { approved, notes } = req.body;

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.adminReview = {
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            notes: notes || "",
            approved: approved !== false // Default to true
        };

        assignment.status = approved !== false ? "in-progress" : "under-review";

        await assignment.save();

        const projectTitle = assignment.itemId.title || assignment.itemId.name;
        const recipient = { email: assignment.student.email, name: assignment.student.name };

        if (approved !== false) {
            await sendProjectEmail("REQUIREMENT_APPROVED", recipient, { projectTitle });
        } else {
            await sendProjectEmail("REQUIREMENT_REJECTED", recipient, {
                projectTitle,
                rejectionReason: notes
            });
        }

        res.status(200).json({
            message: approved !== false ? "Requirement approved, project in progress" : "Under review, awaiting more info",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update payment status
router.put("/project-assignments/:id/payment", async (req, res) => {
    try {
        const { required, amount, status, notes } = req.body;

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.payment = {
            required: required || false,
            amount: amount || 0,
            status: status || "not-required",
            paidAt: status === "paid" ? new Date() : undefined,
            notes: notes || ""
        };

        if (status === "pending" && assignment.status === "under-review") {
            assignment.status = "payment-pending";
        }

        await assignment.save();

        const projectTitle = assignment.itemId.title || assignment.itemId.name;
        const recipient = { email: assignment.student.email, name: assignment.student.name };

        if (status === "pending") {
            await sendProjectEmail("PAYMENT_REQUEST", recipient, {
                projectTitle,
                projectId: assignment.itemId?._id,
                assignmentId: assignment._id,
                paymentAmount: amount
            });
        } else if (status === "paid") {
            await sendProjectEmail("PAYMENT_CONFIRMATION", recipient, { projectTitle });
        }

        res.status(200).json({
            message: "Payment status updated",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload delivery files
router.post("/project-assignments/:id/upload-files", upload.array("files", 10), async (req, res) => {
    try {
        console.log("Upload files hit. ID:", req.params.id);
        const { fileTypes } = req.body; // JSON array of file types

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        const originalStatus = assignment ? assignment.status : null;

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const parsedTypes = fileTypes ? JSON.parse(fileTypes) : [];
        const newFiles = [];

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            try {
                const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "deliveries");
                newFiles.push({
                    fileName: uploadResult.fileName, // Use B2 filename which has timestamp
                    filePath: uploadResult.url, // Store the B2 URL instead of local path
                    fileType: parsedTypes[index] || "project-file",
                    uploadedBy: req.user.id,
                    uploadedAt: new Date(),
                    fileId: uploadResult.fileId // Optionally store fileId
                });
            } catch (uErr) {
                console.error("Error uploading file to B2:", uErr);
                // Continue or abort? Let's continue but maybe warn?
            }
        }

        assignment.deliveryFiles.push(...newFiles);
        assignment.status = "ready-for-download";

        await assignment.save();

        // Send email to Student ONLY if this is the first upload (status change)
        // If status was already 'ready-for-download' or 'delivered', do not spam
        if (!["ready-for-download", "delivered"].includes(originalStatus)) {
            await sendProjectEmail("PROJECT_READY", { email: assignment.student.email, name: assignment.student.name }, {
                projectTitle: assignment.itemId.title || assignment.itemId.name,
                filesList: newFiles.map(f => f.fileName).join(", ")
            });
        }

        res.status(200).json({
            message: "Files uploaded successfully",
            files: newFiles,
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update project status manually
router.put("/project-assignments/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = [
            "assigned", "requirement-submitted", "requirement-submitted-admin",
            "under-review", "payment-pending", "in-progress",
            "ready-for-download", "delivered", "completed"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.status = status;

        if (status === "completed") {
            assignment.completedAt = new Date();
        }

        await assignment.save();

        const projectTitle = assignment.itemId.title || assignment.itemId.name;
        const recipient = { email: assignment.student.email, name: assignment.student.name };

        if (status === "in-progress") {
            await sendProjectEmail("PROJECT_STARTED", recipient, { projectTitle });
        } else if (status === "completed") {
            await sendProjectEmail("PROJECT_COMPLETED", recipient, { projectTitle });
        }

        res.status(200).json({
            message: "Status updated",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== COURSE WORKFLOW ROUTES (Admin) =====

// Upload course submission on behalf of student
router.post("/course-assignments/:id/upload-submission", upload.single("file"), async (req, res) => {
    try {
        const { notes } = req.body;

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "course-submissions");

        assignment.courseSubmissions.push({
            fileName: req.file.originalname,
            filePath: uploadResult.url,
            uploadedBy: req.user.id,
            uploadedByRole: "admin",
            uploadedAt: new Date(),
            notes: notes || ""
        });

        await assignment.save();

        res.status(200).json({
            message: "Submission uploaded successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Complete course and upload certificate
router.post("/course-assignments/:id/complete", upload.single("certificate"), async (req, res) => {
    try {
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email").populate("itemId", "name"); // Populate name for email

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.status = "completed";
        assignment.completedAt = new Date();

        let emailAttachments = [];

        if (req.file) {
            const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "certificates");
            assignment.certificate = {
                url: uploadResult.url,
                issuedAt: new Date(),
                issuedBy: req.user.id
            };

            // Prepare attachment for email
            emailAttachments.push({
                ContentType: "application/pdf",
                Filename: req.file.originalname,
                Base64Content: req.file.buffer.toString("base64")
            });
        }

        await assignment.save();

        // Send Completion Email
        const sendCourseMail = require("../utils/sendCourseMail");
        try {
            await sendCourseMail("COURSE_COMPLETED",
                { email: assignment.student.email, name: assignment.student.name },
                { courseName: assignment.itemId.name },
                emailAttachments
            );
        } catch (mailErr) {
            console.error("Error sending completion email:", mailErr);
            // Continue execution, do not fail the request
        }

        res.status(200).json({
            message: "Course completed and certificate issued",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload internship submission on behalf of student (Single file - Legacy/Submission)
router.post("/internship-assignments/:id/upload-submission", upload.single("file"), async (req, res) => {
    try {
        const { notes } = req.body;

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "course-submissions"); // Reuse bucket

        assignment.courseSubmissions.push({
            fileName: req.file.originalname,
            filePath: uploadResult.url,
            uploadedBy: req.user.id,
            uploadedByRole: "admin",
            uploadedAt: new Date(),
            notes: notes || ""
        });

        await assignment.save();

        res.status(200).json({
            message: "Submission uploaded successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// --- Course Payment Routes ---

router.post("/course-assignments/:id/request-payment", async (req, res) => {
    try {
        const { amount, notes } = req.body;
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email").populate("itemId", "name");
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        assignment.payment = {
            required: true,
            amount: amount,
            status: "pending",
            notes: notes
        };
        assignment.status = "advance-payment-pending"; // Utilizing existing enum for "Payment Pending"
        await assignment.save();

        // Send Email
        await sendCourseMail("PAYMENT_REQUEST", { email: assignment.student.email, name: assignment.student.name }, {
            courseName: assignment.itemId.name,
            amount: amount,
            notes: notes
        });

        res.json({ message: "Payment requested successfully", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/course-assignments/:id/mark-paid", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email").populate("itemId", "name");
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        assignment.payment.status = "paid";
        assignment.payment.paidAt = new Date();

        // Move to in-progress if strictly waiting for payment, or keep current if valid
        if (assignment.status === "advance-payment-pending") {
            assignment.status = "in-progress";
        }

        await assignment.save();

        // Send Email
        await sendCourseMail("PAYMENT_RECEIVED", { email: assignment.student.email, name: assignment.student.name }, {
            courseName: assignment.itemId.name,
            amount: assignment.payment.amount,
            transactionId: "CASH/MANUAL" // Placeholder
        });

        res.json({ message: "Marked as paid", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Upload delivery files for Internship (Multiple files - Admin to Student)
router.post("/internship-assignments/:id/upload-files", upload.array("files", 10), async (req, res) => {
    try {
        const { fileTypes } = req.body;
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const parsedTypes = fileTypes ? JSON.parse(fileTypes) : [];
        const newFiles = [];

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            try {
                const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "deliveries");
                newFiles.push({
                    fileName: uploadResult.fileName,
                    filePath: uploadResult.url,
                    fileType: parsedTypes[index] || "other",
                    uploadedBy: req.user.id,
                    uploadedAt: new Date()
                });
            } catch (uErr) {
                console.error("Error uploading file to B2:", uErr);
            }
        }

        assignment.deliveryFiles.push(...newFiles);
        // Only update status if currently active? Or just leave it?
        // Projects set it to 'ready-for-download'. Internships might not have that status.
        // Let's check Schema. Status enum: ... "ready-for-download", "delivered" ...
        // Yes, StudentAssignment schema supports "ready-for-download" for all types.
        if (assignment.status === "assigned" || assignment.status === "in-progress" || assignment.status === "Active" || assignment.status === "Ongoing") {
            assignment.status = "ready-for-download";
        }

        await assignment.save();

        // Send Email (Optional for now)

        res.status(200).json({
            message: "Files uploaded successfully",
            files: newFiles,
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload delivery files for Course (Multiple files - Admin to Student)
router.post("/course-assignments/:id/upload-files", upload.array("files", 10), async (req, res) => {
    try {
        const { fileTypes } = req.body;
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student").populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const parsedTypes = fileTypes ? JSON.parse(fileTypes) : [];
        const newFiles = [];

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            try {
                const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "deliveries");
                newFiles.push({
                    fileName: uploadResult.fileName,
                    filePath: uploadResult.url,
                    fileType: parsedTypes[index] || "other",
                    uploadedBy: req.user.id,
                    uploadedAt: new Date()
                });
            } catch (uErr) {
                console.error("Error uploading file to B2:", uErr);
            }
        }

        assignment.deliveryFiles.push(...newFiles);
        // For courses, usually it stays 'Assigned' until completed. 
        // But if we give files (e.g. materials), maybe 'ready-for-download' makes sense?
        // Or we just add files and don't change status.
        // Let's set to 'ready-for-download' if it's not completed.
        if (assignment.status !== "completed") {
            // assignment.status = "ready-for-download"; // Maybe optional for courses
        }

        await assignment.save();

        res.status(200).json({
            message: "Files uploaded successfully",
            files: newFiles,
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Complete internship and upload certificate
router.post("/internship-assignments/:id/complete", upload.single("certificate"), async (req, res) => {
    try {
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email").populate("itemId", "title"); // Internship has title? Check schema.

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.status = "completed";
        assignment.completedAt = new Date();

        let emailAttachments = [];

        if (req.file) {
            const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "certificates");
            assignment.certificate = {
                url: uploadResult.url,
                issuedAt: new Date(),
                issuedBy: req.user.id
            };

            // Prepare attachment for email
            emailAttachments.push({
                ContentType: "application/pdf",
                Filename: req.file.originalname,
                Base64Content: req.file.buffer.toString("base64")
            });
        }

        await assignment.save();

        // Send Completion Email
        const sendCourseMail = require("../utils/sendCourseMail");
        try {
            await sendCourseMail("INTERNSHIP_COMPLETED",
                { email: assignment.student.email, name: assignment.student.name },
                { courseName: assignment.itemId.title || "Internship" }, // Pass title as courseName
                emailAttachments
            );
        } catch (mailErr) {
            console.error("Error sending completion email:", mailErr);
        }

        res.status(200).json({
            message: "Internship completed and certificate issued",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== PAYMENT MANAGEMENT ROUTES =====

// Get all pending payments across all assignment types
router.get("/pending-payments", async (req, res) => {
    try {
        const { status, itemType } = req.query;

        const query = {
            "payment.required": true
        };

        // Filter by payment status
        if (status === "pending") {
            query["payment.status"] = "pending";
        } else if (status === "paid") {
            query["payment.status"] = "paid";
        } else if (status === "proof-uploaded") {
            query["payment.status"] = "pending";
            query["payment.proofFile"] = { $exists: true, $ne: null };
        } else {
            // Default: show all pending payments
            query["payment.status"] = "pending";
        }

        // Filter by item type
        if (itemType && ["course", "project", "internship"].includes(itemType)) {
            query.itemType = itemType;
        }

        const assignments = await StudentAssignment.find(query)
            .populate("student", "name email mobile")
            .populate("itemId", "name title")
            .sort({ "payment.proofUploadedAt": -1, assignedAt: -1 });

        // Format response with invoice-like structure
        const payments = assignments.map(a => ({
            _id: a._id,
            invoiceId: `INV-${new Date(a.assignedAt).getFullYear()}-${a._id.toString().slice(-6).toUpperCase()}`,
            student: a.student,
            itemType: a.itemType,
            itemName: a.itemId?.name || a.itemId?.title || "Unknown",
            amount: a.payment?.amount || 0,
            paymentMethod: a.payment?.paymentMethod || null,
            status: a.payment?.status,
            proofFile: a.payment?.proofFile || null,
            proofUploadedAt: a.payment?.proofUploadedAt || null,
            transactionId: a.payment?.transactionId || null,
            paidAt: a.payment?.paidAt || null,
            notes: a.payment?.notes || "",
            assignedAt: a.assignedAt,
            assignmentStatus: a.status,
            invoice: a.invoice || null
        }));

        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark any assignment as paid (universal payment update)
router.put("/assignments/:id/mark-paid", async (req, res) => {
    try {
        const { transactionId, notes } = req.body;

        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email")
            .populate("itemId", "name title");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (assignment.payment?.status !== "pending") {
            return res.status(400).json({ message: "Payment is not pending for this assignment" });
        }

        // Update payment status
        assignment.payment.status = "paid";
        assignment.payment.paidAt = new Date();
        if (transactionId) {
            assignment.payment.transactionId = transactionId;
        }
        if (notes) {
            assignment.payment.notes = notes;
        }

        // Update assignment status based on type
        if (assignment.itemType === "course") {
            if (assignment.status === "advance-payment-pending") {
                assignment.status = "in-progress";
            }
        } else if (assignment.itemType === "project") {
            if (assignment.status === "advance-payment-pending") {
                assignment.status = "in-progress";
            } else if (assignment.status === "final-payment-pending") {
                assignment.status = "ready-for-download";
            }
        } else if (assignment.itemType === "internship") {
            if (assignment.status === "advance-payment-pending") {
                assignment.status = "in-progress";
            }
        }

        await assignment.save();

        // Send confirmation email
        const itemName = assignment.itemId?.name || assignment.itemId?.title || "Item";
        const itemType = assignment.itemType.charAt(0).toUpperCase() + assignment.itemType.slice(1);

        try {
            if (assignment.itemType === "course") {
                await sendCourseMail("PAYMENT_RECEIVED", {
                    email: assignment.student.email,
                    name: assignment.student.name
                }, {
                    courseName: itemName,
                    amount: assignment.payment.amount,
                    transactionId: transactionId || "VERIFIED"
                });
            } else {
                await sendProjectEmail("PAYMENT_CONFIRMATION", {
                    email: assignment.student.email,
                    name: assignment.student.name
                }, {
                    projectTitle: itemName
                });
            }
        } catch (emailErr) {
            console.error("Failed to send payment confirmation email:", emailErr);
        }

        res.status(200).json({
            message: `Payment marked as paid for ${itemType}: ${itemName}`,
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== INVOICE GENERATION =====
const generateInvoicePDF = require("../utils/generateInvoicePDF");

// Generate invoice for any assignment
router.post("/assignments/:id/generate-invoice", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findById(req.params.id)
            .populate("student", "name email")
            .populate("itemId", "name title");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Check if payment exists and is paid
        if (!assignment.payment?.amount) {
            return res.status(400).json({ message: "No payment found for this assignment" });
        }

        // Generate invoice number
        const invoiceNumber = `INV-${new Date().getFullYear()}-${assignment._id.toString().slice(-6).toUpperCase()}`;

        // Prepare invoice data
        const invoiceData = {
            invoiceNumber,
            studentName: assignment.student?.name || "Student",
            studentEmail: assignment.student?.email || "",
            itemType: assignment.itemType,
            itemName: assignment.itemId?.name || assignment.itemId?.title || "Item",
            itemDescription: `${assignment.itemType.charAt(0).toUpperCase() + assignment.itemType.slice(1)} Assignment`,
            amount: assignment.payment?.amount || 0,
            paymentStatus: assignment.payment?.status || "pending",
            paymentMethod: assignment.payment?.paymentMethod || null,
            transactionId: assignment.payment?.transactionId || null,
            paidAt: assignment.payment?.paidAt || null
        };

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Upload to B2
        const fileName = `Invoice_${invoiceNumber.replace(/\//g, "-")}_${Date.now()}.pdf`;
        const uploadResult = await b2Service.uploadFile(pdfBuffer, fileName, "invoices");

        // Save invoice to assignment
        assignment.invoice = {
            url: uploadResult.url,
            invoiceNumber: invoiceNumber,
            generatedAt: new Date(),
            generatedBy: req.user.id
        };

        await assignment.save();

        res.status(200).json({
            message: "Invoice generated successfully",
            invoice: assignment.invoice
        });
    } catch (err) {
        console.error("Generate Invoice Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

