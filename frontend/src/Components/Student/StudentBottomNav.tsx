import { Paper, BottomNavigation, BottomNavigationAction, Box, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Gauge,
    Books,
    VideoCamera,
    User,
    List
} from "@phosphor-icons/react";
import { useGetLiveNowSessionsApi } from "../../Hooks/liveSessions";

interface StudentBottomNavProps {
    onOpenSidebar: () => void;
}

const StudentBottomNav = ({ onOpenSidebar }: StudentBottomNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery("(max-width:991px)");
    const { data: liveData } = useGetLiveNowSessionsApi();
    const hasLiveSession = liveData?.sessions && liveData.sessions.some(s => (s.activeParticipantsCount || 0) > 0);

    if (!isMobile) return null;

    const getActiveValue = () => {
        const path = location.pathname;
        if (path === "/student/dashboard") return 0;
        if (path === "/student/my-courses") return 1;
        if (path === "/student/live-sessions") return 2;
        if (path === "/student/profile") return 3;
        return -1;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                bgcolor: 'rgba(2, 6, 23, 0.85)',
                backdropFilter: 'blur(16px) saturate(180%)',
                borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
                display: { xs: 'block', lg: 'none' }, // match layout breakpoints
                paddingBottom: 'env(safe-area-inset-bottom)', // for PWA on iOS
                boxShadow: '0 -4px 20px -5px rgba(0, 0, 0, 0.5)',
            }}
            elevation={0}
        >
            <BottomNavigation
                showLabels
                value={getActiveValue()}
                onChange={(_, newValue) => {
                    if (newValue === 0) navigate("/student/dashboard");
                    else if (newValue === 1) navigate("/student/my-courses");
                    else if (newValue === 2) navigate("/student/live-sessions");
                    else if (newValue === 3) navigate("/student/profile");
                    else if (newValue === 4) onOpenSidebar();
                }}
                sx={{
                    bgcolor: 'transparent',
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        color: '#94a3b8',
                        minWidth: 'auto',
                        padding: '6px 0',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '& .Mui-selected': {
                        color: '#3b82f6 !important',
                        '& svg': {
                            transform: 'scale(1.1) translateY(-2px)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '10px',
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        marginTop: '2px',
                        transition: 'all 0.2s ease',
                    },
                    '& .Mui-selected .MuiBottomNavigationAction-label': {
                        fontSize: '11px',
                        fontWeight: 600,
                    },
                }}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<Gauge size={22} weight={getActiveValue() === 0 ? "fill" : "regular"} />}
                />
                <BottomNavigationAction
                    label="Courses"
                    icon={<Books size={22} weight={getActiveValue() === 1 ? "fill" : "regular"} />}
                />
                <BottomNavigationAction
                    label="Live"
                    icon={
                        <Box sx={{ position: 'relative' }}>
                            <VideoCamera size={22} weight={getActiveValue() === 2 ? "fill" : "regular"} />
                            {hasLiveSession && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -2,
                                        right: -2,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: '#ef4444',
                                        border: '2px solid #0f172a',
                                    }}
                                />
                            )}
                        </Box>
                    }
                />
                <BottomNavigationAction
                    label="Profile"
                    icon={<User size={22} weight={getActiveValue() === 3 ? "fill" : "regular"} />}
                />
                <BottomNavigationAction
                    label="More"
                    icon={<List size={22} />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default StudentBottomNav;
