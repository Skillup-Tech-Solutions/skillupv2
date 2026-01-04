import React, { useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import api from "../Interceptors/Interceptor";
import { authService } from "../services/authService";
import { isCapacitor } from "../utils/pwaUtils";
import logoImage from "../assets/Images/newlogo.png";

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
      // CRITICAL: Wait for authService on native platforms
      if (isCapacitor()) {
        await authService.waitForReady();
      }

      // Use authService which handles both web and native storage
      const token = isCapacitor()
        ? await authService.getTokenAsync()
        : authService.getToken();
      const cookieRole = isCapacitor()
        ? await authService.getRoleAsync()
        : authService.getRole();

      if (!token) {
        console.log('[ProtectedRoute] No token found, redirecting to login');
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
        if (cookieRole === "admin") {
          // For admin, trust the stored role since the backend validates the token
          const result = { isAuthenticated: true, role: "admin" };
          verificationCache = { token, result, timestamp: now };
          setIsAuthenticated(true);
          setVerifiedRole("admin");
          setIsLoading(false);
          verifyingRef.current = false;
          return;
        }

        // For students, verify via /student/me using api instance
        // This uses the axios interceptor which handles 401 and token refresh!
        const response = await api.get<UserData>("student/me");

        let result: { isAuthenticated: boolean; role: string | null };
        const data = response.data;

        result = { isAuthenticated: true, role: data?.role ?? cookieRole ?? null };
        if (data?.role) {
          authService.set("role", data.role);
        }

        // Update cache
        verificationCache = { token, result, timestamp: now };
        setIsAuthenticated(result.isAuthenticated);
        setVerifiedRole(result.role);
      } catch (error: any) {
        // The interceptor handles 401 and redirects to login if refresh fails
        // If we get here with a 403, user is authenticated but wrong role
        if (error.response?.status === 403) {
          const result = { isAuthenticated: true, role: cookieRole || "admin" };
          verificationCache = { token, result, timestamp: now };
          setIsAuthenticated(true);
          setVerifiedRole(cookieRole || "admin");
        } else {
          // For other errors (network, etc.), trust stored token if it exists
          // The interceptor will have already redirected on true auth failures
          const currentToken = isCapacitor()
            ? await authService.getTokenAsync()
            : authService.getToken();
          if (currentToken) {
            // Token still exists - interceptor might have refreshed it
            setIsAuthenticated(true);
            setVerifiedRole(cookieRole || null);
          } else {
            // Token was cleared by interceptor - truly unauthenticated
            setIsAuthenticated(false);
          }
        }
      } finally {
        setIsLoading(false);
        verifyingRef.current = false;

        // Hide native splash after auth is verified (for Capacitor)
        if (isCapacitor()) {
          import('@capacitor/splash-screen').then(({ SplashScreen }) => {
            SplashScreen.hide({ fadeOutDuration: 300 });
          });
        }
      }
    };

    verifyToken();
  }, []); // Only verify once on mount

  // Show splash-style loading while verifying
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#020617",
          gap: 3,
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={logoImage}
          alt="SkillUp"
          sx={{
            width: 80,
            height: 80,
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.6, transform: "scale(0.95)" },
              "50%": { opacity: 1, transform: "scale(1.05)" },
            },
          }}
        />

        {/* Connecting indicator */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "rgba(148, 163, 184, 0.8)",
            fontSize: "0.875rem",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#3b82f6",
              animation: "blink 1.2s ease-in-out infinite",
              "@keyframes blink": {
                "0%, 100%": { opacity: 0.3 },
                "50%": { opacity: 1 },
              },
            }}
          />
          Connecting...
        </Box>
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
