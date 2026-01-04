import { RouterProvider } from "react-router-dom";
import "./App.css";
import { ReactQueryProvider } from "./Hooks/ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routes from "./Routes/Routes";
import { useEffect, useState, useRef } from "react";
import { analyticsService } from "./services/analyticsService";
import { initDeepLinkHandler, removeDeepLinkHandler } from "./utils/deepLinkHandler";
import { appUpdateService, type UpdateCheckResult } from "./services/appUpdateService";
import UpdatePrompt from "./Components/UpdatePrompt";
import { Network } from "@capacitor/network";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { hapticFeedback } from "./utils/haptics";
import { StatusBar, Style } from '@capacitor/status-bar';
import { pushNotificationService } from './services/pushNotificationService';
import { authService } from './services/authService';
import config from './Config/Config';

function App() {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // Track when app went to background for proactive token refresh
  const backgroundTimeRef = useRef<number | null>(null);
  const TOKEN_REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

  // Initialize native plugins - OPTIMIZED for cold start performance
  useEffect(() => {
    const initNativePlugins = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Splash screen hiding is controlled by ProtectedRoute for protected pages
        // For non-protected routes (login, signup, home), hide after a short delay
        // This ensures splash doesn't stay forever on public pages
        const { SplashScreen } = await import('@capacitor/splash-screen');
        setTimeout(() => {
          SplashScreen.hide({ fadeOutDuration: 300 });
        }, 1500); // Fallback: hide after 1.5s if ProtectedRoute hasn't hidden it

        // PRIORITY 1: Status bar (visual, must be fast)
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: true });
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#020617' });
        }

        // PRIORITY 3: Defer non-critical initialization to after UI is interactive
        // Uses requestIdleCallback if available, setTimeout fallback
        const deferredInit = () => {
          // Analytics - not needed for immediate UI
          analyticsService.init();

          // Deep links - can be set up after initial render
          initDeepLinkHandler();

          // Push notifications - not blocking
          pushNotificationService.init();
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(deferredInit, { timeout: 2000 });
        } else {
          setTimeout(deferredInit, 100);
        }

      } catch (err) {
        console.warn('Native plugin initialization failed:', err);
      }
    };

    initNativePlugins();

    return () => {
      removeDeepLinkHandler();
    };
  }, []);

  // Initialize app update checking
  useEffect(() => {
    appUpdateService.startUpdateChecks((result) => {
      setUpdateInfo(result);
      setShowUpdatePrompt(true);
    });

    return () => {
      appUpdateService.stopUpdateChecks();
    };
  }, []);

  // Proactive token refresh when app resumes from background
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let appStateListener: any;

    const setupProactiveRefresh = async () => {
      appStateListener = await CapApp.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive) {
          // App going to background - record timestamp
          backgroundTimeRef.current = Date.now();
          console.log('[App] Going to background at:', new Date().toISOString());
        } else {
          // App coming to foreground
          console.log('[App] Resuming from background');

          // Wait for auth service to be ready
          await authService.waitForReady();

          // Check if we have a refresh token (user was logged in)
          const refreshToken = await authService.getRefreshTokenAsync();
          if (!refreshToken) {
            console.log('[App] No refresh token, user not logged in');
            return;
          }

          // Calculate how long app was in background
          const backgroundDuration = backgroundTimeRef.current
            ? Date.now() - backgroundTimeRef.current
            : 0;

          console.log(`[App] Was in background for ${Math.round(backgroundDuration / 1000)}s`);

          // If app was backgrounded for longer than threshold, proactively refresh token
          if (backgroundDuration > TOKEN_REFRESH_THRESHOLD_MS) {
            console.log('[App] Background duration exceeded threshold, refreshing token...');
            try {
              const response = await fetch(`${config.BASE_URL}refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
              });

              if (response.ok) {
                const data = await response.json();
                if (data.accessToken) {
                  authService.set('skToken', data.accessToken);
                  if (data.refreshToken) {
                    authService.set('skRefreshToken', data.refreshToken);
                  }
                  console.log('[App] Token proactively refreshed successfully');
                }
              } else {
                console.warn('[App] Proactive token refresh failed:', response.status);
                // Only logout if it's actually expired (401), not for other errors
                if (response.status === 401) {
                  console.warn('[App] Refresh token expired, will be handled by interceptor');
                }
              }
            } catch (err) {
              console.warn('[App] Proactive token refresh error:', err);
              // Don't logout on network error - let the normal interceptor handle it
            }
          }

          backgroundTimeRef.current = null;
        }
      });
    };

    setupProactiveRefresh();

    return () => {
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, []);

  // Handle update prompt close
  const handleUpdateClose = () => {
    if (updateInfo && !updateInfo.forceUpdate) {
      appUpdateService.dismissUpdate(updateInfo.latestVersion);
      setShowUpdatePrompt(false);
    }
  };

  // Handle update action
  const handleUpdate = () => {
    if (updateInfo?.downloadUrl) {
      appUpdateService.openAppStore(updateInfo.downloadUrl);
    } else {
      // For web, just reload to get latest version
      window.location.reload();
    }
  };

  // Automatic offline detection and redirection (Native & Web)
  useEffect(() => {
    const handleConnectivityChange = (status: { connected: boolean }) => {
      if (!status.connected) {
        // Save the intended URL before redirecting
        const currentPath = window.location.hash.replace("#", "") || "/";
        if (!currentPath.includes("/offline") && !currentPath.includes("/connection-error")) {
          sessionStorage.setItem("intendedUrl", currentPath);
        }

        // Don't redirect if already on offline page
        if (!window.location.hash.includes("/offline")) {
          window.location.href = "/#/offline";
        }
      } else {
        // Auto-reload when back online (if on offline page)
        if (window.location.hash.includes("/offline")) {
          window.location.href = "/#/";
        }
      }
    };

    let networkListener: any;

    const setupNetwork = async () => {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        handleConnectivityChange(status);
        networkListener = await Network.addListener("networkStatusChange", handleConnectivityChange);
      } else {
        // Web fallback
        if (!navigator.onLine) {
          handleConnectivityChange({ connected: false });
        }
        window.addEventListener("offline", () => handleConnectivityChange({ connected: false }));
        window.addEventListener("online", () => handleConnectivityChange({ connected: true }));
      }
    };

    setupNetwork();

    return () => {
      if (networkListener) {
        networkListener.remove();
      }
      window.removeEventListener("offline", () => handleConnectivityChange({ connected: false }));
      window.removeEventListener("online", () => handleConnectivityChange({ connected: true }));
    };
  }, []);

  // Handle Android Hardware Back Button
  useEffect(() => {
    let backListener: any;

    const setupBackButton = async () => {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        backListener = await CapApp.addListener('backButton', (data) => {
          if (!data.canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
            hapticFeedback.impact();
          }
        });
      }
    };

    setupBackButton();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, []);

  return (
    <>
      <ToastContainer limit={2} />
      <ReactQueryProvider>
        <RouterProvider router={routes} />
      </ReactQueryProvider>

      {/* App Update Prompt */}
      <UpdatePrompt
        open={showUpdatePrompt}
        onClose={handleUpdateClose}
        onUpdate={handleUpdate}
        updateInfo={updateInfo}
      />
    </>
  );
}

export default App;
