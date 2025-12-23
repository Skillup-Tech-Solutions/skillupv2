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
    Chip,
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
import CustomSnackBar from "../../Custom/CustomSnackBar";
import { submitButtonStyle } from "../../assets/Styles/ButtonStyles";

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
    const [proofModal, setProofModal] = useState(false);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
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
        window.open(url, "_blank");
    };

    const handleViewProof = (proofUrl: string) => {
        setSelectedProof(proofUrl);
        setProofModal(true);
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
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">💳 Payment Management</Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
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

                    <FormControl size="small" sx={{ minWidth: 140 }}>
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

                    <IconButton onClick={() => refetch()} color="primary">
                        <MdRefresh />
                    </IconButton>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell><strong>Invoice ID</strong></TableCell>
                            <TableCell><strong>Source</strong></TableCell>
                            <TableCell><strong>Student</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                            <TableCell><strong>Method</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No payments found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {payments?.map((payment: Payment) => (
                            <TableRow key={payment._id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="600">{payment.invoiceId}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(payment.assignedAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={`${payment.itemType.charAt(0).toUpperCase() + payment.itemType.slice(1)}`}
                                        size="small"
                                        sx={{ bgcolor: getTypeColor(payment.itemType), color: "white", fontWeight: 500 }}
                                    />
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        {payment.itemName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="500">{payment.student?.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{payment.student?.email}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body1" fontWeight="bold">₹{payment.amount?.toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell>
                                    {payment.paymentMethod ? (
                                        <Chip label={payment.paymentMethod.toUpperCase()} size="small" variant="outlined" />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">-</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        <Chip
                                            label={payment.status === "paid" ? "PAID" : "PENDING"}
                                            size="small"
                                            color={payment.status === "paid" ? "success" : "warning"}
                                        />
                                        {payment.proofFile && payment.status === "pending" && (
                                            <Chip label="Proof Uploaded" size="small" color="info" variant="outlined" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                        {payment.proofFile && (
                                            <Tooltip title="View Proof">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleViewProof(payment.proofFile!)}
                                                >
                                                    <MdVisibility />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {payment.status === "pending" && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<MdCheck />}
                                                onClick={() => handleOpenMarkPaid(payment)}
                                            >
                                                Mark Paid
                                            </Button>
                                        )}
                                        {payment.status === "paid" && !payment.invoice && (
                                            <Tooltip title="Generate Invoice">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<MdReceipt />}
                                                    onClick={() => handleGenerateInvoice(payment)}
                                                    disabled={generateInvoiceMutation.isPending}
                                                >
                                                    {generateInvoiceMutation.isPending ? "..." : "Generate"}
                                                </Button>
                                            </Tooltip>
                                        )}
                                        {payment.invoice?.url && (
                                            <Tooltip title="Download Invoice">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="secondary"
                                                    startIcon={<MdDownload />}
                                                    onClick={() => handleDownloadInvoice(payment.invoice!.url)}
                                                >
                                                    Invoice
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

            {/* Proof View Modal */}
            <Dialog open={proofModal} onClose={() => setProofModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Payment Proof</DialogTitle>
                <DialogContent>
                    {selectedProof && (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            <img
                                src={selectedProof}
                                alt="Payment Proof"
                                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8, border: "1px solid #e5e7eb" }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProofModal(false)}>Close</Button>
                    {selectedProof && (
                        <Button
                            variant="contained"
                            onClick={() => window.open(selectedProof, "_blank")}
                        >
                            Open in New Tab
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Mark as Paid Modal */}
            <Dialog open={markPaidModal} onClose={() => setMarkPaidModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Payment</DialogTitle>
                <DialogContent>
                    {selectedPayment && (
                        <Box sx={{ pt: 2 }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                You are marking payment as <strong>PAID</strong> for:
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                                    <li><strong>Student:</strong> {selectedPayment.student?.name}</li>
                                    <li><strong>Item:</strong> {selectedPayment.itemName} ({selectedPayment.itemType})</li>
                                    <li><strong>Amount:</strong> ₹{selectedPayment.amount?.toLocaleString()}</li>
                                </Box>
                            </Alert>

                            <TextField
                                label="Transaction ID (Optional)"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                fullWidth
                                placeholder="Enter transaction/reference ID"
                                helperText="This will be recorded for reference"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setMarkPaidModal(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleMarkPaid}
                        disabled={markPaidMutation.isPending}
                        sx={submitButtonStyle}
                    >
                        {markPaidMutation.isPending ? "Processing..." : "Confirm & Mark Paid"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentManagement;
