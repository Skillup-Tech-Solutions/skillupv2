import { Box, Typography, Card, CardContent, Chip, CircularProgress, Button, Grid } from "@mui/material";
import { VideoCamera, Calendar, Clock, Play } from "@phosphor-icons/react";
import { useGetEmployeeLiveSessions } from "../../Hooks/employee";

const EmployeeLiveSessions = () => {
    const { data: sessions, isLoading, error } = useGetEmployeeLiveSessions();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "LIVE": return { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" };
            case "SCHEDULED": return { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" };
            case "COMPLETED": return { bg: "rgba(16, 185, 129, 0.2)", text: "#10b981" };
            default: return { bg: "rgba(100, 116, 139, 0.2)", text: "#64748b" };
        }
    };

    const handleJoinSession = (session: any) => {
        if (session.roomUrl) {
            window.open(session.roomUrl, "_blank");
        }
    };

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
                <Typography sx={{ color: "#ef4444" }}>Failed to load live sessions</Typography>
            </Box>
        );
    }

    if (!sessions || sessions.length === 0) {
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
                <VideoCamera size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
                    No live sessions assigned to you
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                    Sessions where you are the host will appear here
                </Typography>
            </Box>
        );
    }

    const liveSessions = sessions.filter((s: any) => s.status === "LIVE");
    const upcomingSessions = sessions.filter((s: any) => s.status === "SCHEDULED");
    const completedSessions = sessions.filter((s: any) => s.status === "COMPLETED");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Live Now */}
            {liveSessions.length > 0 && (
                <Box>
                    <Typography sx={{ color: "#ef4444", fontWeight: 700, fontSize: "18px", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444", animation: "pulse 1.5s infinite" }} />
                        Live Now
                    </Typography>
                    <Grid container spacing={3}>
                        {liveSessions.map((session: any) => (
                            <Grid size={{ xs: 12, md: 6 }} key={session._id}>
                                <Card
                                    sx={{
                                        bgcolor: "rgba(239, 68, 68, 0.1)",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                            <VideoCamera size={24} weight="duotone" style={{ color: "#ef4444" }} />
                                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                                {session.title}
                                            </Typography>
                                        </Box>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Play size={18} />}
                                            onClick={() => handleJoinSession(session)}
                                            sx={{
                                                bgcolor: "#ef4444",
                                                "&:hover": { bgcolor: "#dc2626" },
                                                fontWeight: 600,
                                            }}
                                        >
                                            Join as Host
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Upcoming */}
            {upcomingSessions.length > 0 && (
                <Box>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Upcoming Sessions ({upcomingSessions.length})
                    </Typography>
                    <Grid container spacing={3}>
                        {upcomingSessions.map((session: any) => {
                            const statusColor = getStatusColor(session.status);
                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={session._id}>
                                    <Card
                                        sx={{
                                            bgcolor: "rgba(30, 41, 59, 0.6)",
                                            border: "1px solid rgba(71, 85, 105, 0.4)",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                    <VideoCamera size={24} weight="duotone" style={{ color: "#3b82f6" }} />
                                                    <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                                        {session.title}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={session.status}
                                                    size="small"
                                                    sx={{ bgcolor: statusColor.bg, color: statusColor.text, fontWeight: 600, fontSize: "11px" }}
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", gap: 3 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <Calendar size={14} style={{ color: "#64748b" }} />
                                                    <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                                        {new Date(session.scheduledAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <Clock size={14} style={{ color: "#64748b" }} />
                                                    <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                                        {new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {/* Completed */}
            {completedSessions.length > 0 && (
                <Box>
                    <Typography sx={{ color: "#64748b", fontWeight: 700, fontSize: "16px", mb: 2 }}>
                        Past Sessions ({completedSessions.length})
                    </Typography>
                    <Grid container spacing={2}>
                        {completedSessions.slice(0, 6).map((session: any) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session._id}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: "8px",
                                        bgcolor: "rgba(30, 41, 59, 0.4)",
                                        border: "1px solid rgba(71, 85, 105, 0.2)",
                                    }}
                                >
                                    <Typography sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "14px", mb: 1 }}>
                                        {session.title}
                                    </Typography>
                                    <Typography sx={{ color: "#64748b", fontSize: "11px" }}>
                                        {new Date(session.scheduledAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default EmployeeLiveSessions;
