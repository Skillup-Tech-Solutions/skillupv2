import {
    Box,
    Tooltip,
    Typography,
    Dialog,
    DialogActions,
    Button,
} from "@mui/material";
import { cancelButtonStyle, dangerButtonStyle } from "../assets/Styles/ButtonStyles";
import {
    LogoutBox,
    SidebarBottom,
    SidebarBottomLeft,
    SidebarBox,
    SidebarBoxOne,
    SidebarBoxTwo,
    SidebarLinks,
} from "../assets/Styles/SidebarStyle";
import { images } from "../assets/Images/Images";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import Cookies from "js-cookie";
import { TbLayoutDashboard } from "react-icons/tb";
import { AiOutlineRead } from "react-icons/ai";
import { MdOutlineAnnouncement, MdWorkOutline } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { GoProject } from "react-icons/go";

interface SidebarProps {
    isOpen: boolean;
    isMobile?: boolean;
}

const StudentSidebar = ({ isOpen, isMobile }: SidebarProps) => {
    const username = Cookies.get("name");
    const role = Cookies.get("role");
    const navigate = useNavigate();
    const location = useLocation();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const displayUsername =
        username && username.length > 10
            ? `${username.substring(0, 10)}...`
            : username;
    const displayrole =
        role && role.length > 10 ? `${role.substring(0, 10)}...` : role;

    const HandleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    const HandleLogoutConfirm = async () => {
        try {
            const accessToken = Cookies.get("skToken");
            const refreshToken = Cookies.get("skRefreshToken");

            // Call logout API to invalidate tokens
            if (accessToken) {
                await fetch(`${import.meta.env.VITE_APP_BASE_URL}logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ refreshToken })
                }).catch(() => {
                    // Ignore errors, proceed with local logout
                });
            }
        } finally {
            // Clear all cookies
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

    const menuItems = [
        { path: "/student/dashboard", label: "Dashboard", icon: <TbLayoutDashboard /> },
        { path: "/student/my-courses", label: "My Courses", icon: <AiOutlineRead /> },
        { path: "/student/my-internships", label: "My Internships", icon: <MdWorkOutline /> },
        { path: "/student/my-projects", label: "My Projects", icon: <GoProject /> },
        { path: "/student/announcements", label: "Announcements", icon: <MdOutlineAnnouncement /> },
        { path: "/student/profile", label: "My Profile", icon: <FaRegUser /> },
    ];

    return (
        <>
            <Box
                sx={{
                    ...SidebarBox,
                    ...(isMobile
                        ? {
                            opacity: 1,
                            visibility: "visible",
                        }
                        : {
                            opacity: isOpen ? 1 : 0,
                            visibility: isOpen ? "visible" : "hidden",
                            transition:
                                "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
                        }),
                }}
            >
                <Box>
                    <Box sx={{ ...SidebarBoxOne }}>
                        <Box component={"img"} src={images.logo} />
                    </Box>
                    <Box sx={{ ...SidebarBoxTwo }}>
                        {(isOpen || isMobile) && (
                            <Typography variant="h4">Student Portal</Typography>
                        )}
                        <Box sx={{ ...SidebarLinks }}>
                            {menuItems.map((item) => (
                                <Link to={item.path} key={item.path}>
                                    <Box
                                        sx={{
                                            backgroundColor: isActive(item.path)
                                                ? "var(--buttonPrimary)"
                                                : "transparent",
                                            color: isActive(item.path) ? "var(--white)" : "inherit",
                                            transition: "background-color 0.3s ease, color 0.3s ease",
                                        }}
                                    >
                                        {item.icon}
                                        {(isOpen || isMobile) && item.label}
                                    </Box>
                                </Link>
                            ))}
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ ...SidebarBottom }}>
                    <Box sx={{ ...SidebarBottomLeft }}>
                        <Box
                            sx={{
                                width: "35px",
                                height: "35px",
                                borderRadius: "50%",
                                backgroundColor: "var(--buttonPrimary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--white)",
                                fontFamily: "Medium_M",
                                fontSize: "16px",
                            }}
                        >
                            {(displayUsername || "User").charAt(0).toUpperCase()}
                        </Box>
                        {(isOpen || isMobile) && (
                            <Box>
                                <Typography variant="h2">
                                    {displayUsername || "User"}
                                </Typography>
                                <Typography variant="h3">
                                    <Tooltip title={role}>
                                        <span>{displayrole || "Student"}</span>
                                    </Tooltip>
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ ...LogoutBox }} onClick={HandleLogoutClick}>
                        <HiOutlineLogout />
                    </Box>
                </Box>
            </Box>

            {/* Logout Confirmation Modal */}
            <Dialog
                open={logoutModalOpen}
                onClose={HandleLogoutCancel}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "24px",
                        padding: 0,
                        margin: { xs: "20px", sm: "32px" },
                        maxWidth: { xs: "calc(100vw - 40px)", sm: "450px" },
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        background:
                            "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.8)",
                        overflow: "hidden",
                        position: "relative",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                                "linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444, #f59e0b)",
                        },
                    },
                    "& .MuiBackdrop-root": {
                        backgroundColor: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(12px)",
                    },
                }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        padding: { xs: "32px 24px", sm: "40px 32px" },
                    }}
                >
                    <Box
                        sx={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2)",
                        }}
                    >
                        <HiOutlineLogout
                            style={{
                                fontSize: "32px",
                                color: "#ef4444",
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: "18px", sm: "20px" },
                            color: "#1e293b",
                            marginBottom: "12px",
                        }}
                    >
                        Confirm Logout
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#64748b",
                            fontSize: { xs: "12px", sm: "14px" },
                            marginBottom: "32px",
                        }}
                    >
                        Are you sure you want to sign out?
                    </Typography>
                    <DialogActions
                        sx={{
                            padding: 0,
                            gap: "16px",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            onClick={HandleLogoutCancel}
                            variant="outlined"
                            sx={{ ...cancelButtonStyle, minWidth: "120px", borderRadius: "8px" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={HandleLogoutConfirm}
                            variant="contained"
                            sx={{ ...dangerButtonStyle, minWidth: "120px", borderRadius: "8px" }}
                        >
                            Sign Out
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
};

export default StudentSidebar;
