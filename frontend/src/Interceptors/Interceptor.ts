import Cookies from 'js-cookie';
import axios from "axios";
import config from "../Config/Config";
import "react-toastify/dist/ReactToastify.css";

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
    const refreshToken = Cookies.get("skRefreshToken");

    // If no refresh token, redirect to login
    if (!refreshToken) {
      Cookies.remove("skToken");
      Cookies.remove("skRefreshToken");
      window.location.href = "/#/login";
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use a clean axios call without interceptors to avoid loops
      const response = await axios.post(`${config.BASE_URL}refresh-token`, {
        refreshToken: refreshToken
      });

      const newAccessToken = response.data.accessToken;

      // Store new access token
      const isProduction = window.location.protocol === 'https:';
      Cookies.set("skToken", newAccessToken, {
        path: "/",
        sameSite: "strict",
        ...(isProduction && { secure: true })
      });

      // Process queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      processQueue(refreshError, null);
      Cookies.remove("skToken");
      Cookies.remove("skRefreshToken");
      Cookies.remove("email");
      Cookies.remove("role");
      Cookies.remove("name");
      window.location.href = "/#/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  if (error.code === "ECONNABORTED") {
    setTimeOutModal(true);
  }
  return Promise.reject(error);
};

// ===== APPLY INTERCEPTORS TO BOTH axios AND api =====

// Request interceptor for custom api instance
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("skToken");
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

// Response interceptor for custom api instance
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
// Apply same logic to global axios so all files using axios get token refresh

axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get("skToken");
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
    return handleTokenRefresh(error, axios);
  }
);

export default api;
