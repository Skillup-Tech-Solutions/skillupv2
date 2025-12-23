const { sendCareerApplicationMail } = require("../utils/sendCareerApplicationMail");

const careerApplicationSubmission = async (req, res) => {
  try {
    console.log('Received career application query params:', req.query);

    const { name, email, mobile, title } = req.query;

    // Validate required fields
    if (!name || !email || !mobile || !title) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, title) are required",
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

    // Send the career application email directly (no storage)
    await sendCareerApplicationMail(name, email, mobile, title);

    res.status(200).json({
      success: true,
      message: "Career application submitted successfully! We will contact you soon.",
      data: {
        name,
        email,
        mobile,
        title,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in career application submission:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to submit career application. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const careerApplicationWithAttachment = async (req, res) => {
  try {
    console.log('Received career application with attachment:', req.body);
    console.log('Received resume file:', req.file);

    const { name, email, mobile, title } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !title) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, title) are required",
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

    // Check if resume file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required for this endpoint",
      });
    }

    // Get resume info
    const resumeBuffer = req.file.buffer;
    const resumeName = req.file.originalname;

    // Send the career application email with attachment
    // We update the util to accept buffer and name instead of path
    await sendCareerApplicationMail(name, email, mobile, title, null, { buffer: resumeBuffer, name: resumeName });

    res.status(200).json({
      success: true,
      message: "Career application with resume submitted successfully! We will contact you soon.",
      data: {
        name,
        email,
        mobile,
        title,
        hasResume: true,
        resumeFileName: req.file.originalname,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in career application with attachment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to submit career application. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  careerApplicationSubmission,
  careerApplicationWithAttachment,
};