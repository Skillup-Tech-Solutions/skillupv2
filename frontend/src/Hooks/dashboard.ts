import { useQuery } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";

export interface DashboardCounts {
  userCount: number;
  categoryWorkshopCount: number;
  categoryInternshipCount: number;
  courseCount: number;
  carrierCount: number;
}

export const useGetDashboardCountsApi = (monthYear?: string) => {
  return useQuery({
    queryKey: ["dashboard-counts", monthYear],
    queryFn: async () => {
      try {
        const url = monthYear
          ? `${apiUrls.dashboardCounts}/${monthYear}`
          : apiUrls.dashboardCounts;
        const response = await callApi(url, "GET");
        return (response as ApiResponse<DashboardCounts>).data;
      } catch (error) {
        throw error;
      }
    },
  });
};
