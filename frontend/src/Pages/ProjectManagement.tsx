import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    Button,
    Typography,
    Dialog,
    IconButton,
    MenuItem,
    Grid,
    TextField,
    Chip,
} from "@mui/material";
import { Plus, PencilSimple, Trash, Briefcase, X } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";
import ProjectSubmissions from "./ProjectSubmissions";
import LiveSessionsTab from "../Components/Admin/LiveSessionsTab";

const dialogStyle = {
    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
};

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "6px",
        fontFamily: "'Inter', sans-serif",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
};

const ProjectManagement = ({ activeSubTab = 0 }: { activeSubTab?: number }) => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requirements: "",
        tasks: "",
        deadline: "",
        startDate: "",
        endDate: "",
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
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/projects`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/projects`, {
                ...payload,
                skills: payload.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                tasks: payload.tasks.split("\n").map((s: string) => s.trim()).filter(Boolean),
            }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project created!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setModalOpen(false);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to create"),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            await axios.put(`${import.meta.env.VITE_APP_BASE_URL}admin/projects/${id}`, {
                ...payload,
                skills: payload.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                tasks: payload.tasks.split("\n").map((s: string) => s.trim()).filter(Boolean),
            }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project updated!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setModalOpen(false);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to update"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}admin/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Project deleted!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const handleSubmit = () => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem._id, payload: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleOpen = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || "",
                description: item.description || "",
                requirements: item.requirements || "",
                tasks: (item.tasks || []).join("\n"),
                deadline: item.deadline?.split("T")[0] || "",
                startDate: item.startDate?.split("T")[0] || "",
                endDate: item.endDate?.split("T")[0] || "",
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
                startDate: "", endDate: "",
                mentor: "", mentorEmail: "", projectType: "individual", maxGroupSize: 1,
                skills: "", status: "Active", maxScore: 100, passingScore: 40, deliverables: [],
            });
        }
        setModalOpen(true);
    };

    const columns: GridColDef[] = [
        { field: "title", headerName: "Project Title", flex: 1, minWidth: 200, renderCell: (p) => <Typography sx={{ fontWeight: 600, color: "#f8fafc", fontSize: "13px" }}>{p.value}</Typography> },
        { field: "mentor", headerName: "Mentor", width: 140, renderCell: (p) => <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>{p.value || "-"}</Typography> },
        { field: "deadline", headerName: "Deadline", width: 120, renderCell: (p) => <Typography sx={{ color: "#f8fafc", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>{p.value ? new Date(p.value).toLocaleDateString() : "-"}</Typography> },
        { field: "projectType", headerName: "Type", width: 100, renderCell: (p) => <Typography sx={{ fontSize: "12px", fontWeight: 600, color: p.value === "group" ? "#a78bfa" : "#60a5fa", textTransform: "capitalize" }}>{p.value}</Typography> },
        { field: "status", headerName: "Status", width: 100, renderCell: (p) => <Typography sx={{ fontSize: "12px", fontWeight: 600, color: p.value === "Active" ? "#4ade80" : "#94a3b8" }}>{p.value}</Typography> },
        {
            field: "actions", headerName: "Actions", width: 100, sortable: false, renderCell: (p) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpen(p.row)} sx={{ color: "#94a3b8", "&:hover": { color: "#3b82f6" } }}><PencilSimple size={18} /></IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(p.row._id)} sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}><Trash size={18} /></IconButton>
                </Box>
            )
        },
    ];

    return (
        <Box sx={{ p: activeSubTab === 0 ? 3 : 0 }}>
            {activeSubTab === 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Briefcase size={28} weight="duotone" style={{ color: "#3b82f6" }} />
                            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase" }}>Projects List</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<Plus size={18} weight="bold" />} onClick={() => handleOpen()}
                            sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 2.5, "&:hover": { bgcolor: "#2563eb" } }}>Add Project</Button>
                    </Box>
                    <DataGrid rows={data || []} columns={columns} loading={isLoading} getRowId={(r) => r._id} autoHeight rowHeight={52}
                        sx={{
                            bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.4)",
                            "& .MuiDataGrid-columnHeaders": { bgcolor: "#0f172a", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" },
                            "& .MuiDataGrid-columnHeaderTitle": { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
                            "& .MuiDataGrid-columnHeaderSeparator": { display: "none" },
                            "& .MuiDataGrid-row": { borderBottom: "1px solid rgba(71, 85, 105, 0.3)", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } },
                            "& .MuiDataGrid-cell": { display: "flex", alignItems: "center", borderColor: "rgba(71, 85, 105, 0.3)" },
                        }} />
                </Box>
            ) : activeSubTab === 1 ? (
                <ProjectSubmissions />
            ) : activeSubTab === 2 ? (
                selectedProject ? (
                    <LiveSessionsTab
                        sessionType="PROJECT"
                        referenceId={selectedProject._id}
                        referenceName={selectedProject.title}
                        userName="Admin"
                        userEmail="admin@skillup.com"
                    />
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box>
                            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>Select a Project</Typography>
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>Choose a project to manage its live sessions</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            {(data || []).map((project: any) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project._id}>
                                    <Box
                                        onClick={() => setSelectedProject(project)}
                                        sx={{
                                            bgcolor: "#1e293b",
                                            border: "1px solid rgba(71, 85, 105, 0.4)",
                                            borderRadius: "6px",
                                            p: 2.5,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            "&:hover": { borderColor: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)" },
                                        }}
                                    >
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", mb: 0.5 }}>{project.title}</Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>{project.mentor || "No mentor assigned"}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )
            ) : null}

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px", fontFamily: "'Chivo', sans-serif" }}>{editingItem ? "Edit Project" : "Create New Project"}</Typography>
                    <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Project Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mentor Name" value={formData.mentor} onChange={(e) => setFormData({ ...formData, mentor: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField label="Requirements" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField label="Tasks (One per line)" value={formData.tasks} onChange={(e) => setFormData({ ...formData, tasks: e.target.value })} fullWidth multiline rows={3} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" sx={{ color: "#94a3b8", mb: 1.5, display: "block", fontWeight: 600, textTransform: "uppercase" }}>Deliverables</Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {commonDeliverables.map(d => (
                                    <Chip key={d} label={d} onClick={() => { const next = formData.deliverables.includes(d) ? formData.deliverables.filter(x => x !== d) : [...formData.deliverables, d]; setFormData({ ...formData, deliverables: next }); }}
                                        sx={{ bgcolor: formData.deliverables.includes(d) ? "rgba(59, 130, 246, 0.2)" : "rgba(15, 23, 42, 0.5)", color: formData.deliverables.includes(d) ? "#60a5fa" : "#94a3b8", border: `1px solid ${formData.deliverables.includes(d) ? "#3b82f6" : "rgba(71, 85, 105, 0.4)"}`, borderRadius: "4px" }} />
                                ))}
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mentor Email" value={formData.mentorEmail} onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField select label="Project Type" value={formData.projectType} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })} fullWidth sx={textFieldDarkStyles}><MenuItem value="individual">Individual</MenuItem><MenuItem value="group">Group</MenuItem></TextField></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Max Group Size" type="number" value={formData.maxGroupSize} onChange={(e) => setFormData({ ...formData, maxGroupSize: +e.target.value })} fullWidth sx={textFieldDarkStyles} disabled={formData.projectType === "individual"} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth sx={textFieldDarkStyles}><MenuItem value="Active">Active</MenuItem><MenuItem value="Completed">Completed</MenuItem></TextField></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Tech Stack (comma separated)" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                    </Grid>
                </Box>
                <Box sx={{ p: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#3b82f6", color: "#fff", px: 4, "&:hover": { bgcolor: "#2563eb" } }}>{editingItem ? "Update Project" : "Create Project"}</Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default ProjectManagement;
