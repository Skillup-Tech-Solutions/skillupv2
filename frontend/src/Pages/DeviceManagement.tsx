import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {
    DeviceMobile,
    Desktop,
    Globe,
    Trash,
    SignOut,
    CheckCircle
} from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";
import CustomSnackBar from "../Custom/CustomSnackBar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface DeviceSession {
    _id: string;
    deviceId: string;
    deviceName: string;
    platform: 'android' | 'ios' | 'web';
    lastActiveAt: string;
    createdAt: string;
    isCurrent: boolean;
    hasFcmToken: boolean;
}

interface DeviceListResponse {
    count: number;
    devices: DeviceSession[];
}

const getPlatformIcon = (platform: string) => {
    switch (platform) {
        case 'android':
        case 'ios':
            return <DeviceMobile size={24} weight="regular" />;
        case 'web':
            return <Globe size={24} weight="regular" />;
        default:
            return <Desktop size={24} weight="regular" />;
    }
};

const DeviceManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const queryClient = useQueryClient();
    const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
    const [deviceToRevoke, setDeviceToRevoke] = useState<DeviceSession | null>(null);

    // Fetch device sessions
    const { data, isLoading, isError } = useQuery<DeviceListResponse>({
        queryKey: ['deviceSessions'],
        queryFn: async () => {
            const response = await api.get('/devices');
            return response.data;
        }
    });

    // Revoke single device mutation
    const revokeMutation = useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await api.delete(`/devices/${sessionId}`);
            return response.data;
        },
        onSuccess: (data) => {
            CustomSnackBar.successSnackbar(data.message || 'Device logged out successfully');
            queryClient.invalidateQueries({ queryKey: ['deviceSessions'] });
            setDeviceToRevoke(null);
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || 'Failed to logout device');
        }
    });

    // Revoke all devices mutation
    const revokeAllMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete('/devices');
            return response.data;
        },
        onSuccess: (data) => {
            CustomSnackBar.successSnackbar(data.message || 'All other devices logged out');
            queryClient.invalidateQueries({ queryKey: ['deviceSessions'] });
            setLogoutAllDialogOpen(false);
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || 'Failed to logout devices');
        }
    });

    const handleRevokeDevice = () => {
        if (deviceToRevoke) {
            revokeMutation.mutate(deviceToRevoke._id);
        }
    };

    const handleRevokeAll = () => {
        revokeAllMutation.mutate();
    };

    const otherDevicesCount = data?.devices.filter(d => !d.isCurrent).length || 0;

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: 2,
                mb: 4
            }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        Detailed list of all devices currently authenticated with your account.
                    </Typography>
                </Box>

                {otherDevicesCount > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth={isMobile}
                        startIcon={<SignOut size={18} />}
                        onClick={() => setLogoutAllDialogOpen(true)}
                        sx={{
                            bgcolor: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            px: 2,
                            py: 1,
                            '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.2)',
                                borderColor: 'rgba(239, 68, 68, 0.4)'
                            }
                        }}
                    >
                        Logout All Others
                    </Button>
                )}
            </Box>

            {/* Loading State */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
            )}

            {/* Error State */}
            {isError && (
                <Paper sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    <Typography sx={{ color: '#ef4444' }}>
                        Failed to load device sessions. Please try again.
                    </Typography>
                </Paper>
            )}

            {/* Device List */}
            {data?.devices && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.devices.map((device) => (
                        <Paper
                            key={device._id}
                            sx={{
                                p: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                bgcolor: device.isCurrent
                                    ? 'rgba(59, 130, 246, 0.1)'
                                    : 'rgba(30, 41, 59, 0.5)',
                                border: device.isCurrent
                                    ? '1px solid rgba(59, 130, 246, 0.3)'
                                    : '1px solid rgba(71, 85, 105, 0.3)',
                                borderRadius: '8px'
                            }}
                        >
                            {/* Platform Icon */}
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: device.isCurrent
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'rgba(71, 85, 105, 0.3)',
                                color: device.isCurrent ? '#3b82f6' : '#94a3b8'
                            }}>
                                {getPlatformIcon(device.platform)}
                            </Box>

                            {/* Device Info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                    <Typography sx={{
                                        color: '#f8fafc',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: isMobile ? '120px' : 'none'
                                    }}>
                                        {device.deviceName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {device.isCurrent && (
                                            <Chip
                                                icon={<CheckCircle size={12} weight="fill" />}
                                                label="Active"
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(34, 197, 94, 0.15)',
                                                    color: '#4ade80',
                                                    height: '20px',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    border: '1px solid rgba(74, 222, 128, 0.2)',
                                                    '& .MuiChip-icon': { color: '#4ade80' }
                                                }}
                                            />
                                        )}
                                        {device.hasFcmToken && (
                                            <Chip
                                                label="Push"
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                                                    color: '#60a5fa',
                                                    height: '20px',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    border: '1px solid rgba(96, 165, 250, 0.2)'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <Typography sx={{
                                    color: '#64748b',
                                    fontSize: '12px',
                                    fontFamily: "'Inter', sans-serif",
                                    mt: 0.25
                                }}>
                                    {device.platform.charAt(0).toUpperCase() + device.platform.slice(1)} • {dayjs(device.lastActiveAt).fromNow()}
                                </Typography>
                            </Box>

                            {/* Actions */}
                            {!device.isCurrent && (
                                <IconButton
                                    onClick={() => setDeviceToRevoke(device)}
                                    sx={{
                                        color: '#ef4444',
                                        '&:hover': {
                                            bgcolor: 'rgba(239, 68, 68, 0.1)'
                                        }
                                    }}
                                >
                                    <Trash size={20} />
                                </IconButton>
                            )}
                        </Paper>
                    ))}

                    {data.devices.length === 0 && (
                        <Paper sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: 'rgba(30, 41, 59, 0.5)'
                        }}>
                            <Typography sx={{ color: '#94a3b8' }}>
                                No active device sessions found.
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Revoke Single Device Dialog */}
            <Dialog
                open={!!deviceToRevoke}
                onClose={() => setDeviceToRevoke(null)}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e293b',
                        color: '#f8fafc',
                        borderRadius: '12px'
                    }
                }}
            >
                <DialogTitle>Logout Device?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#94a3b8' }}>
                        This will log out "{deviceToRevoke?.deviceName}" and revoke its access.
                        The device will need to log in again to access your account.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setDeviceToRevoke(null)}
                        sx={{ color: '#94a3b8' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRevokeDevice}
                        disabled={revokeMutation.isPending}
                    >
                        {revokeMutation.isPending ? 'Logging out...' : 'Logout Device'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke All Devices Dialog */}
            <Dialog
                open={logoutAllDialogOpen}
                onClose={() => setLogoutAllDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e293b',
                        color: '#f8fafc',
                        borderRadius: '12px'
                    }
                }}
            >
                <DialogTitle>Logout All Other Devices?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#94a3b8' }}>
                        This will log out all {otherDevicesCount} other device(s) currently logged into your account.
                        Only this device will remain logged in.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setLogoutAllDialogOpen(false)}
                        sx={{ color: '#94a3b8' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRevokeAll}
                        disabled={revokeAllMutation.isPending}
                    >
                        {revokeAllMutation.isPending ? 'Logging out...' : 'Logout All Others'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeviceManagement;
