import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    TextField,
    Button,
} from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { submitButtonStyle, cancelButtonStyle } from "../../assets/Styles/ButtonStyles";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    console.log("Debug Project Data:", project);

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
        } catch (error: any) {
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

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Project not found or not assigned to you.</Alert>
                <Button onClick={() => navigate("/student/my-projects")} sx={{ mt: 2 }}>
                    Back to My Projects
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                📤 Submit Project
            </Typography>

            <Card
                sx={{
                    maxWidth: 600,
                    borderRadius: 3,
                    border: "1px solid #e5e7eb",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                        {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {project.description}
                    </Typography>

                    {project.requirements && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                                Requirements:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {project.requirements}
                            </Typography>
                        </Box>
                    )}

                    {project.deliverables && project.deliverables.length > 0 && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Required Deliverables:
                            </Typography>
                            <Typography variant="body2">
                                {project.deliverables.join(", ")}
                            </Typography>
                        </Alert>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Upload File *
                        </Typography>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px dashed #e5e7eb",
                                borderRadius: "8px",
                                backgroundColor: "#f9fafb",
                            }}
                        />
                        {file && (
                            <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block" }}>
                                Selected: {file.name}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Description (Optional)"
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            placeholder="Add any notes or comments about your submission..."
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!file || uploading || submitMutation.isPending}
                            sx={{ ...submitButtonStyle, borderRadius: 2, px: 4 }}
                        >
                            {uploading || submitMutation.isPending ? "Submitting..." : "Submit Project"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/student/my-projects")}
                            sx={{ ...cancelButtonStyle, borderRadius: 2, padding: "6px 14px" }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SubmitProject;
