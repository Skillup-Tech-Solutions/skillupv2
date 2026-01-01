/**
 * useActiveSession Hook
 * 
 * Checks if the current user has an active live session on another device.
 * Used for device-to-device call transfer feature.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { callApi } from '../api/apiService';
import { apiUrls } from '../api/apiUrl';
import { getDeviceId, getPlatform } from '../utils/deviceInfo';
import type { LiveSession } from './liveSessions';
import type { ApiResponse } from '../Interface/interface';
import {
    subscribeToActiveSessionChanges,
    unsubscribeFromActiveSessionChanges,
    type ActiveSessionChangedData
} from '../services/socketService';
import { logger } from '../utils/logger';

interface ActiveSessionResponse extends ApiResponse {
    status: boolean;
    success: boolean;
    hasActiveSession: boolean;
    session: LiveSession | null;
    activeOnDevice: {
        deviceId: string;
        platform: 'android' | 'ios' | 'web';
        joinedAt: string;
    } | null;
    isCurrentDevice?: boolean;
}

interface TransferResponse extends ApiResponse {
    session: LiveSession;
    roomId: string;
    transferredFrom: {
        deviceId: string;
        platform: string;
    };
}

/**
 * Hook to check for active sessions on other devices
 */
export const useActiveSession = (enabled: boolean = true) => {
    const currentDeviceId = getDeviceId();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled) return;

        const handleActiveSessionChange = (data: ActiveSessionChangedData) => {
            logger.log('[useActiveSession] Received socket update:', data);

            // Format data to match ActiveSessionResponse and satisfy ApiResponse
            const newResponse: ActiveSessionResponse = {
                status: true,
                success: true,
                hasActiveSession: data.hasActiveSession,
                session: data.session,
                activeOnDevice: data.activeOnDevice ? {
                    ...data.activeOnDevice,
                    joinedAt: new Date().toISOString(), // Use current time for socket updates
                    platform: data.activeOnDevice.platform as any
                } : null,
                data: null // satisfying ApiResponse
            };

            // Update the cache directly
            queryClient.setQueryData(['activeSession', 'my'], newResponse);
        };

        subscribeToActiveSessionChanges(handleActiveSessionChange);

        return () => {
            unsubscribeFromActiveSessionChanges(handleActiveSessionChange);
        };
    }, [enabled, queryClient]);

    return useQuery<ActiveSessionResponse>({
        queryKey: ['activeSession', 'my'],
        queryFn: async () => {
            const response = await callApi(`${apiUrls.liveSessions}/my-active`, 'GET');
            return response as ActiveSessionResponse;
        },
        enabled,
        staleTime: 60000, // Consider data fresh for longer since socket updates it
        select: (data) => {
            // Filter out if the active session is on THIS device
            if (data.hasActiveSession && data.activeOnDevice?.deviceId === currentDeviceId) {
                return {
                    ...data,
                    hasActiveSession: false,
                    isCurrentDevice: true
                };
            }
            return data;
        }
    });
};

/**
 * Hook to request transfer of session to this device
 */
export const useRequestTransferHere = () => {
    const queryClient = useQueryClient();
    const deviceId = getDeviceId();
    const platform = getPlatform();

    return useMutation<TransferResponse, Error, string>({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}/transfer/here`, 'POST', {
                deviceId,
                platform
            });
            return response as TransferResponse;
        },
        onSuccess: () => {
            // Invalidate active session query
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
        }
    });
};
