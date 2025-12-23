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
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    MenuItem,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    MdSchool,
    MdUpload,
    MdAssignment,
    MdDownload,
    MdVisibility,
    MdDelete
} from "react-icons/md";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/Images/blacklogo.png";
import background from "../../assets/Images/background.png";
import msme from "../../assets/Images/msms.png";
import iso from "../../assets/Images/isonew.png";
import iaf from "../../assets/Images/iaf.png";
import sign from "../../assets/Images/dummysign.png";
import { smallPrimaryButton } from "../../assets/Styles/ButtonStyles";

const InternshipSubmissionsList = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // Modals state
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [viewFilesModal, setViewFilesModal] = useState(false);
    // Certificate Generation
    const [certificateModal, setCertificateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    // Upload Form State
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    // Fetch assignments
    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["internship-assignments"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments?itemType=internship`,
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
                `${import.meta.env.VITE_APP_BASE_URL}admin/internship-assignments/${assignmentId}/upload-files`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["internship-assignments"] });
            setUploadModal(false);
            setUploadFiles([]);
            setFileTypes([]);
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload files");
        },
    });

    // Generate Certificate
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
                `${import.meta.env.VITE_APP_BASE_URL}admin/internship-assignments/${selectedAssignment._id}/complete`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            CustomSnackBar.successSnackbar("Certificate issued & Internship Completed!");
            queryClient.invalidateQueries({ queryKey: ["internship-assignments"] });
            setCertificateModal(false);
        } catch (err: any) {
            console.error("Certificate Error:", err);
            CustomSnackBar.errorSnackbar("Failed to generate certificate");
        } finally {
            setGenerating(false);
        }
    };

    // Filter Logic
    const filteredAssignments = assignments?.filter((item: any) => {
        if (tabValue === 0) return !["completed"].includes(item.status);
        if (tabValue === 1) return item.status === "completed";
        return true;
    });

    // Handlers
    const handleOpenUpload = (item: any) => { setSelectedAssignment(item); setUploadModal(true); setUploadFiles([]); setFileTypes([]); };
    const handleOpenViewFiles = (item: any) => { setSelectedAssignment(item); setViewFilesModal(true); };
    const handleOpenCertificate = (item: any) => { setSelectedAssignment(item); setCertificateModal(true); };

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

    if (isLoading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab label="Active Internships" />
                    <Tab label="Completed / Certified" />
                </Tabs>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Internship Title</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assigned At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No assignments found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredAssignments?.map((row: any) => (
                                    <TableRow key={row._id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{row.student?.name}</Typography>
                                            <Typography variant="caption">{row.student?.email}</Typography>
                                        </TableCell>
                                        <TableCell>{row.itemId?.title || row.itemId?.name}</TableCell>
                                        <TableCell>
                                            <Chip label={row.status} color={row.status === "completed" ? "success" : "warning"} size="small" />
                                        </TableCell>
                                        <TableCell>{new Date(row.assignedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                {row.status !== "completed" ? (
                                                    <>
                                                        <Button size="small" variant="contained" onClick={() => handleOpenUpload(row)} startIcon={<MdUpload />} sx={{ ...smallPrimaryButton }}>
                                                            Files
                                                        </Button>
                                                        <Button size="small" variant="outlined" color="success" onClick={() => handleOpenCertificate(row)} startIcon={<IoCheckmarkDoneCircle />}>
                                                            Complete
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button size="small" variant="text" href={row.certificate?.url} target="_blank" startIcon={<MdDownload />}>
                                                        Certificate
                                                    </Button>
                                                )}
                                                <IconButton size="small" onClick={() => handleOpenViewFiles(row)}>
                                                    <MdVisibility />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Upload Modal - Premium Design */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                    borderBottom: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}>
                    <MdUpload /> Upload Internship Materials
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <Alert severity="info" sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                            Upload resources, learning materials, or tasks for <strong>{selectedAssignment?.student?.name}</strong>
                        </Alert>

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
                                gap: 1
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
                                {uploadFiles.map((file: File, index: number) => (
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
                                            sx={{ width: 140, "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "12px" } }}
                                        >
                                            <MenuItem value="learning-material"> Learning Material</MenuItem>
                                            <MenuItem value="task">📝 Task</MenuItem>
                                            <MenuItem value="video">🎬 Video</MenuItem>
                                            <MenuItem value="notes">📄 Notes</MenuItem>
                                            <MenuItem value="source-code">💻 Source Code</MenuItem>
                                            <MenuItem value="other">📎 Other</MenuItem>
                                        </TextField>
                                        <IconButton size="small" onClick={() => handleRemoveFile(index)} sx={{ color: "#ef4444" }}>
                                            <MdDelete />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0", gap: 1 }}>
                    <Button onClick={() => setUploadModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>
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
                    <MdAssignment /> Files & Resources
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography sx={{
                            fontFamily: "SemiBold_W",
                            fontSize: "14px",
                            mb: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}>
                            <MdUpload color="var(--webprimary)" /> Internship Materials
                            <Chip
                                label={selectedAssignment?.deliveryFiles?.length || 0}
                                size="small"
                                sx={{ fontFamily: "Medium_W", fontSize: "11px", height: 20 }}
                            />
                        </Typography>
                        {selectedAssignment?.deliveryFiles?.length > 0 ? (
                            <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", maxHeight: 200, overflowY: "auto" }}>
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
                                                    sx={{ fontFamily: "Regular_W", fontSize: "10px", height: 18, textTransform: "capitalize" }}
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
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button onClick={() => setViewFilesModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Certificate Modal */}
            <Dialog open={certificateModal} onClose={() => setCertificateModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: "SemiBold_W", fontSize: "18px", borderBottom: "1px solid #e0e0e0" }}>
                    Complete & Issue Certificate
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <Alert severity="success" sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                            This will mark the internship as <strong>Completed</strong> for {selectedAssignment?.student?.name}
                        </Alert>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleGenerateCertificate}
                            disabled={generating}
                            startIcon={<MdSchool />}
                            sx={{ fontFamily: "Medium_W", py: 1.5 }}
                        >
                            {generating ? "Generating Certificate..." : "Generate Certificate & Complete"}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCertificateModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Hidden Certificate Template for Generation */}
            < Box sx={{ position: "absolute", left: "-3000px", top: 0 }}>
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
                            Of Internship Completion
                        </h3>

                        <h4 style={{ marginTop: "30px", fontFamily: "Trykker", fontSize: "18px", color: "#545151" }}>
                            This Certificate is Proudly Presented to
                        </h4>

                        <h5 style={{ marginTop: "10px", fontFamily: "Style Script", fontSize: "35px", color: "#545151" }}>
                            {selectedAssignment?.student?.name || "Student Name"}
                        </h5>

                        <h6 style={{ margin: "10px auto 0 auto", fontFamily: "Trykker", fontSize: "16px", color: "#545151", maxWidth: "85%", lineHeight: "1.5" }}>
                            Has successfully completed the internship as <strong>{selectedAssignment?.itemId?.title}</strong> at Skill Up Tech Solution.
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
            </Box >
        </Box >
    );
};

export default InternshipSubmissionsList;
