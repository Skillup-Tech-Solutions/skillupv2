/**
 * Socket.IO Service for Real-time Communication
 * 
 * Handles WebSocket connections for live session updates.
 * Events:
 * - session:started - When a session goes LIVE
 * - session:ended - When a session ends
 * - session:cancelled - When a session is cancelled
 * - session:participantJoined - When someone joins
 * - session:participantLeft - When someone leaves
 * - session:updated - When session details change
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let io = null;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {http.Server} server - HTTP server instance
 */
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:4173',
                'http://localhost:3000',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:4173',
                // Capacitor native app origins
                'https://localhost',
                'capacitor://localhost',
                'ionic://localhost'
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            console.log('[Socket] Connection without token - allowing for public updates');
            socket.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            console.log(`[Socket] Authenticated user: ${decoded.email}`);
            next();
        } catch (err) {
            console.log('[Socket] Invalid token - rejecting connection');
            return next(new Error("Authentication error"));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.user?.id || 'anonymous';
        console.log(`[Socket] Client connected: ${socket.id} (user: ${userId})`);

        // Join user-specific room if authenticated
        if (socket.user) {
            const rawId = socket.user.id || socket.user._id;
            if (rawId) {
                // 1. Join raw ID room
                socket.join(`user:${rawId}`);

                // 2. Join hashed ID room (used for live session tracking)
                const hashedId = crypto.createHash('md5')
                    .update(socket.user.email || rawId)
                    .digest('hex')
                    .substring(0, 16);

                socket.join(`user:${hashedId}`);
                console.log(`[Socket] User ${socket.user.email} joined rooms: user:${rawId}, user:${hashedId}`);

                // 3. Join 'admins' room if user is admin/employee
                if (socket.user.role && ['admin', 'employee', 'superadmin'].includes(socket.user.role)) {
                    socket.join('admins');
                    console.log(`[Socket] User ${socket.user.email} joined room: admins`);
                }
            }
        }

        // Join live sessions room for all session updates
        socket.join('live-sessions');

        // Handle room subscriptions for specific sessions
        socket.on('session:subscribe', (sessionId) => {
            socket.join(`session:${sessionId}`);
            console.log(`[Socket] ${socket.id} subscribed to session: ${sessionId}`);
        });

        socket.on('session:unsubscribe', (sessionId) => {
            socket.leave(`session:${sessionId}`);
            console.log(`[Socket] ${socket.id} unsubscribed from session: ${sessionId}`);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] Client disconnected: ${socket.id} (reason: ${reason})`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`[Socket] Error for ${socket.id}:`, error);
        });
    });

    console.log('[Socket] Socket.IO initialized');
    return io;
};

/**
 * Get the Socket.IO instance
 * @returns {Server|null}
 */
const getIO = () => {
    if (!io) {
        console.warn('[Socket] Socket.IO not initialized');
    }
    return io;
};

/**
 * Emit event to all clients in live-sessions room
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToAll = (event, data) => {
    if (!io) {
        console.warn('[Socket] Cannot emit - Socket.IO not initialized');
        return;
    }
    io.emit(event, data);
    console.log(`[Socket] Emitted ${event} to all clients`);
};

/**
 * Emit event to admins only
 * Use for operational data (Pending payments, new submissions)
 */
const emitToAdmins = (event, data) => {
    if (!io) {
        console.warn('[Socket] Cannot emit - Socket.IO not initialized');
        return;
    }
    io.to('admins').emit(event, data);
    console.log(`[Socket] Emitted ${event} to admins`);
};

/**
 * Emit event to a specific session room
 * @param {string} sessionId - Session ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToSession = (sessionId, event, data) => {
    if (!io) {
        console.warn('[Socket] Cannot emit - Socket.IO not initialized');
        return;
    }
    io.to(`session:${sessionId}`).emit(event, data);
    console.log(`[Socket] Emitted ${event} to session: ${sessionId}`);
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToUser = (userId, event, data) => {
    if (!io) {
        console.warn('[Socket] Cannot emit - Socket.IO not initialized');
        return;
    }
    io.to(`user:${userId}`).emit(event, data);
    console.log(`[Socket] Emitted ${event} to user: ${userId}`);
};

// ============================================
// Live Session Event Emitters
// ============================================

/**
 * Emit when a session starts (goes LIVE)
 */
const emitSessionStarted = (session) => {
    emitToAll('session:started', {
        session: {
            _id: session._id,
            title: session.title,
            sessionType: session.sessionType,
            referenceName: session.referenceName,
            hostName: session.hostName,
            status: session.status,
            roomId: session.roomId,
            startedAt: session.startedAt,
            activeParticipantsCount: 0
        }
    });
};

/**
 * Emit when a session ends
 */
const emitSessionEnded = (sessionId, session = null) => {
    emitToAll('session:ended', {
        sessionId,
        session: session ? {
            _id: session._id,
            status: session.status,
            endedAt: session.endedAt
        } : null
    });
    // Also emit to session-specific room
    emitToSession(sessionId, 'session:ended', { sessionId });
};

/**
 * Emit when a session is cancelled
 */
const emitSessionCancelled = (sessionId) => {
    emitToAll('session:cancelled', { sessionId });
    emitToSession(sessionId, 'session:cancelled', { sessionId });
};

const emitSessionDeleted = (sessionId) => {
    emitToAll('session:deleted', { sessionId });
    // Also notify session room just in case
    emitToSession(sessionId, 'session:deleted', { sessionId });
};

/**
 * Emit when a participant joins
 */
const emitParticipantJoined = (sessionId, activeCount, participantName = null) => {
    const data = {
        sessionId,
        activeParticipantsCount: activeCount,
        participantName
    };
    emitToAll('session:participantJoined', data);
    emitToSession(sessionId, 'session:participantJoined', data);
};

/**
 * Emit when a participant leaves
 */
const emitParticipantLeft = (sessionId, activeCount, participantName = null) => {
    const data = {
        sessionId,
        activeParticipantsCount: activeCount,
        participantName
    };
    emitToAll('session:participantLeft', data);
    emitToSession(sessionId, 'session:participantLeft', data);
};

/**
 * Emit when session details are updated
 */
const emitSessionUpdated = (session) => {
    emitToAll('session:updated', {
        session: {
            _id: session._id,
            title: session.title,
            description: session.description,
            sessionType: session.sessionType,
            scheduledAt: session.scheduledAt,
            status: session.status
        }
    });
};

// ============================================
// Notification Event Emitters
// ============================================

/**
 * Emit real-time in-app notification to specific user
 */
const emitNotification = (userId, notification) => {
    emitToUser(userId, 'notification:new', {
        notification: {
            id: notification.id || notification._id,
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            createdAt: notification.createdAt || new Date()
        }
    });
};

/**
 * Emit notification to all connected users
 */
const emitNotificationToAll = (notification) => {
    emitToAll('notification:new', {
        notification: {
            id: notification.id || notification._id,
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            createdAt: notification.createdAt || new Date()
        }
    });
};

// ============================================
// Device Session Event Emitters
// ============================================

/**
 * Emit when a device session is revoked (force logout)
 */
const emitDeviceRevoked = (userId, deviceId, deviceName = null) => {
    emitToUser(userId, 'device:revoked', {
        deviceId,
        deviceName,
        message: 'Your session has been terminated from another device'
    });
};

/**
 * Emit when all devices except one are revoked
 */
const emitAllDevicesRevoked = (userId, exceptDeviceId) => {
    emitToUser(userId, 'devices:allRevoked', {
        exceptDeviceId,
        message: 'All other devices have been logged out'
    });
};

// ============================================
// Announcement Event Emitters
// ============================================

/**
 * Emit when a new announcement is created
 */
const emitAnnouncementCreated = (announcement) => {
    emitToAll('announcement:new', {
        announcement: {
            _id: announcement._id,
            title: announcement.title,
            message: announcement.message,
            isActive: announcement.isActive,
            createdAt: announcement.createdAt
        }
    });
};

/**
 * Emit when an announcement is updated
 */
const emitAnnouncementUpdated = (announcement) => {
    emitToAll('announcement:updated', {
        announcement: {
            _id: announcement._id,
            title: announcement.title,
            message: announcement.message,
            isActive: announcement.isActive,
            updatedAt: announcement.updatedAt
        }
    });
};

/**
 * Emit when an announcement is deleted
 */
const emitAnnouncementDeleted = (announcementId) => {
    emitToAll('announcement:deleted', { id: announcementId });
};

// ============================================
// Call Transfer Event Emitters
// ============================================

/**
 * Emit when a call is being transferred away from a device
 * This tells the old device to exit the VideoRoom
 */
const emitTransferLeaving = (userId, deviceId, data) => {
    console.log(`[Socket] Emitting transfer:leaving to user: ${userId}, deviceId: ${deviceId}`);
    emitToUser(userId, 'transfer:leaving', {
        deviceId,
        sessionId: data.sessionId,
        sessionTitle: data.sessionTitle,
        transferredTo: data.transferredTo,
        message: `Session transferred to ${data.transferredTo}`
    });
};

/**
 * Emit when a user's active session status changes
 * This notifies all the user's connected devices about their session status
 */
const emitActiveSessionChanged = (userId, data) => {
    console.log(`[Socket] Emitting session:active-changed to user: ${userId} (Room: user:${userId})`);
    emitToUser(userId, 'session:active-changed', {
        hasActiveSession: data.hasActiveSession,
        session: data.session || null,
        activeOnDevice: data.activeOnDevice || null
    });
};

// ============================================
// Dashboard Event Emitters
// ============================================

/**
 * Emit when dashboard stats should be refreshed
 */
const emitDashboardUpdate = (data) => {
    emitToAll('dashboard:updated', {
        type: data.type || 'general',
        action: data.action || 'updated',
        timestamp: new Date()
    });
};

// ============================================
// Course/Program Event Emitters
// ============================================

/**
 * Emit when a course is created
 */
const emitCourseCreated = (course) => {
    emitToAll('course:created', {
        course: {
            _id: course._id,
            name: course.name,
            status: course.status,
            startDate: course.startDate,
            endDate: course.endDate
        }
    });
};

/**
 * Emit when a course is updated
 */
const emitCourseUpdated = (course) => {
    emitToAll('course:updated', {
        course: {
            _id: course._id,
            name: course.name,
            status: course.status,
            startDate: course.startDate,
            endDate: course.endDate
        }
    });
};

/**
 * Emit when a course is deleted
 */
const emitCourseDeleted = (courseId) => {
    emitToAll('course:deleted', { courseId });
};

// ============================================
// Submission Event Emitters
// ============================================

/**
 * Emit when a new submission is created
 */
const emitSubmissionCreated = (submission, studentId) => {
    // Broadcast to admin/staff (for pending submissions list)
    emitToAdmins('submission:created', {
        submission: {
            _id: submission._id,
            projectId: submission.project,
            status: submission.status,
            createdAt: submission.createdAt
        }
    });
    // Also notify the specific student
    if (studentId) {
        emitToUser(studentId, 'submission:created', {
            submission: {
                _id: submission._id,
                status: submission.status
            }
        });
    }
};

/**
 * Emit when a submission is reviewed (approved/rejected)
 */
const emitSubmissionReviewed = (submission, studentId) => {
    if (studentId) {
        emitToUser(studentId, 'submission:reviewed', {
            submission: {
                _id: submission._id,
                projectId: submission.project,
                status: submission.status,
                feedback: submission.feedback
            }
        });
    }
    // Also broadcast to admins
    emitToAdmins('submission:reviewed', {
        submission: {
            _id: submission._id,
            status: submission.status
        }
    });
};

// ============================================
// Payment Event Emitters
// ============================================

/**
 * Emit when a payment status changes (for student notification)
 */
const emitPaymentStatusChanged = (assignment, studentId) => {
    // Notify the student about their payment status
    if (studentId) {
        emitToUser(studentId, 'payment:statusChanged', {
            assignmentId: assignment._id,
            paymentStatus: assignment.paymentStatus,
            itemType: assignment.itemType,
            itemId: assignment.itemId
        });
    }
    // Broadcast to admin dashboard
    emitToAdmins('payment:updated', {
        assignment: {
            _id: assignment._id,
            paymentStatus: assignment.paymentStatus,
            itemType: assignment.itemType
        }
    });
};

/**
 * Emit when a payment proof is uploaded (for admin notification)
 */
const emitPaymentProofUploaded = (assignment, studentId) => {
    emitToAdmins('payment:proofUploaded', {
        assignment: {
            _id: assignment._id,
            paymentStatus: assignment.paymentStatus,
            itemType: assignment.itemType,
            studentId: studentId
        }
    });
};

// ============================================
// Assignment Event Emitters
// ============================================

/**
 * Emit when a student is assigned to a course/project/internship
 */
const emitAssignmentCreated = (assignment, studentId) => {
    if (studentId) {
        emitToUser(studentId, 'assignment:created', {
            assignment: {
                _id: assignment._id,
                itemType: assignment.itemType,
                itemId: assignment.itemId,
                status: assignment.status
            }
        });
    }
    // Broadcast to admins
    emitToAdmins('assignment:created', {
        assignment: {
            _id: assignment._id,
            itemType: assignment.itemType,
            studentId: studentId
        }
    });
};

/**
 * Emit when an assignment is updated
 */
const emitAssignmentUpdated = (assignment, studentId) => {
    if (studentId) {
        emitToUser(studentId, 'assignment:updated', {
            assignment: {
                _id: assignment._id,
                itemType: assignment.itemType,
                status: assignment.status,
                paymentStatus: assignment.paymentStatus
            }
        });
    }
};

/**
 * Emit when an assignment is deleted
 */
const emitAssignmentDeleted = (assignmentId, studentId) => {
    if (studentId) {
        emitToUser(studentId, 'assignment:deleted', { assignmentId });
    }
    // Broadcast to admins
    emitToAdmins('assignment:deleted', { assignmentId, studentId });
};

module.exports = {
    initSocket,
    getIO,
    emitToAll,
    emitToAdmins,
    emitToSession,
    emitToUser,
    // Live Sessions
    emitSessionStarted,
    emitSessionEnded,
    emitSessionEnded,
    emitSessionCancelled,
    emitSessionDeleted,
    emitParticipantJoined,
    emitParticipantLeft,
    emitSessionUpdated,
    // Notifications
    emitNotification,
    emitNotificationToAll,
    // Device Sessions
    emitDeviceRevoked,
    emitAllDevicesRevoked,
    // Announcements
    emitAnnouncementCreated,
    emitAnnouncementUpdated,
    emitAnnouncementDeleted,
    // Call Transfer
    emitTransferLeaving,
    emitActiveSessionChanged,
    // Dashboard
    emitDashboardUpdate,
    // Courses
    emitCourseCreated,
    emitCourseUpdated,
    emitCourseDeleted,
    // Submissions
    emitSubmissionCreated,
    emitSubmissionReviewed,
    // Payments
    emitPaymentStatusChanged,
    emitPaymentProofUploaded,
    // Assignments
    emitAssignmentCreated,
    emitAssignmentUpdated,
    emitAssignmentDeleted
};
