import {
    Box,
    Tooltip,
    Dialog,
    DialogActions,
    Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";

import {
    Gauge,
    Books,
    Briefcase,
    FolderSimple,
    Megaphone,
    User,
    SignOut,
    GraduationCap,
    VideoCamera,
} from "@phosphor-icons/react";
import { useGetLiveNowSessionsApi } from "../Hooks/liveSessions";

interface SidebarProps {
    isOpen: boolean;
    isMobile?: boolean;
    onToggle?: () => void;
}

const StudentSidebar = ({ isOpen, isMobile, onToggle }: SidebarProps) => {

    const role = Cookies.get("role");
    const navigate = useNavigate();
    const location = useLocation();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const HandleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    const HandleLogoutConfirm = async () => {
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
            setLogoutModalOpen(false);
            navigate("/");
        }
    };

    const HandleLogoutCancel = () => {
        setLogoutModalOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;
    const { data: liveData } = useGetLiveNowSessionsApi();
    const hasLiveSession = liveData?.sessions && liveData.sessions.some(s => (s.activeParticipantsCount || 0) > 0);

    const menuItems = [
        { path: "/student/dashboard", label: "Overview", icon: Gauge },
        { path: "/student/my-courses", label: "My Courses", icon: Books },
        { path: "/student/my-internships", label: "Internships", icon: Briefcase },
        { path: "/student/my-projects", label: "Projects", icon: FolderSimple },
        { path: "/student/live-sessions", label: "Live Sessions", icon: VideoCamera },
        { path: "/student/announcements", label: "Announcements", icon: Megaphone },
        { path: "/student/profile", label: "Profile", icon: User },
    ];

    // Collapsed = narrow sidebar, Expanded = wide sidebar
    const isCollapsed = !isOpen && !isMobile;
    const showLabels = isOpen || isMobile;

    return (
        <>
            <Box
                sx={{
                    // bg-slate-900 border-r border-slate-800
                    bgcolor: "#0f172a", // slate-900
                    borderRight: "1px solid #1e293b", // slate-800
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    position: "sticky",
                    top: 0,
                    transition: "all 0.2s ease",
                    zIndex: 50,
                }}
            >
                {/* Header - p-4 border-b border-slate-800 */}
                <Box
                    sx={{
                        p: 2,
                        pt: "calc(env(safe-area-inset-top) + 16px)", // For iOS notched devices
                        borderBottom: "1px solid #1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        gap: 1.5,
                    }}
                >
                    <GraduationCap size={28} weight="duotone" style={{ color: "#60a5fa", flexShrink: 0 }} />
                    {showLabels && (
                        <Box sx={{ overflow: "hidden" }}>
                            {/* font-chivo font-bold text-sm uppercase tracking-wider */}
                            <Box
                                component="h1"
                                sx={{
                                    fontFamily: "'Chivo', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "14px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap",
                                    color: "#f8fafc",
                                    m: 0,
                                }}
                            >
                                Skill Up
                            </Box>
                            {/* text-xs text-slate-500 font-mono */}
                            <Box
                                sx={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                {role?.replace("_", " ") || "STUDENT"}
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Navigation - flex-1 p-2 overflow-y-auto */}
                <Box
                    component="nav"
                    sx={{
                        flex: 1,
                        p: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Box component="li" key={item.path}>
                                    <Tooltip title={isCollapsed ? item.label : ""} placement="right" arrow>
                                        <Box
                                            onClick={() => {
                                                navigate(item.path);
                                                if (isMobile && onToggle) onToggle();
                                            }}
                                            sx={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                px: 1.5,
                                                py: 1.25,
                                                borderRadius: "2px", // rounded-sm
                                                transition: "all 0.15s ease",
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                                justifyContent: isCollapsed ? "center" : "flex-start",
                                                // Active: text-blue-400 bg-blue-950/50 border-l-2 border-blue-400
                                                // Inactive: text-slate-400 hover:text-slate-100 hover:bg-slate-800
                                                ...(active
                                                    ? {
                                                        color: "#60a5fa", // blue-400
                                                        bgcolor: "rgba(23, 37, 84, 0.5)", // blue-950/50
                                                        borderLeft: "2px solid #60a5fa",
                                                    }
                                                    : {
                                                        color: "#94a3b8", // slate-400
                                                        "&:hover": {
                                                            color: "#f1f5f9", // slate-100
                                                            bgcolor: "#1e293b", // slate-800
                                                        },
                                                    }),
                                            }}
                                        >
                                            <Icon size={20} weight="duotone" style={{ flexShrink: 0 }} />
                                            {showLabels && (
                                                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden" }}>
                                                    <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {item.label}
                                                    </Box>
                                                    {item.label === "Live Sessions" && hasLiveSession && (
                                                        <Box
                                                            sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: "50%",
                                                                bgcolor: "#ef4444",
                                                                boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)",
                                                                animation: "pulse-red 2s infinite",
                                                                "@keyframes pulse-red": {
                                                                    "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
                                                                    "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(239, 68, 68, 0)" },
                                                                    "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" }
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Tooltip>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Logout - p-2 border-t border-slate-800 */}
                <Box sx={{ p: 1, borderTop: "1px solid #1e293b" }}>
                    <Tooltip title={isCollapsed ? "Sign Out" : ""} placement="right" arrow>
                        <Box
                            onClick={HandleLogoutClick}
                            sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 1.5,
                                py: 1.25,
                                borderRadius: "2px",
                                transition: "all 0.15s ease",
                                fontSize: "14px",
                                fontWeight: 500,
                                cursor: "pointer",
                                justifyContent: isCollapsed ? "center" : "flex-start",
                                color: "#f87171", // red-400
                                "&:hover": {
                                    color: "#fca5a5", // red-300
                                    bgcolor: "#1e293b",
                                },
                            }}
                        >
                            <SignOut size={20} style={{ flexShrink: 0 }} />
                            {showLabels && "Sign Out"}
                        </Box>
                    </Tooltip>
                </Box>
            </Box>

            {/* Logout Modal */}
            <Dialog
                open={logoutModalOpen}
                onClose={HandleLogoutCancel}
                sx={{
                    "& .MuiDialog-paper": {
                        bgcolor: "#1e293b",
                        border: "1px solid rgba(71, 85, 105, 0.5)",
                        borderRadius: "12px",
                        p: 2,
                    },
                    "& .MuiBackdrop-root": {
                        bgcolor: "rgba(15, 23, 42, 0.8)",
                        backdropFilter: "blur(8px)",
                    },
                }}
            >
                <Box sx={{ p: 2, textAlign: "center" }}>
                    <SignOut size={48} weight="duotone" style={{ color: "#f87171", marginBottom: 16 }} />
                    <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>
                        Sign Out?
                    </Box>
                    <Box sx={{ fontSize: "14px", color: "#94a3b8", mb: 2 }}>
                        Are you sure you want to sign out of your account?
                    </Box>
                </Box>
                <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
                    <Button
                        onClick={HandleLogoutCancel}
                        sx={{
                            bgcolor: "#334155",
                            color: "#f8fafc",
                            px: 3,
                            py: 1,
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#475569" },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={HandleLogoutConfirm}
                        sx={{
                            bgcolor: "#ef4444",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#dc2626" },
                        }}
                    >
                        Sign Out
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StudentSidebar;
