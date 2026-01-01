import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { callApi } from '../api/apiService';
import { toast } from 'react-toastify';
import { authService } from './authService';
import { analyticsService } from './analyticsService';
import { logger } from '../utils/logger';

const PUSH_TOKEN_KEY = 'fcm_push_token';

export const pushNotificationService = {
    // Initialize push notifications
    async init() {
        if (!Capacitor.isNativePlatform()) {
            logger.log('[Push] Not a native platform, skipping push init');
            return;
        }

        // 1. Request permissions
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            logger.log('[Push] Permission was denied');
            return;
        }

        // 2. Add Listeners first!
        this.addListeners();

        // 3. Create Channels (Android requirement for sound/importance)
        await this.createChannels();

        // 4. Register
        await PushNotifications.register();
    },

    async createChannels() {
        if (Capacitor.getPlatform() !== 'android') return;

        try {
            // High Priority / Alert Channel
            await PushNotifications.createChannel({
                id: 'skillup_alerts',
                name: 'Alerts & Critical Updates',
                description: 'Critical notifications about your courses and account',
                importance: 5, // High importance
                visibility: 1, // Public
                sound: 'default',
                vibration: true
            });

            // Normal Priority / Update Channel
            await PushNotifications.createChannel({
                id: 'skillup_updates',
                name: 'App Updates',
                description: 'General updates about new features and activities',
                importance: 3, // Default importance
                visibility: 1,
                sound: 'default',
                vibration: true
            });

            // Promotions Channel
            await PushNotifications.createChannel({
                id: 'skillup_promotions',
                name: 'Offers & Promotions',
                description: 'Notifications about new offers and program discounts',
                importance: 2, // Low importance
                visibility: 1,
                sound: 'default'
            });

            logger.log('[Push] Notification channels created');
        } catch (error) {
            logger.error('[Push] Failed to create notification channels:', error);
        }
    },

    addListeners() {
        // Registration success
        PushNotifications.addListener('registration', (token) => {
            logger.log('[Push] Registration success. Token:', token.value);
            localStorage.setItem(PUSH_TOKEN_KEY, token.value);

            // Attempt to register with backend if logged in
            this.registerWithBackend(token.value);
        });

        // Registration error
        PushNotifications.addListener('registrationError', (error) => {
            logger.error('[Push] Registration error:', error);
        });

        // Notification received (foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            logger.log('[Push] Notification received:', notification);
            analyticsService.logEvent('notification_foreground', {
                message_id: notification.id,
                title: notification.title,
                body: notification.body,
            });

            // Show local toast or custom UI
            toast.info(notification.title + ': ' + notification.body, {
                autoClose: 5000,
                onClick: () => {
                    // Handle click if needed
                    if (notification.data && notification.data.url) {
                        window.location.href = notification.data.url;
                    }
                }
            });
        });

        // Notification action performed (tap)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            logger.log('[Push] Action performed:', notification);
            analyticsService.logEvent('notification_open', {
                actionId: notification.actionId,
                message_id: notification.notification.id,
                title: notification.notification.title,
            });
            const data = notification.notification.data;

            if (data) {
                if (data.url) {
                    window.location.hash = data.url.startsWith('#') ? data.url : `#${data.url}`;
                } else if (data.type === 'announcement' && data.announcementId) {
                    window.location.hash = `#/student/announcements?id=${data.announcementId}`;
                } else if (data.action) {
                    switch (data.action) {
                        case 'home':
                            window.location.hash = '#/student/dashboard';
                            break;
                        case 'announcements':
                            window.location.hash = '#/student/announcements';
                            break;
                        case 'events':
                            window.location.hash = '#/student/live-sessions';
                            break;
                    }
                }
            }
        });
    },

    // Send token to backend
    async registerWithBackend(token?: string) {
        const fcmToken = token || localStorage.getItem(PUSH_TOKEN_KEY);

        if (!fcmToken) {
            logger.log('[Push] No token to register');
            return;
        }

        if (!authService.isAuthenticated()) {
            logger.log('[Push] User not authenticated, skipping backend registration');
            return;
        }

        try {
            logger.log('[Push] Registering token with backend...');
            const deviceId = localStorage.getItem('skillup_device_id');
            await callApi('/notifications/register-token', 'POST', {
                token: fcmToken,
                platform: Capacitor.getPlatform(),
                deviceId: deviceId || undefined
            });
            logger.log('[Push] Token registered with backend successfully');
        } catch (error) {
            logger.error('[Push] Failed to register token with backend:', error);
        }
    },

    // Unregister token (logout)
    async unregisterFromBackend() {
        const fcmToken = localStorage.getItem(PUSH_TOKEN_KEY);
        if (!fcmToken || !authService.isAuthenticated()) return;

        try {
            const deviceId = localStorage.getItem('skillup_device_id');
            await callApi('/notifications/unregister-token', 'POST', {
                token: fcmToken,
                deviceId: deviceId || undefined
            });
            logger.log('[Push] Token unregistered');
        } catch (error) {
            logger.error('[Push] Failed to unregister token', error);
        }
    }
};
