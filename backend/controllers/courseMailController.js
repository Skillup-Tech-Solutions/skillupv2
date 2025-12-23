const { sendCourseInquiryMail } = require("../utils/sendCourseInquiryMail");
const path = require("path");

const courseMailSubmission = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    const { name, email, mobile, courseName } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !courseName) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, courseName) are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate mobile number (basic validation)
    const mobileRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number",
      });
    }

    // Get attachment info if file was uploaded
    let attachment = null;
    if (req.file) {
      attachment = {
        buffer: req.file.buffer,
        name: req.file.originalname
      };
    }

    // Send the course inquiry email
    await sendCourseInquiryMail(name, email, mobile, courseName, attachment);

    res.status(200).json({
      success: true,
      message: "Course inquiry submitted successfully! We will contact you soon.",
    });
  } catch (error) {
    console.error("Error in course mail submission:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to submit course inquiry. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  courseMailSubmission,
};