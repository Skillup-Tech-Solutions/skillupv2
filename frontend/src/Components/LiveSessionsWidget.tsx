import { Box, Typography, Chip, Skeleton } from "@mui/material";
import { VideoCamera, ArrowRight, Clock, Users, Sparkle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useGetLiveNowSessionsApi, useGetUpcomingSessionsApi, type LiveSession } from "../Hooks/liveSessions";

interface LiveSessionsWidgetProps {
    variant?: "admin" | "student";
    maxItems?: number;
}

const LiveSessionsWidget = ({ variant = "student", maxItems = 3 }: LiveSessionsWidgetProps) => {
    const navigate = useNavigate();
    const { data: liveData, isLoading: liveLoading } = useGetLiveNowSessionsApi();
    const { data: upcomingData, isLoading: upcomingLoading } = useGetUpcomingSessionsApi();

    const liveSessions = liveData?.sessions || [];
    const activeLiveSessionsCount = liveSessions.filter(s => (s.activeParticipantsCount || 0) > 0).length;
    const upcomingSessions = upcomingData?.sessions || [];
    const isLoading = liveLoading || upcomingLoading;

    const handleViewAll = () => {
        navigate(variant === "admin" ? "/courses" : "/student/live-sessions");
    };

    return (
        <Box
            sx={{
                bgcolor: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                borderRadius: "6px",
                p: 3,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Sparkle decoration */}
            <Sparkle
                size={80}
                weight="duotone"
                style={{
                    position: "absolute",
                    right: -16,
                    top: -16,
                    color: "rgba(71, 85, 105, 0.2)",
                }}
            />

            {/* Header */}
            <Box
                component="h3"
                sx={{
                    fontSize: "14px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    mb: 2.5,
                    m: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <VideoCamera size={16} weight="duotone" />
                Live Sessions
                {activeLiveSessionsCount > 0 && (
                    <Chip
                        label={`${activeLiveSessionsCount} LIVE`}
                        size="small"
                        sx={{
                            ml: 1,
                            bgcolor: "#22c55e",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "10px",
                            height: 18,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                                "0%": { opacity: 1 },
                                "50%": { opacity: 0.7 },
                                "100%": { opacity: 1 },
                            },
                        }}
                    />
                )}
            </Box>

            {/* Content */}
            {isLoading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={48}
                            sx={{ bgcolor: "rgba(71, 85, 105, 0.3)", borderRadius: "6px" }}
                        />
                    ))}
                </Box>
            ) : liveSessions.length === 0 && upcomingSessions.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, position: "relative", zIndex: 10 }}>
                    <VideoCamera size={48} weight="duotone" style={{ color: "#475569", marginBottom: 12 }} />
                    <Box sx={{ color: "#64748b", fontSize: "14px" }}>No live sessions</Box>
                    <Box sx={{ color: "#475569", fontSize: "12px", mt: 0.5 }}>
                        {upcomingSessions.length > 0
                            ? `${upcomingSessions.length} upcoming`
                            : "Check back later"}
                    </Box>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, position: "relative", zIndex: 10 }}>
                    {/* Live Sessions First */}
                    {liveSessions.slice(0, maxItems).map((session: LiveSession) => (
                        <SessionRow key={session._id} session={session} isLive variant={variant} />
                    ))}

                    {/* Then Upcoming */}
                    {upcomingSessions.slice(0, Math.max(0, maxItems - liveSessions.length)).map((session: LiveSession) => (
                        <SessionRow key={session._id} session={session} variant={variant} />
                    ))}
                </Box>
            )}

            {/* View All Link */}
            <Box
                onClick={handleViewAll}
                sx={{
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    fontSize: "14px",
                    color: "#22c55e",
                    cursor: "pointer",
                    transition: "color 0.2s",
                    "&:hover": { color: "#4ade80" },
                }}
            >
                View All Sessions <ArrowRight size={16} />
            </Box>
        </Box>
    );
};

// Session Row Component
const SessionRow = ({
    session,
    isLive = false,
    variant,
}: {
    session: LiveSession;
    isLive?: boolean;
    variant: "admin" | "student";
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // For students, navigate to live sessions page where they can join
        if (variant === "student") {
            navigate("/student/live-sessions");
        } else {
            // For admin, navigate to programs management with Live Sessions tab
            // Use switch based on session type
            if (session.sessionType === "COURSE") {
                navigate("/courses");
            } else if (session.sessionType === "PROJECT") {
                navigate("/projects");
            } else if (session.sessionType === "INTERNSHIP") {
                navigate("/internships");
            } else {
                navigate("/courses");
            }
        }
    };

    return (
        <Box
            onClick={handleClick}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                bgcolor: isLive ? "rgba(22, 101, 52, 0.2)" : "rgba(15, 23, 42, 0.5)",
                border: isLive ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(30, 41, 59, 0.5)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                    bgcolor: isLive ? "rgba(22, 101, 52, 0.3)" : "rgba(30, 41, 59, 0.5)",
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                {isLive && (
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#22c55e",
                            flexShrink: 0,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                                "0%": { opacity: 1 },
                                "50%": { opacity: 0.5 },
                                "100%": { opacity: 1 },
                            },
                        }}
                    />
                )}
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        sx={{
                            color: "#cbd5e1",
                            fontSize: "13px",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {session.title}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "11px" }}>
                        {session.referenceName}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1, flexShrink: 0 }}>
                {isLive ? (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                            <Users size={12} />
                            <Typography sx={{ fontSize: "11px" }}>
                                {session.activeParticipantsCount ?? (session.participants?.length || 0)}
                            </Typography>
                        </Box>
                        <Chip
                            label="JOIN"
                            size="small"
                            sx={{
                                bgcolor: "#22c55e",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "10px",
                                height: 20,
                            }}
                        />
                    </>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                        <Clock size={12} />
                        <Typography sx={{ fontSize: "11px" }}>
                            {dayjs(session.scheduledAt).format("MMM D, h:mm A")}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default LiveSessionsWidget;
