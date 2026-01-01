/**
 * ActiveSessionBanner Component
 * 
 * Shows a banner when user has an active meeting on another device.
 * Allows them to transfer the call to this device.
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Snackbar, Alert } from '@mui/material';
import { Phone, DeviceMobile, Desktop, X, ArrowsClockwise } from '@phosphor-icons/react';
import { useActiveSession, useRequestTransferHere } from '../Hooks/useActiveSession';
import { logger } from '../utils/logger';
import { getDeviceId } from '../utils/deviceInfo';
import type { LiveSession } from '../Hooks/liveSessions';
import {
    subscribeToTransferLeaving,
    unsubscribeFromTransferLeaving,
    type TransferLeavingData
} from '../services/socketService';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

interface ActiveSessionBannerProps {
    onJoinSession?: (session: LiveSession, roomId: string) => void;
}

const ActiveSessionBanner = ({ onJoinSession }: ActiveSessionBannerProps) => {
    const { data, isLoading } = useActiveSession();
    const transferMutation = useRequestTransferHere();
    const navigate = useNavigate();
    const [dismissed, setDismissed] = useState(false);
    const [showTransferredMessage, setShowTransferredMessage] = useState(false);
    const [transferredTo, setTransferredTo] = useState('');
    const currentDeviceId = getDeviceId();

    // Listen for transfer:leaving event (when THIS device should exit)
    useEffect(() => {
        const handleTransferLeaving = (eventData: TransferLeavingData) => {
            // Only show message if this is the device being transferred FROM
            if (eventData.deviceId === currentDeviceId) {
                logger.log('[Banner] Session transferred to another device:', eventData.transferredTo);
                setTransferredTo(eventData.transferredTo);
                setShowTransferredMessage(true);
            }
        };

        subscribeToTransferLeaving(handleTransferLeaving);

        return () => {
            unsubscribeFromTransferLeaving(handleTransferLeaving);
        };
    }, [currentDeviceId]);

    const handleTransferHere = async () => {
        if (!data?.session?._id) return;

        try {
            const result = await transferMutation.mutateAsync(data.session._id);

            // If there's a callback, use it; otherwise navigate directly to session
            if (onJoinSession && result.session) {
                onJoinSession(result.session, result.roomId);
            } else {
                // Navigate to live sessions page with session data to auto-join
                navigate(`/student/live-sessions`, {
                    state: {
                        autoJoinSession: result.session,
                        roomId: result.roomId
                    }
                });
            }
        } catch (error) {
            console.error('Transfer failed:', error);
        }
    };

    const getPlatformIcon = (platform?: string) => {
        switch (platform) {
            case 'android':
            case 'ios':
                return <DeviceMobile size={20} weight="fill" />;
            case 'web':
            default:
                return <Desktop size={20} weight="fill" />;
        }
    };

    const getPlatformLabel = (platform?: string) => {
        switch (platform) {
            case 'android':
                return 'Android';
            case 'ios':
                return 'iPhone';
            case 'web':
                return 'Browser';
            default:
                return 'another device';
        }
    };

    // Don't show if loading, no active session, or dismissed
    if (isLoading || !data?.hasActiveSession || !data.session || dismissed) {
        return (
            <>
                {/* Snackbar for when call is transferred away */}
                <Snackbar
                    open={showTransferredMessage}
                    autoHideDuration={6000}
                    onClose={() => setShowTransferredMessage(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        severity="info"
                        variant="filled"
                        onClose={() => setShowTransferredMessage(false)}
                        icon={<ArrowsClockwise size={20} />}
                    >
                        Session transferred to {transferredTo}
                    </Alert>
                </Snackbar>
            </>
        );
    }

    const session = data.session;
    const platform = data.activeOnDevice?.platform;

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: '#fff',
                    px: 2,
                    // Add safe area padding for status bar on mobile
                    pt: Capacitor.isNativePlatform()
                        ? Capacitor.getPlatform() === 'android'
                            ? 'calc(max(env(safe-area-inset-top, 0px), 24px) + 8px)'
                            : 'calc(env(safe-area-inset-top, 0px) + 8px)'
                        : 1.5,
                    pb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    animation: 'slideDown 0.3s ease-out',
                    '@keyframes slideDown': {
                        from: { transform: 'translateY(-100%)' },
                        to: { transform: 'translateY(0)' }
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <Phone size={20} weight="fill" />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            Meeting in progress
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getPlatformIcon(platform)}
                            <Typography
                                sx={{
                                    fontSize: '11px',
                                    opacity: 0.9,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {session.title} on {getPlatformLabel(platform)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<ArrowsClockwise size={16} />}
                        onClick={handleTransferHere}
                        disabled={transferMutation.isPending}
                        sx={{
                            bgcolor: '#fff',
                            color: '#1e3a8a',
                            fontWeight: 700,
                            fontSize: '12px',
                            textTransform: 'none',
                            px: 2,
                            py: 0.75,
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.9)'
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(255, 255, 255, 0.5)',
                                color: '#1e3a8a'
                            }
                        }}
                    >
                        {transferMutation.isPending ? 'Transferring...' : 'Transfer Here'}
                    </Button>
                    <IconButton
                        size="small"
                        onClick={() => setDismissed(true)}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': { color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        <X size={18} />
                    </IconButton>
                </Box>
            </Box>

            {/* Snackbar for when call is transferred away */}
            <Snackbar
                open={showTransferredMessage}
                autoHideDuration={6000}
                onClose={() => setShowTransferredMessage(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    variant="filled"
                    onClose={() => setShowTransferredMessage(false)}
                    icon={<ArrowsClockwise size={20} />}
                >
                    Session transferred to {transferredTo}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ActiveSessionBanner;
