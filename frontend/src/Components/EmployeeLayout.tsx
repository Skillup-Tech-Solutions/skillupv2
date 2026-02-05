import {
    Box,
    useMediaQuery,
} from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import { triggerHaptic } from "../utils/pwaUtils";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import { authService } from "../services/authService";
import { useNotificationSocket } from "../Hooks/useNotificationSocket";
import { useDeviceSessionSocket } from "../Hooks/useDeviceSessionSocket";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { CaretLeft, List, SignOut } from "@phosphor-icons/react";
import { Capacitor } from "@capacitor/core";
import { hapticFeedback } from "../utils/haptics";
import { queryClient } from "../Hooks/ReactQueryProvider";

const MIN_WIDTH = 60;
const COLLAPSED_WIDTH = 64;
const DEFAULT_WIDTH = 64;
const MAX_WIDTH = 280;

const EmployeeLayout = () => {
    const isMobile = useMediaQuery("(max-width:991px)");
    const navigate = useNavigate();
    const location = useLocation();
    const userName = authService.getUserInfo().name || "Employee";
    const userEmail = authService.getUserInfo().email || "employee@skillup.com";

    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useNotificationSocket({
        onNotification: useCallback((notification: any) => {
            const priority = (notification.data?.priority as string)?.toLowerCase() || 'low';
            if (priority === 'high') {
                CustomSnackBar.warningSnackbar(`${notification.title}: ${notification.body}`);
            } else {
                CustomSnackBar.infoSnackbar(`${notification.title}: ${notification.body}`);
            }
            triggerHaptic(priority === 'high' ? 'heavy' : 'medium');
        }, [])
    });

    useDeviceSessionSocket({
        onRevoked: (message) => {
            CustomSnackBar.warningSnackbar(message || "Your session has been terminated.");
            triggerHaptic('heavy');
        }
    });

    useEffect(() => {
        const savedWidth = localStorage.getItem('employeeSidebarWidth');
        const savedHidden = localStorage.getItem('employeeSidebarHidden');
        if (savedWidth) setSidebarWidth(parseInt(savedWidth));
        if (savedHidden === 'true') setIsHidden(true);
    }, []);

    useEffect(() => {
        if (!isResizing) {
            localStorage.setItem('employeeSidebarWidth', sidebarWidth.toString());
            localStorage.setItem('employeeSidebarHidden', isHidden.toString());
        }
    }, [sidebarWidth, isHidden, isResizing]);

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
            if (newWidth < MIN_WIDTH) {
                setIsHidden(true);
                setSidebarWidth(COLLAPSED_WIDTH);
            } else {
                setIsHidden(false);
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

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const showLabels = sidebarWidth >= 150 && !isHidden;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/employee/dashboard") return "Dashboard";
        if (path === "/employee/courses") return "My Courses";
        if (path === "/employee/internships") return "My Internships";
        if (path === "/employee/projects") return "My Projects";
        if (path === "/employee/live-sessions") return "Live Sessions";
        if (path === "/employee/payslips") return "Payslips";
        if (path === "/employee/announcements") return "Announcements";
        if (path === "/employee/profile") return "My Profile";
        return "Employee Portal";
    };

    return (
        <Box
            className="portal-theme"
            sx={{
                minHeight: "100vh",
                bgcolor: "#020617",
                display: "flex",
                position: "relative",
            }}
        >
            <Box className="scanlines" />

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

            {isMobile ? (
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
                    <EmployeeSidebar isOpen={true} isMobile={true} onToggle={() => setMobileOpen(false)} />
                </Box>
            ) : (
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
                    <EmployeeSidebar isOpen={showLabels} isMobile={false} onToggle={() => { }} />
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
                                "&:hover": { bgcolor: "rgba(16, 185, 129, 0.5)" },
                                "&:active": { bgcolor: "#10b981" },
                            }}
                        />
                    )}
                </Box>
            )}

            <Box
                component="main"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    overflow: "visible",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        bgcolor: "#020617",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        position: "sticky",
                        top: 0,
                        zIndex: 40,
                        pt: Capacitor.isNativePlatform()
                            ? Capacitor.getPlatform() === 'android'
                                ? "max(env(safe-area-inset-top, 0px), 24px)"
                                : "env(safe-area-inset-top, 0px)"
                            : 0,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {isMobile && (
                                <Box
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setMobileOpen(true);
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
                            {!isMobile && isHidden && (
                                <Box
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setIsHidden(false);
                                        setSidebarWidth(DEFAULT_WIDTH);
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
                                        fontSize: { xs: "14px", md: "20px" },
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        color: "#f8fafc",
                                        m: 0,
                                    }}
                                >
                                    {getPageTitle()}
                                </Box>
                                <Box
                                    component="p"
                                    sx={{
                                        fontSize: "11px",
                                        color: "#10b981",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        mt: 0.25,
                                        m: 0,
                                    }}
                                >
                                    Welcome back, {userName}
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                            {location.pathname !== "/employee/dashboard" && (
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
                            {isMobile && (
                                <Box
                                    onClick={async () => {
                                        try {
                                            const accessToken = authService.getToken();
                                            const refreshToken = authService.getRefreshToken();
                                            if (accessToken) {
                                                await fetch(`${import.meta.env.VITE_APP_BASE_URL}logout`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Authorization": `Bearer ${accessToken}`
                                                    },
                                                    body: JSON.stringify({ refreshToken })
                                                }).catch(() => { });
                                            }
                                        } finally {
                                            queryClient.clear();
                                            authService.clearAuth();
                                            navigate("/");
                                        }
                                    }}
                                    sx={{
                                        p: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#f87171",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        borderRadius: "6px",
                                        border: "1px solid rgba(239, 68, 68, 0.2)",
                                        "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.4)" },
                                    }}
                                >
                                    <SignOut size={20} />
                                </Box>
                            )}
                            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                                <Box component="p" sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", m: 0 }}>
                                    Logged in as
                                </Box>
                                <Box component="p" sx={{ fontSize: "14px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1", m: 0 }}>
                                    {userEmail}
                                </Box>
                            </Box>
                            <Box
                                onClick={() => navigate("/employee/profile")}
                                sx={{
                                    width: { xs: 32, sm: 36 },
                                    height: { xs: 32, sm: 36 },
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                                {userName?.charAt(0).toUpperCase() || "E"}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Page Content */}
                <Box
                    className="animate-slide-up"
                    sx={{
                        p: { xs: 2, sm: 3 },
                        flex: 1,
                        pb: { xs: 12, lg: 3 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        overflowY: "auto",
                        overscrollBehavior: "contain",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            {!isOnline && (
                <Box
                    sx={{
                        position: "fixed",
                        top: { xs: 70, sm: 80 },
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 200,
                        bgcolor: "rgba(239, 68, 68, 0.9)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        px: 2,
                        py: 0.5,
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                    }}
                >
                    <Box sx={{ width: 6, height: 6, bgcolor: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                    Offline Mode
                </Box>
            )}

            {isResizing && (
                <Box sx={{ position: "fixed", inset: 0, zIndex: 100, cursor: "ew-resize" }} />
            )}
        </Box>
    );
};

export default EmployeeLayout;
