import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    Divider,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import { MdPerson, MdEmail, MdPhone, MdCalendarToday, MdSecurity, MdEdit } from "react-icons/md";
import { primaryButtonStyle, outlinedButtonStyle } from "../../assets/Styles/ButtonStyles";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    status: string;
    createdAt: string;
}

const StudentProfile = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", mobile: "" });
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const { data, isLoading, error } = useQuery<UserProfile>({
        queryKey: ["student-profile"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/me`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
    });

    // Set form data when data loads
    useEffect(() => {
        if (data) {
            setFormData({ name: data.name, mobile: data.mobile });
        }
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: async (updateData: { name: string; mobile: string }) => {
            const response = await axios.put(
                `${import.meta.env.VITE_APP_BASE_URL}student/me`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student-profile"] });
            CustomSnackBar.successSnackbar("Profile updated successfully!");
            setIsEditing(false);
            // Update cookie
            Cookies.set("name", formData.name, { path: "/" });
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to update profile");
        },
    });

    const passwordMutation = useMutation({
        mutationFn: async (pwdData: any) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}user/change-password`,
                pwdData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Password updated successfully!");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to update password");
        },
    });

    const handleSave = () => {
        if (!formData.name || formData.name.length < 3) {
            CustomSnackBar.errorSnackbar("Name must be at least 3 characters");
            return;
        }
        if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
            CustomSnackBar.errorSnackbar("Mobile must be exactly 10 digits");
            return;
        }
        updateMutation.mutate(formData);
    };

    const handleChangePassword = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            CustomSnackBar.errorSnackbar("Please fill all fields");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            CustomSnackBar.errorSnackbar("Passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            CustomSnackBar.errorSnackbar("Password must be at least 6 characters");
            return;
        }

        passwordMutation.mutate({
            email: data?.email,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
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
                <Alert severity="error">Failed to load profile. Please try again.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: "auto" }}>
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
                    My Profile
                </Typography>
                <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                    Manage your account information and security settings
                </Typography>
            </Box>

            {/* Profile Card */}
            <Card
                sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    overflow: "hidden",
                    mb: 3,
                }}
            >
                {/* Profile Header */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, var(--webprimary), #8b5cf6)",
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            fontSize: 32,
                            bgcolor: "rgba(255,255,255,0.2)",
                            border: "3px solid rgba(255,255,255,0.3)",
                            fontFamily: "SemiBold_W",
                        }}
                    >
                        {data?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: "SemiBold_W",
                                fontSize: "22px",
                                color: "#fff",
                            }}
                        >
                            {data?.name}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "Regular_W",
                                fontSize: "14px",
                                color: "rgba(255,255,255,0.8)",
                            }}
                        >
                            {data?.email}
                        </Typography>
                        <Box
                            sx={{
                                mt: 1,
                                px: 2,
                                py: 0.5,
                                display: "inline-block",
                                borderRadius: "20px",
                                backgroundColor:
                                    data?.status === "Active" || data?.status === "Self-Signed"
                                        ? "rgba(34, 197, 94, 0.2)"
                                        : "rgba(245, 158, 11, 0.2)",
                                border:
                                    data?.status === "Active" || data?.status === "Self-Signed"
                                        ? "1px solid rgba(34, 197, 94, 0.4)"
                                        : "1px solid rgba(245, 158, 11, 0.4)",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "Medium_W",
                                    fontSize: "12px",
                                    color: "#fff",
                                }}
                            >
                                {data?.status}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Profile Details */}
                <CardContent sx={{ p: 3 }}>
                    {isEditing ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                    "& .MuiInputLabel-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                }}
                            />
                            <TextField
                                label="Mobile Number"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                    "& .MuiInputLabel-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                }}
                            />
                            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    sx={{ ...primaryButtonStyle }}
                                >
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ name: data?.name || "", mobile: data?.mobile || "" });
                                    }}
                                    sx={{ ...outlinedButtonStyle }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            {/* Info Items */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "10px",
                                            bgcolor: "#eff6ff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MdPerson size={20} color="var(--webprimary)" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Full Name
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "15px", color: "var(--title)" }}>
                                            {data?.name}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "10px",
                                            bgcolor: "#f5f3ff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MdEmail size={20} color="#8b5cf6" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Email Address
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "15px", color: "var(--title)" }}>
                                            {data?.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "10px",
                                            bgcolor: "#f0fdf4",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MdPhone size={20} color="#22c55e" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Mobile Number
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "15px", color: "var(--title)" }}>
                                            {data?.mobile || "Not provided"}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "10px",
                                            bgcolor: "#fffbeb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MdCalendarToday size={20} color="#f59e0b" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Member Since
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "15px", color: "var(--title)" }}>
                                            {data?.createdAt
                                                ? new Date(data.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })
                                                : "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Button
                                variant="contained"
                                startIcon={<MdEdit />}
                                onClick={() => setIsEditing(true)}
                                sx={{ ...primaryButtonStyle }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card
                sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    overflow: "hidden",
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "#fef2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MdSecurity size={20} color="#ef4444" />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "var(--title)" }}>
                                Security Settings
                            </Typography>
                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px", color: "var(--greyText)" }}>
                                Update your password to keep your account secure
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Current Password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            fullWidth
                            size="small"
                            sx={{
                                "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                "& .MuiInputLabel-root": { fontFamily: "Regular_W", fontSize: "14px" },
                            }}
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            fullWidth
                            size="small"
                            helperText="Minimum 6 characters"
                            sx={{
                                "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                "& .MuiInputLabel-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                "& .MuiFormHelperText-root": { fontFamily: "Regular_W", fontSize: "11px" },
                            }}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            fullWidth
                            size="small"
                            sx={{
                                "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "14px" },
                                "& .MuiInputLabel-root": { fontFamily: "Regular_W", fontSize: "14px" },
                            }}
                        />
                        <Box sx={{ mt: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleChangePassword}
                                disabled={passwordMutation.isPending}
                                sx={{
                                    bgcolor: "#ef4444",
                                    fontFamily: "Medium_W",
                                    fontSize: "13px",
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    px: 4,
                                    "&:hover": { bgcolor: "#dc2626" },
                                }}
                            >
                                {passwordMutation.isPending ? "Updating..." : "Update Password"}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StudentProfile;
