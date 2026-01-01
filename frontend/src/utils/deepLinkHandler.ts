import { App } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { logger } from './logger';

/**
 * Deep Link Handler for SkillUp App
 * 
 * Handles incoming deep links and navigates to the appropriate route.
 * 
 * Supported URL formats:
 * - Custom scheme: skillup://student/dashboard
 * - App Links: https://app.skilluptechbuzz.in/student/dashboard
 * 
 * Supported routes:
 * - /login - Login page
 * - /student/dashboard - Student dashboard
 * - /student/my-courses - My courses
 * - /student/my-internships - My internships
 * - /student/my-projects - My projects
 * - /student/live-sessions - Live sessions
 * - /student/announcements - Announcements
 * - /student/profile - Student profile
 * - /dashboard - Admin dashboard (requires admin role)
 */

// Route mappings for deep links (path -> hash route)
const DEEP_LINK_ROUTES: Record<string, string> = {
    // Auth routes
    '/login': '/login',
    '/signup': '/signup',
    '/student-signup': '/student-signup',
    '/forgotpassword': '/forgotpassword',

    // Student routes
    '/student/dashboard': '/student/dashboard',
    '/student/my-courses': '/student/my-courses',
    '/student/my-internships': '/student/my-internships',
    '/student/my-projects': '/student/my-projects',
    '/student/live-sessions': '/student/live-sessions',
    '/student/announcements': '/student/announcements',
    '/student/profile': '/student/profile',
    '/student/pay': '/student/pay',

    // Admin routes (requires admin auth)
    '/dashboard': '/dashboard',
    '/courses': '/courses',
    '/users': '/users',
    '/announcements': '/announcements',
    '/notifications': '/notifications',

    // Employee routes
    '/employee/portal': '/employee/portal',
};

/**
 * Parse the deep link URL and extract the path
 */
const parseDeepLinkUrl = (url: string): string | null => {
    try {
        // Handle custom scheme: skillup://path
        if (url.startsWith('skillup://')) {
            const path = url.replace('skillup:/', '');
            return path.startsWith('/') ? path : `/${path}`;
        }

        // Handle App Links: https://app.skilluptechbuzz.in/path
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search + urlObj.hash;
    } catch (error) {
        logger.error('[DeepLink] Failed to parse URL:', url, error);
        return null;
    }
};

/**
 * Get the hash route for a deep link path
 */
const getRouteForPath = (path: string): string => {
    // Remove query params and hash for matching
    const cleanPath = path.split('?')[0].split('#')[0];

    // Check for exact match
    if (DEEP_LINK_ROUTES[cleanPath]) {
        return DEEP_LINK_ROUTES[cleanPath];
    }

    // Check for dynamic routes (e.g., /student/submit-project/:id)
    if (cleanPath.startsWith('/student/submit-project/')) {
        return cleanPath; // Pass through dynamic routes
    }

    if (cleanPath.startsWith('/student/')) {
        return cleanPath; // Allow other student routes
    }

    // Default to the path as-is (let the router handle 404)
    return cleanPath;
};

/**
 * Navigate to a route using the hash router
 */
const navigateToRoute = (route: string): void => {
    // Since we use HashRouter, we need to set the hash
    const hashRoute = route.startsWith('#') ? route : `#${route}`;

    logger.log('[DeepLink] Navigating to:', hashRoute);

    // Use window.location.hash for HashRouter navigation
    window.location.hash = hashRoute;
};

/**
 * Handle an incoming deep link URL
 */
export const handleDeepLink = (url: string): void => {
    logger.log('[DeepLink] Received URL:', url);

    const path = parseDeepLinkUrl(url);
    if (!path) {
        logger.warn('[DeepLink] Could not parse URL:', url);
        return;
    }

    const route = getRouteForPath(path);
    logger.log('[DeepLink] Parsed path:', path, '-> Route:', route);

    navigateToRoute(route);
};

/**
 * Initialize deep link handling
 * Call this once when the app starts (e.g., in App.tsx useEffect)
 */
export const initDeepLinkHandler = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
        logger.log('[DeepLink] Not a native platform, skipping initialization');
        return;
    }

    logger.log('[DeepLink] Initializing deep link handler...');

    // Listen for deep links while app is running
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        logger.log('[DeepLink] App URL opened:', event.url);
        handleDeepLink(event.url);
    });

    // Check if app was opened via deep link (cold start)
    try {
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
            logger.log('[DeepLink] App launched with URL:', launchUrl.url);
            // Small delay to ensure router is ready
            setTimeout(() => {
                handleDeepLink(launchUrl.url);
            }, 500);
        }
    } catch (error) {
        logger.warn('[DeepLink] Could not get launch URL:', error);
    }

    logger.log('[DeepLink] Handler initialized');
};

/**
 * Remove deep link listeners (for cleanup)
 */
export const removeDeepLinkHandler = (): void => {
    if (Capacitor.isNativePlatform()) {
        App.removeAllListeners();
        logger.log('[DeepLink] Handler removed');
    }
};

/**
 * Build a deep link URL for sharing
 */
export const buildDeepLink = (route: string, useCustomScheme = true): string => {
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;

    if (useCustomScheme) {
        return `skillup:/${cleanRoute}`;
    }

    return `https://app.skilluptechbuzz.in${cleanRoute}`;
};

/**
 * Build a shareable link for a specific content
 */
export const buildShareableLink = (
    type: 'course' | 'session' | 'announcement' | 'project',
    id: string
): string => {
    const routes: Record<string, string> = {
        course: `/student/my-courses?id=${id}`,
        session: `/student/live-sessions?id=${id}`,
        announcement: `/student/announcements?id=${id}`,
        project: `/student/submit-project/${id}`,
    };

    return buildDeepLink(routes[type] || '/student/dashboard', false);
};
