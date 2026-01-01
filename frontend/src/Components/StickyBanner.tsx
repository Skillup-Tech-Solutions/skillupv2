import React from 'react';
import { Box, Typography, IconButton, Button, Paper } from '@mui/material';
import { X, Info, WarningCircle, Megaphone } from '@phosphor-icons/react';

export interface StickyBannerProps {
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    onClose: () => void;
    onAction?: () => void;
    actionLabel?: string;
}

const StickyBanner: React.FC<StickyBannerProps> = ({
    title,
    message,
    priority = 'medium',
    onClose,
    onAction,
    actionLabel = 'View'
}) => {
    const getPriorityStyles = () => {
        switch (priority) {
            case 'high':
                return {
                    borderColor: '#ef4444', // red-500
                    icon: <WarningCircle size={24} weight="fill" color="#ef4444" />,
                    bg: 'rgba(239, 68, 68, 0.1)'
                };
            case 'medium':
                return {
                    borderColor: '#fb923c', // orange-400
                    icon: <Megaphone size={24} weight="fill" color="#fb923c" />,
                    bg: 'rgba(251, 146, 60, 0.1)'
                };
            default:
                return {
                    borderColor: '#60a5fa', // blue-400
                    icon: <Info size={24} weight="fill" color="#60a5fa" />,
                    bg: 'rgba(96, 165, 250, 0.1)'
                };
        }
    };

    const styles = getPriorityStyles();

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                bgcolor: styles.bg,
                borderLeft: `4px solid ${styles.borderColor}`,
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 1.5, sm: 2 },
                gap: 2,
                borderRadius: 0,
                position: 'relative',
                backdropFilter: 'blur(8px)',
                animation: 'slideDown 0.3s ease-out',
                '@keyframes slideDown': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' }
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {styles.icon}
                </Box>
                <Box>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#f8fafc',
                            lineHeight: 1.2,
                            mb: 0.5
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            color: '#94a3b8',
                            lineHeight: 1.4,
                            maxWidth: '800px'
                        }}
                    >
                        {message}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {onAction && (
                    <Button
                        size="small"
                        variant="contained"
                        onClick={onAction}
                        sx={{
                            bgcolor: styles.borderColor,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '11px',
                            minWidth: '70px',
                            '&:hover': {
                                bgcolor: styles.borderColor,
                                filter: 'brightness(1.1)'
                            }
                        }}
                    >
                        {actionLabel}
                    </Button>
                )}
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ color: '#64748b', '&:hover': { color: '#f8fafc' } }}
                >
                    <X size={18} />
                </IconButton>
            </Box>
        </Paper>
    );
};

export default StickyBanner;
