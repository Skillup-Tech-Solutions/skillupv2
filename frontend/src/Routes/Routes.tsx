import { createHashRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

// Lazy loading wrapper
const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  }>
    {children}
  </Suspense>
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

// ========== LAZY LOADED PAGES ==========

// Public Website - Lazy
const WebHome = lazy(() => import("../Components/WebHome"));
const WebAbout = lazy(() => import("../Components/WebAbout"));
const WebContactUs = lazy(() => import("../Pages/WebContactUs"));
const WebCarrers = lazy(() => import("../Components/WebCarrers"));
const WebCoursesPage = lazy(() => import("../Pages/WebCoursesPage"));
const WebItServices = lazy(() => import("../Components/WebItServices"));
const WebItServiceDetail = lazy(() => import("../Pages/WebItServiceDetail"));
const WebServicesPage = lazy(() => import("../Pages/WebServicesPage"));
const WebServiceDetail = lazy(() => import("../Pages/WebServiceDetail"));
const WebCategory = lazy(() => import("../Pages/WebCategory"));
const WebSyllabusView = lazy(() => import("../Pages/WebSyllabusView"));

// Admin pages - Lazy
const AdminDashboard = lazy(() => import("../Pages/AdminDashboard"));
const PeopleManagement = lazy(() => import("../Pages/PeopleManagement"));
const ProgramsManagement = lazy(() => import("../Pages/ProgramsManagement"));
const Offers = lazy(() => import("../Pages/Offers"));
const Category = lazy(() => import("../Pages/Category"));
const Carrers = lazy(() => import("../Pages/Carrers"));
const Syllabus = lazy(() => import("../Pages/Syllabus"));
const Certificate = lazy(() => import("../Pages/Certificate"));
const AnnouncementManagement = lazy(() => import("../Pages/AnnouncementManagement"));
const StudentDetail = lazy(() => import("../Pages/StudentDetail"));
const SalarySetup = lazy(() => import("../Pages/Admin/Payroll/SalarySetup"));
const PayrollManagement = lazy(() => import("../Pages/Admin/Payroll/PayrollManagement"));
const PaymentSettings = lazy(() => import("../Pages/Admin/PaymentSettings"));
const PaymentManagement = lazy(() => import("../Pages/Admin/PaymentManagement"));

// Student pages - Lazy
const StudentDashboard = lazy(() => import("../Pages/Student/StudentDashboard"));
const MyCourses = lazy(() => import("../Pages/Student/MyCourses"));
const MyInternships = lazy(() => import("../Pages/Student/MyInternships"));
const MyProjects = lazy(() => import("../Pages/Student/MyProjects"));
const Pay = lazy(() => import("../Pages/Student/Pay"));
const StudentAnnouncements = lazy(() => import("../Pages/Student/StudentAnnouncements"));
const StudentProfile = lazy(() => import("../Pages/Student/StudentProfile"));
const SubmitProject = lazy(() => import("../Pages/Student/SubmitProject"));

// Employee pages - Lazy
const EmployeePortal = lazy(() => import("../Pages/Employee/EmployeePortal"));

const routes = createHashRouter([
  // Auth Routes (not lazy - small and needed immediately)
  { path: "/login", element: <Login /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/student-signup", element: <StudentSignup /> },
  { path: "/activate-account", element: <ActivateAccount /> },
  { path: "/forgotpassword", element: <ForgetPassword /> },
  { path: "/reviews", element: <Review /> },

  // Public Website Routes (lazy loaded)
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
      { path: "payroll/generate", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payroll/history", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payroll/settings", element: <LazyLoad><PayrollManagement /></LazyLoad> },
      { path: "payment/settings", element: <LazyLoad><PaymentSettings /></LazyLoad> },
      { path: "payment-management", element: <LazyLoad><PaymentManagement /></LazyLoad> },
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
