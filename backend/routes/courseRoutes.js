const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  toggleCourseStatus,
  deleteCourse,
  getCoursesByStatus,
  downloadCourseFile,
  downloadFileByName
} = require("../controllers/courseController");
const auth = require("../middleware/auth");
// router.use(auth);

// Public routes (no authentication required)
/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: 
 *        - Courses   
 */
router.post("/courses", auth, upload.single('fileupload'), createCourse);
router.get("/courses", getAllCourses);
router.get("/courses/status/:status", getCoursesByStatus);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", auth, upload.single('fileupload'), updateCourse);
router.patch("/courses/:id/status", auth, toggleCourseStatus);
router.get("/courses/:id/download", downloadCourseFile);
router.get("/files/:filename", downloadFileByName);

module.exports = router;