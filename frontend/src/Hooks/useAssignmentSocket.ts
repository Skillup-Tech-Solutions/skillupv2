/**
 * useAssignmentSocket Hook
 * 
 * Real-time assignment updates via Socket.IO.
 * Notifies students when they're assigned to new courses/projects/internships.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    subscribeToAssignments,
    unsubscribeFromAssignments,
    type AssignmentEventData,
    type AssignmentDeletedData
} from '../services/socketService';
import { logger } from '../utils/logger';
import CustomSnackBar from '../Custom/CustomSnackBar';

interface UseAssignmentSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** Callback when a new assignment is created */
    onAssigned?: (assignment: AssignmentEventData['assignment']) => void;
}

/**
 * Hook for real-time assignment updates
 */
export const useAssignmentSocket = (
    options: UseAssignmentSocketOptions = {}
): void => {
    const { enabled = true, onAssigned } = options;
    const queryClient = useQueryClient();

    const handleCreated = useCallback((data: AssignmentEventData) => {
        logger.log('[Socket] Assignment created:', data.assignment._id, data.assignment.itemType);

        // Refresh student's course/project/internship lists
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });

        // Show notification
        const typeLabels: Record<string, string> = {
            course: 'course',
            project: 'project',
            internship: 'internship'
        };
        const typeLabel = typeLabels[data.assignment.itemType] || 'program';
        CustomSnackBar.infoSnackbar(`You've been assigned a new ${typeLabel}! 🎓`);

        // Call custom callback
        onAssigned?.(data.assignment);
    }, [queryClient, onAssigned]);

    const handleUpdated = useCallback((data: AssignmentEventData) => {
        logger.log('[Socket] Assignment updated:', data.assignment._id);

        // Refresh relevant lists
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
    }, [queryClient]);

    const handleDeleted = useCallback((data: AssignmentDeletedData) => {
        logger.log('[Socket] Assignment deleted:', data.assignmentId);

        // Refresh relevant lists
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    }, [queryClient]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToAssignments({
            onCreated: handleCreated,
            onUpdated: handleUpdated,
            onDeleted: handleDeleted
        });

        return () => {
            unsubscribeFromAssignments();
        };
    }, [enabled, handleCreated, handleUpdated, handleDeleted]);
};

export default useAssignmentSocket;
