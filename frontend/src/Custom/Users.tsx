import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Dialog,
  DialogActions,
  Button,
  TextField,
  Menu,
  MenuItem,
  Tooltip,
  InputAdornment,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Trash,
  PaperPlaneTilt,
  DotsThreeVertical,
  MagnifyingGlass,
  Funnel,
  ArrowClockwise,
  UserPlus,
  Users as UsersIcon,
  ShieldCheck,
  GraduationCap,
  Pause,
  Play,
} from "@phosphor-icons/react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsers, userDeleteApi } from "../Hooks/user";
import CustomSnackBar from "./CustomSnackBar";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  dataGridDarkStyles,
  textFieldDarkStyles,
  menuDarkStyles,
  dialogDarkStyles,
  primaryButtonDarkStyles,
  cancelButtonDarkStyles,
  dangerButtonDarkStyles
} from "../assets/Styles/AdminDarkTheme";

// Local styles removed in favor of AdminDarkTheme

// Add Student Modal Component
const AddStudentModal = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("skToken");

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; mobile: string }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Student created successfully!");
      setFormData({ name: "", email: "", mobile: "" });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to create student");
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = () => {
    if (!formData.name || formData.name.length < 3) {
      CustomSnackBar.errorSnackbar("Name must be at least 3 characters");
      return;
    }
    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      CustomSnackBar.errorSnackbar("Invalid email address");
      return;
    }
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      CustomSnackBar.errorSnackbar("Mobile must be exactly 10 digits");
      return;
    }
    setLoading(true);
    createMutation.mutate(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={dialogDarkStyles}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#f8fafc", fontSize: "16px", fontWeight: 700, fontFamily: "'Chivo', sans-serif" }}>
          <GraduationCap size={24} weight="duotone" /> Add New Student
        </Box>
      </Box>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth size="small" placeholder="Enter student's full name" sx={textFieldDarkStyles} />
        <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" placeholder="student@email.com" sx={textFieldDarkStyles} />
        <TextField label="Mobile (10 digits)" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} fullWidth size="small" placeholder="9876543210" sx={textFieldDarkStyles} />
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        <Button onClick={onClose} sx={cancelButtonDarkStyles}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} sx={primaryButtonDarkStyles}>
          {loading ? "Creating..." : "Create Student"}
        </Button>
      </Box>
    </Dialog>
  );
};

