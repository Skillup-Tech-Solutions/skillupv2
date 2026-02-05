import Cookies from 'js-cookie';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

const TOKEN_EXPIRY_DAYS = 7;
const AUTH_KEYS = ['skToken', 'skRefreshToken', 'email', 'role', 'name', 'mobile', 'userId', 'skillup_device_id'];
const BUNDLE_KEY = 'skillup_auth_bundle';

// Track if foreground listener is set up
let foregroundListenerActive = false;

// Check if running in Capacitor native app - more robust check
const isCapacitorNative = () => {
    // 1. Check direct Capacitor object
    if ((window as any).Capacitor?.isNativePlatform?.() || (window as any).Capacitor?.isNative) {
        return true;
    }

    // 2. Check for webkit message handlers (iOS specifically)
    if ((window as any).webkit?.messageHandlers?.Capacitor || (window as any).webkit?.messageHandlers?.bridge) {
        return true;
    }

    // 3. Check for Android bridge
    if ((window as any).Android) {
        return true;
    }

    return false;
};

const getCookieOptions = () => ({
    path: '/',
    sameSite: 'lax' as const,
    expires: TOKEN_EXPIRY_DAYS,
    ...(window.location.protocol === 'https:' && { secure: true })
});

// Native storage using Capacitor Preferences (persists on iOS/Android)
const nativeStorage = {
    async set(key: string, value: string): Promise<void> {
        try {
            await Preferences.set({ key, value });
        } catch (e) {
            logger.warn('Native storage set failed:', e);
        }
    },
    async get(key: string): Promise<string | null> {
        try {
            const { value } = await Preferences.get({ key });
            return value;
        } catch (e) {
            logger.warn('Native storage get failed:', e);
            return null;
        }
    },
    async remove(key: string): Promise<void> {
        try {
            await Preferences.remove({ key });
        } catch (e) {
            logger.warn('Native storage remove failed:', e);
        }
    }
};

// Sync cache for immediate reads
const storageCache: Record<string, string> = {};
let cacheInitialized = false;
let cacheInitPromise: Promise<void> | null = null;

// Initialize cache from native storage on app start - OPTIMIZED for cold start
const initializeCache = async (retryCount = 0): Promise<void> => {
    // OPTIMIZATION: Use Capacitor's synchronous check first (faster than DOM checks)
    // If Capacitor.isNativePlatform() is available, trust it immediately
    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        // We know we're native, proceed immediately
        logger.log('[authService] Capacitor native detected immediately');
    } else {
        // Short delay only on first attempt to let bridge initialize
        if (retryCount === 0) {
            await new Promise(r => setTimeout(r, 50)); // Reduced from 300ms
        }

        const isNative = isCapacitorNative();

        if (!isNative) {
            // Retry with shorter delays
            if (retryCount < 5) { // Reduced from 10
                await new Promise(r => setTimeout(r, 100)); // Reduced from 200ms
                return initializeCache(retryCount + 1);
            }
            logger.log('[authService] Not running in native platform after retries');
            cacheInitialized = true;
            return;
        }
    }

    logger.log('[authService] Initializing cache from native storage...');

    try {
        // STRATEGY: Try Bundle First (1 Native Call)
        const bundleValue = await nativeStorage.get(BUNDLE_KEY);

        if (bundleValue) {
            try {
                const bundle = JSON.parse(bundleValue);
                // Restore headers from bundle
                Object.assign(storageCache, bundle);

                // Sync to localStorage
                Object.keys(bundle).forEach(k => {
                    if (bundle[k]) localStorage.setItem(k, bundle[k]);
                });
                logger.log('[authService] Restored specific auth bundle');
            } catch (e) {
                logger.error('[authService] Failed to parse auth bundle', e);
                // Fallback to legacy reads if bundle corrupt
            }
        }

        // If no bundle (Migration Case) OR Bundle failed
        if (Object.keys(storageCache).length === 0) {
            logger.log('[authService] Bundle miss, checking legacy keys (Migration)...');

            // PARALLEL read of all legacy keys (faster than serial)
            const values = await Promise.all(AUTH_KEYS.map(k => nativeStorage.get(k)));

            let hasData = false;
            AUTH_KEYS.forEach((key, index) => {
                const val = values[index];
                if (val) {
                    storageCache[key] = val;
                    localStorage.setItem(key, val);
                    hasData = true;
                }
            });

            if (hasData) {
                logger.log('[authService] Legacy keys found. Migrating to bundle...');
                // Save to bundle for next time
                await nativeStorage.set(BUNDLE_KEY, JSON.stringify(storageCache));
            }
        }
    } catch (err) {
        logger.error('[authService] Initialization error', err);
    }

    cacheInitialized = true;
    logger.log('[authService] Cache initialization complete');

    // Set up foreground listener to re-sync auth on app resume
    setupForegroundListener();
};

