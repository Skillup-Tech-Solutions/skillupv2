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
import ProjectSubmissions from "./ProjectSubmissions";

const ProjectManagement = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requirements: "",
        tasks: "",
        deadline: "",
        mentor: "",
        mentorEmail: "",
        projectType: "individual",
        maxGroupSize: 1,
        skills: "",
        status: "Active",
        maxScore: 100,
        passingScore: 40,
        deliverables: [] as string[],
    });

    const commonDeliverables = ["Project Report", "PPT", "Source Code", "Research Paper", "Video Demo"];

    const { data, isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/projects`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/projects`,
                {
                    ...data,
                    skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                    tasks: data.tasks.split("\n").map((s: string) => s.trim()).filter(Boolean),
                    deliverables: data.deliverables,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project created!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to create");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await axios.put(
                `${import.meta.env.VITE_APP_BASE_URL}admin/projects/${id}`,
                {
                    ...data,
                    skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                    tasks: data.tasks.split("\n").map((s: string) => s.trim()).filter(Boolean),
                    deliverables: data.deliverables,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project updated!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            handleClose();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to update");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(
                `${import.meta.env.VITE_APP_BASE_URL}admin/projects/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project deleted!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
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
                requirements: item.requirements || "",
                tasks: (item.tasks || []).join("\n"),
                deadline: item.deadline?.split("T")[0] || "",
                mentor: item.mentor || "",
                mentorEmail: item.mentorEmail || "",
                projectType: item.projectType || "individual",
                maxGroupSize: item.maxGroupSize || 1,
                skills: (item.skills || []).join(", "),
                status: item.status || "Active",
                maxScore: item.maxScore || 100,
                passingScore: item.passingScore || 40,
                deliverables: item.deliverables || [],
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: "", description: "", requirements: "", tasks: "", deadline: "",
                mentor: "", mentorEmail: "", projectType: "individual", maxGroupSize: 1,
                skills: "", status: "Active", maxScore: 100, passingScore: 40,
                deliverables: [],
            });
        }
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.mentor || !formData.deadline) {
            CustomSnackBar.errorSnackbar("Title, Mentor and Deadline are required");
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
        { field: "mentor", headerName: "Mentor", width: 120 },
        {
            field: "deadline",
            headerName: "Deadline",
            width: 120,
            valueFormatter: (value: string) => value ? new Date(value).toLocaleDateString() : "",
        },
        {
            field: "projectType",
            headerName: "Type",
            width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" sx={{ textTransform: "capitalize" }} />
            ),
        },
        {
            field: "status",
            headerName: "Status",
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === "Active" ? "success" : params.value === "Completed" ? "info" : "default"}
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
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">📝 Projects</Typography>
                {tabValue === 0 && (
                    <Button
                        variant="contained"
                        startIcon={<MdAdd />}
                        onClick={() => handleOpen()}
                        sx={{ ...primaryButtonStyle }}
                    >
                        Add Project
                    </Button>
                )}
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
                    <Tab label="Manage Projects" />
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
                <ProjectSubmissions />
            )}

            <Dialog open={modalOpen} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingItem ? "Edit Project" : "New Project"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Mentor *" value={formData.mentor} onChange={(e) => setFormData({ ...formData, mentor: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Requirements" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} fullWidth multiline rows={2} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Tasks (one per line)" value={formData.tasks} onChange={(e) => setFormData({ ...formData, tasks: e.target.value })} fullWidth multiline rows={3} placeholder="Task 1&#10;Task 2&#10;Task 3" />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Required Deliverables</Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {commonDeliverables.map((del) => (
                                    <Chip
                                        key={del}
                                        label={del}
                                        clickable
                                        color={formData.deliverables.includes(del) ? "primary" : "default"}
                                        onClick={() => {
                                            const newDeliverables = formData.deliverables.includes(del)
                                                ? formData.deliverables.filter(d => d !== del)
                                                : [...formData.deliverables, del];
                                            setFormData({ ...formData, deliverables: newDeliverables });
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Deadline *" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Mentor Email" value={formData.mentorEmail} onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Project Type" value={formData.projectType} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })} fullWidth>
                                <MenuItem value="individual">Individual</MenuItem>
                                <MenuItem value="group">Group</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Max Group Size" type="number" value={formData.maxGroupSize} onChange={(e) => setFormData({ ...formData, maxGroupSize: Number(e.target.value) })} fullWidth disabled={formData.projectType === "individual"} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Skills (comma separated)" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} fullWidth placeholder="e.g., React, Node.js" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Max Score" type="number" value={formData.maxScore} onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Passing Score" type="number" value={formData.passingScore} onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })} fullWidth />
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

export default ProjectManagement;
