const express = require("express");
const router = express.Router();
const liveSessionController = require("../controllers/liveSessionController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Protected routes (for students and admins to view)
router.get("/live", auth, liveSessionController.getLiveSessions);
router.get("/upcoming", auth, liveSessionController.getUpcomingSessions);
router.get("/history", auth, liveSessionController.getSessionHistory);
router.get("/reference/:type/:id", auth, liveSessionController.getSessionsByReference);
router.get("/:id", auth, liveSessionController.getSession);
router.post("/:id/join", auth, liveSessionController.joinSession);
router.post("/:id/leave", auth, liveSessionController.leaveSession);

// Admin routes
router.get("/", auth, roleAuth.adminOnly, liveSessionController.getSessions);
router.post("/", auth, roleAuth.adminOnly, liveSessionController.createSession);
router.put("/:id", auth, roleAuth.adminOnly, liveSessionController.updateSession);
router.patch("/:id/start", auth, roleAuth.adminOnly, liveSessionController.startSession);
router.patch("/:id/end", auth, roleAuth.adminOnly, liveSessionController.endSession);
router.patch("/:id/cancel", auth, roleAuth.adminOnly, liveSessionController.cancelSession);
router.delete("/:id", auth, roleAuth.adminOnly, liveSessionController.deleteSession);

module.exports = router;
