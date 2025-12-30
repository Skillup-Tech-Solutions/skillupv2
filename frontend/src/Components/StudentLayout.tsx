import { Box, useMediaQuery } from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import { triggerHaptic } from "../utils/pwaUtils";
import { Outlet, useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentBottomNav from "./Student/StudentBottomNav";
import Cookies from "js-cookie";
import { List, SignOut } from "@phosphor-icons/react";

// Sidebar width constants matching frontend-ref
const MIN_WIDTH = 60;
const COLLAPSED_WIDTH = 64;
const DEFAULT_WIDTH = 64;  // Default to collapsed
const MAX_WIDTH = 280;

const StudentLayout = () => {
    const isMobile = useMediaQuery("(max-width:991px)");
    const navigate = useNavigate();
    const userName = Cookies.get("name") || "Student";
    const userEmail = Cookies.get("email") || "student@campus.edu";

    // Resizable sidebar state
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadFileName, setDownloadFileName] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Load saved width from localStorage
    useEffect(() => {
        const savedWidth = localStorage.getItem('studentSidebarWidth');
        const savedHidden = localStorage.getItem('studentSidebarHidden');
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
            localStorage.setItem('studentSidebarWidth', sidebarWidth.toString());
            localStorage.setItem('studentSidebarHidden', isHidden.toString());
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

    useEffect(() => {
        const handleDownloadStart = (e: any) => {
            setIsDownloading(true);
            setDownloadFileName(e.detail?.filename || "file");
        };
        const handleDownloadEnd = () => {
            setIsDownloading(false);
        };

        window.addEventListener('download-start', handleDownloadStart as EventListener);
        window.addEventListener('download-end', handleDownloadEnd);

        return () => {
            window.removeEventListener('download-start', handleDownloadStart as EventListener);
            window.removeEventListener('download-end', handleDownloadEnd);
        };
    }, []);

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
                    <StudentSidebar isOpen={true} isMobile={true} onToggle={() => setMobileOpen(false)} />
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
                    <StudentSidebar isOpen={showLabels} isMobile={false} onToggle={() => { }} />

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
                        pt: "env(safe-area-inset-top)", // For PWA on iOS
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {/* Show toggle button when sidebar is hidden on desktop */}
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
                                    Dashboard
                                </Box>
                                <Box
                                    component="p"
                                    sx={{
                                        fontSize: "11px",
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
                        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                            {/* Sign Out on Mobile */}
                            {isMobile && (
                                <Box
                                    onClick={async () => {
                                        try {
                                            const accessToken = Cookies.get("skToken");
                                            const refreshToken = Cookies.get("skRefreshToken");
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
                                            Cookies.remove("name");
                                            Cookies.remove("role");
                                            Cookies.remove("skToken");
                                            Cookies.remove("skRefreshToken");
                                            Cookies.remove("email");
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
                                onClick={() => navigate("/student/profile")}
                                sx={{
                                    width: { xs: 32, sm: 36 },
                                    height: { xs: 32, sm: 36 },
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
                                {userName?.charAt(0).toUpperCase() || "S"}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Page Content */}
                <Box className="animate-slide-up" sx={{ p: { xs: 2, sm: 3 }, flex: 1, pb: { xs: 10, lg: 3 } }}>
                    <Outlet />
                </Box>
            </Box>

            {/* Bottom Navigation for Mobile */}
            <StudentBottomNav onOpenSidebar={() => setMobileOpen(true)} />

            {/* Download Progress Indicator */}
            {isDownloading && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: isMobile ? 80 : 20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 200,
                        bgcolor: "rgba(15, 23, 42, 0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(59, 130, 246, 0.5)",
                        borderRadius: "12px",
                        px: 3,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        minWidth: "280px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        animation: "slideUp 0.3s ease-out",
                        "@keyframes slideUp": {
                            from: { transform: "translateX(-50%) translateY(20px)", opacity: 0 },
                            to: { transform: "translateX(-50%) translateY(0)", opacity: 1 }
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            border: "2px solid rgba(59, 130, 246, 0.2)",
                            borderTopColor: "#3b82f6",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                        }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ color: "#f8fafc", fontSize: "13px", fontWeight: 600 }}>Downloading...</Box>
                        <Box sx={{ color: "#94a3b8", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                            {downloadFileName}
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Network Status Indicator */}
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
                        animation: "fadeInDown 0.3s ease-out",
                        "@keyframes fadeInDown": {
                            from: { transform: "translateX(-50%) translateY(-10px)", opacity: 0 },
                            to: { transform: "translateX(-50%) translateY(0)", opacity: 1 }
                        }
                    }}
                >
                    <Box sx={{ width: 6, height: 6, bgcolor: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                    Offline Mode
                </Box>
            )}

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
    );
};

export default StudentLayout;
