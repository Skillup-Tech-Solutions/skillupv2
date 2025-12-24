import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { MdAnnouncement, MdCalendarToday, MdPerson } from "react-icons/md";

const StudentAnnouncements = () => {
    const token = Cookies.get("skToken");

    const { data, isLoading, error } = useQuery({
        queryKey: ["student-announcements"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/announcements`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
    });

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high":
                return {
                    label: "High Priority",
                    color: "#ef4444",
                    bg: "#fef2f2",
                    border: "#fecaca"
                };
            case "medium":
                return {
                    label: "Medium",
                    color: "#f59e0b",
                    bg: "#fffbeb",
                    border: "#fcd34d"
                };
            default:
                return {
                    label: "Normal",
                    color: "var(--webprimary)",
                    bg: "#eff6ff",
                    border: "#93c5fd"
                };
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress sx={{ color: "var(--webprimary)" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Failed to load announcements. Please try again.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "24px",
                        color: "var(--title)",
                        "@media (max-width: 768px)": { fontSize: "22px" },
                    }}
                >
                    Announcements
                </Typography>
                <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                    Stay updated with the latest news and important notices
                </Typography>
            </Box>

            {!data || data.length === 0 ? (
                <Card sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    p: 6,
                    textAlign: "center"
                }}>
                    <MdAnnouncement size={48} color="var(--greyText)" />
                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", mt: 2, mb: 1 }}>
                        No announcements yet!
                    </Typography>
                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                        Check back later for important updates.
                    </Typography>
                </Card>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {data.map((announcement: any) => {
                        const priorityStyle = getPriorityStyles(announcement.priority);

                        return (
                            <Card
                                key={announcement._id}
                                sx={{
                                    border: `1px solid ${priorityStyle.border}`,
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                        transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                {/* Priority Accent Bar */}
                                <Box sx={{ height: 4, bgcolor: priorityStyle.color }} />

                                <CardContent sx={{ p: 3 }}>
                                    {/* Header */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "10px",
                                                    bgcolor: priorityStyle.bg,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <MdAnnouncement size={20} color={priorityStyle.color} />
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontFamily: "SemiBold_W",
                                                    fontSize: "16px",
                                                    color: "var(--title)",
                                                }}
                                            >
                                                {announcement.title}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={priorityStyle.label}
                                            size="small"
                                            sx={{
                                                fontFamily: "Medium_W",
                                                fontSize: "11px",
                                                bgcolor: priorityStyle.bg,
                                                color: priorityStyle.color,
                                                border: `1px solid ${priorityStyle.color}`,
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                            }}
                                        />
                                    </Box>

                                    {/* Content */}
                                    <Typography
                                        sx={{
                                            fontFamily: "Regular_W",
                                            fontSize: "14px",
                                            color: "var(--greyText)",
                                            lineHeight: 1.7,
                                            mb: 2,
                                        }}
                                    >
                                        {announcement.content}
                                    </Typography>

                                    {/* Footer */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                            <MdCalendarToday size={14} />
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>
                                                {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </Typography>
                                        </Box>
                                        {announcement.createdBy?.name && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                                <MdPerson size={14} />
                                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>
                                                    {announcement.createdBy.name}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default StudentAnnouncements;
