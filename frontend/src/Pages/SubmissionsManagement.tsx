import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Button,
    Typography,
    Dialog,
    IconButton,
    Chip,
    MenuItem,
    TextField,
    Tooltip,
} from "@mui/material";
import { ListChecks, CheckCircle, X, Clock, ChatText, GraduationCap, User, Book, MagnifyingGlass } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";

const dialogStyle = {
    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
};

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "6px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
};

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
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/submissions`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data || [];
        },
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await axios.put(`${import.meta.env.VITE_APP_BASE_URL}admin/submissions/${id}/review`, data, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Submission reviewed!");
            queryClient.invalidateQueries({ queryKey: ["submissions"] });
            setReviewModalOpen(false);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to review"),
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

    const getStatusChip = (status: string) => {
        const styles: any = {
            approved: { bgcolor: "rgba(34, 197, 94, 0.1)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.2)" },
            rejected: { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" },
            "needs-revision": { bgcolor: "rgba(234, 179, 8, 0.1)", color: "#fbbf24", border: "1px solid rgba(234, 179, 8, 0.2)" },
            "under-review": { bgcolor: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.2)" },
            submitted: { bgcolor: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)" },
        };
        return <Chip label={status.replace("-", " ")} size="small" sx={{ ...styles[status] || styles.submitted, textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }} />;
    };

    const columns: GridColDef[] = [
        { field: "student", headerName: "Student", flex: 1, renderCell: (p) => <Box><Typography sx={{ fontWeight: 600, color: "#f8fafc", fontSize: "13px" }}>{p.row.student?.name || "N/A"}</Typography><Typography variant="caption" sx={{ color: "#64748b" }}>{p.row.student?.email || "N/A"}</Typography></Box> },
        { field: "project", headerName: "Project", flex: 1, renderCell: (p) => <Typography sx={{ color: "#f1f5f9", fontSize: "13px" }}>{p.row.project?.name || "N/A"}</Typography> },
        { field: "submittedAt", headerName: "Submitted", width: 140, renderCell: (p) => <Typography variant="caption" sx={{ color: "#94a3b8" }}>{new Date(p.value).toLocaleDateString()}</Typography> },
        { field: "status", headerName: "Status", width: 140, renderCell: (p) => getStatusChip(p.value) },
        { field: "grade", headerName: "Grade", width: 100, renderCell: (p) => <Typography sx={{ color: "#3b82f6", fontWeight: 700 }}>{p.value || "-"}</Typography> },
        {
            field: "actions", headerName: "Actions", width: 100, sortable: false,
            renderCell: (p) => (
                <Button variant="outlined" size="small" onClick={() => handleOpenReview(p.row)} sx={{ color: "#3b82f6", borderColor: "rgba(59, 130, 246, 0.3)", textTransform: "none", fontSize: "11px", borderRadius: "4px", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>Review</Button>
            )
        },
    ];

    return (
        <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ListChecks size={28} weight="duotone" style={{ color: "#3b82f6" }} />
                <Typography sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase" }}>Project Submissions</Typography>
            </Box>

            <DataGrid rows={data || []} columns={columns} loading={isLoading} getRowId={(r) => r._id} className="table_border" autoHeight sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "6px" }} />

            <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px", fontFamily: "'Chivo', sans-serif" }}>Review Submission</Typography>
                    <IconButton onClick={() => setReviewModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                    {selectedSubmission && (
                        <Box sx={{ p: 2, bgcolor: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(71, 85, 105, 0.3)", borderRadius: "6px" }}>
                            <Box sx={{ display: "flex", gap: 3, mb: 1.5 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Student</Typography>
                                    <Typography sx={{ color: "#f1f5f9", fontWeight: 600 }}>{selectedSubmission.student?.name}</Typography>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Project</Typography>
                                    <Typography sx={{ color: "#f1f5f9", fontWeight: 600 }}>{selectedSubmission.project?.name}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 1.5, borderColor: "rgba(71, 85, 105, 0.2)" }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Description / Links</Typography>
                                <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>{selectedSubmission.description || "No notes provided."}</Typography>
                            </Box>
                        </Box>
                    )}

                    <TextField select label="Review Status" value={reviewData.status} onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })} fullWidth sx={textFieldDarkStyles}>
                        <MenuItem value="submitted">Submitted</MenuItem>
                        <MenuItem value="under-review">Under Review</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="needs-revision">Needs Revision</MenuItem>
                    </TextField>

                    <TextField label="Grade / Score" value={reviewData.grade} onChange={(e) => setReviewData({ ...reviewData, grade: e.target.value })} fullWidth placeholder="e.g., A+, 95/100" sx={textFieldDarkStyles} />

                    <TextField label="Feedback for Student" value={reviewData.feedback} onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })} fullWidth multiline rows={4} sx={textFieldDarkStyles} />
                </Box>
                <Box sx={{ p: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setReviewModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" onClick={() => reviewMutation.mutate({ id: selectedSubmission._id, data: reviewData })} disabled={reviewMutation.isPending} sx={{ bgcolor: "#3b82f6", color: "#fff", px: 4, "&:hover": { bgcolor: "#2563eb" } }}>{reviewMutation.isPending ? "Submitting..." : "Complete Review"}</Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default SubmissionsManagement;
