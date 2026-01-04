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
    emitSessionDeleted,
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

// Confirm host is ready (called after host actually connects to Jitsi)
// This prevents the race condition where students join while host is granting permissions
exports.confirmHostReady = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.status !== "LIVE") {
            return res.status(400).json({ error: "Session is not live" });
        }

        // Verify the caller is the host
        const isHostById = String(req.user.id) === String(session.hostId);
        const isHostByUnderscoreId = req.user._id && String(req.user._id) === String(session.hostId);

        if (!isHostById && !isHostByUnderscoreId) {
            return res.status(403).json({ error: "Only the host can confirm ready status" });
        }

        // Set hostReady to true - students can now join
        session.hostReady = true;
        await session.save();

        console.log(`[LiveSession] Host confirmed ready for session ${session._id}. Students can now join.`);

        res.json({
            success: true,
            message: "Host ready status confirmed. Students can now join."
        });
    } catch (error) {
        console.error("Error confirming host ready:", error);
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

        emitSessionDeleted(req.params.id);

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

        const deviceId = req.body.deviceId || "unknown";
        console.log(`[LiveSession] joinSession DEBUG: email=${req.user.email}, id=${req.user.id}, userId=${userId}, deviceId=${deviceId}`);

        // STRICT MODERATOR CHECK:
        // If there are NO active participants, this is effectively "Creating" the room.
        // We MUST ensure ONLY the Host can create the room to grab the Moderator privileges.
        // If there are NO *OTHER* active participants, this is effectively "Creating" or "Re-creating" the room.
        // We exclude the current active user (ghost check) to prevent them from re-joining an abandoned room and becoming admin.
        // We MUST ensure ONLY the Host (or Admin) can create the room to grab the Moderator privileges.
        const otherActiveParticipants = session.participants.filter(p => !p.leftAt && p.userId !== userId);

        console.log(`[Join Debug] User: ${userId} (${req.user.name}), HostId: ${session.hostId}`);
        console.log(`[Join Debug] All Active: ${session.participants.filter(p => !p.leftAt).length}`);
        console.log(`[Join Debug] Other Active: ${otherActiveParticipants.length}`);
        console.log(`[Join Debug] Host Ready: ${session.hostReady}`);
        otherActiveParticipants.forEach(p => console.log(`   - Other: ${p.userId} (${p.name})`));

        // Check if current user is the host
        const isHostById = String(req.user.id) === String(session.hostId);
        const isHostByUnderscoreId = req.user._id && String(req.user._id) === String(session.hostId);
        const isHost = isHostById || isHostByUnderscoreId;

        if (otherActiveParticipants.length === 0) {
            // No one else in the room - only host can join first
            if (!isHost) {
                console.log("[Join Debug] REJECTED: User is not the host (empty room).");
                return res.json({
                    status: false,
                    success: false,
                    message: "Waiting for host to join the session..."
                });
            } else {
                console.log("[Join Debug] ACCEPTED: User IS the host. Resetting hostReady to false.");
                // Reset hostReady - host needs to confirm after connecting to Jitsi
                session.hostReady = false;
            }
        } else {
            // There are other participants - but we need to check if host is REALLY ready
            // This prevents the race condition where student joins while host is granting permissions
            if (!isHost && !session.hostReady) {
                console.log("[Join Debug] REJECTED: Host has joined but not confirmed ready yet (permissions pending).");
                return res.json({
                    status: false,
                    success: false,
                    message: "Waiting for host to connect to the session..."
                });
            }
        }

        // Check if user already joined (prevent duplicates)
        // Only return alreadyActive if their last entry HAS NOT left yet
        const existingParticipant = session.participants.find(
            p => p.userId === userId && !p.leftAt
        );

        if (existingParticipant) {
            // IF it's the SAME device, just allow it (re-entry/refresh)
            if (existingParticipant.deviceId === deviceId) {
                console.log(`[LiveSession] User re-joining from same device: ${deviceId}`);
                return res.json({
                    status: true,
                    success: true,
                    session: enrichSession(session),
                    roomId: session.roomId,
                    alreadyActive: false, // Don't show dialog for same device
                    message: "User re-joined from same device"
                });
            }

            console.log(`[LiveSession] Conflict: User already active on device ${existingParticipant.deviceId}, now trying from ${deviceId}`);
            return res.json({
                status: true,
                success: true,
                session: enrichSession(session),
                roomId: session.roomId,
                alreadyActive: true,
                message: "User is already active in this session on another device"
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

        const deviceId = req.headers['x-device-id'] || req.body.deviceId;
        console.log(`[LiveSession] leaveSession: user=${req.user.email}, userId=${userId}, deviceId=${deviceId || 'NOT_PROVIDED'}`);

        // Find the specific active participant entry for this user ON THIS DEVICE
        // If deviceId is missing, fallback to finding the first active one (legacy behavior)
        const participantIndex = session.participants.findIndex(
            p => p.userId === userId && !p.leftAt && (deviceId ? p.deviceId === deviceId : true)
        );

        if (participantIndex !== -1) {
            const entry = session.participants[participantIndex];
            const participantName = entry.name;
            const leavingDeviceId = entry.deviceId;

            console.log(`[LiveSession] Marking entry left: ${participantName} on device ${leavingDeviceId}`);
            entry.leftAt = new Date();
            session.markModified('participants');
            await session.save();

            // Emit socket event for real-time participant count update
            const activeParticipants = session.participants.filter(p => !p.leftAt);
            const activeCount = activeParticipants.length;
            emitParticipantLeft(session._id.toString(), activeCount, participantName);

            // Emit to all user's devices ONLY if they have NO MORE active entries in this session
            const userHasOtherActiveDevices = activeParticipants.some(p => p.userId === userId);

            if (!userHasOtherActiveDevices) {
                console.log(`[LiveSession] User ${userId} has NO more active devices. Emitting active-changed: false`);
                emitActiveSessionChanged(userId, {
                    hasActiveSession: false,
                    session: null,
                    activeOnDevice: null
                });
            } else {
                // If they still have other devices, emit update with the REMAINING active device
                const otherActiveDevice = activeParticipants.find(p => p.userId === userId);
                console.log(`[LiveSession] User ${userId} STILL active on device: ${otherActiveDevice.deviceId}. Emitting active-changed: true`);
                emitActiveSessionChanged(userId, {
                    hasActiveSession: true,
                    session: enrichSession(session),
                    activeOnDevice: {
                        deviceId: otherActiveDevice.deviceId,
                        platform: otherActiveDevice.platform
                    }
                });
            }
        } else {
            console.log(`[LiveSession] leaveSession: No active entry found for userId=${userId}, deviceId=${deviceId}`);
        }

        res.json({
            status: true,
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

        // Find all the user's current active participations
        const activeParticipants = session.participants.filter(
            p => p.userId === userId && !p.leftAt
        );

        if (activeParticipants.length === 0) {
            console.log(`[LiveSession] transfer: No active participants found for user ${userId}`);
            return res.status(400).json({ error: "User is not currently in this session" });
        }

        console.log(`[LiveSession] requestTransferHere: Evicting all other active devices for user ${userId} to join on ${deviceId}`);

        // Mark all current entries as left and emit leaving events
        session.participants.forEach(p => {
            if (p.userId === userId && !p.leftAt && p.deviceId !== deviceId) {
                console.log(`[LiveSession] Evicting device: ${p.deviceId} (${p.platform})`);

                // Emit socket event to tell the OLD device to exit
                emitTransferLeaving(userId, p.deviceId, {
                    sessionId: session._id.toString(),
                    sessionTitle: session.title,
                    transferredTo: platform || 'another device'
                });

                // Mark the old participant as left
                p.leftAt = new Date();
            }
        });

        // Add new participant entry for this device (or update existing if somehow found)
        const newParticipant = {
            userId: userId,
            name: req.user?.name || "Guest",
            email: req.user?.email || "",
            deviceId: deviceId,
            platform: platform || "web",
            joinedAt: new Date()
        };
        session.participants.push(newParticipant);
        session.markModified('participants');

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
                deviceId: deviceId, // This is actually the TO device now in the context of this response, but frontend knows
                platform: platform
            }
        });
    } catch (error) {
        console.error("Error transferring session:", error);
        res.status(500).json({ error: error.message });
    }
};
