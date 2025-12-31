import React, { useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import api from "../Interceptors/Interceptor";
import { Box } from "@mui/material";

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
      const token = authService.getToken();
      const cookieRole = authService.getRole();

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
          // For admin, trust the cookie since the backend validates the token via axios/api interceptors
          const result = { isAuthenticated: true, role: "admin" };
          verificationCache = { token, result, timestamp: now };
          setIsAuthenticated(true);
          setVerifiedRole("admin");
          setIsLoading(false);
          verifyingRef.current = false;
          return;
        }

        // Use the centralized api (axios) instance to benefit from token refresh logic
        const response = await api.get(`${baseUrl}student/me`);
        const data: UserData = response.data;

        const result = {
          isAuthenticated: true,
          role: data?.role ?? cookieRole ?? null
        };

        if (data?.role) {
          authService.set("role", data.role);
        }

        // Update cache
        verificationCache = { token, result, timestamp: now };
        setIsAuthenticated(result.isAuthenticated);
        setVerifiedRole(result.role);
      } catch (error: any) {
        // Handle verification failure
        console.error("Verification failed:", error);

        if (error.response?.status === 403) {
          // Authenticated but wrong role
          const result = { isAuthenticated: true, role: cookieRole || "admin" };
          verificationCache = { token, result, timestamp: now };
          setIsAuthenticated(true);
          setVerifiedRole(result.role);
        } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
          // Network error - stay authenticated and fall back to stored data
          setIsAuthenticated(!!token);
          setVerifiedRole(cookieRole || null);
        } else {
          // Authentication actually failed (e.g. 401 or refresh failed)
          // The interceptor might have already called clearAuth, but we'll be safe
          setIsAuthenticated(false);
          setVerifiedRole(null);
        }
      } finally {
        setIsLoading(false);
        verifyingRef.current = false;
      }
    };

    verifyToken();
  }, []); // Remove location.pathname dependency - only verify once on mount

  // Show loading spinner while verifying (dark background to match startup)
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#020617", // Match absolute startup background
        }}
      >
        {/* Transparent gap to prevent flickering between logo and skeleton */}
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


