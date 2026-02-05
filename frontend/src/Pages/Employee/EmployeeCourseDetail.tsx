import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef } from "react";

import { Box, Typography, Card, CardContent, CircularProgress, Grid, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider, TextField } from "@mui/material";
import { ArrowLeft, Books, Calendar, Certificate, Clock, Download, Eye, FileText, PencilSimple, Plus, Play, UploadSimple, VideoCamera, X, User, FolderSimple } from "@phosphor-icons/react";
import { useGetCourseDetail, useEmployeeUploadFiles, useEmployeeCompleteAssignment, useEmployeeUpdateCertDetails, useEmployeeGlobalUpload } from "../../Hooks/employee";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import background from "../../assets/Images/certificate_bg.jpg";
import CustomSnackBar from "../../Custom/CustomSnackBar";
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

const EmployeeCourseDetail = () => {
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

    const { data, isLoading, error } = useGetCourseDetail(id || "");
    const uploadMutation = useEmployeeUploadFiles();
    const globalUploadMutation = useEmployeeGlobalUpload("course");
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
                <Typography sx={{ color: "#ef4444" }}>Failed to load course details</Typography>
            </Box>
        );
    }

    const { course, enrolledStudents, sessions } = data;
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
                        <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", borderColor: "rgba(71, 85, 105, 0.4)", letterSpacing: "0.5px" }}>Student</TableCell>
                        <TableCell sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", borderColor: "rgba(71, 85, 105, 0.4)", letterSpacing: "0.5px" }}>Course</TableCell>
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
                                    <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                        {course.name}
                                    </Typography>
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
                                                                domain: enrollment.certificateDetails?.domain || course.name || "",
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
                                        <Tooltip title="Submissions">
                                            <IconButton
                                                size="small"
                                                sx={{ color: enrollment.courseSubmissions?.length > 0 ? "#8b5cf6" : "#475569" }}
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
                onClick={() => navigate("/employee/courses")}
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
                <Typography sx={{ fontSize: "14px" }}>Back to Courses</Typography>
            </Box>

            {/* Course Header */}
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
                                    bgcolor: "rgba(59, 130, 246, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Books size={32} weight="duotone" style={{ color: "#3b82f6" }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "24px" }}>
                                    {course.name}
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "14px", mt: 0.5 }}>
                                    {course.category || "General"} • {course.level || "Beginner"}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={course.status || "Active"}
                            sx={{
                                bgcolor: course.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)",
                                color: course.status === "Active" ? "#10b981" : "#64748b",
                                fontWeight: 600,
                            }}
                        />
                    </Box>

                    {/* Global Materials Section */}
                    <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FolderSimple size={20} weight="duotone" style={{ color: "#3b82f6" }} />
                                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px" }}>
                                    Program Materials & Resources
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
                                    borderColor: "rgba(59, 130, 246, 0.4)",
                                    color: "#3b82f6",
                                    fontSize: "13px",
                                    height: "32px",
                                    "&:hover": { borderColor: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)" }
                                }}
                            >
                                Upload Material
                            </Button>
                        </Box>
                        {course.attachments?.length > 0 ? (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {course.attachments.map((file: any, index: number) => (
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
                                            "& .MuiChip-icon": { color: "#3b82f6" }
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
                        {course.description || "No description available"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 4, mt: 3, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Clock size={18} style={{ color: "#64748b" }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                Duration: {course.duration || "N/A"}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <User size={18} style={{ color: "#64748b" }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                {enrolledStudents?.length || 0} Enrolled Students
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Calendar size={18} style={{ color: "#64748b" }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                                Created: {new Date(course.createdAt).toLocaleDateString()}
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
                                bgcolor: "#3b82f6",
                                "&:hover": { bgcolor: "#2563eb" },
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
                                No scheduled sessions. Click "Schedule Session" to create one.
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
                                            bgcolor: session.status === "LIVE" ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                            border: `1px solid ${session.status === "LIVE" ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
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

            {/* Enrolled Students with Tabs */}
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
                            "& .Mui-selected": { color: "#10b981" },
                            "& .MuiTabs-indicator": { bgcolor: "#10b981" },
                        }}
                    >
                        <Tab label={`Active Students (${activeStudents.length})`} />
                        <Tab label={`Certified (${completedStudents.length})`} />
                    </Tabs>

                    {tabValue === 0 && (
                        activeStudents.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 3 }}>
                                <User size={40} weight="duotone" style={{ color: "#64748b", marginBottom: 8 }} />
                                <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                    No active students enrolled
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
                                    No certified students yet
                                </Typography>
                            </Box>
                        ) : (
                            renderStudentTable(completedStudents)
                        )
                    )}
                </CardContent>
            </Card>

            {/* Student Details Modal */}
            <Dialog
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: "#1e293b",
                        border: "1px solid rgba(71, 85, 105, 0.4)",
                        borderRadius: "12px",
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "18px" }}>Student Details</Typography>
                    <IconButton onClick={() => setDetailModalOpen(false)} sx={{ color: "#64748b" }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedStudent && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: "#3b82f6", fontSize: "24px" }}>
                                    {selectedStudent.student?.name?.charAt(0).toUpperCase() || "S"}
                                </Avatar>
                                <Box>
                                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "20px" }}>
                                        {selectedStudent.student?.name || "Unknown"}
                                    </Typography>
                                    <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                                        {selectedStudent.student?.email || "N/A"}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }} />
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <Box>
                                    <Typography sx={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Status</Typography>
                                    <Chip
                                        label={getStatusStyle(selectedStudent.status).label}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            bgcolor: getStatusStyle(selectedStudent.status).bg,
                                            color: getStatusStyle(selectedStudent.status).color,
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Assigned Date</Typography>
                                    <Typography sx={{ color: "#f8fafc", fontSize: "14px", mt: 0.5 }}>
                                        {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Course</Typography>
                                    <Typography sx={{ color: "#f8fafc", fontSize: "14px", mt: 0.5 }}>{course.name}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Phone</Typography>
                                    <Typography sx={{ color: "#f8fafc", fontSize: "14px", mt: 0.5 }}>
                                        {selectedStudent.student?.phone || "N/A"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Button onClick={() => setDetailModalOpen(false)} sx={{ color: "#64748b" }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Submissions Modal - Enhanced like Admin View */}
            <Dialog
                open={submissionsModalOpen}
                onClose={() => setSubmissionsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: "#1e293b",
                        border: "1px solid rgba(71, 85, 105, 0.4)",
                        borderRadius: "12px",
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "18px" }}>
                        Course Files - {selectedStudent?.student?.name}
                    </Typography>
                    <IconButton onClick={() => setSubmissionsModalOpen(false)} sx={{ color: "#64748b" }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Materials Uploaded Section */}
                        <Box>
                            <Typography sx={{ color: "#3b82f6", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1.5 }}>
                                📚 Materials Uploaded
                            </Typography>
                            {selectedStudent?.deliveryFiles?.length > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    {selectedStudent.deliveryFiles.map((file: any, idx: number) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: 1.5,
                                                bgcolor: "rgba(15, 23, 42, 0.5)",
                                                borderRadius: "6px",
                                                border: "1px solid rgba(71, 85, 105, 0.3)",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <FileText size={20} style={{ color: "#3b82f6" }} />
                                                <Box>
                                                    <Typography sx={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 500 }}>
                                                        {file.fileName || `File ${idx + 1}`}
                                                    </Typography>
                                                    <Typography sx={{ color: "#64748b", fontSize: "11px" }}>
                                                        {file.fileType || "Course Material"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                size="small"
                                                startIcon={<Eye size={14} />}
                                                onClick={() => window.open(file.filePath || file.url, "_blank")}
                                                sx={{ color: "#3b82f6", fontSize: "12px" }}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography sx={{ color: "#64748b", fontSize: "13px", fontStyle: "italic" }}>
                                    No materials uploaded yet
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ borderColor: "rgba(71, 85, 105, 0.4)" }} />

                        {/* Student Submissions Section */}
                        <Box>
                            <Typography sx={{ color: "#22c55e", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1.5 }}>
                                📝 Student Submissions
                            </Typography>
                            {selectedStudent?.courseSubmissions?.length > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    {selectedStudent.courseSubmissions.map((sub: any, idx: number) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: 1.5,
                                                bgcolor: "rgba(15, 23, 42, 0.5)",
                                                borderRadius: "6px",
                                                border: "1px solid rgba(71, 85, 105, 0.3)",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <FileText size={20} style={{ color: "#22c55e" }} />
                                                <Box>
                                                    <Typography sx={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 500 }}>
                                                        {sub.fileName || sub.title || `Submission ${idx + 1}`}
                                                    </Typography>
                                                    <Typography sx={{ color: "#64748b", fontSize: "11px" }}>
                                                        {sub.submittedAt ? `Submitted: ${new Date(sub.submittedAt).toLocaleString()}` : ""}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                size="small"
                                                startIcon={<Eye size={14} />}
                                                onClick={() => window.open(sub.filePath || sub.fileUrl || sub.url, "_blank")}
                                                sx={{ color: "#22c55e", fontSize: "12px" }}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography sx={{ color: "#64748b", fontSize: "13px", fontStyle: "italic" }}>
                                    No submissions yet
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
                    <Button onClick={() => setSubmissionsModalOpen(false)} sx={{ color: "#64748b" }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Hidden Certificate for Generator */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <div ref={certificateRef} style={{ width: "1123px", height: "794px", position: "relative", background: `url(${background})`, backgroundSize: "cover", fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "80%" }}>
                        <div style={{ fontSize: "52px", fontWeight: 800, color: "#1e293b", marginBottom: "30px", textTransform: "uppercase" }}>{certEditModalOpen ? certForm.recipientName : selectedStudent?.student?.name}</div>
                        <div style={{ fontSize: "20px", color: "#475569", lineHeight: 1.6 }}>Has successfully completed the professional development course in</div>
                        <div style={{ fontSize: "32px", fontWeight: 700, color: "#020617", margin: "20px 0", textTransform: "capitalize" }}>{certEditModalOpen ? certForm.domain : course.name}</div>
                        <div style={{ fontSize: "16px", color: "#64748b", marginTop: "40px" }}>Duration: {dayjs(certEditModalOpen ? certForm.startDate : (selectedStudent?.certificateDetails?.startDate || course.startDate)).format("Do MMMM YYYY")} to {dayjs(certEditModalOpen ? certForm.endDate : (selectedStudent?.certificateDetails?.endDate || course.endDate)).format("Do MMMM YYYY")}</div>
                    </div>
                </div>
            </div>

            {/* Upload Materials Modal */}
            <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", borderRadius: "12px" } }}>
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#f8fafc" }}>
                    Upload Materials - {selectedStudent?.student?.name}
                    <IconButton onClick={() => setUploadModalOpen(false)} sx={{ color: "#64748b" }}><X size={20} /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" component="label" startIcon={<UploadSimple size={20} />} fullWidth sx={{ mb: 3, py: 2, borderColor: "rgba(71, 85, 105, 0.4)", color: "#94a3b8", borderStyle: "dashed" }}>
                            Click to select files
                            <input type="file" hidden multiple onChange={(e) => {
                                if (e.target.files) {
                                    const files = Array.from(e.target.files);
                                    setUploadFiles([...uploadFiles, ...files]);
                                    setFileTypes([...fileTypes, ...files.map(() => "learning-material")]);
                                }
                            }} />
                        </Button>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {uploadFiles.map((file, i) => (
                                <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, bgcolor: "rgba(15, 23, 42, 0.5)", borderRadius: "8px", border: "1px solid rgba(71, 85, 105, 0.3)" }}>
                                    <Typography variant="caption" sx={{ flex: 1, color: "#f1f5f9" }}>{file.name}</Typography>
                                    <IconButton size="small" onClick={() => {
                                        setUploadFiles(uploadFiles.filter((_, idx) => idx !== i));
                                        setFileTypes(fileTypes.filter((_, idx) => idx !== i));
                                    }} sx={{ color: "#ef4444" }}><X size={14} /></IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={uploadFiles.length === 0 || uploadMutation.isPending}
                        onClick={() => {
                            const formData = new FormData();
                            uploadFiles.forEach(f => formData.append("files", f));
                            formData.append("fileTypes", JSON.stringify(fileTypes));
                            uploadMutation.mutate({ id: selectedStudent._id, formData }, {
                                onSuccess: () => {
                                    CustomSnackBar.successSnackbar("Files uploaded successfully!");
                                    setUploadModalOpen(false);
                                }
                            });
                        }}
                        sx={{ bgcolor: "#3b82f6" }}
                    >
                        {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Issue Certificate Modal */}
            <Dialog open={certIssueModalOpen} onClose={() => setCertIssueModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", borderRadius: "12px" } }}>
                <DialogTitle sx={{ color: "#f8fafc", textAlign: "center", pt: 4 }}>Issue Certificate</DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography sx={{ color: "#94a3b8", mb: 3 }}>
                        This will generate a certificate for <strong>{selectedStudent?.student?.name}</strong> and mark the course as completed.
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={generating}
                        onClick={async () => {
                            if (!certificateRef.current || !selectedStudent) return;
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
                                formData.append("certificate", pdfBlob, `${selectedStudent.student.name}_Certificate.pdf`);

                                completeMutation.mutate({ id: selectedStudent._id, formData }, {
                                    onSuccess: () => {
                                        CustomSnackBar.successSnackbar("Certificate issued & Course Completed!");
                                        setCertIssueModalOpen(false);
                                    }
                                });
                            } catch (err) {
                                CustomSnackBar.errorSnackbar("Failed to generate certificate");
                            } finally { setGenerating(false); }
                        }}
                        sx={{ bgcolor: "#10b981", py: 1.5, fontWeight: 700 }}
                    >
                        {generating ? "Generating..." : "Generate & Complete"}
                    </Button>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: "center" }}>
                    <Button onClick={() => setCertIssueModalOpen(false)} sx={{ color: "#64748b" }}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Certificate Details Modal */}
            <Dialog open={certEditModalOpen} onClose={() => setCertEditModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", borderRadius: "12px" } }}>
                <DialogTitle sx={{ color: "#f8fafc" }}>Update & Regenerate</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Student Name"
                            value={certForm.recipientName}
                            onChange={(e) => setCertForm({ ...certForm, recipientName: e.target.value })}
                            sx={{ ...textFieldStyles }}
                        />
                        <TextField
                            fullWidth
                            label="Course Name"
                            value={certForm.domain}
                            onChange={(e) => setCertForm({ ...certForm, domain: e.target.value })}
                            sx={{ ...textFieldStyles }}
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                type="date"
                                label="Start Date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={certForm.startDate}
                                onChange={(e) => setCertForm({ ...certForm, startDate: e.target.value })}
                                sx={{ ...textFieldStyles }}
                            />
                            <TextField
                                type="date"
                                label="End Date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={certForm.endDate}
                                onChange={(e) => setCertForm({ ...certForm, endDate: e.target.value })}
                                sx={{ ...textFieldStyles }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCertEditModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={regenerating}
                        onClick={async () => {
                            if (!certificateRef.current || !selectedStudent) return;
                            setRegenerating(true);
                            try {
                                await updateCertMutation.mutateAsync({ id: selectedStudent._id, data: certForm });
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

                                await completeMutation.mutateAsync({ id: selectedStudent._id, formData });
                                CustomSnackBar.successSnackbar("Certificate regenerated!");
                                setCertEditModalOpen(false);
                            } catch (err) {
                                CustomSnackBar.errorSnackbar("Failed to regenerate certificate");
                            } finally { setRegenerating(false); }
                        }}
                        sx={{ bgcolor: "#a855f7" }}
                    >
                        {regenerating ? "Regenerating..." : "Update & Regenerate"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Global Materials Upload Modal */}
            <Dialog open={globalUploadModalOpen} onClose={() => setGlobalUploadModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", borderRadius: "12px" } }}>
                <DialogTitle sx={{ color: "#f8fafc" }}>Upload Program Materials</DialogTitle>
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
                                "&:hover": { borderColor: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.05)" }
                            }}>
                                <Plus size={32} style={{ color: "#3b82f6", marginBottom: "8px" }} />
                                <Typography sx={{ color: "#f8fafc", fontWeight: 500 }}>
                                    Click to select files
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "12px", mt: 0.5 }}>
                                    Upload training manuals, resources, or case studies
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
                            globalUploadMutation.mutate({ id: course._id, formData }, {
                                onSuccess: () => {
                                    setGlobalUploadModalOpen(false);
                                    setUploadFiles([]);
                                    CustomSnackBar.successSnackbar("Materials uploaded successfully!");
                                }
                            });
                        }}
                        variant="contained"
                        sx={{ bgcolor: "#3b82f6", color: "#fff", "&:hover": { bgcolor: "#2563eb" } }}
                    >
                        {globalUploadMutation.isPending ? "Uploading..." : "Save Materials"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
        color: "#f8fafc",
        bgcolor: "rgba(15, 23, 42, 0.5)",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
};

export default EmployeeCourseDetail;