// Re-sync auth data when app comes to foreground (handles Android killing WebView)
const setupForegroundListener = () => {
    if (foregroundListenerActive || !Capacitor.isNativePlatform()) return;

    App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
            logger.log('[authService] App resumed, re-syncing auth from native storage...');

            // Just read the bundle again
            const bundleValue = await nativeStorage.get(BUNDLE_KEY);

            // Clear current cache first (in case logout happened natively?)
            // Actually better to merge or reset. Let's reset to be safe.
            // But if we reset, we might lose in-memory changes? 
            // Usually internal changes write to native, so native is truth.

            if (bundleValue) {
                try {
                    const bundle = JSON.parse(bundleValue);
                    Object.assign(storageCache, bundle);
                    // Sync localstorage
                    Object.keys(bundle).forEach(k => {
                        if (bundle[k]) localStorage.setItem(k, bundle[k]);
                    });
                } catch (e) { logger.warn('Resync parse fail', e); }
            } else {
                // Even if bundle missing, check legacy? 
                // Assuming migration done, if bundle missing -> logged out.
                // We should probably check if we WERE logged in.
            }
            logger.log('[authService] Auth re-sync complete');
        }
    });

    foregroundListenerActive = true;
    logger.log('[authService] Foreground listener set up');
};

// Trigger initialization (idempotent)
const startInit = () => {
    if (!cacheInitPromise) {
        cacheInitPromise = initializeCache();
    }
};

// Start initialization DEFERRED (First-Frame-First Strategy)
if (typeof window !== 'undefined') {
    // We defer this to let the UI paint first.
    // critical auth checks will use localStorage (sync) which is fast.

    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(startInit, { timeout: 3000 });
    } else {
        setTimeout(startInit, 500);
    }
}

