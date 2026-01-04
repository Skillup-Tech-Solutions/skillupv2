/**
 * usePaymentSocket Hook
 * 
 * Real-time payment status updates via Socket.IO.
 * Notifies students when their payment is confirmed.
 * Notifies admins when payment proof is uploaded.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    subscribeToPayments,
    unsubscribeFromPayments,
    type PaymentStatusChangedData,
    type PaymentUpdatedData,
    type PaymentProofUploadedData
} from '../services/socketService';
import { logger } from '../utils/logger';
import CustomSnackBar from '../Custom/CustomSnackBar';

interface UsePaymentSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** User role - affects which notifications are shown */
    role?: 'student' | 'admin' | 'staff';
}

/**
 * Hook for real-time payment status updates
 */
export const usePaymentSocket = (
    options: UsePaymentSocketOptions = {}
): void => {
    const { enabled = true, role = 'student' } = options;
    const queryClient = useQueryClient();

    // Called when student's payment is confirmed by admin
    const handleStatusChanged = useCallback((data: PaymentStatusChangedData) => {
        logger.log('[Socket] Payment status changed:', data.paymentStatus);

        // Refresh student's course/project/internship lists
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-projects'] });
        queryClient.invalidateQueries({ queryKey: ['my-internships'] });

        // Show notification for students
        if (role === 'student' && data.paymentStatus === 'paid') {
            CustomSnackBar.successSnackbar('Payment confirmed! You now have full access. 🎉');
        }
    }, [queryClient, role]);

    // Called when any payment is updated (for admin view)
    const handleUpdated = useCallback((data: PaymentUpdatedData) => {
        logger.log('[Socket] Payment updated (admin):', data.assignment._id);

        // Refresh admin payment lists
        queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['course-assignments'] });
        queryClient.invalidateQueries({ queryKey: ['project-requirements'] });
        queryClient.invalidateQueries({ queryKey: ['internship-assignments'] });
    }, [queryClient]);

    // Called when a student uploads payment proof
    const handleProofUploaded = useCallback((data: PaymentProofUploadedData) => {
        logger.log('[Socket] Payment proof uploaded:', data.assignment._id);

        // Refresh admin pending payments
        queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });

        // Notify admin
        if (role === 'admin' || role === 'staff') {
            CustomSnackBar.infoSnackbar('New payment proof uploaded - awaiting verification');
        }
    }, [queryClient, role]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToPayments({
            onStatusChanged: handleStatusChanged,
            onUpdated: handleUpdated,
            onProofUploaded: handleProofUploaded
        });

        return () => {
            unsubscribeFromPayments();
        };
    }, [enabled, handleStatusChanged, handleUpdated, handleProofUploaded]);
};

export default usePaymentSocket;
