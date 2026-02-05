import { useState, useRef } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, Grid, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider, TextField } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Briefcase, User, Calendar, MapPin, VideoCamera, Plus, ArrowLeft, Play, Eye, Certificate, FileText, UploadSimple, X, Download, PencilSimple, FolderSimple } from "@phosphor-icons/react";
import { useGetInternshipDetail, useEmployeeUploadFiles, useEmployeeCompleteAssignment, useEmployeeUpdateCertDetails, useEmployeeGlobalUpload } from "../../Hooks/employee";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import background from "../../assets/Images/certificate_bg.jpg";
import { CustomSnackBar } from "../../Custom/CustomSnackBar";
import { normalizeDownloadUrl } from "../../utils/normalizeUrl";


// Status config for styling
const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    'assigned': { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', label: 'ASSIGNED' },
    'in-progress': { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', label: 'IN PROGRESS' },
    'requirement-submitted': { bg: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', label: 'REQ SUBMITTED' },
    'ready-for-demo': { bg: 'rgba(20, 184, 166, 0.2)', color: '#14b8a6', label: 'DEMO READY' },
    'completed': { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', label: 'COMPLETED' },
    'delivered': { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', label: 'DELIVERED' },
};

const EmployeeInternshipDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

    // Management Modals
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [globalUploadModalOpen, setGlobalUploadModalOpen] = useState(false);
    const [certIssueModalOpen, setCertIssueModalOpen] = useState(false);
    const [certEditModalOpen, setCertEditModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);
    const [certForm, setCertForm] = useState({
        recipientName: "",
        domain: "",
        startDate: "",
        endDate: ""
    });

    const { data, isLoading, error } = useGetInternshipDetail(id || "");
    const uploadMutation = useEmployeeUploadFiles();
    const globalUploadMutation = useEmployeeGlobalUpload("internship");
    const completeMutation = useEmployeeCompleteAssignment();
    const updateCertMutation = useEmployeeUpdateCertDetails();


    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress sx={{ color: "#10b981" }} />
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography sx={{ color: "#ef4444" }}>Failed to load internship details</Typography>
            </Box>
        );
    }

    const { internship, enrolledStudents, sessions } = data;
    const liveSessions = sessions?.filter((s: any) => s.status === "LIVE" || s.status === "SCHEDULED") || [];

    // Separate active and completed students
    const activeStudents = enrolledStudents?.filter((e: any) =>
        !['completed', 'delivered'].includes(e.status)
    ) || [];
    const completedStudents = enrolledStudents?.filter((e: any) =>
        ['completed', 'delivered'].includes(e.status)
    ) || [];

    const getStatusStyle = (status: string) => {
        return statusConfig[status] || statusConfig['assigned'];
    };

    const handleViewDetails = (enrollment: any) => {
        setSelectedStudent(enrollment);
        setDetailModalOpen(true);
    };

    const handleViewSubmissions = (enrollment: any) => {
        setSelectedStudent(enrollment);
        setSubmissionsModalOpen(true);
    };

    const renderStudentTable = (students: any[]) => (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", borderColor: "rgba(71, 85, 105, 0.4)", letterSpacing: "0.5px" }}>Intern</TableCell>
                        <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", borderColor: "rgba(71, 85, 105, 0.4)", letterSpacing: "0.5px" }}>Status</TableCell>
                        <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", borderColor: "rgba(71, 85, 105, 0.4)", letterSpacing: "0.5px" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((enrollment: any) => {
                        const statusStyle = getStatusStyle(enrollment.status);
                        const isCompleted = ['completed', 'delivered'].includes(enrollment.status);
                        return (
                            <TableRow key={enrollment._id} sx={{ "&:hover": { bgcolor: "rgba(30, 41, 59, 0.4)" } }}>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)", py: 2 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "14px" }}>
                                            {enrollment.student?.name || "Unknown"}
                                        </Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>
                                            {enrollment.student?.email || "N/A"}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)", py: 2 }}>
                                    <Chip
                                        label={statusStyle.label}
                                        size="small"
                                        sx={{
                                            bgcolor: statusStyle.bg,
                                            color: statusStyle.color,
                                            fontWeight: 600,
                                            fontSize: "10px",
                                            height: "24px",
                                            letterSpacing: "0.3px",
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderColor: "rgba(71, 85, 105, 0.4)", py: 2 }}>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        {!isCompleted ? (
                                            <>
                                                <Tooltip title="Upload Materials">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#3b82f6" }}
                                                        onClick={() => {
                                                            setSelectedStudent(enrollment);
                                                            setUploadFiles([]);
                                                            setFileTypes([]);
                                                            setUploadModalOpen(true);
                                                        }}
                                                    >
                                                        <UploadSimple size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Issue Certificate">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#10b981" }}
                                                        onClick={() => {
                                                            setSelectedStudent(enrollment);
                                                            setCertIssueModalOpen(true);
                                                        }}
                                                    >
                                                        <Certificate size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        ) : (
                                            <>
                                                <Tooltip title="View Certificate">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#10b981" }}
                                                        onClick={() => window.open(normalizeDownloadUrl(enrollment.certificate?.url), "_blank")}
                                                    >
                                                        <Download size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit & Regenerate">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#a855f7" }}
                                                        onClick={() => {
                                                            setSelectedStudent(enrollment);
                                                            setCertForm({
                                                                recipientName: enrollment.certificateDetails?.recipientName || enrollment.student?.name || "",
                                                                domain: enrollment.certificateDetails?.domain || internship.title || "",
                                                                startDate: enrollment.certificateDetails?.startDate ? new Date(enrollment.certificateDetails.startDate).toISOString().split('T')[0] : "",
                                                                endDate: enrollment.certificateDetails?.endDate ? new Date(enrollment.certificateDetails.endDate).toISOString().split('T')[0] : ""
                                                            });
                                                            setCertEditModalOpen(true);
                                                        }}
                                                    >
                                                        <PencilSimple size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip title="Requirements">
                                            <IconButton
                                                size="small"
                                                sx={{ color: enrollment.requirementSubmission?.topic ? "#8b5cf6" : "#475569" }}
                                                onClick={() => handleViewSubmissions(enrollment)}
                                            >
                                                <FileText size={18} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                sx={{ color: "#94a3b8" }}
                                                onClick={() => handleViewDetails(enrollment)}
                                            >
                                                <Eye size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );


    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Back Button */}
            <Box
                onClick={() => navigate("/employee/internships")}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#94a3b8",
                    cursor: "pointer",
                    "&:hover": { color: "#f8fafc" },
                    width: "fit-content",
                }}
            >
                <ArrowLeft size={20} />
                <Typography sx={{ fontSize: "14px" }}>Back to Internships</Typography>
            </Box>

            {/* Internship Header */}
            <Card
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "12px",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "16px",
                                    bgcolor: "rgba(139, 92, 246, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Briefcase size={32} weight="duotone" style={{ color: "#8b5cf6" }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "24px" }}>
                                    {internship.title}
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "14px", mt: 0.5 }}>
                                    {internship.company || "Company"}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={internship.status || "Active"}
                            sx={{
                                bgcolor: internship.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)",
                                color: internship.status === "Active" ? "#10b981" : "#64748b",
                                fontWeight: 600,
                            }}
                        />
                    </Box>

                    {/* Global Materials Section */}
                    <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FolderSimple size={20} weight="duotone" style={{ color: "#8b5cf6" }} />
                                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                    Internship Materials & Resources
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<Plus size={18} />}
                                onClick={() => {
                                    setUploadFiles([]);
                                    setFileTypes([]);
                                    setGlobalUploadModalOpen(true);
                                }}
                                sx={{
                                    borderColor: "rgba(139, 92, 246, 0.4)",
                                    color: "#8b5cf6",
                                    fontSize: "13px",
                                    height: "32px",
                                    "&:hover": { borderColor: "#8b5cf6", bgcolor: "rgba(139, 92, 246, 0.1)" }
                                }}
                            >
                                Upload Material
                            </Button>
                        </Box>
                        {internship.attachments?.length > 0 ? (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {internship.attachments.map((file: any, index: number) => (
                                    <Chip
                                        key={index}
                                        label={file.fileName}
                                        icon={<Download size={16} />}
                                        onClick={() => window.open(normalizeDownloadUrl(file.filePath), "_blank")}
                                        sx={{
                                            bgcolor: "rgba(30, 41, 59, 0.8)",
                                            border: "1px solid rgba(71, 85, 105, 0.4)",
                                            color: "#94a3b8",
                                            borderRadius: "6px",
                                            "&:hover": { bgcolor: "rgba(51, 65, 85, 0.8)", color: "#f8fafc" },
                                            "& .MuiChip-icon": { color: "#8b5cf6" }
                                        }}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ color: "#64748b", fontSize: "13px", fontStyle: "italic" }}>
                                No materials uploaded yet.
                            </Typography>
                        )}
                    </Box>
                    <Typography sx={{ color: "#94a3b8", fontSize: "14px", mt: 3, lineHeight: 1.6 }}>
                        {internship.description || "No description available"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 4, mt: 3, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <MapPin size={18} style={{ color: "#64748b" }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                {internship.location || "Remote"}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <User size={18} style={{ color: "#64748b" }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                {enrolledStudents?.length || 0} Interns
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Calendar size={18} style={{ color: "#64748b" }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                Duration: {internship.duration || "N/A"}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Live Sessions Section */}
            <Card
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "12px",
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "18px", display: "flex", alignItems: "center", gap: 1 }}>
                            <VideoCamera size={22} weight="duotone" style={{ color: "#ef4444" }} />
                            Live Sessions
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Plus size={16} />}
                            onClick={() => navigate("/employee/live-sessions")}
                            sx={{
                                bgcolor: "#8b5cf6",
                                "&:hover": { bgcolor: "#7c3aed" },
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            Schedule Session
                        </Button>
                    </Box>
                    {liveSessions.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                            <VideoCamera size={40} weight="duotone" style={{ color: "#64748b", marginBottom: 8 }} />
                            <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                No scheduled sessions
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {liveSessions.map((session: any) => (
                                <Grid size={{ xs: 12, md: 6 }} key={session._id}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: "8px",
                                            bgcolor: session.status === "LIVE" ? "rgba(239, 68, 68, 0.1)" : "rgba(139, 92, 246, 0.1)",
                                            border: `1px solid ${session.status === "LIVE" ? "rgba(239, 68, 68, 0.3)" : "rgba(139, 92, 246, 0.3)"}`,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Box>
                                                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "14px" }}>
                                                    {session.title}
                                                </Typography>
                                                <Typography sx={{ color: "#64748b", fontSize: "12px", mt: 0.5 }}>
                                                    {new Date(session.scheduledAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {session.status === "LIVE" && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<Play size={14} />}
                                                    sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, fontSize: "11px" }}
                                                >
                                                    Join
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </CardContent>
            </Card>

            {/* Enrolled Interns with Tabs */}
            <Card
                sx={{
                    bgcolor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "12px",
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, newValue) => setTabValue(newValue)}
                        sx={{
                            mb: 3,
                            "& .MuiTab-root": {
                                color: "#64748b",
                                fontWeight: 600,
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                minHeight: "40px",
                            },
                            "& .Mui-selected": { color: "#8b5cf6" },
                            "& .MuiTabs-indicator": { bgcolor: "#8b5cf6" },
                        }}
                    >
                        <Tab label={`Active Interns (${activeStudents.length})`} />
                        <Tab label={`Certified (${completedStudents.length})`} />
                    </Tabs>

                    {tabValue === 0 && (
                        activeStudents.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 3 }}>
                                <User size={40} weight="duotone" style={{ color: "#64748b", marginBottom: 8 }} />
                                <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                    No active interns enrolled
                                </Typography>
                            </Box>
                        ) : (
                            renderStudentTable(activeStudents)
                        )
                    )}

                    {tabValue === 1 && (
                        completedStudents.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 3 }}>
                                <Certificate size={40} weight="duotone" style={{ color: "#64748b", marginBottom: 8 }} />
                                <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                    No certified interns yet
                                </Typography>
                            </Box>
                        ) : (
                            renderStudentTable(completedStudents)
                        )
                    )}
                </CardContent>
            </Card>
            {/* Modal Components */}
            {selectedStudent && (
                <>
                    {/* Details Modal */}
                    <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", backgroundImage: "none", color: "#f8fafc", borderRadius: "12px" } }}>
                        <DialogTitle sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem" }}>Student Details</Typography>
                            <IconButton onClick={() => setDetailModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: "#8b5cf6" }}>{selectedStudent.student?.name?.charAt(0)}</Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedStudent.student?.name}</Typography>
                                    <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{selectedStudent.student?.email}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 3, borderColor: "rgba(71, 85, 105, 0.4)" }} />
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip label={selectedStudent.status?.toUpperCase()} size="small" sx={{ bgcolor: statusConfig[selectedStudent.status]?.bg, color: statusConfig[selectedStudent.status]?.color, fontWeight: 700, fontSize: "0.625rem" }} />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Joined On</Typography>
                                    <Typography sx={{ mt: 0.5, fontSize: "0.875rem" }}>{dayjs(selectedStudent.createdAt).format("MMM DD, YYYY")}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Delivery Files ({selectedStudent.deliveryFiles?.length || 0})</Typography>
                                    <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {selectedStudent.deliveryFiles?.map((file: any, idx: number) => (
                                            <Chip key={idx} icon={<FileText size={14} />} label={file.fileName} onClick={() => window.open(normalizeDownloadUrl(file.filePath), "_blank")} sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", "&:hover": { bgcolor: "rgba(139, 92, 246, 0.2)" } }} />
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>

                    {/* Requirements View Modal */}
                    <Dialog open={submissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", backgroundImage: "none", color: "#f8fafc", borderRadius: "12px" } }}>
                        <DialogTitle sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem" }}>Student Requirements</Typography>
                            <IconButton onClick={() => setSubmissionsModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 0 }}>
                            {!selectedStudent.requirementSubmission?.topic ? (
                                <Box sx={{ p: 4, textAlign: "center" }}>
                                    <FileText size={48} style={{ color: "#475569", marginBottom: 16 }} />
                                    <Typography sx={{ color: "#94a3b8" }}>No requirements submitted yet.</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="subtitle2" sx={{ color: "#8b5cf6", fontWeight: 600, mb: 1 }}>TOPIC</Typography>
                                    <Typography variant="h6" sx={{ mb: 3 }}>{selectedStudent.requirementSubmission.topic}</Typography>

                                    <Typography variant="subtitle2" sx={{ color: "#8b5cf6", fontWeight: 600, mb: 1 }}>DESCRIPTION / NOTES</Typography>
                                    <Typography variant="body1" sx={{ color: "#cbd5e1", mb: 4, whiteSpace: "pre-wrap" }}>
                                        {selectedStudent.requirementSubmission.notes || "No additional notes provided."}
                                    </Typography>

                                    <Typography variant="subtitle2" sx={{ color: "#8b5cf6", fontWeight: 600, mb: 2 }}>ATTACHMENTS</Typography>
                                    <Grid container spacing={2}>
                                        {selectedStudent.requirementSubmission.attachments?.map((file: any, idx: number) => (
                                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                                <Box sx={{ p: 2, bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "8px", border: "1px solid rgba(71, 85, 105, 0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                                        <FileText size={24} color="#8b5cf6" />
                                                        <Typography sx={{ color: "#f8fafc", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName}</Typography>
                                                    </Box>
                                                    <IconButton size="small" onClick={() => window.open(normalizeDownloadUrl(file.filePath), "_blank")} sx={{ color: "#3b82f6" }}><Download size={18} /></IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Upload Materials Modal */}
                    <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", color: "#f8fafc", borderRadius: "12px" } }}>
                        <DialogTitle sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700 }}>Upload Internship Materials</Typography>
                            <IconButton onClick={() => setUploadModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem", mb: 3 }}>Upload files for {selectedStudent.student?.name}. These files will be visible to the student.</Typography>
                            <Box sx={{ border: "2px dashed rgba(71, 85, 105, 0.4)", borderRadius: "12px", p: 4, textAlign: "center", bgcolor: "rgba(30, 41, 59, 0.4)", cursor: "pointer", "&:hover": { borderColor: "#3b82f6" } }} onClick={() => document.getElementById("intern-file-upload")?.click()}>
                                <input type="file" id="intern-file-upload" multiple hidden onChange={(e: any) => {
                                    if (e.target.files) {
                                        const newFiles = Array.from(e.target.files) as File[];
                                        setUploadFiles([...uploadFiles, ...newFiles]);
                                        setFileTypes([...fileTypes, ...newFiles.map(() => "learning-material")]);
                                    }
                                }} />
                                <UploadSimple size={40} color="#3b82f6" style={{ marginBottom: 12 }} />
                                <Typography sx={{ fontWeight: 600 }}>Click to select files</Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", mt: 0.5 }}>PDF, Source Code, Documentation, etc.</Typography>
                            </Box>
                            {uploadFiles.length > 0 && (
                                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                                    {uploadFiles.map((file, idx) => (
                                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(30, 41, 59, 0.6)", borderRadius: "8px", border: "1px solid rgba(71, 85, 105, 0.3)" }}>
                                            <FileText size={24} color="#3b82f6" />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</Typography>
                                                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                            </Box>
                                            <TextField size="small" select SelectProps={{ native: true }} value={fileTypes[idx]} onChange={(e) => {
                                                const newTypes = [...fileTypes];
                                                newTypes[idx] = e.target.value;
                                                setFileTypes(newTypes);
                                            }} sx={{ width: 140, "& .MuiInputBase-root": { fontSize: "0.75rem", height: "32px" } }}>
                                                <option value="learning-material">Material</option>
                                                <option value="project-file">Project File</option>
                                                <option value="report">Report</option>
                                                <option value="source-code">Source Code</option>
                                                <option value="documentation">Docs</option>
                                            </TextField>
                                            <IconButton size="small" sx={{ color: "#ef4444" }} onClick={() => {
                                                setUploadFiles(uploadFiles.filter((_, i) => i !== idx));
                                                setFileTypes(fileTypes.filter((_, i) => i !== idx));
                                            }}><X size={18} /></IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 0 }}>
                            <Button fullWidth variant="contained" disabled={uploadFiles.length === 0 || uploadMutation.isPending} onClick={() => {
                                const formData = new FormData();
                                uploadFiles.forEach((file, idx) => {
                                    formData.append("files", file);
                                    formData.append("fileTypes", fileTypes[idx]);
                                });
                                formData.append("assignmentId", selectedStudent._id);
                                uploadMutation.mutate({ id: selectedStudent._id, formData }, {
                                    onSuccess: () => {
                                        setUploadModalOpen(false);
                                        setUploadFiles([]);
                                        setFileTypes([]);
                                    }
                                });
                            }} sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontWeight: 700, py: 1.5 }}>
                                {uploadMutation.isPending ? <CircularProgress size={24} color="inherit" /> : `Upload ${uploadFiles.length} Files`}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Issue Certificate Modal */}
                    <Dialog open={certIssueModalOpen} onClose={() => setCertIssueModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", color: "#f8fafc", borderRadius: "12px" } }}>
                        <DialogTitle sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700 }}>Issue Internship Certificate</Typography>
                            <IconButton onClick={() => setCertIssueModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem", mb: 3 }}>
                                Are you sure you want to mark this internship as completed and issue a certificate to {selectedStudent.student?.name}?
                                This will generate a PDF and email it to the student.
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", gap: 2, alignItems: "center" }}>
                                <Certificate size={24} color="#10b981" />
                                <Box>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#10b981" }}>Ready to Issue</Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#10b981" }}>Standard template will be used.</Typography>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 0 }}>
                            <Button fullWidth variant="contained" disabled={generating || completeMutation.isPending} onClick={async () => {
                                setGenerating(true);
                                try {
                                    // Set default values for generation
                                    setCertForm({
                                        recipientName: selectedStudent.student?.name || "",
                                        domain: internship.title || "",
                                        startDate: selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toISOString().split('T')[0] : "",
                                        endDate: new Date().toISOString().split('T')[0]
                                    });

                                    // Small delay to ensure state update before capture
                                    setTimeout(async () => {
                                        if (certificateRef.current) {
                                            const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true });
                                            const imgData = canvas.toDataURL("image/jpeg", 0.9);
                                            const pdf = new jsPDF("l", "mm", "a4");
                                            pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
                                            const pdfBlob = pdf.output("blob");

                                            const formData = new FormData();
                                            formData.append("certificate", pdfBlob, `Certificate_${selectedStudent.student?.name}.pdf`);
                                            formData.append("assignmentId", selectedStudent._id);

                                            completeMutation.mutate({ id: selectedStudent._id, formData }, {
                                                onSuccess: () => setCertIssueModalOpen(false)
                                            });
                                        }
                                        setGenerating(false);
                                    }, 500);
                                } catch (err) {
                                    console.error("PDF generation failed:", err);
                                    setGenerating(false);
                                }
                            }} sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" }, fontWeight: 700, py: 1.5 }}>
                                {generating || completeMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Confirm Internship Completion"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Edit Details Modal */}
                    <Dialog open={certEditModalOpen} onClose={() => setCertEditModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", color: "#f8fafc", borderRadius: "12px" } }}>
                        <DialogTitle sx={{ borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700 }}>Edit Certificate Details</Typography>
                            <IconButton onClick={() => setCertEditModalOpen(false)} sx={{ color: "#94a3b8" }}><X size={20} /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField fullWidth label="Recipient Name" value={certForm.recipientName} onChange={(e) => setCertForm({ ...certForm, recipientName: e.target.value })} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" } } }} InputLabelProps={{ sx: { color: "#94a3b8" } }} />
                            <TextField fullWidth label="Domain / Field of Work" value={certForm.domain} onChange={(e) => setCertForm({ ...certForm, domain: e.target.value })} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" } } }} InputLabelProps={{ sx: { color: "#94a3b8" } }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Start Date" type="date" value={certForm.startDate} onChange={(e) => setCertForm({ ...certForm, startDate: e.target.value })} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" } } }} InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="End Date" type="date" value={certForm.endDate} onChange={(e) => setCertForm({ ...certForm, endDate: e.target.value })} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { color: "#f8fafc", "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" } } }} InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 0 }}>
                            <Button fullWidth variant="contained" disabled={regenerating || updateCertMutation.isPending || completeMutation.isPending} onClick={() => {
                                updateCertMutation.mutate({
                                    id: selectedStudent._id,
                                    data: {
                                        recipientName: certForm.recipientName,
                                        domain: certForm.domain,
                                        startDate: certForm.startDate,
                                        endDate: certForm.endDate
                                    }
                                }, {
                                    onSuccess: async () => {
                                        setRegenerating(true);
                                        // Wait for state to reflect in hidden template
                                        setTimeout(async () => {
                                            if (certificateRef.current) {
                                                const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true });
                                                const imgData = canvas.toDataURL("image/jpeg", 0.9);
                                                const pdf = new jsPDF("l", "mm", "a4");
                                                pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
                                                const pdfBlob = pdf.output("blob");

                                                const formData = new FormData();
                                                formData.append("certificate", pdfBlob, `Certificate_${certForm.recipientName}.pdf`);
                                                formData.append("assignmentId", selectedStudent._id);

                                                completeMutation.mutate({ id: selectedStudent._id, formData }, {
                                                    onSuccess: () => setCertEditModalOpen(false)
                                                });
                                            }
                                            setRegenerating(false);
                                        }, 500);
                                    }
                                });
                            }} sx={{ bgcolor: "#a855f7", "&:hover": { bgcolor: "#9333ea" }, fontWeight: 700, py: 1.5 }}>
                                {regenerating || updateCertMutation.isPending || completeMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Regenerate & Update Certificate"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}

            {/* Hidden Certificate Template for generation */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <div ref={certificateRef} style={{ width: "297mm", height: "210mm", backgroundImage: `url(${background})`, backgroundSize: "cover", position: "relative", color: "#000", fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "80%" }}>
                        <h1 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 10px 0", color: "#1a237e" }}>Certificate of Completion</h1>
                        <p style={{ fontSize: "18px", margin: "10px 0" }}>This is to certify that</p>
                        <h2 style={{ fontSize: "36px", fontWeight: 700, margin: "15px 0", color: "#311b92" }}>{certForm.recipientName || selectedStudent?.student?.name}</h2>
                        <p style={{ fontSize: "16px", lineHeight: 1.6, margin: "20px 0" }}>
                            has successfully completed the <strong>{certForm.domain || internship.title}</strong> internship.<br />
                            The internship was conducted from <strong>{dayjs(certForm.startDate).format("Do MMM YYYY")}</strong> to <strong>{dayjs(certForm.endDate).format("Do MMM YYYY")}</strong>.
                        </p>
                        <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", padding: "0 40px" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "150px", borderBottom: "1px solid #000", marginBottom: "5px" }}></div>
                                <p style={{ fontSize: "14px", fontWeight: 600 }}>Director</p>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "150px", borderBottom: "1px solid #000", marginBottom: "5px" }}></div>
                                <p style={{ fontSize: "14px", fontWeight: 600 }}>Mentor</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: "absolute", bottom: "30px", width: "100%", textAlign: "center" }}>
                        <p style={{ fontSize: "12px", color: "#666" }}>Skill Up Tech Solutions - Verification ID: {selectedStudent?._id?.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <CustomSnackBar message="" open={false} />

            {/* Global Materials Upload Modal */}
            <Dialog open={globalUploadModalOpen} onClose={() => setGlobalUploadModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", borderRadius: "12px" } }}>
                <DialogTitle sx={{ color: "#f8fafc" }}>Upload Internship Materials</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => {
                                if (e.target.files) {
                                    setUploadFiles(Array.from(e.target.files));
                                }
                            }}
                            style={{ display: "none" }}
                            id="global-file-upload"
                        />
                        <label htmlFor="global-file-upload">
                            <Box sx={{
                                border: "2px dashed rgba(71, 85, 105, 0.4)",
                                borderRadius: "8px",
                                p: 4,
                                textAlign: "center",
                                cursor: "pointer",
                                "&:hover": { borderColor: "#8b5cf6", bgcolor: "rgba(139, 92, 246, 0.05)" }
                            }}>
                                <Plus size={32} style={{ color: "#8b5cf6", marginBottom: "8px" }} />
                                <Typography sx={{ color: "#f8fafc", fontWeight: 500 }}>
                                    Click to select files
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "12px", mt: 0.5 }}>
                                    Upload training manuals, resources, or internship materials
                                </Typography>
                            </Box>
                        </label>

                        {uploadFiles.length > 0 && (
                            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
                                {uploadFiles.map((file, idx) => (
                                    <Box key={idx} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "6px" }}>
                                        <Typography sx={{ color: "#f8fafc", fontSize: "13px" }}>{file.name}</Typography>
                                        <IconButton size="small" onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))} sx={{ color: "#ef4444" }}>
                                            <X size={16} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setGlobalUploadModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button
                        disabled={uploadFiles.length === 0 || globalUploadMutation.isPending}
                        onClick={() => {
                            const formData = new FormData();
                            uploadFiles.forEach(file => formData.append("files", file));
                            globalUploadMutation.mutate({ id: internship._id, formData }, {
                                onSuccess: () => {
                                    setGlobalUploadModalOpen(false);
                                    setUploadFiles([]);
                                    // CustomSnackBar.successSnackbar("Materials uploaded successfully!");
                                }
                            });
                        }}
                        variant="contained"
                        sx={{ bgcolor: "#8b5cf6", color: "#fff", "&:hover": { bgcolor: "#7c3aed" } }}
                    >
                        {globalUploadMutation.isPending ? "Uploading..." : "Save Materials"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeeInternshipDetail;
