import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.skillup.app',
    appName: 'SkillUp',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    android: {
        // Improved cold start performance
        backgroundColor: '#020617', // Match splash to avoid flash
        allowMixedContent: false,
    },
    plugins: {
        CapacitorHttp: {
            enabled: true,
        },
        SplashScreen: {
            // OPTIMIZATION: Reduced duration for faster perceived startup
            launchShowDuration: 1200, // Reduced from 2500ms
            launchAutoHide: true,
            launchFadeOutDuration: 300, // Reduced from 800ms for snappier feel
            backgroundColor: '#020617',
            androidSplashResourceName: 'launch_splash',
            androidScaleType: 'CENTER',
            showSpinner: false,
            splashFullScreen: true, // Immersive for cleaner transition
            splashImmersive: true
        },
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
    }
};

export default config;
