import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Chip,
    MenuItem,
    Tooltip as MuiTooltip,
    CircularProgress,
    Skeleton,
    Tabs,
    Tab,
    Radio,
    RadioGroup,
    FormControlLabel,
    LinearProgress,
    Fade,
    Grow,
    InputAdornment,
    Modal,
    IconButton,
    Divider
} from "@mui/material";
import { BellRinging, PaperPlaneTilt, CheckCircle, XCircle, Users, Broadcast, ClockCounterClockwise, ArrowClockwise, DeviceMobile, Image, Target, Lightning, Info, MegaphoneSimple, AndroidLogo, AppleLogo, UsersThree, Gear, MagnifyingGlass, Sparkle, CheckCircle as CheckCircleFill, X, CalendarBlank, User, Copy, Eye } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { useGetUsers } from "../Hooks/user";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Tab Panel with animation
const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <Fade in={value === index} timeout={300}>
        <Box sx={{ display: value === index ? "block" : "none" }}>
            {children}
        </Box>
    </Fade>
);

// Form Section Component
const FormSection = ({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
            <Box sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                {icon}
            </Box>
            <Box>
                <Typography sx={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f8fafc",
                    mb: 0.25,
                }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
        {children}
    </Box>
);

// Character Counter
const CharCounter = ({ current, max }: { current: number; max: number }) => {
    const percentage = (current / max) * 100;
    const isWarning = percentage > 80;
    const isError = percentage > 100;

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: "rgba(71, 85, 105, 0.3)",
                overflow: "hidden",
            }}>
                <Box sx={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: "100%",
                    bgcolor: isError ? "#ef4444" : isWarning ? "#f59e0b" : "#4ade80",
                    transition: "all 0.3s ease",
                }} />
            </Box>
            <Typography sx={{
                fontSize: "10px",
                color: isError ? "#ef4444" : isWarning ? "#f59e0b" : "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
            }}>
                {current}/{max}
            </Typography>
        </Box>
    );
};

