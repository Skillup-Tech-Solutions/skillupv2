import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
} from "@mui/material";
import {
    VideoCamera,
    CalendarBlank,
    Clock,
    Users,
    ArrowSquareOut,
    BookOpen,
    Briefcase,
    Buildings,
    ClockCounterClockwise,
    Devices,
    Warning,
    ArrowsClockwise,
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocation } from "react-router-dom";
import { getFromStorage } from "../../utils/pwaUtils";
import {
    useGetLiveNowSessionsApi,
    useGetUpcomingSessionsApi,
    useGetSessionHistoryApi,
    useJoinSessionApi,
    type LiveSession,
} from "../../Hooks/liveSessions";
import { useLiveSessionSocket } from "../../Hooks/useLiveSessionSocket";
import VideoRoom from "../VideoRoom/VideoRoom";
import { LiveSessionSkeleton } from "./PortalSkeletons";
import { Skeleton } from "@mui/material";
import { usePullToRefresh } from "../../utils/usePullToRefresh";
import PullToRefreshIndicator from "./PullToRefreshIndicator";
import { useRequestTransferHere } from "../../Hooks/useActiveSession";
import { logger } from "../../utils/logger";

dayjs.extend(relativeTime);

const StudentLiveSessions = () => {
    const userName = getFromStorage("name") || "Student";
    const userEmail = getFromStorage("email") || "";
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(0);
    const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
    const [pendingSession, setPendingSession] = useState<LiveSession | null>(null);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [isAlreadyActive, setIsAlreadyActive] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");

    const { data: liveData, isLoading: liveLoading, refetch: refetchLive } = useGetLiveNowSessionsApi();
    const { data: upcomingData, isLoading: upcomingLoading, refetch: refetchUpcoming } = useGetUpcomingSessionsApi();
    const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useGetSessionHistoryApi();
    const { mutate: joinSession } = useJoinSessionApi();
    const { mutate: requestTransfer, isPending: isTransferring } = useRequestTransferHere();

    // Enable real-time updates via Socket.IO
    useLiveSessionSocket();

    // Handle auto-join from transfer navigation
    useEffect(() => {
        const state = location.state as { autoJoinSession?: LiveSession; roomId?: string } | null;
        if (state?.autoJoinSession) {
            // Directly join the session from transfer
            setActiveSession(state.autoJoinSession);
            // Clear the state to prevent re-joining on back navigation
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const { pullDistance, isRefreshing } = usePullToRefresh({
        onRefresh: async () => {
            await Promise.all([refetchLive(), refetchUpcoming(), refetchHistory()]);
        },
    });

    const liveSessions = liveData?.sessions || [];
    const upcomingSessions = upcomingData?.sessions || [];
    const historySessions = historyData?.sessions || [];

    const handleJoin = (session: LiveSession) => {
        joinSession(session._id, {
            onSuccess: (data: any) => {
                logger.log("[LiveSession] Join response:", data);
                if (data.alreadyActive) {
                    setPendingSession(data.session || session);
                    setIsAlreadyActive(true);
                    setShowJoinDialog(true);
                } else {
                    setActiveSession(data.session || session);
                }
            },
        });
    };

    const confirmJoin = () => {
        if (pendingSession) {
            setActiveSession(pendingSession);
            setPendingSession(null);
            setShowJoinDialog(false);
            setIsAlreadyActive(false);
        }
    };

    const handleTransfer = () => {
        if (pendingSession) {
            requestTransfer(pendingSession._id, {
                onSuccess: (data) => {
                    // Success is handled by useRequestTransferHere (it updates cache)
                    // But we also want to transition the UI to the video room
                    if ((data.status || (data as any).success) && data.session) {
                        setActiveSession(data.session);
                        setPendingSession(null);
                        setShowJoinDialog(false);
                        setIsAlreadyActive(false);
                    }
                }
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "COURSE":
                return <BookOpen size={16} weight="duotone" style={{ color: "#60a5fa" }} />;
            case "PROJECT":
                return <Briefcase size={16} weight="duotone" style={{ color: "#a78bfa" }} />;
            case "INTERNSHIP":
                return <Buildings size={16} weight="duotone" style={{ color: "#34d399" }} />;
            default:
                return <VideoCamera size={16} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "COURSE":
                return "Course";
            case "PROJECT":
                return "Project";
            case "INTERNSHIP":
                return "Internship";
            default:
                return type;
        }
    };

    // If in active session, show video room
    if (activeSession) {
        return (
            <VideoRoom
                session={activeSession}
                userName={userName || ""}
                userEmail={userEmail || ""}
                isHost={false}
                onExit={() => {
                    setActiveSession(null);
                    refetchLive();
                }}
            />
        );
    }

    if ((liveLoading || upcomingLoading || historyLoading) && !isRefreshing) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                    <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "12px" }} />
                </Box>
                <LiveSessionSkeleton />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <PullToRefreshIndicator
                pullDistance={pullDistance}
                isRefreshing={isRefreshing}
                threshold={80}
            />
            {/* Join Confirmation Dialog */}
            <Dialog
                open={showJoinDialog}
                onClose={() => setShowJoinDialog(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        bgcolor: "#1e293b",
                        backgroundImage: "none",
                        border: isMobile ? "none" : "1px solid rgba(71, 85, 105, 0.4)",
                        borderRadius: isMobile ? 0 : "12px",
                    }
                }}
            >
                <DialogTitle sx={{ color: "#f8fafc", px: 3, pt: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                    {isAlreadyActive ? <Devices size={24} weight="duotone" color="#3b82f6" /> : <VideoCamera size={24} weight="duotone" color="#3b82f6" />}
                    {isAlreadyActive ? "Already in Session" : "Join Session"}
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
                        {isAlreadyActive
                            ? "You are already active in this session on another device. Do you want to join as an additional connection?"
                            : `Ready to join "${pendingSession?.title}"?`}
                    </Typography>
                    {isAlreadyActive && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "6px", display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Warning size={18} color="#eab308" />
                            <Typography sx={{ color: "#eab308", fontSize: "12px" }}>
                                Joining from multiple devices is allowed but not recommended
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 4, pt: 1, gap: 1.5, flexDirection: isAlreadyActive ? "column" : "row", alignItems: "stretch" }}>
                    {isAlreadyActive ? (
                        <>
                            <Button
                                onClick={handleTransfer}
                                variant="contained"
                                disabled={isTransferring}
                                startIcon={isTransferring ? <CircularProgress size={20} color="inherit" /> : <ArrowsClockwise size={20} />}
                                sx={{
                                    bgcolor: "#3b82f6",
                                    color: "#fff",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    py: 1.2,
                                    "&:hover": { bgcolor: "#2563eb" }
                                }}
                            >
                                {isTransferring ? "Transferring..." : "Transfer to This Device"}
                            </Button>
                            <Button
                                onClick={confirmJoin}
                                variant="outlined"
                                disabled={isTransferring}
                                startIcon={<Devices size={20} />}
                                sx={{
                                    color: "#94a3b8",
                                    borderColor: "rgba(71, 85, 105, 0.4)",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    py: 1,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)", borderColor: "rgba(71, 85, 105, 0.6)" }
                                }}
                            >
                                Join as Second Device
                            </Button>
                            <Button
                                onClick={() => setShowJoinDialog(false)}
                                disabled={isTransferring}
                                sx={{ color: "#64748b", fontWeight: 500, fontSize: "13px", textTransform: "none", mt: 1 }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => setShowJoinDialog(false)}
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
                                Join Now
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
            {/* Header */}
            <Box>
                <Typography
                    sx={{
                        fontSize: "24px",
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 800,
                        color: "#f8fafc",
                        mb: 0.5,
                    }}
                >
                    Live Sessions
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "14px" }}>
                    Join live video sessions for your courses, projects, and internships
                </Typography>
            </Box>

            {/* Live Now Banner */}
            {liveSessions.length > 0 && (
                <Box
                    sx={{
                        bgcolor: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "6px",
                        p: 2.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#22c55e",
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                    "0%": { opacity: 1, transform: "scale(1)" },
                                    "50%": { opacity: 0.5, transform: "scale(1.2)" },
                                    "100%": { opacity: 1, transform: "scale(1)" },
                                },
                            }}
                        />
                        <Typography sx={{ color: "#22c55e", fontWeight: 700, fontSize: "14px" }}>
                            {liveSessions.length} Session{liveSessions.length > 1 ? "s" : ""} Live Now
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {liveSessions.map((session) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session._id}>
                                <Box
                                    sx={{
                                        bgcolor: "#1e293b",
                                        border: "1px solid rgba(71, 85, 105, 0.4)",
                                        borderRadius: "6px",
                                        p: 2,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {getTypeIcon(session.sessionType)}
                                            <Typography sx={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>
                                                {getTypeLabel(session.sessionType)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label="LIVE"
                                            size="small"
                                            sx={{
                                                bgcolor: "#22c55e",
                                                color: "#fff",
                                                fontWeight: 700,
                                                fontSize: "10px",
                                                height: 20,
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", mb: 0.5 }}>
                                        {session.title}
                                    </Typography>
                                    <Typography sx={{ color: "#64748b", fontSize: "12px", mb: 2 }}>
                                        {session.referenceName}
                                    </Typography>
                                    <Button
                                        fullWidth
                                        startIcon={<ArrowSquareOut size={18} />}
                                        onClick={() => handleJoin(session)}
                                        sx={{
                                            bgcolor: "#22c55e",
                                            color: "#fff",
                                            fontWeight: 600,
                                            borderRadius: "6px",
                                            "&:hover": { bgcolor: "#16a34a" },
                                        }}
                                    >
                                        Join Now
                                    </Button>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            <Box
                sx={{
                    position: "sticky",
                    top: { xs: 58, sm: 64 }, // account for layout header
                    zIndex: 30,
                    bgcolor: "rgba(2, 6, 23, 0.8)",
                    backdropFilter: "blur(12px)",
                    mx: { xs: -2, sm: -3 },
                    px: { xs: 2, sm: 3 },
                    borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{
                        "& .MuiTabs-indicator": { bgcolor: "#3b82f6", height: 3, borderRadius: "3px 3px 0 0" },
                        "& .MuiTab-root": {
                            color: "#94a3b8",
                            fontWeight: 600,
                            fontSize: { xs: "12px", sm: "13px" },
                            textTransform: "none",
                            minWidth: "auto",
                            py: 2,
                            "&.Mui-selected": { color: "#3b82f6" },
                        },
                    }}
                >
                    <Tab label={isMobile ? `Live` : `Live Now (${liveSessions.length})`} />
                    <Tab label={isMobile ? `Upcoming` : `Upcoming (${upcomingSessions.length})`} />
                    <Tab label={isMobile ? `History` : `History (${historySessions.length})`} />
                </Tabs>
            </Box>

            {/* Content */}
            {activeTab === 0 && (
                <>
                    {liveLoading && !isRefreshing ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
                        </Box>
                    ) : liveSessions.length === 0 ? (
                        <Box
                            sx={{
                                py: 8,
                                textAlign: "center",
                                border: "1px dashed rgba(71, 85, 105, 0.4)",
                                borderRadius: "6px",
                            }}
                        >
                            <VideoCamera size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                            <Typography sx={{ color: "#94a3b8" }}>No live sessions at the moment</Typography>
                            <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                                Check the "Upcoming" tab for scheduled sessions
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {liveSessions.map((session) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session._id}>
                                    <SessionCard session={session} onJoin={() => handleJoin(session)} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {activeTab === 1 && (
                <>
                    {upcomingLoading && !isRefreshing ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
                        </Box>
                    ) : upcomingSessions.length === 0 ? (
                        <Box
                            sx={{
                                py: 8,
                                textAlign: "center",
                                border: "1px dashed rgba(71, 85, 105, 0.4)",
                                borderRadius: "6px",
                            }}
                        >
                            <CalendarBlank size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                            <Typography sx={{ color: "#94a3b8" }}>No upcoming sessions scheduled</Typography>
                            <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                                Your instructors will schedule sessions soon
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {upcomingSessions.map((session) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session._id}>
                                    <SessionCard session={session} isUpcoming />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {/* History Tab */}
            {activeTab === 2 && (
                <>
                    {historyLoading && !isRefreshing ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
                        </Box>
                    ) : historySessions.length === 0 ? (
                        <Box
                            sx={{
                                py: 8,
                                textAlign: "center",
                                border: "1px dashed rgba(71, 85, 105, 0.4)",
                                borderRadius: "6px",
                            }}
                        >
                            <ClockCounterClockwise size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
                            <Typography sx={{ color: "#94a3b8" }}>No session history yet</Typography>
                            <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 1 }}>
                                Completed sessions will appear here
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {historySessions.map((session) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session._id}>
                                    <HistoryCard session={session} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
};

// Session Card Component
const SessionCard = ({
    session,
    onJoin,
    isUpcoming = false,
}: {
    session: LiveSession;
    onJoin?: () => void;
    isUpcoming?: boolean;
}) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "COURSE":
                return <BookOpen size={16} weight="duotone" style={{ color: "#60a5fa" }} />;
            case "PROJECT":
                return <Briefcase size={16} weight="duotone" style={{ color: "#a78bfa" }} />;
            case "INTERNSHIP":
                return <Buildings size={16} weight="duotone" style={{ color: "#34d399" }} />;
            default:
                return <VideoCamera size={16} />;
        }
    };

    return (
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
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getTypeIcon(session.sessionType)}
                    <Typography sx={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>
                        {session.sessionType}
                    </Typography>
                </Box>
                {session.status === "LIVE" && (
                    <Chip
                        label="LIVE"
                        size="small"
                        sx={{
                            bgcolor: "#22c55e",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "10px",
                            height: 20,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                                "0%": { opacity: 1 },
                                "50%": { opacity: 0.7 },
                                "100%": { opacity: 1 },
                            },
                        }}
                    />
                )}
                {session.status === "SCHEDULED" && (
                    <Chip
                        label="SCHEDULED"
                        size="small"
                        sx={{
                            bgcolor: "rgba(59, 130, 246, 0.2)",
                            color: "#60a5fa",
                            fontWeight: 600,
                            fontSize: "10px",
                            height: 20,
                        }}
                    />
                )}
            </Box>

            {/* Title */}
            <Box>
                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", mb: 0.5 }}>
                    {session.title}
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "12px" }}>{session.referenceName}</Typography>
            </Box>

            {/* Meta */}
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
                        {dayjs(session.scheduledAt).format("h:mm A")}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: session.status === "LIVE" ? "#22c55e" : "#64748b" }}>
                    <Users size={14} />
                    <Typography sx={{ fontSize: "12px", fontWeight: session.status === "LIVE" ? 600 : 400 }}>
                        {session.status === "LIVE"
                            ? `${session.activeParticipantsCount || 0} active`
                            : `${session.participants?.length || 0} joined`}
                    </Typography>
                </Box>
            </Box>

            {/* Host */}
            <Typography sx={{ color: "#94a3b8", fontSize: "12px" }}>
                Hosted by {session.hostName || "Instructor"}
            </Typography>

            {/* Action */}
            {!isUpcoming && session.status === "LIVE" && onJoin && (
                <Button
                    fullWidth
                    startIcon={<ArrowSquareOut size={18} />}
                    onClick={onJoin}
                    sx={{
                        bgcolor: "rgba(59, 130, 246, 0.15)",
                        color: "#3b82f6",
                        fontWeight: 600,
                        borderRadius: "6px",
                        mt: "auto",
                        "&:hover": { bgcolor: "rgba(59, 130, 246, 0.25)" },
                    }}
                >
                    Join Session
                </Button>
            )}

            {isUpcoming && (
                <Typography sx={{ color: "#64748b", fontSize: "12px", textAlign: "center", mt: "auto" }}>
                    Starts {dayjs(session.scheduledAt).fromNow()}
                </Typography>
            )}
        </Box>
    );
};

// History Card Component
const HistoryCard = ({ session }: { session: LiveSession }) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "COURSE":
                return <BookOpen size={16} weight="duotone" style={{ color: "#60a5fa" }} />;
            case "PROJECT":
                return <Briefcase size={16} weight="duotone" style={{ color: "#a78bfa" }} />;
            case "INTERNSHIP":
                return <Buildings size={16} weight="duotone" style={{ color: "#34d399" }} />;
            default:
                return <VideoCamera size={16} />;
        }
    };

    // Calculate duration
    const getDuration = () => {
        if (session.startedAt && session.endedAt) {
            const start = dayjs(session.startedAt);
            const end = dayjs(session.endedAt);
            const minutes = end.diff(start, 'minutes');
            if (minutes < 60) return `${minutes} min`;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
        return `${session.durationMinutes} min`;
    };

    return (
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
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getTypeIcon(session.sessionType)}
                    <Typography sx={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>
                        {session.sessionType}
                    </Typography>
                </Box>
                <Chip
                    label="ENDED"
                    size="small"
                    sx={{
                        bgcolor: "rgba(71, 85, 105, 0.3)",
                        color: "#94a3b8",
                        fontWeight: 600,
                        fontSize: "10px",
                        height: 20,
                    }}
                />
            </Box>

            {/* Title */}
            <Box>
                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", mb: 0.5 }}>
                    {session.title}
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "12px" }}>{session.referenceName}</Typography>
            </Box>

            {/* Meta */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748b" }}>
                    <CalendarBlank size={14} />
                    <Typography sx={{ fontSize: "12px" }}>
                        {dayjs(session.scheduledAt).format("MMM D, YYYY")}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748b" }}>
                    <Clock size={14} />
                    <Typography sx={{ fontSize: "12px" }}>{getDuration()}</Typography>
                </Box>
                {session.participants && session.participants.length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748b" }}>
                        <Users size={14} />
                        <Typography sx={{ fontSize: "12px" }}>{session.participants.length} attended</Typography>
                    </Box>
                )}
            </Box>

            {/* Host */}
            <Typography sx={{ color: "#94a3b8", fontSize: "12px" }}>
                Hosted by {session.hostName || "Instructor"}
            </Typography>
        </Box>
    );
};

export default StudentLiveSessions;
