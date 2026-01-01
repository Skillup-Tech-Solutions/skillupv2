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
    CircularProgress
} from "@mui/material";
import { BellRinging, PaperPlaneTilt, CheckCircle, XCircle, Users, Broadcast, ClockCounterClockwise, ArrowClockwise } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { useGetUsers } from "../Hooks/user";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";

// Stats Card Component
const StatsCard = ({ icon, label, count, color, bgColor }: { icon: React.ReactNode; label: string; count: number; color: string; bgColor: string }) => (
    <Box
        sx={{
            flex: 1,
            minWidth: 140,
            p: 2,
            borderRadius: "6px",
            background: `linear-gradient(135deg, ${bgColor} 0%, rgba(30, 41, 59, 0.4) 100%)`,
            border: "1px solid rgba(71, 85, 105, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
            "&:hover": { borderColor: color, transform: "translateY(-2px)" },
        }}
    >
        <Box>
            <Box sx={{ fontSize: "28px", fontWeight: 700, color, fontFamily: "'Chivo', sans-serif" }}>{count}</Box>
            <Box sx={{ fontSize: "11px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.5 }}>{label}</Box>
        </Box>
        <Box sx={{ color, opacity: 0.7 }}>{icon}</Box>
    </Box>
);

const NotificationManagement = () => {
    const queryClient = useQueryClient();
    const { data: usersData } = useGetUsers();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [target, setTarget] = useState("all");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [priority, setPriority] = useState("alert"); // : alert, update, promo
    const [imageUrl, setImageUrl] = useState(""); // Rich notification image

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
            CustomSnackBar.successSnackbar(`Notification sent! (${data.stats.successCount} delivered, ${data.stats.failureCount} failed)`);
            setTitle("");
            setBody("");
            setSelectedUsers([]);
            queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
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
        sendMutation.mutate({
            title,
            body,
            target,
            targetUserIds: target === 'specific' ? selectedUsers : [],
            data: {
                priority, // : alert, update, promo
                ...(imageUrl && { imageUrl }) // Rich notification image
            }
        });
    };

    // Computed stats
    const stats = {
        total: history?.length || 0,
        broadcast: history?.filter((n: any) => n.target === 'all').length || 0,
        targeted: history?.filter((n: any) => n.target === 'specific').length || 0,
        delivered: history?.reduce((acc: number, n: any) => acc + (n.deliveryStats?.successCount || 0), 0) || 0
    };

    const columns: GridColDef[] = [
        {
            field: "title",
            headerName: "Title",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{params.value}</Typography>
            )
        },
        {
            field: "body",
            headerName: "Message",
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <MuiTooltip title={params.value} arrow>
                    <Typography sx={{ fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{params.value}</Typography>
                </MuiTooltip>
            )
        },
        {
            field: "target",
            headerName: "Target",
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'all' ? 'BROADCAST' : 'TARGETED'}
                    size="small"
                    sx={{
                        fontSize: '10px',
                        fontWeight: 700,
                        height: '22px',
                        bgcolor: params.value === 'all' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                        color: params.value === 'all' ? '#60a5fa' : '#a78bfa',
                        border: `1px solid ${params.value === 'all' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`
                    }}
                />
            ),
        },
        {
            field: "targetUserIds",
            headerName: "Recipients",
            width: 180,
            renderCell: (params) => {
                const users = params.value || [];

                if (users.length === 0) {
                    return <Typography sx={{ fontSize: "11px", color: "#475569" }}>No recipients</Typography>;
                }

                const displayNames = users.slice(0, 2).map((u: any) => u.name || u.email || 'Unknown').join(', ');
                const remaining = users.length > 2 ? ` +${users.length - 2} more` : '';

                return (
                    <MuiTooltip
                        arrow
                        title={
                            <Box sx={{ p: 0.5, maxHeight: 300, overflowY: 'auto' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: '#60a5fa' }}>
                                    {params.row.target === 'all' ? 'Broadcast to' : 'Targeted'} ({users.length} users)
                                </Typography>
                                {users.slice(0, 20).map((u: any, i: number) => (
                                    <Typography key={i} variant="caption" sx={{ display: 'block', color: '#f8fafc' }}>
                                        • {u.name || 'Unknown'} <span style={{ color: '#64748b' }}>({u.email})</span>
                                    </Typography>
                                ))}
                                {users.length > 20 && (
                                    <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8', mt: 1 }}>
                                        ... and {users.length - 20} more
                                    </Typography>
                                )}
                            </Box>
                        }
                    >
                        <Typography sx={{ fontSize: "12px", color: "#94a3b8", cursor: 'help', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayNames}{remaining}
                        </Typography>
                    </MuiTooltip>
                );
            },
        },
        {
            field: "deliveryStats",
            headerName: "Delivery",
            width: 120,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircle size={14} weight="fill" style={{ color: '#4ade80' }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: '#4ade80' }}>{params.value?.successCount || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <XCircle size={14} weight="fill" style={{ color: '#f87171' }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: '#f87171' }}>{params.value?.failureCount || 0}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: "sentBy",
            headerName: "Sent By",
            width: 140,
            valueGetter: (_value: any, row: any) => row?.sentBy?.name || "System",
            renderCell: (params) => (
                <Typography sx={{ fontSize: "12px", color: "#94a3b8" }}>{params.value}</Typography>
            )
        },
        {
            field: "createdAt",
            headerName: "Sent At",
            width: 160,
            renderCell: (params) => (
                <Typography sx={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                    {params.value ? dayjs(params.value).format('DD MMM, hh:mm A') : '-'}
                </Typography>
            )
        }
    ];

    const allUsers = usersData?.data || usersData || [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BellRinging size={28} weight="duotone" style={{ color: "#60a5fa" }} />
                    <Box component="h1" sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em", m: 0 }}>
                        Mobile App Alerts
                    </Box>
                </Box>
                <MuiTooltip title="Refresh">
                    <Button onClick={() => refetch()} sx={{ minWidth: 40, p: 1, color: "#94a3b8", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)", color: "#f8fafc" } }}>
                        <ArrowClockwise size={20} weight="bold" />
                    </Button>
                </MuiTooltip>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <StatsCard icon={<ClockCounterClockwise size={32} weight="duotone" />} label="Total Sent" count={stats.total} color="#3b82f6" bgColor="rgba(59, 130, 246, 0.15)" />
                <StatsCard icon={<Broadcast size={32} weight="duotone" />} label="Broadcasts" count={stats.broadcast} color="#8b5cf6" bgColor="rgba(139, 92, 246, 0.15)" />
                <StatsCard icon={<Users size={32} weight="duotone" />} label="Targeted" count={stats.targeted} color="#f59e0b" bgColor="rgba(245, 158, 11, 0.15)" />
                <StatsCard icon={<CheckCircle size={32} weight="duotone" />} label="Delivered" count={stats.delivered} color="#22c55e" bgColor="rgba(34, 197, 94, 0.15)" />
            </Box>

            {/* Main Content */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "380px 1fr" }, gap: 3 }}>
                {/* Compose Panel */}
                <Paper sx={{ p: 3, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "8px", height: "fit-content" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                        <PaperPlaneTilt size={20} weight="duotone" style={{ color: "#60a5fa" }} />
                        <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Compose New Push
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Title"
                            placeholder="Notification title..."
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <TextField
                            label="Message Body"
                            placeholder="Enter your notification message..."
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <TextField
                            select
                            label="Who should receive this?"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            fullWidth
                            size="small"
                            sx={textFieldStyles}
                        >
                            <MenuItem value="all">📢 Send to Everyone (Broadcast)</MenuItem>
                            <MenuItem value="specific">🎯 Send to Specific Users</MenuItem>
                        </TextField>

                        {target === 'specific' && (
                            <TextField
                                select
                                label="Select Recipients"
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
                                                return <Chip key={value} label={user?.name || value} size="small" sx={{ height: 20, fontSize: "10px" }} />;
                                            })}
                                            {selected.length > 3 && <Chip label={`+${selected.length - 3}`} size="small" sx={{ height: 20, fontSize: "10px" }} />}
                                        </Box>
                                    )
                                }}
                                sx={textFieldStyles}
                            >
                                {allUsers.map((user: any) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.name} <span style={{ color: "#64748b", marginLeft: 8 }}>({user.email})</span>
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {/*  Priority Selection */}
                        <TextField
                            select
                            label="Type of Alert (Priority)"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            fullWidth
                            size="small"
                            sx={textFieldStyles}
                        >
                            <MenuItem value="alert">🔴 IMPORTANT: Urgent / Deadlines</MenuItem>
                            <MenuItem value="update">🟡 REGULAR: General News</MenuItem>
                            <MenuItem value="promo">🟢 CASUAL: New Offers / Tips</MenuItem>
                        </TextField>

                        {/* Rich Notification Image URL */}
                        <TextField
                            label="Image Link (Optional)"
                            placeholder="https://example.com/image.jpg"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            sx={textFieldStyles}
                            helperText="If provided, students will see this image in the notification"
                        />

                        {/* Mobile Preview Section */}
                        <Box sx={{ mt: 1 }}>
                            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", mb: 1, letterSpacing: "0.1em" }}>
                                Mobile Alert Preview
                            </Typography>
                            <Box sx={{
                                p: 1.5,
                                bgcolor: "#0f172a",
                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                borderRadius: "12px",
                                position: "relative",
                                maxWidth: "100%",
                                overflow: "hidden"
                            }}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "8px",
                                        bgcolor: "#3b82f6",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <BellRinging size={18} weight="fill" color="#fff" />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "13px", mb: 0.2 }}>
                                            {title || "Alert Title..."}
                                        </Typography>
                                        <Typography sx={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.4, mb: imageUrl ? 1 : 0 }}>
                                            {body || "Your message will appear here..."}
                                        </Typography>
                                        {imageUrl && (
                                            <Box
                                                component="img"
                                                src={imageUrl}
                                                onError={(e: any) => e.target.style.display = 'none'}
                                                sx={{
                                                    width: '100%',
                                                    height: 100,
                                                    objectFit: 'cover',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={sendMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PaperPlaneTilt weight="bold" />}
                            onClick={handleSend}
                            disabled={sendMutation.isPending || !title || !body}
                            sx={{
                                bgcolor: "#3b82f6",
                                fontWeight: 700,
                                py: 1.5,
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                borderRadius: "6px",
                                '&:hover': { bgcolor: "#2563eb" },
                                '&:disabled': { bgcolor: "rgba(59, 130, 246, 0.3)", color: "rgba(248, 250, 252, 0.5)" }
                            }}
                        >
                            {sendMutation.isPending ? "Sending..." : "Send Push Notification"}
                        </Button>
                    </Box>
                </Paper>

                {/* History Panel */}
                <Paper sx={{ p: 3, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "8px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                        <ClockCounterClockwise size={20} weight="duotone" style={{ color: "#60a5fa" }} />
                        <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Notification History
                        </Typography>
                    </Box>
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={history || []}
                            columns={columns}
                            loading={historyLoading}
                            getRowId={(row) => row._id}
                            rowHeight={52}
                            pageSizeOptions={[10, 20, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } }
                            }}
                            sx={dataGridStyles}
                        />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
        color: '#f8fafc',
        bgcolor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '6px',
        '& fieldset': { borderColor: 'rgba(71, 85, 105, 0.4)' },
        '&:hover fieldset': { borderColor: 'rgba(71, 85, 105, 0.6)' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '1px' }
    },
    '& .MuiInputLabel-root': { color: '#94a3b8', '&.Mui-focused': { color: '#3b82f6' } },
    '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 }
};

const dataGridStyles = {
    border: '1px solid rgba(71, 85, 105, 0.4)',
    borderRadius: '6px',
    bgcolor: 'rgba(30, 41, 59, 0.3)',
    '& .MuiDataGrid-main': { color: '#f8fafc' },
    '& .MuiDataGrid-columnHeaders': {
        bgcolor: '#0f172a !important',
        borderBottom: '1px solid rgba(71, 85, 105, 0.4) !important'
    },
    '& .MuiDataGrid-columnHeader': {
        bgcolor: '#0f172a !important',
        outline: 'none !important',
        '&:focus': { outline: 'none !important' }
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#94a3b8'
    },
    '& .MuiDataGrid-columnHeaderSeparator': { display: 'none !important' },
    '& .MuiDataGrid-row': {
        borderBottom: '1px solid rgba(71, 85, 105, 0.3) !important',
        '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.4) !important' }
    },
    '& .MuiDataGrid-cell': {
        display: 'flex !important',
        alignItems: 'center !important',
        borderColor: 'rgba(71, 85, 105, 0.3) !important',
        '&:focus': { outline: 'none !important' }
    },
    '& .MuiDataGrid-virtualScroller': { bgcolor: 'transparent !important' },
    '& .MuiDataGrid-footerContainer': {
        bgcolor: '#0f172a',
        borderTop: '1px solid rgba(71, 85, 105, 0.4)'
    },
    '& .MuiTablePagination-root': { color: '#94a3b8' }
};

export default NotificationManagement;
