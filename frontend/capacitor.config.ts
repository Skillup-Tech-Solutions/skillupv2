import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.skillup.app',
    appName: 'SkillUp',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        CapacitorHttp: {
            enabled: true,
        },
        SplashScreen: {
            launchShowDuration: 2500,
            launchAutoHide: true,
            launchFadeOutDuration: 800,
            backgroundColor: '#020617',
            androidSplashResourceName: 'launch_splash',
            androidScaleType: 'CENTER',
            showSpinner: false,
            splashFullScreen: false,
            splashImmersive: false
        },
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
    }
};

export default config;
