import { Navigate, Outlet } from "react-router-dom";
import { isCapacitor } from "../utils/pwaUtils";
import { authService } from "../services/authService";

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

    // Determine where to redirect Capacitor users
    const isAuthenticated = authService.isAuthenticated();
    const role = authService.getRole();

    if (isAuthenticated) {
        if (role === "admin") return <Navigate to="/dashboard" replace />;
        if (role === "student") return <Navigate to="/student/dashboard" replace />;
        if (role === "employee") return <Navigate to="/employee/portal" replace />;
    }

    return <Navigate to="/login" replace />;
};

export default CapacitorHomeRedirect;
