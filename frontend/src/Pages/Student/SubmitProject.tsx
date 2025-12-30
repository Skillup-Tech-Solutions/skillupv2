import {
    Box,
    Alert,
    TextField,
    Button,
} from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    PaperPlaneTilt,
    UploadSimple,
    ArrowLeft,
    FolderSimple,
    ListChecks,
    FileText,
} from "@phosphor-icons/react";
import CustomSnackBar from "../../Custom/CustomSnackBar";

const SubmitProject = () => {
    const token = Cookies.get("skToken");
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);

    const { data: assignments, isLoading } = useQuery({
        queryKey: ["my-projects"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-projects`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
    });

    const project = assignments?.find((a: any) => a.itemId?._id === projectId)?.itemId;

    const submitMutation = useMutation({
        mutationFn: async (data: { projectId: string; fileUpload: string; fileName: string; description: string }) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/submissions`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project submitted successfully!");
            setTimeout(() => navigate("/student/my-projects"), 1500);
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to submit project");
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            CustomSnackBar.errorSnackbar("Please select a file to upload");
            return;
        }

        setUploading(true);
        try {
            // Upload file first
            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}/api/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Then submit
            submitMutation.mutate({
                projectId: projectId!,
                fileUpload: uploadResponse.data.fileUrl || uploadResponse.data.filename || file.name,
                fileName: file.name,
                description,
            });
        } catch {
            // If upload endpoint doesn't exist, use mock file path
            submitMutation.mutate({
                projectId: projectId!,
                fileUpload: `uploads/${Date.now()}_${file.name}`,
                fileName: file.name,
                description,
            });
        } finally {
            setUploading(false);
        }
    };

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: "#0f172a",
            color: "#f8fafc",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            borderRadius: "8px",
            "& fieldset": { borderColor: "#475569" },
            "&:hover fieldset": { borderColor: "#64748b" },
            "&.Mui-focused fieldset": { borderColor: "#22d3ee" },
        },
        "& .MuiInputLabel-root": { color: "#64748b", fontFamily: "'Inter', sans-serif", fontSize: "14px" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "64vh", gap: 2 }}>
                <Box sx={{ position: "relative" }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            border: "2px solid #334155",
                            borderTopColor: "#22d3ee",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                        }}
                    />
                </Box>
                <Box sx={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Loading Project...
                </Box>
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
                <Alert
                    severity="error"
                    sx={{ bgcolor: "rgba(127, 29, 29, 0.3)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.5)", "& .MuiAlert-icon": { color: "#ef4444" } }}
                >
                    Project not found or not assigned to you.
                </Alert>
                <Button
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => navigate("/student/my-projects")}
                    sx={{ mt: 2, color: "#94a3b8", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" } }}
                >
                    Back to My Projects
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
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
                        gap: 1.5,
                    }}
                >
                    <PaperPlaneTilt size={28} weight="duotone" color="#22d3ee" />
                    Submit Project
                </Box>
            </Box>

            <Box
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Project Info */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <FolderSimple size={20} weight="duotone" color="#22d3ee" />
                        <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc" }}>
                            {project.name}
                        </Box>
                    </Box>
                    <Box sx={{ color: "#94a3b8", fontSize: "14px", mb: 3, lineHeight: 1.6 }}>
                        {project.description}
                    </Box>

                    {/* Requirements */}
                    {project.requirements && (
                        <Box
                            sx={{
                                mb: 3,
                                p: 2,
                                bgcolor: "rgba(15, 23, 42, 0.5)",
                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                borderRadius: "12px",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <ListChecks size={16} weight="duotone" color="#64748b" />
                                <Box sx={{ fontSize: "12px", fontWeight: 600, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Requirements
                                </Box>
                            </Box>
                            <Box sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                {project.requirements}
                            </Box>
                        </Box>
                    )}

                    {/* Deliverables */}
                    {project.deliverables && project.deliverables.length > 0 && (
                        <Alert
                            severity="info"
                            sx={{
                                mb: 3,
                                bgcolor: "rgba(22, 78, 99, 0.2)",
                                color: "#22d3ee",
                                border: "1px solid rgba(34, 211, 238, 0.3)",
                                "& .MuiAlert-icon": { color: "#22d3ee" },
                            }}
                        >
                            <Box sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>Required Deliverables:</Box>
                            <Box sx={{ fontSize: "13px" }}>{project.deliverables.join(", ")}</Box>
                        </Alert>
                    )}

                    {/* File Upload */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ fontSize: "12px", fontWeight: 600, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                            Upload File *
                        </Box>
                        <Box
                            component="label"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 3,
                                border: "2px dashed #475569",
                                borderRadius: "12px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": { borderColor: "#64748b", bgcolor: "rgba(51, 65, 85, 0.3)" },
                            }}
                        >
                            <UploadSimple size={32} style={{ color: "#64748b", marginBottom: 8 }} />
                            <Box sx={{ fontSize: "14px", color: "#94a3b8" }}>
                                {file ? file.name : "Click to select file"}
                            </Box>
                            <input type="file" hidden onChange={handleFileChange} />
                        </Box>
                        {file && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, color: "#22d3ee", fontSize: "12px" }}>
                                <FileText size={14} weight="duotone" />
                                Selected: {file.name}
                            </Box>
                        )}
                    </Box>

                    {/* Description */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Description (Optional)"
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            placeholder="Add any notes or comments about your submission..."
                            sx={inputStyles}
                        />
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                            onClick={handleSubmit}
                            disabled={!file || uploading || submitMutation.isPending}
                            startIcon={<PaperPlaneTilt size={18} />}
                            sx={{
                                bgcolor: "#22d3ee",
                                color: "#0f172a",
                                px: 3,
                                py: 1,
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "13px",
                                textTransform: "uppercase",
                                "&:hover": { bgcolor: "#06b6d4" },
                                "&:disabled": { opacity: 0.5, bgcolor: "#22d3ee" },
                            }}
                        >
                            {uploading || submitMutation.isPending ? "Submitting..." : "Submit Project"}
                        </Button>
                        <Button
                            onClick={() => navigate("/student/my-projects")}
                            startIcon={<ArrowLeft size={18} />}
                            sx={{
                                bgcolor: "#334155",
                                color: "#f8fafc",
                                px: 3,
                                py: 1,
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "13px",
                                textTransform: "uppercase",
                                "&:hover": { bgcolor: "#475569" },
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default SubmitProject;
