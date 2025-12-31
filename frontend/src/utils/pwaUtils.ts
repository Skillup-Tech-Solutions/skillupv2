import Cookies from 'js-cookie';

/**
 * PWA Utility functions for enhancing native-like experience
 */

/**
 * Helper to get value from dual storage (Cookie or LocalStorage)
 * This is critical for native apps where cookies can be unreliable
 */
export const getFromStorage = (key: string) => {
    return Cookies.get(key) || localStorage.getItem(key);
};

/**
 * Checks if the app is running inside Capacitor (native Android/iOS)
 */
export const isCapacitor = () => {
    return !!(window as any).Capacitor?.isNativePlatform?.() ||
        !!(window as any).Capacitor?.isNative;
};

/**
 * Triggers haptic feedback if supported by the device
 * @param type - 'light', 'medium', or 'heavy'
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!window.navigator || !window.navigator.vibrate) return;

    switch (type) {
        case 'light':
            window.navigator.vibrate(10);
            break;
        case 'medium':
            window.navigator.vibrate(20);
            break;
        case 'heavy':
            window.navigator.vibrate([30, 50, 30]);
            break;
    }
};

/**
 * Checks if the app is currently running as a standalone PWA
 */
export const isStandalone = () => {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
    );
};
