import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { X, Megaphone, CalendarBlank, User } from '@phosphor-icons/react';
import dayjs from 'dayjs';

interface Announcement {
    _id: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    createdBy?: {
        name: string;
    };
}

interface AnnouncementDetailModalProps {
    announcement: Announcement | null;
    open: boolean;
    onClose: () => void;
}

const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
    announcement,
    open,
    onClose
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!announcement) return null;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#f87171';
            case 'medium': return '#fbbf24';
            case 'low': return '#60a5fa';
            default: return '#94a3b8';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    bgcolor: '#0f172a',
                    backgroundImage: 'none',
                    border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: isMobile ? 0 : '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: '10px',
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        display: 'flex'
                    }}>
                        <Megaphone size={20} weight="fill" />
                    </Box>
                    <Typography sx={{
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 700,
                        color: '#f8fafc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '16px'
                    }}>
                        Announcement
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={announcement.priority}
                            size="small"
                            sx={{
                                bgcolor: `${getPriorityColor(announcement.priority)}20`,
                                color: getPriorityColor(announcement.priority),
                                fontWeight: 700,
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                height: '20px',
                                border: `1px solid ${getPriorityColor(announcement.priority)}40`
                            }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                            <CalendarBlank size={14} />
                            <Typography sx={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                                {dayjs(announcement.createdAt).format('DD MMM YYYY')}
                            </Typography>
                        </Box>
                        {announcement.createdBy?.name && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                <User size={14} />
                                <Typography sx={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                                    {announcement.createdBy.name}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Typography variant="h5" sx={{
                        color: '#f8fafc',
                        fontWeight: 700,
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.3
                    }}>
                        {announcement.title}
                    </Typography>
                </Box>

                <Typography sx={{
                    color: '#94a3b8',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    {announcement.content}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0, justifyContent: 'flex-end' }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        bgcolor: '#1e293b',
                        color: '#f8fafc',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#334155' }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnnouncementDetailModal;
