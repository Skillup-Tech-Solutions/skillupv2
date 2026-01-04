/**
 * useDashboardSocket Hook
 * 
 * Real-time dashboard stats updates via Socket.IO.
 * Automatically updates React Query cache when dashboard data changes.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    subscribeToDashboard,
    unsubscribeFromDashboard,
    type DashboardUpdateData
} from '../services/socketService';
import { logger } from '../utils/logger';

interface UseDashboardSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
}

/**
 * Hook for real-time dashboard updates
 */
export const useDashboardSocket = (
    options: UseDashboardSocketOptions = {}
): void => {
    const { enabled = true } = options;
    const queryClient = useQueryClient();

    const handleUpdate = useCallback((data: DashboardUpdateData) => {
        logger.log('[Socket] Dashboard update:', data.type, data.action);

        // Invalidate dashboard queries to refetch counts
        queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    }, [queryClient]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToDashboard(handleUpdate);

        return () => {
            unsubscribeFromDashboard();
        };
    }, [enabled, handleUpdate]);
};

export default useDashboardSocket;
