const LiveSession = require("../models/LiveSession");
const Course = require("../models/Course");
const Project = require("../models/Project");
const Internship = require("../models/Internship");

// Get reference model based on session type
const getReferenceModel = (sessionType) => {
    switch (sessionType) {
        case "COURSE": return Course;
        case "PROJECT": return Project;
        case "INTERNSHIP": return Internship;
        default: return null;
    }
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

        res.json({ success: true, sessions });
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

        res.json({ success: true, sessions });
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

        res.json({ success: true, sessions });
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

        res.json({ success: true, session });
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

        res.json({ success: true, sessions });
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

        // Calculate max participants
        if (session.participants.length > session.maxParticipants) {
            session.maxParticipants = session.participants.length;
        }

        await session.save();

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
        const existingParticipant = session.participants.find(
            p => p.userId === userId && !p.leftAt
        );

        if (existingParticipant) {
            // User already in session, just return success
            return res.json({
                success: true,
                session,
                roomId: session.roomId,
                message: "Already in session"
            });
        }

        const participant = {
            userId: userId,
            name: req.user?.name || req.body.name || "Guest",
            email: req.user?.email || req.body.email || "",
            joinedAt: new Date()
        };

        session.participants.push(participant);
        await session.save();

        res.json({
            success: true,
            session,
            roomId: session.roomId
        });
    } catch (error) {
        console.error("Error joining session:", error);
        res.status(500).json({ error: error.message });
    }
};
