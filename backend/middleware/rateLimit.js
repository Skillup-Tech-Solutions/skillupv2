/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 * 
 * Environment Variables:
 * - LOGIN_RATE_LIMIT_WINDOW_MS: Window in milliseconds (default: 900000 = 15 minutes)
 * - LOGIN_RATE_LIMIT_MAX: Max login attempts (default: 5)
 * - FORGOT_PASSWORD_RATE_LIMIT_MAX: Max forgot password attempts (default: 3)
 * - GENERAL_RATE_LIMIT_WINDOW_MS: General API window (default: 300000 = 5 minutes)
 * - GENERAL_RATE_LIMIT_MAX: Max general requests (default: 300)
 */

const rateLimit = require('express-rate-limit');

// Get rate limit config from environment with defaults
const LOGIN_WINDOW_MS = parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX = parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5;
const FORGOT_PASSWORD_MAX = parseInt(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX) || 3;
const GENERAL_WINDOW_MS = parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000; // 5 minutes
const GENERAL_MAX = parseInt(process.env.GENERAL_RATE_LIMIT_MAX) || 300;

const loginWindowMinutes = Math.round(LOGIN_WINDOW_MS / 60000);

// Login rate limiter - configurable via env
const loginLimiter = rateLimit({
    windowMs: LOGIN_WINDOW_MS,
    max: LOGIN_MAX,
    message: {
        message: `Too many login attempts. Please try again after ${loginWindowMinutes} minutes.`,
        retryAfter: `${loginWindowMinutes} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false
    // Default keyGenerator handles IPv6 properly
});

// Forgot password rate limiter - configurable via env
const forgotPasswordLimiter = rateLimit({
    windowMs: LOGIN_WINDOW_MS, // Uses same window as login
    max: FORGOT_PASSWORD_MAX,
    message: {
        message: `Too many password reset requests. Please try again after ${loginWindowMinutes} minutes.`,
        retryAfter: `${loginWindowMinutes} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false
    // Default keyGenerator handles IPv6 properly
});

const generalWindowMinutes = Math.round(GENERAL_WINDOW_MS / 60000);

// General API rate limiter - configurable via env
const generalLimiter = rateLimit({
    windowMs: GENERAL_WINDOW_MS,
    max: GENERAL_MAX,
    message: {
        message: `Too many requests. Please slow down.`,
        retryAfter: `${generalWindowMinutes} minutes`
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

