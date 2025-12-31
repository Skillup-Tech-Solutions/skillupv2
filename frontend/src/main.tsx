import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import interceptor to register global axios interceptors for token refresh
import './Interceptors/Interceptor'
// Import PWA registration from vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { pushNotificationService } from './services/pushNotificationService';

// Initialize push notifications
pushNotificationService.init();

// Configure Status Bar for native Android/iOS only
const initializeStatusBar = async () => {
  // Only run on native platforms (not web/desktop)
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Set status bar style to light content (white icons on dark background)
    await StatusBar.setStyle({ style: Style.Dark });

    // Make status bar overlay the WebView (content draws behind it)
    await StatusBar.setOverlaysWebView({ overlay: true });

    // Set status bar background color to match app theme
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#020617' });
    }

    console.log('[StatusBar] Configured for native platform');
  } catch (error) {
    console.warn('[StatusBar] Configuration failed:', error);
  }
};

// Initialize status bar
initializeStatusBar();

// React and and App initialization handles the routing logic correctly now.
// Legacy synchronous redirects based on cookies have been removed 
// to support asynchronous native storage initialization on iOS/Android.


// Handle chunk load errors (happens after deployment when old chunks no longer exist)
// This will auto-refresh the page once to get the latest version
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('Failed to fetch dynamically imported module') ||
    event.message?.includes('Loading chunk') ||
    event.message?.includes('ChunkLoadError')
  ) {
    // Only refresh once to avoid infinite loops
    const lastRefresh = sessionStorage.getItem('chunk_error_refresh');
    const now = Date.now();
    if (!lastRefresh || now - parseInt(lastRefresh) > 10000) {
      sessionStorage.setItem('chunk_error_refresh', now.toString());
      console.log('[App] Chunk load error detected, refreshing page...');
      window.location.reload();
    }
  }
});

// Handle unhandled promise rejections for dynamic imports
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('Failed to fetch dynamically imported module') ||
    event.reason?.message?.includes('Loading chunk')
  ) {
    const lastRefresh = sessionStorage.getItem('chunk_error_refresh');
    const now = Date.now();
    if (!lastRefresh || now - parseInt(lastRefresh) > 10000) {
      sessionStorage.setItem('chunk_error_refresh', now.toString());
      console.log('[App] Chunk load error detected, refreshing page...');
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// Register Service Worker with auto-update from vite-plugin-pwa
// This replaces the manual service worker registration
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // New content available, prompt user or auto-update
      if (confirm('New content available. Reload to update?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline');
    },
    onRegistered(registration) {
      console.log('[PWA] Service Worker registered:', registration?.scope);

      // Check for updates periodically (every hour)
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });
}
