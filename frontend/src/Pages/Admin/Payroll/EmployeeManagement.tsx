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
    Chip,
    Tabs,
    Tab,
    Paper,
    InputAdornment,
    Card,
    CardContent,
    Avatar,
} from "@mui/material";
import { MdEdit, MdAttachMoney, MdHistory, MdSearch, MdRefresh, MdBusiness, MdPerson } from "react-icons/md";
import { FaUserPlus, FaUserTie, FaUsers } from "react-icons/fa";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployees, useCreateEmployee, useUpdateEmployeeProfile } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle } from "../../../assets/Styles/ButtonStyles";

// Stats Card Component
const StatsCard = ({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) => (
    <Card sx={{ flex: 1, minWidth: 140, bgcolor: `${color}15`, border: `1px solid ${color}30` }}>
        <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color={color}>{count}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaUserTie /> Add New Employee
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
                    {/* Basic Info Section */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
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
                        />
                        <TextField
                            label="Employee ID *"
                            fullWidth
                            size="small"
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                            placeholder="EMP001"
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
                        />
                        <TextField
                            label="Mobile"
                            fullWidth
                            size="small"
                            value={formData.mobile}
                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="9876543210"
                        />
                    </Box>

                    {/* Work Info Section */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1, mt: 1 }}>
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
                        />
                        <TextField
                            label="Department *"
                            fullWidth
                            size="small"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                            placeholder="Engineering"
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
                        />
                        <TextField
                            select
                            label="Gender"
                            fullWidth
                            size="small"
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending} sx={{ ...submitButtonStyle }}>
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MdEdit /> Edit Employee
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Full Name" fullWidth size="small" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <TextField label="Mobile" fullWidth size="small" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Designation" fullWidth size="small" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                        <TextField label="Department" fullWidth size="small" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Joining Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                        <TextField select label="Gender" fullWidth size="small" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Box>
                    <TextField label="Address" fullWidth size="small" multiline rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={updateMutation.isPending} sx={{ ...submitButtonStyle }}>
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

    const columns: GridColDef[] = [
        {
            field: "employeeId",
            headerName: "ID",
            width: 100,
            valueGetter: (value, row) => row?.employeeId || "-",
            renderCell: (params) => (
                <Chip
                    label={params.row.employeeId || "-"}
                    size="small"
                    sx={{ fontWeight: 600, bgcolor: "#f3f4f6" }}
                />
            )
        },
        {
            field: "name",
            headerName: "Employee",
            width: 220,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#6366f1", fontSize: 14 }}>
                        {params.row.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={600}>{params.row.user?.name || "-"}</Typography>
                        <Typography variant="caption" color="text.secondary">{params.row.user?.email || "-"}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: "designation",
            headerName: "Designation",
            width: 160,
            renderCell: (params) => (
                <Typography variant="body2">{params.row.designation || "-"}</Typography>
            )
        },
        {
            field: "department",
            headerName: "Department",
            width: 140,
            renderCell: (params) => (
                <Chip
                    icon={<MdBusiness size={14} />}
                    label={params.row.department || "-"}
                    size="small"
                    sx={{ bgcolor: "#ede9fe", color: "#6366f1", fontWeight: 500 }}
                />
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 110,
            renderCell: (params: any) => (
                <Chip
                    label={params.row.user?.status || "Active"}
                    color={params.row.user?.status === "Active" || !params.row.user?.status ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            renderCell: (params: any) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Edit Profile">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(params.row); }}
                            sx={{ color: "#6366f1", bgcolor: "#ede9fe", "&:hover": { bgcolor: "#ddd6fe" } }}
                        >
                            <MdEdit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Salary">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate(`/payroll/salary/${params.row._id}`); }}
                            sx={{ color: "#10b981", bgcolor: "#d1fae5", "&:hover": { bgcolor: "#a7f3d0" } }}
                        >
                            <MdAttachMoney size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Payslip History">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate(`/payroll/history?employeeId=${params.row._id}`); }}
                            sx={{ color: "#3b82f6", bgcolor: "#dbeafe", "&:hover": { bgcolor: "#bfdbfe" } }}
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
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    👨‍💼 Employee Management
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => refetch()} sx={{ border: "1px solid #e0e0e0" }}>
                            <MdRefresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<FaUserPlus />}
                        onClick={() => setAddModalOpen(true)}
                        sx={{ ...primaryButtonStyle, borderRadius: 2 }}
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
            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label={`All Employees (${stats.all})`} />
                    <Tab label={`Active (${stats.active})`} />
                    <Tab label={`Inactive (${stats.inactive})`} />
                </Tabs>
            </Paper>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search by name, email, ID, department, or designation..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 350, maxWidth: 500 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdSearch color="#9ca3af" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Data Table */}
            <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    loading={isLoading}
                    autoHeight
                    getRowId={(row) => row._id}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                        "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
                    }}
                />
            </Paper>

            <AddEmployeeModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
            <EditEmployeeModal open={editModalOpen} onClose={() => setEditModalOpen(false)} employeeData={selectedEmployee} />
        </Box>
    );
};

export default EmployeeManagement;
