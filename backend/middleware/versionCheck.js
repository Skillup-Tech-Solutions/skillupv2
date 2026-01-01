/**
 * Version Check Middleware
 * Extracts and logs app version metadata from request headers.
 * Enables backend logic for Warn/Force updates.
 */
const versionCheck = (req, res, next) => {
    const appVersion = req.headers['x-app-version'];
    const buildCode = req.headers['x-build-code'];
    const buildHash = req.headers['x-build-hash'];
    const env = req.headers['x-env'];
    const platform = req.headers['x-platform'];

    // In development, log the client version for visibility
    if (process.env.NODE_ENV !== 'production' && appVersion) {
        // Log once per session or periodically if needed, but for now simple log
        // console.log(`[Version Check] Client: ${platform} v${appVersion} (${buildCode}) [${buildHash}]`);
    }

    // Mirror the version data back in response headers for "Handshaking"
    // This allows the client to confirm the server recognized its version
    if (appVersion) res.set('x-app-version', appVersion);
    if (buildCode) res.set('x-build-code', buildCode);
    if (buildHash) res.set('x-build-hash', buildHash);
    if (env) res.set('x-env', env);
    if (platform) res.set('x-platform', platform);

    // Attach to request for use in controllers if needed
    req.clientInfo = {
        version: appVersion || 'unknown',
        buildCode: buildCode ? parseInt(buildCode, 10) : 0,
        buildHash: buildHash || 'unknown',
        env: env || 'production',
        platform: platform || 'web'
    };

    /**
     * FUTURE: Force Update / Warning Logic
     * You can fetch the 'minimum supported version' from a database or config
     * and return a 426 (Upgrade Required) or include a 'warning' in the response.
     */

    // Example (pseudo-code):
    // const minVersion = 10000;
    // if (req.clientInfo.buildCode < minVersion && platform !== 'web') {
    //    return res.status(426).json({ 
    //        message: 'Update Required', 
    //        updateUrl: 'https://skilluptechbuzz.in/apps' 
    //    });
    // }

    next();
};

module.exports = versionCheck;
