import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

export const analyticsService = {
    async init() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            console.log('[Analytics] Initializing...');
            // No need for setCollectionEnabled as it's enabled by default
        } catch (error) {
            console.error('[Analytics] Initialization failed:', error);
        }
    },

    async logEvent(name: string, params?: any) {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await FirebaseAnalytics.logEvent({
                name,
                params: params || {},
            });
        } catch (error) {
            console.error(`[Analytics] Failed to log event ${name}:`, error);
        }
    },

    async setUserId(userId: string) {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await FirebaseAnalytics.setUserId({
                userId,
            });
        } catch (error) {
            console.error('[Analytics] Failed to set user ID:', error);
        }
    },

    async logScreenView(screenName: string, screenClass?: string) {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await FirebaseAnalytics.logEvent({
                name: 'screen_view',
                params: {
                    firebase_screen: screenName,
                    firebase_screen_class: screenClass || 'FirebaseAnalytics',
                },
            });
            console.log(`[Analytics] Screen view logged: ${screenName}`);
        } catch (error) {
            console.error('[Analytics] Failed to log screen view:', error);
        }
    }
};
