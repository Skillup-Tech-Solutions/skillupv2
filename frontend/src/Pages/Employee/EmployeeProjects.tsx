import { Box, Typography, Card, CardContent, Chip, CircularProgress, Grid } from "@mui/material";
import { FolderSimple, User, Calendar, Code } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useGetMyAssignedProjects } from "../../Hooks/employee";

const EmployeeProjects = () => {
    const navigate = useNavigate();
    const { data: projects, isLoading, error } = useGetMyAssignedProjects();

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
                <Typography sx={{ color: "#ef4444" }}>Failed to load assigned projects</Typography>
            </Box>
        );
    }

    if (!projects || projects.length === 0) {
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
                <FolderSimple size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
                    No projects assigned to you yet
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                    Projects where you are the mentor will appear here
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>
                    My Assigned Projects ({projects.length})
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {projects.map((project: any) => (
                    <Grid size={{ xs: 12, md: 6 }} key={project._id}>
                        <Card
                            onClick={() => navigate(`/employee/projects/${project._id}`)}
                            sx={{
                                bgcolor: "rgba(30, 41, 59, 0.6)",
                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                borderRadius: "12px",
                                transition: "all 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                    borderColor: "#f59e0b",
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
                                                bgcolor: "rgba(245, 158, 11, 0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <FolderSimple size={24} weight="duotone" style={{ color: "#f59e0b" }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                                {project.title}
                                            </Typography>
                                            <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                                {project.category || "General"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={project.status || "Active"}
                                        size="small"
                                        sx={{
                                            bgcolor: project.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)",
                                            color: project.status === "Active" ? "#10b981" : "#64748b",
                                            fontWeight: 600,
                                            fontSize: "11px",
                                        }}
                                    />
                                </Box>

                                <Typography sx={{ color: "#94a3b8", fontSize: "13px", mb: 2, lineHeight: 1.6 }}>
                                    {project.description?.substring(0, 120)}
                                    {project.description?.length > 120 && "..."}
                                </Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <User size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {project.enrolledStudents?.length || 0} Students
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Code size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {project.techStack?.join(", ") || "N/A"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Calendar size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {new Date(project.createdAt).toLocaleDateString()}
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

export default EmployeeProjects;
