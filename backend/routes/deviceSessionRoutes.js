const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getDeviceSessions,
    revokeSession,
    revokeAllSessions
} = require("../controllers/deviceSessionController");

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all active device sessions for current user
 *     tags:
 *        - Device Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active device sessions
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getDeviceSessions);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Revoke a single device session
 *     tags:
 *        - Device Sessions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Device session ID
 *     responses:
 *       200:
 *         description: Device session revoked
 *       400:
 *         description: Cannot revoke current device
 *       404:
 *         description: Device session not found
 */
router.delete("/:id", auth, revokeSession);

/**
 * @swagger
 * /api/devices:
 *   delete:
 *     summary: Revoke all device sessions except current
 *     tags:
 *        - Device Sessions
 *     security:
 *       - bearerAuth: []
 *     headers:
 *       x-device-id:
 *         required: true
 *         schema:
 *           type: string
 *         description: Current device ID to keep active
 *     responses:
 *       200:
 *         description: All other devices logged out
 *       400:
 *         description: Device ID header required
 */
router.delete("/", auth, revokeAllSessions);

module.exports = router;
