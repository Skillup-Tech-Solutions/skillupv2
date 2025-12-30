import { useState, useEffect } from "react";
import { Box, TextField, Button, Alert } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import {
    User,
    Envelope,
    Phone,
    CalendarBlank,
    Lock,
    PencilSimple,
    CheckCircle,
    Sparkle,
    IdentificationBadge,
    SignOut,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        try {
            const accessToken = Cookies.get("skToken");
            const refreshToken = Cookies.get("skRefreshToken");

            if (accessToken) {
                await fetch(`${import.meta.env.VITE_APP_BASE_URL}logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ refreshToken })
                }).catch(() => { });
            }
        } finally {
            Cookies.remove("name");
            Cookies.remove("role");
            Cookies.remove("skToken");
            Cookies.remove("skRefreshToken");
            Cookies.remove("email");
            navigate("/");
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "64vh",
                    gap: 2,
                }}
            >
                <Box sx={{ position: "relative" }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            border: "2px solid #334155",
                            borderTopColor: "#3b82f6",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                            },
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        color: "#64748b",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}
                >
                    Loading Profile...
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    sx={{
                        bgcolor: "rgba(127, 29, 29, 0.3)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.5)",
                        "& .MuiAlert-icon": { color: "#f87171" },
                    }}
                >
                    Failed to load profile. Please try again.
                </Alert>
            </Box>
        );
    }

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: "#0f172a",
            color: "#f8fafc",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            borderRadius: "6px",
            "& fieldset": { borderColor: "#475569" },
            "&:hover fieldset": { borderColor: "#64748b" },
            "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
        },
        "& .MuiInputLabel-root": {
            color: "#64748b",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
        "& .MuiFormHelperText-root": { color: "#64748b", fontFamily: "'Inter', sans-serif" },
    };

    return (
        <Box sx={{ maxWidth: 700, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    component="h1"
                    sx={{
                        fontSize: { xs: "20px", md: "24px" },
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#f8fafc",
                        m: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, md: 1.5 },
                    }}
                >
                    <User size={28} weight="duotone" color="#60a5fa" />
                    My Profile
                </Box>
                <Box
                    component="p"
                    sx={{
                        color: "#64748b",
                        mt: 1,
                        fontSize: "14px",
                    }}
                >
                    Manage your account and identity verification
                </Box>
            </Box>

            {/* Profile Photo Section */}
            <Box
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "12px",
                    p: 3,
                    mb: 3,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Sparkle
                    size={100}
                    weight="duotone"
                    style={{
                        position: "absolute",
                        right: -16,
                        top: -16,
                        color: "rgba(71, 85, 105, 0.2)",
                    }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 3, position: "relative", zIndex: 10 }}>
                    {/* Avatar */}
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "6px",
                            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "32px",
                            fontWeight: 700,
                            fontFamily: "'Chivo', sans-serif",
                            flexShrink: 0,
                        }}
                    >
                        {data?.name?.charAt(0).toUpperCase()}
                    </Box>

                    {/* Name & Status */}
                    <Box>
                        <Box
                            component="h2"
                            sx={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "#f8fafc",
                                m: 0,
                                mb: 0.5,
                            }}
                        >
                            {data?.name}
                        </Box>
                        <Box
                            component="p"
                            sx={{
                                color: "#94a3b8",
                                fontSize: "14px",
                                m: 0,
                                mb: 1,
                            }}
                        >
                            {data?.email}
                        </Box>
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                ...(data?.status === "Active" || data?.status === "Self-Signed"
                                    ? {
                                        bgcolor: "rgba(22, 101, 52, 0.3)",
                                        color: "#4ade80",
                                        border: "1px solid rgba(34, 197, 94, 0.5)",
                                    }
                                    : {
                                        bgcolor: "rgba(120, 53, 15, 0.3)",
                                        color: "#fbbf24",
                                        border: "1px solid rgba(245, 158, 11, 0.5)",
                                    }),
                            }}
                        >
                            {data?.status === "Active" || data?.status === "Self-Signed" ? (
                                <CheckCircle size={14} weight="fill" />
                            ) : null}
                            {data?.status}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Account Info Section */}
            <Box
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "6px",
                    p: { xs: 2, md: 3 },
                    mb: 3,
                }}
            >
                <Box
                    component="h2"
                    sx={{
                        fontSize: "16px",
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#f8fafc",
                        m: 0,
                        mb: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <IdentificationBadge size={20} weight="duotone" color="#a855f7" />
                    Account Information
                </Box>

                {isEditing ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            sx={inputStyles}
                        />
                        <TextField
                            label="Mobile Number"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            fullWidth
                            sx={inputStyles}
                        />
                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                            <Button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                sx={{
                                    bgcolor: "#3b82f6",
                                    color: "#fff",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    "&:hover": { bgcolor: "#2563eb" },
                                    "&:disabled": { opacity: 0.5 },
                                }}
                            >
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ name: data?.name || "", mobile: data?.mobile || "" });
                                }}
                                sx={{
                                    bgcolor: "#334155",
                                    color: "#f8fafc",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    "&:hover": { bgcolor: "#475569" },
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 2,
                            }}
                        >
                            {/* Full Name */}
                            <Box
                                sx={{
                                    bgcolor: "rgba(15, 23, 42, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.4)",
                                    borderRadius: "6px",
                                    p: 2,
                                }}
                            >
                                <Box
                                    component="label"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: "10px",
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        mb: 0.5,
                                    }}
                                >
                                    <User size={12} /> Full Name
                                </Box>
                                <Box sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                    {data?.name}
                                </Box>
                            </Box>

                            {/* Email */}
                            <Box
                                sx={{
                                    bgcolor: "rgba(15, 23, 42, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.4)",
                                    borderRadius: "12px",
                                    p: 2,
                                }}
                            >
                                <Box
                                    component="label"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: "10px",
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        mb: 0.5,
                                    }}
                                >
                                    <Envelope size={12} /> Email
                                </Box>
                                <Box sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "14px", wordBreak: "break-all" }}>
                                    {data?.email}
                                </Box>
                            </Box>

                            {/* Mobile */}
                            <Box
                                sx={{
                                    bgcolor: "rgba(15, 23, 42, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.4)",
                                    borderRadius: "12px",
                                    p: 2,
                                }}
                            >
                                <Box
                                    component="label"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: "10px",
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        mb: 0.5,
                                    }}
                                >
                                    <Phone size={12} /> Mobile
                                </Box>
                                <Box sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                    {data?.mobile || "Not provided"}
                                </Box>
                            </Box>

                            {/* Member Since */}
                            <Box
                                sx={{
                                    bgcolor: "rgba(15, 23, 42, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.4)",
                                    borderRadius: "12px",
                                    p: 2,
                                }}
                            >
                                <Box
                                    component="label"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: "10px",
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        mb: 0.5,
                                    }}
                                >
                                    <CalendarBlank size={12} /> Member Since
                                </Box>
                                <Box sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "14px" }}>
                                    {data?.createdAt
                                        ? new Date(data.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "N/A"}
                                </Box>
                            </Box>
                        </Box>

                        <Button
                            onClick={() => setIsEditing(true)}
                            startIcon={<PencilSimple size={16} />}
                            sx={{
                                mt: 3,
                                bgcolor: "#3b82f6",
                                color: "#fff",
                                px: 3,
                                py: 1,
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                "&:hover": { bgcolor: "#2563eb" },
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Security Section */}
            <Box
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "6px",
                    p: { xs: 2, md: 3 },
                    mb: 3,
                }}
            >
                <Box
                    component="h2"
                    sx={{
                        fontSize: "16px",
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#f8fafc",
                        m: 0,
                        mb: 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Lock size={20} weight="duotone" color="#ef4444" />
                    Security Settings
                </Box>
                <Box
                    component="p"
                    sx={{
                        color: "#64748b",
                        fontSize: "13px",
                        m: 0,
                        mb: 3,
                    }}
                >
                    Update your password to keep your account secure
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        fullWidth
                        sx={inputStyles}
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        fullWidth
                        helperText="Minimum 6 characters"
                        sx={inputStyles}
                    />
                    <TextField
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        fullWidth
                        sx={inputStyles}
                    />
                    <Box sx={{ mt: 1 }}>
                        <Button
                            onClick={handleChangePassword}
                            disabled={passwordMutation.isPending}
                            sx={{
                                bgcolor: "#ef4444",
                                color: "#fff",
                                px: 3,
                                py: 1,
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                "&:hover": { bgcolor: "#dc2626" },
                                "&:disabled": { opacity: 0.5 },
                            }}
                        >
                            {passwordMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Logout Section for Mobile/Easier Access */}
            <Box
                sx={{
                    mt: 3,
                    bgcolor: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ color: "#f87171", fontWeight: 600, fontSize: "16px", mb: 0.5 }}>
                        Ready to leave?
                    </Box>
                    <Box sx={{ color: "#94a3b8", fontSize: "13px" }}>
                        Sign out of your account securely
                    </Box>
                </Box>
                <Button
                    onClick={handleLogout}
                    variant="outlined"
                    startIcon={<SignOut size={18} />}
                    sx={{
                        color: "#f87171",
                        borderColor: "rgba(239, 68, 68, 0.4)",
                        px: 4,
                        py: 1,
                        borderRadius: "8px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        "&:hover": {
                            bgcolor: "rgba(239, 68, 68, 0.1)",
                            borderColor: "#ef4444",
                        }
                    }}
                >
                    Sign Out
                </Button>
            </Box>
        </Box>
    );
};

export default StudentProfile;
