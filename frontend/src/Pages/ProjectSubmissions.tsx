import { useState } from "react";
import { openFileInNewTab, downloadFileAsBlob } from "../utils/normalizeUrl";
import {
    Box,
    Typography,
    Chip,
    Button,
    TextField,
    MenuItem,
    Dialog,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Divider,
    Paper,
    Tooltip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    Eye,
    UploadSimple,
    CurrencyInr,
    User,
    CloudArrowUp,
    Play,
    CheckCircle,
    DownloadSimple,
    FileText,
    EnvelopeSimple,
    X,
    DotsThreeCircle,
    FileArrowDown,
    ArrowCounterClockwise,
} from "@phosphor-icons/react";
import CustomSnackBar from "../Custom/CustomSnackBar";

const dialogStyle = {
    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
};

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "6px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
};

const statusOptions = [
    { value: "assigned", label: "Assigned" },
    { value: "requirement-submitted", label: "Req Submitted" },
    { value: "advance-payment-pending", label: "Adv. Payment Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "ready-for-demo", label: "Ready for Demo" },
    { value: "final-payment-pending", label: "Final Payment Pending" },
    { value: "ready-for-download", label: "Ready for Download" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
];

const projectTypeOptions = [
    { value: "website", label: "Website Development" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "report", label: "Project Report" },
    { value: "ppt", label: "Presentation (PPT)" },
    { value: "research", label: "Research Paper" },
    { value: "code", label: "Coding Project" },
    { value: "design", label: "Design Work" },
    { value: "other", label: "Other" },
];

const ProjectSubmissions = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [requirementModal, setRequirementModal] = useState(false);
    const [advancePaymentModal, setAdvancePaymentModal] = useState(false);
    const [finalPaymentModal, setFinalPaymentModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [viewRequirementModal, setViewRequirementModal] = useState(false);
    const [viewFilesModal, setViewFilesModal] = useState(false);

    const [requirementForm, setRequirementForm] = useState({ projectType: "other", collegeGuidelines: "", notes: "" });
    const [paymentForm, setPaymentForm] = useState({ amount: 0, notes: "" });
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);
    const [reportForm, setReportForm] = useState({ format: "excel", status: "all" });

    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["project-requirements"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data || [];
        },
    });

    const triggerMutation = useMutation({
        mutationFn: async ({ id, endpoint, data = {} }: { id: string, endpoint: string, data?: any }) => {
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${id}/${endpoint}`, data, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: (_, variables) => {
            CustomSnackBar.successSnackbar(`Success! Action: ${variables.endpoint}`);
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
            setRequirementModal(false);
            setAdvancePaymentModal(false);
            setFinalPaymentModal(false);
            setUploadModal(false);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Operation failed"),
    });

    const uploadMutation = useMutation({
        mutationFn: async (id: string) => {
            const formData = new FormData();
            uploadFiles.forEach((file) => formData.append("files", file));
            formData.append("fileTypes", JSON.stringify(fileTypes));
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/project-assignments/${id}/upload-files`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["project-requirements"] });
            setUploadModal(false);
            setUploadFiles([]);
            setFileTypes([]);
        },
    });

    const getStatusChip = (status: string) => {
        const label = statusOptions.find(o => o.value === status)?.label || status;
        return <Chip label={label} size="small" sx={{ bgcolor: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.2)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }} />;
    };

    const filteredAssignments = assignments?.filter((item: any) => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return !["delivered", "completed"].includes(item.status);
        if (tabValue === 2) return ["delivered", "completed"].includes(item.status);
        return true;
    });

    return (
        <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <FileArrowDown size={28} weight="duotone" style={{ color: "#3b82f6" }} />
                    <Typography sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase" }}>Workflow Tracker</Typography>
                </Box>
                <Button variant="contained" startIcon={<DownloadSimple size={18} weight="bold" />} onClick={() => setReportModal(true)} sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 2.5 }}>Generate Report</Button>
            </Box>

            <Box sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ "& .MuiTabs-indicator": { bgcolor: "#3b82f6" }, "& .MuiTab-root": { color: "#64748b", "&.Mui-selected": { color: "#3b82f6" } } }}>
                    <Tab label="All Tracks" />
                    <Tab label="Active" />
                    <Tab label="Archived" />
                </Tabs>
            </Box>

            <TableContainer className="table_border" sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.6)" }}>
                <Table>
                    <TableHead sx={{ bgcolor: "rgba(15, 23, 42, 0.8)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>STUDENT</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>PROJECT</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>STATUS</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>PAYMENTS</TableCell>
                            <TableCell align="center" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>WORKFLOW ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAssignments?.map((item: any) => (
                            <TableRow key={item._id} sx={{ "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } }}>
                                <TableCell>
                                    <Box>
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "13px" }}>{item.student?.name}</Typography>
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>{item.student?.email}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ color: "#f1f5f9", fontSize: "13px" }}>{item.itemId?.title || item.itemId?.name}</Typography>
                                    <Typography variant="caption" sx={{ color: "#64748b" }}>Assigned: {new Date(item.assignedAt).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell>{getStatusChip(item.status)}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <CurrencyInr size={14} color="#4ade80" weight="bold" />
                                            <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px" }}>{item.payment?.amount || 0}</Typography>
                                            <Chip label={item.payment?.status?.toUpperCase()} size="small" sx={{ height: 16, fontSize: "8px", fontWeight: 800, bgcolor: item.payment?.status === "paid" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)", color: item.payment?.status === "paid" ? "#4ade80" : "#fbbf24" }} />
                                        </Box>
                                        {item.payment?.proofFile && (
                                            <Button size="small" startIcon={<Eye size={12} />} onClick={() => openFileInNewTab(item.payment.proofFile)} sx={{ color: "#3b82f6", textTransform: "none", fontSize: "10px", p: 0, justifyContent: "flex-start" }}>View Proof</Button>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}>
                                        {item.status === "assigned" && (
                                            <>
                                                <Button size="small" variant="contained" onClick={() => triggerMutation.mutate({ id: item._id, endpoint: "trigger-email" })} sx={{ bgcolor: "#ef4444", fontSize: "11px" }}>Send Mail</Button>
                                                <Button size="small" variant="outlined" onClick={() => { setSelectedAssignment(item); setRequirementModal(true); }} sx={{ color: "#94a3b8", borderColor: "rgba(71, 85, 105, 0.4)", fontSize: "11px" }}>Requirements</Button>
                                            </>
                                        )}
                                        {item.status === "requirement-submitted" && (
                                            <>
                                                <Button size="small" variant="contained" onClick={() => { setSelectedAssignment(item); setAdvancePaymentModal(true); }} sx={{ bgcolor: "#3b82f6", fontSize: "11px" }}>Request Adv</Button>
                                                <IconButton size="small" onClick={() => { setSelectedAssignment(item); setViewRequirementModal(true); }} sx={{ color: "#60a5fa" }}><Eye size={18} /></IconButton>
                                            </>
                                        )}
                                        {item.status === "advance-payment-pending" && (
                                            <Button size="small" variant="contained" onClick={() => triggerMutation.mutate({ id: item._id, endpoint: "start-work" })} sx={{ bgcolor: "#22c55e", fontSize: "11px" }}>Confirm & Start</Button>
                                        )}
                                        {item.status === "in-progress" && (
                                            <Button size="small" variant="contained" onClick={() => triggerMutation.mutate({ id: item._id, endpoint: "ready-for-demo" })} sx={{ bgcolor: "#8b5cf6", fontSize: "11px" }}>Ready for Demo</Button>
                                        )}
                                        {item.status === "ready-for-demo" && (
                                            <Button size="small" variant="contained" onClick={() => { setSelectedAssignment(item); setFinalPaymentModal(true); }} sx={{ bgcolor: "#3b82f6", fontSize: "11px" }}>Request Final</Button>
                                        )}
                                        {item.status === "final-payment-pending" && (
                                            <Button size="small" variant="contained" onClick={() => { setSelectedAssignment(item); setUploadModal(true); }} sx={{ bgcolor: "#22c55e", fontSize: "11px" }}>Confirm & Upload</Button>
                                        )}
                                        {item.status === "ready-for-download" && (
                                            <>
                                                <Button size="small" variant="outlined" color="success" onClick={() => triggerMutation.mutate({ id: item._id, endpoint: "delivered" })} sx={{ fontSize: "11px" }}>Mark Delivered</Button>
                                                <Button size="small" variant="text" onClick={() => { setSelectedAssignment(item); setViewFilesModal(true); }} sx={{ color: "#3b82f6", fontSize: "11px" }}>View Files</Button>
                                            </>
                                        )}
                                        {["delivered", "completed"].includes(item.status) && (
                                            <IconButton size="small" onClick={() => { setSelectedAssignment(item); setViewFilesModal(true); }} sx={{ color: "#4ade80" }}><CheckCircle size={20} weight="fill" /></IconButton>
                                        )}
                                        <Tooltip title="Resend Notification">
                                            <IconButton size="small" onClick={() => triggerMutation.mutate({ id: item._id, endpoint: "resend-email" })} sx={{ color: "#94a3b8" }}><ArrowCounterClockwise size={16} /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modals - using shared dialog style and dark components */}
            <Dialog open={requirementModal} onClose={() => setRequirementModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Submit Requirements (Admin)</Typography>
                    <IconButton onClick={() => setRequirementModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField select label="Project Type" value={requirementForm.projectType} onChange={(e) => setRequirementForm({ ...requirementForm, projectType: e.target.value })} fullWidth sx={textFieldDarkStyles}>
                        {projectTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Guidelines" value={requirementForm.collegeGuidelines} onChange={(e) => setRequirementForm({ ...requirementForm, collegeGuidelines: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} />
                    <TextField label="Internal Notes" value={requirementForm.notes} onChange={(e) => setRequirementForm({ ...requirementForm, notes: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} />
                </Box>
                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setRequirementModal(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" onClick={() => triggerMutation.mutate({ id: selectedAssignment?._id, endpoint: "submit-requirement", data: requirementForm })} sx={{ bgcolor: "#3b82f6" }}>Submit</Button>
                </Box>
            </Dialog>

            <Dialog open={advancePaymentModal} onClose={() => setAdvancePaymentModal(false)} maxWidth="xs" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Request Advance</Typography>
                    <IconButton onClick={() => setAdvancePaymentModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField label="Amount (₹)" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: +e.target.value })} fullWidth sx={textFieldDarkStyles} />
                    <TextField label="Payment Note" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} fullWidth sx={textFieldDarkStyles} />
                </Box>
                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setAdvancePaymentModal(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" onClick={() => triggerMutation.mutate({ id: selectedAssignment?._id, endpoint: "request-advance", data: paymentForm })} sx={{ bgcolor: "#3b82f6" }}>Send Request</Button>
                </Box>
            </Dialog>

            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Upload Delivery Files</Typography>
                    <IconButton onClick={() => setUploadModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Button variant="outlined" component="label" startIcon={<CloudArrowUp size={20} />} fullWidth sx={{ mb: 3, py: 1.5, borderColor: "rgba(71, 85, 105, 0.4)", color: "#94a3b8" }}>
                        Select Project Files
                        <input type="file" hidden multiple onChange={(e) => {
                            if (e.target.files) {
                                const files = Array.from(e.target.files);
                                setUploadFiles([...uploadFiles, ...files]);
                                setFileTypes([...fileTypes, ...files.map(() => "project-file")]);
                            }
                        }} />
                    </Button>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {uploadFiles.map((file, i) => (
                            <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <Typography variant="caption" sx={{ flex: 1, color: "#f1f5f9" }}>{file.name}</Typography>
                                <TextField select size="small" value={fileTypes[i]} onChange={(e) => { const nt = [...fileTypes]; nt[i] = e.target.value; setFileTypes(nt); }} sx={{ width: 140, ...textFieldDarkStyles }}>
                                    <MenuItem value="project-file">General</MenuItem>
                                    <MenuItem value="source-code">Source Code</MenuItem>
                                    <MenuItem value="report">Report</MenuItem>
                                    <MenuItem value="ppt">PPT</MenuItem>
                                </TextField>
                                <IconButton size="small" onClick={() => { setUploadFiles(uploadFiles.filter((_, idx) => idx !== i)); setFileTypes(fileTypes.filter((_, idx) => idx !== i)); }} sx={{ color: "#ef4444" }}><X size={14} /></IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setUploadModal(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" disabled={uploadFiles.length === 0} onClick={() => uploadMutation.mutate(selectedAssignment?._id)} sx={{ bgcolor: "#22c55e" }}>Complete & Notify</Button>
                </Box>
            </Dialog>

            <Dialog open={viewFilesModal} onClose={() => setViewFilesModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Delivery Files</Typography>
                    <IconButton onClick={() => setViewFilesModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    {selectedAssignment?.deliveryFiles?.map((file: any, i: number) => (
                        <Box key={i} sx={{ p: 2, bgcolor: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(71, 85, 105, 0.3)", borderRadius: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography sx={{ color: "#f1f5f9", fontWeight: 600, fontSize: "14px" }}>{file.fileName}</Typography>
                                <Chip label={file.fileType} size="small" sx={{ height: 16, fontSize: "9px", bgcolor: "rgba(59, 130, 246, 0.1)", color: "#60a5fa" }} />
                            </Box>
                            <Button size="small" startIcon={<DownloadSimple />} onClick={() => downloadFileAsBlob(file.filePath, file.fileName)} sx={{ color: "#3b82f6" }}>Download</Button>
                        </Box>
                    )) || <Typography sx={{ color: "#64748b", textAlign: "center" }}>No files uploaded yet.</Typography>}
                </Box>
            </Dialog>
        </Box>
    );
};

export default ProjectSubmissions;
