import { createHashRouter } from "react-router-dom";
import { lazy, Suspense, Component, type ReactNode, type ComponentType } from "react";
import { Box, Typography, Button } from "@mui/material";

// Helper function to retry dynamic imports with page reload on failure
// This handles chunk loading errors that occur after deployment updates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const sessionKey = `retry-lazy-refreshed-${componentImport.toString().slice(0, 50)}`;
    const hasRefreshed = sessionStorage.getItem(sessionKey);

    try {
      const component = await componentImport();
      // Clear the flag on successful load
      sessionStorage.removeItem(sessionKey);
      return component;
    } catch (error) {
      if (!hasRefreshed) {
        // Set flag to prevent infinite reload loops
        sessionStorage.setItem(sessionKey, 'true');
        // Force reload to get fresh chunks
        window.location.reload();
        // Return a never-resolving promise to prevent render during reload
        return new Promise(() => { });
      }
      // If already refreshed and still failing, throw the error
      throw error;
    }
  });
}

// Error boundary to catch any remaining chunk load errors
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ChunkErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReload = () => {
    // Clear all retry flags and reload
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('retry-lazy-refreshed-')) {
        sessionStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Loading CSS chunk');

      return (
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
          p: 3,
          textAlign: "center"
        }}>
          <Typography variant="h5" color="error">
            {isChunkError ? "Application Updated" : "Something went wrong"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isChunkError
              ? "A new version of the application is available. Please reload to continue."
              : "An unexpected error occurred. Please try reloading the page."}
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Lazy loading wrapper with error boundary
const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <ChunkErrorBoundary>
    <Suspense fallback={
      <Box sx={{
        height: "100vh",
        width: "100%",
        bgcolor: "transparent", // Use transparent to inherit from html/body background
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Very subtle transition or just the background to prevent flashing */}
      </Box>
    }>
      {children}
    </Suspense>
  </ChunkErrorBoundary>
);

// Auth pages - Load immediately (small)
import Login from "../Auth/Login";
import SignUp from "../Auth/SignUp";
import ForgetPassword from "../Auth/ForgetPassword";
import StudentSignup from "../Auth/StudentSignup";
import ActivateAccount from "../Auth/ActivateAccount";
import ResetPassword from "../Auth/ResetPassword";
import Review from "../Auth/Review";

// Layout components - Load immediately
import Layout from "../Components/Layout";
import StudentLayout from "../Components/StudentLayout";
import WebsiteLayout from "../Components/WebsiteLayout";
import ProtectedRoute from "./ProtectedRoute";
import CapacitorHomeRedirect from "./CapacitorHomeRedirect";

// ========== LAZY LOADED PAGES ==========
// Using lazyRetry for automatic retry with page reload on chunk loading failures

// Public Website - Lazy
const WebHome = lazyRetry(() => import("../Components/WebHome"));
const WebAbout = lazyRetry(() => import("../Components/WebAbout"));
const WebContactUs = lazyRetry(() => import("../Pages/WebContactUs"));
const WebCarrers = lazyRetry(() => import("../Components/WebCarrers"));
const WebCoursesPage = lazyRetry(() => import("../Pages/WebCoursesPage"));
const WebItServices = lazyRetry(() => import("../Components/WebItServices"));
const WebItServiceDetail = lazyRetry(() => import("../Pages/WebItServiceDetail"));
const WebServicesPage = lazyRetry(() => import("../Pages/WebServicesPage"));
const WebServiceDetail = lazyRetry(() => import("../Pages/WebServiceDetail"));
const WebCategory = lazyRetry(() => import("../Pages/WebCategory"));
const WebSyllabusView = lazyRetry(() => import("../Pages/WebSyllabusView"));

// Utility Pages
import OfflinePage from "../Components/OfflinePage";

// Admin pages - Lazy
const AdminDashboard = lazyRetry(() => import("../Pages/AdminDashboard"));
const PeopleManagement = lazyRetry(() => import("../Pages/PeopleManagement"));
const ProgramsManagement = lazyRetry(() => import("../Pages/ProgramsManagement"));
const Offers = lazyRetry(() => import("../Pages/Offers"));
const Category = lazyRetry(() => import("../Pages/Category"));
const Carrers = lazyRetry(() => import("../Pages/Carrers"));
const Syllabus = lazyRetry(() => import("../Pages/Syllabus"));
const Certificate = lazyRetry(() => import("../Pages/Certificate"));
const AnnouncementManagement = lazyRetry(() => import("../Pages/AnnouncementManagement"));
const StudentDetail = lazyRetry(() => import("../Pages/StudentDetail"));
const SalarySetup = lazyRetry(() => import("../Pages/Admin/Payroll/SalarySetup"));
const PayrollManagement = lazyRetry(() => import("../Pages/Admin/Payroll/PayrollManagement"));
const PaymentSettings = lazyRetry(() => import("../Pages/Admin/PaymentSettings"));
const PaymentManagement = lazyRetry(() => import("../Pages/Admin/PaymentManagement"));
const NotificationManagement = lazyRetry(() => import("../Pages/NotificationManagement"));
const Profile = lazyRetry(() => import("../Pages/Profile"));

// Student pages - Lazy
const StudentDashboard = lazyRetry(() => import("../Pages/Student/StudentDashboard"));
const MyCourses = lazyRetry(() => import("../Pages/Student/MyCourses"));
const MyInternships = lazyRetry(() => import("../Pages/Student/MyInternships"));
const MyProjects = lazyRetry(() => import("../Pages/Student/MyProjects"));
const Pay = lazyRetry(() => import("../Pages/Student/Pay"));
const StudentAnnouncements = lazyRetry(() => import("../Pages/Student/StudentAnnouncements"));
const StudentProfile = lazyRetry(() => import("../Pages/Student/StudentProfile"));
const SubmitProject = lazyRetry(() => import("../Pages/Student/SubmitProject"));
const StudentLiveSessions = lazyRetry(() => import("../Components/Student/StudentLiveSessions"));

