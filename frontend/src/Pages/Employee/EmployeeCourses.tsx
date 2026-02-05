import { Box, Typography, Card, CardContent, Chip, CircularProgress, Grid } from "@mui/material";
import { Books, User, Calendar, Clock } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useGetMyAssignedCourses } from "../../Hooks/employee";

const EmployeeCourses = () => {
    const navigate = useNavigate();
    const { data: courses, isLoading, error } = useGetMyAssignedCourses();

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
                <Typography sx={{ color: "#ef4444" }}>Failed to load assigned courses</Typography>
            </Box>
        );
    }

    if (!courses || courses.length === 0) {
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
                <Books size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
                    No courses assigned to you yet
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                    Courses where you are the trainer will appear here
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>
                    My Assigned Courses ({courses.length})
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {courses.map((course: any) => (
                    <Grid size={{ xs: 12, md: 6 }} key={course._id}>
                        <Card
                            onClick={() => navigate(`/employee/courses/${course._id}`)}
                            sx={{
                                bgcolor: "rgba(30, 41, 59, 0.6)",
                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                borderRadius: "12px",
                                transition: "all 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                    borderColor: "#3b82f6",
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
                                                bgcolor: "rgba(59, 130, 246, 0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Books size={24} weight="duotone" style={{ color: "#3b82f6" }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                                {course.name}
                                            </Typography>
                                            <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                                {course.category || "General"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={course.status || "Active"}
                                        size="small"
                                        sx={{
                                            bgcolor: course.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)",
                                            color: course.status === "Active" ? "#10b981" : "#64748b",
                                            fontWeight: 600,
                                            fontSize: "11px",
                                        }}
                                    />
                                </Box>

                                <Typography sx={{ color: "#94a3b8", fontSize: "13px", mb: 2, lineHeight: 1.6 }}>
                                    {course.description?.substring(0, 120)}
                                    {course.description?.length > 120 && "..."}
                                </Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <User size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {course.enrolledStudents?.length || 0} Students
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Clock size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {course.duration || "N/A"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Calendar size={14} style={{ color: "#64748b" }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {new Date(course.createdAt).toLocaleDateString()}
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

export default EmployeeCourses;
