import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import interceptor to register global axios interceptors for token refresh
import './Interceptors/Interceptor'

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

// Register Service Worker for image caching (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('[App] Service Worker registration failed:', error);
      });
  });
}
