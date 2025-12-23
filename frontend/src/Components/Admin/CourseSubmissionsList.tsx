import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Card,
    Chip,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Tooltip,
    MenuItem
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    MdSchool,
    MdUpload,
    MdCheckCircle,
    MdPerson,
    MdAssignment,
    MdAttachMoney,
    MdPayment,
    MdDownload,
    MdDelete
} from "react-icons/md";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/Images/blacklogo.png";
import background from "../../assets/Images/background.png";
import msme from "../../assets/Images/msms.png";
import iso from "../../assets/Images/isonew.png";
import iaf from "../../assets/Images/iaf.png";
import sign from "../../assets/Images/dummysign.png";
import { useGenerateInvoice } from "../../Hooks/payment";

const CourseSubmissionsList = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // Modals state
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [viewFilesModal, setViewFilesModal] = useState(false);
    // Certificate Generation
    const [certificateModal, setCertificateModal] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [generating, setGenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    // Payment State
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState<{ amount: string | number; notes: string }>({ amount: "", notes: "" });
    const generateInvoiceMutation = useGenerateInvoice();

    // Upload Form State
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    const handleGenerateCertificate = async () => {
        if (!certificateRef.current || !selectedAssignment) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(certificateRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("l", "mm", "a4");
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "PNG", 0, 0, width, height);

            // Convert PDF to Blob
            const pdfBlob = pdf.output("blob");
            const formData = new FormData();
            formData.append("certificate", pdfBlob, `${selectedAssignment.student.name}_Certificate.pdf`);

            // Upload & Complete
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/complete`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            CustomSnackBar.successSnackbar("Certificate issued & Course Completed!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setCertificateModal(false);
        } catch (err: any) {
            console.error("Certificate Error:", err);
            CustomSnackBar.errorSnackbar("Failed to generate certificate");
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateInvoice = async (item: any) => {
        // Check if invoice already exists
        if (item.invoice?.url) {
            window.open(item.invoice.url, "_blank");
            return;
        }
        // Generate new invoice via API
        generateInvoiceMutation.mutate(item._id, {
            onSuccess: (data: any) => {
                CustomSnackBar.successSnackbar("Invoice generated!");
                if (data.invoice?.url) {
                    window.open(data.invoice.url, "_blank");
                }
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to generate invoice");
            }
        });
    };

    // Fetch assignments
    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["course-assignments"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments?itemType=course`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    // Upload Files Mutation (Multiple)
    const uploadFilesMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const formData = new FormData();
            uploadFiles.forEach((file) => formData.append("files", file));
            formData.append("fileTypes", JSON.stringify(fileTypes));

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${assignmentId}/upload-files`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setUploadModal(false);
            setUploadFiles([]);
            setFileTypes([]);
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload files");
        },
    });

    const completeMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            if (certificateFile) formData.append("certificate", certificateFile);

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/complete`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Course completed and certificate issued");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setCertificateModal(false);
            setCertificateFile(null);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to complete course"),
    });

    const requestPaymentMutation = useMutation({
        mutationFn: async () => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/request-payment`,
                paymentForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Payment requested!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setPaymentModal(false);
            setPaymentForm({ amount: 0, notes: "" });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to request payment"),
    });

    // Handlers
    const handleOpenUpload = (item: any) => { setSelectedAssignment(item); setUploadModal(true); setUploadFiles([]); setFileTypes([]); };
    const handleOpenViewFiles = (item: any) => { setSelectedAssignment(item); setViewFilesModal(true); };
    const handleOpenCertificate = (item: any) => { setSelectedAssignment(item); setCertificateModal(true); };
    const handleOpenPayment = (item: any) => {
        setSelectedAssignment(item);

        let initialAmount: string | number = "";
        if (item?.itemId) {
            const price = Number(item.itemId.price || item.itemId.prize || 0);
            const discount = Number(item.itemId.discount || 0);
            if (price > 0) {
                initialAmount = discount > 0 ? Math.round(price - (price * discount) / 100) : price;
            }
        }

        setPaymentForm({ amount: initialAmount, notes: "" });
        setPaymentModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadFiles([...uploadFiles, ...newFiles]);
            setFileTypes([...fileTypes, ...newFiles.map(() => "other")]);
        }
    };

    const handleFileTypeChange = (index: number, type: string) => {
        const newTypes = [...fileTypes];
        newTypes[index] = type;
        setFileTypes(newTypes);
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = [...uploadFiles];
        const newTypes = [...fileTypes];
        newFiles.splice(index, 1);
        newTypes.splice(index, 1);
        setUploadFiles(newFiles);
        setFileTypes(newTypes);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "success";
            case "assigned": return "info";
            default: return "default";
        }
    };

    // Filter assignments based on tab
    const filteredAssignments = assignments?.filter((a: any) => {
        if (tabValue === 0) return a.status !== "completed"; // Active
        if (tabValue === 1) return a.status === "completed"; // Completed
        return true;
    }) || [];

    if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading data</Alert>;

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab label="Active Courses" />
                    <Tab label="Completed / Certified" />
                </Tabs>

                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Assigned At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignments.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center">No courses found</TableCell></TableRow>
                            ) : filteredAssignments.map((row: any) => (
                                <TableRow key={row._id}>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <MdPerson />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{row.student?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{row.student?.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.itemId?.name}</TableCell>
                                    <TableCell>
                                        <Chip label={row.status} size="small" color={getStatusColor(row.status) as any} />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {row.payment?.amount ? `₹${row.payment.amount}` : "N/A"}
                                            </Typography>
                                            <Chip
                                                label={row.payment?.status?.toUpperCase() || "NOT REQ"}
                                                size="small"
                                                color={row.payment?.status === "paid" ? "success" : row.payment?.status === "pending" ? "warning" : "default"}
                                                sx={{ height: 20, fontSize: "0.6rem", width: "fit-content" }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>{new Date(row.assignedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxWidth: 250 }}>
                                            {/* Payment Actions */}
                                            {(!row.payment?.required && row.status !== "completed" && row.status !== "delivered") && (
                                                <Tooltip title="Request Payment">
                                                    <IconButton size="small" color="warning" onClick={() => handleOpenPayment(row)}>
                                                        <MdAttachMoney />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {row.payment?.status === "paid" && (
                                                <Tooltip title={row.invoice?.url ? "Download Invoice" : "Generate Invoice"}>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleGenerateInvoice(row)}
                                                        disabled={generateInvoiceMutation.isPending}
                                                    >
                                                        {generateInvoiceMutation.isPending ? <CircularProgress size={20} /> : <MdPayment />}
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {/* Upload Assignment (Files) */}
                                            {row.status !== "completed" ? (
                                                <>
                                                    <Tooltip title="Upload Files">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenUpload(row)}>
                                                            <MdUpload />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Complete & Issue Certificate">
                                                        <IconButton size="small" color="success" onClick={() => handleOpenCertificate(row)}>
                                                            <MdSchool />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <IconButton size="small" color="success" disabled>
                                                    <MdCheckCircle />
                                                </IconButton>
                                            )}
                                            <Tooltip title="View Submissions">
                                                <IconButton size="small" onClick={() => handleOpenViewFiles(row)}>
                                                    <MdAssignment />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Upload Modal (Multi-file) - Premium Design */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                    borderBottom: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}>
                    <MdUpload /> Upload Course Materials
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <Alert severity="info" sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                            Upload study materials, resources, or assignments for <strong>{selectedAssignment?.student?.name}</strong>
                        </Alert>

                        {/* Drag & Drop Area */}
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                height: 120,
                                borderStyle: "dashed",
                                borderWidth: 2,
                                borderColor: "var(--webprimary)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                fontFamily: "Regular_W",
                                "&:hover": {
                                    bgcolor: "rgba(var(--webprimary-rgb), 0.05)",
                                    borderColor: "var(--webprimary)"
                                }
                            }}
                        >
                            <MdUpload size={40} color="var(--webprimary)" />
                            <Typography sx={{ fontFamily: "Medium_W", fontSize: "14px", color: "var(--webprimary)" }}>
                                Click to Select Files
                            </Typography>
                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "11px", color: "var(--greyText)" }}>
                                PDF, Documents, Videos, Source Code
                            </Typography>
                            <input type="file" hidden multiple onChange={handleFileChange} />
                        </Button>

                        {/* File List */}
                        {uploadFiles.length > 0 && (
                            <Box sx={{
                                maxHeight: 250,
                                overflowY: "auto",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px"
                            }}>
                                <Typography sx={{
                                    fontFamily: "SemiBold_W",
                                    fontSize: "12px",
                                    p: 1.5,
                                    bgcolor: "#f8f9fa",
                                    borderBottom: "1px solid #e0e0e0"
                                }}>
                                    {uploadFiles.length} File{uploadFiles.length > 1 ? "s" : ""} Selected
                                </Typography>
                                {uploadFiles.map((file, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            gap: 1.5,
                                            alignItems: "center",
                                            p: 1.5,
                                            borderBottom: index < uploadFiles.length - 1 ? "1px solid #f0f0f0" : "none",
                                            "&:hover": { bgcolor: "#fafafa" }
                                        }}
                                    >
                                        <MdAssignment size={20} color="var(--webprimary)" />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{
                                                fontFamily: "Medium_W",
                                                fontSize: "13px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {file.name}
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "11px", color: "var(--greyText)" }}>
                                                {(file.size / 1024).toFixed(1)} KB
                                            </Typography>
                                        </Box>
                                        <TextField
                                            select
                                            size="small"
                                            value={fileTypes[index] || "other"}
                                            onChange={(e) => handleFileTypeChange(index, e.target.value)}
                                            sx={{
                                                width: 140,
                                                "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "12px" }
                                            }}
                                        >
                                            <MenuItem value="course-material"> Course Material</MenuItem>
                                            <MenuItem value="assignment">📝 Assignment</MenuItem>
                                            <MenuItem value="video">🎬 Video</MenuItem>
                                            <MenuItem value="notes">📄 Notes</MenuItem>
                                            <MenuItem value="presentation">📊 Presentation</MenuItem>
                                            <MenuItem value="source-code">💻 Source Code</MenuItem>
                                            <MenuItem value="other">📎 Other</MenuItem>
                                        </TextField>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveFile(index)}
                                            sx={{ color: "#ef4444" }}
                                        >
                                            <MdDelete />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0", gap: 1 }}>
                    <Button
                        onClick={() => setUploadModal(false)}
                        sx={{ fontFamily: "Medium_W", fontSize: "12px" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => uploadFilesMutation.mutate(selectedAssignment?._id)}
                        disabled={uploadFiles.length === 0 || uploadFilesMutation.isPending}
                        sx={{
                            fontFamily: "Medium_W",
                            fontSize: "12px",
                            bgcolor: "var(--webprimary)",
                            "&:hover": { bgcolor: "var(--webprimary)", opacity: 0.9 }
                        }}
                    >
                        {uploadFilesMutation.isPending ? "Uploading..." : `Upload ${uploadFiles.length} File${uploadFiles.length !== 1 ? "s" : ""}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Files Modal - Premium Design */}
            <Dialog open={viewFilesModal} onClose={() => setViewFilesModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                    borderBottom: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}>
                    <MdAssignment /> Files & Submissions
                </DialogTitle>
                <DialogContent>
                    {/* Admin Uploaded Files */}
                    <Box sx={{ mt: 2 }}>
                        <Typography sx={{
                            fontFamily: "SemiBold_W",
                            fontSize: "14px",
                            mb: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}>
                            <MdUpload color="var(--webprimary)" /> Course Materials
                            <Chip
                                label={selectedAssignment?.deliveryFiles?.length || 0}
                                size="small"
                                sx={{ fontFamily: "Medium_W", fontSize: "11px", height: 20 }}
                            />
                        </Typography>
                        {selectedAssignment?.deliveryFiles?.length > 0 ? (
                            <Box sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                maxHeight: 180,
                                overflowY: "auto"
                            }}>
                                {selectedAssignment.deliveryFiles.map((file: any, index: number) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.5,
                                            borderBottom: index < selectedAssignment.deliveryFiles.length - 1 ? "1px solid #f0f0f0" : "none",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            "&:hover": { bgcolor: "#fafafa" }
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <MdDownload size={18} color="var(--webprimary)" />
                                            <Box>
                                                <Typography sx={{ fontFamily: "Medium_W", fontSize: "13px" }}>{file.fileName}</Typography>
                                                <Chip
                                                    label={file.fileType?.replace("-", " ")}
                                                    size="small"
                                                    sx={{
                                                        fontFamily: "Regular_W",
                                                        fontSize: "10px",
                                                        height: 18,
                                                        textTransform: "capitalize"
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        <Button
                                            size="small"
                                            href={file.filePath}
                                            target="_blank"
                                            startIcon={<MdDownload />}
                                            sx={{ fontFamily: "Medium_W", fontSize: "11px" }}
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: "center", bgcolor: "#f8f9fa", borderRadius: "8px" }}>
                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)" }}>
                                    No materials uploaded yet.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Student Submissions */}
                    <Box sx={{ mt: 3 }}>
                        <Typography sx={{
                            fontFamily: "SemiBold_W",
                            fontSize: "14px",
                            mb: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}>
                            <MdPerson color="#22c55e" /> Student Submissions
                            <Chip
                                label={selectedAssignment?.courseSubmissions?.length || 0}
                                size="small"
                                color="success"
                                sx={{ fontFamily: "Medium_W", fontSize: "11px", height: 20 }}
                            />
                        </Typography>
                        {selectedAssignment?.courseSubmissions?.length > 0 ? (
                            <Box sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                maxHeight: 180,
                                overflowY: "auto"
                            }}>
                                {selectedAssignment.courseSubmissions.map((file: any, index: number) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.5,
                                            borderBottom: index < selectedAssignment.courseSubmissions.length - 1 ? "1px solid #f0f0f0" : "none",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            "&:hover": { bgcolor: "#fafafa" }
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <MdAssignment size={18} color="#22c55e" />
                                            <Box>
                                                <Typography sx={{ fontFamily: "Medium_W", fontSize: "13px" }}>{file.fileName}</Typography>
                                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "11px", color: "var(--greyText)" }}>
                                                    Submitted by Student
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            size="small"
                                            href={file.filePath}
                                            target="_blank"
                                            startIcon={<MdDownload />}
                                            sx={{ fontFamily: "Medium_W", fontSize: "11px" }}
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: "center", bgcolor: "#f8f9fa", borderRadius: "8px" }}>
                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)" }}>
                                    No submissions from student yet.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                        onClick={() => setViewFilesModal(false)}
                        sx={{ fontFamily: "Medium_W", fontSize: "12px" }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Complete & Certificate Modal */}
            <Dialog open={certificateModal} onClose={() => setCertificateModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Complete Course & Issue Certificate</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <Alert severity="success">This will mark the course as Completed.</Alert>
                        <Typography variant="subtitle2">Upload Certificate (Optional but Recommended)</Typography>
                        <Button variant="outlined" component="label" startIcon={<MdUpload />}>
                            Select Certificate (PDF/Image)
                            <input type="file" hidden onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
                        </Button>
                        <Typography variant="caption" align="center">- OR -</Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleGenerateCertificate}
                            disabled={generating}
                        >
                            {generating ? "Generating..." : "Auto-Generate Certificate"}
                        </Button>
                        {certificateFile && <Typography variant="body2" color="success.main" fontWeight="bold">Ready: {certificateFile.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCertificateModal(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>Complete Course</Button>
                </DialogActions>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={paymentModal} onClose={() => setPaymentModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Request Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            label="Amount (₹)"
                            type="number"
                            fullWidth
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        />
                        <TextField
                            label="Notes"
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mt: 2 }}
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => requestPaymentMutation.mutate()} disabled={requestPaymentMutation.isPending}>Request</Button>
                </DialogActions>
            </Dialog>

            {/* Hidden Certificate Template for Generation */}
            <Box sx={{ position: "absolute", left: "-3000px", top: 0 }}>
                <Box
                    ref={certificateRef}
                    sx={{
                        position: "relative",
                        width: "800px",
                        height: "530px",
                        margin: "auto",
                        overflow: "hidden",
                        fontFamily: "'Trykker', serif",
                        color: "#545151",
                        backgroundColor: "#fff",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Background */}
                    <img
                        src={background}
                        alt="Background"
                        width="100%"
                        height="100%"
                        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
                    />

                    {/* Certificate Content */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            width: "100%",
                            height: "100%",
                            textAlign: "center",
                            zIndex: 2,
                        }}
                    >
                        <img
                            src={logo}
                            alt="logo"
                            style={{ width: "100px", marginTop: "30px" }}
                        />

                        <h2 style={{ margin: 0, fontFamily: "Trykker", fontSize: "35px", color: "#545151" }}>
                            CERTIFICATE
                        </h2>

                        <h3 style={{ margin: 0, fontFamily: "Style Script", fontSize: "25px", color: "#545151" }}>
                            Of Completion
                        </h3>

                        <h4 style={{ marginTop: "30px", fontFamily: "Trykker", fontSize: "18px", color: "#545151" }}>
                            This Certificate is Proudly Presented to
                        </h4>

                        <h5 style={{ marginTop: "10px", fontFamily: "Style Script", fontSize: "35px", color: "#545151" }}>
                            {selectedAssignment?.student?.name || "Student Name"}
                        </h5>

                        <h6 style={{ margin: "10px auto 0 auto", fontFamily: "Trykker", fontSize: "16px", color: "#545151", maxWidth: "85%", lineHeight: "1.5" }}>
                            Has successfully completed the course <strong>{selectedAssignment?.itemId?.name}</strong> at Skill Up Tech Solution.
                        </h6>

                        {/* Bottom Section */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0px 40px", position: "absolute", bottom: "60px", width: "100%" }}>
                            <img src={iaf} alt="IAF" style={{ width: "100px" }} />
                            <img src={msme} alt="MSME" style={{ width: "100px" }} />
                            <img src={iso} alt="ISO" style={{ width: "100px" }} />

                            <div style={{ textAlign: "center" }}>
                                <img src={sign} alt="Sign" style={{ width: "100px" }} />
                                <h3 style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Nivetha</h3>
                                <p style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Co-ordinator</p>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <img src={sign} alt="Sign" style={{ width: "100px" }} />
                                <h3 style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Mohamed Faroon</h3>
                                <p style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Head Manager</p>
                            </div>
                        </div>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CourseSubmissionsList;
