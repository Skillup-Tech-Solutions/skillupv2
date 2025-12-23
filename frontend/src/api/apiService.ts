import {
  type ApiRequestConfig,
  type ApiResponse,
  type ApiError,
  type HttpMethod,
} from "../Interface/interface";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { errornotify, successnotify } from "../Custom/Notify";
import api from "../Interceptors/Interceptor";

export const callApi = async <T>(
  url: string,
  method: HttpMethod,
  data: any = null,
  headers: Record<string, string> = {},
  responseType: "json" | "arraybuffer" = "json"
): Promise<ApiResponse<T> | ArrayBuffer> => {
  const token = Cookies.get("skToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: ApiRequestConfig = {
    method,
    url,
    headers,
    responseType,
    ...(data && { data }),
  };

  try {
    const response = await api.request(config);
    if (
      responseType === "arraybuffer" &&
      response.data instanceof ArrayBuffer
    ) {
      return response.data;
    }

    if (responseType === "json" && typeof response.data === "object") {
      const responseData = response.data as ApiResponse<T>;
      return responseData;
    }

    throw new Error("Unexpected response type");
  } catch (error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: { message?: string; errors?: Record<string, string> };
      };
    };
    const apiError: ApiError = {
      fullResponse: axiosError.response,      
      status: axiosError.response?.status ?? 0,
      message: axiosError.response?.data?.message ?? "An error occurred",
      errors: axiosError.response?.data?.errors,
    };
    throw apiError;
  }
};
