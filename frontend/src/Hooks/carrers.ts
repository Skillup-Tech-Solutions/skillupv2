import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export const useGetCarrers = () => {
  return useQuery({
    queryKey: ["carrers"],
    queryFn: async () => {
      try {
        const response = await callApi(apiUrls.carrers, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};
export const useCarrersAddApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.carrers, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carrers"] });
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });
};

export const carrersUpdateApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      status: string;
      description: string;
      jobTitle: string;
      keySkill: string;
      vancancy: string;
      workType: string;
      noOfopening: string;
      salaryRange: string;
    }) => {
      const response = await callApi(
        `${apiUrls.carrers}/${payload.id}`,
        "PUT",
        {
          status: payload.status,
          description: payload.description,
          id: payload.id,
          jobTitle: payload.jobTitle,
          keySkill: payload.keySkill,
          vancancy: payload.vancancy,
          workType: payload.workType,
          noOfopening: payload.noOfopening,
          salaryRange: payload.salaryRange,
        }
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carrers"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
export const carrerStatusUpdateApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      status: string;
    }) => {
      const response = await callApi(
        `${apiUrls.carrersStatus}/${payload.id}`,
        "PUT",
        {
          status: payload.status,
          id: payload.id,
        }
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carrers"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const carrersDeleteApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await callApi(
        `${apiUrls.carrers}/${id}`,
        "DELETE",
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carrers"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
