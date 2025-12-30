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
} from "@mui/material";
import { Plus, PencilSimple, Trash, Buildings, X } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";
import InternshipSubmissionsList from "../Components/Admin/InternshipSubmissionsList";
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

const InternshipManagement = ({ activeSubTab = 0 }: { activeSubTab?: number }) => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
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
    const [selectedInternship, setSelectedInternship] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["internships"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/internships`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/internships`, {
                ...payload,
                skills: payload.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
            }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Internship created!");
            queryClient.invalidateQueries({ queryKey: ["internships"] });
            setModalOpen(false);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to create"),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            await axios.put(`${import.meta.env.VITE_APP_BASE_URL}admin/internships/${id}`, {
                ...payload,
                skills: payload.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
            }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Internship updated!");
            queryClient.invalidateQueries({ queryKey: ["internships"] });
            setModalOpen(false);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to update"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}admin/internships/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Internship deleted!");
            queryClient.invalidateQueries({ queryKey: ["internships"] });
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

    const columns: GridColDef[] = [
        { field: "title", headerName: "Job Title", flex: 1, minWidth: 180, renderCell: (p) => <Typography sx={{ fontWeight: 600, color: "#f8fafc", fontSize: "13px" }}>{p.value}</Typography> },
        {
            field: "company", headerName: "Company", width: 160, renderCell: (p) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Buildings size={16} weight="duotone" style={{ color: "#60a5fa" }} />
                    <Typography sx={{ color: "#f8fafc", fontSize: "13px" }}>{p.value}</Typography>
                </Box>
            )
        },
        { field: "mentor", headerName: "Mentor", width: 140, renderCell: (p) => <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>{p.value || "-"}</Typography> },
        { field: "duration", headerName: "Duration", width: 100, renderCell: (p) => <Typography sx={{ color: "#f8fafc", fontSize: "12px" }}>{p.value || "-"}</Typography> },
        { field: "mode", headerName: "Mode", width: 90, renderCell: (p) => <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#60a5fa", textTransform: "capitalize" }}>{p.value}</Typography> },
        { field: "status", headerName: "Status", width: 90, renderCell: (p) => <Typography sx={{ fontSize: "12px", fontWeight: 600, color: p.value === "Active" || p.value === "Ongoing" ? "#4ade80" : "#94a3b8" }}>{p.value}</Typography> },
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
                            <Buildings size={28} weight="duotone" style={{ color: "#3b82f6" }} />
                            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", fontFamily: "'Chivo', sans-serif", textTransform: "uppercase" }}>Internships List</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<Plus size={18} weight="bold" />} onClick={() => handleOpen()}
                            sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 2.5, "&:hover": { bgcolor: "#2563eb" } }}>Add Internship</Button>
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
                <InternshipSubmissionsList />
            ) : activeSubTab === 2 ? (
                selectedInternship ? (
                    <LiveSessionsTab
                        sessionType="INTERNSHIP"
                        referenceId={selectedInternship._id}
                        referenceName={selectedInternship.title}
                        userName="Admin"
                        userEmail="admin@skillup.com"
                    />
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box>
                            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>Select an Internship</Typography>
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>Choose an internship to manage its live sessions</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            {(data || []).map((internship: any) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={internship._id}>
                                    <Box
                                        onClick={() => setSelectedInternship(internship)}
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
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", mb: 0.5 }}>{internship.title}</Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>{internship.company || "No company set"}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )
            ) : null}

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px", fontFamily: "'Chivo', sans-serif" }}>{editingItem ? "Edit Internship" : "Create New Internship"}</Typography>
                    <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Internship Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Company Name" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} fullWidth placeholder="e.g., 3 months" sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField select label="Work Mode" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} fullWidth sx={textFieldDarkStyles}><MenuItem value="on-site">On-site</MenuItem><MenuItem value="remote">Remote</MenuItem><MenuItem value="hybrid">Hybrid</MenuItem></TextField></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth sx={textFieldDarkStyles}><MenuItem value="Active">Active</MenuItem><MenuItem value="Ongoing">Ongoing</MenuItem><MenuItem value="Completed">Completed</MenuItem><MenuItem value="Upcoming">Upcoming</MenuItem></TextField></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mentor Name" value={formData.mentor} onChange={(e) => setFormData({ ...formData, mentor: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mentor Email" value={formData.mentorEmail} onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Monthy Stipend (₹)" type="number" value={formData.stipend} onChange={(e) => setFormData({ ...formData, stipend: +e.target.value })} fullWidth sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Required Skills" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} fullWidth placeholder="e.g., React, Node.js" sx={textFieldDarkStyles} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField label="Daily Tasks / Roles" value={formData.dailyTasks} onChange={(e) => setFormData({ ...formData, dailyTasks: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} /></Grid>
                    </Grid>
                </Box>
                <Box sx={{ p: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#3b82f6", color: "#fff", px: 4, "&:hover": { bgcolor: "#2563eb" } }}>{editingItem ? "Update Internship" : "Create Internship"}</Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default InternshipManagement;
