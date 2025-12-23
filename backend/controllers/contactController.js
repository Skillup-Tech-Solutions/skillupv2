const { sendContactMail } = require("../utils/sendContactMail");
const { sendCourseInquiryMail } = require("../utils/sendCourseInquiryMail");

// Contact Us API
const contactUs = async (req, res) => {
  try {
    const { email, contactNumber, description, name } = req.body;

    // Validate required fields (email and contactNumber only)
    if (!email || !contactNumber) {
      return res.status(400).json({ 
        message: "email field is required" 
      });
    }
    if (!email || !contactNumber) {
      return res.status(400).json({ 
        message: "contactNumber field is required" 
      });
    }
    if (!name) {
      return res.status(400).json({
        message: "name field is required"
      });
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Validate contactNumber field length
    if (contactNumber.trim().length < 10) {
      return res.status(400).json({ 
        message: "Contact number must be at least 10 characters long" 
      });
    }

    if (contactNumber.length > 15) {
      return res.status(400).json({ 
        message: "Contact number must be less than 15 characters" 
      });
    }

    // Validate description field (optional - only if provided)
    if (description && description.trim().length > 0) {
      if (description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Description must be at least 10 characters long" 
        });
      }

      if (description.length > 1000) {
        return res.status(400).json({ 
          message: "Description must be less than 1000 characters" 
        });
      }
    }

    // Send email to admin
    await sendContactMail(email, contactNumber.trim(), description ? description.trim() : null, name);

    // Success response
    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We have received your message and will get back to you soon."
    });

  } catch (error) {
    console.error("Contact form error:", error);
    
    // Handle specific email errors
    if (error.code === 'EAUTH' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        message: "Email service is currently unavailable. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

// Course Inquiry API
const courseInquiry = async (req, res) => {
  try {
    const { name, email, mobile, courseName } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !courseName) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required: name, email, mobile, courseName" 
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: "Name must be at least 2 characters long" 
      });
    }

    if (name.length > 100) {
      return res.status(400).json({ 
        success: false,
        message: "Name must be less than 100 characters" 
      });
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid email address" 
      });
    }

    // Validate mobile number
    const mobileRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    if (!mobileRegex.test(mobile.trim())) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid mobile number (10-15 digits)" 
      });
    }

    // Validate course name
    if (courseName.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: "Course name must be at least 2 characters long" 
      });
    }

    if (courseName.length > 200) {
      return res.status(400).json({ 
        success: false,
        message: "Course name must be less than 200 characters" 
      });
    }

    // Send email to admin
    await sendCourseInquiryMail(
      name.trim(), 
      email.trim(), 
      mobile.trim(), 
      courseName.trim()
    );

    // Success response
    res.status(200).json({
      success: true,
      message: "Thank you for your interest! We have received your course inquiry and will contact you soon to discuss the details."
    });

  } catch (error) {
    console.error("Course inquiry error:", error);
    
    // Handle specific email errors
    if (error.code === 'EAUTH' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        message: "Email service is currently unavailable. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

module.exports = {
  contactUs,
  courseInquiry
};