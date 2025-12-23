const StudentAssignment = require("../models/StudentAssignment");
const sendProjectEmail = require("../utils/sendProjectMail");

// Helper to get assignment and validate
const getAssignment = async (id) => {
    const assignment = await StudentAssignment.findById(id).populate("student").populate("itemId");
    if (!assignment) throw new Error("Assignment not found");
    return assignment;
};

// 1. Manually Trigger Assignment Email
// 1. Manually Trigger Assignment Email (or Resend based on status)
exports.triggerAssignmentEmail = async (req, res) => {
    try {
        const assignment = await getAssignment(req.params.id);
        const recipient = { email: assignment.student.email, name: assignment.student.name };
        const projectTitle = assignment.itemId.title || assignment.itemId.name;
        const commonData = {
            projectTitle,
            projectId: assignment.itemId._id
        };

        let emailType = "PROJECT_ASSIGNED";
        let emailData = { ...commonData };

        switch (assignment.status) {
            case "assigned":
                emailType = "PROJECT_ASSIGNED";
                break;
            case "requirement-submitted":
                emailType = "REQUIREMENT_SUBMITTED_BY_ADMIN";
                break;
            case "advance-payment-pending":
                emailType = "PAYMENT_REQUEST";
                emailData.paymentAmount = assignment.payment?.advanceAmount || assignment.payment?.amount;
                break;
            case "in-progress":
                emailType = "PROJECT_STARTED";
                break;
            case "ready-for-demo":
                emailType = "READY_FOR_DEMO";
                break;
            case "final-payment-pending":
                emailType = "FINAL_PAYMENT_REQUEST";
                emailData.paymentAmount = assignment.payment?.finalAmount || assignment.payment?.amount;
                break;
            case "ready-for-download":
                emailType = "PROJECT_READY";
                emailData.filesList = assignment.deliveryFiles?.map(f => f.fileName).join(", ") || "Project Files";
                break;
            case "delivered":
            case "completed":
                emailType = "PROJECT_COMPLETED";
                break;
            default:
                emailType = "PROJECT_ASSIGNED"; // Fallback
        }

        await sendProjectEmail(emailType, recipient, emailData);

        res.status(200).json({ message: `Resent email for status: ${assignment.status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 1.1 Resend Email (Identical to Trigger, but named for clarity in routes)
exports.resendAssignmentEmail = exports.triggerAssignmentEmail;

// 2. Submit Requirement (Admin on behalf) - Already exists but refactoring for consistency
exports.submitRequirementAdmin = async (req, res) => {
    try {
        const { topic, projectType, collegeGuidelines, notes } = req.body;
        const assignment = await getAssignment(req.params.id);

        assignment.requirementSubmission = {
            topic: topic || assignment.itemId.title || assignment.itemId.name,
            projectType: projectType || "other",
            collegeGuidelines: collegeGuidelines || "",
            notes: notes || "",
            submittedBy: req.user.id,
            submittedByRole: "admin",
            submittedAt: new Date()
        };
        assignment.status = "requirement-submitted"; // Direct to strict flow

        await assignment.save();

        await sendProjectEmail("REQUIREMENT_SUBMITTED_BY_ADMIN", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Requirement submitted by admin", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Request Advance Payment
exports.requestAdvancePayment = async (req, res) => {
    try {
        const { amount, notes } = req.body;
        const assignment = await getAssignment(req.params.id);

        assignment.status = "advance-payment-pending";
        assignment.payment = {
            ...assignment.payment,
            required: true,
            amount: amount,
            advanceAmount: amount, // Store specific advance
            status: "pending",
            notes: notes || assignment.payment?.notes
        };

        await assignment.save();

        await sendProjectEmail("PAYMENT_REQUEST", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id,
            assignmentId: assignment._id,
            paymentAmount: amount
        });

        res.status(200).json({ message: "Advance payment requested", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Mark In Progress (Confirm Advance)
exports.markInProgress = async (req, res) => {
    try {
        const assignment = await getAssignment(req.params.id);

        assignment.status = "in-progress";
        // Update payment status if pending
        if (assignment.payment?.status === "pending") {
            assignment.payment.status = "paid";
            assignment.payment.paidAt = new Date();
        }

        await assignment.save();

        await sendProjectEmail("PROJECT_STARTED", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Project marked in progress", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Mark Ready for Demo
exports.markReadyForDemo = async (req, res) => {
    try {
        const assignment = await getAssignment(req.params.id);

        assignment.status = "ready-for-demo";
        await assignment.save();

        await sendProjectEmail("READY_FOR_DEMO", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Marked ready for demo", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. Request Final Payment
exports.requestFinalPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const assignment = await getAssignment(req.params.id);

        assignment.status = "final-payment-pending";
        assignment.payment.amount = amount; // Update current due
        assignment.payment.finalAmount = amount; // Store specific final
        assignment.payment.status = "pending"; // Reset status to pending for final payment

        await assignment.save();

        await sendProjectEmail("FINAL_PAYMENT_REQUEST", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id,
            assignmentId: assignment._id,
            paymentAmount: amount || assignment.payment?.amount
        });

        res.status(200).json({ message: "Final payment requested", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. Mark Ready for Download (Confirm Final, Upload Files)
exports.markReadyForDownload = async (req, res) => {
    try {
        const assignment = await getAssignment(req.params.id);

        // Check if we are coming from final payment pending state
        if (assignment.payment?.status !== "paid" && assignment.status === "final-payment-pending") {
            assignment.payment.status = "paid"; // Confirm final payment
            assignment.payment.paidAt = new Date();
        }

        assignment.status = "ready-for-download";

        await assignment.save();

        // Check if files exist? Maybe warning if no files.

        await sendProjectEmail("PROJECT_READY", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id,
            filesList: assignment.deliveryFiles.map(f => f.fileName).join(", ")
        });

        res.status(200).json({ message: "Marked ready for download", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 8. Mark Delivered
exports.markDelivered = async (req, res) => {
    try {
        const assignment = await getAssignment(req.params.id);

        assignment.status = "delivered";
        assignment.completedAt = new Date();

        await assignment.save();

        await sendProjectEmail("PROJECT_COMPLETED", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Marked as delivered", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
