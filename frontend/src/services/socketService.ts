/**
 * Socket.IO Service for Real-time Communication
 * 
 * Handles WebSocket connections for live session updates.
 * Provides a singleton socket instance and event subscription utilities.
 */

import { io, Socket } from 'socket.io-client';
import config from '../Config/Config';

// Socket instance (singleton)
let socket: Socket | null = null;

// Connection state
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 2000;

// Event listeners registry for cleanup
type EventCallback = (data: any) => void;
const eventListeners: Map<string, Set<EventCallback>> = new Map();

/**
 * Get the WebSocket URL (same as API but without /api/)
 */
const getSocketUrl = (): string => {
    // Use the main base URL (without /api/)
    let url = config.BASE_URL_MAIN || 'http://localhost:5000';

    // Ensure no trailing slash
    url = url.replace(/\/$/, '');

    // For development on Android emulator
    if (url.includes('10.0.2.2')) {
        return url;
    }

    return url;
};

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
    try {
        return localStorage.getItem('skToken');
    } catch {
        return null;
    }
};

/**
 * Connect to the Socket.IO server
 */
export const connectSocket = (): Socket | null => {
    // Return existing connection if available
    if (socket?.connected) {
        console.log('[Socket] Already connected');
        return socket;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        console.log('[Socket] Connection already in progress');
        return socket;
    }

    isConnecting = true;
    const token = getAuthToken();
    const socketUrl = getSocketUrl();

    console.log('[Socket] Connecting to:', socketUrl);

    socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        autoConnect: true
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('[Socket] Connected successfully');
        isConnecting = false;
        reconnectAttempts = 0;
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);

        // If the server closed the connection, attempt to reconnect
        if (reason === 'io server disconnect') {
            socket?.connect();
        }
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        isConnecting = false;
        reconnectAttempts++;

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.warn('[Socket] Max reconnection attempts reached');
        }
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
        reconnectAttempts = 0;
    });

    socket.on('reconnect_error', (error) => {
        console.error('[Socket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
        console.error('[Socket] Reconnection failed after max attempts');
    });

    return socket;
};

/**
 * Disconnect from the Socket.IO server
 */
export const disconnectSocket = (): void => {
    if (socket) {
        console.log('[Socket] Disconnecting...');
        socket.disconnect();
        socket = null;
        isConnecting = false;
        reconnectAttempts = 0;

        // Clear all event listeners
        eventListeners.clear();
    }
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
    return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
    return socket?.connected || false;
};

/**
 * Subscribe to a socket event
 */
export const subscribeToEvent = (event: string, callback: EventCallback): void => {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe - socket not initialized');
        return;
    }

    // Track the listener for cleanup
    if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
    }
    eventListeners.get(event)?.add(callback);

    // Attach the listener
    socket.on(event, callback);
    console.log(`[Socket] Subscribed to: ${event}`);
};

/**
 * Unsubscribe from a socket event
 */
export const unsubscribeFromEvent = (event: string, callback?: EventCallback): void => {
    if (!socket) return;

    if (callback) {
        socket.off(event, callback);
        eventListeners.get(event)?.delete(callback);
    } else {
        // Remove all listeners for this event
        socket.off(event);
        eventListeners.delete(event);
    }
    console.log(`[Socket] Unsubscribed from: ${event}`);
};

/**
 * Subscribe to a specific session room
 */
export const subscribeToSession = (sessionId: string): void => {
    if (!socket?.connected) {
        console.warn('[Socket] Cannot subscribe to session - not connected');
        return;
    }
    socket.emit('session:subscribe', sessionId);
    console.log(`[Socket] Subscribed to session: ${sessionId}`);
};

/**
 * Unsubscribe from a session room
 */
export const unsubscribeFromSession = (sessionId: string): void => {
    if (!socket?.connected) return;
    socket.emit('session:unsubscribe', sessionId);
    console.log(`[Socket] Unsubscribed from session: ${sessionId}`);
};

// ============================================
// Live Session Event Types
// ============================================

