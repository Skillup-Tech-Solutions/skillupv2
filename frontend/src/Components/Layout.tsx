import { Box, useMediaQuery } from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { authService } from "../services/authService";
import { CaretLeft, List } from "@phosphor-icons/react";
import { Capacitor } from "@capacitor/core";
import { useLiveSessionSocket } from "../Hooks/useLiveSessionSocket";
import { useDeviceSessionSocket } from "../Hooks/useDeviceSessionSocket";
import { useDashboardSocket } from "../Hooks/useDashboardSocket";
import { useCourseSocket } from "../Hooks/useCourseSocket";
import { usePaymentSocket } from "../Hooks/usePaymentSocket";
import StickyBanner from "./StickyBanner";
import { hapticFeedback } from "../utils/haptics";
import { logger } from "../utils/logger";

// Sidebar width constants matching frontend-ref
const MIN_WIDTH = 60;
const COLLAPSED_WIDTH = 64;
const DEFAULT_WIDTH = 220;
const MAX_WIDTH = 280;

const Layout = () => {
  const isMobile = useMediaQuery("(max-width:991px)");
  const navigate = useNavigate();
  const location = useLocation();

  // Socket hooks for real-time updates (Cache invalidation secondary effect)
  const handleSessionStarted = useCallback((data: any) => {
    setLiveSessionBanner({
      title: data.session.title,
      id: data.session._id,
      type: data.session.sessionType
    });
  }, []);

  const handleSessionEnded = useCallback((data: any) => {
    setLiveSessionBanner((current) => {
      if (current?.id === data.sessionId) return null;
      return current;
    });
  }, []);

  useLiveSessionSocket({
    onSessionStarted: handleSessionStarted,
    onSessionEnded: handleSessionEnded
  });

  useDeviceSessionSocket({
    onRevoked: useCallback((message: string) => {
      // Handle admin logout via socket
      logger.log('[Socket] Admin session revoked:', message);
    }, [])
  });

  // Real-time data sync hooks - These invalidate React Query cache when backend emits updates
  useDashboardSocket();              // Dashboard stats auto-refresh
  useCourseSocket();                 // Course add/update/delete
  usePaymentSocket({ role: 'admin' }); // Payment proof uploads from students

  const userName = authService.getUserInfo().name || "Admin";
  const userEmail = authService.getUserInfo().email || "admin@skillup.edu";

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveSessionBanner, setLiveSessionBanner] = useState<{ title: string; id: string; type: string } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load saved width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('adminSidebarWidth');
    const savedHidden = localStorage.getItem('adminSidebarHidden');
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth));
    }
    if (savedHidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  // Save width to localStorage
  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem('adminSidebarWidth', sidebarWidth.toString());
      localStorage.setItem('adminSidebarHidden', isHidden.toString());
    }
  }, [sidebarWidth, isHidden, isResizing]);

  // Mouse resize handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = e.clientX;

      // Snap to hidden if dragged very small
      if (newWidth < MIN_WIDTH) {
        setIsHidden(true);
        setSidebarWidth(COLLAPSED_WIDTH);
      } else {
        setIsHidden(false);
        // Clamp between min and max
        const clampedWidth = Math.min(MAX_WIDTH, Math.max(COLLAPSED_WIDTH, newWidth));
        setSidebarWidth(clampedWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const showLabels = sidebarWidth >= 150 && !isHidden;

  return (
    // min-h-screen bg-slate-950 flex
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#020617", // slate-950
        display: "flex",
        position: "relative",
      }}
    >
      {/* Scanlines Effect */}
      <Box className="scanlines" />

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 49,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        // Mobile sidebar
        <Box
          sx={{
            position: "fixed",
            left: mobileOpen ? 0 : "-280px",
            width: "280px",
            height: "100vh",
            zIndex: 50,
            transition: "left 0.3s ease-in-out",
          }}
        >
          <Sidebar isOpen={true} isMobile={true} />
        </Box>
      ) : (
        // Desktop resizable sidebar
        <Box
          ref={sidebarRef}
          sx={{
            position: "sticky",
            top: 0,
            height: "100vh",
            zIndex: 50,
            transition: isResizing ? "none" : "all 0.2s ease",
            width: isHidden ? 0 : sidebarWidth,
            overflow: isHidden ? "hidden" : "visible",
            flexShrink: 0,
          }}
        >
          <Sidebar isOpen={showLabels} isMobile={false} />

          {/* Resize Handle */}
          {!isHidden && (
            <Box
              onMouseDown={startResizing}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                width: "4px",
                cursor: "ew-resize",
                zIndex: 51,
                transition: "background-color 0.2s",
                transform: "translateX(50%)",
                "&:hover": {
                  bgcolor: "rgba(96, 165, 250, 0.5)", // blue-400/50
                },
                "&:active": {
                  bgcolor: "#60a5fa", // blue-400
                },
              }}
            />
          )}
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflow: "auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "rgba(2, 6, 23, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #334155",
            position: "sticky",
            top: 0,
            zIndex: 40,
            // Safe area padding: uses env() for iOS, falls back to 24px for Android native
            // Desktop (non-native) gets 0 padding
            pt: Capacitor.isNativePlatform()
              ? Capacitor.getPlatform() === 'android'
                ? "max(env(safe-area-inset-top, 0px), 24px)"  // Android: minimum 24px for status bar
                : "env(safe-area-inset-top, 0px)"  // iOS: use safe area inset
              : 0,  // Desktop/Web: no padding
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Show toggle button when sidebar is hidden or on mobile */}
              {(isMobile || isHidden) && (
                <Box
                  onClick={() => {
                    if (isMobile) {
                      setMobileOpen(true);
                    } else {
                      setIsHidden(false);
                      setSidebarWidth(DEFAULT_WIDTH);
                    }
                  }}
                  sx={{
                    p: 1,
                    cursor: "pointer",
                    color: "#94a3b8",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                    "&:hover": { color: "#e2e8f0", bgcolor: "#1e293b" },
                  }}
                >
                  <List size={24} />
                </Box>
              )}
              <Box>
                <Box
                  component="h2"
                  sx={{
                    fontFamily: "'Chivo', sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "16px", md: "20px" },
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#f8fafc",
                    m: 0,
                  }}
                >
                  Admin Portal
                </Box>
                <Box
                  component="p"
                  sx={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontFamily: "'JetBrains Mono', monospace",
                    mt: 0.25,
                    m: 0,
                  }}
                >
                  Welcome back, {userName}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* UI Back Button */}
              {location.pathname !== "/dashboard" && (
                <Box
                  onClick={() => {
                    hapticFeedback.impact();
                    navigate(-1);
                  }}
                  sx={{
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderRadius: "6px",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    "&:hover": {
                      bgcolor: "rgba(148, 163, 184, 0.1)",
                      color: "#f8fafc",
                      borderColor: "rgba(148, 163, 184, 0.4)"
                    },
                  }}
                >
                  <CaretLeft size={20} weight="bold" />
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Box
                    component="p"
                    sx={{
                      fontSize: "10px",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "'JetBrains Mono', monospace",
                      m: 0,
                    }}
                  >
                    Logged in as
                  </Box>
                  <Box
                    component="p"
                    sx={{
                      fontSize: "14px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#cbd5e1",
                      m: 0,
                    }}
                  >
                    {userEmail}
                  </Box>
                </Box>
                {/* Avatar */}
                <Box
                  onClick={() => navigate("/profile")}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  {userName?.charAt(0).toUpperCase() || "A"}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Page Content */}
          <Box sx={{ p: 3, flex: 1 }}>
            {liveSessionBanner && (
              <Box sx={{ mb: 3 }}>
                <StickyBanner
                  title="🔴 Session Now LIVE"
                  message={`"${liveSessionBanner.title}" has started. View management for details.`}
                  priority="medium"
                  onClose={() => setLiveSessionBanner(null)}
                  onAction={() => {
                    setLiveSessionBanner(null);
                    // Navigate to specific management tab based on type
                    if (liveSessionBanner.type === 'COURSE') navigate('/courses');
                    else if (liveSessionBanner.type === 'PROJECT') navigate('/projects');
                    else if (liveSessionBanner.type === 'INTERNSHIP') navigate('/internships');
                    else navigate('/dashboard');
                  }}
                  actionLabel="View Management"
                />
              </Box>
            )}
            <Outlet />
          </Box>
        </Box>

        {/* Overlay when resizing to prevent iframe capturing mouse */}
        {isResizing && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              cursor: "ew-resize",
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Layout;
