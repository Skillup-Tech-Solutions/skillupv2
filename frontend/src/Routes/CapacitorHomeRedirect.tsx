import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../services/authService";
import { isCapacitor } from "../utils/pwaUtils";

/**
 * Wrapper for landing page routes.
 * In Capacitor (native app), skip the landing page and go to login/dashboard.
 * On web, show the landing page normally.
 */
const CapacitorHomeRedirect = () => {
    // Only redirect in Capacitor native apps
    if (!isCapacitor()) {
        return <Outlet />;
    }

    // Check if user is already logged in
    const token = authService.getToken();
    const role = authService.getRole();

    if (token && role) {
        // Redirect to dashboard based on role
        if (role === "admin") {
            return <Navigate to="/dashboard" replace />;
        } else if (role === "student") {
            return <Navigate to="/student/dashboard" replace />;
        } else if (role === "employee") {
            return <Navigate to="/employee/portal" replace />;
        }
    }

    // Not logged in - redirect to login
    return <Navigate to="/login" replace />;
};

export default CapacitorHomeRedirect;
