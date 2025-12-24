import { Box, Typography, Card, CardContent, Button, Divider, CircularProgress, Alert } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useGetPaymentSettings } from "../../Hooks/payment";
import { MdPayment, MdAccountBalance, MdQrCode2, MdArrowBack, MdContentCopy } from "react-icons/md";
import { primaryButtonStyle, outlinedButtonStyle } from "../../assets/Styles/ButtonStyles";
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
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto", textAlign: "center" }}>
                <Alert severity="error" sx={{ fontFamily: "Regular_W" }}>Invalid payment link</Alert>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress sx={{ color: "var(--webprimary)" }} />
            </Box>
        );
    }

    const assignment = myCoursesData?.find((a: any) => a._id === assignmentId) || null;

    if (!assignment) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto" }}>
                <Alert severity="error" sx={{ fontFamily: "Regular_W" }}>
                    Assignment not found or you are not authorized to view it.
                </Alert>
                <Button
                    startIcon={<MdArrowBack />}
                    onClick={() => navigate('/student/my-projects')}
                    sx={{ mt: 2, fontFamily: "Medium_W", textTransform: "none" }}
                >
                    Back to Projects
                </Button>
            </Box>
        );
    }

    const amount = assignment.payment?.advanceAmount || assignment.payment?.finalAmount || assignment.payment?.amount || 0;
    const itemName = assignment.itemId?.title || assignment.itemId?.name || "Item";

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto" }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<MdArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{
                        fontFamily: "Medium_W",
                        fontSize: "13px",
                        textTransform: "none",
                        color: "var(--greyText)",
                        mb: 2,
                        "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                >
                    Go Back
                </Button>
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
                    Complete Payment
                </Typography>
                <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                    Pay for: <strong>{itemName}</strong>
                </Typography>
            </Box>

            {/* Amount Card */}
            <Card sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                overflow: "hidden",
                mb: 3,
            }}>
                <Box sx={{
                    background: "linear-gradient(135deg, var(--webprimary), #8b5cf6)",
                    p: 3,
                    textAlign: "center",
                }}>
                    <Typography sx={{ fontFamily: "Medium_W", fontSize: "12px", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 1 }}>
                        Amount Due
                    </Typography>
                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "42px", color: "#fff", mt: 1 }}>
                        ₹{amount.toLocaleString()}
                    </Typography>
                </Box>
            </Card>

            {/* Payment Options */}
            <Card sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                overflow: "hidden",
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MdPayment size={20} color="var(--webprimary)" />
                        </Box>
                        <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "var(--title)" }}>
                            Payment Options
                        </Typography>
                    </Box>

                    {/* Bank Transfer */}
                    {paymentSettings?.enableBankTransfer && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <MdAccountBalance size={18} color="var(--webprimary)" />
                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "14px", color: "var(--title)" }}>
                                    Bank Transfer
                                </Typography>
                            </Box>
                            <Box sx={{
                                bgcolor: "#f8fafc",
                                borderRadius: "8px",
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                            }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Account Holder
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--title)" }}>
                                            {paymentSettings.bankDetails?.accountHolderName || "-"}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Account Number
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--title)" }}>
                                            {paymentSettings.bankDetails?.accountNumber || "-"}
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<MdContentCopy size={14} />}
                                        onClick={() => copyToClipboard(paymentSettings.bankDetails?.accountNumber || "", "Account number")}
                                        sx={{ fontFamily: "Medium_W", fontSize: "11px", textTransform: "none" }}
                                    >
                                        Copy
                                    </Button>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>
                                            Bank & IFSC
                                        </Typography>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--title)" }}>
                                            {paymentSettings.bankDetails?.bankName || "-"} | {paymentSettings.bankDetails?.ifsc || "-"}
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<MdContentCopy size={14} />}
                                        onClick={() => copyToClipboard(paymentSettings.bankDetails?.ifsc || "", "IFSC code")}
                                        sx={{ fontFamily: "Medium_W", fontSize: "11px", textTransform: "none" }}
                                    >
                                        Copy
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {paymentSettings?.enableBankTransfer && paymentSettings?.enableUPI && <Divider sx={{ my: 2 }} />}

                    {/* UPI */}
                    {paymentSettings?.enableUPI && (
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <MdQrCode2 size={18} color="#8b5cf6" />
                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "14px", color: "var(--title)" }}>
                                    UPI Payment
                                </Typography>
                            </Box>
                            <Box sx={{
                                bgcolor: "#f8fafc",
                                borderRadius: "8px",
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                flexWrap: "wrap",
                            }}>
                                <Box sx={{ flex: 1, minWidth: 150 }}>
                                    <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase", mb: 0.5 }}>
                                        UPI ID
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--title)" }}>
                                            {paymentSettings.upiId || "-"}
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<MdContentCopy size={14} />}
                                            onClick={() => copyToClipboard(paymentSettings.upiId || "", "UPI ID")}
                                            sx={{ fontFamily: "Medium_W", fontSize: "11px", textTransform: "none" }}
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
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0",
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: "wrap" }}>
                {paymentSettings?.qrUrl && (
                    <Button
                        variant="contained"
                        onClick={() => window.open(paymentSettings.qrUrl, '_blank')}
                        sx={{ ...primaryButtonStyle }}
                    >
                        Open QR in New Tab
                    </Button>
                )}
                <Button
                    variant="outlined"
                    startIcon={<MdArrowBack />}
                    onClick={() => navigate('/student/my-projects')}
                    sx={{ ...outlinedButtonStyle }}
                >
                    Back to Projects
                </Button>
            </Box>
        </Box>
    );
};

export default Pay;
