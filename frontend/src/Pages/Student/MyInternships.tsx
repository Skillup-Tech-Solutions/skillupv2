import { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    TextField,
    Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useGetPaymentSettings, useUploadPaymentProof } from "../../Hooks/payment";
import PaymentVerifying from "../../Components/PaymentVerifying";
import {
    Briefcase,
    DownloadSimple,
    UploadSimple,
    CreditCard,
    Clock,
    User,
    CalendarBlank,
    CheckCircle,
    CaretDown,
    ClockCounterClockwise,
    File,
    X,
    Sparkle,
    Trophy,
    Buildings,
    FileText,
} from "@phosphor-icons/react";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import config from "../../Config/Config";
import { downloadFileAsBlob } from "../../utils/normalizeUrl";

const MyInternships = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();

    const [selectedInternship, setSelectedInternship] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");
    const [expandedSubmissions, setExpandedSubmissions] = useState<string | null>(null);

    // Payment proof upload state
    const [paymentProofModal, setPaymentProofModal] = useState(false);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const paymentProofMutation = useUploadPaymentProof();

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-internships"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-internships`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const { data: paymentSettings } = useGetPaymentSettings();

    const uploadMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            if (uploadFile) formData.append("file", uploadFile);
            formData.append("notes", notes);

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/internships/${selectedInternship._id}/upload-assignment`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assignment uploaded successfully");
            queryClient.invalidateQueries({ queryKey: ["my-internships"] });
            setUploadModal(false);
            setUploadFile(null);
            setNotes("");
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload"),
    });

    const handleDownload = (path: string, filename: string) => {
        downloadFileAsBlob(path, filename).catch(() =>
            CustomSnackBar.errorSnackbar("Download failed")
        );
    };

    // Get current step for progress stepper
    const getActiveStep = (assignment: any) => {
        const status = assignment.status;
        const paymentStatus = assignment.payment?.status;
        const paymentRequired = assignment.payment?.required;

        if (status === "completed") return 4;
        if (status === "in-progress" || status === "assigned" && !paymentRequired) return 2;
        if (paymentStatus === "paid") return 2;
        if (paymentStatus === "pending") return 1;
        return 0;
    };

    // Progress steps
    const progressSteps = ["Enrolled", "Payment", "Working", "Completed"];

    // Get status badge - using frontend-ref colors
    const getStatusBadge = (assignment: any) => {
        const status = assignment.status;
        const paymentStatus = assignment.payment?.status;

        if (status === "completed") {
            return { label: "Completed", color: "#22c55e", bg: "rgba(22, 101, 52, 0.3)", border: "rgba(34, 197, 94, 0.5)" };
        }
        if (paymentStatus === "pending") {
            if (assignment.payment?.proofFile || assignment.payment?.proofUploadedAt) {
                return { label: "Payment Verifying", color: "#f59e0b", bg: "rgba(120, 53, 15, 0.3)", border: "rgba(245, 158, 11, 0.5)" };
            }
            return { label: "Payment Required", color: "#ef4444", bg: "rgba(127, 29, 29, 0.3)", border: "rgba(239, 68, 68, 0.5)" };
        }
        if (status === "in-progress") {
            return { label: "In Progress", color: "#3b82f6", bg: "rgba(30, 58, 138, 0.3)", border: "rgba(59, 130, 246, 0.5)" };
        }
        return { label: "Enrolled", color: "#a855f7", bg: "rgba(88, 28, 135, 0.3)", border: "rgba(168, 85, 247, 0.5)" };
    };

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: "#0f172a",
            color: "#f8fafc",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            borderRadius: "8px",
            "& fieldset": { borderColor: "#475569" },
            "&:hover fieldset": { borderColor: "#64748b" },
            "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
        },
        "& .MuiInputLabel-root": { color: "#64748b", fontFamily: "'Inter', sans-serif", fontSize: "14px" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
        "& .MuiSelect-icon": { color: "#64748b" },
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
                            borderTopColor: "#a855f7",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                        }}
                    />
                </Box>
                <Box sx={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Loading Internships...
                </Box>
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
                    Failed to load internships. Please try again.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
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
                    <Briefcase size={28} weight="duotone" color="#a855f7" />
                    My Internships
                </Box>
                <Box component="p" sx={{ color: "#64748b", mt: 1, fontSize: "14px" }}>
                    Track your internship progress and manage submissions
                </Box>
            </Box>

            {!data || data.length === 0 ? (
                <Box
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "12px",
                        p: 6,
                        textAlign: "center",
                    }}
                >
                    <Briefcase size={48} weight="duotone" style={{ color: "#475569", marginBottom: 16 }} />
                    <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>No internships yet!</Box>
                    <Box sx={{ color: "#64748b", fontSize: "14px" }}>Contact admin to get enrolled in internships.</Box>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((assignment: any) => {
                        const internship = assignment.itemId;
                        const statusBadge = getStatusBadge(assignment);
                        const isCompleted = assignment.status === "completed";
                        const paymentPending = assignment.payment?.status === "pending";
                        const canUpload = assignment.status === "in-progress" && !paymentPending;
                        const activeStep = getActiveStep(assignment);

                        return (
                            <Box
                                key={assignment._id}
                                sx={{
                                    bgcolor: "rgba(30, 41, 59, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.6)",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Internship Header */}
                                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
                                    {/* Internship Image */}
                                    {internship?.fileupload && (
                                        <Box
                                            component="img"
                                            src={`${config.BASE_URL_MAIN}/uploads/${internship.fileupload}`}
                                            alt={internship?.title}
                                            sx={{
                                                width: { xs: "100%", sm: 200 },
                                                height: { xs: 150, sm: 180 },
                                                objectFit: "cover",
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}

                                    {/* Internship Info */}
                                    <Box sx={{ flex: 1, p: 3 }}>
                                        {/* Status Badge */}
                                        <Box sx={{ mb: 2 }}>
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: "8px",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                    bgcolor: statusBadge.bg,
                                                    color: statusBadge.color,
                                                    border: `1px solid ${statusBadge.border}`,
                                                }}
                                            >
                                                {statusBadge.label}
                                            </Box>
                                        </Box>

                                        {/* Internship Title */}
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
                                            {internship?.title || "Untitled Internship"}
                                        </Box>

                                        {/* Internship Meta */}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                                            {internship?.company && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8", fontSize: "12px" }}>
                                                    <Buildings size={14} weight="duotone" />
                                                    {internship.company}
                                                </Box>
                                            )}
                                            {internship?.duration && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8", fontSize: "12px" }}>
                                                    <Clock size={14} weight="duotone" />
                                                    {internship.duration}
                                                </Box>
                                            )}
                                            {internship?.startDate && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8", fontSize: "12px" }}>
                                                    <CalendarBlank size={14} weight="duotone" />
                                                    {new Date(internship.startDate).toLocaleDateString()}
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Description */}
                                        {internship?.description && (
                                            <Box
                                                sx={{
                                                    color: "#64748b",
                                                    fontSize: "13px",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {internship.description}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {/* Progress Stepper */}
                                <Box sx={{ p: 2, bgcolor: "rgba(15, 23, 42, 0.5)", borderTop: "1px solid rgba(71, 85, 105, 0.4)", borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        {progressSteps.map((label, idx) => (
                                            <Box key={label} sx={{ display: "flex", alignItems: "center", flex: idx < progressSteps.length - 1 ? 1 : "none" }}>
                                                <Box sx={{ textAlign: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: "50%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            mx: "auto",
                                                            mb: 0.5,
                                                            ...(idx < activeStep
                                                                ? { bgcolor: "#22c55e", color: "#fff" }
                                                                : idx === activeStep
                                                                    ? { bgcolor: "#a855f7", color: "#fff" }
                                                                    : { bgcolor: "#334155", color: "#64748b" }),
                                                        }}
                                                    >
                                                        {idx < activeStep ? <CheckCircle size={16} weight="fill" /> : idx + 1}
                                                    </Box>
                                                    <Box sx={{ fontSize: "10px", color: idx <= activeStep ? "#f8fafc" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                        {label}
                                                    </Box>
                                                </Box>
                                                {idx < progressSteps.length - 1 && (
                                                    <Box sx={{ flex: 1, height: 2, bgcolor: idx < activeStep ? "#22c55e" : "#334155", mx: 1 }} />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Action Section */}
                                <Box sx={{ p: 3 }}>
                                    {/* PAYMENT REQUIRED */}
                                    {paymentPending && !assignment.payment?.proofFile && !assignment.payment?.proofUploadedAt && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(135deg, rgba(127, 29, 29, 0.2) 0%, rgba(127, 29, 29, 0.1) 100%)",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "12px",
                                                mb: 2,
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <CreditCard size={20} weight="duotone" style={{ color: "#ef4444" }} />
                                                <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#ef4444" }}>Payment Required</Box>
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 3,
                                                    p: 2,
                                                    bgcolor: "rgba(15, 23, 42, 0.5)",
                                                    borderRadius: "8px",
                                                    mb: 2,
                                                }}
                                            >
                                                <Box>
                                                    <Box sx={{ fontSize: "12px", color: "#94a3b8" }}>Amount</Box>
                                                    <Box sx={{ fontSize: "24px", fontWeight: 700, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
                                                        ₹{assignment.payment?.amount || 0}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Payment Details */}
                                            {paymentSettings && (
                                                <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "8px" }}>
                                                    <Box sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>Payment Options:</Box>
                                                    {paymentSettings.enableBankTransfer && (
                                                        <Box sx={{ mb: 1 }}>
                                                            <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bank Transfer</Box>
                                                            <Box sx={{ fontSize: "12px", color: "#94a3b8" }}>
                                                                {paymentSettings.bankDetails?.accountHolderName} | A/C: {paymentSettings.bankDetails?.accountNumber} | IFSC: {paymentSettings.bankDetails?.ifsc}
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
                                                                <Box component="img" src={paymentSettings.qrUrl} alt="QR" sx={{ width: 60, borderRadius: "8px" }} />
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            <Button
                                                fullWidth
                                                onClick={() => { setSelectedInternship(assignment); setPaymentProofModal(true); }}
                                                startIcon={<UploadSimple size={18} />}
                                                sx={{
                                                    bgcolor: "#ef4444",
                                                    color: "#fff",
                                                    py: 1.2,
                                                    borderRadius: "8px",
                                                    fontWeight: 600,
                                                    fontSize: "13px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                    "&:hover": { bgcolor: "#dc2626" },
                                                }}
                                            >
                                                Upload Payment Screenshot
                                            </Button>
                                        </Box>
                                    )}

                                    {/* PAYMENT VERIFYING */}
                                    {paymentPending && (assignment.payment?.proofFile || assignment.payment?.proofUploadedAt) && (
                                        <PaymentVerifying onReupload={() => { setSelectedInternship(assignment); setPaymentProofModal(true); }} />
                                    )}

                                    {/* IN PROGRESS */}
                                    {canUpload && (
                                        <Button
                                            onClick={() => { setSelectedInternship(assignment); setUploadModal(true); }}
                                            startIcon={<UploadSimple size={18} />}
                                            sx={{
                                                bgcolor: "#a855f7",
                                                color: "#fff",
                                                py: 1,
                                                px: 3,
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                fontSize: "13px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                "&:hover": { bgcolor: "#9333ea" },
                                            }}
                                        >
                                            Submit Work
                                        </Button>
                                    )}

                                    {/* COMPLETED */}
                                    {isCompleted && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(135deg, rgba(22, 101, 52, 0.2) 0%, rgba(22, 101, 52, 0.1) 100%)",
                                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                                borderRadius: "12px",
                                                mb: 2,
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <Trophy size={20} weight="duotone" style={{ color: "#22c55e" }} />
                                                <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#22c55e" }}>Internship Completed!</Box>
                                            </Box>
                                            <Box sx={{ color: "#94a3b8", fontSize: "13px", mb: 2 }}>Congratulations! Download your certificate below.</Box>
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                {assignment.certificate?.url && (
                                                    <Button
                                                        onClick={() => handleDownload(assignment.certificate.url, "Certificate.pdf")}
                                                        startIcon={<DownloadSimple size={18} />}
                                                        sx={{
                                                            bgcolor: "#22c55e",
                                                            color: "#fff",
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: "8px",
                                                            fontWeight: 600,
                                                            fontSize: "12px",
                                                            textTransform: "uppercase",
                                                            "&:hover": { bgcolor: "#16a34a" },
                                                        }}
                                                    >
                                                        Download Certificate
                                                    </Button>
                                                )}
                                                {assignment.invoice?.url && (
                                                    <Button
                                                        onClick={() => handleDownload(assignment.invoice.url, `Invoice_${assignment.invoice.invoiceNumber}.pdf`)}
                                                        startIcon={<FileText size={18} />}
                                                        sx={{
                                                            bgcolor: "#334155",
                                                            color: "#f8fafc",
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: "8px",
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

                                    {/* ENROLLED */}
                                    {assignment.status === "assigned" && !paymentPending && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: "linear-gradient(135deg, rgba(88, 28, 135, 0.2) 0%, rgba(88, 28, 135, 0.1) 100%)",
                                                border: "1px solid rgba(168, 85, 247, 0.3)",
                                                borderRadius: "12px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#a855f7" }}>You're Enrolled!</Box>
                                            <Box sx={{ color: "#94a3b8", fontSize: "13px" }}>Your internship will start soon. Check back for updates.</Box>
                                        </Box>
                                    )}

                                    {/* MY SUBMISSIONS SECTION */}
                                    {assignment.internshipSubmissions?.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Box
                                                onClick={() => setExpandedSubmissions(expandedSubmissions === assignment._id ? null : assignment._id)}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    p: 2,
                                                    bgcolor: "rgba(15, 23, 42, 0.5)",
                                                    border: "1px solid rgba(71, 85, 105, 0.4)",
                                                    borderRadius: expandedSubmissions === assignment._id ? "8px 8px 0 0" : "8px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#a855f7", fontSize: "13px", fontWeight: 600 }}>
                                                    <ClockCounterClockwise size={18} weight="duotone" />
                                                    My Submissions ({assignment.internshipSubmissions.length})
                                                </Box>
                                                <CaretDown
                                                    size={18}
                                                    style={{
                                                        color: "#64748b",
                                                        transform: expandedSubmissions === assignment._id ? "rotate(180deg)" : "rotate(0deg)",
                                                        transition: "transform 0.2s",
                                                    }}
                                                />
                                            </Box>
                                            {expandedSubmissions === assignment._id && (
                                                <Box sx={{ bgcolor: "rgba(15, 23, 42, 0.3)", border: "1px solid rgba(71, 85, 105, 0.4)", borderTop: "none", borderRadius: "0 0 8px 8px" }}>
                                                    {assignment.internshipSubmissions.map((sub: any, idx: number) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                p: 2,
                                                                borderTop: idx > 0 ? "1px solid rgba(71, 85, 105, 0.4)" : "none",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                            }}
                                                        >
                                                            <Box>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#f8fafc", fontSize: "13px", fontWeight: 500 }}>
                                                                    <File size={16} weight="duotone" style={{ color: "#64748b" }} />
                                                                    {sub.fileName}
                                                                </Box>
                                                                <Box sx={{ fontSize: "11px", color: "#64748b", mt: 0.5 }}>
                                                                    Submitted: {new Date(sub.uploadedAt).toLocaleString()}
                                                                </Box>
                                                                {sub.notes && (
                                                                    <Box sx={{ fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>Notes: {sub.notes}</Box>
                                                                )}
                                                            </Box>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleDownload(sub.filePath, sub.fileName)}
                                                                startIcon={<DownloadSimple size={14} />}
                                                                sx={{ color: "#a855f7", fontSize: "11px", fontWeight: 500 }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    {/* Delivery Files */}
                                    {assignment.deliveryFiles?.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#f8fafc", fontSize: "13px", fontWeight: 600, mb: 1 }}>
                                                <DownloadSimple size={16} weight="duotone" />
                                                Internship Materials
                                            </Box>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                                                            borderRadius: "8px",
                                                            fontSize: "11px",
                                                            color: "#94a3b8",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s",
                                                            "&:hover": { bgcolor: "rgba(51, 65, 85, 0.8)", color: "#f8fafc" },
                                                        }}
                                                    >
                                                        <DownloadSimple size={14} />
                                                        {file.fileName}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Upload Assignment Modal */}
            <Dialog
                open={uploadModal}
                onClose={() => setUploadModal(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        bgcolor: "#1e293b",
                        border: "1px solid rgba(71, 85, 105, 0.5)",
                        borderRadius: "12px",
                    },
                    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, borderBottom: "1px solid rgba(71, 85, 105, 0.5)" }}>
                    <Box sx={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Submit Work
                    </Box>
                    <X size={20} style={{ color: "#64748b", cursor: "pointer" }} onClick={() => setUploadModal(false)} />
                </Box>
                <Box sx={{ p: 3 }}>
                    <Alert
                        severity="info"
                        sx={{ mb: 2, bgcolor: "rgba(88, 28, 135, 0.2)", color: "#a855f7", border: "1px solid rgba(168, 85, 247, 0.3)", "& .MuiAlert-icon": { color: "#a855f7" } }}
                    >
                        Upload your work for <strong>{selectedInternship?.itemId?.title}</strong>
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
                            borderRadius: "8px",
                            cursor: "pointer",
                            mb: 2,
                            transition: "all 0.2s",
                            "&:hover": { borderColor: "#64748b", bgcolor: "rgba(51, 65, 85, 0.3)" },
                        }}
                    >
                        <UploadSimple size={32} style={{ color: "#64748b", marginBottom: 8 }} />
                        <Box sx={{ fontSize: "13px", color: "#94a3b8" }}>{uploadFile ? uploadFile.name : "Click to select file"}</Box>
                        <input type="file" hidden onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                    </Box>

                    <TextField
                        label="Notes (Optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        sx={inputStyles}
                    />
                </Box>
                <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                    <Button onClick={() => setUploadModal(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "8px", fontWeight: 500, fontSize: "13px", "&:hover": { bgcolor: "#475569" } }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => uploadMutation.mutate()}
                        disabled={!uploadFile || uploadMutation.isPending}
                        sx={{
                            bgcolor: "#a855f7",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#9333ea" },
                            "&:disabled": { opacity: 0.5 },
                        }}
                    >
                        {uploadMutation.isPending ? "Uploading..." : "Submit"}
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
                    "& .MuiDialog-paper": {
                        bgcolor: "#1e293b",
                        border: "1px solid rgba(71, 85, 105, 0.5)",
                        borderRadius: "12px",
                    },
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
                        Upload screenshot for <strong>{selectedInternship?.itemId?.title}</strong>
                        <br />Amount: <strong>₹{selectedInternship?.payment?.amount}</strong>
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
                            borderRadius: "8px",
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
                        select
                        label="Payment Method"
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
                        <option value="other">Other</option>
                    </TextField>

                    <TextField
                        label="Transaction ID (Optional)"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        fullWidth
                        placeholder="e.g., UPI Ref No"
                        sx={inputStyles}
                    />
                </Box>
                <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                    <Button onClick={() => setPaymentProofModal(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "8px", fontWeight: 500, fontSize: "13px", "&:hover": { bgcolor: "#475569" } }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!paymentProofFile || !selectedInternship) return;
                            const formData = new FormData();
                            formData.append("proofFile", paymentProofFile);
                            if (paymentMethod) formData.append("paymentMethod", paymentMethod);
                            if (transactionId) formData.append("transactionId", transactionId);

                            paymentProofMutation.mutate({
                                assignmentId: selectedInternship._id,
                                formData
                            }, {
                                onSuccess: () => {
                                    CustomSnackBar.successSnackbar("Payment proof uploaded!");
                                    queryClient.invalidateQueries({ queryKey: ["my-internships"] });
                                    setPaymentProofModal(false);
                                    setPaymentProofFile(null);
                                    setPaymentMethod("");
                                    setTransactionId("");
                                },
                                onError: (err: any) => {
                                    CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload");
                                }
                            });
                        }}
                        disabled={!paymentProofFile || paymentProofMutation.isPending}
                        sx={{
                            bgcolor: "#ef4444",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            borderRadius: "8px",
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
        </Box>
    );
};

export default MyInternships;
