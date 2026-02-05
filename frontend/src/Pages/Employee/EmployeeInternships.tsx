import { Box, Typography, Card, CardContent, Chip, CircularProgress, Grid } from "@mui/material";
import { Briefcase, User, Calendar, MapPin } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useGetMyAssignedInternships } from "../../Hooks/employee";

const EmployeeInternships = () => {
    const navigate = useNavigate();
    const { data: internships, isLoading, error } = useGetMyAssignedInternships();

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
                <Typography sx={{ color: "#ef4444" }}>Failed to load assigned internships</Typography>
            </Box>
        );
    }

    if (!internships || internships.length === 0) {
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
                <Briefcase size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
                    No internships assigned to you yet
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                    Internships where you are the mentor will appear here
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>
                    My Assigned Internships ({internships.length})
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {internships.map((internship: any) => (
                    <Grid size={{ xs: 12, md: 6 }} key={internship._id}>
                        <Card
                            onClick={() => navigate(`/employee/internships/${internship._id}`)}
                            sx={{
                                bgcolor: "rgba(30, 41, 59, 0.6)",
                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                borderRadius: "12px",
                                transition: "all 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                    borderColor: "#8b5cf6",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: "12px",
                                                bgcolor: "rgba(139, 92, 246, 0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Briefcase size={24} weight="duotone" style={{ color: "#8b5cf6" }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                                {internship.title}
                                            </Typography>
                                            <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                                {internship.company || "Company"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={internship.status || "Active"}
                                        size="small"
                                        sx={{
                                            bgcolor: internship.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)",
                                            color: internship.status === "Active" ? "#10b981" : "#64748b",
                                            fontWeight: 600,
                                            fontSize: "11px",
                                        }}
                                    />
                                </Box>

                                <Typography sx={{ color: "#94a3b8", fontSize: "13px", mb: 2, lineHeight: 1.6 }}>
                                    {internship.description?.substring(0, 120)}
                                    {internship.description?.length > 120 && "..."}
                                </Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <User size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {internship.enrolledStudents?.length || 0} Interns
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <MapPin size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {internship.location || "Remote"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Calendar size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {internship.duration || "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default EmployeeInternships;
