import { Box, Typography, Card, CardContent, CircularProgress, Grid, Avatar } from "@mui/material";
import { Envelope, Phone, MapPin, Briefcase, Calendar, IdentificationCard } from "@phosphor-icons/react";
import { useGetEmployeeProfile } from "../../Hooks/employee";

const EmployeeProfile = () => {
    const { data, isLoading, error } = useGetEmployeeProfile();

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
                <Typography sx={{ color: "#ef4444" }}>Failed to load profile</Typography>
            </Box>
        );
    }

    const { user, profile } = data || {};

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Profile Header */}
            <Card
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "12px",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                fontSize: "32px",
                                fontWeight: 700,
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase() || "E"}
                        </Avatar>
                        <Box>
                            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "24px" }}>
                                {user?.name || "Employee"}
                            </Typography>
                            <Typography sx={{ color: "#10b981", fontSize: "14px", fontWeight: 500 }}>
                                {profile?.designation || "Employee"}
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 0.5 }}>
                                Employee ID: {profile?.employeeId || "N/A"}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Profile Details */}
            <Grid container spacing={3}>
                {/* Contact Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            bgcolor: "rgba(30, 41, 59, 0.6)",
                            border: "1px solid rgba(71, 85, 105, 0.4)",
                            borderRadius: "12px",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px", mb: 3 }}>
                                Contact Information
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Envelope size={18} style={{ color: "#3b82f6" }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>Email</Typography>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "14px" }}>{user?.email || "N/A"}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Phone size={18} style={{ color: "#10b981" }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>Phone</Typography>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "14px" }}>{profile?.contactNumber || "N/A"}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <MapPin size={18} style={{ color: "#f59e0b" }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>Address</Typography>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "14px" }}>{profile?.address || "N/A"}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Employment Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            bgcolor: "rgba(30, 41, 59, 0.6)",
                            border: "1px solid rgba(71, 85, 105, 0.4)",
                            borderRadius: "12px",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px", mb: 3 }}>
                                Employment Details
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Briefcase size={18} style={{ color: "#8b5cf6" }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>Department</Typography>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "14px" }}>{profile?.department || "N/A"}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(236, 72, 153, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <IdentificationCard size={18} style={{ color: "#ec4899" }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>Employment Type</Typography>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "14px" }}>{profile?.employmentType || "N/A"}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(20, 184, 166, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Calendar size={18} style={{ color: "#14b8a6" }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>Date of Joining</Typography>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "14px" }}>
                                            {profile?.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EmployeeProfile;
