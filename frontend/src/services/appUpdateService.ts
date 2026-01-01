/**
 * App Update Service
 * 
 * Handles checking for app updates and managing update prompts.
 * Works on both web (PWA) and native (Capacitor) platforms.
 */

import { Capacitor } from '@capacitor/core';
import api from '../Interceptors/Interceptor';
import { getAppVersion, isUpdateAvailable, isBelowMinimum, getStoreUrl } from '../utils/version';

export interface VersionResponse {
    latestVersion: string;
    minSupportedVersion: string;
    releaseNotes?: string;
    releaseDate?: string;
    forceUpdate?: boolean;
}

export interface UpdateCheckResult {
    updateAvailable: boolean;
    forceUpdate: boolean;
    currentVersion: string;
    latestVersion: string;
    releaseNotes?: string;
    downloadUrl?: string;
}

// Storage key for tracking update dismissal
const UPDATE_DISMISSED_KEY = 'app_update_dismissed';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

let updateCheckTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Check for available app updates
 */
export const checkForUpdates = async (): Promise<UpdateCheckResult> => {
    try {
        const appVersion = await getAppVersion();

        // Call backend API to get latest version info
        const response = await api.get<VersionResponse>('/api/version/latest');
        const versionInfo = response.data;

        const updateAvailable = isUpdateAvailable(appVersion.version, versionInfo.latestVersion);
        const forceUpdate = versionInfo.forceUpdate || isBelowMinimum(appVersion.version, versionInfo.minSupportedVersion);

        let downloadUrl: string | undefined;

        if (Capacitor.isNativePlatform()) {
            const platform = Capacitor.getPlatform();
            if (platform === 'android' || platform === 'ios') {
                downloadUrl = getStoreUrl(platform);
            }
        }

        return {
            updateAvailable,
            forceUpdate,
            currentVersion: appVersion.version,
            latestVersion: versionInfo.latestVersion,
            releaseNotes: versionInfo.releaseNotes,
            downloadUrl,
        };
    } catch (error) {
        console.warn('[AppUpdate] Failed to check for updates:', error);

        // Return safe defaults on error
        const appVersion = await getAppVersion();
        return {
            updateAvailable: false,
            forceUpdate: false,
            currentVersion: appVersion.version,
            latestVersion: appVersion.version,
        };
    }
};

/**
 * Check if user has dismissed the update prompt for current version
 */
export const isUpdateDismissed = (version: string): boolean => {
    try {
        const dismissed = localStorage.getItem(UPDATE_DISMISSED_KEY);
        if (!dismissed) return false;

        const { version: dismissedVersion, timestamp } = JSON.parse(dismissed);

        // Reset dismissal after 7 days
        const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp > WEEK_MS) {
            localStorage.removeItem(UPDATE_DISMISSED_KEY);
            return false;
        }

        return dismissedVersion === version;
    } catch {
        return false;
    }
};

/**
 * Mark update prompt as dismissed for a version
 */
export const dismissUpdate = (version: string): void => {
    try {
        localStorage.setItem(UPDATE_DISMISSED_KEY, JSON.stringify({
            version,
            timestamp: Date.now(),
        }));
    } catch (error) {
        console.warn('[AppUpdate] Failed to save dismissal:', error);
    }
};

/**
 * Start periodic update checks
 */
export const startUpdateChecks = (onUpdateAvailable: (result: UpdateCheckResult) => void): void => {
    if (updateCheckTimer) {
        clearInterval(updateCheckTimer);
    }

    // Initial check after 5 seconds
    setTimeout(async () => {
        const result = await checkForUpdates();
        if (result.updateAvailable && !isUpdateDismissed(result.latestVersion)) {
            onUpdateAvailable(result);
        }
    }, 5000);

    // Periodic checks
    updateCheckTimer = setInterval(async () => {
        const result = await checkForUpdates();
        if (result.updateAvailable && (result.forceUpdate || !isUpdateDismissed(result.latestVersion))) {
            onUpdateAvailable(result);
        }
    }, UPDATE_CHECK_INTERVAL);
};

/**
 * Stop periodic update checks
 */
export const stopUpdateChecks = (): void => {
    if (updateCheckTimer) {
        clearInterval(updateCheckTimer);
        updateCheckTimer = null;
    }
};

/**
 * Open app store for update
 */
export const openAppStore = (url?: string): void => {
    if (!url) {
        const platform = Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
            url = getStoreUrl(platform);
        }
    }

    if (url) {
        window.open(url, '_blank');
    }
};

export const appUpdateService = {
    checkForUpdates,
    isUpdateDismissed,
    dismissUpdate,
    startUpdateChecks,
    stopUpdateChecks,
    openAppStore,
};

export default appUpdateService;
