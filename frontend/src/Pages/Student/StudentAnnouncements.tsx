import {
    Box,
    Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { usePullToRefresh } from "../../utils/usePullToRefresh";
import PullToRefreshIndicator from "../../Components/Student/PullToRefreshIndicator";
import { AnnouncementSkeleton } from "../../Components/Student/PortalSkeletons";
import { Skeleton } from "@mui/material";
import { useAnnouncementSocket } from "../../Hooks/useAnnouncementSocket";
import {
    Megaphone,
    CalendarBlank,
    User,
    Sparkle,
    Warning,
    Info,
    ArrowRight,
} from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import AnnouncementDetailModal from "../../Components/Student/AnnouncementDetailModal";
import { Button } from "@mui/material";

const StudentAnnouncements = () => {
    const token = Cookies.get("skToken");

    // Enable real-time announcement updates
    useAnnouncementSocket();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["student-announcements"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/announcements`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const location = useLocation();
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter announcements and handle deep links
    useEffect(() => {
        if (data && data.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const announcementId = queryParams.get("id");
            if (announcementId) {
                const announcement = data.find((a: any) => a._id === announcementId);
                if (announcement) {
                    setSelectedAnnouncement(announcement);
                    setIsModalOpen(true);
                }
            }
        }
    }, [data, location.search]);

    const handleViewDetails = (announcement: any) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const { pullDistance, isRefreshing } = usePullToRefresh({
        onRefresh: async () => {
            await refetch();
        },
    });

    // Using frontend-ref color palette
    const getPriorityStyles = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case "high":
                return {
                    color: "#ef4444",
                    bg: "rgba(127, 29, 29, 0.3)",
                    border: "rgba(239, 68, 68, 0.5)",
                    gradient: "linear-gradient(135deg, rgba(127, 29, 29, 0.2) 0%, rgba(127, 29, 29, 0.1) 100%)",
                };
            case "medium":
                return {
                    color: "#f59e0b",
                    bg: "rgba(120, 53, 15, 0.3)",
                    border: "rgba(245, 158, 11, 0.5)",
                    gradient: "linear-gradient(135deg, rgba(120, 53, 15, 0.2) 0%, rgba(120, 53, 15, 0.1) 100%)",
                };
            default:
                return {
                    color: "#3b82f6",
                    bg: "rgba(30, 58, 138, 0.3)",
                    border: "rgba(59, 130, 246, 0.5)",
                    gradient: "linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(30, 58, 138, 0.1) 100%)",
                };
        }
    };

    if (isLoading && !isRefreshing) {
        return (
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="40%" height={40} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "12px" }} />
                </Box>
                <AnnouncementSkeleton />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    sx={{ bgcolor: "rgba(127, 29, 29, 0.3)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.5)", "& .MuiAlert-icon": { color: "#ef4444" } }}
                >
                    Failed to load announcements. Please try again.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <PullToRefreshIndicator
                pullDistance={pullDistance}
                isRefreshing={isRefreshing}
                threshold={80}
            />
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    component="h1"
                    sx={{
                        fontSize: { xs: "20px", md: "24px" },
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#f8fafc",
                        m: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Megaphone size={28} weight="duotone" color="#f59e0b" />
                    Announcements
                </Box>
                <Box component="p" sx={{ color: "#64748b", mt: 1, fontSize: "14px" }}>
                    Stay updated with the latest news and important notifications
                </Box>
            </Box>

            {!data || data.length === 0 ? (
                <Box
                    sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "12px",
                        p: 6,
                        textAlign: "center",
                    }}
                >
                    <Megaphone size={48} weight="duotone" style={{ color: "#475569", marginBottom: 16 }} />
                    <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>No announcements yet!</Box>
                    <Box sx={{ color: "#64748b", fontSize: "14px" }}>Check back later for updates.</Box>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((announcement: any) => {
                        const priorityStyles = getPriorityStyles(announcement.priority);
                        return (
                            <Box
                                key={announcement._id}
                                sx={{
                                    bgcolor: "rgba(30, 41, 59, 0.4)",
                                    border: "1px solid rgba(71, 85, 105, 0.6)",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                {/* Accent Border Top */}
                                <Box
                                    sx={{
                                        height: 3,
                                        background: priorityStyles.color,
                                    }}
                                />

                                {/* Background Sparkle */}
                                <Sparkle
                                    size={80}
                                    weight="duotone"
                                    style={{
                                        position: "absolute",
                                        right: -16,
                                        top: -16,
                                        color: "rgba(71, 85, 105, 0.15)",
                                    }}
                                />

                                <Box sx={{ p: 3, position: "relative", zIndex: 10 }}>
                                    {/* Header Row */}
                                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Box
                                                component="h3"
                                                sx={{
                                                    fontSize: "18px",
                                                    fontWeight: 600,
                                                    color: "#f8fafc",
                                                    m: 0,
                                                    mb: 1,
                                                }}
                                            >
                                                {announcement.title}
                                            </Box>
                                        </Box>

                                        {/* Priority Badge */}
                                        <Box
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "8px",
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                bgcolor: priorityStyles.bg,
                                                color: priorityStyles.color,
                                                border: `1px solid ${priorityStyles.border}`,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {announcement.priority === "high" && <Warning size={12} weight="fill" />}
                                            {announcement.priority === "medium" && <Info size={12} weight="fill" />}
                                            {announcement.priority}
                                        </Box>
                                    </Box>

                                    {/* Content (Truncated) */}
                                    <Box
                                        sx={{
                                            color: "#94a3b8",
                                            fontSize: "14px",
                                            lineHeight: 1.6,
                                            mb: 3,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {announcement.content}
                                    </Box>

                                    {/* Footer Row with Meta & Action */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 2,
                                            pt: 2.5,
                                            borderTop: "1px solid rgba(71, 85, 105, 0.4)",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b", fontSize: "11px" }}>
                                                <CalendarBlank size={13} weight="duotone" />
                                                {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </Box>
                                            {announcement.createdBy?.name && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b", fontSize: "11px" }}>
                                                    <User size={13} weight="duotone" />
                                                    {announcement.createdBy.name}
                                                </Box>
                                            )}
                                        </Box>

                                        <Button
                                            onClick={() => handleViewDetails(announcement)}
                                            size="small"
                                            endIcon={<ArrowRight size={14} />}
                                            sx={{
                                                bgcolor: "rgba(59, 130, 246, 0.1)",
                                                color: "#60a5fa",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                textTransform: "none",
                                                px: 1.5,
                                                borderRadius: "6px",
                                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                                "&:hover": {
                                                    bgcolor: "rgba(59, 130, 246, 0.2)",
                                                    borderColor: "rgba(59, 130, 246, 0.4)",
                                                },
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <AnnouncementDetailModal
                open={isModalOpen}
                announcement={selectedAnnouncement}
                onClose={() => setIsModalOpen(false)}
            />
        </Box>
    );
};

export default StudentAnnouncements;
