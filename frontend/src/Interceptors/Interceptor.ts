import axios from "axios";
import { authService } from "../services/authService";
import config from "../Config/Config";
import "react-toastify/dist/ReactToastify.css";
import { isCapacitor } from "../utils/pwaUtils";

// Global settings
axios.defaults.timeout = 25000;
axios.defaults.baseURL = config.BASE_URL;

let setIsLoading: (isLoading: boolean) => void = () => { };
let setTimeOutModal: (isTimeOut: boolean) => void = () => { };
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

export const setLoaderCallback = (callback: (isLoading: boolean) => void) => {
  setIsLoading = callback;
};

export const setTimeoutModalCallback = (
  callback: (isTimeOut: boolean) => void
) => {
  setTimeOutModal = callback;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Create API instance with base URL
const api = axios.create({
  baseURL: config.BASE_URL,
});

// Shared token refresh handler for both axios and api
const handleTokenRefresh = async (error: any, axiosInstance: typeof axios | typeof api) => {
  const originalRequest = error.config;

  // Handle token expiration
  if (error.response?.status === 401 && !originalRequest._retry) {
    const isNative = isCapacitor();
    if (isNative) {
      await authService.waitForReady();
    }

    const refreshToken = isNative
      ? await authService.getRefreshTokenAsync()
      : authService.getRefreshToken();

    // If no refresh token, redirect to login
    if (!refreshToken) {
      console.warn('[Interceptor] No refresh token found during 401 handling');

      const currentHash = window.location.hash;
      if (!currentHash.includes('login') && !currentHash.includes('signup') && currentHash !== '#/') {
        authService.clearAuth();
        window.location.href = "/#/login";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token: any) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('[Interceptor] Attempting token refresh...');
      const response = await axios.post(`${config.BASE_URL}refresh-token`, {
        refreshToken: refreshToken
      });

      // BACKEND might return accessToken or token
      const newAccessToken = response.data.accessToken || response.data.token;
      // ALSO save new refresh token if backend provides one
      const newRefreshToken = response.data.refreshToken;

      if (!newAccessToken) {
        throw new Error('No access token returned from refresh');
      }

      console.log('[Interceptor] Token refresh successful');

      // Update native storage
      authService.set("skToken", newAccessToken);
      if (newRefreshToken) {
        authService.set("skRefreshToken", newRefreshToken);
      }

      processQueue(null, newAccessToken);
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      console.error('[Interceptor] Token refresh failed:', refreshError);
      processQueue(refreshError, null);
      if (!window.location.hash.includes('login') && !window.location.hash.includes('signup')) {
        authService.clearAuth();
        window.location.href = "/#/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  if (error.code === "ECONNABORTED") {
    setTimeOutModal(true);
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    if (!navigator.onLine) {
      if (!window.location.hash.includes("/offline")) {
        window.location.href = "/#/offline";
      }
    } else {
      const currentPath = window.location.hash;
      if (!currentPath.includes("/connection-error") && !currentPath.includes("/offline")) {
        window.location.href = "/#/connection-error";
      }
    }
  }

  return Promise.reject(error);
};

// Request interceptor for custom api instance
api.interceptors.request.use(
  async (config) => {
    if (isCapacitor()) {
      await authService.waitForReady();
    }

    const token = isCapacitor()
      ? await authService.getTokenAsync()
      : authService.getToken();

    setIsLoading(true);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setIsLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    setIsLoading(false);
    return response;
  },
  async (error) => {
    setIsLoading(false);
    return handleTokenRefresh(error, api);
  }
);

// ===== GLOBAL AXIOS INTERCEPTORS =====

axios.interceptors.request.use(
  async (config) => {
    if (config.url?.includes('login') || config.url?.includes('refresh-token') || config.url?.includes('student-signup')) {
      return config;
    }

    if (isCapacitor()) {
      await authService.waitForReady();
    }

    const token = isCapacitor()
      ? await authService.getTokenAsync()
      : authService.getToken();

    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.config?.url?.includes('refresh-token')) {
      return Promise.reject(error);
    }
    return handleTokenRefresh(error, axios);
  }
);

export default api;
