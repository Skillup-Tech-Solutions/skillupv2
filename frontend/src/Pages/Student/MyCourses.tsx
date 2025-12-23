import { useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Divider,
    Stack,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useGetPaymentSettings, useUploadPaymentProof } from "../../Hooks/payment";
import {
    MdDownload,
    MdUpload,
    MdPayment,
    MdSchool,
    MdAccessTime,
    MdPerson,
    MdCalendarToday,
    MdDescription,
    MdCloudDownload,
    MdCheckCircle,
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import config from "../../Config/Config";
import { primaryButtonStyle, outlinedButtonStyle, dangerButtonStyle } from "../../assets/Styles/ButtonStyles";

const MyCourses = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();

    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");

    // Payment proof upload state
    const [paymentProofModal, setPaymentProofModal] = useState(false);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const paymentProofMutation = useUploadPaymentProof();

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-courses"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-courses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const { data: paymentSettings } = useGetPaymentSettings();

    const uploadMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            if (uploadFile) formData.append("file", uploadFile);
            formData.append("notes", notes);

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/courses/${selectedCourse._id}/upload-assignment`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assignment uploaded successfully");
            queryClient.invalidateQueries({ queryKey: ["my-courses"] });
            setUploadModal(false);
            setUploadFile(null);
            setNotes("");
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload"),
    });

    const handleDownload = (path: string, filename: string) => {
        const link = document.createElement("a");
        if (path.startsWith("http")) {
            link.href = path;
        } else {
            link.href = `${import.meta.env.VITE_APP_BASE_URL}/${path}`;
        }
        link.setAttribute("download", filename);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get status badge
    const getStatusBadge = (assignment: any) => {
        const status = assignment.status;
        const paymentStatus = assignment.payment?.status;

        if (status === "completed") {
            return { label: "Completed", color: "#22c55e", bg: "#f0fdf4" };
        }
        if (paymentStatus === "pending") {
            if (assignment.payment?.proofFile) {
                return { label: "Payment Verifying", color: "#f59e0b", bg: "#fffbeb" };
            }
            return { label: "Payment Required", color: "#ef4444", bg: "#fef2f2" };
        }
        if (status === "in-progress") {
            return { label: "In Progress", color: "var(--webprimary)", bg: "#eff6ff" };
        }
        return { label: "Enrolled", color: "#8b5cf6", bg: "#f5f3ff" };
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress sx={{ color: "var(--webprimary)" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Failed to load courses. Please try again.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
            {/* Page Header - Matching Landing Page Style */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "24px",
                        color: "var(--title)",
                        "@media (max-width: 768px)": { fontSize: "22px" },
                    }}
                >
                    My Courses
                </Typography>
                <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                    Track your learning progress and manage your course assignments
                </Typography>
            </Box>

            {!data || data.length === 0 ? (
                <Card sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    p: 6,
                    textAlign: "center"
                }}>
                    <MdSchool size={48} color="var(--greyText)" />
                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "18px", mt: 2, mb: 1 }}>
                        No courses yet!
                    </Typography>
                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", color: "var(--greyText)" }}>
                        Contact admin to get enrolled in courses.
                    </Typography>
                </Card>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((assignment: any) => {
                        const course = assignment.itemId;
                        const statusBadge = getStatusBadge(assignment);
                        const isCompleted = assignment.status === "completed";
                        const paymentPending = assignment.payment?.status === "pending";
                        const canUpload = assignment.status === "in-progress" && !paymentPending;

                        return (
                            <Card key={assignment._id} sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: "10px",
                                overflow: "hidden"
                            }}>
                                {/* Course Header with Image */}
                                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
                                    {/* Course Image */}
                                    {course?.fileupload && (
                                        <Box
                                            component="img"
                                            src={`${config.BASE_URL_MAIN}/uploads/${course.fileupload}`}
                                            alt={course?.name}
                                            sx={{
                                                width: { xs: "100%", sm: 200 },
                                                height: { xs: 150, sm: 180 },
                                                objectFit: "cover",
                                                flexShrink: 0
                                            }}
                                        />
                                    )}

                                    {/* Course Info */}
                                    <CardContent sx={{ flex: 1, p: 3 }}>
                                        {/* Status Badge */}
                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={statusBadge.label}
                                                size="small"
                                                sx={{
                                                    fontFamily: "Medium_W",
                                                    fontSize: "11px",
                                                    bgcolor: statusBadge.bg,
                                                    color: statusBadge.color,
                                                    border: `1px solid ${statusBadge.color}`,
                                                    fontWeight: 600
                                                }}
                                            />
                                        </Box>

                                        {/* Course Title */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontFamily: "SemiBold_W",
                                                fontSize: "18px",
                                                color: "var(--title)",
                                                mb: 1
                                            }}
                                        >
                                            {course?.name || "Untitled Course"}
                                        </Typography>

                                        {/* Course Meta */}
                                        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                                            {course?.trainer && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                                    <MdPerson size={14} />
                                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>{course.trainer}</Typography>
                                                </Box>
                                            )}
                                            {course?.duration && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                                    <MdAccessTime size={14} />
                                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>{course.duration}</Typography>
                                                </Box>
                                            )}
                                            {course?.startDate && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--greyText)" }}>
                                                    <MdCalendarToday size={14} />
                                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>
                                                        {new Date(course.startDate).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>

                                        {/* Description */}
                                        {course?.description && (
                                            <Typography sx={{
                                                fontFamily: "Regular_W",
                                                fontSize: "13px",
                                                color: "var(--greyText)",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden"
                                            }}>
                                                {course.description}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Box>

                                <Divider />

                                {/* Action Section */}
                                <Box sx={{ p: 3 }}>
                                    {/* PAYMENT REQUIRED */}
                                    {paymentPending && !assignment.payment?.proofFile && (
                                        <Box sx={{
                                            p: 3,
                                            bgcolor: "#fef2f2",
                                            borderRadius: "8px",
                                            border: "1px solid #fecaca",
                                            mb: 2
                                        }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <MdPayment color="#ef4444" size={20} />
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#dc2626" }}>
                                                    Payment Required
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 3,
                                                p: 2,
                                                bgcolor: "white",
                                                borderRadius: "6px",
                                                mb: 2
                                            }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px", color: "var(--greyText)" }}>Amount</Typography>
                                                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "24px", color: "#dc2626" }}>
                                                        ₹{assignment.payment?.amount || 0}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Payment Details */}
                                            {paymentSettings && (
                                                <Box sx={{ mb: 2, p: 2, bgcolor: "white", borderRadius: "6px" }}>
                                                    <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "13px", mb: 1 }}>Payment Options:</Typography>
                                                    {paymentSettings.enableBankTransfer && (
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>Bank Transfer</Typography>
                                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>
                                                                {paymentSettings.bankDetails?.accountHolderName} | A/C: {paymentSettings.bankDetails?.accountNumber} | IFSC: {paymentSettings.bankDetails?.ifsc}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {paymentSettings.enableUPI && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                            <Box>
                                                                <Typography sx={{ fontFamily: "Medium_W", fontSize: "11px", color: "var(--greyText)", textTransform: "uppercase" }}>UPI</Typography>
                                                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "12px" }}>{paymentSettings.upiId}</Typography>
                                                            </Box>
                                                            {paymentSettings.qrUrl && (
                                                                <Box component="img" src={paymentSettings.qrUrl} alt="QR" sx={{ width: 60, borderRadius: "4px" }} />
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<MdUpload />}
                                                onClick={() => { setSelectedCourse(assignment); setPaymentProofModal(true); }}
                                                sx={{ ...dangerButtonStyle, py: 1.2, fontSize: "13px" }}
                                            >
                                                Upload Payment Screenshot
                                            </Button>
                                        </Box>
                                    )}

                                    {/* PAYMENT VERIFYING */}
                                    {paymentPending && assignment.payment?.proofFile && (
                                        <Box sx={{
                                            p: 3,
                                            bgcolor: "#fffbeb",
                                            borderRadius: "8px",
                                            border: "1px solid #fcd34d",
                                            textAlign: "center",
                                            mb: 2
                                        }}>
                                            <MdAccessTime size={32} color="#f59e0b" />
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#d97706", mt: 1 }}>
                                                Payment Under Review
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)" }}>
                                                Your payment proof has been submitted. Admin will verify it soon.
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* IN PROGRESS */}
                                    {canUpload && (
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<MdUpload />}
                                                onClick={() => { setSelectedCourse(assignment); setUploadModal(true); }}
                                                sx={{ ...primaryButtonStyle, py: 1 }}
                                            >
                                                Submit Assignment
                                            </Button>
                                        </Box>
                                    )}

                                    {/* COMPLETED */}
                                    {isCompleted && (
                                        <Box sx={{
                                            p: 3,
                                            bgcolor: "#f0fdf4",
                                            borderRadius: "8px",
                                            border: "1px solid #86efac",
                                            mb: 2
                                        }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <MdCheckCircle color="#22c55e" size={20} />
                                                <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#16a34a" }}>
                                                    Course Completed!
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)", mb: 2 }}>
                                                Congratulations! Download your certificate below.
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                {assignment.certificate?.url && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<MdDownload />}
                                                        onClick={() => handleDownload(assignment.certificate.url, "Certificate.pdf")}
                                                        sx={{
                                                            bgcolor: "#22c55e",
                                                            color: "white",
                                                            fontFamily: "Medium_W",
                                                            fontSize: "12px",
                                                            "&:hover": { bgcolor: "#16a34a" }
                                                        }}
                                                    >
                                                        Download Certificate
                                                    </Button>
                                                )}
                                                {assignment.invoice?.url && (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<MdDescription />}
                                                        onClick={() => handleDownload(assignment.invoice.url, `Invoice_${assignment.invoice.invoiceNumber}.pdf`)}
                                                        sx={{ ...outlinedButtonStyle }}
                                                    >
                                                        Download Invoice
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* ENROLLED */}
                                    {assignment.status === "assigned" && !paymentPending && (
                                        <Box sx={{
                                            p: 3,
                                            bgcolor: "#f5f3ff",
                                            borderRadius: "8px",
                                            border: "1px solid #c4b5fd",
                                            textAlign: "center"
                                        }}>
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "16px", color: "#7c3aed" }}>
                                                You're Enrolled!
                                            </Typography>
                                            <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px", color: "var(--greyText)" }}>
                                                Your course will start soon. Check back for updates.
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Course Materials */}
                                    {assignment.deliveryFiles?.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography sx={{ fontFamily: "SemiBold_W", fontSize: "13px", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                                <MdCloudDownload /> Course Materials
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                    <Chip
                                                        key={idx}
                                                        label={file.fileName}
                                                        size="small"
                                                        icon={<MdDownload />}
                                                        onClick={() => handleDownload(file.filePath, file.fileName)}
                                                        sx={{ fontFamily: "Regular_W", fontSize: "11px", cursor: "pointer" }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Upload Assignment Modal */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--borderColor)",
                    fontFamily: "SemiBold_W",
                    fontSize: "16px"
                }}>
                    Submit Assignment
                    <IconButton onClick={() => setUploadModal(false)} size="small"><IoClose /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Alert severity="info" sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                            Upload your assignment for <strong>{selectedCourse?.itemId?.name}</strong>
                        </Alert>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                height: 100,
                                borderStyle: "dashed",
                                borderColor: "var(--borderColor)",
                                fontFamily: "Regular_W",
                                fontSize: "13px"
                            }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                <MdUpload size={32} />
                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                                    {uploadFile ? uploadFile.name : "Click to select file"}
                                </Typography>
                            </Box>
                            <input type="file" hidden onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                        </Button>
                        <TextField
                            label="Notes (Optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setUploadModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => uploadMutation.mutate()}
                        disabled={!uploadFile || uploadMutation.isPending}
                        sx={{ ...primaryButtonStyle }}
                    >
                        {uploadMutation.isPending ? "Uploading..." : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Proof Modal */}
            <Dialog open={paymentProofModal} onClose={() => setPaymentProofModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--borderColor)",
                    fontFamily: "SemiBold_W",
                    fontSize: "16px"
                }}>
                    Upload Payment Proof
                    <IconButton onClick={() => setPaymentProofModal(false)} size="small"><IoClose /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Alert severity="info" sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                            Upload screenshot for <strong>{selectedCourse?.itemId?.name}</strong>
                            <br />Amount: <strong>₹{selectedCourse?.payment?.amount}</strong>
                        </Alert>

                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                height: 100,
                                borderStyle: "dashed",
                                borderColor: "var(--borderColor)",
                                fontFamily: "Regular_W",
                                fontSize: "13px"
                            }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                <MdUpload size={32} />
                                <Typography sx={{ fontFamily: "Regular_W", fontSize: "13px" }}>
                                    {paymentProofFile ? paymentProofFile.name : "Click to upload proof"}
                                </Typography>
                            </Box>
                            <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)} />
                        </Button>

                        <TextField
                            select
                            label="Payment Method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            fullWidth
                            SelectProps={{ native: true }}
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        >
                            <option value="">Select Method</option>
                            <option value="upi">UPI</option>
                            <option value="bank-transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="other">Other</option>
                        </TextField>

                        <TextField
                            label="Transaction ID (Optional)"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            fullWidth
                            placeholder="e.g., UPI Ref No"
                            sx={{ "& .MuiInputBase-root": { fontFamily: "Regular_W", fontSize: "13px" } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setPaymentProofModal(false)} sx={{ fontFamily: "Medium_W", fontSize: "12px" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (!paymentProofFile || !selectedCourse) return;
                            const formData = new FormData();
                            formData.append("proofFile", paymentProofFile);
                            if (paymentMethod) formData.append("paymentMethod", paymentMethod);
                            if (transactionId) formData.append("transactionId", transactionId);

                            paymentProofMutation.mutate({
                                assignmentId: selectedCourse._id,
                                formData
                            }, {
                                onSuccess: () => {
                                    CustomSnackBar.successSnackbar("Payment proof uploaded!");
                                    queryClient.invalidateQueries({ queryKey: ["my-courses"] });
                                    setPaymentProofModal(false);
                                    setPaymentProofFile(null);
                                    setPaymentMethod("");
                                    setTransactionId("");
                                },
                                onError: (err: any) => {
                                    CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload");
                                }
                            });
                        }}
                        disabled={!paymentProofFile || paymentProofMutation.isPending}
                        sx={{ ...dangerButtonStyle }}
                    >
                        {paymentProofMutation.isPending ? "Uploading..." : "Submit Proof"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyCourses;
