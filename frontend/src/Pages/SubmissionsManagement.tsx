import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    MenuItem,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle } from "../assets/Styles/ButtonStyles";

const SubmissionsManagement = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [reviewData, setReviewData] = useState({
        status: "submitted",
        feedback: "",
        grade: "",
    });

    const { data, isLoading } = useQuery({
        queryKey: ["submissions"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/submissions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await axios.put(
                `${import.meta.env.VITE_APP_BASE_URL}admin/submissions/${id}/review`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Submission reviewed!");
            queryClient.invalidateQueries({ queryKey: ["submissions"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to review");
        },
    });

    const handleOpenReview = (submission: any) => {
        setSelectedSubmission(submission);
        setReviewData({
            status: submission.status,
            feedback: submission.feedback || "",
            grade: submission.grade || "",
        });
        setReviewModalOpen(true);
    };

    const handleClose = () => {
        setReviewModalOpen(false);
        setSelectedSubmission(null);
        setReviewData({ status: "submitted", feedback: "", grade: "" });
    };

    const handleReviewSubmit = () => {
        if (!reviewData.status) {
            CustomSnackBar.errorSnackbar("Status is required");
            return;
        }
        reviewMutation.mutate({
            id: selectedSubmission._id,
            data: reviewData,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "success";
            case "rejected": return "error";
            case "needs-revision": return "warning";
            case "under-review": return "info";
            default: return "default";
        }
    };

    const columns: GridColDef[] = [
        {
            field: "student",
            headerName: "Student",
            width: 150,
            valueGetter: (_value, row) => row.student?.name || "N/A",
        },
        {
            field: "project",
            headerName: "Project",
            width: 180,
            valueGetter: (_value, row) => row.project?.name || "N/A",
        },
        {
            field: "submittedAt",
            headerName: "Submitted",
            width: 150,
            valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
        },
        {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={getStatusColor(params.value)}
                    sx={{ textTransform: "capitalize" }}
                />
            ),
        },
        { field: "grade", headerName: "Grade", width: 100 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenReview(params.row)}
                    sx={{ ...cancelButtonStyle, padding: "6px 12px", fontSize: "12px" }}
                >
                    Review
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                📝 Project Submissions
            </Typography>

            <DataGrid
                rows={data || []}
                columns={columns}
                loading={isLoading}
                getRowId={(row) => row._id}
                pageSizeOptions={[10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                autoHeight
                sx={{ borderRadius: 2 }}
            />

            <Dialog open={reviewModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Review Submission</DialogTitle>
                <DialogContent>
                    {selectedSubmission && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                            <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                                <Typography variant="subtitle2">Student:</Typography>
                                <Typography>{selectedSubmission.student?.name} ({selectedSubmission.student?.email})</Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>Project:</Typography>
                                <Typography>{selectedSubmission.project?.name}</Typography>
                                {selectedSubmission.description && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Notes:</Typography>
                                        <Typography>{selectedSubmission.description}</Typography>
                                    </>
                                )}
                            </Box>
                            <TextField
                                select
                                label="Status"
                                value={reviewData.status}
                                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="submitted">Submitted</MenuItem>
                                <MenuItem value="under-review">Under Review</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                                <MenuItem value="needs-revision">Needs Revision</MenuItem>
                            </TextField>
                            <TextField
                                label="Grade (Optional)"
                                value={reviewData.grade}
                                onChange={(e) => setReviewData({ ...reviewData, grade: e.target.value })}
                                fullWidth
                                placeholder="e.g., A, B+, 85%"
                            />
                            <TextField
                                label="Feedback"
                                value={reviewData.feedback}
                                onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Provide feedback for the student..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        disabled={reviewMutation.isPending}
                        sx={{ ...submitButtonStyle }}
                    >
                        Submit Review
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SubmissionsManagement;
