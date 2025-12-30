import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Tooltip,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import { MdDownload, MdEmail, MdVisibility, MdReceipt, MdAttachMoney, MdCheckCircle, MdPending, MdFilterList } from "react-icons/md";
import { useGetPayslipHistory, useSendPayslipEmail, useGetEmployees } from "../../../Hooks/employee";
import { useState, useMemo } from "react";
import CustomSnackBar from "../../../Custom/CustomSnackBar";
import Cookies from "js-cookie";
import axios from "axios";
import {
    dataGridDarkStyles,
    textFieldDarkStyles,
    dialogDarkStyles,
    cancelButtonDarkStyles,
} from "../../../assets/Styles/AdminDarkTheme";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const STATUS_OPTIONS = ["All", "Draft", "Published", "Emailed"];

// Stats Card Component - Matching User Management
const StatsCard = ({ icon, label, value, color, bgColor }: { icon: React.ReactNode; label: string; value: string | number; color: string; bgColor: string }) => (
    <Box sx={{
        display: "flex", alignItems: "center", gap: 2.5, px: 3, py: 2.5,
        bgcolor: bgColor, border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", flex: 1, minWidth: 200
    }}>
        <Box sx={{ color: color }}>{icon}</Box>
        <Box>
            <Typography sx={{ fontSize: "22px", fontWeight: 700, color: color, lineHeight: 1.2 }}>{value}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
        </Box>
    </Box>
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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={dialogDarkStyles}>
            <DialogTitle sx={{ bgcolor: "#1e293b", borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <MdReceipt size={24} color="#6366f1" />
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>Payslip Details</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2, bgcolor: "#1e293b" }}>
                {/* Employee Info */}
                <Box sx={{ mb: 3, p: 2, bgcolor: "rgba(30, 41, 59, 0.6)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>Employee Information</Typography>
                    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <Box>
                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Name</Typography>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#f8fafc" }}>{payslip.employee?.user?.name || "-"}</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Employee ID</Typography>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#f8fafc" }}>{payslip.employee?.employeeId || "-"}</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Month/Year</Typography>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#f8fafc" }}>{payslip.month} {payslip.year}</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Status</Typography>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: payslip.status === "Emailed" ? "#4ade80" : payslip.status === "Published" ? "#60a5fa" : "#94a3b8" }}>{payslip.status}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Earnings & Deductions */}
                <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#4ade80", mb: 1.5 }}>Earnings</Typography>
                        <Box sx={{ bgcolor: "rgba(30, 41, 59, 0.6)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.4)", p: 2 }}>
                            {earnings.map((item, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography sx={{ fontSize: "13px", color: "#f8fafc" }}>{item.name}</Typography>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#f8fafc" }}>Rs. {item.amount?.toLocaleString()}</Typography>
                                </Box>
                            ))}
                            <Divider sx={{ my: 1, borderColor: "rgba(71, 85, 105, 0.4)" }} />
                            <Box display="flex" justifyContent="space-between">
                                <Typography sx={{ fontWeight: 700, color: "#f8fafc" }}>Gross Earnings</Typography>
                                <Typography sx={{ fontWeight: 700, color: "#4ade80" }}>Rs. {payslip.grossEarnings?.toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#f87171", mb: 1.5 }}>Deductions</Typography>
                        <Box sx={{ bgcolor: "rgba(30, 41, 59, 0.6)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.4)", p: 2 }}>
                            {(payslip.deductions || []).length > 0 ? (
                                payslip.deductions.map((item: any, idx: number) => (
                                    <Box key={idx} display="flex" justifyContent="space-between" py={0.5}>
                                        <Typography sx={{ fontSize: "13px", color: "#f8fafc" }}>{item.name}</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#f8fafc" }}>Rs. {item.amount?.toLocaleString()}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography sx={{ fontSize: "13px", color: "#64748b" }}>No deductions</Typography>
                            )}
                            <Divider sx={{ my: 1, borderColor: "rgba(71, 85, 105, 0.4)" }} />
                            <Box display="flex" justifyContent="space-between">
                                <Typography sx={{ fontWeight: 700, color: "#f8fafc" }}>Total Deductions</Typography>
                                <Typography sx={{ fontWeight: 700, color: "#f87171" }}>Rs. {payslip.totalDeductions?.toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Net Pay */}
                <Box sx={{ mt: 3, p: 2, bgcolor: "#6366f1", borderRadius: "6px", textAlign: "center" }}>
                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Net Pay</Typography>
                    <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>Rs. {payslip.netPay?.toLocaleString()}</Typography>
                </Box>

                {/* Additional Info */}
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                        Generated: {payslip.generatedAt ? new Date(payslip.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                        Attendance Days: {payslip.attendanceDays || 30}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: "#1e293b", borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                <Button onClick={onClose} sx={cancelButtonDarkStyles}>Close</Button>
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

    const columns: GridColDef[] = [
        {
            field: "employeeId",
            headerName: "Emp ID",
            width: 100,
            valueGetter: (_value, row) => row.employee?.employeeId || "-"
        },
        {
            field: "employeeName",
            headerName: "Employee",
            width: 160,
            valueGetter: (_value, row) => row.employee?.user?.name || "-"
        },
        { field: "month", headerName: "Month", width: 100 },
        { field: "year", headerName: "Year", width: 80 },
        {
            field: "grossEarnings",
            headerName: "Gross",
            width: 110,
            renderCell: (params) => (
                <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#4ade80" }}>
                    Rs. {params.value?.toLocaleString() || 0}
                </Typography>
            )
        },
        {
            field: "totalDeductions",
            headerName: "Deductions",
            width: 110,
            renderCell: (params) => (
                <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#f87171" }}>
                    Rs. {params.value?.toLocaleString() || 0}
                </Typography>
            )
        },
        {
            field: "netPay",
            headerName: "Net Pay",
            width: 120,
            renderCell: (params) => (
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#6366f1" }}>
                    Rs. {params.value?.toLocaleString() || 0}
                </Typography>
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 100,
            renderCell: (params) => {
                const color = params.value === "Emailed" ? "#4ade80" : params.value === "Published" ? "#60a5fa" : "#94a3b8";
                return <Typography sx={{ fontSize: "12px", fontWeight: 600, color }}>{params.value}</Typography>;
            }
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
            width: 140,
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
        <Box className="Submitted_form_table" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Stats Row */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <StatsCard icon={<MdReceipt size={28} />} label="Total Payslips" value={stats.total} color="#6366f1" bgColor="rgba(99, 102, 241, 0.15)" />
                <StatsCard icon={<MdAttachMoney size={28} />} label="Total Disbursed" value={`Rs. ${stats.totalNetPay.toLocaleString()}`} color="#10b981" bgColor="rgba(16, 185, 129, 0.15)" />
                <StatsCard icon={<MdCheckCircle size={28} />} label="Emails Sent" value={stats.emailed} color="#3b82f6" bgColor="rgba(59, 130, 246, 0.15)" />
                <StatsCard icon={<MdPending size={28} />} label="Pending (Draft)" value={stats.pending} color="#f59e0b" bgColor="rgba(245, 158, 11, 0.15)" />
            </Box>

            {/* Filters Row */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                    select
                    label="Month"
                    size="small"
                    value={filter.month}
                    onChange={e => setFilter({ ...filter, month: e.target.value })}
                    sx={{ minWidth: 140, ...textFieldDarkStyles }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><MdFilterList size={16} style={{ color: "#64748b" }} /></InputAdornment> }}
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
                    sx={{ width: 120, ...textFieldDarkStyles }}
                    placeholder="2025"
                />

                <TextField
                    select
                    label="Employee"
                    size="small"
                    value={filter.employeeId}
                    onChange={e => setFilter({ ...filter, employeeId: e.target.value })}
                    sx={{ minWidth: 200, ...textFieldDarkStyles }}
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
                    sx={{ minWidth: 130, ...textFieldDarkStyles }}
                >
                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s === "All" ? "" : s}>{s}</MenuItem>)}
                </TextField>

                <Button
                    size="small"
                    onClick={() => setFilter({ month: "", year: "", employeeId: "", status: "" })}
                    sx={{ ...cancelButtonDarkStyles, py: 0.75 }}
                >
                    Clear Filters
                </Button>
            </Box>

            {/* Data Table */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#60a5fa" }} /></Box>
            ) : (
                <DataGrid
                    rows={filteredPayslips || []}
                    columns={columns}
                    autoHeight
                    rowHeight={52}
                    getRowHeight={() => 52}
                    getRowId={(row) => row._id}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    sx={{
                        ...dataGridDarkStyles,
                        border: "1px solid rgba(71, 85, 105, 0.4) !important",
                        "& .MuiDataGrid-main": { borderRadius: "6px", overflow: "hidden" },
                        "& .MuiDataGrid-columnHeaders": {
                            bgcolor: "#0f172a !important",
                            color: "#94a3b8 !important",
                            borderBottom: "1px solid rgba(71, 85, 105, 0.4) !important",
                            minHeight: "48px !important",
                            maxHeight: "48px !important",
                        },
                        "& .MuiDataGrid-columnHeader": { bgcolor: "#0f172a !important", outline: "none !important" },
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                        },
                        "& .MuiDataGrid-row": {
                            minHeight: "52px !important",
                            maxHeight: "52px !important",
                            bgcolor: "transparent !important",
                            borderBottom: "1px solid rgba(71, 85, 105, 0.4) !important",
                            "&:hover": { bgcolor: "rgba(51, 65, 85, 0.4) !important" },
                        },
                        "& .MuiDataGrid-cell": {
                            display: "flex !important",
                            alignItems: "center !important",
                            borderColor: "rgba(71, 85, 105, 0.4) !important",
                            "&:focus": { outline: "none !important" },
                        },
                        "& .MuiDataGrid-virtualScroller": { bgcolor: "rgba(30, 41, 59, 0.4) !important" },
                        "& .MuiDataGrid-filler": { bgcolor: "#0f172a !important" },
                    }}
                />
            )}

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
