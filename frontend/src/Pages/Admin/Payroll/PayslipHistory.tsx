import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    MenuItem,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Tooltip,
    Grid
} from "@mui/material";
import { MdDownload, MdEmail, MdVisibility, MdReceipt, MdAttachMoney, MdCheckCircle, MdPending } from "react-icons/md";
import { useGetPayslipHistory, useSendPayslipEmail, useGetEmployees } from "../../../Hooks/employee";
import { useState, useMemo } from "react";
import CustomSnackBar from "../../../Custom/CustomSnackBar";
import Cookies from "js-cookie";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const STATUS_OPTIONS = ["All", "Draft", "Published", "Emailed"];

// Stats Card Component
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
    <Card sx={{ height: "100%", background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, border: `1px solid ${color}30` }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${color}20`,
                    color: color
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color={color}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

// Payslip Detail Modal Component
const PayslipDetailModal = ({ open, onClose, payslip }: { open: boolean; onClose: () => void; payslip: any }) => {
    if (!payslip) return null;

    const earnings = [
        { name: "Basic Pay", amount: payslip.basic || 0 },
        { name: "HRA", amount: payslip.hra || 0 },
        ...(payslip.allowances || [])
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <MdReceipt size={24} color="#6366f1" />
                    <Typography variant="h6" fontWeight="bold">Payslip Details</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {/* Employee Info */}
                <Box sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Employee Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Name</Typography>
                            <Typography fontWeight="500">{payslip.employee?.user?.name || "-"}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                            <Typography fontWeight="500">{payslip.employee?.employeeId || "-"}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Month/Year</Typography>
                            <Typography fontWeight="500">{payslip.month} {payslip.year}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Chip
                                label={payslip.status}
                                size="small"
                                color={payslip.status === "Emailed" ? "success" : payslip.status === "Published" ? "primary" : "default"}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Earnings & Deductions */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#10b981" }}>
                            Earnings
                        </Typography>
                        <Card variant="outlined">
                            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                {earnings.map((item, idx) => (
                                    <Box key={idx} display="flex" justifyContent="space-between" py={0.5}>
                                        <Typography variant="body2">{item.name}</Typography>
                                        <Typography variant="body2" fontWeight="500">Rs. {item.amount?.toLocaleString()}</Typography>
                                    </Box>
                                ))}
                                <Divider sx={{ my: 1 }} />
                                <Box display="flex" justifyContent="space-between">
                                    <Typography fontWeight="bold">Gross Earnings</Typography>
                                    <Typography fontWeight="bold" color="success.main">Rs. {payslip.grossEarnings?.toLocaleString()}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#ef4444" }}>
                            Deductions
                        </Typography>
                        <Card variant="outlined">
                            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                {(payslip.deductions || []).length > 0 ? (
                                    payslip.deductions.map((item: any, idx: number) => (
                                        <Box key={idx} display="flex" justifyContent="space-between" py={0.5}>
                                            <Typography variant="body2">{item.name}</Typography>
                                            <Typography variant="body2" fontWeight="500">Rs. {item.amount?.toLocaleString()}</Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No deductions</Typography>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box display="flex" justifyContent="space-between">
                                    <Typography fontWeight="bold">Total Deductions</Typography>
                                    <Typography fontWeight="bold" color="error.main">Rs. {payslip.totalDeductions?.toLocaleString()}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Net Pay */}
                <Box sx={{ mt: 3, p: 2, bgcolor: "#6366f1", borderRadius: 2, color: "white", textAlign: "center" }}>
                    <Typography variant="body2">Net Pay</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {payslip.netPay?.toLocaleString()}</Typography>
                </Box>

                {/* Additional Info */}
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", color: "text.secondary" }}>
                    <Typography variant="caption">
                        Generated: {payslip.generatedAt ? new Date(payslip.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </Typography>
                    <Typography variant="caption">
                        Attendance Days: {payslip.attendanceDays || 30}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const PayslipHistory = () => {
    const [filter, setFilter] = useState({ month: "", year: "", employeeId: "", status: "" });
    const { data: payslips, isLoading, refetch } = useGetPayslipHistory(filter.month, filter.year, filter.employeeId);
    const { data: employees } = useGetEmployees();
    const sendEmailMutation = useSendPayslipEmail();
    const [downloading, setDownloading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

    // Filter payslips by status locally if status filter is set
    const filteredPayslips = useMemo(() => {
        if (!payslips) return [];
        if (!filter.status || filter.status === "All") return payslips;
        return payslips.filter((p: any) => p.status === filter.status);
    }, [payslips, filter.status]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const data = filteredPayslips || [];
        return {
            total: data.length,
            totalNetPay: data.reduce((acc: number, p: any) => acc + (p.netPay || 0), 0),
            emailed: data.filter((p: any) => p.emailSent).length,
            pending: data.filter((p: any) => p.status === "Draft").length
        };
    }, [filteredPayslips]);

    const handleSendEmail = (id: string, type: "ATTACHMENT" | "LINK") => {
        sendEmailMutation.mutate({ payslipId: id, type }, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Email Sent Successfully");
                refetch();
            },
            onError: () => CustomSnackBar.errorSnackbar("Failed to send email")
        });
    };

    const handleDownload = async (payslipId: string) => {
        try {
            setDownloading(true);
            const token = Cookies.get("skToken");
            const downloadUrl = `${BASE_URL}admin/payroll/download/${payslipId}`;

            const newWindow = window.open();
            if (newWindow) {
                const response = await axios.get(downloadUrl, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/pdf"
                    },
                    responseType: 'blob'
                });

                const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                newWindow.location.href = blobUrl;
            }

            CustomSnackBar.successSnackbar("Opening PDF preview...");
        } catch (error: any) {
            console.error("Preview error:", error);
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to preview payslip");
        } finally {
            setDownloading(false);
        }
    };

    const handleViewDetails = (payslip: any) => {
        setSelectedPayslip(payslip);
        setDetailModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Emailed": return "success";
            case "Published": return "primary";
            default: return "default";
        }
    };

    const columns: GridColDef[] = [
        {
            field: "employeeId",
            headerName: "Emp ID",
            width: 100,
            valueGetter: (value, row) => row.employee?.employeeId || "-"
        },
        {
            field: "employeeName",
            headerName: "Employee",
            width: 160,
            valueGetter: (value, row) => row.employee?.user?.name || "-"
        },
        { field: "month", headerName: "Month", width: 100 },
        { field: "year", headerName: "Year", width: 80 },
        {
            field: "grossEarnings",
            headerName: "Gross",
            width: 110,
            renderCell: (params) => (
                <Typography variant="body2" color="success.main" fontWeight="500">
                    Rs. {params.value?.toLocaleString() || 0}
                </Typography>
            )
        },
        {
            field: "totalDeductions",
            headerName: "Deductions",
            width: 110,
            renderCell: (params) => (
                <Typography variant="body2" color="error.main" fontWeight="500">
                    Rs. {params.value?.toLocaleString() || 0}
                </Typography>
            )
        },
        {
            field: "netPay",
            headerName: "Net Pay",
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold" color="#6366f1">
                    Rs. {params.value?.toLocaleString() || 0}
                </Typography>
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={getStatusColor(params.value)}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            field: "generatedAt",
            headerName: "Generated",
            width: 110,
            valueGetter: (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            renderCell: (params: any) => (
                <Box display="flex" gap={0.5}>
                    <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(params.row)} sx={{ color: "#6366f1" }}>
                            <MdVisibility />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                        <IconButton size="small" onClick={() => handleDownload(params.row._id)} disabled={downloading} sx={{ color: "#3b82f6" }}>
                            <MdDownload />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Email Payslip">
                        <IconButton size="small" onClick={() => handleSendEmail(params.row._id, "ATTACHMENT")} sx={{ color: "#10b981" }}>
                            <MdEmail />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box className="Submitted_form_table" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}> Payslip History</Typography>

            {/* Summary Stats Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={6} md={3}>
                    <StatCard
                        icon={<MdReceipt size={24} />}
                        label="Total Payslips"
                        value={stats.total}
                        color="#6366f1"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        icon={<MdAttachMoney size={24} />}
                        label="Total Disbursed"
                        value={`Rs. ${stats.totalNetPay.toLocaleString()}`}
                        color="#10b981"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        icon={<MdCheckCircle size={24} />}
                        label="Emails Sent"
                        value={stats.emailed}
                        color="#3b82f6"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        icon={<MdPending size={24} />}
                        label="Pending (Draft)"
                        value={stats.pending}
                        color="#f59e0b"
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="subtitle2" fontWeight="600" mb={2}>🔍 Filters</Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <TextField
                            select
                            label="Month"
                            size="small"
                            value={filter.month}
                            onChange={e => setFilter({ ...filter, month: e.target.value })}
                            sx={{ width: 140 }}
                        >
                            <MenuItem value="">All Months</MenuItem>
                            {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </TextField>

                        <TextField
                            label="Year"
                            size="small"
                            type="number"
                            value={filter.year}
                            onChange={e => setFilter({ ...filter, year: e.target.value })}
                            sx={{ width: 100 }}
                            placeholder="2025"
                        />

                        <TextField
                            select
                            label="Employee"
                            size="small"
                            value={filter.employeeId}
                            onChange={e => setFilter({ ...filter, employeeId: e.target.value })}
                            sx={{ width: 200 }}
                        >
                            <MenuItem value="">All Employees</MenuItem>
                            {employees?.map((emp: any) => (
                                <MenuItem key={emp._id} value={emp._id}>
                                    {emp.user?.name} ({emp.employeeId})
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Status"
                            size="small"
                            value={filter.status}
                            onChange={e => setFilter({ ...filter, status: e.target.value })}
                            sx={{ width: 130 }}
                        >
                            {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s === "All" ? "" : s}>{s}</MenuItem>)}
                        </TextField>

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setFilter({ month: "", year: "", employeeId: "", status: "" })}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <DataGrid
                    rows={filteredPayslips || []}
                    columns={columns}
                    loading={isLoading}
                    autoHeight
                    getRowId={(row) => row._id}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-columnHeaders": {
                            bgcolor: "#f8fafc",
                            fontWeight: 600
                        },
                        "& .MuiDataGrid-row:nth-of-type(even)": {
                            bgcolor: "#fafafa"
                        },
                        "& .MuiDataGrid-row:hover": {
                            bgcolor: "#f1f5f9"
                        }
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <PayslipDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                payslip={selectedPayslip}
            />
        </Box>
    );
};

export default PayslipHistory;
