import { Box, Typography, Paper, Avatar, Chip } from "@mui/material";
import { User, Envelope, Phone, Shield } from "@phosphor-icons/react";
import { useMemo } from "react";
import { authService } from "../services/authService";

const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", p: 1.5, borderRadius: "12px", display: 'flex' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
            <Typography variant="body1" sx={{ color: "#f8fafc", fontWeight: 600 }}>{value}</Typography>
        </Box>
    </Box>
);

const Profile = () => {
    const user = useMemo(() => authService.getUserInfo(), []);

    if (!user || !user.email) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading profile...</Typography></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", letterSpacing: '-0.02em' }}>
                    USER PROFILE
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                    Manage your personal information and account settings
                </Typography>
            </Box>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "350px 1fr" },
                gap: 3
            }}>
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "20px" }}>
                    <Avatar
                        sx={{
                            width: 120,
                            height: 120,
                            margin: "0 auto",
                            mb: 2,
                            bgcolor: "#3b82f6",
                            fontSize: "3rem",
                            fontWeight: 700,
                            border: "4px solid rgba(59, 130, 246, 0.3)"
                        }}
                    >
                        {user.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#f8fafc" }}>{user.name}</Typography>
                    <Chip
                        label={user.role?.toUpperCase()}
                        size="small"
                        sx={{
                            mt: 1,
                            bgcolor: "rgba(59, 130, 246, 0.15)",
                            color: "#60a5fa",
                            fontWeight: 700,
                            fontSize: "10px",
                            border: "1px solid rgba(59, 130, 246, 0.3)"
                        }}
                    />
                </Paper>

                <Paper sx={{ p: 4, bgcolor: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "20px" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#f8fafc", mb: 3 }}>Account Details</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 4 }}>
                        <InfoItem icon={<User size={20} />} label="Full Name" value={user.name || "-"} />
                        <InfoItem icon={<Envelope size={20} />} label="Email Address" value={user.email} />
                        <InfoItem icon={<Phone size={20} />} label="Mobile Number" value={user.mobile || "-"} />
                        <InfoItem icon={<Shield size={20} />} label="Account Role" value={user.role || "-"} />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default Profile;
