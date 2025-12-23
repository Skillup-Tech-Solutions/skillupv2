import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    MenuItem,
} from "@mui/material";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle } from "../assets/Styles/ButtonStyles";

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

    const columns: GridColDef[] = [
        { field: "title", headerName: "Title", width: 200 },
        { field: "content", headerName: "Content", width: 300 },
        {
            field: "targetAudience",
            headerName: "Audience",
            width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" sx={{ textTransform: "capitalize" }} />
            ),
        },
        {
            field: "priority",
            headerName: "Priority",
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === "high" ? "error" : params.value === "medium" ? "warning" : "info"}
                />
            ),
        },
        {
            field: "isActive",
            headerName: "Active",
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Active" : "Inactive"}
                    size="small"
                    color={params.value ? "success" : "default"}
                    onClick={() => toggleStatusMutation.mutate(params.row._id)}
                    sx={{ cursor: "pointer" }}
                />
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpen(params.row)}>
                        <MdEdit />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => deleteMutation.mutate(params.row._id)}
                        sx={{ color: "error.main" }}
                    >
                        <MdDelete />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    📢 Announcements
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<MdAdd />}
                    onClick={() => handleOpen()}
                    sx={{ ...primaryButtonStyle }}
                >
                    New Announcement
                </Button>
            </Box>

            <DataGrid
                rows={data || []}
                columns={columns}
                loading={isLoading}
                getRowId={(row) => row._id}
                pageSizeOptions={[10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                autoHeight
                sx={{ borderRadius: 2 }}
            />

            <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                        />
                        <TextField
                            select
                            label="Target Audience"
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                            fullWidth
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
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        sx={{ ...submitButtonStyle }}
                    >
                        {editingItem ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AnnouncementManagement;
