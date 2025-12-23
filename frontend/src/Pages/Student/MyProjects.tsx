import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating,
    IconButton,
    Divider,
    Stack,
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    MdDownload,
    MdDescription,
    MdCode,
    MdPictureAsPdf,
    MdVideoLibrary,
    MdCheck,
    MdPayment,
    MdCloudDownload,
    MdUpload,
    MdAssignment,
    MdAccessTime,
    MdPerson,
    MdCalendarToday,
    MdCheckCircle,
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import { primaryButtonStyle, outlinedButtonStyle, dangerButtonStyle } from "../../assets/Styles/ButtonStyles";
import { useUploadPaymentProof, useGetPaymentSettings } from "../../Hooks/payment";

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

// Linear Flow Steps
const steps = [
    { label: "Assigned", value: "assigned" },
    { label: "Requirements", value: "requirement-submitted" },
    { label: "Advance Pay", value: "advance-payment-pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Demo", value: "ready-for-demo" },
    { label: "Final Pay", value: "final-payment-pending" },
    { label: "Download", value: "ready-for-download" },
    { label: "Delivered", value: "delivered" }
];

const getActiveStep = (status: string) => {
    switch (status) {
        case "assigned": return 0;
        case "requirement-submitted": case "requirement-submitted-admin": return 1;
        case "advance-payment-pending": return 2;
        case "in-progress": return 3;
        case "ready-for-demo": return 4;
        case "final-payment-pending": return 5;
        case "ready-for-download": return 6;
        case "delivered": case "completed": return 8;
        default: return 0;
    }
};

const getFileIcon = (fileType: string) => {
    const style = { fontSize: 20 };
    switch (fileType) {
        case "ppt": return <MdDescription style={{ ...style, color: "#f97316" }} />;
        case "source-code": return <MdCode style={{ ...style, color: "#10b981" }} />;
        case "report": case "documentation": return <MdPictureAsPdf style={{ ...style, color: "#ef4444" }} />;
        case "video": return <MdVideoLibrary style={{ ...style, color: "#6366f1" }} />;
        default: return <MdDescription style={{ ...style, color: "var(--webprimary)" }} />;
    }
};

const getStatusBadge = (assignment: any) => {
    const status = assignment.status;

    if (status === "delivered" || status === "completed") {
        return { label: "Delivered", color: "#22c55e", bg: "#f0fdf4" };
    }
    if (status === "ready-for-download") {
        return { label: "Ready to Download", color: "#3b82f6", bg: "#eff6ff" };
    }
    if (status === "final-payment-pending" || status === "advance-payment-pending") {
        if (assignment.payment?.proofFile) {
            return { label: "Payment Verifying", color: "#f59e0b", bg: "#fffbeb" };
        }
        return { label: "Payment Required", color: "#ef4444", bg: "#fef2f2" };
    }
    if (status === "in-progress") {
        return { label: "In Progress", color: "var(--webprimary)", bg: "#eff6ff" };
    }
    if (status === "ready-for-demo") {
        return { label: "Demo Ready", color: "#8b5cf6", bg: "#f5f3ff" };
    }
    if (status === "requirement-submitted" || status === "requirement-submitted-admin") {
        return { label: "Requirements Submitted", color: "#06b6d4", bg: "#ecfeff" };
    }
    return { label: "Assigned", color: "#8b5cf6", bg: "#f5f3ff" };
};

