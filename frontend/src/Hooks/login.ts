import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export const useLoginApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.login, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });
};
export const useRegisterApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.signUp, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
export const verifyOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.verifyOtp, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
export const forgetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.forgotPassword, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["login"] });
      // queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
export const resetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.resetPassword, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["login"] });
      // queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
