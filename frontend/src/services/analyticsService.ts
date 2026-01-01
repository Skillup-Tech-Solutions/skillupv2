import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export const analyticsService = {
    async init() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            logger.log('[Analytics] Initializing...');
            // No need for setCollectionEnabled as it's enabled by default
        } catch (error) {
            logger.error('[Analytics] Initialization failed:', error);
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
            logger.error(`[Analytics] Failed to log event ${name}:`, error);
        }
    },

    async setUserId(userId: string) {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await FirebaseAnalytics.setUserId({
                userId,
            });
        } catch (error) {
            logger.error('[Analytics] Failed to set user ID:', error);
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
            logger.log(`[Analytics] Screen view logged: ${screenName}`);
        } catch (error) {
            logger.error('[Analytics] Failed to log screen view:', error);
        }
    }
};
