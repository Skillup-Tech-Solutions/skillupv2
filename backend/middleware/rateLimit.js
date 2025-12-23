/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

const rateLimit = require('express-rate-limit');

// Login rate limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
    // Default keyGenerator handles IPv6 properly
});

// Forgot password rate limiter - 3 attempts per 15 minutes
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: {
        message: 'Too many password reset requests. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
    // Default keyGenerator handles IPv6 properly
});

// General API rate limiter - 300 requests per 5 minutes
const generalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 300,
    message: {
        message: 'Too many requests. Please slow down.',
        retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip static files and health checks
        return req.path.startsWith('/uploads') || req.path === '/health';
    }
});

module.exports = {
    loginLimiter,
    forgotPasswordLimiter,
    generalLimiter
};

