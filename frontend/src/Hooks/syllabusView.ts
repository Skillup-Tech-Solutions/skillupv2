import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export const useGetSyllabusApi = (id: string) => {
  return useQuery({
    queryKey: ["syllabus", id],
    queryFn: async ({ queryKey }) => {
      const [, syllabusId] = queryKey;
      try {
        const response = await callApi(
          `${apiUrls.lessonsNew}/${syllabusId}`,
          "GET"
        );
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id, 
  });
};
