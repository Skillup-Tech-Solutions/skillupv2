/**
 * useDeviceSessionSocket Hook
 * 
 * React hook for handling device session revocation via Socket.IO.
 * Automatically logs out the user when their device session is revoked.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    connectSocket,
    subscribeToDeviceEvents,
    unsubscribeFromDeviceEvents,
    type DeviceRevokedData,
    type AllDevicesRevokedData
} from '../services/socketService';
import { getFromStorage } from '../utils/pwaUtils';

interface UseDeviceSessionSocketOptions {
    /** Enable/disable the socket subscription */
    enabled?: boolean;
    /** Custom callback when device is revoked (before logout) */
    onRevoked?: (message: string) => void;
}

/**
 * Hook for handling remote device logout
 */
export const useDeviceSessionSocket = (
    options: UseDeviceSessionSocketOptions = {}
): void => {
    const { enabled = true, onRevoked } = options;
    const navigate = useNavigate();

    // Get current device ID from storage
    const currentDeviceId = getFromStorage('deviceId');

    const handleLogout = useCallback((message: string) => {
        console.log('[Socket] Device revoked, logging out:', message);

        // Call custom callback if provided
        onRevoked?.(message);

        // Clear storage and redirect to login
        localStorage.clear();
        navigate('/login', {
            replace: true,
            state: { message: 'Your session was terminated from another device' }
        });
    }, [navigate, onRevoked]);

    const handleDeviceRevoked = useCallback((data: DeviceRevokedData) => {
        // Check if this device was revoked
        if (data.deviceId === currentDeviceId) {
            handleLogout(data.message);
        }
    }, [currentDeviceId, handleLogout]);

    const handleAllDevicesRevoked = useCallback((data: AllDevicesRevokedData) => {
        // If current device is NOT the exception, log out
        if (data.exceptDeviceId !== currentDeviceId) {
            handleLogout(data.message);
        }
    }, [currentDeviceId, handleLogout]);

    useEffect(() => {
        if (!enabled) return;

        connectSocket();
        subscribeToDeviceEvents({
            onDeviceRevoked: handleDeviceRevoked,
            onAllDevicesRevoked: handleAllDevicesRevoked
        });

        return () => {
            unsubscribeFromDeviceEvents();
        };
    }, [enabled, handleDeviceRevoked, handleAllDevicesRevoked]);
};

export default useDeviceSessionSocket;