export interface SessionStartedData {
    session: {
        _id: string;
        title: string;
        sessionType: 'COURSE' | 'PROJECT' | 'INTERNSHIP';
        referenceName: string;
        hostName: string;
        status: string;
        roomId: string;
        startedAt: string;
        activeParticipantsCount: number;
    };
}

export interface SessionEndedData {
    sessionId: string;
    session?: {
        _id: string;
        status: string;
        endedAt: string;
    };
}

export interface ParticipantUpdateData {
    sessionId: string;
    activeParticipantsCount: number;
    participantName?: string;
}

export interface SessionUpdatedData {
    session: {
        _id: string;
        title: string;
        description?: string;
        sessionType: string;
        scheduledAt: string;
        status: string;
    };
}

// Type for all live session events
export type LiveSessionEventData =
    | SessionStartedData
    | SessionEndedData
    | ParticipantUpdateData
    | SessionUpdatedData;

// Event names for live sessions
export const LIVE_SESSION_EVENTS = {
    STARTED: 'session:started',
    ENDED: 'session:ended',
    CANCELLED: 'session:cancelled',
    PARTICIPANT_JOINED: 'session:participantJoined',
    PARTICIPANT_LEFT: 'session:participantLeft',
    UPDATED: 'session:updated'
} as const;

/**
 * Subscribe to all live session events
 */
export const subscribeToLiveSessions = (callbacks: {
    onSessionStarted?: (data: SessionStartedData) => void;
    onSessionEnded?: (data: SessionEndedData) => void;
    onSessionCancelled?: (data: { sessionId: string }) => void;
    onParticipantJoined?: (data: ParticipantUpdateData) => void;
    onParticipantLeft?: (data: ParticipantUpdateData) => void;
    onSessionUpdated?: (data: SessionUpdatedData) => void;
}): void => {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe to live sessions - socket not initialized');
        connectSocket();
        return;
    }

    if (callbacks.onSessionStarted) {
        subscribeToEvent(LIVE_SESSION_EVENTS.STARTED, callbacks.onSessionStarted);
    }
    if (callbacks.onSessionEnded) {
        subscribeToEvent(LIVE_SESSION_EVENTS.ENDED, callbacks.onSessionEnded);
    }
    if (callbacks.onSessionCancelled) {
        subscribeToEvent(LIVE_SESSION_EVENTS.CANCELLED, callbacks.onSessionCancelled);
    }
    if (callbacks.onParticipantJoined) {
        subscribeToEvent(LIVE_SESSION_EVENTS.PARTICIPANT_JOINED, callbacks.onParticipantJoined);
    }
    if (callbacks.onParticipantLeft) {
        subscribeToEvent(LIVE_SESSION_EVENTS.PARTICIPANT_LEFT, callbacks.onParticipantLeft);
    }
    if (callbacks.onSessionUpdated) {
        subscribeToEvent(LIVE_SESSION_EVENTS.UPDATED, callbacks.onSessionUpdated);
    }
};

/**
 * Unsubscribe from all live session events
 */
export const unsubscribeFromLiveSessions = (): void => {
    Object.values(LIVE_SESSION_EVENTS).forEach(event => {
        unsubscribeFromEvent(event);
    });
};

// ============================================
// Notification Event Types
// ============================================

export interface NotificationData {
    notification: {
        id?: string;
        title: string;
        body: string;
        data?: Record<string, unknown>;
        createdAt: string | Date;
    };
}

export const NOTIFICATION_EVENTS = {
    NEW: 'notification:new'
} as const;

/**
 * Subscribe to real-time notifications
 */
export const subscribeToNotifications = (
    onNotification: (data: NotificationData) => void
): void => {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe to notifications - socket not initialized');
        return;
    }
    subscribeToEvent(NOTIFICATION_EVENTS.NEW, onNotification);
};

/**
 * Unsubscribe from notifications
 */
export const unsubscribeFromNotifications = (): void => {
    unsubscribeFromEvent(NOTIFICATION_EVENTS.NEW);
};

