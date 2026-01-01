const { updateLastActive } = require("../controllers/deviceSessionController");

/**
 * Device Activity Middleware
 * Updates lastActiveAt timestamp on DeviceSession for each authenticated request
 */
const deviceActivity = async (req, res, next) => {
    try {
        // Only update if user is authenticated and device ID is present
        if (req.user && req.headers['x-device-id']) {
            const userId = req.user.id || req.user._id;
            const deviceId = req.headers['x-device-id'];

            // Update asynchronously without blocking the request
            updateLastActive(userId, deviceId).catch(err => {
                console.warn('[DeviceActivity] Failed to update last active:', err.message);
            });
        }
    } catch (error) {
        // Don't block the request if activity update fails
        console.warn('[DeviceActivity] Error:', error.message);
    }

    next();
};

module.exports = deviceActivity;
