import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";
import CustomSnackBar from "../Custom/CustomSnackBar";

export const useGetCoursesApi = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      try {
        const response = await callApi(apiUrls.courses, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const useGetActiveCoursesApi = () => {
  return useQuery({
    queryKey: ["activeCourses"],
    queryFn: async () => {
      try {
        const response = await callApi(`${apiUrls.courses}/status/Active`, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};
export const useCoursesAddApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.courses, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });
};

export const coursesUpdateApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; formData: FormData }) => {
      const response = await callApi(
        `${apiUrls.courses}/${payload.id}`,
        "PUT",
        payload.formData
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const coursesDeleteApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await callApi(
        `${apiUrls.courses}/${id}`,
        "DELETE",
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
// Lessons 
export const useGetLessonApi = () => {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      try {
        const response = await callApi(apiUrls.lessons, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};
export const useSyllabusAddApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.lessons, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });
};
export const lessonUpdateApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; formData: FormData }) => {
      const response = await callApi(
        `${apiUrls.lessons}/${payload.id}`,
        "PUT",
        payload.formData
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
export const SyllabusDeleteApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await callApi(
        `${apiUrls.lessons}/${id}`,
        "DELETE",
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
// Toggle Status
export const useCourseStatusToggleApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await callApi(
        `${apiUrls.courses}/${id}/status`,
        "PATCH" as any
      );
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      CustomSnackBar.successSnackbar("Course status updated successfully!");
    },
    onError: (error) => {
      console.error(error);
      CustomSnackBar.errorSnackbar("Failed to update course status!");
    },
  });
};