export const authService = {
    // Wait for cache to be ready (use this in async contexts)
    async waitForReady(): Promise<void> {
        if (!cacheInitPromise) {
            // Trigger immediately if requested before idle/timeout
            startInit();
        }
        if (cacheInitPromise) {
            await cacheInitPromise;
        }
    },

    // Check if cache is initialized
    isCacheReady(): boolean {
        // If it's likely a native app but not initialized yet, it's not ready
        if (isCapacitorNative() && !cacheInitialized) return false;
        return true;
    },

    // Check if currently running in native
    isNative(): boolean {
        return isCapacitorNative();
    },

    // Store value in all storage mechanisms
    set(key: string, value: string) {
        // Always set in cookies and localStorage for web compatibility
        Cookies.set(key, value, getCookieOptions());
        localStorage.setItem(key, value);

        // Also store in native storage if in Capacitor
        if (isCapacitorNative()) {
            storageCache[key] = value;
            // UPDATE BUNDLE
            nativeStorage.set(BUNDLE_KEY, JSON.stringify(storageCache));
            // We NO LONGER set individual keys natively to save calls.
            // The bundle is the source of truth.
        }
    },

    // Get value with proper fallback chain
    get(key: string): string | null {
        if (isCapacitorNative()) {
            // In Capacitor: cache -> localStorage -> cookies
            return storageCache[key] || localStorage.getItem(key) || Cookies.get(key) || null;
        }
        // On web: cookies -> localStorage
        return Cookies.get(key) || localStorage.getItem(key) || null;
    },

    // Async get - directly from native storage (use this for critical auth checks)
    async getAsync(key: string): Promise<string | null> {
        if (isCapacitorNative()) {
            // OPTIMIZATION: Check memory/local cache first!
            // If we have it in memory/local, return immediately without waiting for Native Init.
            const cachedValue = storageCache[key] || localStorage.getItem(key);
            if (cachedValue) {
                return cachedValue;
            }

            // If not in cache, we MUST wait for initialization to complete
            // to ensure we aren't just missing it because init hasn't finished.
            await this.waitForReady();

            // Re-check cache after wait (in case init populated it)
            const postInitValue = storageCache[key] || localStorage.getItem(key);
            if (postInitValue) {
                return postInitValue;
            }

            // Finally, try direct native get if still missing
            // (e.g. it was just set natively by another plugin)

            // Only hit Native if we are "Ready" but somehow don't have the value 
            // (e.g. it was just set natively by another plugin or valid case of missing data)
            const nativeValue = await nativeStorage.get(key);
            if (nativeValue) {
                // Update cache and localStorage
                storageCache[key] = nativeValue;
                localStorage.setItem(key, nativeValue);
                return nativeValue;
            }
        }
        // Fallback to sync get
        return this.get(key);
    },

    // Store all auth data after login
    setTokens(data: {
        accessToken: string;
        refreshToken?: string;
        email: string;
        role: string;
        name: string;
        mobile?: string;
        userId?: string;
    }) {
        this.set('skToken', data.accessToken);
        if (data.refreshToken) {
            this.set('skRefreshToken', data.refreshToken);
        }
        this.set('email', data.email);
        this.set('role', data.role);
        this.set('name', data.name);
        if (data.mobile) {
            this.set('mobile', data.mobile);
        }
        if (data.userId) {
            this.set('userId', data.userId);
        }
    },

    // Clear all auth data (logout)
    clearAuth() {
        AUTH_KEYS.forEach(key => {
            Cookies.remove(key, { path: '/' });
            localStorage.removeItem(key);
            delete storageCache[key];

            if (isCapacitorNative()) {
                nativeStorage.remove(key); // Cleanup legacy keys safely
            }
        });

        if (isCapacitorNative()) {
            nativeStorage.remove(BUNDLE_KEY);
        }
    },

    // Check if user is authenticated (sync - use getTokenAsync for critical checks)
    isAuthenticated(): boolean {
        return !!this.get('skToken');
    },

    // Async check for authentication (more reliable in Capacitor)
    async isAuthenticatedAsync(): Promise<boolean> {
        const token = await this.getAsync('skToken');
        return !!token;
    },

    // Get access token
    getToken(): string | null {
        return this.get('skToken');
    },

    // Get token async (more reliable in Capacitor)
    async getTokenAsync(): Promise<string | null> {
        return this.getAsync('skToken');
    },

    // Get refresh token
    getRefreshToken(): string | null {
        return this.get('skRefreshToken');
    },

    // Get refresh token async (more reliable in Capacitor)
    async getRefreshTokenAsync(): Promise<string | null> {
        return this.getAsync('skRefreshToken');
    },

    // Get user role
    getRole(): string | null {
        return this.get('role');
    },

    // Get role async (more reliable in Capacitor)
    async getRoleAsync(): Promise<string | null> {
        return this.getAsync('role');
    },

    // Get user id
    getUserId(): string | null {
        return this.get('userId');
    },

    // Get user info
    getUserInfo() {
        return {
            email: this.get('email'),
            role: this.get('role'),
            name: this.get('name'),
            mobile: this.get('mobile'),
            userId: this.get('userId'),
        };
    },

    // Get user info async
    async getUserInfoAsync() {
        return {
            email: await this.getAsync('email'),
            role: await this.getAsync('role'),
            name: await this.getAsync('name'),
            mobile: await this.getAsync('mobile'),
            userId: await this.getAsync('userId'),
        };
    }
};
