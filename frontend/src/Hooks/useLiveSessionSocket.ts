/**
 * useLiveSessionSocket Hook
 * 
 * React hook for real-time live session updates via Socket.IO.
 * Automatically connects to socket, subscribes to events, and updates React Query cache.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    connectSocket,
    disconnectSocket,
    subscribeToLiveSessions,
    unsubscribeFromLiveSessions,
    isSocketConnected,
    type SessionStartedData,
    type SessionEndedData,
    type ParticipantUpdateData,
    type SessionUpdatedData
} from '../services/socketService';
import { logger } from '../utils/logger';
import type { LiveSession } from './liveSessions';

interface UseLiveSessionSocketOptions {
    /** Enable/disable the socket connection */
    enabled?: boolean;
    /** Callback when a session starts */
    onSessionStarted?: (data: SessionStartedData) => void;
    /** Callback when a session ends */
    onSessionEnded?: (data: SessionEndedData) => void;
    /** Callback when participant count changes */
    onParticipantUpdate?: (data: ParticipantUpdateData) => void;
}

interface UseLiveSessionSocketReturn {
    /** Whether socket is currently connected */
    isConnected: boolean;
    /** Manually trigger reconnection */
    reconnect: () => void;
}

/**
 * Hook for real-time live session updates
 */
export const useLiveSessionSocket = (
    options: UseLiveSessionSocketOptions = {}
): UseLiveSessionSocketReturn => {
    const { enabled = true, onSessionStarted, onSessionEnded, onParticipantUpdate } = options;
    const queryClient = useQueryClient();
    const isConnectedRef = useRef(false);

    // Update live sessions in cache when session starts
    const handleSessionStarted = useCallback((data: SessionStartedData) => {
        logger.log('[Socket] Session started:', data.session.title);

        // Add the new session to the live sessions cache
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'live', undefined],
            (old) => {
                if (!old) return { sessions: [data.session as unknown as LiveSession] };

                // Check if session already exists
                const exists = old.sessions.some(s => s._id === data.session._id);
                if (exists) return old;

                return {
                    ...old,
                    sessions: [data.session as unknown as LiveSession, ...old.sessions]
                };
            }
        );

        // Also invalidate to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['liveSessions', 'live'] });
        queryClient.invalidateQueries({ queryKey: ['liveSessions', 'upcoming'] });

        // Call custom callback if provided
        onSessionStarted?.(data);
    }, [queryClient, onSessionStarted]);

    // Update live sessions in cache when session ends
    const handleSessionEnded = useCallback((data: SessionEndedData) => {
        logger.log('[Socket] Session ended:', data.sessionId);

        // Remove session from live sessions cache
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'live', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.filter(s => s._id !== data.sessionId)
                };
            }
        );

        // Invalidate history to show the ended session
        queryClient.invalidateQueries({ queryKey: ['liveSessions', 'history'] });

        // Call custom callback if provided
        onSessionEnded?.(data);
    }, [queryClient, onSessionEnded]);

    // Handle session cancellation (similar to ended)
    const handleSessionCancelled = useCallback((data: { sessionId: string }) => {
        logger.log('[Socket] Session cancelled:', data.sessionId);

        // Remove from live sessions
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'live', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.filter(s => s._id !== data.sessionId)
                };
            }
        );

        // Remove from upcoming sessions
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'upcoming', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.filter(s => s._id !== data.sessionId)
                };
            }
        );
    }, [queryClient]);

    // Handle session deletion
    const handleSessionDeleted = useCallback((data: { sessionId: string }) => {
        logger.log('[Socket] Session deleted:', data.sessionId);

        // Remove from all relevant caches (live, upcoming, history, or just invalidate all)
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'live', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.filter(s => s._id !== data.sessionId)
                };
            }
        );

        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'upcoming', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.filter(s => s._id !== data.sessionId)
                };
            }
        );

        queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
    }, [queryClient]);

    // Update participant count in cache
    const handleParticipantJoined = useCallback((data: ParticipantUpdateData) => {
        logger.log('[Socket] Participant joined:', data.participantName, 'Count:', data.activeParticipantsCount);

        // Update the specific session's participant count
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'live', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.map(s =>
                        s._id === data.sessionId
                            ? { ...s, activeParticipantsCount: data.activeParticipantsCount }
                            : s
                    )
                };
            }
        );

        // Call custom callback if provided
        onParticipantUpdate?.(data);
    }, [queryClient, onParticipantUpdate]);

    // Update participant count when someone leaves
    const handleParticipantLeft = useCallback((data: ParticipantUpdateData) => {
        logger.log('[Socket] Participant left:', data.participantName, 'Count:', data.activeParticipantsCount);

        // Update the specific session's participant count
        queryClient.setQueryData<{ sessions: LiveSession[] } | undefined>(
            ['liveSessions', 'live', undefined],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    sessions: old.sessions.map(s =>
                        s._id === data.sessionId
                            ? { ...s, activeParticipantsCount: data.activeParticipantsCount }
                            : s
                    )
                };
            }
        );

        // Call custom callback if provided
        onParticipantUpdate?.(data);
    }, [queryClient, onParticipantUpdate]);

    // Handle session updates (title, time changes)
    const handleSessionUpdated = useCallback((data: SessionUpdatedData) => {
        logger.log('[Socket] Session updated:', data.session.title);

        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
    }, [queryClient]);

    // Reconnect function
    const reconnect = useCallback(() => {
        logger.log('[Socket] Manual reconnect requested');
        disconnectSocket();
        setTimeout(() => {
            connectSocket();
            isConnectedRef.current = isSocketConnected();
        }, 100);
    }, []);

    // Connect and subscribe on mount
    useEffect(() => {
        if (!enabled) {
            return;
        }

        logger.log('[Socket] Initializing live session socket...');

        // Connect to socket
        connectSocket();
        isConnectedRef.current = isSocketConnected();

        // Subscribe to all live session events
        subscribeToLiveSessions({
            onSessionStarted: handleSessionStarted,
            onSessionEnded: handleSessionEnded,
            onSessionCancelled: handleSessionCancelled,
            onSessionDeleted: handleSessionDeleted,
            onParticipantJoined: handleParticipantJoined,
            onParticipantLeft: handleParticipantLeft,
            onSessionUpdated: handleSessionUpdated
        });

        // Cleanup on unmount
        return () => {
            logger.log('[Socket] Cleaning up live session socket...');
            unsubscribeFromLiveSessions();
            // Note: We don't disconnect the socket here because it might be used elsewhere
            // The socket will be disconnected when the user logs out
        };
    }, [enabled, handleSessionStarted, handleSessionEnded, handleSessionCancelled, handleSessionDeleted, handleParticipantJoined, handleParticipantLeft, handleSessionUpdated]);

    return {
        isConnected: isConnectedRef.current,
        reconnect
    };
};

export default useLiveSessionSocket;
