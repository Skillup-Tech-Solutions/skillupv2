import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { Megaphone, Plus, PencilSimple, Trash, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";
import CustomSnackBar from "../Custom/CustomSnackBar";

// Dark theme styles for DataGrid
const dataGridStyles = {
    bgcolor: "rgba(30, 41, 59, 0.4)",
    border: "1px solid rgba(71, 85, 105, 0.6)",
    borderRadius: "6px",
    "& .MuiDataGrid-columnHeaders": {
        bgcolor: "rgba(15, 23, 42, 0.8)",
        color: "#94a3b8",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "'JetBrains Mono', monospace",
        borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
    },
    "& .MuiDataGrid-columnHeader": {
        "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-row": {
        bgcolor: "transparent",
        color: "#f8fafc",
        "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" },
        "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
    },
    "& .MuiDataGrid-cell": {
        borderColor: "rgba(71, 85, 105, 0.4)",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
        "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-footerContainer": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        borderTop: "1px solid rgba(71, 85, 105, 0.4)",
        color: "#94a3b8",
    },
    "& .MuiTablePagination-root": { color: "#94a3b8" },
    "& .MuiTablePagination-selectIcon": { color: "#64748b" },
    "& .MuiIconButton-root": { color: "#64748b" },
    "& .MuiDataGrid-overlay": {
        bgcolor: "rgba(15, 23, 42, 0.8)",
        color: "#94a3b8",
    },
};

// Dark theme styles for TextField
const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
        color: "#f8fafc",
        bgcolor: "rgba(15, 23, 42, 0.5)",
        borderRadius: "6px",
        "& fieldset": { borderColor: "#475569" },
        "&:hover fieldset": { borderColor: "#64748b" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    },
    "& .MuiInputLabel-root": {
        color: "#94a3b8",
        "&.Mui-focused": { color: "#60a5fa" },
    },
    "& .MuiSelect-icon": { color: "#64748b" },
};

