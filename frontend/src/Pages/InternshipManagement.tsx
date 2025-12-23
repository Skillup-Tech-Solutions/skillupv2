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
    Grid,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle } from "../assets/Styles/ButtonStyles";
import InternshipSubmissionsList from "../Components/Admin/InternshipSubmissionsList";

const InternshipManagement = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        company: "",
        department: "",
        duration: "",
        mode: "on-site",
        startDate: "",
        endDate: "",
        mentor: "",
        mentorEmail: "",
        dailyTasks: "",
        skills: "",
        stipend: 0,
        status: "Active",
    });

    const { data, isLoading } = useQuery({
        queryKey: ["internships"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/internships`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/internships`,
                { ...data, skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Internship created!");
            queryClient.invalidateQueries({ queryKey: ["internships"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to create");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await axios.put(
                `${import.meta.env.VITE_APP_BASE_URL}admin/internships/${id}`,
                { ...data, skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Internship updated!");
            queryClient.invalidateQueries({ queryKey: ["internships"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to update");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(
                `${import.meta.env.VITE_APP_BASE_URL}admin/internships/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Internship deleted!");
            queryClient.invalidateQueries({ queryKey: ["internships"] });
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to delete");
        },
    });

    const handleOpen = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || "",
                description: item.description || "",
                company: item.company || "",
                department: item.department || "",
                duration: item.duration || "",
                mode: item.mode || "on-site",
                startDate: item.startDate?.split("T")[0] || "",
                endDate: item.endDate?.split("T")[0] || "",
                mentor: item.mentor || "",
                mentorEmail: item.mentorEmail || "",
                dailyTasks: item.dailyTasks || "",
                skills: (item.skills || []).join(", "),
                stipend: item.stipend || 0,
                status: item.status || "Active",
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: "", description: "", company: "", department: "", duration: "",
                mode: "on-site", startDate: "", endDate: "", mentor: "", mentorEmail: "",
                dailyTasks: "", skills: "", stipend: 0, status: "Active",
            });
        }
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.company || !formData.mentor || !formData.startDate || !formData.endDate) {
            CustomSnackBar.errorSnackbar("Title, Company, Mentor, Start Date and End Date are required");
            return;
        }
        if (editingItem) {
            updateMutation.mutate({ id: editingItem._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const columns: GridColDef[] = [
        { field: "title", headerName: "Title", width: 180 },
        { field: "company", headerName: "Company", width: 150 },
        { field: "mentor", headerName: "Mentor", width: 120 },
        { field: "duration", headerName: "Duration", width: 100 },
        {
            field: "mode",
            headerName: "Mode",
            width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" sx={{ textTransform: "capitalize" }} />
            ),
        },
        {
            field: "status",
            headerName: "Status",
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === "Active" || params.value === "Ongoing" ? "success" : params.value === "Completed" ? "info" : "default"}
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
                    <IconButton size="small" onClick={() => deleteMutation.mutate(params.row._id)} sx={{ color: "error.main" }}>
                        <MdDelete />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold">💼 Internships</Typography>
                {tabValue === 0 && (
                    <Button
                        variant="contained"
                        startIcon={<MdAdd />}
                        onClick={() => handleOpen()}
                        sx={{ ...primaryButtonStyle }}
                    >
                        Add Internship
                    </Button>
                )}
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
                    <Tab label="Manage Internships" />
                    <Tab label="Student Submissions & Certificates" />
                </Tabs>
            </Paper>

            {tabValue === 0 ? (
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
            ) : (
                <InternshipSubmissionsList />
            )}

            <Dialog open={modalOpen} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingItem ? "Edit Internship" : "New Internship"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Company *" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} fullWidth placeholder="e.g., 3 months" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Mode" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} fullWidth>
                                <MenuItem value="on-site">On-site</MenuItem>
                                <MenuItem value="remote">Remote</MenuItem>
                                <MenuItem value="hybrid">Hybrid</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Ongoing">Ongoing</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Upcoming">Upcoming</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Start Date *" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="End Date *" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Mentor *" value={formData.mentor} onChange={(e) => setFormData({ ...formData, mentor: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Mentor Email" value={formData.mentorEmail} onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Stipend" type="number" value={formData.stipend} onChange={(e) => setFormData({ ...formData, stipend: Number(e.target.value) })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Skills (comma separated)" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} fullWidth placeholder="e.g., React, Node.js, MongoDB" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Daily Tasks / Responsibilities" value={formData.dailyTasks} onChange={(e) => setFormData({ ...formData, dailyTasks: e.target.value })} fullWidth multiline rows={2} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending || updateMutation.isPending} sx={{ ...submitButtonStyle }}>
                        {editingItem ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InternshipManagement;
