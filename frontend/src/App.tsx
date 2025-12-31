import { RouterProvider } from "react-router-dom";
import "./App.css";
import { ReactQueryProvider } from "./Hooks/ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routes from "./Routes/Routes";
import { useEffect } from "react";
import { analyticsService } from "./services/analyticsService";

function App() {
  useEffect(() => {
    analyticsService.init();
  }, []);

  // Automatic offline detection and redirection
  useEffect(() => {
    const handleOffline = () => {
      // Save the intended URL before redirecting
      const currentPath = window.location.hash.replace("#", "") || "/";
      if (!currentPath.includes("/offline") && !currentPath.includes("/connection-error")) {
        sessionStorage.setItem("intendedUrl", currentPath);
      }

      // Don't redirect if already on offline page
      if (!window.location.hash.includes("/offline")) {
        window.location.href = "/#/offline";
      }
    };

    const handleOnline = () => {
      // Auto-reload when back online (if on offline page)
      if (window.location.hash.includes("/offline")) {
        window.location.href = "/#/";
      }
    };

    // Check initial online status
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  return (
    <>
      <ToastContainer limit={2} />
      <ReactQueryProvider>
        <RouterProvider router={routes} />
      </ReactQueryProvider>
    </>
  );
}

export default App;
