/**
 * Cache Middleware for API responses
 * Adds appropriate Cache-Control headers for public, read-only endpoints
 */

// Cache durations in seconds
const CACHE_DURATIONS = {
    // Static data that rarely changes
    LONG: 60 * 30, // 30 minutes
    // Semi-static data
    MEDIUM: 60 * 5, // 5 minutes
    // Dynamic data
    SHORT: 60, // 1 minute
};

/**
 * Middleware to add cache headers for public GET requests
 * @param {string} duration - Cache duration key: 'LONG', 'MEDIUM', 'SHORT'
 */
const createCacheMiddleware = (duration = 'MEDIUM') => {
    const maxAge = CACHE_DURATIONS[duration] || CACHE_DURATIONS.MEDIUM;

    return (req, res, next) => {
        // Skip OPTIONS (CORS preflight) and non-GET requests
        if (req.method !== 'GET' || req.method === 'OPTIONS') {
            return next();
        }

        // Don't cache if there's an Authorization header (private data)
        if (req.headers.authorization) {
            // Private cache for authenticated requests
            res.set('Cache-Control', 'private, no-cache');
            return next();
        }

        // Public cache headers for unauthenticated requests
        res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
        // Include Origin in Vary for CORS compatibility
        res.set('Vary', 'Accept-Encoding, Origin');

        next();
    };
};

// Pre-configured middleware instances
const cacheMiddleware = {
    // For static data like categories
    long: createCacheMiddleware('LONG'),
    // For semi-static data like courses, offers
    medium: createCacheMiddleware('MEDIUM'),
    // For dynamic data
    short: createCacheMiddleware('SHORT'),
};

module.exports = {
    createCacheMiddleware,
    cacheMiddleware,
    CACHE_DURATIONS,
};
