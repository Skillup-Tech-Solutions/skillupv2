import { Box, useMediaQuery } from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentBottomNav from "./Student/StudentBottomNav";
import Cookies from "js-cookie";
import { List } from "@phosphor-icons/react";

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
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {/* Show toggle button when sidebar is hidden on desktop */}
                            {!isMobile && isHidden && (
                                <Box
                                    onClick={() => {
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
                <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1, pb: { xs: 10, lg: 3 } }}>
                    <Outlet />
                </Box>
            </Box>

            {/* Bottom Navigation for Mobile */}
            <StudentBottomNav onOpenSidebar={() => setMobileOpen(true)} />

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
