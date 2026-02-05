import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { Books, Briefcase, FolderSimple, VideoCamera, CurrencyCircleDollar } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeDashboardStats, useGetMyPayslips } from "../../Hooks/employee";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading } = useGetEmployeeDashboardStats();
    const { data: payslips } = useGetMyPayslips();

    const statCards = [
        {
            label: "Assigned Courses",
            value: stats?.courses || 0,
            icon: Books,
            color: "#3b82f6",
            path: "/employee/courses"
        },
        {
            label: "Assigned Internships",
            value: stats?.internships || 0,
            icon: Briefcase,
            color: "#8b5cf6",
            path: "/employee/internships"
        },
        {
            label: "Assigned Projects",
            value: stats?.projects || 0,
            icon: FolderSimple,
            color: "#f59e0b",
            path: "/employee/projects"
        },
        {
            label: "Upcoming Sessions",
            value: stats?.upcomingSessions || 0,
            icon: VideoCamera,
            color: "#ef4444",
            path: "/employee/live-sessions"
        },
        {
            label: "Total Payslips",
            value: payslips?.length || 0,
            icon: CurrencyCircleDollar,
            color: "#10b981",
            path: "/employee/payslips"
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <CircularProgress sx={{ color: "#10b981" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Welcome Section */}
            <Box
                sx={{
                    p: 4,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
            >
                <Typography
                    sx={{
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 800,
                        fontSize: { xs: "24px", md: "32px" },
                        color: "#f8fafc",
                        mb: 1,
                    }}
                >
                    Employee Dashboard
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "14px" }}>
                    Manage your assigned courses, internships, projects, and live sessions.
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3}>
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.label}>
                            <Box
                                onClick={() => navigate(stat.path)}
                                sx={{
                                    p: 3,
                                    borderRadius: "12px",
                                    bgcolor: "rgba(30, 41, 59, 0.6)",
                                    border: "1px solid rgba(71, 85, 105, 0.4)",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        borderColor: stat.color,
                                        transform: "translateY(-2px)",
                                        boxShadow: `0 8px 24px -8px ${stat.color}40`,
                                    },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "12px",
                                            bgcolor: `${stat.color}20`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Icon size={24} weight="duotone" style={{ color: stat.color }} />
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontWeight: 700,
                                            fontSize: "32px",
                                            color: stat.color,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Quick Actions */}
            <Box>
                <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px", mb: 2 }}>
                    Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box
                            onClick={() => navigate("/employee/live-sessions")}
                            sx={{
                                p: 2.5,
                                borderRadius: "8px",
                                bgcolor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                cursor: "pointer",
                                textAlign: "center",
                                transition: "all 0.2s",
                                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
                            }}
                        >
                            <VideoCamera size={28} weight="duotone" style={{ color: "#ef4444", marginBottom: 8 }} />
                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "13px" }}>
                                Host Live Session
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box
                            onClick={() => navigate("/employee/payslips")}
                            sx={{
                                p: 2.5,
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 185, 129, 0.1)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                cursor: "pointer",
                                textAlign: "center",
                                transition: "all 0.2s",
                                "&:hover": { bgcolor: "rgba(16, 185, 129, 0.2)" },
                            }}
                        >
                            <CurrencyCircleDollar size={28} weight="duotone" style={{ color: "#10b981", marginBottom: 8 }} />
                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "13px" }}>
                                View Payslips
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default EmployeeDashboard;
