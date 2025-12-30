import { Box, Alert } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import DataCard from "../../Components/Student/DataCard";
import LiveSessionsWidget from "../../Components/LiveSessionsWidget";
import DashboardSkeleton from "../../Components/Student/DashboardSkeleton";
import { usePullToRefresh } from "../../utils/usePullToRefresh";
import PullToRefreshIndicator from "../../Components/Student/PullToRefreshIndicator";
import {
    GraduationCap,
    Books,
    Briefcase,
    FolderSimple,
    Megaphone,
    User,
    ArrowRight,
    Sparkle,
    Clock,
    Lightning,
    ChartLineUp,
    CheckCircle,
    Trophy,
    Star,
} from "@phosphor-icons/react";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const token = Cookies.get("skToken");
    const userName = Cookies.get("name");

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["student-dashboard"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/dashboard`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
    });

    const { pullDistance, isRefreshing } = usePullToRefresh({
        onRefresh: async () => {
            await refetch();
        },
    });

    const stats = data?.stats || {};
    const announcements = data?.recentAnnouncements || [];
    const recentActivity = data?.recentActivity || [];

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    sx={{
                        bgcolor: "rgba(127, 29, 29, 0.3)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.5)",
                        "& .MuiAlert-icon": { color: "#f87171" },
                    }}
                >
                    Failed to load dashboard data. Please refresh.
                </Alert>
            </Box>
        );
    }

    // Quick Actions - exact frontend-ref styling with subtly gradients
    const quickActions = [
        {
            path: "/student/my-courses",
            label: "My Courses",
            description: "View & continue learning",
            icon: Books,
            color: "#60a5fa", // blue-400
            iconBg: "rgba(30, 58, 138, 0.4)", // blue-900/40
            cardBg: "linear-gradient(to bottom right, rgba(23, 37, 84, 0.3), rgba(30, 58, 138, 0.1))", // blue-950/30 to blue-900/10
            borderColor: "rgba(29, 78, 216, 0.3)", // blue-700/30
            hoverBorderColor: "rgba(59, 130, 246, 0.5)", // blue-500/50
        },
        {
            path: "/student/my-internships",
            label: "Internships",
            description: "Track your internships",
            icon: Briefcase,
            color: "#c084fc", // purple-400
            iconBg: "rgba(88, 28, 135, 0.4)", // purple-900/40
            cardBg: "linear-gradient(to bottom right, rgba(59, 7, 100, 0.3), rgba(88, 28, 135, 0.1))", // purple-950/30 to purple-900/10
            borderColor: "rgba(126, 34, 206, 0.3)", // purple-700/30
            hoverBorderColor: "rgba(168, 85, 247, 0.5)", // purple-500/50
        },
        {
            path: "/student/my-projects",
            label: "Projects",
            description: "Submit & review",
            icon: FolderSimple,
            color: "#22d3ee", // cyan-400
            iconBg: "rgba(22, 78, 99, 0.4)", // cyan-900/40
            cardBg: "linear-gradient(to bottom right, rgba(8, 51, 68, 0.3), rgba(22, 78, 99, 0.1))", // cyan-950/30 to cyan-900/10
            borderColor: "rgba(14, 116, 144, 0.3)", // cyan-700/30
            hoverBorderColor: "rgba(6, 182, 212, 0.5)", // cyan-500/50
        },
        {
            path: "/student/announcements",
            label: "Announcements",
            description: "Latest updates",
            icon: Megaphone,
            color: "#f87171", // red-400
            iconBg: "rgba(127, 29, 29, 0.4)", // red-900/40
            cardBg: "linear-gradient(to bottom right, rgba(69, 10, 10, 0.3), rgba(127, 29, 29, 0.1))", // red-950/30 to red-900/10
            borderColor: "rgba(185, 28, 28, 0.3)", // red-700/30
            hoverBorderColor: "rgba(239, 68, 68, 0.5)", // red-500/50
        },
        {
            path: "/student/profile",
            label: "My Profile",
            description: "View & edit details",
            icon: User,
            color: "#f472b6", // pink-400
            iconBg: "rgba(131, 24, 67, 0.4)", // pink-900/40
            cardBg: "linear-gradient(to bottom right, rgba(80, 7, 36, 0.3), rgba(131, 24, 67, 0.1))", // pink-950/30 to pink-900/10
            borderColor: "rgba(190, 24, 93, 0.3)", // pink-700/30
            hoverBorderColor: "rgba(236, 72, 153, 0.5)", // pink-500/50
        },
    ];

    return (
        // space-y-8
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <PullToRefreshIndicator
                pullDistance={pullDistance}
                isRefreshing={isRefreshing}
                threshold={80}
            />
            {/* Header - flex items-center justify-between flex-wrap gap-4 */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: { xs: 1.5, sm: 2 },
                }}
            >
                <Box>
                    {/* text-2xl font-chivo font-bold uppercase tracking-wider flex items-center gap-3 */}
                    <Box
                        component="h1"
                        sx={{
                            fontSize: { xs: "18px", sm: "20px", md: "24px" },
                            fontFamily: "'Chivo', sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#f8fafc",
                            m: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, md: 1.5 },
                        }}
                    >
                        <GraduationCap size={28} weight="duotone" style={{ color: "#60a5fa" }} />
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Student Dashboard</Box>
                        <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Dashboard</Box>
                    </Box>
                    {/* text-slate-500 mt-1 */}
                    <Box
                        component="p"
                        sx={{
                            color: "#64748b",
                            mt: 0.5,
                            m: 0,
                            fontSize: { xs: "12px", sm: "14px" },
                        }}
                    >
                        Welcome back, <Box component="span" sx={{ color: "#cbd5e1", fontWeight: 500 }}>{userName || "Student"}</Box>!
                    </Box>
                </Box>
                {/* Status badge */}
                {stats.inProgress > 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 2,
                            py: 1,
                            background: "linear-gradient(135deg, rgba(20, 83, 45, 0.4) 0%, rgba(20, 83, 45, 0.2) 100%)",
                            border: "1px solid rgba(22, 101, 52, 0.5)",
                            borderRadius: "6px",
                        }}
                    >
                        <ChartLineUp size={20} weight="duotone" style={{ color: "#4ade80" }} />
                        <Box sx={{ color: "#4ade80", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {stats.inProgress} <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>In Progress</Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Stats Grid - grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" },
                    gap: { xs: 1, sm: 2 },
                }}
            >
                <DataCard
                    title="My Courses"
                    value={stats.totalCourses || 0}
                    icon={Books}
                />
                <DataCard
                    title="Internships"
                    value={stats.totalInternships || 0}
                    icon={Briefcase}
                />
                <DataCard
                    title="Projects"
                    value={stats.totalProjects || 0}
                    icon={FolderSimple}
                />
                <DataCard
                    title="Completed"
                    value={stats.completed || 0}
                    icon={Trophy}
                />
            </Box>

            {/* Two Column Layout - grid grid-cols-1 lg:grid-cols-2 gap-6 */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                    gap: 3,
                }}
            >
                {/* Live Sessions Widget */}
                <LiveSessionsWidget variant="student" maxItems={3} hideSkeleton={isRefreshing} />
                {/* Recent Announcements - bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 relative overflow-hidden */}
                <Box
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "6px",
                        p: { xs: 2, sm: 3 },
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Sparkle decoration */}
                    <Sparkle
                        size={80}
                        weight="duotone"
                        style={{
                            position: "absolute",
                            right: -16,
                            top: -16,
                            color: "rgba(71, 85, 105, 0.2)",
                        }}
                    />
                    {/* text-sm font-mono text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 */}
                    <Box
                        component="h3"
                        sx={{
                            fontSize: "14px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            mb: 2.5,
                            m: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Megaphone size={16} weight="duotone" />
                        Recent Announcements
                    </Box>
                    {announcements.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, position: "relative", zIndex: 10 }}>
                            {announcements.slice(0, 3).map((announcement: any) => (
                                <Box
                                    key={announcement._id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.5,
                                        bgcolor: "rgba(15, 23, 42, 0.5)",
                                        border: "1px solid rgba(30, 41, 59, 0.5)",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        {announcement.priority === "high" ? (
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f87171" }} />
                                        ) : announcement.priority === "medium" ? (
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#fbbf24" }} />
                                        ) : (
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#60a5fa" }} />
                                        )}
                                        <Box sx={{ color: "#cbd5e1", fontSize: { xs: "13px", md: "14px" }, maxWidth: { xs: 140, sm: 180, md: 200 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {announcement.title}
                                        </Box>
                                    </Box>
                                    <Box sx={{ fontSize: "11px", color: "#64748b" }}>
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 4, position: "relative", zIndex: 10 }}>
                            <Star size={48} weight="duotone" style={{ color: "#475569", marginBottom: 12, marginLeft: "auto", marginRight: "auto" }} />
                            <Box sx={{ color: "#64748b", fontSize: "14px" }}>No announcements yet</Box>
                        </Box>
                    )}
                    {/* Link - mt-4 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 */}
                    <Box
                        onClick={() => navigate("/student/announcements")}
                        sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            fontSize: "14px",
                            color: "#fbbf24",
                            cursor: "pointer",
                            transition: "color 0.2s",
                            "&:hover": { color: "#fcd34d" },
                        }}
                    >
                        View All <ArrowRight size={16} />
                    </Box>
                </Box>

                {/* Recent Activity - bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 relative overflow-hidden */}
                <Box
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "6px",
                        p: { xs: 2, sm: 3 },
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Sparkle
                        size={80}
                        weight="duotone"
                        style={{
                            position: "absolute",
                            right: -16,
                            top: -16,
                            color: "rgba(71, 85, 105, 0.2)",
                        }}
                    />
                    <Box
                        component="h3"
                        sx={{
                            fontSize: "14px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            mb: 2.5,
                            m: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Clock size={16} weight="duotone" />
                        Recent Activity
                    </Box>
                    {recentActivity.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, position: "relative", zIndex: 10 }}>
                            {recentActivity.slice(0, 4).map((item: any, idx: number) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.5,
                                        bgcolor: "rgba(15, 23, 42, 0.5)",
                                        border: "1px solid rgba(30, 41, 59, 0.5)",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        {item.status === "completed" ? (
                                            <CheckCircle size={18} weight="duotone" style={{ color: "#4ade80" }} />
                                        ) : (
                                            <Clock size={18} weight="duotone" style={{ color: "#60a5fa" }} />
                                        )}
                                        <Box sx={{ color: "#cbd5e1", fontSize: { xs: "13px", md: "14px" }, maxWidth: { xs: 120, sm: 150, md: 180 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {item.itemId?.title || item.itemId?.name || "Activity"}
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: "6px",
                                            ...(item.status === "completed"
                                                ? { color: "#4ade80", bgcolor: "rgba(22, 101, 52, 0.3)" }
                                                : { color: "#60a5fa", bgcolor: "rgba(30, 58, 138, 0.3)" }),
                                        }}
                                    >
                                        {item.itemType}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 4, position: "relative", zIndex: 10 }}>
                            <Star size={48} weight="duotone" style={{ color: "#475569", marginBottom: 12, marginLeft: "auto", marginRight: "auto" }} />
                            <Box sx={{ color: "#64748b", fontSize: "14px" }}>No recent activity</Box>
                        </Box>
                    )}
                    <Box
                        onClick={() => navigate("/student/my-courses")}
                        sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            fontSize: "14px",
                            color: "#60a5fa",
                            cursor: "pointer",
                            transition: "color 0.2s",
                            "&:hover": { color: "#93c5fd" },
                        }}
                    >
                        View All Courses <ArrowRight size={16} />
                    </Box>
                </Box>
            </Box>

            {/* Quick Actions */}
            <Box
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "6px",
                    p: { xs: 2, md: 3 },
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Sparkle
                    size={80}
                    weight="duotone"
                    style={{
                        position: "absolute",
                        right: -16,
                        top: -16,
                        color: "rgba(71, 85, 105, 0.2)",
                    }}
                />
                {/* Title with glowing badge style */}
                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        mb: 2.5,
                        bgcolor: "rgba(74, 222, 128, 0.1)", // green glow bg
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        borderRadius: "6px",
                    }}
                >
                    <Lightning size={14} weight="duotone" style={{ color: "#4ade80" }} />
                    <Box
                        component="span"
                        sx={{
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#4ade80",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 600,
                        }}
                    >
                        Quick Actions
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                        gap: 2,
                        position: "relative",
                        zIndex: 10,
                    }}
                >
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Box
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    p: { xs: 1.5, md: 2 },
                                    background: action.cardBg,
                                    border: `1px solid ${action.borderColor}`,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: action.hoverBorderColor,
                                    },
                                    "&:hover .action-arrow": {
                                        color: `${action.color} !important`,
                                        transform: "translateX(4px)",
                                    },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            p: 1.25,
                                            bgcolor: action.iconBg,
                                            borderRadius: "6px",
                                        }}
                                    >
                                        <Icon size={22} weight="duotone" style={{ color: action.color }} />
                                    </Box>
                                    <Box>
                                        <Box
                                            component="span"
                                            sx={{
                                                color: "#f8fafc",
                                                fontWeight: 700,
                                                fontSize: "14px",
                                                display: "block",
                                            }}
                                        >
                                            {action.label}
                                        </Box>
                                        <Box
                                            component="span"
                                            sx={{
                                                color: "#94a3b8",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {action.description}
                                        </Box>
                                    </Box>
                                </Box>
                                <ArrowRight
                                    size={18}
                                    className="action-arrow"
                                    style={{
                                        color: "#64748b",
                                        transition: "all 0.2s ease",
                                        flexShrink: 0,
                                    }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

export default StudentDashboard;
