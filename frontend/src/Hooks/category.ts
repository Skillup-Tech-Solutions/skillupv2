import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export const useGetCategoryApi = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      try {
        const response = await callApi(apiUrls.category, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};
export const useCategoryAddApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.category, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });
};
export const useCategoryUpdateApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; formData: FormData }) => {
      const response = await callApi(
        `${apiUrls.category}/${payload.id}`,
        "PUT",
        payload.formData
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useCategoryDeleteApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await callApi(`${apiUrls.category}/${id}`, "DELETE");
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
