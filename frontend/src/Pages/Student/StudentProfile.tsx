import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import { submitButtonStyle, cancelButtonStyle } from "../../assets/Styles/ButtonStyles";

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

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                👤 My Profile
            </Typography>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">Failed to load profile.</Alert>
            ) : (
                <Card
                    sx={{
                        maxWidth: 600,
                        borderRadius: 3,
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    fontSize: 32,
                                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                }}
                            >
                                {data?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ ml: 3 }}>
                                <Typography variant="h5" fontWeight="600">
                                    {data?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {data?.email}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        mt: 1,
                                        display: "inline-block",
                                        borderRadius: 2,
                                        backgroundColor: data?.status === "Active" || data?.status === "Self-Signed" ? "#dcfce7" : "#fef3c7",
                                        color: data?.status === "Active" || data?.status === "Self-Signed" ? "#166534" : "#92400e",
                                    }}
                                >
                                    {data?.status}
                                </Typography>
                            </Box>
                        </Box>

                        {isEditing ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <TextField
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Mobile Number"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending}
                                        sx={{ ...submitButtonStyle, borderRadius: 2 }}
                                    >
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: data?.name || "", mobile: data?.mobile || "" });
                                        }}
                                        sx={{ ...cancelButtonStyle, borderRadius: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1">{data?.name}</Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1">{data?.email}</Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Mobile Number
                                    </Typography>
                                    <Typography variant="body1">{data?.mobile}</Typography>
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Member Since
                                    </Typography>
                                    <Typography variant="body1">
                                        {data?.createdAt
                                            ? new Date(data.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "N/A"}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={() => setIsEditing(true)}
                                    sx={{ ...submitButtonStyle, borderRadius: 2 }}
                                >
                                    Edit Profile
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default StudentProfile;