// Stats Card Component
const StatsCard = ({ icon, label, count, color, bgColor }: { icon: React.ReactNode; label: string; count: number; color: string; bgColor: string }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 140,
      p: 2,
      borderRadius: "6px",
      background: `linear-gradient(135deg, ${bgColor} 0%, rgba(30, 41, 59, 0.4) 100%)`,
      border: "1px solid rgba(71, 85, 105, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s ease",
      "&:hover": { borderColor: color, transform: "translateY(-2px)" },
    }}
  >
    <Box>
      <Box sx={{ fontSize: "28px", fontWeight: 700, color, fontFamily: "'Chivo', sans-serif" }}>{count}</Box>
      <Box sx={{ fontSize: "11px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.5 }}>{label}</Box>
    </Box>
    <Box sx={{ color, opacity: 0.7 }}>{icon}</Box>
  </Box>
);

const Users = () => {
  const { data: getUsersResponse, isLoading, error, refetch } = useGetUsers();
  const { mutate: userDelete } = userDeleteApi();
  const [rows, setRows] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<any>(null);
  const token = Cookies.get("skToken");
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (getUsersResponse) {
      const usersData = Array.isArray(getUsersResponse) ? getUsersResponse : getUsersResponse.data;
      if (usersData) setRows(usersData);
    }
  }, [getUsersResponse]);

  // Computed stats
  const stats = useMemo(() => {
    const all = rows.length;
    const students = rows.filter(r => r.role === "student").length;
    const admins = rows.filter(r => r.role === "admin").length;
    const active = rows.filter(r => r.status === "Active" || r.status === "Self-Signed").length;
    const pending = rows.filter(r => r.status === "Created" || r.status === "Invited").length;
    return { all, students, admins, active, pending };
  }, [rows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    let filtered = [...rows];
    if (tabValue === 1) filtered = filtered.filter(r => r.role === "student");
    else if (tabValue === 2) filtered = filtered.filter(r => r.role === "admin");
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.name?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term) || r.mobile?.includes(term));
    }
    if (statusFilter !== "all") filtered = filtered.filter(r => r.status === statusFilter);
    return filtered;
  }, [rows, tabValue, searchTerm, statusFilter]);

  const sendInviteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/invite`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    },
    onSuccess: () => { CustomSnackBar.successSnackbar("Invite sent!"); refetch(); },
    onError: (error: any) => CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to send invite"),
  });

  const suspendMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/suspend`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    },
    onSuccess: () => { CustomSnackBar.successSnackbar("User suspended!"); refetch(); },
    onError: (error: any) => CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to suspend"),
  });

  const activateMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    },
    onSuccess: () => { CustomSnackBar.successSnackbar("User activated!"); refetch(); },
    onError: (error: any) => CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to activate"),
  });

  const handleAction = (id: string) => {
    if (id) { setUserToDelete(id); setDeleteModalOpen(true); }
    else CustomSnackBar.errorSnackbar("Something Went Wrong!");
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      userDelete(userToDelete, {
        onSuccess: () => { CustomSnackBar.successSnackbar("Deleted!"); setDeleteModalOpen(false); setUserToDelete(null); },
        onError: () => { CustomSnackBar.errorSnackbar("Failed to delete!"); setDeleteModalOpen(false); setUserToDelete(null); },
      });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => { setAnchorEl(event.currentTarget); setMenuRow(row); };
  const handleMenuClose = () => { setAnchorEl(null); setMenuRow(null); };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; color: string; border: string; label: string }> = {
      Active: { bg: "rgba(22, 101, 52, 0.2)", color: "#4ade80", border: "rgba(34, 197, 94, 0.4)", label: " Active" },
      "Self-Signed": { bg: "rgba(37, 99, 235, 0.2)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.4)", label: " Verified" },
      Invited: { bg: "rgba(202, 138, 4, 0.2)", color: "#fbbf24", border: "rgba(234, 179, 8, 0.4)", label: "Invited" },
      Created: { bg: "rgba(71, 85, 105, 0.3)", color: "#94a3b8", border: "rgba(100, 116, 139, 0.4)", label: " Pending" },
      Suspended: { bg: "rgba(127, 29, 29, 0.2)", color: "#f87171", border: "rgba(239, 68, 68, 0.4)", label: "⛔ Suspended" },
    };
    const config = configs[status] || configs.Created;
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", fontSize: "12px", fontWeight: 600, color: config.color, letterSpacing: "0.02em" }}>
        {config.label}
      </Box>
    );
  };

  const getRoleBadge = (role: string) => {
    const lowerRole = role?.toLowerCase() || "user";
    const configs: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
      admin: { bg: "rgba(139, 92, 246, 0.2)", color: "#a78bfa", border: "rgba(139, 92, 246, 0.4)", icon: <ShieldCheck size={14} weight="duotone" /> },
      student: { bg: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.4)", icon: <GraduationCap size={14} weight="duotone" /> },
      employee: { bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80", border: "rgba(34, 197, 94, 0.4)", icon: <ShieldCheck size={14} weight="duotone" /> },
    };
    const config = configs[lowerRole] || configs.student;
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "12px", fontWeight: 600, color: config.color, textTransform: "capitalize" }}>
        {config.icon}
        {role || "user"}
      </Box>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "name", headerName: "User", flex: 1, minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: params.row.role === "admin" ? "#8b5cf6" : "#3b82f6", fontSize: 13, flexShrink: 0 }}>
            {params.row.name?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
          <Box sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.row.name}
          </Box>
        </Box>
      ),
    },
    {
      field: "email", headerName: "Email", flex: 1.5, minWidth: 250,
      renderCell: (p) => <Box sx={{ fontSize: "12px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.value}</Box>
    },
    { field: "mobile", headerName: "Mobile", width: 130, renderCell: (p) => <Box sx={{ fontFamily: "'JetBrains Mono', monospace", color: "#f8fafc" }}>{p.value}</Box> },
    { field: "role", headerName: "Role", width: 120, renderCell: (p) => getRoleBadge(p.row.role) },
    { field: "status", headerName: "Status", width: 140, renderCell: (p) => getStatusBadge(p.row.status || "Active") },
    {
      field: "quickActions", headerName: "Quick Actions", width: 150, sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.role === "student" && (params.row.status === "Created" || params.row.status === "Invited") && (
            <Tooltip title="Send Invite">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendInviteMutation.mutate(params.row._id || params.row.id); }} sx={{ color: "#fbbf24", "&:hover": { bgcolor: "rgba(251, 191, 36, 0.2)" } }}>
                <PaperPlaneTilt size={18} weight="duotone" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="More Actions">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, params.row); }} sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(148, 163, 184, 0.2)" } }}>
              <DotsThreeVertical size={18} weight="bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAction(params.row._id || params.row.id); }} sx={{ color: "#f87171", "&:hover": { bgcolor: "rgba(248, 113, 113, 0.2)" } }}>
              <Trash size={18} weight="duotone" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return <Box sx={{ p: 4, textAlign: "center", color: "#f87171" }}>Error loading users: {error.message || "Something went wrong"}</Box>;
  }

  const tabs = [
    { label: `All Users (${stats.all})`, icon: UsersIcon },
    { label: `Students (${stats.students})`, icon: GraduationCap },
    { label: `Admins (${stats.admins})`, icon: ShieldCheck },
  ];

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <UsersIcon size={28} weight="duotone" style={{ color: "#60a5fa" }} />
            <Box component="h1" sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em", m: 0 }}>
              User Management
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()} sx={{ color: "#94a3b8", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)", color: "#f8fafc" } }}>
                <ArrowClockwise size={20} weight="bold" />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<UserPlus size={18} weight="bold" />} onClick={() => setAddModalOpen(true)}
              sx={primaryButtonDarkStyles}>
              Add Student
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatsCard icon={<GraduationCap size={32} weight="duotone" />} label="Students" count={stats.students} color="#3b82f6" bgColor="rgba(59, 130, 246, 0.15)" />
          <StatsCard icon={<ShieldCheck size={32} weight="duotone" />} label="Admins" count={stats.admins} color="#8b5cf6" bgColor="rgba(139, 92, 246, 0.15)" />
          <StatsCard icon={<Play size={32} weight="duotone" />} label="Active" count={stats.active} color="#22c55e" bgColor="rgba(34, 197, 94, 0.15)" />
          <StatsCard icon={<PaperPlaneTilt size={32} weight="duotone" />} label="Pending" count={stats.pending} color="#f59e0b" bgColor="rgba(245, 158, 11, 0.15)" />
        </Box>

        {/* Tabs */}
        <Box sx={{ display: "flex", gap: 1, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 0 }}>
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tabValue === index;
            return (
              <Box key={tab.label} onClick={() => setTabValue(index)}
                sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, cursor: "pointer", transition: "all 0.2s ease", borderBottom: isActive ? "2px solid #60a5fa" : "2px solid transparent", color: isActive ? "#60a5fa" : "#94a3b8", "&:hover": { color: isActive ? "#60a5fa" : "#f8fafc" } }}>
                <Icon size={16} weight="duotone" />
                <Box sx={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{tab.label}</Box>
              </Box>
            );
          })}
        </Box>

        {/* Filters Row */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField placeholder="Search by name, email, or mobile..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 280, flex: 1, maxWidth: 400, ...textFieldDarkStyles }}
            InputProps={{ startAdornment: <InputAdornment position="start"><MagnifyingGlass size={18} style={{ color: "#64748b" }} /></InputAdornment> }}
          />
          <TextField select size="small" value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 180, ...textFieldDarkStyles }}
            InputProps={{ startAdornment: <Funnel size={16} style={{ marginRight: 8, color: "#64748b" }} /> }}
            SelectProps={{ MenuProps: menuDarkStyles }}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Self-Signed">Verified</MenuItem>
            <MenuItem value="Invited">Invited</MenuItem>
            <MenuItem value="Created">Pending</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </TextField>
        </Box>

        {/* Data Table */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#60a5fa" }} /></Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            rowHeight={52}
            getRowHeight={() => 52}
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            disableRowSelectionOnClick={false}
            onRowClick={(params) => { if (params.row.role === "student") navigate(`/student/${params.row._id}`); }}
            autoHeight
            getRowId={(row) => row._id || row.id}
            sx={{
              ...dataGridDarkStyles,
              border: "1px solid rgba(71, 85, 105, 0.4) !important",
              "& .MuiDataGrid-main": {
                borderRadius: "6px",
                overflow: "hidden",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#0f172a !important",
                color: "#94a3b8 !important",
                borderBottom: "1px solid rgba(71, 85, 105, 0.4) !important",
                minHeight: "56px !important",
                maxHeight: "56px !important",
                lineHeight: "56px !important",
              },
              "& .MuiDataGrid-columnHeader": {
                bgcolor: "#0f172a !important",
                outline: "none !important",
                "&:focus": { outline: "none !important" },
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              },
              "& .MuiDataGrid-columnHeaderSeparator": {
                display: "none !important",
              },
              "& .MuiDataGrid-row": {
                minHeight: "52px !important",
                maxHeight: "52px !important",
                bgcolor: "transparent !important",
                borderBottom: "1px solid rgba(71, 85, 105, 0.4) !important",
                "&:hover": { bgcolor: "rgba(51, 65, 85, 0.4) !important" },
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2) !important" },
              },
              "& .MuiDataGrid-cell": {
                display: "flex !important",
                alignItems: "center !important",
                borderColor: "rgba(71, 85, 105, 0.4) !important",
                overflow: "hidden !important",
                "&:focus": { outline: "none !important" },
              },
              "& .MuiDataGrid-virtualScroller": {
                bgcolor: "rgba(30, 41, 59, 0.4) !important",
              }
            }}
          />
        )}
      </Box>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        {...menuDarkStyles}>
        {menuRow?.role === "student" && (menuRow?.status === "Created" || menuRow?.status === "Invited") && (
          <MenuItem onClick={() => { sendInviteMutation.mutate(menuRow._id || menuRow.id); handleMenuClose(); }}>
            <PaperPlaneTilt size={18} style={{ marginRight: 8, color: "#fbbf24" }} /> {menuRow?.status === "Created" ? "Send" : "Resend"} Invite
          </MenuItem>
        )}
        {menuRow?.status !== "Suspended" && menuRow?.status !== "Deleted" && (
          <MenuItem onClick={() => { suspendMutation.mutate(menuRow._id || menuRow.id); handleMenuClose(); }} sx={{ color: "#f87171 !important" }}>
            <Pause size={18} style={{ marginRight: 8 }} /> Suspend
          </MenuItem>
        )}
        {menuRow?.status === "Suspended" && (
          <MenuItem onClick={() => { activateMutation.mutate(menuRow._id || menuRow.id); handleMenuClose(); }} sx={{ color: "#4ade80 !important" }}>
            <Play size={18} style={{ marginRight: 8 }} /> Activate
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
        sx={dialogDarkStyles}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Trash size={48} weight="duotone" style={{ color: "#f87171", marginBottom: 16 }} />
          <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>Delete User?</Box>
          <Box sx={{ fontSize: "14px", color: "#94a3b8", mb: 2 }}>This action cannot be undone.</Box>
        </Box>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button onClick={() => { setDeleteModalOpen(false); setUserToDelete(null); }} sx={cancelButtonDarkStyles}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} sx={dangerButtonDarkStyles}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Modal */}
      <AddStudentModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={() => refetch()} />
    </>
  );
};

export default Users;
