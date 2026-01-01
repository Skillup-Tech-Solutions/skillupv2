import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Utility for providing native haptic feedback.
 * Safely checks if the platform is native before attempting to trigger haptics.
 */
export const hapticFeedback = {
    /**
     * Trigger a subtle impact vibration.
     * @param style ImpactStyle (HEAVY, MEDIUM, LIGHT) - default is LIGHT
     */
    impact: async (style: ImpactStyle = ImpactStyle.Light) => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.impact({ style });
            } catch (e) {
                console.warn('Haptics impact failed', e);
            }
        }
    },

    /**
     * Trigger a notification vibration (SUCCESS, WARNING, ERROR).
     * @param type NotificationType
     */
    notification: async (type: NotificationType) => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.notification({ type });
            } catch (e) {
                console.warn('Haptics notification failed', e);
            }
        }
    },

    /**
     * Trigger a selection change vibration (subtle).
     */
    selectionChange: async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.selectionChanged();
            } catch (e) {
                console.warn('Haptics selectionChanged failed', e);
            }
        }
    },

    /**
     * Trigger a standard vibration (short).
     */
    vibrate: async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.vibrate();
            } catch (e) {
                console.warn('Haptics vibrate failed', e);
            }
        }
    }
};
