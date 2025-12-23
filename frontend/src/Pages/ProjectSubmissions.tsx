import { useState } from "react";
import {
    Box,
    Typography,
    Chip,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    MdVisibility,
    MdUpload,
    MdPayment,
    MdPerson,
    MdCloudUpload,
    MdPlayArrow,
    MdCheckCircle,
    MdAttachMoney,
    MdDownload
} from "react-icons/md";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { smallPrimaryButton, dangerButtonStyle, cancelButtonStyle, textLinkStyle } from "../assets/Styles/ButtonStyles";

const statusOptions = [
    { value: "assigned", label: "Assigned" },
    { value: "requirement-submitted", label: "Req Submitted" },
    { value: "advance-payment-pending", label: "Adv. Payment Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "ready-for-demo", label: "Ready for Demo" },
    { value: "final-payment-pending", label: "Final Payment Pending" },
    { value: "ready-for-download", label: "Ready for Download" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
];

const projectTypeOptions = [
    { value: "website", label: "Website Development" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "report", label: "Project Report" },
    { value: "ppt", label: "Presentation (PPT)" },
    { value: "research", label: "Research Paper" },
    { value: "code", label: "Coding Project" },
    { value: "design", label: "Design Work" },
    { value: "other", label: "Other" },
];

const ProjectSubmissions = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // Modals state
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [requirementModal, setRequirementModal] = useState(false);
    const [advancePaymentModal, setAdvancePaymentModal] = useState(false);
    const [finalPaymentModal, setFinalPaymentModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [viewRequirementModal, setViewRequirementModal] = useState(false);

    // Forms state
    const [requirementForm, setRequirementForm] = useState({ projectType: "other", collegeGuidelines: "", notes: "" });
    const [paymentForm, setPaymentForm] = useState({ amount: 0, notes: "" });
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);
    const [reportForm, setReportForm] = useState({ format: "excel", status: "all" });
    const [viewFilesModal, setViewFilesModal] = useState(false);

    // Fetch assignments
    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["project-requirements"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data || [];
        },
    });

    // --- MUTATIONS ---

    // Resend Email Mutation
    const resendEmailMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/resend-email`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Email resent successfully!");
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to resend email");
        },
    });

    // 1. Trigger Email
    const triggerEmailMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/trigger-email`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assignment email sent manually!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to send email"),
    });

    // 2. Submit Requirement (Admin)
    const submitRequirementMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/submit-requirement`,
                requirementForm, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Requirement submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
            setRequirementModal(false);
            setRequirementForm({ projectType: "other", collegeGuidelines: "", notes: "" });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to submit requirement"),
    });

    // 3. Request Advance
    const requestAdvancePaymentMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/request-advance`,
                paymentForm, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Advance payment requested!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
            setAdvancePaymentModal(false);
            setPaymentForm({ amount: 0, notes: "" });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to request advance"),
    });

    // 4. Start Work (In Progress)
    const markInProgressMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/start-work`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project marked as In Progress!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to mark in progress"),
    });

    // 5. Ready for Demo
    const markReadyForDemoMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/ready-for-demo`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project marked Ready for Demo!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to mark ready for demo"),
    });

    // 6. Request Final Payment
    const requestFinalPaymentMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/request-final`,
                paymentForm, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Final payment requested!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
            setFinalPaymentModal(false);
            setPaymentForm({ amount: 0, notes: "" });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to request final payment"),
    });

    // 7. Upload & Ready (Uses legacy upload but maps state correctly)
    const markReadyForDownloadMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const formData = new FormData();
            uploadFiles.forEach((file) => formData.append("files", file));
            formData.append("fileTypes", JSON.stringify(fileTypes));
            // This endpoint sets status to ready-for-download and sends email
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/upload-files`,
                formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded & marked Ready for Download!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
            setUploadModal(false);
            setUploadFiles([]);
            setFileTypes([]);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload/mark ready"),
    });

    // 8. Mark Delivered
    const markDeliveredMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${assignmentId}/delivered`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project marked as Delivered!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to mark delivered"),
    });

    // --- HANDLERS ---
    const handleGenerateReport = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/report`, {
                params: { format: reportForm.format, status: reportForm.status },
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `project_report_${reportForm.status}_${Date.now()}.${reportForm.format === "excel" ? "xlsx" : "pdf"}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setReportModal(false);
            CustomSnackBar.successSnackbar("Report generated successfully!");
        } catch (err) {
            CustomSnackBar.errorSnackbar("Failed to generate report");
        }
    };

    const handleOpenRequirement = (assignment: any) => { setSelectedAssignment(assignment); setRequirementModal(true); };
    const handleOpenAdvance = (assignment: any) => { setSelectedAssignment(assignment); setAdvancePaymentModal(true); };
    const handleOpenFinal = (assignment: any) => { setSelectedAssignment(assignment); setFinalPaymentModal(true); };
    const handleOpenUpload = (assignment: any) => { setSelectedAssignment(assignment); setUploadModal(true); };
    const handleOpenViewFiles = (assignment: any) => { setSelectedAssignment(assignment); setViewFilesModal(true); };
    const handleOpenViewRequirement = (assignment: any) => { setSelectedAssignment(assignment); setViewRequirementModal(true); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadFiles([...uploadFiles, ...newFiles]);
            setFileTypes([...fileTypes, ...newFiles.map(() => "project-file")]);
        }
    };

    const handleFileTypeChange = (index: number, type: string) => {
        const newTypes = [...fileTypes];
        newTypes[index] = type;
        setFileTypes(newTypes);
    };

    const getStatusLabel = (status: string) => {
        return statusOptions.find((opt) => opt.value === status)?.label || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "assigned": return "default";
            case "requirement-submitted": return "info";
            case "advance-payment-pending": return "warning";
            case "in-progress": return "primary";
            case "ready-for-demo": return "secondary";
            case "final-payment-pending": return "warning";
            case "ready-for-download": return "success";
            case "delivered": case "completed": return "success";
            default: return "default";
        }
    };

    // Filter assignments
    const filteredAssignments = assignments?.filter((item: any) => {
        if (tabValue === 0) return true; // All
        if (tabValue === 1) return !["delivered", "completed"].includes(item.status); // Active
        if (tabValue === 2) return ["delivered", "completed"].includes(item.status); // Completed
        return true;
    });

    if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Failed to load assignments</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Project Submissions Management</Typography>
                <Button variant="contained" startIcon={<MdDownload />} onClick={() => setReportModal(true)}>
                    Generate Report
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
                    <Tab label="All Projects" />
                    <Tab label="Active" />
                    <Tab label="Delivered / Completed" />
                </Tabs>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                        <TableRow>
                            <TableCell><strong>Student</strong></TableCell>
                            <TableCell><strong>Project</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Payment</strong></TableCell>
                            <TableCell><strong>Assigned Details</strong></TableCell>
                            <TableCell align="center"><strong>Current Step Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAssignments?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No projects found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredAssignments?.map((item: any) => (
                                <TableRow key={item._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <MdPerson color="#64748b" />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">{item.student?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.student?.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="600">{item.itemId?.title || item.itemId?.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={getStatusLabel(item.status)} color={getStatusColor(item.status) as any} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <MdPayment color={item.payment?.status === "paid" ? "#10b981" : "#f59e0b"} />
                                                <Typography variant="body2" fontWeight="600">
                                                    {item.payment?.amount ? `₹${item.payment.amount}` : "N/A"}
                                                </Typography>
                                            </Box>
                                            {item.payment?.advanceAmount > 0 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Adv: ₹{item.payment.advanceAmount}
                                                </Typography>
                                            )}
                                            {item.payment?.finalAmount > 0 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Final: ₹{item.payment.finalAmount}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" sx={{ display: "block", color: item.payment?.status === "paid" ? "success.main" : "warning.main" }}>
                                                {item.payment?.status?.toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" display="block">
                                            <strong>By:</strong> {item.assignedBy?.name || "System"}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            <strong>Mentor:</strong> {item.itemId?.mentor || "N/A"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(item.assignedAt).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* Action Flow Buttons */}
                                        {item.status === "assigned" && (
                                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: "center" }}>
                                                <Button size="small" variant="contained" onClick={() => triggerEmailMutation.mutate(item._id)} disabled={triggerEmailMutation.isPending} sx={{ ...dangerButtonStyle }}>
                                                    Send Assignment Email
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Email
                                                </Button>
                                                <Button size="small" variant="outlined" onClick={() => handleOpenRequirement(item)} sx={{ ...cancelButtonStyle, padding: "6px 12px", fontSize: "11px" }}>
                                                    Fill Requirements (Admin)
                                                </Button>
                                            </Box>
                                        )}
                                        {item.status === "requirement-submitted" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Button size="small" variant="contained" onClick={() => handleOpenAdvance(item)} startIcon={<MdAttachMoney />} sx={{ ...smallPrimaryButton }}>
                                                    Request Advance
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Requirement Email
                                                </Button>
                                                <Button size="small" variant="outlined" onClick={() => handleOpenViewRequirement(item)} startIcon={<MdVisibility />} sx={{ ...smallPrimaryButton, bgcolor: "transparent", color: "var(--webprimary)" }}>
                                                    View Requirements
                                                </Button>
                                            </Box>
                                        )}
                                        {item.status === "advance-payment-pending" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Button size="small" variant="contained" onClick={() => markInProgressMutation.mutate(item._id)} startIcon={<MdPlayArrow />} sx={{ ...smallPrimaryButton }}>
                                                    Confirm & Start Work
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Payment Email
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => handleOpenViewRequirement(item)} sx={{ ...textLinkStyle }}>
                                                    View Requirements
                                                </Button>
                                            </Box>
                                        )}
                                        {item.status === "in-progress" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Button size="small" variant="contained" onClick={() => markReadyForDemoMutation.mutate(item._id)} startIcon={<MdVisibility />} sx={{ ...smallPrimaryButton }}>
                                                    Ready for Demo
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Progress Email
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => handleOpenViewRequirement(item)} sx={{ ...textLinkStyle }}>
                                                    View Requirements
                                                </Button>
                                            </Box>
                                        )}
                                        {item.status === "ready-for-demo" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Button size="small" variant="contained" onClick={() => handleOpenFinal(item)} startIcon={<MdAttachMoney />} sx={{ ...smallPrimaryButton }}>
                                                    Request Final Payment
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Demo Email
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => handleOpenViewRequirement(item)} sx={{ ...textLinkStyle }}>
                                                    View Requirements
                                                </Button>
                                            </Box>
                                        )}
                                        {item.status === "final-payment-pending" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Button size="small" variant="contained" onClick={() => handleOpenUpload(item)} startIcon={<MdCloudUpload />} sx={{ ...smallPrimaryButton }}>
                                                    Confirm & Upload Files
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Payment Email
                                                </Button>
                                                <Button size="small" variant="text" onClick={() => handleOpenViewRequirement(item)} sx={{ ...textLinkStyle }}>
                                                    View Requirements
                                                </Button>
                                            </Box>
                                        )}
                                        {item.status === "ready-for-download" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Button size="small" variant="outlined" color="success" onClick={() => markDeliveredMutation.mutate(item._id)} startIcon={<MdCheckCircle />} sx={{ ...cancelButtonStyle, padding: "6px 12px", fontSize: "11px" }}>
                                                    Mark Delivered
                                                </Button>
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Button size="small" variant="text" onClick={() => handleOpenViewFiles(item)} startIcon={<MdVisibility />} sx={{ ...textLinkStyle }}>
                                                        View Files
                                                    </Button>
                                                    <Button size="small" variant="text" onClick={() => handleOpenUpload(item)} startIcon={<MdUpload />} sx={{ ...textLinkStyle }}>
                                                        Add Files
                                                    </Button>
                                                </Box>
                                                <Button size="small" variant="text" onClick={() => resendEmailMutation.mutate(item._id)} disabled={resendEmailMutation.isPending} sx={{ ...textLinkStyle }}>
                                                    Resend Ready Email
                                                </Button>
                                                <Typography variant="caption" color="success.main">Waiting for Student Download...</Typography>
                                            </Box>
                                        )}
                                        {item.status === "delivered" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Chip label="Delivered" color="success" size="small" icon={<MdCheckCircle />} />
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Button size="small" variant="text" onClick={() => handleOpenViewFiles(item)} startIcon={<MdVisibility />} sx={{ ...textLinkStyle }}>
                                                        View Files
                                                    </Button>
                                                    <Button size="small" variant="text" onClick={() => handleOpenUpload(item)} startIcon={<MdUpload />} sx={{ ...textLinkStyle }}>
                                                        Add More
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                        {item.status === "completed" && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: "center" }}>
                                                <Chip label="Completed" color="success" size="small" icon={<MdCheckCircle />} />
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Button size="small" variant="text" onClick={() => handleOpenViewFiles(item)} startIcon={<MdVisibility />} sx={{ ...textLinkStyle }}>
                                                        View Files
                                                    </Button>
                                                    <Button size="small" variant="text" onClick={() => handleOpenUpload(item)} startIcon={<MdUpload />} sx={{ ...textLinkStyle }}>
                                                        Add More
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>



            {/* View Requirement Modal */}
            <Dialog open={viewRequirementModal} onClose={() => setViewRequirementModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Student Requirements</DialogTitle>
                <DialogContent>
                    {selectedAssignment?.requirementSubmission ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>Project Topic</Typography>
                                <Typography variant="body1" fontWeight="600">{selectedAssignment.requirementSubmission.topic}</Typography>
                            </Paper>

                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Chip label={selectedAssignment.requirementSubmission.projectType} size="small" sx={{ ml: 1 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Submitted At</Typography>
                                    <Typography variant="body2">{new Date(selectedAssignment.requirementSubmission.submittedAt).toLocaleDateString()}</Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">College Guidelines</Typography>
                                <Typography variant="body2" sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: 1 }}>
                                    {selectedAssignment.requirementSubmission.collegeGuidelines || "None provided"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Additional Notes</Typography>
                                <Typography variant="body2" sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: 1 }}>
                                    {selectedAssignment.requirementSubmission.notes || "None"}
                                </Typography>
                            </Box>

                            {selectedAssignment.requirementSubmission.attachments?.length > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>Attached Files</Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {selectedAssignment.requirementSubmission.attachments.map((file: any, idx: number) => (
                                            <Button
                                                key={idx}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<MdDownload />}
                                                href={file.filePath.startsWith("http") ? file.filePath : `${import.meta.env.VITE_APP_BASE_URL}/${file.filePath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {file.fileName}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Alert severity="warning">No requirements submitted yet.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewRequirementModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Requirement Modal */}
            <Dialog open={requirementModal} onClose={() => setRequirementModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Admin Submit Requirements</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField select label="Project Type" value={requirementForm.projectType} onChange={(e) => setRequirementForm({ ...requirementForm, projectType: e.target.value })} fullWidth size="small">
                            {projectTypeOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Guidelines" value={requirementForm.collegeGuidelines} onChange={(e) => setRequirementForm({ ...requirementForm, collegeGuidelines: e.target.value })} fullWidth multiline rows={2} size="small" />
                        <TextField label="Notes" value={requirementForm.notes} onChange={(e) => setRequirementForm({ ...requirementForm, notes: e.target.value })} fullWidth multiline rows={2} size="small" />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRequirementModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => submitRequirementMutation.mutate(selectedAssignment?._id)} disabled={submitRequirementMutation.isPending}>Submit</Button>
                </DialogActions>
            </Dialog>

            {/* Advance Payment Modal */}
            <Dialog open={advancePaymentModal} onClose={() => setAdvancePaymentModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Request Advance Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField label="Amount (₹)" type="number" fullWidth value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} />
                        <TextField label="Notes" fullWidth multiline rows={2} sx={{ mt: 2 }} value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAdvancePaymentModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => requestAdvancePaymentMutation.mutate(selectedAssignment?._id)} disabled={requestAdvancePaymentMutation.isPending}>Request</Button>
                </DialogActions>
            </Dialog>

            {/* Final Payment Modal */}
            <Dialog open={finalPaymentModal} onClose={() => setFinalPaymentModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Request Final Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField label="Amount (₹)" type="number" fullWidth value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} />
                        <TextField label="Notes" fullWidth multiline rows={2} sx={{ mt: 2 }} value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFinalPaymentModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => requestFinalPaymentMutation.mutate(selectedAssignment?._id)} disabled={requestFinalPaymentMutation.isPending}>Request</Button>
                </DialogActions>
            </Dialog>

            {/* Upload Modal */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Delivery Files</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>Uploading files will mark the project as <strong>Ready for Download</strong> and notify the student.</Alert>
                    <Button variant="outlined" component="label" startIcon={<MdUpload />} fullWidth sx={{ mb: 2 }}>
                        Select Files
                        <input type="file" hidden multiple onChange={handleFileChange} />
                    </Button>

                    {uploadFiles.map((file, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                            <Typography variant="body2" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</Typography>
                            <TextField select size="small" value={fileTypes[index] || "project-file"} onChange={(e) => handleFileTypeChange(index, e.target.value)} sx={{ width: 150 }}>
                                <MenuItem value="source-code">Source Code</MenuItem>
                                <MenuItem value="ppt">PPT</MenuItem>
                                <MenuItem value="report">Report</MenuItem>
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="project-file">Other</MenuItem>
                            </TextField>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => markReadyForDownloadMutation.mutate(selectedAssignment?._id)} disabled={uploadFiles.length === 0 || markReadyForDownloadMutation.isPending}>Upload & Finish</Button>
                </DialogActions>
            </Dialog>

            {/* Report Generation Modal */}
            <Dialog open={reportModal} onClose={() => setReportModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField select label="Format" value={reportForm.format} onChange={(e) => setReportForm({ ...reportForm, format: e.target.value })} fullWidth>
                            <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                            <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                        </TextField>
                        <TextField select label="Status Filter" value={reportForm.status} onChange={(e) => setReportForm({ ...reportForm, status: e.target.value })} fullWidth>
                            <MenuItem value="all">All Projects</MenuItem>
                            <MenuItem value="active">Active (Ongoing)</MenuItem>
                            <MenuItem value="delivered">Delivered / Completed</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleGenerateReport}>Download</Button>
                </DialogActions>
            </Dialog>
            {/* View Files Modal */}
            <Dialog open={viewFilesModal} onClose={() => setViewFilesModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Uploaded Delivery Files</DialogTitle>
                <DialogContent>
                    {selectedAssignment?.deliveryFiles?.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                            {selectedAssignment.deliveryFiles.map((file: any, index: number) => (
                                <Box key={index} sx={{ p: 1.5, border: "1px solid #e2e8f0", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="600">{file.fileName}</Typography>
                                        <Chip label={file.fileType} size="small" sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }} />
                                    </Box>
                                    <Button size="small" variant="outlined" href={file.filePath} target="_blank" rel="noopener noreferrer" startIcon={<MdDownload />}>
                                        Download
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Alert severity="info">No files found for this project.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewFilesModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default ProjectSubmissions;