// ============================================
// Device Session Event Types
// ============================================

export interface DeviceRevokedData {
    deviceId: string;
    deviceName?: string;
    message: string;
}

export interface AllDevicesRevokedData {
    exceptDeviceId: string;
    message: string;
}

export const DEVICE_SESSION_EVENTS = {
    REVOKED: 'device:revoked',
    ALL_REVOKED: 'devices:allRevoked'
} as const;

/**
 * Subscribe to device session events (for auto-logout)
 */
export const subscribeToDeviceEvents = (callbacks: {
    onDeviceRevoked?: (data: DeviceRevokedData) => void;
    onAllDevicesRevoked?: (data: AllDevicesRevokedData) => void;
}): void => {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe to device events - socket not initialized');
        return;
    }
    if (callbacks.onDeviceRevoked) {
        subscribeToEvent(DEVICE_SESSION_EVENTS.REVOKED, callbacks.onDeviceRevoked);
    }
    if (callbacks.onAllDevicesRevoked) {
        subscribeToEvent(DEVICE_SESSION_EVENTS.ALL_REVOKED, callbacks.onAllDevicesRevoked);
    }
};

/**
 * Unsubscribe from device session events
 */
export const unsubscribeFromDeviceEvents = (): void => {
    Object.values(DEVICE_SESSION_EVENTS).forEach(event => {
        unsubscribeFromEvent(event);
    });
};

// ============================================
// Announcement Event Types
// ============================================

export interface AnnouncementData {
    announcement: {
        _id: string;
        title: string;
        message: string;
        isActive: boolean;
        createdAt?: string;
        updatedAt?: string;
    };
}

export interface AnnouncementDeletedData {
    id: string;
}

export const ANNOUNCEMENT_EVENTS = {
    NEW: 'announcement:new',
    UPDATED: 'announcement:updated',
    DELETED: 'announcement:deleted'
} as const;

/**
 * Subscribe to announcement events
 */
export const subscribeToAnnouncements = (callbacks: {
    onNew?: (data: AnnouncementData) => void;
    onUpdated?: (data: AnnouncementData) => void;
    onDeleted?: (data: AnnouncementDeletedData) => void;
}): void => {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe to announcements - socket not initialized');
        return;
    }
    if (callbacks.onNew) {
        subscribeToEvent(ANNOUNCEMENT_EVENTS.NEW, callbacks.onNew);
    }
    if (callbacks.onUpdated) {
        subscribeToEvent(ANNOUNCEMENT_EVENTS.UPDATED, callbacks.onUpdated);
    }
    if (callbacks.onDeleted) {
        subscribeToEvent(ANNOUNCEMENT_EVENTS.DELETED, callbacks.onDeleted);
    }
};

/**
 * Unsubscribe from announcement events
 */
export const unsubscribeFromAnnouncements = (): void => {
    Object.values(ANNOUNCEMENT_EVENTS).forEach(event => {
        unsubscribeFromEvent(event);
    });
};

// ============================================
// Call Transfer Event Types
// ============================================

export interface TransferLeavingData {
    deviceId: string;
    sessionId: string;
    sessionTitle: string;
    transferredTo: string;
    message: string;
}

export const TRANSFER_EVENTS = {
    LEAVING: 'transfer:leaving'
} as const;

/**
 * Subscribe to call transfer events (for auto-exit when call is transferred)
 */
export const subscribeToTransferEvents = (callbacks: {
    onTransferLeaving?: (data: TransferLeavingData) => void;
}): void => {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe to transfer events - socket not initialized');
        return;
    }
    if (callbacks.onTransferLeaving) {
        subscribeToEvent(TRANSFER_EVENTS.LEAVING, callbacks.onTransferLeaving);
    }
};

/**
 * Unsubscribe from call transfer events
 */
export const unsubscribeFromTransferEvents = (): void => {
    Object.values(TRANSFER_EVENTS).forEach(event => {
        unsubscribeFromEvent(event);
    });
};
