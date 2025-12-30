import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Chip,
    Button,
    TextField,
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
    Tooltip,
    MenuItem,
    Divider,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);
import {
    Student,
    BookOpen,
    CheckCircle,
    DownloadSimple,
    CurrencyInr,
    Certificate,
    UploadSimple,
    Eye,
    PencilSimple,
    X,
    DotsThreeCircle,
    FileText,
    Receipt,
} from "@phosphor-icons/react";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import background from "../../assets/Images/certificate_bg.jpg";
import { useGenerateInvoice } from "../../Hooks/payment";
import { openFileInNewTab, normalizeDownloadUrl } from "../../utils/normalizeUrl";

const dialogStyle = {
    "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px" },
    "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
};

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "2px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
};

const CourseSubmissionsList = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [viewFilesModal, setViewFilesModal] = useState(false);
    const [certificateModal, setCertificateModal] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [generating, setGenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState<{ amount: string | number; notes: string }>({ amount: "", notes: "" });
    const generateInvoiceMutation = useGenerateInvoice();

    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    const [certEditModal, setCertEditModal] = useState(false);
    const [certForm, setCertForm] = useState({
        recipientName: "",
        domain: "",
        startDate: "",
        endDate: ""
    });
    const [regenerating, setRegenerating] = useState(false);

    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["course-assignments"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/assignments?itemType=course`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
    });

    const handleGenerateCertificate = async () => {
        if (!certificateRef.current || !selectedAssignment) return;
        setGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false });
            const imgData = canvas.toDataURL("image/jpeg", 0.85);
            const pdf = new jsPDF("l", "mm", "a4");
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "JPEG", 0, 0, width, height);

            const pdfBlob = pdf.output("blob");
            const formData = new FormData();
            formData.append("certificate", pdfBlob, `${selectedAssignment.student.name}_Certificate.pdf`);

            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/complete`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });

            CustomSnackBar.successSnackbar("Certificate issued & Course Completed!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setCertificateModal(false);
        } catch (err: any) {
            CustomSnackBar.errorSnackbar("Failed to generate certificate");
        } finally { setGenerating(false); }
    };

    const handleGenerateInvoice = async (item: any) => {
        if (item.invoice?.url) { window.open(normalizeDownloadUrl(item.invoice.url), "_blank"); return; }
        generateInvoiceMutation.mutate(item._id, {
            onSuccess: (data: any) => {
                CustomSnackBar.successSnackbar("Invoice generated!");
                if (data.invoice?.url) window.open(normalizeDownloadUrl(data.invoice.url), "_blank");
            },
            onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to generate invoice")
        });
    };

    const uploadFilesMutation = useMutation({
        mutationFn: async (id: string) => {
            const formData = new FormData();
            uploadFiles.forEach((file) => formData.append("files", file));
            formData.append("fileTypes", JSON.stringify(fileTypes));
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${id}/upload-files`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setUploadModal(false);
        },
    });

    const requestPaymentMutation = useMutation({
        mutationFn: async () => {
            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/request-payment`, paymentForm, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Payment requested!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setPaymentModal(false);
        },
    });

    const handleRegenerateCertificate = async () => {
        if (!certificateRef.current || !selectedAssignment) return;
        setRegenerating(true);
        try {
            await axios.put(`${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/certificate-details`, certForm, { headers: { Authorization: `Bearer ${token}` } });
            await new Promise(resolve => setTimeout(resolve, 500));
            const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false });
            const imgData = canvas.toDataURL("image/jpeg", 0.85);
            const pdf = new jsPDF("l", "mm", "a4");
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "JPEG", 0, 0, width, height);

            const pdfBlob = pdf.output("blob");
            const formData = new FormData();
            formData.append("certificate", pdfBlob, `${certForm.recipientName}_Certificate.pdf`);

            await axios.post(`${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/regenerate-certificate`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });

            CustomSnackBar.successSnackbar("Certificate regenerated!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setCertEditModal(false);
        } catch (err: any) {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to regenerate certificate");
        } finally { setRegenerating(false); }
    };

    const handleOpenPayment = (item: any) => {
        setSelectedAssignment(item);
        let initialAmount: string | number = "";
        if (item?.itemId) {
            const price = Number(item.itemId.price || item.itemId.prize || 0);
            const discount = Number(item.itemId.discount || 0);
            if (price > 0) initialAmount = discount > 0 ? Math.round(price - (price * discount) / 100) : price;
        }
        setPaymentForm({ amount: initialAmount, notes: "" });
        setPaymentModal(true);
    };

    const filteredAssignments = assignments?.filter((a: any) => {
        if (tabValue === 0) return a.status !== "completed";
        if (tabValue === 1) return a.status === "completed";
        return true;
    }) || [];

    if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ "& .MuiTabs-indicator": { bgcolor: "#3b82f6" }, "& .MuiTab-root": { color: "#64748b", "&.Mui-selected": { color: "#3b82f6" } } }}>
                    <Tab label="Active Courses" />
                    <Tab label="Certified" />
                </Tabs>
            </Box>

            <TableContainer className="table_border" sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.6)" }}>
                <Table>
                    <TableHead sx={{ bgcolor: "rgba(15, 23, 42, 0.8)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>STUDENT</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>COURSE</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>STATUS</TableCell>
                            <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>PAYMENT</TableCell>
                            <TableCell align="center" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em" }}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAssignments.map((row: any) => (
                            <TableRow key={row._id} sx={{ "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } }}>
                                <TableCell>
                                    <Box>
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "13px" }}>{row.student?.name}</Typography>
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>{row.student?.email}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: "#f1f5f9", fontSize: "13px" }}>{row.itemId?.name}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} size="small" sx={{ bgcolor: row.status === "completed" ? "rgba(34, 197, 94, 0.1)" : "rgba(59, 130, 246, 0.1)", color: row.status === "completed" ? "#4ade80" : "#60a5fa", border: `1px solid ${row.status === "completed" ? "rgba(34, 197, 94, 0.2)" : "rgba(59, 130, 246, 0.2)"}`, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <CurrencyInr size={14} color="#4ade80" weight="bold" />
                                            <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px" }}>{row.payment?.amount || 0}</Typography>
                                            <Chip label={row.payment?.status?.toUpperCase() || "N/A"} size="small" sx={{ height: 16, fontSize: "8px", fontWeight: 800, bgcolor: row.payment?.status === "paid" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)", color: row.payment?.status === "paid" ? "#4ade80" : "#fbbf24" }} />
                                        </Box>
                                        {row.payment?.proofFile && <Button size="small" startIcon={<Eye size={12} />} onClick={() => openFileInNewTab(row.payment.proofFile)} sx={{ color: "#3b82f6", textTransform: "none", fontSize: "10px", p: 0, justifyContent: "flex-start" }}>View Proof</Button>}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                                        {!row.payment?.required && row.status !== "completed" && (
                                            <Tooltip title="Request Payment"><IconButton size="small" onClick={() => handleOpenPayment(row)} sx={{ color: "#fbbf24" }}><CurrencyInr size={18} /></IconButton></Tooltip>
                                        )}
                                        {row.payment?.status === "paid" && (
                                            <Tooltip title="Tax Invoice"><IconButton size="small" onClick={() => handleGenerateInvoice(row)} sx={{ color: "#3b82f6" }}><Receipt size={18} /></IconButton></Tooltip>
                                        )}
                                        {row.status !== "completed" ? (
                                            <>
                                                <Tooltip title="Upload Resources"><IconButton size="small" onClick={() => { setSelectedAssignment(row); setUploadModal(true); setUploadFiles([]); setFileTypes([]); }} sx={{ color: "#3b82f6" }}><UploadSimple size={18} /></IconButton></Tooltip>
                                                <Tooltip title="Grade & Issue Certificate"><IconButton size="small" onClick={() => { setSelectedAssignment(row); setCertificateModal(true); }} sx={{ color: "#4ade80" }}><Certificate size={18} /></IconButton></Tooltip>
                                            </>
                                        ) : (
                                            <Tooltip title="Regenerate Certificate"><IconButton size="small" onClick={() => {
                                                setSelectedAssignment(row);
                                                setCertForm({ recipientName: row.certificateDetails?.recipientName || row.student?.name || "", domain: row.certificateDetails?.domain || row.itemId?.name || "", startDate: row.certificateDetails?.startDate ? new Date(row.certificateDetails.startDate).toISOString().split('T')[0] : "", endDate: row.certificateDetails?.endDate ? new Date(row.certificateDetails.endDate).toISOString().split('T')[0] : "" });
                                                setCertEditModal(true);
                                            }} sx={{ color: "#a855f7" }}><PencilSimple size={18} /></IconButton></Tooltip>
                                        )}
                                        <Tooltip title="Submissions"><IconButton size="small" onClick={() => { setSelectedAssignment(row); setViewFilesModal(true); }} sx={{ color: "#94a3b8" }}><FileText size={18} /></IconButton></Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Hidden Certificate for Generator */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <div ref={certificateRef} style={{ width: "1123px", height: "794px", position: "relative", background: `url(${background})`, backgroundSize: "cover", fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "80%" }}>
                        <div style={{ fontSize: "52px", fontWeight: 800, color: "#1e293b", marginBottom: "30px", textTransform: "uppercase" }}>{certEditModal ? certForm.recipientName : selectedAssignment?.student?.name}</div>
                        <div style={{ fontSize: "20px", color: "#475569", lineHeight: 1.6 }}>Has successfully completed the professional development course in</div>
                        <div style={{ fontSize: "32px", fontWeight: 700, color: "#020617", margin: "20px 0", textTransform: "capitalize" }}>{certEditModal ? certForm.domain : selectedAssignment?.itemId?.name}</div>
                        <div style={{ fontSize: "16px", color: "#64748b", marginTop: "40px" }}>Duration: {dayjs(certEditModal ? certForm.startDate : (selectedAssignment?.certificateDetails?.startDate || selectedAssignment?.itemId?.startDate)).format("Do MMMM YYYY")} to {dayjs(certEditModal ? certForm.endDate : (selectedAssignment?.certificateDetails?.endDate || selectedAssignment?.itemId?.endDate)).format("Do MMMM YYYY")}</div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Upload Course Materials</Typography>
                    <IconButton onClick={() => setUploadModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Button variant="outlined" component="label" startIcon={<UploadSimple size={20} />} fullWidth sx={{ mb: 3, py: 2, borderColor: "rgba(71, 85, 105, 0.4)", color: "#94a3b8", borderStyle: "dashed" }}>
                        Click to select files
                        <input type="file" hidden multiple onChange={(e) => { if (e.target.files) { const files = Array.from(e.target.files); setUploadFiles([...uploadFiles, ...files]); setFileTypes([...fileTypes, ...files.map(() => "course-material")]); } }} />
                    </Button>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {uploadFiles.map((file, i) => (
                            <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "center", p: 1, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "1px" }}>
                                <Typography variant="caption" sx={{ flex: 1, color: "#f1f5f9" }}>{file.name}</Typography>
                                <TextField select size="small" value={fileTypes[i]} onChange={(e) => { const nt = [...fileTypes]; nt[i] = e.target.value; setFileTypes(nt); }} sx={{ width: 140, ...textFieldDarkStyles }}>
                                    <MenuItem value="course-material">Material</MenuItem>
                                    <MenuItem value="assignment">Assignment</MenuItem>
                                    <MenuItem value="source-code">Code</MenuItem>
                                </TextField>
                                <IconButton size="small" onClick={() => { setUploadFiles(uploadFiles.filter((_, idx) => idx !== i)); setFileTypes(fileTypes.filter((_, idx) => idx !== i)); }} sx={{ color: "#ef4444" }}><X size={14} /></IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button onClick={() => setUploadModal(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button variant="contained" disabled={uploadFiles.length === 0} onClick={() => uploadFilesMutation.mutate(selectedAssignment?._id)} sx={{ bgcolor: "#3b82f6" }}>Upload Files</Button>
                </Box>
            </Dialog>

            <Dialog open={certificateModal} onClose={() => setCertificateModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Issue Certificate</Typography>
                    <IconButton onClick={() => setCertificateModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography sx={{ color: "#94a3b8", mb: 3 }}>This will generate a certificate for <strong>{selectedAssignment?.student?.name}</strong> and mark the course as completed.</Typography>
                    <Button variant="contained" fullWidth size="large" onClick={handleGenerateCertificate} disabled={generating} sx={{ bgcolor: "#22c55e", py: 2, fontSize: "16px", fontWeight: 700 }}>{generating ? "Generating Certificate..." : "Generate & Complete Course"}</Button>
                </Box>
            </Dialog>

            <Dialog open={certEditModal} onClose={() => setCertEditModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Update & Regenerate</Typography>
                    <IconButton onClick={() => setCertEditModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField label="Student Name" value={certForm.recipientName} onChange={(e) => setCertForm({ ...certForm, recipientName: e.target.value })} fullWidth sx={textFieldDarkStyles} />
                    <TextField label="Course / Domain" value={certForm.domain} onChange={(e) => setCertForm({ ...certForm, domain: e.target.value })} fullWidth sx={textFieldDarkStyles} />
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField type="date" label="Start Date" value={certForm.startDate} onChange={(e) => setCertForm({ ...certForm, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} />
                        <TextField type="date" label="End Date" value={certForm.endDate} onChange={(e) => setCertForm({ ...certForm, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={textFieldDarkStyles} />
                    </Box>
                    <Button variant="contained" fullWidth size="large" onClick={handleRegenerateCertificate} disabled={regenerating} sx={{ bgcolor: "#a855f7", mt: 2 }}>{regenerating ? "Regenerating..." : "Regenerate Certificate"}</Button>
                </Box>
            </Dialog>

            <Dialog open={paymentModal} onClose={() => setPaymentModal(false)} maxWidth="xs" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Request Payment</Typography>
                    <IconButton onClick={() => setPaymentModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField label="Amount (₹)" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} fullWidth sx={textFieldDarkStyles} />
                    <TextField label="Notes" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} fullWidth multiline rows={2} sx={textFieldDarkStyles} />
                    <Button variant="contained" fullWidth size="large" onClick={() => requestPaymentMutation.mutate()} sx={{ bgcolor: "#fbbf24", color: "#000", fontWeight: 700 }}>Send Payment Link</Button>
                </Box>
            </Dialog>

            <Dialog open={viewFilesModal} onClose={() => setViewFilesModal(false)} maxWidth="sm" fullWidth sx={dialogStyle}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>Course Files</Typography>
                    <IconButton onClick={() => setViewFilesModal(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: "#3b82f6", fontWeight: 800 }}>Materials Uploaded</Typography>
                        {selectedAssignment?.deliveryFiles?.map((f: any, i: number) => (
                            <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, p: 1.5, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "1px" }}>
                                <Typography sx={{ color: "#f1f5f9", fontSize: "13px" }}>{f.fileName}</Typography>
                                <Button size="small" onClick={() => openFileInNewTab(f.filePath)} sx={{ color: "#3b82f6" }}>View</Button>
                            </Box>
                        )) || <Typography variant="caption" display="block" sx={{ color: "#64748b" }}>None</Typography>}
                    </Box>
                    <Divider sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }} />
                    <Box>
                        <Typography variant="overline" sx={{ color: "#22c55e", fontWeight: 800 }}>Student Submissions</Typography>
                        {selectedAssignment?.courseSubmissions?.map((f: any, i: number) => (
                            <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, p: 1.5, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "1px" }}>
                                <Typography sx={{ color: "#f1f5f9", fontSize: "13px" }}>{f.fileName}</Typography>
                                <Button size="small" onClick={() => openFileInNewTab(f.filePath)} sx={{ color: "#22c55e" }}>View</Button>
                            </Box>
                        )) || <Typography variant="caption" display="block" sx={{ color: "#64748b" }}>None</Typography>}
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default CourseSubmissionsList;
