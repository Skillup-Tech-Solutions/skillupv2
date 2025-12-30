import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogActions,
    Alert,
    Rating,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { usePullToRefresh } from "../../utils/usePullToRefresh";
import PullToRefreshIndicator from "../../Components/Student/PullToRefreshIndicator";
import { ProgramCardSkeleton } from "../../Components/Student/PortalSkeletons";
import { Skeleton } from "@mui/material";
import {
    FolderSimple,
    DownloadSimple,
    UploadSimple,
    CreditCard,
    User,
    CalendarBlank,
    CheckCircle,
    FileCode,
    FileDoc,
    FilePdf,
    VideoCamera,
    Sparkle,
    Trophy,
    Star,
    X,
    ClipboardText,
    HourglassMedium,
} from "@phosphor-icons/react";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import { useUploadPaymentProof, useGetPaymentSettings } from "../../Hooks/payment";
import PaymentVerifying from "../../Components/PaymentVerifying";
import { downloadFileAsBlob } from "../../utils/normalizeUrl";

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
    switch (fileType) {
        case "ppt": return <FileDoc size={20} weight="duotone" style={{ color: "#f59e0b" }} />;
        case "source-code": return <FileCode size={20} weight="duotone" style={{ color: "#22c55e" }} />;
        case "report": case "documentation": return <FilePdf size={20} weight="duotone" style={{ color: "#ef4444" }} />;
        case "video": return <VideoCamera size={20} weight="duotone" style={{ color: "#a855f7" }} />;
        default: return <FileDoc size={20} weight="duotone" style={{ color: "#22d3ee" }} />;
    }
};

