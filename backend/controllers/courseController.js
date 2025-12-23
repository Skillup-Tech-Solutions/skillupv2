const Course = require("../models/Course");
const Lesson = require('../models/lessons');
const path = require("path");
const fs = require("fs");
const b2Service = require("../utils/b2Service");

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { name, description, discount, price, duration, level, mode, startDate, endDate, timing, trainer, status, showOnLandingPage } = req.body;

    // Helper to safely get string value
    const safeString = (val) => Array.isArray(val) ? val[0] : val;
    const safeNumber = (val) => Array.isArray(val) ? Number(val[0]) : Number(val);

    // Validation - only name is truly required
    if (!name) {
      return res.status(400).json({
        message: "Course name is required"
      });
    }
    // ✅ Check if course with same name already exists
    const existing = await Course.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Course already exists" });
    }

    // Create course with optional fields
    const course = new Course({
      name,
      description: safeString(description) || "",
      discount: safeNumber(discount) || 0,
      price: safeNumber(price) || 0,
      duration: safeString(duration) || "",
      level: safeString(level) || "beginner",
      mode: safeString(mode) || "online",
      startDate: startDate || null,
      endDate: endDate || null,
      timing: safeString(timing) || "",
      trainer: safeString(trainer) || "",
      fileupload: null, // Will be updated below if file exists
      status: safeString(status) || "Active",
      showOnLandingPage: (function () {
        const val = showOnLandingPage;
        if (val === undefined) return true;
        if (val === "undefined" || val === "null") return true;
        const finalVal = Array.isArray(val) ? val[0] : val;
        return finalVal === "true" || finalVal === true;
      })()
    });

    // Handle file upload to B2
    if (req.file) {
      const b2File = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "courses");
      course.fileupload = b2File.fileName; // Save B2 filename/path
    }

    const savedCourse = await course.save();

    res.status(201).json({
      message: "Course created successfully",
      course: savedCourse
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating course",
      error: error.message
    });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ _id: -1 });

    res.status(200).json({
      message: "Courses retrieved successfully",
      count: courses.length,
      courses
    });

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving courses",
      error: error.message
    });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      message: "Course retrieved successfully",
      course
    });

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving course",
      error: error.message
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { name, description, discount, price, duration, showOnLandingPage, timing, startDate, endDate } = req.body;
    console.log("UPDATE DEBUG:", JSON.stringify(req.body, null, 2));

    // Helper to safely get string value
    const safeString = (val) => Array.isArray(val) ? val[0] : val;
    const safeNumber = (val) => Array.isArray(val) ? Number(val[0]) : Number(val);

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    // Update fields if provided
    if (name) course.name = safeString(name);
    if (description) course.description = safeString(description);
    if (discount) course.discount = safeNumber(discount);
    if (price) course.price = safeNumber(price);
    if (duration) course.duration = safeString(duration);
    if (timing) course.timing = safeString(timing);
    if (startDate) course.startDate = startDate;
    if (endDate) course.endDate = endDate;
    if (showOnLandingPage !== undefined) {
      const val = Array.isArray(showOnLandingPage) ? showOnLandingPage[0] : showOnLandingPage;
      if (val !== "undefined" && val !== "null") {
        course.showOnLandingPage = (val === "true" || val === true);
      }
    }

    // Update file if new file is uploaded
    if (req.file) {
      const b2File = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "courses");
      course.fileupload = b2File.fileName;
    }

    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating course",
      error: error.message
    });
  }
};

// Toggle course status (Active/Inactive)
exports.toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    // Toggle status
    course.status = course.status === "Active" ? "Inactive" : "Active";

    const updatedCourse = await course.save();

    res.status(200).json({
      message: `Course status changed to ${course.status}`,
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating course status",
      error: error.message
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }
    await Lesson.deleteMany({ "courseId._id": course._id });

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Course deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting course",
      error: error.message
    });
  }
};

// Get courses by status
exports.getCoursesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use 'Active' or 'Inactive'"
      });
    }

    const courses = await Course.find({ status }).sort({ createdAt: -1 });

    res.status(200).json({
      message: `${status} courses retrieved successfully`,
      count: courses.length,
      courses
    });

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving courses by status",
      error: error.message
    });
  }
};

// Download course file by course ID
exports.downloadCourseFile = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (!course.fileupload) {
      return res.status(404).json({
        message: "No file associated with this course"
      });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', course.fileupload);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File not found on server"
      });
    }

    // Get file stats for additional info
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(course.fileupload);

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${course.name}${fileExtension}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);

    // Send file
    res.download(filePath, `${course.name}${fileExtension}`, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          res.status(500).json({
            message: "Error downloading file",
            error: err.message
          });
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error downloading file",
      error: error.message
    });
  }
};

// Download file by filename
exports.downloadFileByName = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        message: "Filename is required"
      });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File not found on server"
      });
    }

    // Get file stats for additional info
    const stats = fs.statSync(filePath);

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);

    // Send file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          res.status(500).json({
            message: "Error downloading file",
            error: err.message
          });
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error downloading file",
      error: error.message
    });
  }
};