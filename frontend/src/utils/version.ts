/**
 * Version Utility
 * 
 * Centralized version management for the SkillUp application.
 * Provides version info, comparison utilities, and update detection.
 */

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export interface AppVersion {
    version: string;
    versionCode: number;
    gitHash: string;
    env: string;
    buildType: 'development' | 'production';
    platform: 'web' | 'android' | 'ios';
    buildDate: string;
}

export interface UpdateInfo {
    updateAvailable: boolean;
    latestVersion: string;
    currentVersion: string;
    forceUpdate: boolean;
    releaseNotes?: string;
    downloadUrl?: string;
}

// App version from package.json - this is the single source of truth
// Updated during build process
export const APP_VERSION = '3.0.1';
export const BUILD_NUMBER = 30001;
export const BUILD_DATE = '2026-01-01';
export const GIT_COMMIT = 'dc3d72b';
export const ENV = 'production';

/**
 * Calculate version code from semantic version string
 * Format: MAJOR * 10000 + MINOR * 100 + PATCH
 * Example: "1.2.3" -> 10203
 */
export const calculateVersionCode = (version: string): number => {
    const parts = version.split('.').map(Number);
    const major = parts[0] || 0;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;
    return major * 10000 + minor * 100 + patch;
};

/**
 * Get current app version information
 */
export const getAppVersion = async (): Promise<AppVersion> => {
    const platform = Capacitor.getPlatform() as 'web' | 'android' | 'ios';
    const isDevelopment = import.meta.env.DEV;

    let version = APP_VERSION;
    let versionCode = BUILD_NUMBER;

    // On native platforms, try to get version from native layer
    if (Capacitor.isNativePlatform()) {
        try {
            const appInfo = await App.getInfo();
            version = appInfo.version;
            versionCode = parseInt(appInfo.build, 10) || BUILD_NUMBER;
        } catch (error) {
            console.warn('[Version] Failed to get native app info:', error);
        }
    }

    return {
        version,
        versionCode,
        gitHash: GIT_COMMIT,
        env: ENV,
        buildType: isDevelopment ? 'development' : 'production',
        platform,
        buildDate: BUILD_DATE,
    };
};

/**
 * Get synchronous version (for situations where async isn't available)
 * This returns the embedded version, not the native version
 */
export const getVersionSync = (): string => APP_VERSION;

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;

        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
    }

    return 0;
};

/**
 * Check if an update is available
 */
export const isUpdateAvailable = (currentVersion: string, latestVersion: string): boolean => {
    return compareVersions(currentVersion, latestVersion) < 0;
};

/**
 * Check if current version is below minimum supported
 */
export const isBelowMinimum = (currentVersion: string, minVersion: string): boolean => {
    return compareVersions(currentVersion, minVersion) < 0;
};

/**
 * Format version for display
 */
export const formatVersion = (version: string, buildType?: 'development' | 'production'): string => {
    if (buildType === 'development') {
        return `v${version} (Dev)`;
    }
    return `v${version}`;
};

/**
 * Get platform-specific store URL
 */
export const getStoreUrl = (platform: 'android' | 'ios'): string => {
    const appId = 'com.skillup.app';

    if (platform === 'android') {
        return `https://play.google.com/store/apps/details?id=${appId}`;
    }

    if (platform === 'ios') {
        // Replace with actual App Store ID when available
        return `https://apps.apple.com/app/skillup/id000000000`;
    }

    return '';
};

export default {
    getAppVersion,
    getVersionSync,
    compareVersions,
    isUpdateAvailable,
    isBelowMinimum,
    formatVersion,
    calculateVersionCode,
    getStoreUrl,
};
