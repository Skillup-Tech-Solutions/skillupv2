/**
 * Version Routes
 * 
 * Routes for app version management and update checks.
 */

const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Public routes (no authentication required)
// These are accessed by the app before/without login

/**
 * @swagger
 * /api/version/latest:
 *   get:
 *     summary: Get latest app version information
 *     tags: [Version]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [web, android, ios]
 *         description: Platform requesting the version
 *     responses:
 *       200:
 *         description: Latest version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latestVersion:
 *                   type: string
 *                   example: "1.0.0"
 *                 minSupportedVersion:
 *                   type: string
 *                   example: "1.0.0"
 *                 forceUpdate:
 *                   type: boolean
 *                 releaseNotes:
 *                   type: string
 *                 releaseDate:
 *                   type: string
 *                 downloadUrl:
 *                   type: string
 */
router.get('/latest', versionController.getLatestVersion);

/**
 * @swagger
 * /api/version/check/{version}:
 *   get:
 *     summary: Check if a specific version is supported
 *     tags: [Version]
 *     parameters:
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: Version to check (e.g., "1.0.0")
 *     responses:
 *       200:
 *         description: Version check result
 */
router.get('/check/:version', versionController.checkVersion);

// Admin routes (authentication required)

/**
 * @swagger
 * /api/version/config:
 *   put:
 *     summary: Update version configuration (admin only)
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latestVersion:
 *                 type: string
 *               minSupportedVersion:
 *                 type: string
 *               forceUpdate:
 *                 type: boolean
 *               releaseNotes:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 */
router.put('/config', auth, roleAuth.adminOnly, versionController.updateVersionConfig);

module.exports = router;
