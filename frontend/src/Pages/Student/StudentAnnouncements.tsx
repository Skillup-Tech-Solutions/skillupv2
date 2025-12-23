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
                📢 Announcements
            </Typography>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">Failed to load announcements.</Alert>
            ) : !data || data.length === 0 ? (
                <Alert severity="info">No announcements at this time.</Alert>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {data.map((announcement: any) => (
                        <Card
                            key={announcement._id}
                            sx={{
                                borderRadius: 3,
                                border: "1px solid #e5e7eb",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                },
                            }}
                        >
                            <CardContent sx={{ py: 3 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                                    <Typography variant="h6" fontWeight="600">
                                        {announcement.title}
                                    </Typography>
                                    <Chip
                                        label={announcement.priority}
                                        size="small"
                                        color={getPriorityColor(announcement.priority)}
                                        sx={{ textTransform: "capitalize" }}
                                    />
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                                    {announcement.content}
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" color="text.disabled">
                                        Posted: {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </Typography>
                                    {announcement.createdBy?.name && (
                                        <Typography variant="caption" color="text.disabled">
                                            By: {announcement.createdBy.name}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default StudentAnnouncements;
