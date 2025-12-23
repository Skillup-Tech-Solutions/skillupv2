import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export const useGetReviews = () => {
  return useQuery({
    queryKey: ["review"],
    queryFn: async () => {
      try {
        const response = await callApi(apiUrls.reviews, "GET");
        return response as ApiResponse;
      } catch (error) {
        throw error;
      }
    },
  });
};
export const useReviewPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.reviews, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
  });
};
export const useContactPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.contact, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
  });
};
export const useCoursesMail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.coursesMail, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useCategoryMail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.categoryMail, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
  });
};
export const useCarrerMail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await callApi(apiUrls.carrerMail, "POST", data);
      return response as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carrers"] });
    },
  });
};
// export const useOfferAddApi = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (data: any) => {
//       const response = await callApi(apiUrls.offers, "POST", data);
//       return response as ApiResponse;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["offers"] });
//       queryClient.invalidateQueries({ queryKey: ["login"] });
//     },
//   });
// };

// export const offerUpdateApi = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (payload: { id: string; status: string,description:string }) => {
//       const response = await callApi(
//         `${apiUrls.offers}/${payload.id}`,
//         "PUT",
//         {
//          status: payload.status,
//          description: payload.description,
//          id: payload.id
//         }
//       );
//       return response as ApiResponse;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["offers"] });
//     },
//     onError: (error) => {
//       console.error(error);
//     },
//   });
// };

// export const offerDeleteApi = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       const response = await callApi(
//         `${apiUrls.offers}/${id}`,
//         "DELETE",
//       );
//       return response as ApiResponse;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["offers"] });
//     },
//     onError: (error) => {
//       console.error(error);
//     },
//   });
// };