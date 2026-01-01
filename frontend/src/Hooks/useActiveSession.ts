/**
 * useActiveSession Hook
 * 
 * Checks if the current user has an active live session on another device.
 * Used for device-to-device call transfer feature.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../api/apiService';
import { apiUrls } from '../api/apiUrl';
import { getDeviceId, getPlatform } from '../utils/deviceInfo';
import type { LiveSession } from './liveSessions';
import type { ApiResponse } from '../Interface/interface';

interface ActiveSessionResponse extends ApiResponse {
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

    return useQuery<ActiveSessionResponse>({
        queryKey: ['activeSession', 'my'],
        queryFn: async () => {
            const response = await callApi(`${apiUrls.liveSessions}/my-active`, 'GET');
            return response as ActiveSessionResponse;
        },
        enabled,
        refetchInterval: 30000, // Check every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
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
