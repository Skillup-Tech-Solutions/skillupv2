const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/category');
const Career = require('../models/careers');

exports.getDashboardCounts = async (req, res) => {
  try {
    // Get month from URL parameter or query parameter
    const month = req.params.month || req.query.month;

    let dateFilter = {};

    // Validate and construct date range if month is given
    if (month) {
      const regex = /^(0[1-9]|1[0-2])-(\d{4})$/;
      if (!regex.test(month)) {
        return res.status(400).json({ message: "Invalid month format. Use MM-YYYY" });
      }

      const [mm, yyyy] = month.split('-');
      const startDate = new Date(`${yyyy}-${mm}-01T00:00:00.000Z`);
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

      dateFilter = { createdAt: { $gte: startDate, $lt: endDate } };
    }

    const [userCount, categoryWorkshopCount, categoryInternshipCount, courseCount, carrierCount] =
      await Promise.all([
        // Users (excluding admins)
        User.countDocuments({
          role: { $ne: 'admin' },
          ...dateFilter
        }),

        // Category: Workshop
        Category.countDocuments({
          category: 'workShop',
          ...dateFilter
        }),

        // Category: Internship
        Category.countDocuments({
          category: 'internShip',
          ...dateFilter
        }),

        // Courses
        Course.countDocuments({
          ...dateFilter
        }),

        // Careers
        Career.countDocuments({
          status: 'Active',
          ...dateFilter
        })
      ]);

    res.status(200).json({
      userCount,
      categoryWorkshopCount,
      categoryInternshipCount,
      courseCount,
      carrierCount
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: 'Error fetching dashboard counts',
      error: error.message
    });
  }
};


