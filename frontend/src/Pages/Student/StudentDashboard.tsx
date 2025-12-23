
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Button,
} from "@mui/material";
import {
    MdSchool,
    MdWork,
    MdAssignment,
    MdCheckCircle,
    MdPlayArrow,
    MdArrowForward,
    MdAnnouncement,
    MdCalendarToday,
    MdTrendingUp,
} from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const token = Cookies.get("skToken");
    const userName = Cookies.get("name");

    const { data, isLoading, error } = useQuery({
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

    const stats = data?.stats || {};
    const announcements = data?.recentAnnouncements || [];
    const recentActivity = data?.recentActivity || [];
    const upcomingDeadlines = data?.upcomingDeadlines || [];

    // Helper to get item name and link
    const getItemDetails = (item: any) => {
        const title = item.itemId?.title || item.itemId?.name || "Untitled";
        let link = "";
        let typeLabel = "";

        if (item.itemType === "course") {
            link = "/student/my-courses";
            typeLabel = "Course";
        } else if (item.itemType === "project") {
            link = `/student/my-projects?projectId=${item._id}`;
            typeLabel = "Project";
        } else if (item.itemType === "internship") {
            link = "/student/my-internships";
            typeLabel = "Internship";
        }

        return { title, link, typeLabel };
    };

    const cards = [
        {
            title: "My Courses",
            count: stats.totalCourses || 0,
            icon: <MdSchool size={24} />,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            link: "/student/my-courses"
        },
        {
            title: "My Internships",
            count: stats.totalInternships || 0,
            icon: <MdWork size={24} />,
            color: "#8b5cf6",
            bgColor: "#f5f3ff",
            link: "/student/my-internships"
        },
        {
            title: "My Projects",
            count: stats.totalProjects || 0,
            icon: <MdAssignment size={24} />,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            link: "/student/my-projects"
        },
        {
            title: "In Progress",
            count: stats.inProgress || 0,
            icon: <MdPlayArrow size={24} />,
            color: "#6366f1",
            bgColor: "#eef2ff",
        },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "error";
            case "medium": return "warning";
            default: return "info";
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: "SemiBold_W", color: "var(--title)" }}>
                        Welcome back, {userName}! 👋
                    </Typography>
                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)", mt: 0.5 }}>
                        Here's what's happening with your learning today.
                    </Typography>
                </Box>
                <Typography sx={{ fontFamily: "Medium_W", fontSize: "14px", color: "var(--webprimary)", bgcolor: "#eff6ff", px: 2, py: 1, borderRadius: "20px" }}>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: "var(--webprimary)" }} />
                </Box>
            ) : error ? (
                <Alert severity="error">Failed to load dashboard data. Please refresh.</Alert>
            ) : (
                <Grid container spacing={4}>
                    {/* Stats Row */}
                    {cards.map((card, idx) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                            <Paper
                                elevation={0}
                                onClick={() => card.link && navigate(card.link)}
                                sx={{
                                    p: 3,
                                    borderRadius: "12px",
                                    bgcolor: "white",
                                    border: "1px solid #e0e0e0",
                                    cursor: card.link ? "pointer" : "default",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        borderColor: card.color,
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: "10px",
                                        bgcolor: card.bgColor,
                                        color: card.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        {card.icon}
                                    </Box>
                                    {card.link && <MdArrowForward color="#9ca3af" />}
                                </Box>
                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "28px", color: "var(--title)" }}>
                                    {card.count}
                                </Typography>
                                <Typography sx={{ fontFamily: "Medium_W", fontSize: "14px", color: "var(--greyText)" }}>
                                    {card.title}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}

                    {/* Main Content Area */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Continue Learning */}
                        {recentActivity.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                    <MdTrendingUp color="var(--webprimary)" /> Continue Learning
                                </Typography>
                                <Card sx={{ borderRadius: "12px", border: "1px solid #e0e0e0", boxShadow: "none" }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                                            <Box>
                                                <Chip
                                                    label={getItemDetails(recentActivity[0]).typeLabel}
                                                    size="small"
                                                    sx={{ bgcolor: "#eff6ff", color: "var(--webprimary)", fontFamily: "Medium_W", fontSize: "11px", mb: 1 }}
                                                />
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "20px" }}>
                                                    {getItemDetails(recentActivity[0]).title}
                                                </Typography>
                                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)", mt: 0.5 }}>
                                                    Status: <span style={{ textTransform: "capitalize" }}>{recentActivity[0].status?.replace("-", " ")}</span>
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                endIcon={<MdArrowForward />}
                                                onClick={() => navigate(getItemDetails(recentActivity[0]).link)}
                                                sx={{
                                                    bgcolor: "var(--webprimary)",
                                                    fontFamily: "Medium_W",
                                                    textTransform: "none",
                                                    borderRadius: "8px",
                                                    boxShadow: "none"
                                                }}
                                            >
                                                Continue
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Recent Announcements */}
                        <Box>
                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <MdAnnouncement color="#f59e0b" /> Recent Announcements
                            </Typography>
                            {announcements.length === 0 ? (
                                <Alert severity="info" sx={{ fontFamily: "Regular_W" }}>No new announcements.</Alert>
                            ) : (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {announcements.map((announcement: any) => (
                                        <Paper key={announcement._id} elevation={0} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: "10px" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "15px" }}>{announcement.title}</Typography>
                                                <Chip
                                                    label={announcement.priority}
                                                    size="small"
                                                    color={getPriorityColor(announcement.priority)}
                                                    sx={{ height: 20, fontSize: "10px", textTransform: "capitalize" }}
                                                />
                                            </Box>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)", mb: 1 }}>
                                                {announcement.content}
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "11px", color: "#9ca3af" }}>
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Sidebar Area */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        {/* Upcoming Deadlines */}
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <MdCalendarToday color="#ef4444" /> Upcoming Deadlines
                            </Typography>
                            {upcomingDeadlines.length === 0 ? (
                                <Paper elevation={0} sx={{ p: 3, textAlign: "center", bgcolor: "#f9fafb", borderRadius: "12px" }}>
                                    <MdCheckCircle size={40} color="#10b981" />
                                    <Typography sx={{ fontFamily: "Medium_W", fontSize: "14px", mt: 1 }}>All caught up!</Typography>
                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px", color: "var(--greyText)" }}>No pending deadlines.</Typography>
                                </Paper>
                            ) : (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {upcomingDeadlines.map((item: any) => (
                                        <Paper key={item._id} elevation={0} sx={{ p: 2, border: "1px solid #fecaca", bgcolor: "#fef2f2", borderRadius: "10px" }}>
                                            <Box sx={{ display: "flex", gap: 1.5 }}>
                                                <Box sx={{ minWidth: 4, bgcolor: "#ef4444", borderRadius: "4px" }} />
                                                <Box>
                                                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "14px", color: "#b91c1c" }}>
                                                        {item.itemId?.title}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px", color: "#7f1d1d", mt: 0.5 }}>
                                                        Due: {new Date(item.itemId.deadline).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default StudentDashboard;
