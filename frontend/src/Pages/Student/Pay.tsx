import { Box, Button, Alert } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useGetPaymentSettings } from "../../Hooks/payment";
import {
    CreditCard,
    Bank,
    QrCode,
    ArrowLeft,
    Copy,
    Sparkle,
} from "@phosphor-icons/react";
import CustomSnackBar from "../../Custom/CustomSnackBar";

const Pay = () => {
    const [searchParams] = useSearchParams();
    const assignmentId = searchParams.get("assignmentId");
    const navigate = useNavigate();

    const token = Cookies.get("skToken");

    const { data: myCoursesData, isLoading } = useQuery({
        queryKey: ["my-courses-for-pay", assignmentId],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}student/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
        enabled: !!assignmentId
    });

    const { data: paymentSettings } = useGetPaymentSettings();

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        CustomSnackBar.successSnackbar(`${label} copied!`);
    };

    if (!assignmentId) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
                <Alert
                    severity="error"
                    sx={{ bgcolor: "rgba(127, 29, 29, 0.3)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.5)", "& .MuiAlert-icon": { color: "#ef4444" } }}
                >
                    Invalid payment link
                </Alert>
            </Box>
        );
    }

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
                            borderTopColor: "#3b82f6",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                        }}
                    />
                </Box>
                <Box sx={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Loading Payment...
                </Box>
            </Box>
        );
    }

    const assignment = myCoursesData?.find((a: any) => a._id === assignmentId) || null;

    if (!assignment) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
                <Alert
                    severity="error"
                    sx={{ bgcolor: "rgba(127, 29, 29, 0.3)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.5)", "& .MuiAlert-icon": { color: "#ef4444" } }}
                >
                    Assignment not found or you are not authorized to view it.
                </Alert>
                <Button
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => navigate('/student/my-projects')}
                    sx={{
                        mt: 2,
                        color: "#94a3b8",
                        fontSize: "13px",
                        "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" }
                    }}
                >
                    Back to Projects
                </Button>
            </Box>
        );
    }

    const amount = assignment.payment?.advanceAmount || assignment.payment?.finalAmount || assignment.payment?.amount || 0;
    const itemName = assignment.itemId?.title || assignment.itemId?.name || "Item";

    return (
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowLeft size={18} />}
                onClick={() => navigate(-1)}
                sx={{
                    mb: 3,
                    color: "#94a3b8",
                    fontSize: "13px",
                    "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" }
                }}
            >
                Go Back
            </Button>

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
                    <CreditCard size={28} weight="duotone" color="#3b82f6" />
                    Complete Payment
                </Box>
                <Box component="p" sx={{ color: "#64748b", mt: 1, fontSize: "14px" }}>
                    Pay for: <Box component="span" sx={{ color: "#f8fafc", fontWeight: 500 }}>{itemName}</Box>
                </Box>
            </Box>

            {/* Amount Card */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    borderRadius: "16px",
                    p: 4,
                    textAlign: "center",
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
                        right: -20,
                        top: -20,
                        color: "rgba(255,255,255,0.1)",
                    }}
                />
                <Box sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Amount Due
                </Box>
                <Box sx={{ fontFamily: "'Chivo', sans-serif", fontSize: "48px", fontWeight: 900, color: "#fff", mt: 1 }}>
                    ₹{amount.toLocaleString()}
                </Box>
            </Box>

            {/* Payment Options */}
            <Box
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "rgba(59, 130, 246, 0.2)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CreditCard size={20} weight="duotone" color="#3b82f6" />
                        </Box>
                        <Box sx={{ fontFamily: "'Chivo', sans-serif", fontSize: "16px", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Payment Options
                        </Box>
                    </Box>

                    {/* Bank Transfer */}
                    {paymentSettings?.enableBankTransfer && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <Bank size={18} weight="duotone" color="#3b82f6" />
                                <Box sx={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc" }}>Bank Transfer</Box>
                            </Box>
                            <Box
                                sx={{
                                    bgcolor: "rgba(15, 23, 42, 0.5)",
                                    borderRadius: "12px",
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        Account Holder
                                    </Box>
                                    <Box sx={{ fontSize: "14px", color: "#f8fafc" }}>
                                        {paymentSettings.bankDetails?.accountHolderName || "-"}
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                            Account Number
                                        </Box>
                                        <Box sx={{ fontSize: "14px", color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace" }}>
                                            {paymentSettings.bankDetails?.accountNumber || "-"}
                                        </Box>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<Copy size={14} />}
                                        onClick={() => copyToClipboard(paymentSettings.bankDetails?.accountNumber || "", "Account number")}
                                        sx={{ color: "#60a5fa", fontSize: "11px", fontWeight: 500 }}
                                    >
                                        Copy
                                    </Button>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                            Bank & IFSC
                                        </Box>
                                        <Box sx={{ fontSize: "14px", color: "#f8fafc" }}>
                                            {paymentSettings.bankDetails?.bankName || "-"} | <Box component="span" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{paymentSettings.bankDetails?.ifsc || "-"}</Box>
                                        </Box>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<Copy size={14} />}
                                        onClick={() => copyToClipboard(paymentSettings.bankDetails?.ifsc || "", "IFSC code")}
                                        sx={{ color: "#60a5fa", fontSize: "11px", fontWeight: 500 }}
                                    >
                                        Copy
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {paymentSettings?.enableBankTransfer && paymentSettings?.enableUPI && (
                        <Box sx={{ height: 1, bgcolor: "rgba(71, 85, 105, 0.4)", my: 3 }} />
                    )}

                    {/* UPI */}
                    {paymentSettings?.enableUPI && (
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <QrCode size={18} weight="duotone" color="#a855f7" />
                                <Box sx={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc" }}>UPI Payment</Box>
                            </Box>
                            <Box
                                sx={{
                                    bgcolor: "rgba(15, 23, 42, 0.5)",
                                    borderRadius: "12px",
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 150 }}>
                                    <Box sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        UPI ID
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ fontSize: "14px", color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace" }}>
                                            {paymentSettings.upiId || "-"}
                                        </Box>
                                        <Button
                                            size="small"
                                            startIcon={<Copy size={14} />}
                                            onClick={() => copyToClipboard(paymentSettings.upiId || "", "UPI ID")}
                                            sx={{ color: "#c084fc", fontSize: "11px", fontWeight: 500 }}
                                        >
                                            Copy
                                        </Button>
                                    </Box>
                                </Box>
                                {paymentSettings.qrUrl && (
                                    <Box
                                        component="img"
                                        src={paymentSettings.qrUrl}
                                        alt="QR Code"
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: "12px",
                                            border: "1px solid rgba(71, 85, 105, 0.6)",
                                            bgcolor: "#fff",
                                            p: 1,
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: "wrap" }}>
                {paymentSettings?.qrUrl && (
                    <Button
                        onClick={() => window.open(paymentSettings.qrUrl, '_blank')}
                        startIcon={<QrCode size={18} />}
                        sx={{
                            bgcolor: "#3b82f6",
                            color: "#fff",
                            px: 3,
                            py: 1,
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "uppercase",
                            "&:hover": { bgcolor: "#2563eb" },
                        }}
                    >
                        Open QR in New Tab
                    </Button>
                )}
                <Button
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => navigate('/student/my-projects')}
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
                    Back to Projects
                </Button>
            </Box>
        </Box>
    );
};

export default Pay;
