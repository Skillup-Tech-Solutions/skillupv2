import { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Modal,
    TextField,
    Grid,
    Chip,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Plus,
    X,
    VideoCamera,
    Play,
    Stop,
    Trash,
    CalendarBlank,
    Clock,
    Users,
    ArrowSquareOut,
    Devices,
    Warning,
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import {
    useGetSessionsByReferenceApi,
    useCreateSessionApi,
    useStartSessionApi,
    useEndSessionApi,
    useDeleteSessionApi,
    useJoinSessionApi,
    type LiveSession,
    type CreateSessionPayload,
} from "../../Hooks/liveSessions";
import VideoRoom from "../VideoRoom/VideoRoom";

interface LiveSessionsTabProps {
    sessionType: "COURSE" | "PROJECT" | "INTERNSHIP";
    referenceId: string;
    referenceName: string;
    userName: string;
    userEmail: string;
}

const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "#1e293b",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "6px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    outline: "none",
    "@media (max-width: 600px)": { width: "90vw" },
};

const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        color: "#f8fafc",
        borderRadius: "6px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
    "& .MuiInputBase-input": { color: "#f8fafc" },
};

const LiveSessionsTab = ({
    sessionType,
    referenceId,
    referenceName,
    userName,
    userEmail,
}: LiveSessionsTabProps) => {
    const [showModal, setShowModal] = useState(false);
    const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        scheduledAt: "",
        durationMinutes: 60,
    });
    const [pendingJoinSession, setPendingJoinSession] = useState<LiveSession | null>(null);
    const [showJoinConfirm, setShowJoinConfirm] = useState(false);
    const [isAlreadyIn, setIsAlreadyIn] = useState(false);

    const { data, isLoading, refetch } = useGetSessionsByReferenceApi(
        sessionType,
        referenceId,
        true // include ended sessions
    );
    const sessions = data?.sessions || [];

    const { mutate: createSession, isPending: isCreating } = useCreateSessionApi();
    const { mutate: startSession, isPending: isStarting } = useStartSessionApi();
    const { mutate: endSession, isPending: isEnding } = useEndSessionApi();
    const { mutate: deleteSession, isPending: isDeleting } = useDeleteSessionApi();
    const { mutate: joinSession } = useJoinSessionApi();

    const handleCreate = () => {
        const payload: CreateSessionPayload = {
            title: formData.title || `${referenceName} Live Session`,
            description: formData.description,
            sessionType,
            referenceId,
            scheduledAt: new Date(formData.scheduledAt).toISOString(),
            durationMinutes: formData.durationMinutes,
        };

        createSession(payload, {
            onSuccess: () => {
                setShowModal(false);
                setFormData({ title: "", description: "", scheduledAt: "", durationMinutes: 60 });
                refetch();
            },
        });
    };

    const handleStart = (sessionId: string) => {
        startSession(sessionId, { onSuccess: () => refetch() });
    };

    const handleEnd = (sessionId: string) => {
        if (window.confirm("Are you sure you want to end this session?")) {
            endSession(sessionId, { onSuccess: () => refetch() });
        }
    };

    const handleDelete = (sessionId: string) => {
        if (window.confirm("Are you sure you want to delete this session?")) {
            deleteSession(sessionId, { onSuccess: () => refetch() });
        }
    };

    const handleJoin = (session: LiveSession) => {
        joinSession(session._id, {
            onSuccess: (data: any) => {
                if (data.alreadyActive) {
                    setPendingJoinSession(data.session || session);
                    setIsAlreadyIn(true);
                    setShowJoinConfirm(true);
                } else {
                    setActiveSession(data.session || session);
                }
            },
        });
    };

    const confirmJoin = () => {
        if (pendingJoinSession) {
            setActiveSession(pendingJoinSession);
            setPendingJoinSession(null);
            setShowJoinConfirm(false);
            setIsAlreadyIn(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "LIVE":
                return { bg: "#22c55e", text: "#fff" };
            case "SCHEDULED":
                return { bg: "#3b82f6", text: "#fff" };
            case "ENDED":
                return { bg: "#6b7280", text: "#fff" };
            case "CANCELLED":
                return { bg: "#ef4444", text: "#fff" };
            default:
                return { bg: "#6b7280", text: "#fff" };
        }
    };

    if (activeSession) {
        return (
            <VideoRoom
                session={activeSession}
                userName={userName}
                userEmail={userEmail}
                isHost={true}
                onExit={() => {
                    setActiveSession(null);
                    refetch();
                }}
                onEndSession={() => {
                    endSession(activeSession._id, {
                        onSuccess: () => {
                            setActiveSession(null);
                            refetch();
                        }
                    });
                }}
            />
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Join Confirmation Dialog */}
            <Dialog
                open={showJoinConfirm}
                onClose={() => setShowJoinConfirm(false)}
                PaperProps={{
                    sx: {
                        bgcolor: "#1e293b",
                        backgroundImage: "none",
                        border: "1px solid rgba(71, 85, 105, 0.4)",
                        borderRadius: "12px",
                        maxWidth: "400px"
                    }
                }}
            >
                <DialogTitle sx={{ color: "#f8fafc", px: 3, pt: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                    {isAlreadyIn ? <Devices size={24} weight="duotone" color="#3b82f6" /> : <VideoCamera size={24} weight="duotone" color="#3b82f6" />}
                    {isAlreadyIn ? "Already in Session" : "Join Session"}
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
                        {isAlreadyIn
                            ? "You are already active in this session on another device. Do you want to join as an additional connection?"
                            : `Ready to join "${pendingJoinSession?.title}"?`}
                    </Typography>
                    {isAlreadyIn && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "6px", display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Warning size={18} color="#eab308" />
                            <Typography sx={{ color: "#eab308", fontSize: "12px" }}>
                                Joining from multiple devices is allowed but not recommended
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 4, pt: 1, gap: 1.5 }}>
                    <Button
                        onClick={() => setShowJoinConfirm(false)}
                        sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmJoin}
                        variant="contained"
                        sx={{
                            bgcolor: "#3b82f6",
                            color: "#fff",
                            fontWeight: 700,
                            textTransform: "none",
                            px: 3,
                            "&:hover": { bgcolor: "#2563eb" }
                        }}
                    >
                        {isAlreadyIn ? "Join as Second Device" : "Join Now"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>
                        Live Sessions
                    </Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                        Schedule and manage live video sessions for {referenceName}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} weight="bold" />}
                    onClick={() => setShowModal(true)}
                    sx={{
                        bgcolor: "#3b82f6",
                        color: "#fff",
                        borderRadius: "6px",
                        px: 2.5,
                        py: 1,
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#2563eb" },
                    }}
                >
                    Schedule Session
                </Button>
            </Box>

            {/* Sessions List */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
                </Box>
            ) : sessions.length === 0 ? (
                <Box
                    sx={{
                        py: 8,
                        textAlign: "center",
                        border: "1px dashed rgba(71, 85, 105, 0.4)",
                        borderRadius: "6px",
                    }}
                >
                    <VideoCamera size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                    <Typography sx={{ color: "#94a3b8" }}>
                        No live sessions scheduled yet
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                        Click "Schedule Session" to create your first live session
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {sessions.map((session) => {
                        const statusColor = getStatusColor(session.status);
                        return (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session._id}>
                                <Box
                                    sx={{
                                        bgcolor: "#1e293b",
                                        border: "1px solid rgba(71, 85, 105, 0.4)",
                                        borderRadius: "6px",
                                        p: 2.5,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                    }}
                                >
                                    {/* Title & Status */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", flex: 1 }}>
                                            {session.title}
                                        </Typography>
                                        <Chip
                                            label={session.status}
                                            size="small"
                                            sx={{
                                                bgcolor: statusColor.bg,
                                                color: statusColor.text,
                                                fontWeight: 600,
                                                fontSize: "10px",
                                                height: 22,
                                                ...(session.status === "LIVE" && {
                                                    animation: "pulse 2s infinite",
                                                    "@keyframes pulse": {
                                                        "0%": { opacity: 1 },
                                                        "50%": { opacity: 0.7 },
                                                        "100%": { opacity: 1 },
                                                    },
                                                }),
                                            }}
                                        />
                                    </Box>

                                    {/* Description */}
                                    {session.description && (
                                        <Typography sx={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5 }}>
                                            {session.description}
                                        </Typography>
                                    )}

                                    {/* Meta Info */}
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748b" }}>
                                            <CalendarBlank size={14} />
                                            <Typography sx={{ fontSize: "12px" }}>
                                                {dayjs(session.scheduledAt).format("MMM D, YYYY")}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748b" }}>
                                            <Clock size={14} />
                                            <Typography sx={{ fontSize: "12px" }}>
                                                {dayjs(session.scheduledAt).format("h:mm A")} • {session.durationMinutes} min
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: session.status === "LIVE" ? "#22c55e" : "#64748b" }}>
                                            <Users size={14} />
                                            <Typography sx={{ fontSize: "12px", fontWeight: session.status === "LIVE" ? 600 : 400 }}>
                                                {session.status === "LIVE"
                                                    ? `${session.activeParticipantsCount || 0} active`
                                                    : `${session.maxParticipants || 0} joined`}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                                        {session.status === "SCHEDULED" && (
                                            <>
                                                <Button
                                                    size="small"
                                                    startIcon={<Play size={16} />}
                                                    onClick={() => handleStart(session._id)}
                                                    disabled={isStarting}
                                                    sx={{
                                                        flex: 1,
                                                        bgcolor: "rgba(34, 197, 94, 0.15)",
                                                        color: "#22c55e",
                                                        fontWeight: 600,
                                                        fontSize: "12px",
                                                        "&:hover": { bgcolor: "rgba(34, 197, 94, 0.25)" },
                                                    }}
                                                >
                                                    Start
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(session._id)}
                                                    disabled={isDeleting}
                                                    sx={{ color: "#ef4444", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" } }}
                                                >
                                                    <Trash size={16} />
                                                </IconButton>
                                            </>
                                        )}
                                        {session.status === "LIVE" && (
                                            <>
                                                <Button
                                                    size="small"
                                                    startIcon={<ArrowSquareOut size={16} />}
                                                    onClick={() => handleJoin(session)}
                                                    sx={{
                                                        flex: 1,
                                                        bgcolor: "rgba(59, 130, 246, 0.15)",
                                                        color: "#3b82f6",
                                                        fontWeight: 600,
                                                        fontSize: "12px",
                                                        "&:hover": { bgcolor: "rgba(59, 130, 246, 0.25)" },
                                                    }}
                                                >
                                                    Join Session
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<Stop size={16} />}
                                                    onClick={() => handleEnd(session._id)}
                                                    disabled={isEnding}
                                                    sx={{
                                                        bgcolor: "rgba(239, 68, 68, 0.15)",
                                                        color: "#ef4444",
                                                        fontWeight: 600,
                                                        fontSize: "12px",
                                                        "&:hover": { bgcolor: "rgba(239, 68, 68, 0.25)" },
                                                    }}
                                                >
                                                    End
                                                </Button>
                                            </>
                                        )}
                                        {(session.status === "ENDED" || session.status === "CANCELLED") && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(session._id)}
                                                disabled={isDeleting}
                                                sx={{ color: "#ef4444", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" } }}
                                            >
                                                <Trash size={16} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Create Session Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <Box sx={modalStyle}>
                    <Box
                        sx={{
                            p: 2.5,
                            borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "16px" }}>
                            Schedule Live Session
                        </Typography>
                        <IconButton onClick={() => setShowModal(false)} sx={{ color: "#94a3b8" }}>
                            <X size={20} />
                        </IconButton>
                    </Box>
                    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <TextField
                            label="Session Title"
                            placeholder={`${referenceName} Live Session`}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                            sx={textFieldStyles}
                        />
                        <TextField
                            label="Description (Optional)"
                            placeholder="What will be covered in this session?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                            sx={textFieldStyles}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    label="Date & Time"
                                    type="datetime-local"
                                    value={formData.scheduledAt}
                                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label="Duration (min)"
                                    type="number"
                                    value={formData.durationMinutes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })
                                    }
                                    fullWidth
                                    sx={textFieldStyles}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
                            <Button onClick={() => setShowModal(false)} sx={{ color: "#94a3b8" }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCreate}
                                disabled={isCreating || !formData.scheduledAt}
                                sx={{
                                    bgcolor: "#3b82f6",
                                    color: "#fff",
                                    px: 3,
                                    fontWeight: 600,
                                    "&:hover": { bgcolor: "#2563eb" },
                                }}
                            >
                                {isCreating ? "Scheduling..." : "Schedule Session"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default LiveSessionsTab;