// Employee pages - Lazy
const EmployeePortal = lazyRetry(() => import("../Pages/Employee/EmployeePortal"));

const routes = createHashRouter([
  // Auth Routes (not lazy - small and needed immediately)
  { path: "/login", element: <Login /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/student-signup", element: <StudentSignup /> },
  { path: "/activate-account", element: <ActivateAccount /> },
  { path: "/forgotpassword", element: <ForgetPassword /> },
  { path: "/reviews", element: <Review /> },

  // Offline/Error Pages (not lazy - needed when network fails)
  { path: "/offline", element: <OfflinePage type="offline" /> },
  { path: "/connection-error", element: <OfflinePage type="error" /> },

  // Public Website Routes (lazy loaded)
  // In Capacitor (native app), CapacitorHomeRedirect will skip landing and go to login
  {
    path: "/",
    element: <CapacitorHomeRedirect />,
    children: [
      {
        path: "/",
        element: <WebsiteLayout />,
        children: [
          { path: "/", element: <LazyLoad><WebHome /></LazyLoad> },
          { path: "/about", element: <LazyLoad><WebAbout /></LazyLoad> },
          { path: "/contact", element: <LazyLoad><WebContactUs /></LazyLoad> },
          { path: "/careers", element: <LazyLoad><WebCarrers /></LazyLoad> },
          { path: "/services/courses", element: <LazyLoad><WebCoursesPage /></LazyLoad> },
          { path: "/itservices", element: <LazyLoad><WebItServices /></LazyLoad> },
          { path: "/itservices/detail", element: <LazyLoad><WebItServiceDetail /></LazyLoad> },
          { path: "/services", element: <LazyLoad><WebServicesPage /></LazyLoad> },
          { path: "/services/details", element: <LazyLoad><WebServiceDetail /></LazyLoad> },
          { path: "/services/category", element: <LazyLoad><WebCategory /></LazyLoad> },
          { path: "/services/courses/syllabus", element: <LazyLoad><WebSyllabusView /></LazyLoad> },
        ],
      },
    ],
  },

  // Admin Routes (lazy loaded)
  {
    path: "/",
    element: <ProtectedRoute element={<Layout />} allowedRoles={["admin"]} />,
    children: [
      { path: "dashboard", element: <LazyLoad><AdminDashboard /></LazyLoad> },
      { path: "users", element: <LazyLoad><PeopleManagement /></LazyLoad> },
      { path: "courses", element: <LazyLoad><ProgramsManagement /></LazyLoad> },
      { path: "offers", element: <LazyLoad><Offers /></LazyLoad> },
      { path: "category", element: <LazyLoad><Category /></LazyLoad> },
      { path: "admincareers", element: <LazyLoad><Carrers /></LazyLoad> },
      { path: "syllabus", element: <LazyLoad><Syllabus /></LazyLoad> },
      { path: "certificate", element: <LazyLoad><Certificate /></LazyLoad> },
      { path: "announcements", element: <LazyLoad><AnnouncementManagement /></LazyLoad> },
      { path: "internships", element: <LazyLoad><ProgramsManagement /></LazyLoad> },
      { path: "projects", element: <LazyLoad><ProgramsManagement /></LazyLoad> },
      { path: "student/:id", element: <LazyLoad><StudentDetail /></LazyLoad> },
      { path: "employees", element: <LazyLoad><PeopleManagement /></LazyLoad> },
      { path: "payroll/salary/:id", element: <LazyLoad><SalarySetup /></LazyLoad> },
      { path: "payroll", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payroll/generate", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payroll/history", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payroll/settings", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payment/settings", element: <LazyLoad><PaymentSettings /></LazyLoad> },
      { path: "payment-management", element: <LazyLoad><PaymentManagement /></LazyLoad> },
      { path: "notifications", element: <LazyLoad><NotificationManagement /></LazyLoad> },
      { path: "profile", element: <LazyLoad><Profile /></LazyLoad> },
    ],
  },

  // Student Routes (lazy loaded)
  {
    path: "/student",
    element: <ProtectedRoute element={<StudentLayout />} allowedRoles={["student"]} />,
    children: [
      { path: "dashboard", element: <LazyLoad><StudentDashboard /></LazyLoad> },
      { path: "my-courses", element: <LazyLoad><MyCourses /></LazyLoad> },
      { path: "my-internships", element: <LazyLoad><MyInternships /></LazyLoad> },
      { path: "my-projects", element: <LazyLoad><MyProjects /></LazyLoad> },
      { path: "pay", element: <LazyLoad><Pay /></LazyLoad> },
      { path: "announcements", element: <LazyLoad><StudentAnnouncements /></LazyLoad> },
      { path: "profile", element: <LazyLoad><StudentProfile /></LazyLoad> },
      { path: "submit-project/:projectId", element: <LazyLoad><SubmitProject /></LazyLoad> },
      { path: "live-sessions", element: <LazyLoad><StudentLiveSessions /></LazyLoad> },
    ],
  },

  // Employee Routes (lazy loaded)
  {
    path: "/employee",
    element: <ProtectedRoute element={<Layout />} allowedRoles={["employee"]} />,
    children: [
      { path: "portal", element: <LazyLoad><EmployeePortal /></LazyLoad> }
    ]
  },
]);

export default routes;
