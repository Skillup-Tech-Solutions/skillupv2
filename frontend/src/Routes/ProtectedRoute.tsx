import React, { useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

interface UserData {
  role: string;
  status: string;
}

// Cache verification result to prevent multiple API calls
let verificationCache: {
  token: string | null;
  result: { isAuthenticated: boolean; role: string | null } | null;
  timestamp: number;
} = { token: null, result: null, timestamp: 0 };

// Cache duration: 30 seconds
const CACHE_DURATION = 30000;

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifiedRole, setVerifiedRole] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("skToken");
      const cookieRole = Cookies.get("role");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check cache first - prevent duplicate calls
      const now = Date.now();
      if (
        verificationCache.token === token &&
        verificationCache.result &&
        now - verificationCache.timestamp < CACHE_DURATION
      ) {
        setIsAuthenticated(verificationCache.result.isAuthenticated);
        setVerifiedRole(verificationCache.result.role);
        setIsLoading(false);
        return;
      }

      // Prevent concurrent verification calls (React StrictMode double-render)
      if (verifyingRef.current) {
        return;
      }
      verifyingRef.current = true;

      try {
        const baseUrl = import.meta.env.VITE_APP_BASE_URL;

        if (cookieRole === "admin") {
          // For admin, trust the cookie since the backend validates the token
          const result = { isAuthenticated: true, role: "admin" };
          verificationCache = { token, result, timestamp: now };
          setIsAuthenticated(true);
          setVerifiedRole("admin");
          setIsLoading(false);
          verifyingRef.current = false;
          return;
        }

        // For students, verify via /student/me
        const response = await fetch(`${baseUrl}student/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let result: { isAuthenticated: boolean; role: string | null };

        if (response.ok) {
          const data: UserData = await response.json();
          result = { isAuthenticated: true, role: data?.role ?? cookieRole ?? null };
          if (data?.role) {
            Cookies.set("role", data.role, { path: "/" });
          }
        } else if (response.status === 403) {
          // 403 means authenticated but wrong role (probably admin on student endpoint)
          result = { isAuthenticated: true, role: cookieRole || "admin" };
        } else {
          // Token invalid or expired
          result = { isAuthenticated: false, role: null };
          Cookies.remove("skToken");
          Cookies.remove("skRefreshToken");
          Cookies.remove("role");
        }

        // Update cache
        verificationCache = { token, result, timestamp: now };
        setIsAuthenticated(result.isAuthenticated);
        setVerifiedRole(result.role);
      } catch {
        // Network error - fall back to cookie
        setIsAuthenticated(!!token);
        setVerifiedRole(cookieRole || null);
      } finally {
        setIsLoading(false);
        verifyingRef.current = false;
      }
    };

    verifyToken();
  }, []); // Remove location.pathname dependency - only verify once on mount

  // Show loading spinner while verifying
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--background)"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access using verified role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!verifiedRole || !allowedRoles.includes(verifiedRole)) {
      // User doesn't have required role
      if (verifiedRole === "student") {
        return <Navigate to="/student/dashboard" replace />;
      } else if (verifiedRole === "admin") {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;


