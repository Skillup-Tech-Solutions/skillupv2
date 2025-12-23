
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
} from "@mui/material";
import {
    School,
    WorkOutline,
    AssignmentOutlined,
    CheckCircle,
    HourglassEmpty,
    PlayArrow,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

const StudentDashboard = () => {
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

    const cards = [
        {
            title: "My Courses",
            count: stats.totalCourses || 0,
            icon: <School sx={{ fontSize: 32 }} />,
            color: "#3b82f6",
            bgColor: "#eff6ff",
        },
        {
            title: "My Internships",
            count: stats.totalInternships || 0,
            icon: <WorkOutline sx={{ fontSize: 32 }} />,
            color: "#8b5cf6",
            bgColor: "#f5f3ff",
        },
        {
            title: "My Projects",
            count: stats.totalProjects || 0,
            icon: <AssignmentOutlined sx={{ fontSize: 32 }} />,
            color: "#f59e0b",
            bgColor: "#fffbeb",
        },
        {
            title: "Completed",
            count: stats.completed || 0,
            icon: <CheckCircle sx={{ fontSize: 32 }} />,
            color: "#10b981",
            bgColor: "#ecfdf5",
        },
        {
            title: "In Progress",
            count: stats.inProgress || 0,
            icon: <PlayArrow sx={{ fontSize: 32 }} />,
            color: "#6366f1",
            bgColor: "#eef2ff",
        },
        {
            title: "Pending",
            count: stats.assigned || 0,
            icon: <HourglassEmpty sx={{ fontSize: 32 }} />,
            color: "#f97316",
            bgColor: "#fff7ed",
        },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "error";
            case "medium":
                return "warning";
            default:
                return "info";
        }
    };

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Welcome back, {userName}! 👋
            </Typography>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">Failed to load dashboard data.</Alert>
            ) : (
                <>
                    {/* Stats Cards */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {cards.map((card, idx) => (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: "1px solid #e5e7eb",
                                        textAlign: "center",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            transform: "translateY(-2px)",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: "50%",
                                            backgroundColor: card.bgColor,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 12px",
                                            color: card.color,
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Typography variant="h4" fontWeight="bold" sx={{ color: card.color }}>
                                        {card.count}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {card.title}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Recent Announcements */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            📢 Recent Announcements
                        </Typography>
                        {announcements.length === 0 ? (
                            <Typography color="text.secondary">No announcements yet.</Typography>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {announcements.map((announcement: any) => (
                                    <Card
                                        key={announcement._id}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            "&:hover": { backgroundColor: "#f9fafb" },
                                        }}
                                    >
                                        <CardContent sx={{ py: 2 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="600">
                                                    {announcement.title}
                                                </Typography>
                                                <Chip
                                                    label={announcement.priority}
                                                    size="small"
                                                    color={getPriorityColor(announcement.priority)}
                                                    sx={{ textTransform: "capitalize" }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {announcement.content.length > 150
                                                    ? `${announcement.content.substring(0, 150)}...`
                                                    : announcement.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default StudentDashboard;
