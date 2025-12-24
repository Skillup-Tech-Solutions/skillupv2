/// <reference types="vite/client" />

// PWA virtual module types
declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
        onRegisterError?: (error: Error) => void;
    }

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

interface ImportMetaEnv {
    readonly VITE_APP_BASE_URL: string
    readonly VITE_APP_BASE_URL_MAIN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
