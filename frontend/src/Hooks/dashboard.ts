import { useQuery } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";

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
        const response = await callApi<DashboardCounts>(url, "GET");
        // API returns counts directly, not wrapped in {data: ...}
        return response as unknown as DashboardCounts;
      } catch (error) {
        throw error;
      }
    },
  });
};