const MyProjects = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const location = useLocation();

    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [requirementModal, setRequirementModal] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [paymentProofModal, setPaymentProofModal] = useState(false);

    const [requirementForm, setRequirementForm] = useState({
        projectType: "other", collegeGuidelines: "", notes: ""
    });
    const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comments: "" });
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [requirementFiles, setRequirementFiles] = useState<File[]>([]);

    const paymentProofMutation = useUploadPaymentProof();
    const { data: paymentSettings } = useGetPaymentSettings();

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-projects"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-projects`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    // Deep Linking
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const projectId = params.get("projectId");
        if (projectId && data && !isLoading) {
            setTimeout(() => {
                const element = document.getElementById(projectId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    element.style.border = "2px solid var(--webprimary)";
                    setTimeout(() => { element.style.border = "1px solid #e0e0e0"; }, 3000);
                }
            }, 500);
        }
    }, [data, isLoading, location.search]);

    // Mutations
    const submitRequirementMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const formData = new FormData();
            formData.append("topic", selectedProject?.itemId?.title || "Project");
            formData.append("projectType", requirementForm.projectType);
            formData.append("collegeGuidelines", requirementForm.collegeGuidelines);
            formData.append("notes", requirementForm.notes);

            if (requirementFiles && requirementFiles.length > 0) {
                Array.from(requirementFiles).forEach((file) => {
                    formData.append("files", file);
                });
            }

            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/projects/${assignmentId}/submit-requirement`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Requirement submitted!");
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
            setRequirementModal(false);
            setRequirementForm({ projectType: "other", collegeGuidelines: "", notes: "" });
            setRequirementFiles([]);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed"),
    });

    const markDeliveredMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/projects/${assignmentId}/mark-delivered`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project marked as delivered!");
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed"),
    });

    const submitFeedbackMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/projects/${assignmentId}/feedback`,
                feedbackForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Thank you for your feedback!");
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
            setFeedbackModal(false);
            setFeedbackForm({ rating: 0, comments: "" });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed"),
    });

    const handleDownload = (path: string, filename: string) => {
        const link = document.createElement("a");
        link.href = path.startsWith("http") ? path : `${import.meta.env.VITE_APP_BASE_URL}/${path}`;
        link.setAttribute("download", filename);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <Alert severity="error">Failed to load projects. Please try again.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
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
                    My Projects
                </Typography>
                <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                    Track your project progress from requirements to delivery
                </Typography>
            </Box>

            {!data || data.length === 0 ? (
                <Card sx={{ border: "1px solid #e0e0e0", borderRadius: "10px", p: 6, textAlign: "center" }}>
                    <MdAssignment size={48} color="var(--greyText)" />
                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", mt: 2, mb: 1 }}>
                        No projects yet!
                    </Typography>
                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                        Contact admin to get a project assigned.
                    </Typography>
                </Card>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((assignment: any) => {
                        const project = assignment.itemId;
                        const statusBadge = getStatusBadge(assignment);
                        const activeStep = getActiveStep(assignment.status);
                        const isDelivered = assignment.status === "delivered" || assignment.status === "completed";
                        const needsRequirement = assignment.status === "assigned";
                        const needsPayment = (assignment.status === "advance-payment-pending" || assignment.status === "final-payment-pending") && !assignment.payment?.proofFile;
                        const paymentVerifying = (assignment.status === "advance-payment-pending" || assignment.status === "final-payment-pending") && assignment.payment?.proofFile;
                        const readyToDownload = assignment.status === "ready-for-download";

                        return (
                            <Card
                                key={assignment._id}
                                id={assignment._id}
                                sx={{ border: "1px solid #e0e0e0", borderRadius: "10px", overflow: "hidden" }}
                            >
                                {/* Header */}
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                                        <Box>
                                            <Chip
                                                label={statusBadge.label}
                                                size="small"
                                                sx={{
                                                    fontFamily: "Medium_W",
                                                    fontSize: "11px",
                                                    bgcolor: statusBadge.bg,
                                                    color: statusBadge.color,
                                                    border: `1px solid ${statusBadge.color}`,
                                                    fontWeight: 600,
                                                    mb: 1
                                                }}
                                            />
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", color: "var(--title)" }}>
                                                {project?.title || "Untitled Project"}
                                            </Typography>
                                            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                                                {project?.mentor && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                                        <MdPerson size={14} />
                                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>{project.mentor}</Typography>
                                                    </Box>
                                                )}
                                                {project?.deadline && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                                        <MdCalendarToday size={14} />
                                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>
                                                            Due {new Date(project.deadline).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* Stepper */}
                                    <Box sx={{ mt: 3, overflowX: "auto" }}>
                                        <Stepper activeStep={activeStep} alternativeLabel sx={{ minWidth: 600 }}>
                                            {steps.map((step, idx) => (
                                                <Step key={step.value} completed={idx < activeStep}>
                                                    <StepLabel sx={{
                                                        "& .MuiStepLabel-label": {
                                                            fontFamily: "Regular_W",
                                                            fontSize: "10px"
                                                        }
                                                    }}>
                                                        {step.label}
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Box>
                                </CardContent>

                                <Divider />

                                {/* Action Section */}
                                <Box sx={{ p: 3 }}>
                                    {/* NEEDS REQUIREMENT */}
                                    {needsRequirement && (
                                        <Box sx={{ p: 3, bgcolor: "#f5f3ff", borderRadius: "8px", border: "1px solid #c4b5fd" }}>
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#7c3aed", mb: 1 }}>
                                                Submit Your Requirements
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)", mb: 2 }}>
                                                Tell us about your project needs to get started.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<MdAssignment />}
                                                onClick={() => { setSelectedProject(assignment); setRequirementModal(true); }}
                                                sx={{ ...primaryButtonStyle }}
                                            >
                                                Submit Requirements
                                            </Button>
                                        </Box>
                                    )}

                                    {/* NEEDS PAYMENT */}
                                    {needsPayment && (
                                        <Box sx={{ p: 3, bgcolor: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <MdPayment color="#ef4444" size={20} />
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#dc2626" }}>
                                                    {assignment.status === "advance-payment-pending" ? "Advance" : "Final"} Payment Required
                                                </Typography>
                                            </Box>

                                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: "6px", mb: 2 }}>
                                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px", color: "var(--greyText)" }}>Amount</Typography>
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "24px", color: "#dc2626" }}>
                                                    ₹{assignment.payment?.amount || 0}
                                                </Typography>
                                            </Box>

                                            {paymentSettings && (
                                                <Box sx={{ mb: 2, p: 2, bgcolor: "white", borderRadius: "6px" }}>
                                                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "13px", mb: 1 }}>Payment Options:</Typography>
                                                    {paymentSettings.enableBankTransfer && (
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>Bank</Typography>
                                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>
                                                                {paymentSettings.bankDetails?.accountHolderName} | A/C: {paymentSettings.bankDetails?.accountNumber}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {paymentSettings.enableUPI && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                            <Box>
                                                                <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>UPI</Typography>
                                                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>{paymentSettings.upiId}</Typography>
                                                            </Box>
                                                            {paymentSettings.qrUrl && (
                                                                <Box component="img" src={paymentSettings.qrUrl} alt="QR" sx={{ width: 60, borderRadius: "4px" }} />
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<MdUpload />}
                                                onClick={() => { setSelectedProject(assignment); setPaymentProofModal(true); }}
                                                sx={{ ...dangerButtonStyle, py: 1.2 }}
                                            >
                                                Upload Payment Screenshot
                                            </Button>
                                        </Box>
                                    )}

                                    {/* PAYMENT VERIFYING */}
                                    {paymentVerifying && (
                                        <Box sx={{ p: 3, bgcolor: "#fffbeb", borderRadius: "8px", border: "1px solid #fcd34d", textAlign: "center" }}>
                                            <MdAccessTime size={32} color="#f59e0b" />
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#d97706", mt: 1 }}>
                                                Payment Under Review
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)" }}>
                                                Admin will verify your payment soon.
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* IN PROGRESS / DEMO / REQ SUBMITTED */}
                                    {(assignment.status === "in-progress" || assignment.status === "ready-for-demo" || assignment.status === "requirement-submitted" || assignment.status === "requirement-submitted-admin") && (
                                        <Box sx={{ p: 3, bgcolor: "#eff6ff", borderRadius: "8px", border: "1px solid #93c5fd", textAlign: "center" }}>
                                            <MdAccessTime size={32} color="var(--webprimary)" />
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "var(--webprimary)", mt: 1 }}>
                                                {assignment.status === "in-progress" ? "Work in Progress" :
                                                    assignment.status === "ready-for-demo" ? "Demo Ready - Contact Admin" :
                                                        "Requirements Received"}
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)" }}>
                                                We're working on your project. You'll be notified of updates.
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* READY TO DOWNLOAD */}
                                    {readyToDownload && (
                                        <Box sx={{ p: 3, bgcolor: "#f0fdf4", borderRadius: "8px", border: "1px solid #86efac" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <MdCloudDownload color="#22c55e" size={20} />
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#16a34a" }}>
                                                    Your Project Files are Ready!
                                                </Typography>
                                            </Box>

                                            {assignment.deliveryFiles?.length > 0 && (
                                                <Stack spacing={1} sx={{ mb: 2 }}>
                                                    {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 2,
                                                                p: 1.5,
                                                                bgcolor: "white",
                                                                borderRadius: "6px",
                                                                justifyContent: "space-between"
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                {getFileIcon(file.fileType)}
                                                                <Box>
                                                                    <Typography sx={{ fontFamily: "Medium_W", fontSize: "13px" }}>{file.fileName}</Typography>
                                                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "11px", color: "var(--greyText)", textTransform: "capitalize" }}>
                                                                        {file.fileType?.replace("-", " ")}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                            <Button
                                                                size="small"
                                                                startIcon={<MdDownload />}
                                                                onClick={() => handleDownload(file.filePath, file.fileName)}
                                                                sx={{ ...outlinedButtonStyle, fontSize: "11px", py: 0.5 }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<MdCheck />}
                                                onClick={() => markDeliveredMutation.mutate(assignment._id)}
                                                disabled={markDeliveredMutation.isPending}
                                                sx={{
                                                    bgcolor: "#22c55e",
                                                    fontFamily: "Medium_W",
                                                    "&:hover": { bgcolor: "#16a34a" }
                                                }}
                                            >
                                                {markDeliveredMutation.isPending ? "Processing..." : "Confirm Delivery & Complete"}
                                            </Button>
                                        </Box>
                                    )}

                                    {/* DELIVERED */}
                                    {isDelivered && (
                                        <Box sx={{ p: 3, bgcolor: "#f0fdf4", borderRadius: "8px", border: "1px solid #86efac" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <MdCheckCircle color="#22c55e" size={20} />
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#16a34a" }}>
                                                    Project Delivered Successfully!
                                                </Typography>
                                            </Box>

                                            {assignment.deliveryFiles?.length > 0 && (
                                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                                    {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                        <Chip
                                                            key={idx}
                                                            label={file.fileName}
                                                            size="small"
                                                            icon={<MdDownload />}
                                                            onClick={() => handleDownload(file.filePath, file.fileName)}
                                                            sx={{ fontFamily: "Regular_W", fontSize: "11px", cursor: "pointer" }}
                                                        />
                                                    ))}
                                                </Stack>
                                            )}

                                            {!assignment.feedback?.submitted && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => { setSelectedProject(assignment); setFeedbackModal(true); }}
                                                    sx={{ ...outlinedButtonStyle }}
                                                >
                                                    Leave Feedback
                                                </Button>
                                            )}
                                            {assignment.invoice?.url && (
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<MdDescription />}
                                                    onClick={() => handleDownload(assignment.invoice.url, `Invoice_${assignment.invoice.invoiceNumber}.pdf`)}
                                                    sx={{ ...outlinedButtonStyle, ml: 1 }}
                                                >
                                                    Download Invoice
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Requirement Modal */}
            <Dialog open={requirementModal} onClose={() => setRequirementModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: "1px solid var(--borderColor)",
                    fontFamily: "SemiBold_W", fontSize: "16px"
                }}>
                    Submit Requirements
                    <IconButton onClick={() => setRequirementModal(false)} size="small"><IoClose /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            select
                            label="Project Type"
                            value={requirementForm.projectType}
                            onChange={(e) => setRequirementForm({ ...requirementForm, projectType: e.target.value })}
                            fullWidth
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        >
                            {projectTypeOptions.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="College Guidelines / Instructions"
                            value={requirementForm.collegeGuidelines}
                            onChange={(e) => setRequirementForm({ ...requirementForm, collegeGuidelines: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Any specific requirements from your college..."
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        />
                        <TextField
                            label="Additional Notes"
                            value={requirementForm.notes}
                            onChange={(e) => setRequirementForm({ ...requirementForm, notes: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        {/* File Upload for Requirements */}
                        <Box sx={{ border: "1px dashed var(--borderColor)", p: 2, borderRadius: "8px", textAlign: "center" }}>
                            <input
                                type="file"
                                multiple
                                id="requirement-files"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setRequirementFiles(Array.from(e.target.files));
                                    }
                                }}
                            />
                            <label htmlFor="requirement-files">
                                <Button component="span" startIcon={<MdUpload />} sx={{ fontFamily: "Medium_W", textTransform: "none" }}>
                                    Upload Guidelines/Docs
                                </Button>
                            </label>
                            {requirementFiles.length > 0 && (
                                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                    {requirementFiles.map((file, idx) => (
                                        <Chip key={idx} label={file.name} onDelete={() => {
                                            const newFiles = [...requirementFiles];
                                            newFiles.splice(idx, 1);
                                            setRequirementFiles(newFiles);
                                        }} size="small" />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setRequirementModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => submitRequirementMutation.mutate(selectedProject._id)}
                        disabled={submitRequirementMutation.isPending}
                        sx={{ ...primaryButtonStyle }}
                    >
                        {submitRequirementMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Proof Modal */}
            <Dialog open={paymentProofModal} onClose={() => setPaymentProofModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: "1px solid var(--borderColor)",
                    fontFamily: "SemiBold_W", fontSize: "16px"
                }}>
                    Upload Payment Proof
                    <IconButton onClick={() => setPaymentProofModal(false)} size="small"><IoClose /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Alert severity="info" sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                            Upload screenshot for <strong>{selectedProject?.itemId?.title}</strong>
                            <br />Amount: <strong>₹{selectedProject?.payment?.amount}</strong>
                        </Alert>

                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ height: 100, borderStyle: "dashed", borderColor: "var(--borderColor)" }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                <MdUpload size={32} />
                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                                    {paymentProofFile ? paymentProofFile.name : "Click to upload proof"}
                                </Typography>
                            </Box>
                            <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)} />
                        </Button>

                        <TextField
                            select
                            label="Payment Method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            fullWidth
                            SelectProps={{ native: true }}
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        >
                            <option value="">Select Method</option>
                            <option value="upi">UPI</option>
                            <option value="bank-transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                        </TextField>

                        <TextField
                            label="Transaction ID (Optional)"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            fullWidth
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setPaymentProofModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (!paymentProofFile || !selectedProject) return;
                            const formData = new FormData();
                            formData.append("proofFile", paymentProofFile);
                            if (paymentMethod) formData.append("paymentMethod", paymentMethod);
                            if (transactionId) formData.append("transactionId", transactionId);

                            paymentProofMutation.mutate({
                                assignmentId: selectedProject._id,
                                formData
                            }, {
                                onSuccess: () => {
                                    CustomSnackBar.successSnackbar("Payment proof uploaded!");
                                    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
                                    setPaymentProofModal(false);
                                    setPaymentProofFile(null);
                                    setPaymentMethod("");
                                    setTransactionId("");
                                },
                                onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed"),
                            });
                        }}
                        disabled={!paymentProofFile || paymentProofMutation.isPending}
                        sx={{ ...dangerButtonStyle }}
                    >
                        {paymentProofMutation.isPending ? "Uploading..." : "Submit Proof"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Modal */}
            <Dialog open={feedbackModal} onClose={() => setFeedbackModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: "1px solid var(--borderColor)",
                    fontFamily: "SemiBold_W", fontSize: "16px"
                }}>
                    Leave Feedback
                    <IconButton onClick={() => setFeedbackModal(false)} size="small"><IoClose /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", mb: 1 }}>How was your experience?</Typography>
                            <Rating
                                value={feedbackForm.rating}
                                onChange={(_, value) => setFeedbackForm({ ...feedbackForm, rating: value || 0 })}
                                size="large"
                            />
                        </Box>
                        <TextField
                            label="Comments"
                            value={feedbackForm.comments}
                            onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Share your thoughts..."
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setFeedbackModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => submitFeedbackMutation.mutate(selectedProject._id)}
                        disabled={!feedbackForm.rating || submitFeedbackMutation.isPending}
                        sx={{ ...primaryButtonStyle }}
                    >
                        {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyProjects;
