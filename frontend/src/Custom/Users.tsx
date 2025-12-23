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
  Chip,
  TextField,
  Menu,
  MenuItem,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { MdDeleteOutline, MdEmail, MdMoreVert, MdAssignment, MdSearch, MdFilterList, MdRefresh } from "react-icons/md";
import { FaUserPlus, FaPause, FaPlay, FaUserGraduate, FaUserShield } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsers, userDeleteApi, userUpdateApi } from "../Hooks/user";
import CustomSnackBar from "./CustomSnackBar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle, dangerButtonStyle } from "../assets/Styles/ButtonStyles";

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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaUserGraduate /> Add New Student
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            size="small"
            placeholder="Enter student's full name"
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            size="small"
            placeholder="student@email.com"
          />
          <TextField
            label="Mobile (10 digits)"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            fullWidth
            size="small"
            placeholder="9876543210"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
        <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ ...submitButtonStyle }}
        >
          {loading ? "Creating..." : "Create Student"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ open, onClose, student }: { open: boolean; onClose: () => void; student: any }) => {
  const [itemType, setItemType] = useState<"course" | "internship" | "project">("course");
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("skToken");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && itemType) {
      fetchItems();
    }
  }, [open, itemType]);

  const fetchItems = async () => {
    try {
      let endpoint = "";
      switch (itemType) {
        case "course":
          endpoint = "/api/courses";
          break;
        case "internship":
          endpoint = "/admin/internships";
          break;
        case "project":
          endpoint = "/admin/projects";
          break;
      }
      const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const assignMutation = useMutation({
    mutationFn: async (data: { studentId: string; itemType: string; itemId: string }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/assignments`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Assignment successful!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedItem("");
      onClose();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to assign");
    },
    onSettled: () => setLoading(false),
  });

  const handleAssign = () => {
    if (!selectedItem) {
      CustomSnackBar.errorSnackbar("Please select an item to assign");
      return;
    }
    setLoading(true);
    assignMutation.mutate({
      studentId: student?._id || student?.id,
      itemType,
      itemId: selectedItem,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdAssignment /> Assign to {student?.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              { type: "course", icon: "", label: "Course" },
              { type: "internship", icon: "💼", label: "Internship" },
              { type: "project", icon: "🎯", label: "Project" }
            ].map(({ type, icon, label }) => (
              <Button
                key={type}
                variant={itemType === type ? "contained" : "outlined"}
                onClick={() => { setItemType(type as any); setSelectedItem(""); }}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  bgcolor: itemType === type ? "var(--webprimary)" : "transparent",
                  borderColor: "var(--webprimary)",
                  color: itemType === type ? "#fff" : "var(--webprimary)",
                  "&:hover": {
                    bgcolor: itemType === type ? "var(--webprimary)" : "rgba(var(--webprimary-rgb), 0.1)",
                  }
                }}
                size="small"
              >
                {icon} {label}
              </Button>
            ))}
          </Box>
          <TextField
            select
            label={`Select ${itemType}`}
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            fullWidth
            size="small"
          >
            {items.map((item: any) => (
              <MenuItem key={item._id} value={item._id}>
                {item.name || item.title}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
        <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedItem}
          sx={{ ...submitButtonStyle }}
        >
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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

const Users = () => {
  const { data: getUsersResponse, isLoading, error, refetch } = useGetUsers();
  const { mutate: userDelete } = userDeleteApi();
  const [rows, setRows] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<any>(null);
  const token = Cookies.get("skToken");
  const navigate = useNavigate();

  // Filter states
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (getUsersResponse?.data) {
      setRows(getUsersResponse.data);
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

  // Filtered rows based on tab, search, and status
  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    // Tab filter
    if (tabValue === 1) filtered = filtered.filter(r => r.role === "student");
    else if (tabValue === 2) filtered = filtered.filter(r => r.role === "admin");

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.mobile?.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  }, [rows, tabValue, searchTerm, statusFilter]);

  const sendInviteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Invite sent successfully!");
      refetch();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to send invite");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Student suspended!");
      refetch();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to suspend");
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Student activated!");
      refetch();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to activate");
    },
  });

  const handleAction = (id: string) => {
    if (id) {
      setUserToDelete(id);
      setDeleteModalOpen(true);
    } else {
      CustomSnackBar.errorSnackbar("Something Went Wrong!");
    }
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      userDelete(userToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Deleted Successfully!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
        onError: () => {
          CustomSnackBar.errorSnackbar("Failed to delete user!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleSendInvite = (row?: any) => {
    const target = row || menuRow;
    if (target) {
      sendInviteMutation.mutate(target._id || target.id);
    }
    handleMenuClose();
  };

  const handleSuspend = () => {
    if (menuRow) {
      suspendMutation.mutate(menuRow._id || menuRow.id);
    }
    handleMenuClose();
  };

  const handleActivate = () => {
    if (menuRow) {
      activateMutation.mutate(menuRow._id || menuRow.id);
    }
    handleMenuClose();
  };

  const handleAssign = (row?: any) => {
    setSelectedStudent(row || menuRow);
    setAssignModalOpen(true);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "success";
      case "Self-Signed": return "info";
      case "Invited": return "warning";
      case "Created": return "default";
      case "Suspended": return "error";
      case "Deleted": return "error";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Active": return "✓ Active";
      case "Self-Signed": return "✓ Verified";
      case "Invited": return "📧 Invited";
      case "Created": return "🕐 Pending";
      case "Suspended": return "⛔ Suspended";
      default: return status;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "User",
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: params.row.role === "admin" ? "#8b5cf6" : "#3b82f6", fontSize: 14 }}>
            {params.row.name?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { field: "mobile", headerName: "Mobile", width: 130 },
    {
      field: "role",
      headerName: "Role",
      width: 110,
      renderCell: (params) => (
        <Chip
          icon={params.row.role === "admin" ? <FaUserShield size={12} /> : <FaUserGraduate size={12} />}
          label={params.row.role || "user"}
          size="small"
          sx={{
            textTransform: "capitalize",
            bgcolor: params.row.role === "admin" ? "#8b5cf615" : "#3b82f615",
            color: params.row.role === "admin" ? "#8b5cf6" : "#3b82f6",
            border: `1px solid ${params.row.role === "admin" ? "#8b5cf640" : "#3b82f640"}`,
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row.status || "Active")}
          size="small"
          color={getStatusColor(params.row.status)}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: "quickActions",
      headerName: "Quick Actions",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.role === "student" && (
            <>
              {(params.row.status === "Created" || params.row.status === "Invited") && (
                <Tooltip title="Send Invite">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleSendInvite(params.row); }}
                    sx={{ color: "#f59e0b" }}
                  >
                    <MdEmail />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Assign Course/Project">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleAssign(params.row); }}
                  sx={{ color: "#3b82f6" }}
                >
                  <MdAssignment />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="More Actions">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, params.row); }}
            >
              <MdMoreVert />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleAction(params.row._id || params.row.id); }}
              sx={{ color: "#ef4444" }}
            >
              <MdDeleteOutline />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "#ef4444" }}>
        Error loading users: {error.message || "Something went wrong"}
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            User Management
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
              Add Student
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <StatsCard icon={<FaUserGraduate />} label="Students" count={stats.students} color="#3b82f6" />
          <StatsCard icon={<FaUserShield />} label="Admins" count={stats.admins} color="#8b5cf6" />
          <StatsCard icon={<FaPlay />} label="Active" count={stats.active} color="#10b981" />
          <StatsCard icon={<MdEmail />} label="Pending Invite" count={stats.pending} color="#f59e0b" />
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`All Users (${stats.all})`} />
            <Tab label={`Students (${stats.students})`} icon={<FaUserGraduate size={14} />} iconPosition="start" />
            <Tab label={`Admins (${stats.admins})`} icon={<FaUserShield size={14} />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Filters Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by name, email, or mobile..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 280, flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch color="#9ca3af" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={<MdFilterList style={{ marginRight: 8, color: "#9ca3af" }} />}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Self-Signed">Verified</MenuItem>
              <MenuItem value="Invited">Invited</MenuItem>
              <MenuItem value="Created">Pending</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Data Table */}
        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={isLoading}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            checkboxSelection={false}
            disableRowSelectionOnClick={false}
            onRowClick={(params) => {
              if (params.row.role === "student") {
                navigate(`/student/${params.row._id}`);
              }
            }}
            autoHeight
            getRowId={(row) => row._id || row.id}
            sx={{
              border: "none",
              "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
            }}
          />
        </Paper>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ "& .MuiPaper-root": { borderRadius: 2, minWidth: 180, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } }}
      >
        {menuRow?.role === "student" && menuRow?.status === "Created" && (
          <MenuItem onClick={() => handleSendInvite()}>
            <MdEmail style={{ marginRight: 8, color: "#f59e0b" }} /> Send Invite
          </MenuItem>
        )}
        {menuRow?.role === "student" && menuRow?.status === "Invited" && (
          <MenuItem onClick={() => handleSendInvite()}>
            <MdEmail style={{ marginRight: 8, color: "#f59e0b" }} /> Resend Invite
          </MenuItem>
        )}
        {menuRow?.role === "student" && (
          <MenuItem onClick={() => handleAssign()}>
            <MdAssignment style={{ marginRight: 8, color: "#3b82f6" }} /> Assign Items
          </MenuItem>
        )}
        {menuRow?.status !== "Suspended" && menuRow?.status !== "Deleted" && (
          <MenuItem onClick={handleSuspend} sx={{ color: "#ef4444" }}>
            <FaPause style={{ marginRight: 8 }} /> Suspend
          </MenuItem>
        )}
        {menuRow?.status === "Suspended" && (
          <MenuItem onClick={handleActivate} sx={{ color: "#10b981" }}>
            <FaPlay style={{ marginRight: 8 }} /> Activate
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", color: "#ef4444", fontWeight: 600, pt: 3 }}>
          ⚠️ Delete User
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography color="text.secondary">
            Are you sure you want to delete this user?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" sx={{ ...cancelButtonStyle }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ ...dangerButtonStyle }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Modal */}
      <AddStudentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        student={selectedStudent}
      />
    </>
  );
};

export default Users;