// Using exact frontend-ref colors
const getStatusBadge = (assignment: any) => {
    const status = assignment.status;

    if (status === "delivered" || status === "completed") {
        return { label: "Delivered", color: "#22c55e", bg: "rgba(22, 101, 52, 0.3)", border: "rgba(34, 197, 94, 0.5)" };
    }
    if (status === "ready-for-download") {
        return { label: "Ready to Download", color: "#3b82f6", bg: "rgba(30, 58, 138, 0.3)", border: "rgba(59, 130, 246, 0.5)" };
    }
    if (status === "final-payment-pending" || status === "advance-payment-pending") {
        if (assignment.payment?.proofFile || assignment.payment?.proofUploadedAt) {
            return { label: "Payment Verifying", color: "#f59e0b", bg: "rgba(120, 53, 15, 0.3)", border: "rgba(245, 158, 11, 0.5)" };
        }
        return { label: "Payment Required", color: "#ef4444", bg: "rgba(127, 29, 29, 0.3)", border: "rgba(239, 68, 68, 0.5)" };
    }
    if (status === "in-progress") {
        return { label: "In Progress", color: "#22d3ee", bg: "rgba(22, 78, 99, 0.3)", border: "rgba(34, 211, 238, 0.5)" };
    }
    if (status === "ready-for-demo") {
        return { label: "Demo Ready", color: "#a855f7", bg: "rgba(88, 28, 135, 0.3)", border: "rgba(168, 85, 247, 0.5)" };
    }
    if (status === "requirement-submitted" || status === "requirement-submitted-admin") {
        return { label: "Requirements Submitted", color: "#22d3ee", bg: "rgba(22, 78, 99, 0.3)", border: "rgba(34, 211, 238, 0.5)" };
    }
    return { label: "Assigned", color: "#ec4899", bg: "rgba(131, 24, 67, 0.3)", border: "rgba(236, 72, 153, 0.5)" };
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

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["my-projects"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-projects`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const { pullDistance, isRefreshing } = usePullToRefresh({
        onRefresh: async () => {
            await refetch();
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
                    element.style.border = "2px solid #22d3ee";
                    setTimeout(() => { element.style.border = "1px solid rgba(71, 85, 105, 0.6)"; }, 3000);
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

    const handleDownload = async (path: string, filename: string) => {
        window.dispatchEvent(new CustomEvent('download-start', { detail: { filename } }));
        try {
            await downloadFileAsBlob(path, filename);
        } catch (error) {
            CustomSnackBar.errorSnackbar("Download failed");
        } finally {
            window.dispatchEvent(new CustomEvent('download-end'));
        }
    };

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: "#0f172a",
            color: "#f8fafc",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            borderRadius: "6px",
            "& fieldset": { borderColor: "#475569" },
            "&:hover fieldset": { borderColor: "#64748b" },
            "&.Mui-focused fieldset": { borderColor: "#22d3ee" },
        },
        "& .MuiInputLabel-root": { color: "#64748b", fontFamily: "'Inter', sans-serif", fontSize: "14px" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
        "& .MuiSelect-icon": { color: "#64748b" },
    };

    if (isLoading && !isRefreshing) {
        return (
            <Box sx={{ maxWidth: 900, mx: "auto" }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="40%" height={40} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "12px" }} />
                </Box>
                <ProgramCardSkeleton />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    sx={{ bgcolor: "rgba(127, 29, 29, 0.3)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.5)", "& .MuiAlert-icon": { color: "#ef4444" } }}
                >
                    Failed to load projects. Please try again.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
            <PullToRefreshIndicator
                pullDistance={pullDistance}
                isRefreshing={isRefreshing}
                threshold={80}
            />
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    component="h1"
                    sx={{
                        fontSize: { xs: "18px", sm: "20px", md: "24px" },
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
                    <FolderSimple size={28} weight="duotone" color="#22d3ee" />
                    My Projects
                </Box>
                <Box component="p" sx={{ color: "#64748b", mt: 1, fontSize: { xs: "13px", md: "14px" }, display: { xs: "none", sm: "block" } }}>
                    Track your project progress from requirements to delivery
                </Box>
            </Box>

            {!data || data.length === 0 ? (
                <Box
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "6px",
                        p: { xs: 4, md: 6 },
                        textAlign: "center",
                    }}
                >
                    <FolderSimple size={48} weight="duotone" style={{ color: "#475569", marginBottom: 16 }} />
                    <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>No projects yet!</Box>
                    <Box sx={{ color: "#64748b", fontSize: "14px" }}>Contact admin to get a project assigned.</Box>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((assignment: any) => {
                        const project = assignment.itemId;
                        const statusBadge = getStatusBadge(assignment);
                        const activeStep = getActiveStep(assignment.status);
                        const isDelivered = assignment.status === "delivered" || assignment.status === "completed";
                        const needsRequirement = assignment.status === "assigned";
                        const needsPayment = (assignment.status === "advance-payment-pending" || assignment.status === "final-payment-pending") && !assignment.payment?.proofFile && !assignment.payment?.proofUploadedAt;
                        const paymentVerifying = (assignment.status === "advance-payment-pending" || assignment.status === "final-payment-pending") && (assignment.payment?.proofFile || assignment.payment?.proofUploadedAt);
                        const readyToDownload = assignment.status === "ready-for-download";
                        const isInProgress = assignment.status === "in-progress" || assignment.status === "ready-for-demo" || assignment.status === "requirement-submitted" || assignment.status === "requirement-submitted-admin";

                        return (
                            <Box
                                key={assignment._id}
                                id={assignment._id}
                                sx={{
                                    bgcolor: "rgba(30, 41, 59, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.6)",
                                    borderRadius: "6px",
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                <Sparkle
                                    size={80}
                                    weight="duotone"
                                    style={{
                                        position: "absolute",
                                        right: -16,
                                        top: -16,
                                        color: "rgba(71, 85, 105, 0.2)",
                                        pointerEvents: "none",
                                    }}
                                />
                                {/* Header */}
                                <Box sx={{ p: 3, position: "relative", zIndex: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                                        <Box>
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                    bgcolor: statusBadge.bg,
                                                    color: statusBadge.color,
                                                    border: `1px solid ${statusBadge.border}`,
                                                    mb: 1,
                                                }}
                                            >
                                                {statusBadge.label}
                                            </Box>
                                            <Box
                                                component="h3"
                                                sx={{
                                                    fontSize: "18px",
                                                    fontWeight: 600,
                                                    color: "#f8fafc",
                                                    m: 0,
                                                    mb: 1,
                                                }}
                                            >
                                                {project?.title || "Untitled Project"}
                                            </Box>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                                {project?.mentor && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8", fontSize: "12px" }}>
                                                        <User size={14} weight="duotone" />
                                                        {project.mentor}
                                                    </Box>
                                                )}
                                                {project?.deadline && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8", fontSize: "12px" }}>
                                                        <CalendarBlank size={14} weight="duotone" />
                                                        Due {new Date(project.deadline).toLocaleDateString()}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Progress Stepper - Grid Layout */}
                                    <Box sx={{ mt: 3, overflowX: "auto", position: "relative", zIndex: 1 }}>
                                        <Box sx={{ minWidth: 800, position: "relative", px: 2, pt: 1, pb: 1 }}>
                                            {/* Background Connector Lines - Absolute Positioned */}
                                            <Box sx={{ position: "absolute", top: 27, left: 0, width: "100%", height: 3, zIndex: 0 }}>
                                                {steps.map((_, idx) => {
                                                    if (idx === steps.length - 1) return null;
                                                    // 8 columns -> 12.5% per column
                                                    // Center is 6.25%
                                                    // i-th center = (i * 12.5) + 6.25
                                                    // Line starts at i-th center, width is 12.5%
                                                    const leftPos = (idx * 12.5) + 6.25;
                                                    return (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                position: "absolute",
                                                                left: `${leftPos}%`,
                                                                width: "12.5%",
                                                                height: "100%",
                                                                bgcolor: activeStep > idx ? "#22c55e" : "#334155",
                                                                transition: "background-color 0.3s ease"
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>

                                            {/* Step Indicators - Grid Layout */}
                                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", position: "relative", zIndex: 1 }}>
                                                {steps.map((step, idx) => {
                                                    const isActive = idx === activeStep;
                                                    const isCompleted = idx < activeStep;
                                                    const isFuture = idx > activeStep;

                                                    return (
                                                        <Box key={step.value} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: "50%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    mb: 1,
                                                                    transition: "all 0.3s ease",
                                                                    bgcolor: isFuture ? "#0f172a" : (isActive && step.value === "assigned" ? "#ec4899" : "#22c55e"), // Special color for assigned if needed, or unify
                                                                    // Let's stick to the green unified theme for simplicity unless active needs differentiation
                                                                    // Re-using the green theme:
                                                                    // bgcolor: isFuture ? "#0f172a" : "#22c55e",
                                                                    // Actually dashboard uses blue for active but image showed unified green. Sticking to green unified.
                                                                    color: isFuture ? "#64748b" : "#fff",
                                                                    border: isFuture ? "2px solid #334155" : "none",
                                                                    boxShadow: isActive ? "0 0 0 4px rgba(34, 197, 94, 0.2)" : "none",
                                                                    // Override for Assigned/Requirements if we want specific colors, but unified is cleaner.
                                                                }}
                                                            >
                                                                {isCompleted || isActive ? (
                                                                    <CheckCircle size={20} weight="fill" />
                                                                ) : (
                                                                    <span style={{ fontSize: "12px", fontWeight: 700 }}>{idx + 1}</span>
                                                                )}
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    fontSize: "9px",
                                                                    fontWeight: 700,
                                                                    color: isFuture ? "#64748b" : "#f8fafc",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.05em",
                                                                    fontFamily: "'JetBrains Mono', monospace",
                                                                    textAlign: "center"
                                                                }}
                                                            >
                                                                {step.label}
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Action Section */}
                                <Box sx={{ p: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)", position: "relative", zIndex: 1 }}>
                                    {/* NEEDS REQUIREMENT */}
                                    {needsRequirement && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(to bottom right, rgba(131, 24, 67, 0.3), rgba(131, 24, 67, 0.1))",
                                                border: "1px solid rgba(236, 72, 153, 0.3)",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <ClipboardText size={20} weight="duotone" style={{ color: "#ec4899" }} />
                                                <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#ec4899" }}>Submit Your Requirements</Box>
                                            </Box>
                                            <Box sx={{ color: "#94a3b8", fontSize: "13px", mb: 2 }}>
                                                Tell us about your project needs to get started.
                                            </Box>
                                            <Button
                                                onClick={() => { setSelectedProject(assignment); setRequirementModal(true); }}
                                                startIcon={<ClipboardText size={18} />}
                                                sx={{
                                                    bgcolor: "#ec4899",
                                                    color: "#fff",
                                                    px: 3,
                                                    py: 1,
                                                    borderRadius: "6px",
                                                    fontWeight: 600,
                                                    fontSize: "13px",
                                                    textTransform: "uppercase",
                                                    "&:hover": { bgcolor: "#db2777" },
                                                }}
                                            >
                                                Submit Requirements
                                            </Button>
                                        </Box>
                                    )}

                                    {/* NEEDS PAYMENT */}
                                    {needsPayment && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(to bottom right, rgba(69, 10, 10, 0.3), rgba(127, 29, 29, 0.1))",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <CreditCard size={20} weight="duotone" style={{ color: "#ef4444" }} />
                                                <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#ef4444" }}>
                                                    {assignment.status === "advance-payment-pending" ? "Advance" : "Final"} Payment Required
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "6px", mb: 2 }}>
                                                <Box>
                                                    <Box sx={{ fontSize: "12px", color: "#94a3b8" }}>Amount</Box>
                                                    <Box sx={{ fontSize: "24px", fontWeight: 700, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
                                                        ₹{assignment.payment?.amount || 0}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {paymentSettings && (
                                                <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "6px" }}>
                                                    <Box sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>Payment Options:</Box>
                                                    {paymentSettings.enableBankTransfer && (
                                                        <Box sx={{ mb: 1 }}>
                                                            <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bank</Box>
                                                            <Box sx={{ fontSize: "12px", color: "#94a3b8" }}>
                                                                {paymentSettings.bankDetails?.accountHolderName} | A/C: {paymentSettings.bankDetails?.accountNumber}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {paymentSettings.enableUPI && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                            <Box>
                                                                <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>UPI</Box>
                                                                <Box sx={{ fontSize: "12px", color: "#94a3b8" }}>{paymentSettings.upiId}</Box>
                                                            </Box>
                                                            {paymentSettings.qrUrl && (
                                                                <Box component="img" src={paymentSettings.qrUrl} alt="QR" sx={{ width: 60, borderRadius: "6px" }} />
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            <Button
                                                fullWidth
                                                onClick={() => { setSelectedProject(assignment); setPaymentProofModal(true); }}
                                                startIcon={<UploadSimple size={18} />}
                                                sx={{
                                                    bgcolor: "#ef4444",
                                                    color: "#fff",
                                                    py: 1.2,
                                                    borderRadius: "6px",
                                                    fontWeight: 600,
                                                    fontSize: "13px",
                                                    textTransform: "uppercase",
                                                    "&:hover": { bgcolor: "#dc2626" },
                                                }}
                                            >
                                                Upload Payment Screenshot
                                            </Button>
                                        </Box>
                                    )}

                                    {/* PAYMENT VERIFYING */}
                                    {paymentVerifying && (
                                        <PaymentVerifying onReupload={() => { setSelectedProject(assignment); setPaymentProofModal(true); }} />
                                    )}

                                    {/* IN PROGRESS / DEMO */}
                                    {isInProgress && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(to bottom right, rgba(22, 78, 99, 0.3), rgba(22, 78, 99, 0.1))",
                                                border: "1px solid rgba(34, 211, 238, 0.3)",
                                                borderRadius: "6px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <HourglassMedium size={32} weight="duotone" style={{ color: "#22d3ee", marginBottom: 8 }} />
                                            <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#22d3ee" }}>
                                                {assignment.status === "in-progress" ? "Work in Progress" :
                                                    assignment.status === "ready-for-demo" ? "Demo Ready - Contact Admin" :
                                                        "Requirements Received"}
                                            </Box>
                                            <Box sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                                We're working on your project. You'll be notified of updates.
                                            </Box>
                                        </Box>
                                    )}

                                    {/* READY TO DOWNLOAD */}
                                    {readyToDownload && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(to bottom right, rgba(20, 83, 45, 0.3), rgba(22, 101, 52, 0.1))",
                                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <DownloadSimple size={20} weight="duotone" style={{ color: "#22c55e" }} />
                                                <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#22c55e" }}>Your Project Files are Ready!</Box>
                                            </Box>

                                            {assignment.deliveryFiles?.length > 0 && (
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                                                    {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 2,
                                                                p: 2,
                                                                bgcolor: "rgba(15, 23, 42, 0.5)",
                                                                borderRadius: "6px",
                                                                justifyContent: "space-between"
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                {getFileIcon(file.fileType)}
                                                                <Box>
                                                                    <Box sx={{ fontSize: "13px", fontWeight: 500, color: "#f8fafc" }}>{file.fileName}</Box>
                                                                    <Box sx={{ fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>
                                                                        {file.fileType?.replace("-", " ")}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                            <Button
                                                                size="small"
                                                                startIcon={<DownloadSimple size={14} />}
                                                                onClick={() => handleDownload(file.filePath, file.fileName)}
                                                                sx={{ color: "#22c55e", fontSize: "11px", fontWeight: 500 }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            <Button
                                                fullWidth
                                                startIcon={<CheckCircle size={18} />}
                                                onClick={() => markDeliveredMutation.mutate(assignment._id)}
                                                disabled={markDeliveredMutation.isPending}
                                                sx={{
                                                    bgcolor: "#22c55e",
                                                    color: "#fff",
                                                    py: 1.2,
                                                    borderRadius: "6px",
                                                    fontWeight: 600,
                                                    fontSize: "13px",
                                                    textTransform: "uppercase",
                                                    "&:hover": { bgcolor: "#16a34a" },
                                                    "&:disabled": { opacity: 0.5 },
                                                }}
                                            >
                                                {markDeliveredMutation.isPending ? "Processing..." : "Confirm Delivery & Complete"}
                                            </Button>
                                        </Box>
                                    )}

                                    {/* DELIVERED */}
                                    {isDelivered && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(to bottom right, rgba(20, 83, 45, 0.3), rgba(22, 101, 52, 0.1))",
                                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <Trophy size={20} weight="duotone" style={{ color: "#22c55e" }} />
                                                <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#22c55e" }}>Project Delivered Successfully!</Box>
                                            </Box>

                                            {assignment.deliveryFiles?.length > 0 && (
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                                                    {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                        <Box
                                                            key={idx}
                                                            onClick={() => handleDownload(file.filePath, file.fileName)}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 0.5,
                                                                px: 1.5,
                                                                py: 0.75,
                                                                bgcolor: "rgba(51, 65, 85, 0.5)",
                                                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                                                borderRadius: "6px",
                                                                fontSize: "11px",
                                                                color: "#94a3b8",
                                                                cursor: "pointer",
                                                                "&:hover": { bgcolor: "rgba(51, 65, 85, 0.8)", color: "#f8fafc" },
                                                            }}
                                                        >
                                                            <DownloadSimple size={14} />
                                                            {file.fileName}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                {!assignment.feedback?.submitted && (
                                                    <Button
                                                        onClick={() => { setSelectedProject(assignment); setFeedbackModal(true); }}
                                                        startIcon={<Star size={18} />}
                                                        sx={{
                                                            bgcolor: "#334155",
                                                            color: "#f8fafc",
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: "6px",
                                                            fontWeight: 600,
                                                            fontSize: "12px",
                                                            textTransform: "uppercase",
                                                            "&:hover": { bgcolor: "#475569" },
                                                        }}
                                                    >
                                                        Leave Feedback
                                                    </Button>
                                                )}
                                                {assignment.invoice?.url && (
                                                    <Button
                                                        onClick={() => handleDownload(assignment.invoice.url, `Invoice_${assignment.invoice.invoiceNumber}.pdf`)}
                                                        startIcon={<FileDoc size={18} />}
                                                        sx={{
                                                            bgcolor: "#334155",
                                                            color: "#f8fafc",
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: "6px",
                                                            fontWeight: 600,
                                                            fontSize: "12px",
                                                            textTransform: "uppercase",
                                                            "&:hover": { bgcolor: "#475569" },
                                                        }}
                                                    >
                                                        Download Invoice
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Requirement Modal */}
            <Dialog
                open={requirementModal}
                onClose={() => setRequirementModal(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
                    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, borderBottom: "1px solid rgba(71, 85, 105, 0.5)" }}>
                    <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Submit Requirements
                    </Box>
                    <X size={20} style={{ color: "#64748b", cursor: "pointer" }} onClick={() => setRequirementModal(false)} />
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        select
                        label="Project Type"
                        value={requirementForm.projectType}
                        onChange={(e) => setRequirementForm({ ...requirementForm, projectType: e.target.value })}
                        fullWidth
                        sx={inputStyles}
                    >
                        {projectTypeOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value} sx={{ bgcolor: "#1e293b", color: "#f8fafc", "&:hover": { bgcolor: "#334155" } }}>
                                {opt.label}
                            </MenuItem>
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
                        sx={inputStyles}
                    />
                    <TextField
                        label="Additional Notes"
                        value={requirementForm.notes}
                        onChange={(e) => setRequirementForm({ ...requirementForm, notes: e.target.value })}
                        fullWidth
                        multiline
                        rows={2}
                        sx={inputStyles}
                    />

                    <Box
                        component="label"
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            p: 2,
                            border: "2px dashed #475569",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": { borderColor: "#64748b", bgcolor: "rgba(51, 65, 85, 0.3)" },
                        }}
                    >
                        <UploadSimple size={24} style={{ color: "#64748b", marginBottom: 8 }} />
                        <Box sx={{ fontSize: "13px", color: "#94a3b8" }}>Upload Guidelines/Docs (optional)</Box>
                        <input type="file" multiple hidden onChange={(e) => { if (e.target.files) setRequirementFiles(Array.from(e.target.files)); }} />
                    </Box>
                    {requirementFiles.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {requirementFiles.map((file, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        px: 1.5,
                                        py: 0.5,
                                        bgcolor: "rgba(51, 65, 85, 0.5)",
                                        borderRadius: "6px",
                                        fontSize: "11px",
                                        color: "#94a3b8",
                                    }}
                                >
                                    {file.name}
                                    <X
                                        size={12}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            const newFiles = [...requirementFiles];
                                            newFiles.splice(idx, 1);
                                            setRequirementFiles(newFiles);
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
                <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                    <Button onClick={() => setRequirementModal(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "6px", fontWeight: 500, fontSize: "13px", "&:hover": { bgcolor: "#475569" } }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => submitRequirementMutation.mutate(selectedProject._id)}
                        disabled={submitRequirementMutation.isPending}
                        sx={{
                            bgcolor: "#ec4899",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#db2777" },
                            "&:disabled": { opacity: 0.5 },
                        }}
                    >
                        {submitRequirementMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Proof Modal */}
            <Dialog
                open={paymentProofModal}
                onClose={() => setPaymentProofModal(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
                    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, borderBottom: "1px solid rgba(71, 85, 105, 0.5)" }}>
                    <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Upload Payment Proof
                    </Box>
                    <X size={20} style={{ color: "#64748b", cursor: "pointer" }} onClick={() => setPaymentProofModal(false)} />
                </Box>
                <Box sx={{ p: 3 }}>
                    <Alert
                        severity="info"
                        sx={{ mb: 2, bgcolor: "rgba(30, 58, 138, 0.2)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.3)", "& .MuiAlert-icon": { color: "#3b82f6" } }}
                    >
                        Upload screenshot for <strong>{selectedProject?.itemId?.title}</strong>
                        <br />Amount: <strong>₹{selectedProject?.payment?.amount}</strong>
                    </Alert>

                    <Box
                        component="label"
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 100,
                            border: "2px dashed #475569",
                            borderRadius: "6px",
                            cursor: "pointer",
                            mb: 2,
                            transition: "all 0.2s",
                            "&:hover": { borderColor: "#64748b", bgcolor: "rgba(51, 65, 85, 0.3)" },
                        }}
                    >
                        <UploadSimple size={32} style={{ color: "#64748b", marginBottom: 8 }} />
                        <Box sx={{ fontSize: "13px", color: "#94a3b8" }}>{paymentProofFile ? paymentProofFile.name : "Click to upload proof"}</Box>
                        <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)} />
                    </Box>

                    <TextField
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        fullWidth
                        SelectProps={{ native: true }}
                        sx={{ ...inputStyles, mb: 2 }}
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
                        sx={inputStyles}
                    />
                </Box>
                <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                    <Button onClick={() => setPaymentProofModal(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "6px", fontWeight: 500, fontSize: "13px", "&:hover": { bgcolor: "#475569" } }}>
                        Cancel
                    </Button>
                    <Button
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
                        sx={{
                            bgcolor: "#ef4444",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#dc2626" },
                            "&:disabled": { opacity: 0.5 },
                        }}
                    >
                        {paymentProofMutation.isPending ? "Uploading..." : "Submit Proof"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Modal */}
            <Dialog
                open={feedbackModal}
                onClose={() => setFeedbackModal(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
                    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, borderBottom: "1px solid rgba(71, 85, 105, 0.5)" }}>
                    <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Leave Feedback
                    </Box>
                    <X size={20} style={{ color: "#64748b", cursor: "pointer" }} onClick={() => setFeedbackModal(false)} />
                </Box>
                <Box sx={{ p: 3 }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Box sx={{ color: "#94a3b8", fontSize: "14px", mb: 1 }}>How was your experience?</Box>
                        <Rating
                            value={feedbackForm.rating}
                            onChange={(_, value) => setFeedbackForm({ ...feedbackForm, rating: value || 0 })}
                            size="large"
                            sx={{
                                "& .MuiRating-iconFilled": { color: "#f59e0b" },
                                "& .MuiRating-iconEmpty": { color: "#475569" },
                            }}
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
                        sx={inputStyles}
                    />
                </Box>
                <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                    <Button onClick={() => setFeedbackModal(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "6px", fontWeight: 500, fontSize: "13px", "&:hover": { bgcolor: "#475569" } }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => submitFeedbackMutation.mutate(selectedProject._id)}
                        disabled={!feedbackForm.rating || submitFeedbackMutation.isPending}
                        sx={{
                            bgcolor: "#f59e0b",
                            color: "#0f172a",
                            px: 3,
                            py: 1,
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#d97706" },
                            "&:disabled": { opacity: 0.5 },
                        }}
                    >
                        {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyProjects;
