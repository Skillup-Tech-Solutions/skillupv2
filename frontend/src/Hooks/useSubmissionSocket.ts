/**
 * useSubmissionSocket Hook
 * 
 * Real-time submission updates via Socket.IO.
 * Notifies students when their submissions are reviewed.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    subscribeToSubmissions,
    unsubscribeFromSubmissions,
    type SubmissionEventData
} from '../services/socketService';
import { logger } from '../utils/logger';
import CustomSnackBar from '../Custom/CustomSnackBar';

interface UseSubmissionSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** Callback when a submission is reviewed */
    onReviewed?: (submission: SubmissionEventData['submission']) => void;
}

/**
 * Hook for real-time submission updates
 */
export const useSubmissionSocket = (
    options: UseSubmissionSocketOptions = {}
): void => {
    const { enabled = true, onReviewed } = options;
    const queryClient = useQueryClient();

    const handleCreated = useCallback((data: SubmissionEventData) => {
        logger.log('[Socket] Submission created:', data.submission._id);

        // Refresh admin/staff submissions list
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
        queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
    }, [queryClient]);

    const handleReviewed = useCallback((data: SubmissionEventData) => {
        logger.log('[Socket] Submission reviewed:', data.submission._id, data.submission.status);

        // Refresh student's submissions and projects
        queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });
        queryClient.invalidateQueries({ queryKey: ['submissions'] });

        // Show notification based on status
        const status = data.submission.status;
        if (status === 'approved') {
            CustomSnackBar.successSnackbar('Your submission has been approved! 🎉');
        } else if (status === 'rejected' || status === 'needs_revision') {
            CustomSnackBar.warningSnackbar('Your submission needs revision. Check feedback.');
        }

        // Call custom callback
        onReviewed?.(data.submission);
    }, [queryClient, onReviewed]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToSubmissions({
            onCreated: handleCreated,
            onReviewed: handleReviewed
        });

        return () => {
            unsubscribeFromSubmissions();
        };
    }, [enabled, handleCreated, handleReviewed]);
};

export default useSubmissionSocket;
