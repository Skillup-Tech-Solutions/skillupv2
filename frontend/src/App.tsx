import { RouterProvider } from "react-router-dom";
import "./App.css";
import { ReactQueryProvider } from "./Hooks/ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routes from "./Routes/Routes";
import { useEffect, useState } from "react";
import { analyticsService } from "./services/analyticsService";
import { initDeepLinkHandler, removeDeepLinkHandler } from "./utils/deepLinkHandler";
import { appUpdateService, type UpdateCheckResult } from "./services/appUpdateService";
import UpdatePrompt from "./Components/UpdatePrompt";
import { Network } from "@capacitor/network";
import { App as CapApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";
import { hapticFeedback } from "./utils/haptics";
import { StatusBar, Style } from '@capacitor/status-bar';
import { pushNotificationService } from './services/pushNotificationService';

function App() {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // Initialize analytics, deep link handler, and native plugins
  useEffect(() => {
    const initNativePlugins = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Analytics & Deep Links
        analyticsService.init();
        initDeepLinkHandler();

        // Push Notifications
        pushNotificationService.init();

        // Status Bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: true });
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#020617' });
        }

        // Hide splash screen after small delay to ensure React has rendered at least once
        setTimeout(() => {
          SplashScreen.hide({
            fadeOutDuration: 800
          });
        }, 300);
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
