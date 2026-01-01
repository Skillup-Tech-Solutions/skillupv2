/**
 * UpdatePrompt Component
 * 
 * Modal dialog to notify users about available app updates.
 * Supports both optional and force update modes.
 */

import { Box, Button, Modal, Backdrop, Fade } from '@mui/material';
import { ArrowSquareOut, X, RocketLaunch, Warning } from '@phosphor-icons/react';
import { Capacitor } from '@capacitor/core';
import type { UpdateCheckResult } from '../services/appUpdateService';

interface UpdatePromptProps {
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
    updateInfo: UpdateCheckResult | null;
}

const UpdatePrompt = ({ open, onClose, onUpdate, updateInfo }: UpdatePromptProps) => {
    if (!updateInfo) return null;

    const isNative = Capacitor.isNativePlatform();

    return (
        <Modal
            open={open}
            onClose={updateInfo.forceUpdate ? undefined : onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 300,
                    sx: { bgcolor: 'rgba(2, 6, 23, 0.85)' },
                },
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        maxWidth: 400,
                        bgcolor: '#0f172a',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        outline: 'none',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            background: updateInfo.forceUpdate
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))'
                                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
                            p: 3,
                            borderBottom: '1px solid rgba(71, 85, 105, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {updateInfo.forceUpdate ? (
                                <Warning size={28} weight="duotone" color="#f87171" />
                            ) : (
                                <RocketLaunch size={28} weight="duotone" color="#60a5fa" />
                            )}
                            <Box>
                                <Box
                                    sx={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#f8fafc',
                                        fontFamily: "'Chivo', sans-serif",
                                    }}
                                >
                                    {updateInfo.forceUpdate ? 'Update Required' : 'Update Available'}
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: '13px',
                                        color: '#94a3b8',
                                        mt: 0.25,
                                    }}
                                >
                                    Version {updateInfo.latestVersion}
                                </Box>
                            </Box>
                        </Box>

                        {!updateInfo.forceUpdate && (
                            <Box
                                onClick={onClose}
                                sx={{
                                    cursor: 'pointer',
                                    p: 0.5,
                                    borderRadius: '6px',
                                    color: '#64748b',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'rgba(71, 85, 105, 0.4)',
                                        color: '#f8fafc',
                                    },
                                }}
                            >
                                <X size={20} />
                            </Box>
                        )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 3 }}>
                        {/* Version comparison */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                mb: 3,
                                py: 2,
                                bgcolor: 'rgba(30, 41, 59, 0.4)',
                                borderRadius: '8px',
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        fontSize: '10px',
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        mb: 0.5,
                                    }}
                                >
                                    Current
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#94a3b8',
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    v{updateInfo.currentVersion}
                                </Box>
                            </Box>

                            <Box sx={{ color: '#475569', fontSize: '20px' }}>→</Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        fontSize: '10px',
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        mb: 0.5,
                                    }}
                                >
                                    Latest
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#4ade80',
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    v{updateInfo.latestVersion}
                                </Box>
                            </Box>
                        </Box>

                        {/* Release notes */}
                        {updateInfo.releaseNotes && (
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        fontSize: '12px',
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        mb: 1,
                                    }}
                                >
                                    What's New
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: '14px',
                                        color: '#cbd5e1',
                                        lineHeight: 1.6,
                                        bgcolor: 'rgba(15, 23, 42, 0.4)',
                                        border: '1px solid rgba(71, 85, 105, 0.4)',
                                        borderRadius: '6px',
                                        p: 2,
                                    }}
                                >
                                    {updateInfo.releaseNotes}
                                </Box>
                            </Box>
                        )}

                        {updateInfo.forceUpdate && (
                            <Box
                                sx={{
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '6px',
                                    p: 2,
                                    mb: 3,
                                    display: 'flex',
                                    gap: 1.5,
                                }}
                            >
                                <Warning size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                                <Box sx={{ fontSize: '13px', color: '#f87171', lineHeight: 1.5 }}>
                                    This update is required to continue using the app. Your current version is no longer supported.
                                </Box>
                            </Box>
                        )}

                        {/* Actions */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: { xs: 'column', sm: 'row' },
                            }}
                        >
                            {!updateInfo.forceUpdate && (
                                <Button
                                    onClick={onClose}
                                    fullWidth
                                    sx={{
                                        bgcolor: '#334155',
                                        color: '#f8fafc',
                                        py: 1.25,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        '&:hover': { bgcolor: '#475569' },
                                    }}
                                >
                                    Later
                                </Button>
                            )}

                            <Button
                                onClick={onUpdate}
                                fullWidth
                                startIcon={isNative ? <ArrowSquareOut size={18} /> : undefined}
                                sx={{
                                    bgcolor: updateInfo.forceUpdate ? '#ef4444' : '#3b82f6',
                                    color: '#fff',
                                    py: 1.25,
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    '&:hover': {
                                        bgcolor: updateInfo.forceUpdate ? '#dc2626' : '#2563eb',
                                    },
                                }}
                            >
                                {isNative ? 'Open Store' : 'Update Now'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default UpdatePrompt;
