/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_BASE_URL: string
    readonly VITE_APP_BASE_URL_MAIN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