const AnnouncementManagement = () => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        targetAudience: "all",
        priority: "medium",
    });

    const { data, isLoading } = useQuery({
        queryKey: ["announcements"],
        queryFn: async () => {
            const response = await api.get("admin/announcements");
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("admin/announcements", data);
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Announcement created!");
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to create");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`admin/announcements/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Announcement updated!");
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to update");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`admin/announcements/${id}`);
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Announcement deleted!");
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to delete");
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.post(`admin/announcements/${id}/toggle-status`, {});
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Status updated!");
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
        },
    });

    const handleOpen = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                content: item.content,
                targetAudience: item.targetAudience,
                priority: item.priority,
            });
        } else {
            setEditingItem(null);
            setFormData({ title: "", content: "", targetAudience: "all", priority: "medium" });
        }
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setEditingItem(null);
        setFormData({ title: "", content: "", targetAudience: "all", priority: "medium" });
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.content) {
            CustomSnackBar.errorSnackbar("Title and content are required");
            return;
        }
        if (editingItem) {
            updateMutation.mutate({ id: editingItem._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high":
                return { color: "#f87171", bgcolor: "rgba(127, 29, 29, 0.3)", borderColor: "rgba(239, 68, 68, 0.4)" };
            case "medium":
                return { color: "#fbbf24", bgcolor: "rgba(120, 53, 15, 0.3)", borderColor: "rgba(245, 158, 11, 0.4)" };
            default:
                return { color: "#60a5fa", bgcolor: "rgba(30, 58, 138, 0.3)", borderColor: "rgba(59, 130, 246, 0.4)" };
        }
    };

    const columns: GridColDef[] = [
        { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
        { field: "content", headerName: "Content", flex: 2, minWidth: 300 },
        {
            field: "targetAudience",
            headerName: "Audience",
            width: 120,
            renderCell: (params) => (
                <Box
                    sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#c084fc",
                        bgcolor: "rgba(88, 28, 135, 0.3)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                    }}
                >
                    {params.value}
                </Box>
            ),
        },
        {
            field: "priority",
            headerName: "Priority",
            width: 100,
            renderCell: (params) => {
                const styles = getPriorityStyles(params.value);
                return (
                    <Box
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            ...styles,
                            border: `1px solid ${styles.borderColor}`,
                        }}
                    >
                        {params.value}
                    </Box>
                );
            },
        },
        {
            field: "isActive",
            headerName: "Status",
            width: 100,
            renderCell: (params) => (
                <Box
                    onClick={() => toggleStatusMutation.mutate(params.row._id)}
                    sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        transition: "all 0.2s ease",
                        ...(params.value
                            ? { color: "#4ade80", bgcolor: "rgba(22, 101, 52, 0.3)", border: "1px solid rgba(34, 197, 94, 0.4)" }
                            : { color: "#94a3b8", bgcolor: "rgba(51, 65, 85, 0.3)", border: "1px solid rgba(71, 85, 105, 0.4)" }),
                        "&:hover": { opacity: 0.8 },
                    }}
                >
                    {params.value ? <CheckCircle size={12} weight="fill" /> : <XCircle size={12} weight="fill" />}
                    {params.value ? "Active" : "Inactive"}
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => handleOpen(params.row)}
                        sx={{ color: "#60a5fa", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
                    >
                        <PencilSimple size={18} weight="duotone" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => deleteMutation.mutate(params.row._id)}
                        sx={{ color: "#f87171", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
                    >
                        <Trash size={18} weight="duotone" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Megaphone size={28} weight="duotone" style={{ color: "#fb923c" }} />
                    <Box
                        component="h1"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'Chivo', sans-serif",
                            fontWeight: 700,
                            color: "#f8fafc",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            m: 0,
                        }}
                    >
                        Announcements
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} weight="bold" />}
                    onClick={() => handleOpen()}
                    sx={{
                        bgcolor: "#3b82f6",
                        color: "#fff",
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        px: 2.5,
                        py: 1,
                        "&:hover": { bgcolor: "#2563eb" },
                    }}
                >
                    New Announcement
                </Button>
            </Box>

            {/* DataGrid */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: "#60a5fa" }} />
                </Box>
            ) : (
                <DataGrid
                    rows={data || []}
                    columns={columns}
                    getRowId={(row) => row._id}
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={dataGridStyles}
                />
            )}

            {/* Dialog */}
            <Dialog
                open={modalOpen}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        bgcolor: "#1e293b",
                        border: "1px solid rgba(71, 85, 105, 0.5)",
                        borderRadius: "6px",
                    },
                    "& .MuiBackdrop-root": {
                        bgcolor: "rgba(15, 23, 42, 0.8)",
                        backdropFilter: "blur(8px)",
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box
                        sx={{
                            fontSize: "18px",
                            fontFamily: "'Chivo', sans-serif",
                            fontWeight: 700,
                            color: "#f8fafc",
                            mb: 3,
                        }}
                    >
                        {editingItem ? "Edit Announcement" : "New Announcement"}
                    </Box>
                    <DialogContent sx={{ p: 0 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                            <TextField
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                fullWidth
                                sx={textFieldStyles}
                            />
                            <TextField
                                label="Content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                fullWidth
                                multiline
                                rows={4}
                                sx={textFieldStyles}
                            />
                            <TextField
                                select
                                label="Target Audience"
                                value={formData.targetAudience}
                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                fullWidth
                                sx={textFieldStyles}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="students">Students Only</MenuItem>
                                <MenuItem value="admins">Admins Only</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                fullWidth
                                sx={textFieldStyles}
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 0, pt: 3, gap: 1.5 }}>
                        <Button
                            onClick={handleClose}
                            sx={{
                                bgcolor: "#334155",
                                color: "#f8fafc",
                                borderRadius: "6px",
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                fontSize: "13px",
                                "&:hover": { bgcolor: "#475569" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            sx={{
                                bgcolor: "#3b82f6",
                                color: "#fff",
                                borderRadius: "6px",
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                "&:hover": { bgcolor: "#2563eb" },
                                "&:disabled": { bgcolor: "#475569", color: "#94a3b8" },
                            }}
                        >
                            {editingItem ? "Update" : "Create"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
};

export default AnnouncementManagement;
