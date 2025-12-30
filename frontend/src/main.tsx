import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import interceptor to register global axios interceptors for token refresh
import './Interceptors/Interceptor'
// Import PWA registration from vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

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