/**
 * useCourseSocket Hook
 * 
 * Real-time course/program updates via Socket.IO.
 * Automatically updates React Query cache when courses are created, updated, or deleted.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    subscribeToCourses,
    unsubscribeFromCourses,
    type CourseEventData
} from '../services/socketService';
import { logger } from '../utils/logger';
import CustomSnackBar from '../Custom/CustomSnackBar';

interface UseCourseSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** Show toast notifications for course changes */
    showNotifications?: boolean;
}

/**
 * Hook for real-time course updates
 */
export const useCourseSocket = (
    options: UseCourseSocketOptions = {}
): void => {
    const { enabled = true, showNotifications = false } = options;
    const queryClient = useQueryClient();

    const handleCreated = useCallback((data: CourseEventData) => {
        logger.log('[Socket] Course created:', data.course?.name);

        // Invalidate course queries to refetch
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
        // Invalidate student-side queries
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });

        if (showNotifications && data.course?.name) {
            CustomSnackBar.infoSnackbar(`New course added: ${data.course.name}`);
        }
    }, [queryClient, showNotifications]);

    const handleUpdated = useCallback((data: CourseEventData) => {
        logger.log('[Socket] Course updated:', data.course?.name);

        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
        // Invalidate student-side queries
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    }, [queryClient]);

    const handleDeleted = useCallback((data: CourseEventData) => {
        logger.log('[Socket] Course deleted:', data.courseId);

        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
        // Invalidate student-side queries
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    }, [queryClient]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToCourses({
            onCreated: handleCreated,
            onUpdated: handleUpdated,
            onDeleted: handleDeleted
        });

        return () => {
            unsubscribeFromCourses();
        };
    }, [enabled, handleCreated, handleUpdated, handleDeleted]);
};

export default useCourseSocket;
