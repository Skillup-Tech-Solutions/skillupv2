import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await callApi(apiUrls.getUsers, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const userUpdateApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; status: string }) => {
      const response = await callApi(
        `${apiUrls.updateUser}/${payload.id}`,
        "PUT",
        {
          status: payload.status,
          id: payload.id
        }
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
export const userDeleteApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await callApi(
        `${apiUrls.updateUser}/${id}`,
        "DELETE",
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};


export const useChangePasswordApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.changePassword, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};