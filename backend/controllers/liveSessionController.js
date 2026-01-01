const LiveSession = require("../models/LiveSession");
const Course = require("../models/Course");
const Project = require("../models/Project");
const Internship = require("../models/Internship");
const {
    emitSessionStarted,
    emitSessionEnded,
    emitSessionCancelled,
    emitParticipantJoined,
    emitParticipantLeft,
    emitSessionUpdated,
    emitTransferLeaving,
    emitActiveSessionChanged
} = require("../services/socketService");
const pushNotificationService = require("../services/pushNotificationService");

// Get reference model based on session type
const getReferenceModel = (sessionType) => {
    switch (sessionType) {
        case "COURSE": return Course;
        case "PROJECT": return Project;
        case "INTERNSHIP": return Internship;
        default: return null;
    }
};

// Enrich session with active participants count
const enrichSession = (session) => {
    if (!session) return null;
    const sessionObj = session.toObject ? session.toObject() : session;
    sessionObj.activeParticipantsCount = (session.participants || []).filter(p => !p.leftAt).length;
    return sessionObj;
};

// Create a new live session
exports.createSession = async (req, res) => {
    try {
        const { title, description, sessionType, referenceId, scheduledAt, durationMinutes } = req.body;

        // Validate reference exists
        const Model = getReferenceModel(sessionType);
        if (!Model) {
            return res.status(400).json({ error: "Invalid session type" });
        }

        const reference = await Model.findById(referenceId);
        if (!reference) {
            return res.status(404).json({ error: `${sessionType} not found` });
        }

        const hostId = req.user?._id || req.user?.id;
        const hostName = req.user?.name || req.user?.email || "Host";

        const session = new LiveSession({
            title,
            description,
            sessionType,
            referenceId,
            referenceName: reference.name || reference.title || "",
            hostId,
            hostName,
            scheduledAt: new Date(scheduledAt),
            durationMinutes: durationMinutes || 60,
            status: "SCHEDULED"
        });

        await session.save();

        res.status(201).json({
            success: true,
            message: "Live session scheduled successfully",
            session
        });
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get all sessions with optional filters
exports.getSessions = async (req, res) => {
    try {
        const { sessionType, referenceId, status, includeEnded } = req.query;

        const filter = {};

        if (sessionType) filter.sessionType = sessionType;
        if (referenceId) filter.referenceId = referenceId;
        if (status) filter.status = status;

        // By default, exclude ended sessions unless specifically requested
        if (includeEnded !== 'true' && !status) {
            filter.status = { $ne: "ENDED" };
        }

        const sessions = await LiveSession.find(filter)
            .sort({ scheduledAt: -1 })
            .limit(100);

        res.json({ success: true, sessions: sessions.map(enrichSession) });
    } catch (error) {
        console.error("Error getting sessions:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get session history (ended sessions) - accessible by all authenticated users
exports.getSessionHistory = async (req, res) => {
    try {
        const { sessionType, referenceId, limit = 50 } = req.query;

        const filter = { status: "ENDED" };

        if (sessionType) filter.sessionType = sessionType;
        if (referenceId) filter.referenceId = referenceId;

        const sessions = await LiveSession.find(filter)
            .sort({ endedAt: -1, scheduledAt: -1 })
            .limit(parseInt(limit));

        res.json({ success: true, sessions: sessions.map(enrichSession) });
    } catch (error) {
        console.error("Error getting session history:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get sessions for a specific reference (course/project/internship)
exports.getSessionsByReference = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { includeEnded } = req.query;

        const filter = {
            sessionType: type.toUpperCase(),
            referenceId: id
        };

        if (includeEnded !== 'true') {
            filter.status = { $ne: "ENDED" };
        }

        const sessions = await LiveSession.find(filter)
            .sort({ scheduledAt: -1 });

        res.json({ success: true, sessions: sessions.map(enrichSession) });
    } catch (error) {
        console.error("Error getting sessions by reference:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single session by ID
exports.getSession = async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json({ success: true, session: enrichSession(session) });
    } catch (error) {
        console.error("Error getting session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get currently live sessions
exports.getLiveSessions = async (req, res) => {
    try {
        const { sessionType, referenceId } = req.query;

        const filter = { status: "LIVE" };
        if (sessionType) filter.sessionType = sessionType;
        if (referenceId) filter.referenceId = referenceId;

        const sessions = await LiveSession.find(filter)
            .sort({ startedAt: -1 });

        res.json({ success: true, sessions: sessions.map(enrichSession) });
    } catch (error) {
        console.error("Error getting live sessions:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get upcoming sessions
exports.getUpcomingSessions = async (req, res) => {
    try {
        const { sessionType, referenceId } = req.query;

        const filter = {
            status: "SCHEDULED",
            scheduledAt: { $gte: new Date() }
        };

        if (sessionType) filter.sessionType = sessionType;
        if (referenceId) filter.referenceId = referenceId;

        const sessions = await LiveSession.find(filter)
            .sort({ scheduledAt: 1 });

        res.json({ success: true, sessions });
    } catch (error) {
        console.error("Error getting upcoming sessions:", error);
        res.status(500).json({ error: error.message });
    }
};

// Start a session (change status to LIVE)
exports.startSession = async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status !== "SCHEDULED") {
            return res.status(400).json({ error: `Cannot start session with status: ${session.status}` });
        }

        session.status = "LIVE";
        session.startedAt = new Date();
        await session.save();

        // Emit socket event for real-time update
        emitSessionStarted(session);

        // Send push notification to everyone
        await pushNotificationService.sendNotification({
            title: "🔴 Session Live Now",
            body: `"${session.title}" has started. Join now!`,
            target: 'all',
            data: {
                type: 'live_session_started',
                sessionId: session._id.toString(),
                priority: 'alert'
            }
        }).catch(err => console.error("Session start push error:", err));

        res.json({
            success: true,
            message: "Session started successfully",
            session
        });
    } catch (error) {
        console.error("Error starting session:", error);
        res.status(500).json({ error: error.message });
    }
};

// End a session
exports.endSession = async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status !== "LIVE") {
            return res.status(400).json({ error: `Cannot end session with status: ${session.status}` });
        }

        session.status = "ENDED";
        session.endedAt = new Date();

        // Mark all active participants as left
        session.participants.forEach(p => {
            if (!p.leftAt) {
                p.leftAt = new Date();
            }
        });

        // Calculate max participants
        const activeCount = session.participants.filter(p => !p.leftAt).length;
        if (activeCount > session.maxParticipants) {
            session.maxParticipants = activeCount;
        }

        await session.save();

        // Emit socket event for real-time update
        emitSessionEnded(session._id, session);

        // Send push notification to everyone
        await pushNotificationService.sendNotification({
            title: "🏁 Session Ended",
            body: `"${session.title}" has concluded. Thank you for attending!`,
            target: 'all',
            data: {
                type: 'live_session_ended',
                sessionId: session._id.toString(),
                priority: 'update'
            }
        }).catch(err => console.error("Session end push error:", err));

        res.json({
            success: true,
            message: "Session ended successfully",
            session
        });
    } catch (error) {
        console.error("Error ending session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Cancel a session
exports.cancelSession = async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status === "ENDED") {
            return res.status(400).json({ error: "Cannot cancel an ended session" });
        }

        session.status = "CANCELLED";
        await session.save();

        // Emit socket event for real-time update
        emitSessionCancelled(session._id);

        res.json({
            success: true,
            message: "Session cancelled successfully",
            session
        });
    } catch (error) {
        console.error("Error cancelling session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a session
exports.deleteSession = async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status === "LIVE") {
            return res.status(400).json({ error: "Cannot delete a live session. End it first." });
        }

        await LiveSession.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Session deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update session details
exports.updateSession = async (req, res) => {
    try {
        const { title, description, scheduledAt, durationMinutes } = req.body;
        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status !== "SCHEDULED") {
            return res.status(400).json({ error: "Can only update scheduled sessions" });
        }

        if (title) session.title = title;
        if (description !== undefined) session.description = description;
        if (scheduledAt) session.scheduledAt = new Date(scheduledAt);
        if (durationMinutes) session.durationMinutes = durationMinutes;

        await session.save();

        // Emit socket event for real-time update
        emitSessionUpdated(session);

        res.json({
            success: true,
            message: "Session updated successfully",
            session
        });
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Join session (track participant) - Requires authentication
exports.joinSession = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Authentication required to join session" });
        }

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status !== "LIVE") {
            return res.status(400).json({ error: "Session is not live" });
        }

        // Generate unique userId (consistent across sessions for the same user)
        const crypto = require("crypto");
        const userId = crypto.createHash('md5')
            .update(req.user.email || req.user.id)
            .digest('hex')
            .substring(0, 16);

        // Check if user already joined (prevent duplicates)
        // Only return alreadyActive if their last entry HAS NOT left yet
        const existingParticipant = session.participants.find(
            p => p.userId === userId && !p.leftAt
        );

        if (existingParticipant) {
            return res.json({
                success: true,
                session: enrichSession(session),
                roomId: session.roomId,
                alreadyActive: true,
                message: "User is already active in this session"
            });
        }

        // Clean up any historical "stale" records for this specific user in this session
        // (Just in case they crashed and are rejoining)
        session.participants.forEach(p => {
            if (p.userId === userId && !p.leftAt) {
                p.leftAt = new Date();
            }
        });

        const participant = {
            userId: userId,
            name: req.user?.name || req.body.name || "Guest",
            email: req.user?.email || req.body.email || "",
            deviceId: req.body.deviceId || "unknown",
            platform: req.body.platform || "web",
            joinedAt: new Date()
        };

        session.participants.push(participant);

        // Update max participants during live session
        const currentActive = session.participants.filter(p => !p.leftAt).length;
        if (currentActive > session.maxParticipants) {
            session.maxParticipants = currentActive;
        }

        await session.save();

        // Emit socket event for real-time participant count update
        const activeCount = session.participants.filter(p => !p.leftAt).length;
        emitParticipantJoined(session._id.toString(), activeCount, participant.name);

        // Emit to all user's devices about their active session
        emitActiveSessionChanged(userId, {
            hasActiveSession: true,
            session: enrichSession(session),
            activeOnDevice: {
                deviceId: participant.deviceId,
                platform: participant.platform
            }
        });

        res.json({
            status: true,
            success: true,
            session: enrichSession(session),
            roomId: session.roomId
        });
    } catch (error) {
        console.error("Error joining session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Leave session (track participant exit)
exports.leaveSession = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const session = await LiveSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        const crypto = require("crypto");
        const userId = crypto.createHash('md5')
            .update(req.user.email || req.user.id)
            .digest('hex')
            .substring(0, 16);

        // Find the active participant entry for this user
        const participantIndex = session.participants.findIndex(
            p => p.userId === userId && !p.leftAt
        );

        if (participantIndex !== -1) {
            const participantName = session.participants[participantIndex].name;
            session.participants[participantIndex].leftAt = new Date();
            await session.save();

            // Emit socket event for real-time participant count update
            const activeCount = session.participants.filter(p => !p.leftAt).length;
            emitParticipantLeft(session._id.toString(), activeCount, participantName);

            // Emit to all user's devices that they no longer have an active session
            emitActiveSessionChanged(userId, {
                hasActiveSession: false,
                session: null,
                activeOnDevice: null
            });
        }

        res.json({
            success: true,
            message: "Successfully left session"
        });
    } catch (error) {
        console.error("Error leaving session:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// Device Transfer Feature
// ============================================

// Get user's active session (if any) - for detecting ongoing meetings on other devices
exports.getMyActiveSession = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const crypto = require("crypto");
        const userId = crypto.createHash('md5')
            .update(req.user.email || req.user.id)
            .digest('hex')
            .substring(0, 16);

        // Find any LIVE session where this user is an active participant
        const sessions = await LiveSession.find({
            status: "LIVE",
            "participants.userId": userId,
            "participants.leftAt": null
        });

        // Filter to find sessions where user is truly active (no leftAt)
        let activeSession = null;
        let activeOnDevice = null;

        for (const session of sessions) {
            const participant = session.participants.find(
                p => p.userId === userId && !p.leftAt
            );
            if (participant) {
                activeSession = enrichSession(session);
                activeOnDevice = {
                    deviceId: participant.deviceId,
                    platform: participant.platform,
                    joinedAt: participant.joinedAt
                };
                break;
            }
        }

        if (!activeSession) {
            return res.json({
                success: true,
                hasActiveSession: false,
                session: null,
                activeOnDevice: null
            });
        }

        res.json({
            success: true,
            hasActiveSession: true,
            session: activeSession,
            activeOnDevice
        });
    } catch (error) {
        console.error("Error getting active session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Request to transfer session to THIS device
exports.requestTransferHere = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const { deviceId, platform } = req.body;
        if (!deviceId) {
            return res.status(400).json({ error: "deviceId is required" });
        }

        const crypto = require("crypto");
        const userId = crypto.createHash('md5')
            .update(req.user.email || req.user.id)
            .digest('hex')
            .substring(0, 16);

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status !== "LIVE") {
            return res.status(400).json({ error: "Session is not live" });
        }

        // Find the user's current active participation
        const currentParticipant = session.participants.find(
            p => p.userId === userId && !p.leftAt
        );

        if (!currentParticipant) {
            return res.status(400).json({ error: "User is not currently in this session" });
        }

        const oldDeviceId = currentParticipant.deviceId;
        const oldPlatform = currentParticipant.platform;

        // Emit socket event to tell the OLD device to exit
        // Use userId (hashed) as both rooms are now joined but we prefer consistency
        emitTransferLeaving(userId, oldDeviceId, {
            sessionId: session._id.toString(),
            sessionTitle: session.title,
            transferredTo: platform || 'another device'
        });

        // Mark the old participant as left
        currentParticipant.leftAt = new Date();

        // Add new participant entry for this device
        const newParticipant = {
            userId: userId,
            name: req.user?.name || "Guest",
            email: req.user?.email || "",
            deviceId: deviceId,
            platform: platform || "web",
            joinedAt: new Date()
        };
        session.participants.push(newParticipant);

        await session.save();

        // Emit to all user's devices about their active session changing device
        emitActiveSessionChanged(userId, {
            hasActiveSession: true,
            session: enrichSession(session),
            activeOnDevice: {
                deviceId: newParticipant.deviceId,
                platform: newParticipant.platform
            }
        });

        res.json({
            status: true,
            success: true,
            message: "Session transferred successfully",
            session: enrichSession(session),
            roomId: session.roomId,
            transferredFrom: {
                deviceId: oldDeviceId,
                platform: oldPlatform
            }
        });
    } catch (error) {
        console.error("Error transferring session:", error);
        res.status(500).json({ error: error.message });
    }
};