// Realistic Phone Frame Preview
const PhonePreview = ({ title, body, imageUrl, platform }: { title: string; body: string; imageUrl: string; platform: "ios" | "android" }) => {
    const isIOS = platform === "ios";

    return (
        <Box sx={{
            position: "relative",
            width: 280,
            mx: "auto",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.02)" },
        }}>
            {/* Phone Frame */}
            <Box sx={{
                bgcolor: isIOS ? "#1c1c1e" : "#121212",
                borderRadius: "36px",
                p: "12px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}>
                {/* Screen */}
                <Box sx={{
                    bgcolor: isIOS ? "#000" : "#1e1e1e",
                    borderRadius: "28px",
                    overflow: "hidden",
                    position: "relative",
                }}>
                    {/* Dynamic Island / Notch */}
                    {isIOS ? (
                        <Box sx={{
                            position: "absolute",
                            top: 10,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 90,
                            height: 28,
                            bgcolor: "#000",
                            borderRadius: "20px",
                            zIndex: 10,
                            boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.8)",
                        }} />
                    ) : (
                        <Box sx={{
                            position: "absolute",
                            top: 12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 8,
                            height: 8,
                            bgcolor: "#2d2d2d",
                            borderRadius: "50%",
                            zIndex: 10,
                        }} />
                    )}

                    {/* Status Bar */}
                    <Box sx={{
                        pt: isIOS ? 5 : 3.5,
                        px: 2.5,
                        pb: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                            {isIOS ? "9:41" : "12:30"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                            <Box sx={{ display: "flex", gap: 0.25 }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <Box key={i} sx={{ width: 3, height: i * 2 + 4, bgcolor: "#fff", borderRadius: 1, opacity: i <= 3 ? 1 : 0.3 }} />
                                ))}
                            </Box>
                            <Box sx={{ width: 20, height: 10, border: "1.5px solid #fff", borderRadius: "3px", ml: 0.5, position: "relative" }}>
                                <Box sx={{ position: "absolute", right: -3, top: 2, width: 1.5, height: 5, bgcolor: "#fff", borderRadius: "0 1px 1px 0" }} />
                                <Box sx={{ width: "70%", height: "100%", bgcolor: "#4ade80", borderRadius: "1px" }} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Lock Screen Background */}
                    <Box sx={{
                        background: isIOS
                            ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
                            : "linear-gradient(180deg, #121212 0%, #1e1e1e 100%)",
                        minHeight: 400,
                        p: 2,
                        pt: 4,
                    }}>
                        {/* Date/Time Display */}
                        <Box sx={{ textAlign: "center", mb: 4 }}>
                            <Typography sx={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", mb: 0.5 }}>
                                {isIOS ? "Sunday, January 5" : "Sun, Jan 5"}
                            </Typography>
                            <Typography sx={{ fontSize: isIOS ? "72px" : "56px", fontWeight: isIOS ? 200 : 300, color: "#fff", lineHeight: 1 }}>
                                {isIOS ? "9:41" : "12:30"}
                            </Typography>
                        </Box>

                        {/* Notification Card */}
                        <Grow in={true} timeout={500}>
                            <Box sx={{
                                bgcolor: isIOS ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)",
                                backdropFilter: "blur(20px)",
                                borderRadius: isIOS ? "20px" : "16px",
                                p: 1.5,
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}>
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                    {/* App Icon */}
                                    <Box sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: isIOS ? "12px" : "10px",
                                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                                    }}>
                                        <BellRinging size={22} weight="fill" color="#fff" />
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                            <Typography sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                color: "rgba(255, 255, 255, 0.7)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.03em",
                                            }}>
                                                SkillUp
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                                                now
                                            </Typography>
                                        </Box>
                                        <Typography sx={{
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "#fff",
                                            mb: 0.25,
                                            lineHeight: 1.3,
                                        }}>
                                            {title || "Notification Title"}
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: "13px",
                                            color: "rgba(255, 255, 255, 0.75)",
                                            lineHeight: 1.4,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}>
                                            {body || "Your notification message will appear here..."}
                                        </Typography>

                                        {imageUrl && (
                                            <Box
                                                component="img"
                                                src={imageUrl}
                                                onError={(e: any) => e.target.style.display = 'none'}
                                                sx={{
                                                    mt: 1.5,
                                                    width: "100%",
                                                    height: 100,
                                                    objectFit: "cover",
                                                    borderRadius: "10px",
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Grow>

                        {/* Quick Actions */}
                        {isIOS && (
                            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
                                <Box sx={{ width: 50, height: 50, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.2)" }}>
                                    <DeviceMobile size={24} color="#fff" />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Home Indicator */}
                    {isIOS && (
                        <Box sx={{
                            position: "absolute",
                            bottom: 8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 100,
                            height: 4,
                            bgcolor: "rgba(255, 255, 255, 0.3)",
                            borderRadius: 2,
                        }} />
                    )}
                </Box>
            </Box>
        </Box>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: number; color: string; trend?: string }) => (
    <Box sx={{
        p: 2,
        borderRadius: "12px",
        bgcolor: `${color}10`,
        border: `1px solid ${color}30`,
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 24px ${color}20` },
    }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
                <Typography sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc", fontFamily: "'Chivo', sans-serif" }}>
                    {value.toLocaleString()}
                </Typography>
                {trend && (
                    <Typography sx={{ fontSize: "10px", color: "#4ade80", mt: 0.5 }}>
                        {trend}
                    </Typography>
                )}
            </Box>
            <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
        </Box>
    </Box>
);

const NotificationManagement = () => {
    const queryClient = useQueryClient();
    const { data: usersData } = useGetUsers();
    const [activeTab, setActiveTab] = useState(0);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [target, setTarget] = useState("all");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [priority, setPriority] = useState("alert");
    const [imageUrl, setImageUrl] = useState("");
    const [previewPlatform, setPreviewPlatform] = useState<"ios" | "android">("ios");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNotification, setSelectedNotification] = useState<any>(null);

    const { data: history, isLoading: historyLoading, refetch } = useQuery({
        queryKey: ['notificationHistory'],
        queryFn: async () => {
            const res = await api.get('/notifications/history');
            return res.data;
        }
    });

    const sendMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/notifications/send', data);
            return res.data;
        },
        onSuccess: (data) => {
            CustomSnackBar.successSnackbar(`🎉 Notification sent! (${data.stats.successCount} delivered)`);
            setTitle("");
            setBody("");
            setSelectedUsers([]);
            setImageUrl("");
            queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
            setActiveTab(1);
        },
        onError: () => {
            CustomSnackBar.errorSnackbar("Failed to send notification");
        }
    });

    const handleSend = () => {
        if (!title || !body) {
            CustomSnackBar.errorSnackbar("Title and Body are required");
            return;
        }
        if (target === 'specific' && selectedUsers.length === 0) {
            CustomSnackBar.errorSnackbar("Please select at least one recipient");
            return;
        }
        sendMutation.mutate({
            title,
            body,
            target,
            targetUserIds: target === 'specific' ? selectedUsers : [],
            data: { priority, ...(imageUrl && { imageUrl }) }
        });
    };

    // Stats
    const stats = {
        total: history?.length || 0,
        broadcast: history?.filter((n: any) => n.target === 'all').length || 0,
        targeted: history?.filter((n: any) => n.target === 'specific').length || 0,
        delivered: history?.reduce((acc: number, n: any) => acc + (n.deliveryStats?.successCount || 0), 0) || 0
    };

    // Filtered history
    const filteredHistory = history?.filter((n: any) =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.body?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const columns: GridColDef[] = [
        {
            field: "title",
            headerName: "Notification",
            flex: 1.5,
            minWidth: 280,
            renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: params.row.data?.priority === "alert" ? "#ef4444" : params.row.data?.priority === "update" ? "#f59e0b" : "#4ade80",
                        }} />
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{params.value}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", pl: 1.75 }}>
                        {params.row.body?.slice(0, 60)}{params.row.body?.length > 60 ? "..." : ""}
                    </Typography>
                </Box>
            )
        },
        {
            field: "target",
            headerName: "Audience",
            width: 150,
            renderCell: (params) => (
                <Chip
                    icon={params.value === 'all' ?
                        <Broadcast size={14} weight="duotone" style={{ color: "#c084fc" }} /> :
                        <UsersThree size={14} weight="duotone" style={{ color: "#fbbf24" }} />
                    }
                    label={params.value === 'all' ? 'All Users' : `${params.row.targetUserIds?.length || 0} Users`}
                    size="small"
                    sx={{
                        bgcolor: params.value === 'all' ? "rgba(192, 132, 252, 0.15)" : "rgba(251, 191, 36, 0.15)",
                        color: params.value === 'all' ? "#c084fc" : "#fbbf24",
                        border: `1px solid ${params.value === 'all' ? "rgba(192, 132, 252, 0.3)" : "rgba(251, 191, 36, 0.3)"}`,
                        fontWeight: 600,
                        fontSize: "11px",
                    }}
                />
            ),
        },
        {
            field: "deliveryStats",
            headerName: "Delivery Status",
            width: 180,
            renderCell: (params) => {
                const success = params.value?.successCount || 0;
                const failed = params.value?.failureCount || 0;
                const total = success + failed;
                const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

                return (
                    <Box sx={{ width: "100%" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CheckCircleFill size={14} weight="fill" style={{ color: "#4ade80" }} />
                                <Typography sx={{ fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>{success}</Typography>
                            </Box>
                            {failed > 0 && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <XCircle size={14} weight="fill" style={{ color: "#f87171" }} />
                                    <Typography sx={{ fontSize: "12px", color: "#f87171", fontWeight: 600 }}>{failed}</Typography>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ position: "relative" }}>
                            <LinearProgress
                                variant="determinate"
                                value={successRate}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: failed > 0 ? "rgba(248, 113, 113, 0.2)" : "rgba(71, 85, 105, 0.3)",
                                    "& .MuiLinearProgress-bar": {
                                        bgcolor: "#4ade80",
                                        borderRadius: 3,
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                );
            }
        },
        {
            field: "sentBy",
            headerName: "Sent By",
            width: 130,
            valueGetter: (_value: any, row: any) => row?.sentBy?.name || "System",
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        bgcolor: "rgba(59, 130, 246, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#60a5fa",
                    }}>
                        {params.value?.charAt(0)?.toUpperCase() || "S"}
                    </Box>
                    <Typography sx={{ fontSize: "12px", color: "#94a3b8" }}>{params.value}</Typography>
                </Box>
            )
        },
        {
            field: "createdAt",
            headerName: "Sent",
            width: 130,
            renderCell: (params) => (
                <MuiTooltip title={params.value ? dayjs(params.value).format('MMM DD, YYYY [at] hh:mm A') : ''} arrow>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", cursor: "help" }}>
                        {params.value ? dayjs(params.value).fromNow() : '-'}
                    </Typography>
                </MuiTooltip>
            )
        }
    ];

    const allUsers = usersData?.data || usersData || [];

    // Loading state
    if (historyLoading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 1200, mx: "auto" }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rounded" height={100} sx={{ flex: 1, bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "12px" }} />
                    ))}
                </Box>
                <Skeleton variant="rounded" height={600} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "16px" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1200, mx: "auto" }}>
            {/* Page Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                    }}>
                        <BellRinging size={26} weight="fill" color="#fff" />
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontSize: { xs: "20px", md: "24px" },
                            fontFamily: "'Chivo', sans-serif",
                            fontWeight: 700,
                            color: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}>
                            Push Notifications
                            <Sparkle size={20} weight="fill" style={{ color: "#fbbf24" }} />
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#64748b" }}>
                            Send targeted messages to your mobile app users
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Stats Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
                <StatCard icon={<ClockCounterClockwise size={28} weight="duotone" />} label="Total Sent" value={stats.total} color="#60a5fa" />
                <StatCard icon={<Broadcast size={28} weight="duotone" />} label="Broadcasts" value={stats.broadcast} color="#c084fc" />
                <StatCard icon={<UsersThree size={28} weight="duotone" />} label="Targeted" value={stats.targeted} color="#fbbf24" />
                <StatCard icon={<CheckCircle size={28} weight="duotone" />} label="Delivered" value={stats.delivered} color="#4ade80" />
            </Box>

            {/* Main Content */}
            <Paper
                elevation={0}
                sx={{
                    bgcolor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backdropFilter: "blur(10px)",
                }}
            >
                {/* Tabs */}
                <Box sx={{
                    borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    px: { xs: 2, md: 3 },
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            minHeight: 56,
                            "& .MuiTab-root": {
                                minHeight: 56,
                                textTransform: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#64748b",
                                gap: 1,
                                transition: "all 0.2s ease",
                                "&.Mui-selected": { color: "#f8fafc" },
                                "&:hover": { color: "#94a3b8" },
                            },
                            "& .MuiTabs-indicator": {
                                bgcolor: "#3b82f6",
                                height: 3,
                                borderRadius: "3px 3px 0 0",
                            },
                        }}
                    >
                        <Tab icon={<PaperPlaneTilt size={20} weight="duotone" />} iconPosition="start" label="Compose" />
                        <Tab
                            icon={<ClockCounterClockwise size={20} weight="duotone" />}
                            iconPosition="start"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    History
                                    <Chip
                                        label={stats.total}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            bgcolor: "rgba(59, 130, 246, 0.2)",
                                            color: "#60a5fa",
                                        }}
                                    />
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>

                {/* Compose Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 400px" } }}>
                        {/* Form */}
                        <Box sx={{ p: { xs: 2, md: 3 }, borderRight: { lg: "1px solid rgba(71, 85, 105, 0.4)" } }}>
                            {/* Content */}
                            <FormSection
                                icon={<MegaphoneSimple size={18} weight="duotone" style={{ color: "#60a5fa" }} />}
                                title="Notification Content"
                                subtitle="What do you want to tell your users?"
                            >
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                    <Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                            <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Title</Typography>
                                            <CharCounter current={title.length} max={50} />
                                        </Box>
                                        <TextField
                                            placeholder="Enter a catchy title..."
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                                            sx={textFieldStyles}
                                        />
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                            <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Message</Typography>
                                            <CharCounter current={body.length} max={200} />
                                        </Box>
                                        <TextField
                                            placeholder="Write your notification message..."
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={body}
                                            onChange={(e) => setBody(e.target.value.slice(0, 200))}
                                            sx={textFieldStyles}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, mb: 1 }}>Rich Media (Optional)</Typography>
                                        <TextField
                                            placeholder="https://example.com/image.jpg"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            sx={textFieldStyles}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Image size={18} weight="duotone" style={{ color: "#64748b" }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </FormSection>

                            {/* Target */}
                            <FormSection
                                icon={<Target size={18} weight="duotone" style={{ color: "#60a5fa" }} />}
                                title="Target Audience"
                                subtitle="Who should receive this notification?"
                            >
                                <RadioGroup value={target} onChange={(e) => setTarget(e.target.value)} sx={{ gap: 1.5 }}>
                                    {[
                                        { value: "all", icon: <Broadcast size={20} weight="duotone" style={{ color: "#c084fc" }} />, label: "All Users", desc: "Send to everyone with push enabled" },
                                        { value: "specific", icon: <UsersThree size={20} weight="duotone" style={{ color: "#fbbf24" }} />, label: "Specific Users", desc: "Select individual recipients" },
                                    ].map((opt) => (
                                        <FormControlLabel
                                            key={opt.value}
                                            value={opt.value}
                                            control={<Radio size="small" sx={{ color: "#475569", "&.Mui-checked": { color: "#3b82f6" } }} />}
                                            label={
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 0.5 }}>
                                                    {opt.icon}
                                                    <Box>
                                                        <Typography sx={{ fontSize: "13px", color: "#f8fafc", fontWeight: 600 }}>{opt.label}</Typography>
                                                        <Typography sx={{ fontSize: "11px", color: "#64748b" }}>{opt.desc}</Typography>
                                                    </Box>
                                                </Box>
                                            }
                                            sx={{
                                                m: 0,
                                                p: 1.5,
                                                borderRadius: "10px",
                                                border: "1px solid",
                                                borderColor: target === opt.value ? "rgba(59, 130, 246, 0.5)" : "rgba(71, 85, 105, 0.4)",
                                                bgcolor: target === opt.value ? "rgba(59, 130, 246, 0.08)" : "transparent",
                                                transition: "all 0.2s ease",
                                                "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)", borderColor: "rgba(71, 85, 105, 0.6)" },
                                            }}
                                        />
                                    ))}
                                </RadioGroup>

                                {target === 'specific' && (
                                    <Fade in={true}>
                                        <Box sx={{ mt: 2 }}>
                                            <TextField
                                                select
                                                label={`Select Recipients (${selectedUsers.length} selected)`}
                                                value={selectedUsers}
                                                onChange={(e: any) => setSelectedUsers(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                                fullWidth
                                                size="small"
                                                SelectProps={{
                                                    multiple: true,
                                                    renderValue: (selected: any) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.slice(0, 3).map((value: string) => {
                                                                const user = allUsers.find((u: any) => u._id === value);
                                                                return <Chip key={value} label={user?.name || value} size="small" sx={{ height: 22, fontSize: "10px", bgcolor: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" }} />;
                                                            })}
                                                            {selected.length > 3 && <Chip label={`+${selected.length - 3}`} size="small" sx={{ height: 22, fontSize: "10px", bgcolor: "rgba(71, 85, 105, 0.4)", color: "#94a3b8" }} />}
                                                        </Box>
                                                    )
                                                }}
                                                sx={textFieldStyles}
                                            >
                                                {allUsers.map((user: any) => (
                                                    <MenuItem key={user._id} value={user._id}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Users size={14} style={{ color: "#64748b" }} />
                                                            {user.name}
                                                            <span style={{ color: "#475569", fontSize: "11px" }}>({user.email})</span>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>
                                    </Fade>
                                )}
                            </FormSection>

                            {/* Priority */}
                            <FormSection
                                icon={<Gear size={18} weight="duotone" style={{ color: "#60a5fa" }} />}
                                title="Priority Level"
                                subtitle="How urgent is this notification?"
                            >
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
                                    {[
                                        { value: "alert", label: "High", icon: <Lightning size={22} weight="fill" />, color: "#ef4444", desc: "Urgent alerts" },
                                        { value: "update", label: "Normal", icon: <Info size={22} weight="duotone" />, color: "#f59e0b", desc: "General updates" },
                                        { value: "promo", label: "Low", icon: <CheckCircle size={22} weight="duotone" />, color: "#4ade80", desc: "Casual info" },
                                    ].map((p) => (
                                        <Button
                                            key={p.value}
                                            onClick={() => setPriority(p.value)}
                                            sx={{
                                                p: 2,
                                                borderRadius: "12px",
                                                border: "1px solid",
                                                borderColor: priority === p.value ? p.color : "rgba(71, 85, 105, 0.4)",
                                                bgcolor: priority === p.value ? `${p.color}15` : "transparent",
                                                color: priority === p.value ? p.color : "#94a3b8",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 0.75,
                                                textTransform: "none",
                                                transition: "all 0.2s ease",
                                                "&:hover": { bgcolor: `${p.color}10`, borderColor: p.color },
                                            }}
                                        >
                                            <Box sx={{ color: priority === p.value ? p.color : "#64748b" }}>{p.icon}</Box>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 700 }}>{p.label}</Typography>
                                            <Typography sx={{ fontSize: "10px", color: "#64748b" }}>{p.desc}</Typography>
                                        </Button>
                                    ))}
                                </Box>
                            </FormSection>

                            {/* Send Button */}
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={sendMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <PaperPlaneTilt weight="bold" size={22} />}
                                onClick={handleSend}
                                disabled={sendMutation.isPending || !title || !body}
                                sx={{
                                    mt: 2,
                                    py: 2,
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                                    transition: "all 0.3s ease",
                                    '&:hover': {
                                        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                                        boxShadow: "0 12px 32px rgba(59, 130, 246, 0.5)",
                                        transform: "translateY(-2px)",
                                    },
                                    '&:disabled': {
                                        background: "rgba(71, 85, 105, 0.3)",
                                        color: "rgba(248, 250, 252, 0.3)",
                                        boxShadow: "none"
                                    }
                                }}
                            >
                                {sendMutation.isPending ? "Sending..." : "Send Notification"}
                            </Button>
                        </Box>

                        {/* Preview */}
                        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "rgba(0, 0, 0, 0.2)" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Box>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>Live Preview</Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#64748b" }}>See how it looks on device</Typography>
                                </Box>
                                <Box sx={{ display: "flex", p: 0.5, bgcolor: "rgba(30, 41, 59, 0.6)", borderRadius: "10px", border: "1px solid rgba(71, 85, 105, 0.4)" }}>
                                    {[
                                        { platform: "ios", icon: <AppleLogo size={18} weight="fill" /> },
                                        { platform: "android", icon: <AndroidLogo size={18} weight="fill" /> },
                                    ].map((p) => (
                                        <Button
                                            key={p.platform}
                                            size="small"
                                            onClick={() => setPreviewPlatform(p.platform as "ios" | "android")}
                                            sx={{
                                                minWidth: 44,
                                                height: 36,
                                                borderRadius: "8px",
                                                bgcolor: previewPlatform === p.platform ? "rgba(59, 130, 246, 0.2)" : "transparent",
                                                color: previewPlatform === p.platform ? "#60a5fa" : "#64748b",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            {p.icon}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>

                            <PhonePreview title={title} body={body} imageUrl={imageUrl} platform={previewPlatform} />

                            <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(59, 130, 246, 0.08)", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                    <Sparkle size={18} weight="fill" style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
                                    <Box>
                                        <Typography sx={{ fontSize: "12px", color: "#60a5fa", fontWeight: 700, mb: 0.5 }}>Pro Tips</Typography>
                                        <Typography sx={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.6 }}>
                                            • Keep titles under 40 characters<br />
                                            • Use action words to drive engagement<br />
                                            • Add images to increase click rates by 56%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                {/* History Tab */}
                <TabPanel value={activeTab} index={1}>
                    {/* Search & Filter */}
                    <Box sx={{ p: 2, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                        <TextField
                            placeholder="Search notifications..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ ...textFieldStyles, width: { xs: "100%", sm: 280 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MagnifyingGlass size={18} style={{ color: "#64748b" }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                                {filteredHistory.length} notification{filteredHistory.length !== 1 ? "s" : ""}
                            </Typography>
                            <MuiTooltip title="Refresh">
                                <Button
                                    onClick={() => refetch()}
                                    size="small"
                                    sx={{ minWidth: 40, height: 40, borderRadius: "10px", color: "#64748b", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)", color: "#f8fafc" } }}
                                >
                                    <ArrowClockwise size={18} weight="bold" />
                                </Button>
                            </MuiTooltip>
                        </Box>
                    </Box>

                    {/* DataGrid */}
                    <Box sx={{ height: 520 }}>
                        <DataGrid
                            rows={filteredHistory}
                            columns={columns}
                            loading={historyLoading}
                            getRowId={(row) => row._id}
                            rowHeight={72}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            onRowClick={(params) => setSelectedNotification(params.row)}
                            sx={{
                                ...dataGridStyles,
                                '& .MuiDataGrid-row': {
                                    ...dataGridStyles['& .MuiDataGrid-row'],
                                    cursor: 'pointer',
                                }
                            }}
                        />
                    </Box>
                </TabPanel>
            </Paper>

            {/* Notification Detail Modal */}
            <Modal
                open={Boolean(selectedNotification)}
                onClose={() => setSelectedNotification(null)}
                closeAfterTransition
            >
                <Fade in={Boolean(selectedNotification)}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: 520 },
                        maxHeight: '90vh',
                        bgcolor: 'rgba(15, 23, 42, 0.98)',
                        border: '1px solid rgba(71, 85, 105, 0.5)',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                    }}>
                        {/* Modal Header */}
                        <Box sx={{
                            p: 2.5,
                            borderBottom: '1px solid rgba(71, 85, 105, 0.4)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Eye size={22} weight="fill" color="#fff" />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>Notification Details</Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>ID: {selectedNotification?._id?.slice(-8)}</Typography>
                                </Box>
                            </Box>
                            <IconButton
                                onClick={() => setSelectedNotification(null)}
                                sx={{ color: '#64748b', '&:hover': { color: '#f8fafc', bgcolor: 'rgba(51, 65, 85, 0.5)' } }}
                            >
                                <X size={20} weight="bold" />
                            </IconButton>
                        </Box>

                        {/* Modal Content */}
                        <Box sx={{ p: 3, maxHeight: 'calc(90vh - 150px)', overflowY: 'auto' }}>
                            {/* Notification Content */}
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>Content</Typography>
                                <Box sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(71, 85, 105, 0.4)' }}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', mb: 1 }}>
                                        {selectedNotification?.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                                        {selectedNotification?.body}
                                    </Typography>
                                    {selectedNotification?.data?.imageUrl && (
                                        <Box
                                            component="img"
                                            src={selectedNotification.data.imageUrl}
                                            sx={{
                                                mt: 2,
                                                width: '100%',
                                                height: 150,
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(71, 85, 105, 0.4)',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(71, 85, 105, 0.4)', my: 2 }} />

                            {/* Details Grid */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                                {/* Target Audience */}
                                <Box sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.3)', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {selectedNotification?.target === 'all' ?
                                            <Broadcast size={18} weight="duotone" style={{ color: '#c084fc' }} /> :
                                            <UsersThree size={18} weight="duotone" style={{ color: '#fbbf24' }} />
                                        }
                                        <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audience</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#f8fafc', fontWeight: 600 }}>
                                        {selectedNotification?.target === 'all' ? 'All Users' : `${selectedNotification?.targetUserIds?.length || 0} Selected Users`}
                                    </Typography>
                                </Box>

                                {/* Priority */}
                                <Box sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.3)', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {selectedNotification?.data?.priority === 'alert' ?
                                            <Lightning size={18} weight="fill" style={{ color: '#ef4444' }} /> :
                                            selectedNotification?.data?.priority === 'update' ?
                                                <Info size={18} weight="duotone" style={{ color: '#f59e0b' }} /> :
                                                <CheckCircle size={18} weight="duotone" style={{ color: '#4ade80' }} />
                                        }
                                        <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#f8fafc', fontWeight: 600, textTransform: 'capitalize' }}>
                                        {selectedNotification?.data?.priority === 'alert' ? 'High (Urgent)' :
                                            selectedNotification?.data?.priority === 'update' ? 'Normal' : 'Low'}
                                    </Typography>
                                </Box>

                                {/* Sent By */}
                                <Box sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.3)', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <User size={18} weight="duotone" style={{ color: '#60a5fa' }} />
                                        <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sent By</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#f8fafc', fontWeight: 600 }}>
                                        {selectedNotification?.sentBy?.name || 'System'}
                                    </Typography>
                                    {selectedNotification?.sentBy?.email && (
                                        <Typography sx={{ fontSize: '11px', color: '#64748b', mt: 0.25 }}>
                                            {selectedNotification.sentBy.email}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Date & Time */}
                                <Box sx={{ p: 2, bgcolor: 'rgba(30, 41, 59, 0.3)', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CalendarBlank size={18} weight="duotone" style={{ color: '#60a5fa' }} />
                                        <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sent At</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#f8fafc', fontWeight: 600 }}>
                                        {selectedNotification?.createdAt ? dayjs(selectedNotification.createdAt).format('MMM DD, YYYY') : '-'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748b', mt: 0.25, fontFamily: "'JetBrains Mono', monospace" }}>
                                        {selectedNotification?.createdAt ? dayjs(selectedNotification.createdAt).format('hh:mm:ss A') : ''}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Delivery Stats - Detailed */}
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>Delivery Statistics</Typography>

                                {(() => {
                                    const success = selectedNotification?.deliveryStats?.successCount || 0;
                                    const failed = selectedNotification?.deliveryStats?.failureCount || 0;
                                    const total = success + failed;
                                    const successRate = total > 0 ? ((success / total) * 100) : 0;
                                    const failureRate = total > 0 ? ((failed / total) * 100) : 0;
                                    const targetCount = selectedNotification?.target === 'all' ? total : (selectedNotification?.targetUserIds?.length || 0);
                                    const reachRate = targetCount > 0 ? ((success / targetCount) * 100) : 0;

                                    // Determine health status
                                    let healthStatus = { label: 'Excellent', color: '#4ade80', icon: <CheckCircleFill size={16} weight="fill" /> };
                                    if (successRate < 50) healthStatus = { label: 'Critical', color: '#ef4444', icon: <XCircle size={16} weight="fill" /> };
                                    else if (successRate < 80) healthStatus = { label: 'Fair', color: '#f59e0b', icon: <Info size={16} weight="fill" /> };
                                    else if (successRate < 95) healthStatus = { label: 'Good', color: '#60a5fa', icon: <CheckCircle size={16} weight="duotone" /> };

                                    return (
                                        <Box sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(71, 85, 105, 0.4)', overflow: 'hidden' }}>
                                            {/* Header with Health Status */}
                                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(71, 85, 105, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ color: healthStatus.color }}>{healthStatus.icon}</Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: healthStatus.color }}>{healthStatus.label}</Typography>
                                                </Box>
                                                <Chip
                                                    label={`${successRate.toFixed(1)}% Success`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${healthStatus.color}20`,
                                                        color: healthStatus.color,
                                                        fontWeight: 700,
                                                        fontSize: '11px',
                                                        fontFamily: "'JetBrains Mono', monospace",
                                                    }}
                                                />
                                            </Box>

                                            {/* Visual Stats - Donut Style */}
                                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                                                {/* Donut Chart */}
                                                <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                                                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                                        {/* Background circle */}
                                                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(248, 113, 113, 0.3)" strokeWidth="3" />
                                                        {/* Success arc */}
                                                        <circle
                                                            cx="18" cy="18" r="14"
                                                            fill="none"
                                                            stroke="#4ade80"
                                                            strokeWidth="3"
                                                            strokeDasharray={`${successRate * 0.88} 88`}
                                                            strokeLinecap="round"
                                                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                                        />
                                                    </svg>
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        textAlign: 'center',
                                                    }}>
                                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Chivo', sans-serif", lineHeight: 1 }}>
                                                            {total}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Total</Typography>
                                                    </Box>
                                                </Box>

                                                {/* Legend */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#4ade80' }} />
                                                        <Box>
                                                            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#4ade80', fontFamily: "'Chivo', sans-serif" }}>{success}</Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#64748b' }}>Delivered</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#f87171' }} />
                                                        <Box>
                                                            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#f87171', fontFamily: "'Chivo', sans-serif" }}>{failed}</Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#64748b' }}>Failed</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Detailed Metrics Grid */}
                                            <Box sx={{ p: 2, borderTop: '1px solid rgba(71, 85, 105, 0.3)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Chivo', sans-serif" }}>{total}</Typography>
                                                    <Typography sx={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Attempts</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#4ade80', fontFamily: "'JetBrains Mono', monospace" }}>{successRate.toFixed(1)}%</Typography>
                                                    <Typography sx={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Success</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: failed > 0 ? '#f87171' : '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>{failureRate.toFixed(1)}%</Typography>
                                                    <Typography sx={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Failure</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace" }}>{reachRate.toFixed(0)}%</Typography>
                                                    <Typography sx={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Reach</Typography>
                                                </Box>
                                            </Box>

                                            {/* Progress Bars */}
                                            <Box sx={{ px: 2, pb: 2 }}>
                                                <Box sx={{ mb: 1.5 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography sx={{ fontSize: '10px', color: '#94a3b8' }}>Delivery Success</Typography>
                                                        <Typography sx={{ fontSize: '10px', color: '#4ade80', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{success} of {total}</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={successRate}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: 'rgba(71, 85, 105, 0.3)',
                                                            '& .MuiLinearProgress-bar': { bgcolor: '#4ade80', borderRadius: 3 }
                                                        }}
                                                    />
                                                </Box>
                                                {failed > 0 && (
                                                    <Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography sx={{ fontSize: '10px', color: '#94a3b8' }}>Delivery Failure</Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#f87171', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{failed} of {total}</Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={failureRate}
                                                            sx={{
                                                                height: 6,
                                                                borderRadius: 3,
                                                                bgcolor: 'rgba(71, 85, 105, 0.3)',
                                                                '& .MuiLinearProgress-bar': { bgcolor: '#f87171', borderRadius: 3 }
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Time Info */}
                                            <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 2 }}>
                                                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                    <Typography sx={{ fontSize: '10px', color: '#60a5fa', textTransform: 'uppercase', mb: 0.5 }}>Time Elapsed</Typography>
                                                    <Typography sx={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>
                                                        {selectedNotification?.createdAt ? dayjs(selectedNotification.createdAt).fromNow(true) : '-'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                    <Typography sx={{ fontSize: '10px', color: '#c084fc', textTransform: 'uppercase', mb: 0.5 }}>Status</Typography>
                                                    <Typography sx={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600, textTransform: 'capitalize' }}>
                                                        {selectedNotification?.status || 'Completed'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })()}
                            </Box>

                            {/* Detailed Recipients Section with Real Delivery Status */}
                            {(() => {
                                const deliveryResults = selectedNotification?.deliveryResults || [];
                                const deliveredResults = deliveryResults.filter((r: any) => r.status === 'delivered');
                                const failedResults = deliveryResults.filter((r: any) => r.status === 'failed');

                                // Group by userId to show unique users
                                const userDeliveryMap = new Map();
                                deliveryResults.forEach((result: any) => {
                                    const userId = result.userId?.toString();
                                    if (!userId) return;
                                    if (!userDeliveryMap.has(userId)) {
                                        userDeliveryMap.set(userId, { delivered: [], failed: [] });
                                    }
                                    if (result.status === 'delivered') {
                                        userDeliveryMap.get(userId).delivered.push(result);
                                    } else {
                                        userDeliveryMap.get(userId).failed.push(result);
                                    }
                                });

                                return (
                                    <Box>
                                        {/* Header with Stats */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                Delivery Details
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    icon={<CheckCircleFill size={12} weight="fill" style={{ color: '#4ade80' }} />}
                                                    label={`${deliveredResults.length} Delivered`}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontSize: '10px', fontWeight: 600 }}
                                                />
                                                {failedResults.length > 0 && (
                                                    <Chip
                                                        icon={<XCircle size={12} weight="fill" style={{ color: '#f87171' }} />}
                                                        label={`${failedResults.length} Failed`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(248, 113, 113, 0.15)', color: '#f87171', fontSize: '10px', fontWeight: 600 }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {deliveryResults.length > 0 ? (
                                            <Box sx={{
                                                maxHeight: 280,
                                                overflowY: 'auto',
                                                bgcolor: 'rgba(30, 41, 59, 0.3)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(71, 85, 105, 0.3)',
                                            }}>
                                                {Array.from(userDeliveryMap.entries()).map(([userId, results]: [string, any], index: number) => {
                                                    const user = allUsers.find((u: any) => u._id === userId);
                                                    const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
                                                    const hasDelivered = results.delivered.length > 0;
                                                    const hasFailed = results.failed.length > 0;
                                                    const latestResult = [...results.delivered, ...results.failed].sort((a: any, b: any) =>
                                                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                                                    )[0];

                                                    return (
                                                        <Box
                                                            key={userId}
                                                            sx={{
                                                                p: 1.5,
                                                                borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                                                                transition: 'all 0.15s ease',
                                                                '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.3)' },
                                                                '&:last-child': { borderBottom: 'none' },
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                {/* Avatar */}
                                                                <Box sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '8px',
                                                                    bgcolor: hasDelivered && !hasFailed ? 'rgba(74, 222, 128, 0.15)' : hasFailed && !hasDelivered ? 'rgba(248, 113, 113, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                                                                    border: `1px solid ${hasDelivered && !hasFailed ? 'rgba(74, 222, 128, 0.3)' : hasFailed && !hasDelivered ? 'rgba(248, 113, 113, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                }}>
                                                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: hasDelivered && !hasFailed ? '#4ade80' : hasFailed && !hasDelivered ? '#f87171' : '#fbbf24' }}>
                                                                        {initials}
                                                                    </Typography>
                                                                </Box>

                                                                {/* User Info */}
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                                                                            {user?.name || `User ${index + 1}`}
                                                                        </Typography>
                                                                        {user?.role && (
                                                                            <Chip
                                                                                label={user.role}
                                                                                size="small"
                                                                                sx={{
                                                                                    height: 16,
                                                                                    fontSize: '8px',
                                                                                    fontWeight: 600,
                                                                                    bgcolor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                                                    color: user.role === 'admin' ? '#f87171' : '#60a5fa',
                                                                                    textTransform: 'capitalize',
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
                                                                        {user?.email || 'Email not available'}
                                                                    </Typography>
                                                                </Box>

                                                                {/* Device Count & Status */}
                                                                <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    {/* Platform Badge */}
                                                                    {latestResult?.platform && (
                                                                        <MuiTooltip title={latestResult.platform === 'android' ? 'Android' : 'iOS'} arrow>
                                                                            <Box sx={{ color: '#64748b' }}>
                                                                                {latestResult.platform === 'android' ?
                                                                                    <AndroidLogo size={16} weight="duotone" /> :
                                                                                    <AppleLogo size={16} weight="fill" />
                                                                                }
                                                                            </Box>
                                                                        </MuiTooltip>
                                                                    )}

                                                                    {/* Status Indicator */}
                                                                    <MuiTooltip
                                                                        title={
                                                                            hasDelivered && hasFailed
                                                                                ? `${results.delivered.length} delivered, ${results.failed.length} failed`
                                                                                : hasDelivered
                                                                                    ? `Delivered to ${results.delivered.length} device(s)`
                                                                                    : `Failed on ${results.failed.length} device(s)${results.failed[0]?.errorMessage ? `: ${results.failed[0].errorMessage}` : ''}`
                                                                        }
                                                                        arrow
                                                                    >
                                                                        <Box sx={{
                                                                            width: 28,
                                                                            height: 28,
                                                                            borderRadius: '6px',
                                                                            bgcolor: hasDelivered && !hasFailed ? 'rgba(74, 222, 128, 0.15)' : hasFailed && !hasDelivered ? 'rgba(248, 113, 113, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }}>
                                                                            {hasDelivered && !hasFailed ? (
                                                                                <CheckCircleFill size={16} weight="fill" style={{ color: '#4ade80' }} />
                                                                            ) : hasFailed && !hasDelivered ? (
                                                                                <XCircle size={16} weight="fill" style={{ color: '#f87171' }} />
                                                                            ) : (
                                                                                <Info size={16} weight="fill" style={{ color: '#fbbf24' }} />
                                                                            )}
                                                                        </Box>
                                                                    </MuiTooltip>
                                                                </Box>
                                                            </Box>

                                                            {/* Error Message if Failed */}
                                                            {hasFailed && results.failed[0]?.errorMessage && (
                                                                <Box sx={{ mt: 1, ml: 6.5, p: 1, bgcolor: 'rgba(248, 113, 113, 0.1)', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                                                                    <Typography sx={{ fontSize: '10px', color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
                                                                        {results.failed[0].errorCode}: {results.failed[0].errorMessage}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        ) : (
                                            /* No delivery results yet */
                                            <Box sx={{
                                                p: 3,
                                                bgcolor: 'rgba(30, 41, 59, 0.3)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(71, 85, 105, 0.3)',
                                                textAlign: 'center',
                                            }}>
                                                <UsersThree size={32} weight="duotone" style={{ color: '#64748b', marginBottom: 8 }} />
                                                <Typography sx={{ fontSize: '13px', color: '#94a3b8', mb: 0.5 }}>
                                                    {selectedNotification?.target === 'all' ? 'Broadcast to All Active Users' : 'Targeted Notification'}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
                                                    {(selectedNotification?.deliveryStats?.successCount || 0) + (selectedNotification?.deliveryStats?.failureCount || 0)} total attempts
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })()}
                        </Box>

                        {/* Modal Footer */}
                        <Box sx={{ p: 2, borderTop: '1px solid rgba(71, 85, 105, 0.4)', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedNotification?._id || '');
                                    CustomSnackBar.successSnackbar('Notification ID copied!');
                                }}
                                startIcon={<Copy size={16} />}
                                sx={{
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.5)', color: '#f8fafc' }
                                }}
                            >
                                Copy ID
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => setSelectedNotification(null)}
                                sx={{
                                    bgcolor: '#3b82f6',
                                    fontSize: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    '&:hover': { bgcolor: '#2563eb' }
                                }}
                            >
                                Close
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
        color: '#f8fafc',
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '10px',
        fontSize: '14px',
        transition: 'all 0.2s ease',
        '& fieldset': { borderColor: 'rgba(71, 85, 105, 0.4)', transition: 'all 0.2s ease' },
        '&:hover fieldset': { borderColor: 'rgba(71, 85, 105, 0.8)' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' }
    },
    '& .MuiInputLabel-root': { color: '#64748b', fontSize: '13px', '&.Mui-focused': { color: '#60a5fa' } },
    '& .MuiInputBase-input::placeholder': { color: '#475569', opacity: 1 },
};

const dataGridStyles = {
    border: 'none',
    bgcolor: 'transparent',
    '& .MuiDataGrid-main': { color: '#f8fafc' },
    '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(30, 41, 59, 0.6) !important', borderBottom: '1px solid rgba(71, 85, 105, 0.4) !important' },
    '& .MuiDataGrid-columnHeader': { bgcolor: 'transparent !important', outline: 'none !important', '&:focus': { outline: 'none !important' } },
    '& .MuiDataGrid-columnHeaderTitle': { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' },
    '& .MuiDataGrid-columnHeaderSeparator': { display: 'none !important' },
    '& .MuiDataGrid-row': { borderBottom: '1px solid rgba(71, 85, 105, 0.2) !important', transition: 'all 0.15s ease', '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.4) !important' } },
    '& .MuiDataGrid-cell': { display: 'flex !important', alignItems: 'center !important', borderColor: 'transparent !important', '&:focus': { outline: 'none !important' } },
    '& .MuiDataGrid-virtualScroller': { bgcolor: 'transparent !important' },
    '& .MuiDataGrid-footerContainer': { bgcolor: 'rgba(30, 41, 59, 0.6)', borderTop: '1px solid rgba(71, 85, 105, 0.4)' },
    '& .MuiTablePagination-root': { color: '#94a3b8' },
    '& .MuiTablePagination-selectIcon': { color: '#64748b' },
    '& .MuiIconButton-root': { color: '#64748b', transition: 'all 0.2s ease', '&:hover': { color: '#f8fafc' } }
};

export default NotificationManagement;
