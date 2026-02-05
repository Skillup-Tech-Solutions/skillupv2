const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const employeePortalController = require("../controllers/employeePortalController");

router.use(auth);
// No role check needed specifically, as long as they are authenticated. 
// Controller checks if they have an employee profile linked.

// Payslips
router.get("/my-payslips", employeePortalController.getMyPayslips);
router.get("/download/:id", employeePortalController.downloadPayslip);

// Profile
router.get("/my-profile", employeePortalController.getMyProfile);

// Assignments
router.get("/my-courses", employeePortalController.getMyCourses);
router.get("/my-internships", employeePortalController.getMyInternships);
router.get("/my-projects", employeePortalController.getMyProjects);

// Dashboard
router.get("/dashboard-stats", employeePortalController.getDashboardStats);

// Live Sessions
router.get("/my-live-sessions", employeePortalController.getMyLiveSessions);

// Announcements
router.get("/announcements", employeePortalController.getAnnouncements);

// Detail Pages
router.get("/course/:id", employeePortalController.getCourseDetail);
router.get("/internship/:id", employeePortalController.getInternshipDetail);
router.get("/project/:id", employeePortalController.getProjectDetail);

// Student Management (Management features from Submissions & Credentials)
const upload = require("../config/multer");

// Course/Internship Management
router.post("/assignments/:id/upload-files", upload.array("files", 10), employeePortalController.uploadAssignmentFiles);
router.post("/assignments/:id/complete", upload.single("certificate"), employeePortalController.completeAssignment);
router.put("/assignments/:id/certificate-details", employeePortalController.updateCertificateDetails);

// Project Specific Flow (Excluding Payment Requests)
router.post("/project-assignments/:id/submit-requirement", employeePortalController.submitRequirement);
router.post("/project-assignments/:id/start-work", employeePortalController.startProjectWork);
router.post("/project-assignments/:id/ready-for-demo", employeePortalController.markProjectReadyForDemo);
router.post("/project-assignments/:id/delivered", employeePortalController.markProjectDelivered);

// Global Materials Upload
router.post("/course/:id/materials", upload.array("files", 10), employeePortalController.uploadCourseMaterials);
router.post("/internship/:id/materials", upload.array("files", 10), employeePortalController.uploadInternshipMaterials);
router.post("/project/:id/materials", upload.array("files", 10), employeePortalController.uploadProjectMaterials);

module.exports = router;

