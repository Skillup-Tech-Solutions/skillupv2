const Payslip = require("../models/Payslip");
const EmployeeProfile = require("../models/EmployeeProfile");
const PayrollSettings = require("../models/PayrollSettings");
const Course = require("../models/Course");
const Internship = require("../models/Internship");
const Project = require("../models/Project");
const LiveSession = require("../models/LiveSession");
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const b2Service = require("../utils/b2Service");
const StudentAssignment = require("../models/StudentAssignment");
const sendProjectEmail = require("../utils/sendProjectMail");
const sendCourseMail = require("../utils/sendCourseMail");


/**
 * Get My Payslips
 */
exports.getMyPayslips = async (req, res) => {
    try {
        // req.user.id is the User ID. Need to find Profile ID.
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const payslips = await Payslip.find({
            employee: employeeProfile._id,
            status: { $in: ["Published", "Emailed"] } // Only show published ones
        }).sort({ year: -1, month: -1 });

        res.status(200).json(payslips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Download My Payslip
 */
exports.downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const payslip = await Payslip.findOne({
            _id: id,
            employee: employeeProfile._id
        });

        if (!payslip) {
            return res.status(404).json({ message: "Payslip not found or access denied" });
        }

        res.status(200).json({ downloadUrl: payslip.pdfUrl });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get My Profile
 */
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -inviteToken -inviteTokenExpires");
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user,
            profile: employeeProfile || null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get My Assigned Courses (where I am trainer)
 */
exports.getMyCourses = async (req, res) => {
    try {
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const courses = await Course.find({ trainerId: employeeProfile._id })
            .sort({ createdAt: -1 });

        // Get enrolled student counts
        const StudentAssignment = require("../models/StudentAssignment");
        const coursesWithCounts = await Promise.all(
            courses.map(async (course) => {
                const count = await StudentAssignment.countDocuments({
                    itemType: "course",
                    itemId: course._id
                });
                return {
                    ...course.toObject(),
                    enrolledStudents: { length: count }
                };
            })
        );

        res.status(200).json(coursesWithCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get My Assigned Internships (where I am mentor)
 */
exports.getMyInternships = async (req, res) => {
    try {
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const internships = await Internship.find({ mentorId: employeeProfile._id })
            .sort({ createdAt: -1 });

        // Get enrolled student counts
        const StudentAssignment = require("../models/StudentAssignment");
        const internshipsWithCounts = await Promise.all(
            internships.map(async (internship) => {
                const count = await StudentAssignment.countDocuments({
                    itemType: "internship",
                    itemId: internship._id
                });
                return {
                    ...internship.toObject(),
                    enrolledStudents: { length: count }
                };
            })
        );

        res.status(200).json(internshipsWithCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get My Assigned Projects (where I am mentor)
 */
exports.getMyProjects = async (req, res) => {
    try {
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const projects = await Project.find({ mentorId: employeeProfile._id })
            .sort({ createdAt: -1 });

        // Get enrolled student counts
        const StudentAssignment = require("../models/StudentAssignment");
        const projectsWithCounts = await Promise.all(
            projects.map(async (project) => {
                const count = await StudentAssignment.countDocuments({
                    itemType: "project",
                    itemId: project._id
                });
                return {
                    ...project.toObject(),
                    enrolledStudents: { length: count }
                };
            })
        );

        res.status(200).json(projectsWithCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Dashboard Stats for Employee
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const [coursesCount, internshipsCount, projectsCount, upcomingSessionsCount] = await Promise.all([
            Course.countDocuments({ trainerId: employeeProfile._id }),
            Internship.countDocuments({ mentorId: employeeProfile._id }),
            Project.countDocuments({ mentorId: employeeProfile._id }),
            LiveSession.countDocuments({
                hostEmail: req.user.email,
                status: { $in: ["SCHEDULED", "LIVE"] },
                scheduledAt: { $gte: new Date() }
            })
        ]);

        res.status(200).json({
            courses: coursesCount,
            internships: internshipsCount,
            projects: projectsCount,
            upcomingSessions: upcomingSessionsCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get My Live Sessions (where I am host)
 */
exports.getMyLiveSessions = async (req, res) => {
    try {
        const sessions = await LiveSession.find({
            hostEmail: req.user.email
        }).sort({ scheduledAt: -1 });

        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Announcements (employee-relevant)
 */
exports.getAnnouncements = async (req, res) => {
    try {
        // Get announcements for employees or all roles
        const announcements = await Announcement.find({
            $or: [
                { targetRole: "employee" },
                { targetRole: "all" },
                { targetRole: { $exists: false } }
            ]
        }).sort({ createdAt: -1 }).limit(20);

        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Course Detail with enrolled students
 */
exports.getCourseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        // Get course and verify trainer
        const course = await Course.findOne({
            _id: id,
            trainerId: employeeProfile._id
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found or you are not the trainer" });
        }

        // Get enrolled students
        const StudentAssignment = require("../models/StudentAssignment");
        const enrolledStudents = await StudentAssignment.find({
            itemType: "course",
            itemId: id
        })
            .populate("student", "name email phone profilePicture")
            .populate("courseSubmissions.uploadedBy", "name")
            .populate("deliveryFiles.uploadedBy", "name")
            .populate("certificate.issuedBy", "name");


        // Get live sessions for this course
        const sessions = await LiveSession.find({
            sessionType: "COURSE",
            referenceId: id
        }).sort({ scheduledAt: -1 });

        res.status(200).json({
            course,
            enrolledStudents,
            sessions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Internship Detail with enrolled students
 */
exports.getInternshipDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const internship = await Internship.findOne({
            _id: id,
            mentorId: employeeProfile._id
        });

        if (!internship) {
            return res.status(404).json({ message: "Internship not found or you are not the mentor" });
        }

        const StudentAssignment = require("../models/StudentAssignment");
        const enrolledStudents = await StudentAssignment.find({
            itemType: "internship",
            itemId: id
        })
            .populate("student", "name email phone profilePicture")
            .populate("requirementSubmission.submittedBy", "name")
            .populate("deliveryFiles.uploadedBy", "name")
            .populate("certificate.issuedBy", "name");


        const sessions = await LiveSession.find({
            sessionType: "INTERNSHIP",
            referenceId: id
        }).sort({ scheduledAt: -1 });

        res.status(200).json({
            internship,
            enrolledStudents,
            sessions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Project Detail with enrolled students
 */
exports.getProjectDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const project = await Project.findOne({
            _id: id,
            mentorId: employeeProfile._id
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found or you are not the mentor" });
        }

        const StudentAssignment = require("../models/StudentAssignment");
        const enrolledStudents = await StudentAssignment.find({
            itemType: "project",
            itemId: id
        })
            .populate("student", "name email phone profilePicture")
            .populate("requirementSubmission.submittedBy", "name")
            .populate("deliveryFiles.uploadedBy", "name")
            .populate("certificate.issuedBy", "name");


        const sessions = await LiveSession.find({
            sessionType: "PROJECT",
            referenceId: id
        }).sort({ scheduledAt: -1 });

        res.status(200).json({
            project,
            enrolledStudents,
            sessions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Common Helper: Check if Employee has access to Assignment
 */
const checkAssignmentAccess = async (user_id, assignmentId) => {
    const employeeProfile = await EmployeeProfile.findOne({ user: user_id });
    if (!employeeProfile) throw new Error("Employee profile not found");

    const assignment = await StudentAssignment.findById(assignmentId)
        .populate("student", "name email")
        .populate("itemId");

    if (!assignment) throw new Error("Assignment not found");

    let hasAccess = false;
    if (assignment.itemType === "course") {
        const course = await Course.findById(assignment.itemId);
        if (course && course.trainerId && course.trainerId.toString() === employeeProfile._id.toString()) hasAccess = true;
    } else if (assignment.itemType === "internship") {
        const internship = await Internship.findById(assignment.itemId);
        if (internship && internship.mentorId && internship.mentorId.toString() === employeeProfile._id.toString()) hasAccess = true;
    } else if (assignment.itemType === "project") {
        const project = await Project.findById(assignment.itemId);
        if (project && project.mentorId && project.mentorId.toString() === employeeProfile._id.toString()) hasAccess = true;
    }

    if (!hasAccess) throw new Error("Unauthorized: You are not assigned to this course/internship/project");

    return { assignment, employeeProfile };
};

/**
 * Upload Files (Managed by Trainer/Mentor)
 */
exports.uploadAssignmentFiles = async (req, res) => {
    try {
        const { assignment, employeeProfile } = await checkAssignmentAccess(req.user.id, req.params.id);
        const { fileTypes } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const parsedTypes = fileTypes ? (typeof fileTypes === 'string' ? JSON.parse(fileTypes) : fileTypes) : [];
        const newFiles = [];

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "deliveries");
            newFiles.push({
                fileName: uploadResult.fileName,
                filePath: uploadResult.url || uploadResult.filePath,
                fileType: parsedTypes[index] || (assignment.itemType === "project" ? "project-file" : "learning-material"),
                uploadedBy: req.user.id,
                uploadedAt: new Date()
            });
        }

        assignment.deliveryFiles.push(...newFiles);

        // Project flow update
        if (assignment.itemType === "project" && assignment.status === "final-payment-pending") {
            assignment.status = "ready-for-download";
        } else if (assignment.itemType === "internship" && assignment.status === "assigned") {
            assignment.status = "in-progress";
        }

        await assignment.save();

        res.status(200).json({ message: "Files uploaded successfully", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Complete Assignment & Issue Certificate
 */
exports.completeAssignment = async (req, res) => {
    try {
        const { assignment } = await checkAssignmentAccess(req.user.id, req.params.id);

        assignment.status = "completed";
        assignment.completedAt = new Date();

        let emailAttachments = [];

        if (req.file) {
            const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "certificates");
            assignment.certificate = {
                url: uploadResult.url || uploadResult.filePath,
                issuedAt: new Date(),
                issuedBy: req.user.id
            };

            emailAttachments.push({
                ContentType: "application/pdf",
                Filename: req.file.originalname,
                Base64Content: req.file.buffer.toString("base64")
            });
        }

        await assignment.save();

        // Send Email
        const emailType = assignment.itemType === "internship" ? "INTERNSHIP_COMPLETED" : "COURSE_COMPLETED";
        const courseName = assignment.itemId.name || assignment.itemId.title || "Program";

        try {
            await sendCourseMail(emailType,
                { email: assignment.student.email, name: assignment.student.name },
                { courseName },
                emailAttachments
            );
        } catch (mailErr) {
            console.error("Error sending completion email:", mailErr);
        }

        res.status(200).json({ message: "Assignment completed and certificate issued", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update Certificate Details
 */
exports.updateCertificateDetails = async (req, res) => {
    try {
        const { assignment } = await checkAssignmentAccess(req.user.id, req.params.id);
        const { recipientName, domain, startDate, endDate } = req.body;

        assignment.certificateDetails = {
            recipientName,
            domain,
            startDate,
            endDate
        };

        await assignment.save();
        res.status(200).json({ message: "Certificate details updated", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Submit Requirement (Project Mentor)
 */
exports.submitRequirement = async (req, res) => {
    try {
        const { assignment } = await checkAssignmentAccess(req.user.id, req.params.id);
        const { topic, projectType, collegeGuidelines, notes } = req.body;

        assignment.requirementSubmission = {
            topic: topic || assignment.itemId.title || assignment.itemId.name,
            projectType: projectType || "other",
            collegeGuidelines: collegeGuidelines || "",
            notes: notes || "",
            submittedBy: req.user.id,
            submittedByRole: "admin", // We'll keep it as admin for the schema purpose or maybe we should add "employee" to enum
            submittedAt: new Date()
        };
        assignment.status = "requirement-submitted";

        await assignment.save();

        await sendProjectEmail("REQUIREMENT_SUBMITTED_BY_ADMIN", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Requirement submitted", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Project Flow: Start Work
 */
exports.startProjectWork = async (req, res) => {
    try {
        const { assignment } = await checkAssignmentAccess(req.user.id, req.params.id);
        assignment.status = "in-progress";
        await assignment.save();

        await sendProjectEmail("PROJECT_STARTED", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Project started", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Project Flow: Ready for Demo
 */
exports.markProjectReadyForDemo = async (req, res) => {
    try {
        const { assignment } = await checkAssignmentAccess(req.user.id, req.params.id);
        assignment.status = "ready-for-demo";
        await assignment.save();

        await sendProjectEmail("READY_FOR_DEMO", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Ready for demo marked", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Project Flow: Mark Delivered
 */
exports.markProjectDelivered = async (req, res) => {
    try {
        const { assignment } = await checkAssignmentAccess(req.user.id, req.params.id);
        assignment.status = "delivered";
        assignment.completedAt = new Date();
        await assignment.save();

        await sendProjectEmail("PROJECT_COMPLETED", { email: assignment.student.email, name: assignment.student.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            projectId: assignment.itemId._id
        });

        res.status(200).json({ message: "Project delivered", assignment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Upload Global Course Materials
 */
exports.uploadCourseMaterials = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });
        if (!employeeProfile) return res.status(404).json({ message: "Employee profile not found" });

        const course = await Course.findOne({ _id: id, trainerId: employeeProfile._id });
        if (!course) return res.status(404).json({ message: "Course not found or unauthorized" });

        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

        const newAttachments = [];
        for (const file of req.files) {
            const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "course-materials");
            newAttachments.push({
                fileName: uploadResult.fileName,
                filePath: uploadResult.url || uploadResult.filePath,
                uploadedAt: new Date()
            });
        }

        course.attachments.push(...newAttachments);
        await course.save();

        res.status(200).json({ message: "Materials uploaded successfully", attachments: course.attachments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Upload Global Internship Materials
 */
exports.uploadInternshipMaterials = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });
        if (!employeeProfile) return res.status(404).json({ message: "Employee profile not found" });

        const internship = await Internship.findOne({ _id: id, mentorId: employeeProfile._id });
        if (!internship) return res.status(404).json({ message: "Internship not found or unauthorized" });

        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

        const newAttachments = [];
        for (const file of req.files) {
            const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "internship-materials");
            newAttachments.push({
                fileName: uploadResult.fileName,
                filePath: uploadResult.url || uploadResult.filePath,
                uploadedAt: new Date()
            });
        }

        internship.attachments.push(...newAttachments);
        await internship.save();

        res.status(200).json({ message: "Materials uploaded successfully", attachments: internship.attachments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Upload Global Project Materials
 */
exports.uploadProjectMaterials = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });
        if (!employeeProfile) return res.status(404).json({ message: "Employee profile not found" });

        const project = await Project.findOne({ _id: id, mentorId: employeeProfile._id });
        if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });

        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

        const newAttachments = [];
        for (const file of req.files) {
            const uploadResult = await b2Service.uploadFile(file.buffer, file.originalname, "project-materials");
            newAttachments.push({
                fileName: uploadResult.fileName,
                filePath: uploadResult.url || uploadResult.filePath,
                uploadedAt: new Date()
            });
        }

        project.attachments.push(...newAttachments);
        await project.save();

        res.status(200).json({ message: "Materials uploaded successfully", attachments: project.attachments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

