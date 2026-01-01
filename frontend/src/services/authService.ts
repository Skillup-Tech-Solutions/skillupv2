import Cookies from 'js-cookie';
import { Preferences } from '@capacitor/preferences';
import { logger } from '../utils/logger';

const TOKEN_EXPIRY_DAYS = 7;
const AUTH_KEYS = ['skToken', 'skRefreshToken', 'email', 'role', 'name', 'mobile'];

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

// Initialize cache from native storage on app start
const initializeCache = async (retryCount = 0): Promise<void> => {
    const isNative = isCapacitorNative();

    if (!isNative) {
        // If not native but we think we might be (e.g. on mobile but bridge not ready)
        // Retry a few times during startup
        if (retryCount < 5) {
            await new Promise(r => setTimeout(r, 100));
            return initializeCache(retryCount + 1);
        }
        return;
    }

    logger.log('[authService] Capacitor detected, initializing cache from native storage...');

    for (const key of AUTH_KEYS) {
        const value = await nativeStorage.get(key);
        if (value) {
            logger.log(`[authService] Restored ${key}`);
            storageCache[key] = value;
            // Also sync to localStorage for redundancy
            localStorage.setItem(key, value);
        }
    }
    cacheInitialized = true;
};

// Start initialization immediately
if (typeof window !== 'undefined') {
    cacheInitPromise = initializeCache();
}

export const authService = {
    // Wait for cache to be ready (use this in async contexts)
    async waitForReady(): Promise<void> {
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
            nativeStorage.set(key, value);
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
            // Wait for cache to be ready first to avoid overlapping gets
            await this.waitForReady();

            // Try native storage first for most reliable result
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
    },

    // Clear all auth data (logout)
    clearAuth() {
        AUTH_KEYS.forEach(key => {
            Cookies.remove(key, { path: '/' });
            localStorage.removeItem(key);
            delete storageCache[key];

            if (isCapacitorNative()) {
                nativeStorage.remove(key);
            }
        });
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

    // Get user info
    getUserInfo() {
        return {
            email: this.get('email'),
            role: this.get('role'),
            name: this.get('name'),
            mobile: this.get('mobile'),
        };
    },

    // Get user info async
    async getUserInfoAsync() {
        return {
            email: await this.getAsync('email'),
            role: await this.getAsync('role'),
            name: await this.getAsync('name'),
            mobile: await this.getAsync('mobile'),
        };
    }
};
