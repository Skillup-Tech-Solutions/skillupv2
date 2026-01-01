/**
 * useAnnouncementSocket Hook
 * 
 * React hook for real-time announcement updates via Socket.IO.
 * Automatically updates React Query cache when announcements change.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    subscribeToAnnouncements,
    unsubscribeFromAnnouncements,
    type AnnouncementData,
    type AnnouncementDeletedData
} from '../services/socketService';
import { logger } from '../utils/logger';

interface UseAnnouncementSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** Callback when a new announcement is created */
    onNew?: (announcement: AnnouncementData['announcement']) => void;
}

/**
 * Hook for real-time announcement updates
 */
export const useAnnouncementSocket = (
    options: UseAnnouncementSocketOptions = {}
): void => {
    const { enabled = true, onNew } = options;
    const queryClient = useQueryClient();

    const handleNew = useCallback((data: AnnouncementData) => {
        logger.log('[Socket] New announcement:', data.announcement.title);

        // Invalidate relevant queries to refetch
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        queryClient.invalidateQueries({ queryKey: ['student-announcements'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });

        // Call custom callback
        onNew?.(data.announcement);
    }, [queryClient, onNew]);

    const handleUpdated = useCallback((data: AnnouncementData) => {
        logger.log('[Socket] Announcement updated:', data.announcement.title);

        // Invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }, [queryClient]);

    const handleDeleted = useCallback((data: AnnouncementDeletedData) => {
        logger.log('[Socket] Announcement deleted:', data.id);

        // Invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }, [queryClient]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToAnnouncements({
            onNew: handleNew,
            onUpdated: handleUpdated,
            onDeleted: handleDeleted
        });

        return () => {
            unsubscribeFromAnnouncements();
        };
    }, [enabled, handleNew, handleUpdated, handleDeleted]);
};

export default useAnnouncementSocket;
