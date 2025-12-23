
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger_output.json");
const connectDB = require("./config/db");
const lessonsRoutes = require("./routes/lesRoutes");
const userRoutes = require("./routes/userRoutes");
const offerRoutes = require("./routes/offerRoutes");
const careersRoutes = require("./routes/careersRoutes");
const courseRoutes = require("./routes/courseRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const certificationMailsRoutes = require('./routes/emailRoutes');
const careerApplicationRoutes = require('./routes/careerApplicationRoutes');
const categoryMailRoutes = require('./routes/categoryMailRoutes');
// Student Portal Routes
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const filesRoutes = require('./routes/filesRoutes');
const paymentPublicRoutes = require('./routes/paymentPublicRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const employeePortalRoutes = require('./routes/employeePortalRoutes');
const cron = require("node-cron");
const StudentAssignment = require("./models/StudentAssignment");
const Course = require("./models/Course");
const User = require("./models/User");
const sendCourseMail = require("./utils/sendCourseMail");


dotenv.config();

const app = express();

// Security & Performance Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS Config - support multiple origins for development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

const { generalLimiter } = require('./middleware/rateLimit');
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize database connection
connectDB();

// Serve static files from uploads directory
// Serve static files from uploads directory (with B2 fallback)
// app.use('/uploads', express.static('uploads'));
// Serve static files from uploads directory (with B2 fallback + caching)
app.use('/uploads', express.static('uploads', {
  maxAge: '7d',          // 7 days cache for production
  etag: true,            // Enable ETag for cache validation
  lastModified: true,    // Enable Last-Modified header
  immutable: false       // Files may be updated
}), async (req, res, next) => {
  // If we are here, express.static didn't find the file (or it's a directory).
  // Check if it looks like a file request.
  if (req.method !== 'GET') return next();

  try {
    const b2Service = require('./utils/b2Service');
    // req.path will be "/courses/filename.jpg" (relative to /uploads mount)
    const filename = req.path.startsWith('/') ? req.path.slice(1) : req.path;

    // Check if it's a valid file request (basic check)
    if (!filename || filename === '/') return next();

    // Decode URI component in case of spaces etc
    const decodedFilename = decodeURIComponent(filename);

    console.log(`[B2 Fallback] Attempting to fetch from B2: ${decodedFilename}`);
    const signedUrl = await b2Service.getSignedUrl(decodedFilename);

    // Proxy the file instead of redirect to avoid CORS issues
    const fetch = require('node-fetch');
    const b2Response = await fetch(signedUrl);

    if (!b2Response.ok) {
      console.warn(`[B2 Fallback] B2 returned ${b2Response.status} for ${decodedFilename}`);
      return res.status(404).send("File not found");
    }

    // Forward content-type and set cache headers
    const contentType = b2Response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    res.set('Cache-Control', 'public, max-age=604800'); // 7 days

    // Stream the response body to client
    b2Response.body.pipe(res);
  } catch (err) {
    console.warn(`[B2 Fallback] Failed for ${req.path}:`, err.message);
    res.status(404).send("File not found");
  }
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Student Portal API Routes - Mount explicit paths first
app.use("/api/files", filesRoutes);
app.use("/api/payment", paymentPublicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

// Employee & Payroll Routes
app.use("/api/admin/employees", employeeRoutes);
app.use("/api/admin/payroll", payrollRoutes);
app.use("/api/employee", employeePortalRoutes);

app.use("/api", categoryRoutes);
app.use("/api", reviewRoutes);
app.use("/api", userRoutes);
app.use("/api", offerRoutes);
app.use("/api", careersRoutes);
app.use("/api", courseRoutes);
app.use("/api", lessonsRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reviewRoutes);
app.use("/api", contactRoutes);
app.use("/api", careerApplicationRoutes);
app.use("/api", categoryMailRoutes);

const PORT = process.env.PORT || 5000;

// Error handling middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Schedule Course Ending Reminder (Daily at 9:00 AM)
  cron.schedule("0 9 * * *", async () => {
    console.log("[Cron] Running Course Ending Check...");
    try {
      const today = new Date();
      const fiveDaysFromNow = new Date(today);
      fiveDaysFromNow.setDate(today.getDate() + 5);

      // Normalize to start of day for comparison
      fiveDaysFromNow.setHours(0, 0, 0, 0);
      const nextDay = new Date(fiveDaysFromNow);
      nextDay.setDate(fiveDaysFromNow.getDate() + 1);

      // Find active courses ending in 5 days
      const endingCourses = await Course.find({
        endDate: {
          $gte: fiveDaysFromNow,
          $lt: nextDay
        }
      });

      if (endingCourses.length === 0) {
        console.log("[Cron] No courses ending in 5 days.");
        return;
      }

      console.log(`[Cron] Found ${endingCourses.length} courses ending soon.`);

      for (const course of endingCourses) {
        // Find students assigned to this course who haven't completed it yet
        // Note: Logic assumes assignments exist. 
        // We find student assignments for this course.
        const assignments = await StudentAssignment.find({
          itemType: "course",
          itemId: course._id,
          status: { $ne: "completed" } // Only warn if not completed? Or warn everyone? Usually good to warn everyone.
          // Let's warn everyone assigned, or maybe check business logic. 
          // For now, warn everyone assigned to the course.
        }).populate("student");

        for (const assignment of assignments) {
          if (assignment.student) {
            await sendCourseMail("COURSE_ENDING", {
              name: assignment.student.name,
              email: assignment.student.email
            }, {
              courseName: course.name,
              courseId: course._id,
              startDate: course.startDate,
              endDate: course.endDate,
              timing: course.timing,
              daysLeft: 5
            });
          }
        }
      }
      console.log("[Cron] Course Ending Check Complete.");
    } catch (err) {
      console.error("[Cron] Error in Course Ending Check:", err);
    }
  });
});
