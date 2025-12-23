/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to all responses
 */

const securityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy to prevent information leakage
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Allow cross-origin resource loading (fixes CORP errors for images/files)
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Only add HSTS in production (requires HTTPS)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
};

module.exports = securityHeaders;
