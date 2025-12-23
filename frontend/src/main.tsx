import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import interceptor to register global axios interceptors for token refresh
import './Interceptors/Interceptor'

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
