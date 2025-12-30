import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Dialog,
    TextField,
    MenuItem,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import {
    ArrowLeft,
    Plus,
    Trash,
    EnvelopeSimple,
    User,
    Book,
    Briefcase,
    Compass,
    CheckCircle,
    XCircle,
    IdentificationCard
} from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";

// Dark theme styles
const cardStyle = {
    bgcolor: "rgba(30, 41, 59, 0.4)",
    border: "1px solid rgba(71, 85, 105, 0.6)",
    borderRadius: "6px",
    p: 3,
};

const tableHeaderStyle = {
    bgcolor: "rgba(15, 23, 42, 0.8)",
    "& .MuiTableCell-root": {
        color: "#94a3b8",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "'JetBrains Mono', monospace",
        borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
        py: 1.5,
    },
};

const tableRowStyle = {
    "& .MuiTableCell-root": {
        color: "#f8fafc",
        borderColor: "rgba(71, 85, 105, 0.4)",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
        py: 2,
    },
    "&:hover": {
        bgcolor: "rgba(51, 65, 85, 0.3)",
    },
};

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "6px",
        fontFamily: "'Inter', sans-serif",
        "& fieldset": { borderColor: "#475569" },
        "&:hover fieldset": { borderColor: "#64748b" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": {
        color: "#94a3b8",
        "&.Mui-focused": { color: "#3b82f6" },
    },
};

const StudentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignType, setAssignType] = useState<"course" | "internship" | "project">("course");
    const [assignMode, setAssignMode] = useState<"create" | "existing">("existing");
    const [selectedItemId, setSelectedItemId] = useState("");

    // Fetch data for dropdowns
    const { data: allCourses } = useQuery({
        queryKey: ["all-courses-list"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}courses`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data.courses || [];
        },
        enabled: assignModalOpen && assignType === "course" && assignMode === "existing"
    });

    const { data: allInternships } = useQuery({
        queryKey: ["all-internships-list"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/internships`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data || [];
        },
        enabled: assignModalOpen && assignType === "internship" && assignMode === "existing"
    });

    const { data: allProjects } = useQuery({
        queryKey: ["all-projects-list"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/projects`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data || [];
        },
        enabled: assignModalOpen && assignType === "project" && assignMode === "existing"
    });

    // Fetch student details
    const { data: student, isLoading } = useQuery({
        queryKey: ["student-profile", id],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
    });

    // Fetch student assignments
    const { data: assignmentsData } = useQuery({
        queryKey: ["student-assignments-list", id],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/students/${id}/assignments`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
    });

    const assignments = assignmentsData?.assignments || [];

    const sendInviteMutation = useMutation({
        mutationFn: async () => {
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/students/${id}/invite`, {}, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Invite sent!");
            queryClient.invalidateQueries({ queryKey: ["student-profile", id] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to send invite"),
    });

    const assignExistingMutation = useMutation({
        mutationFn: async () => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments`,
                { studentId: id, itemType: assignType, itemId: selectedItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assigned successfully!");
            queryClient.invalidateQueries({ queryKey: ["student-assignments-list", id] });
            setAssignModalOpen(false);
            setSelectedItemId("");
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to assign"),
    });

    const removeAssignmentMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}admin/assignments/${assignmentId}`, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assignment removed!");
            queryClient.invalidateQueries({ queryKey: ["student-assignments-list", id] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to remove"),
    });

    const handleAssign = () => {
        if (!selectedItemId) {
            CustomSnackBar.errorSnackbar("Please select an item");
            return;
        }
        assignExistingMutation.mutate();
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress sx={{ color: "#3b82f6" }} />
            </Box>
        );
    }

    const courseAssignments = assignments.filter((a: any) => a.itemType === "course");
    const internshipAssignments = assignments.filter((a: any) => a.itemType === "internship");
    const projectAssignments = assignments.filter((a: any) => a.itemType === "project");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                    onClick={() => navigate("/people")}
                    sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)", color: "#f8fafc" } }}
                >
                    <ArrowLeft size={20} weight="bold" />
                </IconButton>
                <Box>
                    <Typography variant="h5" sx={{ fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc" }}>
                        STUDENT PROFILE
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
                        ID: {id}
                    </Typography>
                </Box>
            </Box>

            {/* Student Info Card */}
            <Box sx={cardStyle}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            fontSize: 40,
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                        }}
                    >
                        {student?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#f8fafc", mb: 0.5 }}>{student?.name}</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                                <EnvelopeSimple size={18} weight="duotone" />
                                <Typography variant="body2">{student?.email}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                                <IdentificationCard size={18} weight="duotone" />
                                <Typography variant="body2">{student?.mobile}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                            <Box
                                sx={{
                                    px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                                    bgcolor: student?.status === "Active" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                                    color: student?.status === "Active" ? "#4ade80" : "#fbbf24",
                                    border: `1px solid ${student?.status === "Active" ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)"}`
                                }}
                            >
                                {student?.status}
                            </Box>
                            <Box
                                sx={{
                                    px: 1.5, py: 0.5, borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                                    bgcolor: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", border: "1px solid rgba(139, 92, 246, 0.2)",
                                    textTransform: "capitalize"
                                }}
                            >
                                {student?.role}
                            </Box>
                        </Box>
                    </Box>
                    {(student?.status === "Created" || student?.status === "Invited") && (
                        <Button
                            variant="outlined"
                            startIcon={<EnvelopeSimple size={18} />}
                            onClick={() => sendInviteMutation.mutate()}
                            disabled={sendInviteMutation.isPending}
                            sx={{
                                borderColor: "#3b82f6",
                                color: "#3b82f6",
                                "&:hover": { borderColor: "#60a5fa", bgcolor: "rgba(59, 130, 246, 0.1)" },
                                textTransform: "capitalize",
                                borderRadius: "6px"
                            }}
                        >
                            {student?.status === "Created" ? "Send Invite" : "Resend Invite"}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Assignments Section */}
            <Box sx={{ bgcolor: "transparent" }}>
                <Box sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        sx={{
                            "& .MuiTabs-indicator": { bgcolor: "#3b82f6" },
                            "& .MuiTab-root": {
                                color: "#64748b",
                                fontWeight: 600,
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                "&.Mui-selected": { color: "#3b82f6" }
                            }
                        }}
                    >
                        <Tab label={`Courses (${courseAssignments.length})`} />
                        <Tab label={`Internships (${internshipAssignments.length})`} />
                        <Tab label={`Projects (${projectAssignments.length})`} />
                    </Tabs>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} weight="bold" />}
                            onClick={() => {
                                setAssignType(tabValue === 0 ? "course" : tabValue === 1 ? "internship" : "project");
                                setAssignModalOpen(true);
                            }}
                            sx={{
                                bgcolor: "#3b82f6",
                                color: "#fff",
                                borderRadius: "6px",
                                "&:hover": { bgcolor: "#2563eb" },
                                textTransform: "capitalize",
                                px: 3
                            }}
                        >
                            Assign {tabValue === 0 ? "Course" : tabValue === 1 ? "Internship" : "Project"}
                        </Button>
                    </Box>

                    <Table sx={{ border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", overflow: "hidden" }}>
                        <TableHead sx={tableHeaderStyle}>
                            <TableRow>
                                <TableCell>Name / Title</TableCell>
                                <TableCell>{tabValue === 0 ? "Trainer" : tabValue === 1 ? "Company" : "Mentor"}</TableCell>
                                <TableCell>Duration / Deadline</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(tabValue === 0 ? courseAssignments : tabValue === 1 ? internshipAssignments : projectAssignments).length === 0 ? (
                                <TableRow sx={tableRowStyle}>
                                    <TableCell colSpan={5} align="center" sx={{ color: "#64748b !important", py: 8 }}>
                                        No assignments found in this category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (tabValue === 0 ? courseAssignments : tabValue === 1 ? internshipAssignments : projectAssignments).map((a: any) => (
                                    <TableRow key={a._id} sx={tableRowStyle}>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 600, color: "#f8fafc" }}>
                                                {a.itemId?.name || a.itemId?.title || "Unknown"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{a.itemId?.trainer || a.itemId?.company || a.itemId?.mentor || "N/A"}</TableCell>
                                        <TableCell>
                                            {a.itemId?.duration || (a.itemId?.deadline ? new Date(a.itemId.deadline).toLocaleDateString() : "N/A")}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: "inline-flex", px: 1, py: 0.25, borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                                                    bgcolor: "rgba(71, 85, 105, 0.2)", color: "#94a3b8", border: "1px solid rgba(71, 85, 105, 0.3)",
                                                    textTransform: "uppercase"
                                                }}
                                            >
                                                {a.itemId?.status || "Active"}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => removeAssignmentMutation.mutate(a._id)}
                                                sx={{ color: "#f87171", "&:hover": { bgcolor: "rgba(248, 113, 113, 0.1)" } }}
                                            >
                                                <Trash size={18} weight="duotone" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Box>

            {/* Assignment Modal */}
            <Dialog
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
                    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
                }}
            >
                <Box sx={{ p: 3, borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700, fontFamily: "'Chivo', sans-serif" }}>
                        Assign {assignType}
                    </Typography>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                    <TextField
                        select
                        fullWidth
                        label={`Select ${assignType}`}
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        sx={textFieldDarkStyles}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        bgcolor: "#1e293b",
                                        border: "1px solid rgba(71, 85, 105, 0.5)",
                                        color: "#f8fafc",
                                        "& .MuiMenuItem-root:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" },
                                        "& .Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2) !important" }
                                    }
                                }
                            }
                        }}
                    >
                        {(assignType === "course" ? allCourses : assignType === "internship" ? allInternships : allProjects)?.map((item: any) => (
                            <MenuItem key={item._id} value={item._id}>
                                {item.name || item.title}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                <Box sx={{ p: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        onClick={() => setAssignModalOpen(false)}
                        sx={{ color: "#94a3b8", textTransform: "capitalize", "&:hover": { color: "#f8fafc" } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={assignExistingMutation.isPending || !selectedItemId}
                        sx={{
                            bgcolor: "#3b82f6",
                            color: "#fff",
                            borderRadius: "6px",
                            "&:hover": { bgcolor: "#2563eb" },
                            px: 3,
                            fontWeight: 600,
                            textTransform: "capitalize"
                        }}
                    >
                        {assignExistingMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default StudentDetail;
