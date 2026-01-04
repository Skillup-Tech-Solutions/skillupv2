/**
 * Version Controller
 * 
 * Handles version-related API endpoints for app update checks.
 */

// In-memory version configuration
// In production, this could be loaded from database or environment variables
const versionConfig = {
    // Latest available version
    latestVersion: '3.0.7',

    // Minimum version that's still supported (force update below this)
    minSupportedVersion: '3.0.7',

    // Optional: Force all users to update regardless of version
    forceUpdate: false,

    // Release notes for the latest version
    releaseNotes: 'Initial release of SkillUp mobile app.',

    // Release date
    releaseDate: '2026-01-04',

    // Platform-specific download URLs
    downloadUrls: {
        android: 'https://play.google.com/store/apps/details?id=com.skillup.app',
        ios: 'https://apps.apple.com/app/skillup/id000000000',
    },
};

/**
 * Get latest version information
 * GET /api/version/latest
 */
const getLatestVersion = async (req, res) => {
    try {
        const platform = req.query.platform || 'web';

        const response = {
            latestVersion: versionConfig.latestVersion,
            minSupportedVersion: versionConfig.minSupportedVersion,
            forceUpdate: versionConfig.forceUpdate,
            releaseNotes: versionConfig.releaseNotes,
            releaseDate: versionConfig.releaseDate,
        };

        // Add platform-specific download URL
        if (platform === 'android' || platform === 'ios') {
            response.downloadUrl = versionConfig.downloadUrls[platform];
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('[VersionController] Error getting latest version:', error);
        res.status(500).json({
            message: 'Failed to get version information',
            error: error.message
        });
    }
};

/**
 * Check if a specific version is supported
 * GET /api/version/check/:version
 */
const checkVersion = async (req, res) => {
    try {
        const { version } = req.params;

        if (!version) {
            return res.status(400).json({ message: 'Version parameter is required' });
        }

        const isSupported = compareVersions(version, versionConfig.minSupportedVersion) >= 0;
        const isLatest = compareVersions(version, versionConfig.latestVersion) >= 0;
        const updateAvailable = compareVersions(version, versionConfig.latestVersion) < 0;

        res.status(200).json({
            version,
            isSupported,
            isLatest,
            updateAvailable,
            latestVersion: versionConfig.latestVersion,
            forceUpdate: !isSupported || versionConfig.forceUpdate,
        });
    } catch (error) {
        console.error('[VersionController] Error checking version:', error);
        res.status(500).json({
            message: 'Failed to check version',
            error: error.message
        });
    }
};

/**
 * Update version configuration (admin only)
 * PUT /api/version/config
 */
const updateVersionConfig = async (req, res) => {
    try {
        const { latestVersion, minSupportedVersion, forceUpdate, releaseNotes, releaseDate } = req.body;

        if (latestVersion) versionConfig.latestVersion = latestVersion;
        if (minSupportedVersion) versionConfig.minSupportedVersion = minSupportedVersion;
        if (typeof forceUpdate === 'boolean') versionConfig.forceUpdate = forceUpdate;
        if (releaseNotes) versionConfig.releaseNotes = releaseNotes;
        if (releaseDate) versionConfig.releaseDate = releaseDate;

        res.status(200).json({
            message: 'Version configuration updated successfully',
            config: versionConfig,
        });
    } catch (error) {
        console.error('[VersionController] Error updating version config:', error);
        res.status(500).json({
            message: 'Failed to update version configuration',
            error: error.message
        });
    }
};

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;

        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
    }

    return 0;
}

module.exports = {
    getLatestVersion,
    checkVersion,
    updateVersionConfig,
};
