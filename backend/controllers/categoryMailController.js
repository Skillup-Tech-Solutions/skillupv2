const { sendCategoryMail } = require("../utils/sendCategoryMail");

const categoryMailSubmission = async (req, res) => {
  try {
    console.log('Received category mail body params:', req.body);
    
    const { name, email, mobile, categoryName, categoryType } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !categoryName || !categoryType) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, categoryName, categoryType) are required",
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

    // Send the category inquiry email directly (no storage)
    console.log(`Sending category mail for category ${categoryName}...`);
    console.log(`Email sent for category ${categoryType}.`);
    await sendCategoryMail(name, email, mobile, categoryName, categoryType);

    res.status(200).json({
      success: true,
      message: "Category inquiry submitted successfully! We will contact you soon with detailed information.",
      data: {
        name,
        email,
        mobile,
        categoryName,
        categoryType,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in category mail submission:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to submit category inquiry. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  categoryMailSubmission,
};