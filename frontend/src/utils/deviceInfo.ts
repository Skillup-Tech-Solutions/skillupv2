import { Device } from '@capacitor/device';
import type { DeviceInfo as CapacitorDeviceInfo } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

/**
 * Device information structure for session tracking
 */
export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    platform: 'android' | 'ios' | 'web';
}

// Storage key for web device ID
const WEB_DEVICE_ID_KEY = 'skillup_device_id';

/**
 * Generate a UUID for web browsers
 */
const generateUUID = (): string => {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Get or create a persistent device ID for web browsers
 */
const getWebDeviceId = (): string => {
    let deviceId = localStorage.getItem(WEB_DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = `web-${generateUUID()}`;
        localStorage.setItem(WEB_DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

/**
 * Get the current device platform
 */
const getPlatform = (): 'android' | 'ios' | 'web' => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
    return 'web';
};

/**
 * Get a human-readable device name
 */
const getDeviceName = (info: CapacitorDeviceInfo | null): string => {
    if (!info) {
        // Fallback for web - try to get browser info
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome Browser';
        if (ua.includes('Firefox')) return 'Firefox Browser';
        if (ua.includes('Safari')) return 'Safari Browser';
        if (ua.includes('Edge')) return 'Edge Browser';
        return 'Web Browser';
    }

    const { manufacturer, model, name, operatingSystem, osVersion } = info;

    // For iOS/Android, combine manufacturer and model
    if (manufacturer && model) {
        return `${manufacturer} ${model}`;
    }

    // Fallback to device name or OS info
    if (name) return name;
    if (operatingSystem && osVersion) {
        return `${operatingSystem} ${osVersion}`;
    }

    return 'Unknown Device';
};

/**
 * Get complete device information for session tracking
 * Uses Capacitor Device plugin for native apps, localStorage UUID for web
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
    const platform = getPlatform();

    try {
        if (platform === 'web') {
            // Web browser - use localStorage-based ID
            return {
                deviceId: getWebDeviceId(),
                deviceName: getDeviceName(null),
                platform: 'web'
            };
        }

        // Native app - use Capacitor Device plugin
        const deviceId = await Device.getId();
        const deviceInfo = await Device.getInfo();

        return {
            deviceId: deviceId.identifier,
            deviceName: getDeviceName(deviceInfo),
            platform: platform
        };
    } catch (error) {
        console.warn('[DeviceInfo] Failed to get device info:', error);

        // Fallback device info
        return {
            deviceId: getWebDeviceId(),
            deviceName: 'Unknown Device',
            platform: platform
        };
    }
};

/**
 * Get stored device ID from localStorage (for headers)
 */
export const getStoredDeviceId = (): string | null => {
    return localStorage.getItem(WEB_DEVICE_ID_KEY);
};

/**
 * Store device ID after successful login
 */
export const storeDeviceId = (deviceId: string): void => {
    localStorage.setItem(WEB_DEVICE_ID_KEY, deviceId);
};

/**
 * Clear device ID (on logout if needed)
 */
export const clearDeviceId = (): void => {
    localStorage.removeItem(WEB_DEVICE_ID_KEY);
};

/**
 * Get device ID synchronously (for hooks and API calls)
 * Uses stored device ID or generates a new one for web
 */
export const getDeviceId = (): string => {
    return getWebDeviceId();
};

/**
 * Get device platform synchronously
 */
export { getPlatform };
