import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Tooltip,
    MenuItem,
    InputAdornment,
    Card,
    CardContent,
    Avatar,
} from "@mui/material";
import { MdEdit, MdAttachMoney, MdHistory, MdSearch, MdRefresh, MdBusiness, MdPerson } from "react-icons/md";
import { FaUserPlus, FaUserTie, FaUsers } from "react-icons/fa";
import { AndroidLogo, AppleLogo, Desktop } from "@phosphor-icons/react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployees, useCreateEmployee, useUpdateEmployeeProfile } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "6px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
};

// Stats Card Component - Dark Theme
const StatsCard = ({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) => (
    <Card sx={{ flex: 1, minWidth: 140, bgcolor: `rgba(30, 41, 59, 0.4)`, border: `1px solid rgba(71, 85, 105, 0.4)`, borderRadius: "6px" }}>
        <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color }}>{count}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
                </Box>
                <Box sx={{ color, opacity: 0.7, fontSize: 24 }}>{icon}</Box>
            </Box>
        </CardContent>
    </Card>
);

const AddEmployeeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({
        name: "", email: "", mobile: "",
        designation: "", department: "", employeeId: "",
        joiningDate: "", gender: "Male"
    });

    const createMutation = useCreateEmployee();

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.employeeId || !formData.designation || !formData.department) {
            CustomSnackBar.errorSnackbar("Please fill all required fields (Name, Email, Employee ID, Designation, Department)");
            return;
        }
        createMutation.mutate(formData, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Employee created successfully");
                setFormData({ name: "", email: "", mobile: "", designation: "", department: "", employeeId: "", joiningDate: "", gender: "Male" });
                onClose();
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to create");
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            sx={{ "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" }, "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)" } }}>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", color: "#f8fafc", fontFamily: "'Chivo', sans-serif" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaUserTie /> Add New Employee
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
                    {/* Basic Info Section */}
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", mb: -0.5 }}>
                        Basic Information
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Full Name *"
                            fullWidth
                            size="small"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            sx={textFieldDarkStyles}
                        />
                        <TextField
                            label="Employee ID *"
                            fullWidth
                            size="small"
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                            placeholder="EMP001"
                            sx={textFieldDarkStyles}
                        />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Email *"
                            fullWidth
                            size="small"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="employee@company.com"
                            sx={textFieldDarkStyles}
                        />
                        <TextField
                            label="Mobile"
                            fullWidth
                            size="small"
                            value={formData.mobile}
                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="9876543210"
                            sx={textFieldDarkStyles}
                        />
                    </Box>

                    {/* Work Info Section */}
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", mt: 1, mb: -0.5 }}>
                        💼 Work Details
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Designation *"
                            fullWidth
                            size="small"
                            value={formData.designation}
                            onChange={e => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="Software Developer"
                            sx={textFieldDarkStyles}
                        />
                        <TextField
                            label="Department *"
                            fullWidth
                            size="small"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                            placeholder="Engineering"
                            sx={textFieldDarkStyles}
                        />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Joining Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            size="small"
                            value={formData.joiningDate}
                            onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                            sx={textFieldDarkStyles}
                        />
                        <TextField
                            select
                            label="Gender"
                            fullWidth
                            size="small"
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            sx={textFieldDarkStyles}
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                <Button onClick={onClose} sx={{ bgcolor: "#334155", color: "#f8fafc", borderRadius: "6px", "&:hover": { bgcolor: "#475569" } }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending} sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", fontWeight: 600, "&:hover": { bgcolor: "#2563eb" } }}>
                    {createMutation.isPending ? "Creating..." : "Create Employee"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const EditEmployeeModal = ({ open, onClose, employeeData }: { open: boolean; onClose: () => void; employeeData: any }) => {
    const [formData, setFormData] = useState({
        name: employeeData?.user?.name || "",
        mobile: employeeData?.user?.mobile || "",
        designation: employeeData?.designation || "",
        department: employeeData?.department || "",
        joiningDate: employeeData?.joiningDate ? new Date(employeeData.joiningDate).toISOString().split('T')[0] : "",
        address: employeeData?.address || "",
        gender: employeeData?.gender || "Male"
    });

    const updateMutation = useUpdateEmployeeProfile();

    const handleSubmit = () => {
        if (!formData.name) {
            CustomSnackBar.errorSnackbar("Please fill required fields");
            return;
        }
        updateMutation.mutate({ id: employeeData._id, data: formData }, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Employee updated successfully");
                onClose();
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to update");
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            sx={{ "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" }, "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)" } }}>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", color: "#f8fafc", fontFamily: "'Chivo', sans-serif" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MdEdit /> Edit Employee
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Full Name" fullWidth size="small" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} sx={textFieldDarkStyles} />
                        <TextField label="Mobile" fullWidth size="small" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} sx={textFieldDarkStyles} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Designation" fullWidth size="small" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} sx={textFieldDarkStyles} />
                        <TextField label="Department" fullWidth size="small" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} sx={textFieldDarkStyles} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Joining Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} sx={textFieldDarkStyles} />
                        <TextField select label="Gender" fullWidth size="small" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} sx={textFieldDarkStyles}>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Box>
                    <TextField label="Address" fullWidth size="small" multiline rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} sx={textFieldDarkStyles} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                <Button onClick={onClose} sx={{ bgcolor: "#334155", color: "#f8fafc", borderRadius: "6px", "&:hover": { bgcolor: "#475569" } }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={updateMutation.isPending} sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", fontWeight: 600, "&:hover": { bgcolor: "#2563eb" } }}>
                    {updateMutation.isPending ? "Updating..." : "Update Employee"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const EmployeeManagement = () => {
    const { data: employees, isLoading, error, refetch } = useGetEmployees();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const navigate = useNavigate();

    // Filter states
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const handleEditClick = (employee: any) => {
        setSelectedEmployee(employee);
        setEditModalOpen(true);
    };

    // Get unique departments
    const departments = useMemo(() => {
        const depts = new Set<string>();
        employees?.forEach((emp: any) => {
            if (emp.department) depts.add(emp.department);
        });
        return Array.from(depts);
    }, [employees]);

    // Computed stats
    const stats = useMemo(() => {
        const all = employees?.length || 0;
        const active = employees?.filter((e: any) => e.user?.status === "Active" || !e.user?.status).length || 0;
        const inactive = employees?.filter((e: any) => e.user?.status === "Suspended" || e.user?.status === "Inactive").length || 0;
        const deptCount = departments.length;
        return { all, active, inactive, deptCount };
    }, [employees, departments]);

    // Filtered rows
    const filteredRows = useMemo(() => {
        let filtered = employees || [];

        // Tab filter
        if (tabValue === 1) {
            filtered = filtered.filter((e: any) => e.user?.status === "Active" || !e.user?.status);
        } else if (tabValue === 2) {
            filtered = filtered.filter((e: any) => e.user?.status === "Suspended" || e.user?.status === "Inactive");
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((e: any) =>
                e.user?.name?.toLowerCase().includes(term) ||
                e.user?.email?.toLowerCase().includes(term) ||
                e.employeeId?.toLowerCase().includes(term) ||
                e.department?.toLowerCase().includes(term) ||
                e.designation?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [employees, tabValue, searchTerm]);

    const getDeviceIcon = (fcmTokens: any[]) => {
        if (!fcmTokens || fcmTokens.length === 0) return null;
        return (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                {fcmTokens.some(t => t.platform === 'android') && (
                    <Tooltip title="Android Registered"><AndroidLogo size={16} weight="duotone" style={{ color: "#3ddc84" }} /></Tooltip>
                )}
                {fcmTokens.some(t => t.platform === 'ios') && (
                    <Tooltip title="iOS Registered"><AppleLogo size={16} weight="duotone" style={{ color: "#f8fafc" }} /></Tooltip>
                )}
                {fcmTokens.some(t => t.platform === 'web') && (
                    <Tooltip title="Web Registered"><Desktop size={16} weight="duotone" style={{ color: "#60a5fa" }} /></Tooltip>
                )}
            </Box>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "employeeId",
            headerName: "ID",
            width: 100,
            valueGetter: (value, row) => row?.employeeId || "-",
            renderCell: (params) => (
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>
                    {params.row.employeeId || "-"}
                </Typography>
            )
        },
        {
            field: "name",
            headerName: "Employee",
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#6366f1", fontSize: 13, flexShrink: 0 }}>
                        {params.row.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Avatar>
                    <Box sx={{ overflow: "hidden" }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{params.row.user?.name || "-"}</Typography>
                        <Typography sx={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{params.row.user?.email || "-"}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: "designation",
            headerName: "Designation",
            width: 160,
            renderCell: (params) => (
                <Typography sx={{ fontSize: "12px", color: "#f8fafc" }}>{params.row.designation || "-"}</Typography>
            )
        },
        {
            field: "department",
            headerName: "Department",
            width: 140,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MdBusiness size={14} style={{ color: "#60a5fa" }} />
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#60a5fa" }}>{params.row.department || "-"}</Typography>
                </Box>
            )
        },
        {
            field: "firebase",
            headerName: "Firebase",
            width: 100,
            sortable: false,
            renderCell: (params) => getDeviceIcon(params.row.user?.fcmTokens)
        },
        {
            field: "status",
            headerName: "Status",
            width: 100,
            renderCell: (params: any) => (
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: params.row.user?.status === "Active" || !params.row.user?.status ? "#4ade80" : "#94a3b8" }}>
                    {params.row.user?.status || "Active"}
                </Typography>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            renderCell: (params: any) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Edit Profile">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(params.row); }}
                            sx={{ color: "#a78bfa", "&:hover": { bgcolor: "rgba(167, 139, 250, 0.2)" } }}
                        >
                            <MdEdit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Salary">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate(`/payroll/salary/${params.row._id}`); }}
                            sx={{ color: "#4ade80", "&:hover": { bgcolor: "rgba(74, 222, 128, 0.2)" } }}
                        >
                            <MdAttachMoney size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Payslip History">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate(`/payroll/history?employeeId=${params.row._id}`); }}
                            sx={{ color: "#60a5fa", "&:hover": { bgcolor: "rgba(96, 165, 250, 0.2)" } }}
                        >
                            <MdHistory size={16} />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    if (error) return <Box p={3} color="#ef4444">Error loading employees</Box>;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <FaUserTie size={24} style={{ color: "#a78bfa" }} />
                    <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Employee Management
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => refetch()} sx={{ color: "#94a3b8", border: "1px solid rgba(71, 85, 105, 0.4)", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } }}>
                            <MdRefresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<FaUserPlus />}
                        onClick={() => setAddModalOpen(true)}
                        sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 2.5, fontWeight: 600, "&:hover": { bgcolor: "#2563eb" } }}
                    >
                        Add Employee
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <StatsCard icon={<FaUsers />} label="Total Employees" count={stats.all} color="#6366f1" />
                <StatsCard icon={<MdPerson />} label="Active" count={stats.active} color="#10b981" />
                <StatsCard icon={<FaUserTie />} label="Inactive" count={stats.inactive} color="#ef4444" />
                <StatsCard icon={<MdBusiness />} label="Departments" count={stats.deptCount} color="#f59e0b" />
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", mb: 2 }}>
                <Box sx={{ display: "flex", gap: 0 }}>
                    {[`All (${stats.all})`, `Active (${stats.active})`, `Inactive (${stats.inactive})`].map((label, index) => (
                        <Box key={index} onClick={() => setTabValue(index)}
                            sx={{ px: 2, py: 1.5, cursor: "pointer", fontSize: "12px", fontWeight: 600, color: tabValue === index ? "#60a5fa" : "#94a3b8", borderBottom: tabValue === index ? "2px solid #60a5fa" : "2px solid transparent", textTransform: "uppercase", letterSpacing: "0.05em", "&:hover": { color: "#f8fafc" } }}>
                            {label}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search by name, email, ID, department, or designation..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 350, maxWidth: 500, ...textFieldDarkStyles }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdSearch color="#64748b" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Data Table */}
            <Box>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    loading={isLoading}
                    autoHeight
                    rowHeight={52}
                    getRowId={(row) => row._id}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.4)",
                        "& .MuiDataGrid-columnHeaders": { bgcolor: "#0f172a !important", color: "#94a3b8" },
                        "& .MuiDataGrid-columnHeader": { bgcolor: "#0f172a !important" },
                        "& .MuiDataGrid-filler": { bgcolor: "#0f172a !important" },
                        "& .MuiDataGrid-columnHeaderTitle": { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" },
                        "& .MuiDataGrid-columnHeaderSeparator": { display: "none" },
                        "& .MuiDataGrid-row": { borderBottom: "1px solid rgba(71, 85, 105, 0.3)", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3) !important" } },
                        "& .MuiDataGrid-cell": { display: "flex", alignItems: "center", borderColor: "rgba(71, 85, 105, 0.3)", color: "#f8fafc" },
                        "& .MuiDataGrid-footerContainer": { bgcolor: "#0f172a", borderTop: "1px solid rgba(71, 85, 105, 0.4)" },
                        "& .MuiTablePagination-root": { color: "#94a3b8" },
                    }}
                />
            </Box>

            <AddEmployeeModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
            <EditEmployeeModal open={editModalOpen} onClose={() => setEditModalOpen(false)} employeeData={selectedEmployee} />
        </Box>
    );
};

export default EmployeeManagement;
