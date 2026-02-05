import { Box, Typography, Card, CardContent, CircularProgress } from "@mui/material";
import { Megaphone, Calendar } from "@phosphor-icons/react";
import { useGetEmployeeAnnouncements } from "../../Hooks/employee";

const EmployeeAnnouncements = () => {
    const { data: announcements, isLoading, error } = useGetEmployeeAnnouncements();

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress sx={{ color: "#10b981" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography sx={{ color: "#ef4444" }}>Failed to load announcements</Typography>
            </Box>
        );
    }

    if (!announcements || announcements.length === 0) {
        return (
            <Box
                sx={{
                    p: 4,
                    borderRadius: "12px",
                    bgcolor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    textAlign: "center",
                }}
            >
                <Megaphone size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
                    No announcements yet
                </Typography>
            </Box>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case "high": return "#ef4444";
            case "medium": return "#f59e0b";
            default: return "#3b82f6";
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>
                Announcements ({announcements.length})
            </Typography>

            {announcements.map((announcement: any) => (
                <Card
                    key={announcement._id}
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.6)",
                        border: "1px solid rgba(71, 85, 105, 0.4)",
                        borderRadius: "12px",
                        borderLeft: `3px solid ${getPriorityColor(announcement.priority)}`,
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Megaphone size={24} weight="duotone" style={{ color: getPriorityColor(announcement.priority) }} />
                                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                    {announcement.title}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Calendar size={14} style={{ color: "#64748b" }} />
                                <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
                            {announcement.content}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default EmployeeAnnouncements;
