/**
 * useNotificationSocket Hook
 * 
 * React hook for real-time in-app notifications via Socket.IO.
 */

import { useEffect, useCallback } from 'react';
import {
    connectSocket,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    type NotificationData
} from '../services/socketService';
import { logger } from '../utils/logger';

interface UseNotificationSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** Callback when a notification is received */
    onNotification?: (notification: NotificationData['notification']) => void;
}

/**
 * Hook for real-time in-app notifications
 */
export const useNotificationSocket = (
    options: UseNotificationSocketOptions = {}
): void => {
    const { enabled = true, onNotification } = options;

    const handleNotification = useCallback((data: NotificationData) => {
        logger.log('[Socket] In-app notification received:', data.notification.title);
        onNotification?.(data.notification);
    }, [onNotification]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToNotifications(handleNotification);

        return () => {
            unsubscribeFromNotifications();
        };
    }, [enabled, handleNotification]);
};

export default useNotificationSocket;
