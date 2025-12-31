import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { callApi } from '../api/apiService';
import { toast } from 'react-toastify';
import { authService } from './authService';
import { analyticsService } from './analyticsService';

const PUSH_TOKEN_KEY = 'fcm_push_token';

export const pushNotificationService = {
    // Initialize push notifications
    async init() {
        if (!Capacitor.isNativePlatform()) {
            console.log('[Push] Not a native platform, skipping push init');
            return;
        }

        // 1. Request permissions
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.log('[Push] Permission was denied');
            return;
        }

        // 2. Add Listeners first!
        this.addListeners();

        // 3. Register
        await PushNotifications.register();
    },

    addListeners() {
        // Registration success
        PushNotifications.addListener('registration', (token) => {
            console.log('[Push] Registration success. Token:', token.value);
            localStorage.setItem(PUSH_TOKEN_KEY, token.value);

            // Attempt to register with backend if logged in
            this.registerWithBackend(token.value);
        });

        // Registration error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('[Push] Registration error:', error);
        });

        // Notification received (foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[Push] Notification received:', notification);
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
            console.log('[Push] Action performed:', notification);
            analyticsService.logEvent('notification_open', {
                actionId: notification.actionId,
                message_id: notification.notification.id,
                title: notification.notification.title,
            });
            const data = notification.notification.data;

            if (data) {
                // Handle navigation
                if (data.url) {
                    if (data.url.startsWith('http')) {
                        window.location.href = data.url;
                    } else {
                        window.location.href = data.url;
                    }
                } else if (data.action) {
                    switch (data.action) {
                        case 'home':
                            window.location.href = '/dashboard';
                            break;
                        case 'events':
                            window.location.href = '/live-sessions?tab=events';
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
            console.log('[Push] No token to register');
            return;
        }

        if (!authService.isAuthenticated()) {
            console.log('[Push] User not authenticated, skipping backend registration');
            return;
        }

        try {
            console.log('[Push] Registering token with backend...');
            await callApi('/notifications/register-token', 'POST', {
                token: fcmToken,
                platform: Capacitor.getPlatform()
            });
            console.log('[Push] Token registered with backend successfully');
        } catch (error) {
            console.error('[Push] Failed to register token with backend:', error);
        }
    },

    // Unregister token (logout)
    async unregisterFromBackend() {
        const fcmToken = localStorage.getItem(PUSH_TOKEN_KEY);
        if (!fcmToken || !authService.isAuthenticated()) return;

        try {
            await callApi('/notifications/unregister-token', 'POST', {
                token: fcmToken
            });
            console.log('[Push] Token unregistered');
        } catch (error) {
            console.error('[Push] Failed to unregister token', error);
        }
    }
};
