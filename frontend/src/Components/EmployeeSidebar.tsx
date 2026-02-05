import {
    Box,
    Tooltip,
    Dialog,
    DialogActions,
    Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/authService";
import { queryClient } from "../Hooks/ReactQueryProvider";

import {
    Gauge,
    Books,
    Briefcase,
    FolderSimple,
    Megaphone,
    User,
    SignOut,
    UsersThree,
    VideoCamera,
    CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { useGetEmployeeLiveSessions } from "../Hooks/employee";

interface SidebarProps {
    isOpen: boolean;
    isMobile?: boolean;
    onToggle?: () => void;
}

const EmployeeSidebar = ({ isOpen, isMobile, onToggle }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const HandleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    const HandleLogoutConfirm = async () => {
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
            setLogoutModalOpen(false);
            navigate("/");
        }
    };

    const HandleLogoutCancel = () => {
        setLogoutModalOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;
    const { data: sessionsData } = useGetEmployeeLiveSessions();
    const hasUpcomingSession = sessionsData?.some((s: any) => s.status === "SCHEDULED" || s.status === "LIVE");

    const menuItems = [
        { path: "/employee/dashboard", label: "Dashboard", icon: Gauge },
        { path: "/employee/courses", label: "My Courses", icon: Books },
        { path: "/employee/internships", label: "Internships", icon: Briefcase },
        { path: "/employee/projects", label: "Projects", icon: FolderSimple },
        { path: "/employee/live-sessions", label: "Live Sessions", icon: VideoCamera },
        { path: "/employee/payslips", label: "Payslips", icon: CurrencyCircleDollar },
        { path: "/employee/announcements", label: "Announcements", icon: Megaphone },
        { path: "/employee/profile", label: "Profile", icon: User },
    ];

    const isCollapsed = !isOpen && !isMobile;
    const showLabels = isOpen || isMobile;

    return (
        <>
            <Box
                sx={{
                    bgcolor: "#0f172a",
                    borderRight: "1px solid #1e293b",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    position: "sticky",
                    top: 0,
                    transition: "all 0.2s ease",
                    zIndex: 50,
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        pt: "calc(env(safe-area-inset-top, 0px) + 16px)",
                        borderBottom: "1px solid #1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        gap: 1.5,
                    }}
                >
                    <UsersThree size={28} weight="duotone" style={{ color: "#10b981", flexShrink: 0 }} />
                    {showLabels && (
                        <Box sx={{ overflow: "hidden" }}>
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
                            <Box
                                sx={{
                                    fontSize: "12px",
                                    color: "#10b981",
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                EMPLOYEE
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Navigation */}
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
                                                borderRadius: "2px",
                                                transition: "all 0.15s ease",
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                                justifyContent: isCollapsed ? "center" : "flex-start",
                                                ...(active
                                                    ? {
                                                        color: "#10b981",
                                                        bgcolor: "rgba(16, 185, 129, 0.1)",
                                                        borderLeft: "2px solid #10b981",
                                                    }
                                                    : {
                                                        color: "#94a3b8",
                                                        "&:hover": {
                                                            color: "#f1f5f9",
                                                            bgcolor: "#1e293b",
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
                                                    {item.label === "Live Sessions" && hasUpcomingSession && (
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

                {/* Logout */}
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
                                color: "#f87171",
                                "&:hover": {
                                    color: "#fca5a5",
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

export default EmployeeSidebar;
