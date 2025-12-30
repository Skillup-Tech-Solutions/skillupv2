import { useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Tooltip
} from "@mui/material";
import { MdVisibility, MdCheck, MdRefresh, MdReceipt, MdDownload } from "react-icons/md";
import { useGetPendingPayments, useMarkPaymentPaid, useGenerateInvoice } from "../../Hooks/payment";
import { openFileInNewTab, normalizeDownloadUrl } from "../../utils/normalizeUrl";
import CustomSnackBar from "../../Custom/CustomSnackBar";


interface Payment {
    _id: string;
    invoiceId: string;
    student: { _id: string; name: string; email: string };
    itemType: string;
    itemName: string;
    amount: number;
    paymentMethod: string | null;
    status: string;
    proofFile: string | null;
    proofUploadedAt: string | null;
    transactionId: string | null;
    paidAt: string | null;
    notes: string;
    assignedAt: string;
    assignmentStatus: string;
    invoice: {
        url: string;
        invoiceNumber: string;
        generatedAt: string;
    } | null;
}

const PaymentManagement = () => {
    const [statusFilter, setStatusFilter] = useState<string>("pending");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [markPaidModal, setMarkPaidModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [transactionId, setTransactionId] = useState("");

    const { data: payments, isLoading, error, refetch } = useGetPendingPayments({
        status: statusFilter,
        itemType: typeFilter || undefined
    });

    const markPaidMutation = useMarkPaymentPaid();
    const generateInvoiceMutation = useGenerateInvoice();

    const handleGenerateInvoice = (payment: Payment) => {
        generateInvoiceMutation.mutate(payment._id, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Invoice generated successfully");
                refetch();
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to generate invoice");
            }
        });
    };

    const handleDownloadInvoice = (url: string) => {
        window.open(normalizeDownloadUrl(url), "_blank");
    };

    const handleViewProof = (proofUrl: string) => {
        openFileInNewTab(proofUrl);
    };

    const handleOpenMarkPaid = (payment: Payment) => {
        setSelectedPayment(payment);
        setTransactionId(payment.transactionId || "");
        setMarkPaidModal(true);
    };

    const handleMarkPaid = () => {
        if (!selectedPayment) return;

        markPaidMutation.mutate({
            assignmentId: selectedPayment._id,
            transactionId: transactionId || undefined
        }, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Payment marked as paid successfully");
                setMarkPaidModal(false);
                setSelectedPayment(null);
                setTransactionId("");
                refetch(); // Refetch payments after marking one as paid
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to mark as paid");
            }
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "course": return "#3b82f6";
            case "project": return "#8b5cf6";
            case "internship": return "#10b981";
            default: return "#6b7280";
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Failed to load payments.</Alert>;
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 3, gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <MdReceipt size={28} style={{ color: "#60a5fa" }} />
                    <Typography sx={{ fontSize: { xs: "18px", md: "24px" }, fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Payment Management
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <FormControl size="small" sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { bgcolor: "rgba(15, 23, 42, 0.5)", color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" }, "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" } }, "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiSelect-icon": { color: "#64748b" } }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="proof-uploaded">Proof Uploaded</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { bgcolor: "rgba(15, 23, 42, 0.5)", color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" }, "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" } }, "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiSelect-icon": { color: "#64748b" } }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={typeFilter}
                            label="Type"
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="course">Course</MenuItem>
                            <MenuItem value="project">Project</MenuItem>
                            <MenuItem value="internship">Internship</MenuItem>
                        </Select>
                    </FormControl>

                    <IconButton onClick={() => refetch()} sx={{ color: "#94a3b8", border: "1px solid rgba(71, 85, 105, 0.4)", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } }}>
                        <MdRefresh />
                    </IconButton>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", overflowX: "auto" }}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#0f172a" }}>
                            <TableCell sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Invoice ID</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Source</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Student</TableCell>
                            <TableCell align="right" sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Amount</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Method</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Status</TableCell>
                            <TableCell align="center" sx={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderColor: "rgba(71, 85, 105, 0.4)" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Typography sx={{ color: "#64748b" }}>No payments found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {payments?.map((payment: Payment) => (
                            <TableRow key={payment._id} sx={{ "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } }}>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{payment.invoiceId}</Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                                        {new Date(payment.assignedAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: getTypeColor(payment.itemType) }}>
                                        {payment.itemType.charAt(0).toUpperCase() + payment.itemType.slice(1)}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", mt: 0.5 }}>
                                        {payment.itemName}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#f8fafc" }}>{payment.student?.name}</Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>{payment.student?.email}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#4ade80" }}>₹{payment.amount?.toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    {payment.paymentMethod ? (
                                        <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#60a5fa", textTransform: "uppercase" }}>{payment.paymentMethod}</Typography>
                                    ) : (
                                        <Typography sx={{ fontSize: "11px", color: "#64748b" }}>-</Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: payment.status === "paid" ? "#4ade80" : "#facc15" }}>
                                            {payment.status === "paid" ? "PAID" : "PENDING"}
                                        </Typography>
                                        {payment.proofFile && payment.status === "pending" && (
                                            <Typography sx={{ fontSize: "10px", color: "#60a5fa" }}>Proof Uploaded</Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }}>
                                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                                        {payment.proofFile && (
                                            <Tooltip title="View Proof">
                                                <IconButton size="small" onClick={() => handleViewProof(payment.proofFile!)} sx={{ color: "#60a5fa", "&:hover": { bgcolor: "rgba(96, 165, 250, 0.2)" } }}>
                                                    <MdVisibility />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {payment.status === "pending" && (
                                            <Button size="small" onClick={() => handleOpenMarkPaid(payment)} sx={{ bgcolor: "#22c55e", color: "#fff", fontSize: "11px", fontWeight: 600, borderRadius: "6px", px: 1.5, "&:hover": { bgcolor: "#16a34a" } }}>
                                                <MdCheck style={{ marginRight: 4 }} /> Mark Paid
                                            </Button>
                                        )}
                                        {payment.status === "paid" && !payment.invoice && (
                                            <Tooltip title="Generate Invoice">
                                                <Button size="small" onClick={() => handleGenerateInvoice(payment)} disabled={generateInvoiceMutation.isPending} sx={{ border: "1px solid rgba(71, 85, 105, 0.4)", color: "#60a5fa", fontSize: "11px", fontWeight: 600, borderRadius: "6px", px: 1.5, "&:hover": { bgcolor: "rgba(96, 165, 250, 0.1)" } }}>
                                                    <MdReceipt style={{ marginRight: 4 }} /> {generateInvoiceMutation.isPending ? "..." : "Generate"}
                                                </Button>
                                            </Tooltip>
                                        )}
                                        {payment.invoice?.url && (
                                            <Tooltip title="Download Invoice">
                                                <Button size="small" onClick={() => handleDownloadInvoice(payment.invoice!.url)} sx={{ bgcolor: "#8b5cf6", color: "#fff", fontSize: "11px", fontWeight: 600, borderRadius: "6px", px: 1.5, "&:hover": { bgcolor: "#7c3aed" } }}>
                                                    <MdDownload style={{ marginRight: 4 }} /> Invoice
                                                </Button>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Mark as Paid Modal */}
            <Dialog open={markPaidModal} onClose={() => setMarkPaidModal(false)} maxWidth="sm" fullWidth
                sx={{ "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" }, "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)" } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", color: "#f8fafc", fontFamily: "'Chivo', sans-serif" }}>Confirm Payment</DialogTitle>
                <DialogContent>
                    {selectedPayment && (
                        <Box sx={{ pt: 2 }}>
                            <Box sx={{ mb: 3, p: 2, bgcolor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "6px" }}>
                                <Typography sx={{ fontSize: "13px", color: "#f8fafc", mb: 1 }}>You are marking payment as <strong style={{ color: "#4ade80" }}>PAID</strong> for:</Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2, color: "#94a3b8", fontSize: "12px" }}>
                                    <li><strong>Student:</strong> {selectedPayment.student?.name}</li>
                                    <li><strong>Item:</strong> {selectedPayment.itemName} ({selectedPayment.itemType})</li>
                                    <li><strong>Amount:</strong> ₹{selectedPayment.amount?.toLocaleString()}</li>
                                </Box>
                            </Box>

                            <TextField
                                label="Transaction ID (Optional)"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                fullWidth
                                placeholder="Enter transaction/reference ID"
                                helperText="This will be recorded for reference"
                                sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(15, 23, 42, 0.5)", color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" }, "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" } }, "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiFormHelperText-root": { color: "#64748b" } }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Button onClick={() => setMarkPaidModal(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", borderRadius: "6px", "&:hover": { bgcolor: "#475569" } }}>Cancel</Button>
                    <Button onClick={handleMarkPaid} disabled={markPaidMutation.isPending} sx={{ bgcolor: "#22c55e", color: "#fff", borderRadius: "6px", fontWeight: 600, "&:hover": { bgcolor: "#16a34a" } }}>
                        {markPaidMutation.isPending ? "Processing..." : "Confirm & Mark Paid"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentManagement;
