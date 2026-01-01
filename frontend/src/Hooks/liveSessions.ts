import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";
import type { ApiResponse } from "../Interface/interface";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { CACHE_TIMES } from "./ReactQueryProvider";
import { getDeviceId, getPlatform } from "../utils/deviceInfo";

// Types
export interface LiveSession {
    _id: string;
    title: string;
    description: string;
    sessionType: "COURSE" | "PROJECT" | "INTERNSHIP";
    referenceId: string;
    referenceName: string;
    hostId: string;
    hostName: string;
    scheduledAt: string;
    durationMinutes: number;
    status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
    roomId: string;
    participants: Array<{
        name: string;
        email: string;
        joinedAt: string;
        leftAt?: string;
    }>;
    maxParticipants: number;
    activeParticipantsCount?: number;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSessionPayload {
    title: string;
    description?: string;
    sessionType: "COURSE" | "PROJECT" | "INTERNSHIP";
    referenceId: string;
    scheduledAt: string;
    durationMinutes?: number;
}

// Get all sessions (admin)
export const useGetLiveSessionsApi = (filters?: {
    sessionType?: string;
    referenceId?: string;
    status?: string;
    includeEnded?: boolean;
}) => {
    const queryParams = new URLSearchParams();
    if (filters?.sessionType) queryParams.append("sessionType", filters.sessionType);
    if (filters?.referenceId) queryParams.append("referenceId", filters.referenceId);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.includeEnded) queryParams.append("includeEnded", "true");

    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrls.liveSessions}?${queryString}` : apiUrls.liveSessions;

    return useQuery({
        queryKey: ["liveSessions", filters],
        queryFn: async () => {
            const response = await callApi(url, "GET");
            return response as ApiResponse & { sessions: LiveSession[] };
        },
        ...CACHE_TIMES.SHORT,
    });
};

// Get sessions by reference (course/project/internship)
export const useGetSessionsByReferenceApi = (
    type: "COURSE" | "PROJECT" | "INTERNSHIP",
    referenceId: string,
    includeEnded: boolean = false
) => {
    return useQuery({
        queryKey: ["liveSessions", "reference", type, referenceId, includeEnded],
        queryFn: async () => {
            const url = `${apiUrls.liveSessions}/reference/${type}/${referenceId}${includeEnded ? "?includeEnded=true" : ""}`;
            const response = await callApi(url, "GET");
            return response as ApiResponse & { sessions: LiveSession[] };
        },
        enabled: !!referenceId,
        ...CACHE_TIMES.SHORT,
    });
};

// Get live sessions (currently active)
// Note: Real-time updates via Socket.IO (useLiveSessionSocket hook)
export const useGetLiveNowSessionsApi = (filters?: {
    sessionType?: string;
    referenceId?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (filters?.sessionType) queryParams.append("sessionType", filters.sessionType);
    if (filters?.referenceId) queryParams.append("referenceId", filters.referenceId);

    const queryString = queryParams.toString();
    const url = queryString
        ? `${apiUrls.liveSessions}/live?${queryString}`
        : `${apiUrls.liveSessions}/live`;

    return useQuery({
        queryKey: ["liveSessions", "live", filters],
        queryFn: async () => {
            const response = await callApi(url, "GET");
            return response as ApiResponse & { sessions: LiveSession[] };
        },
        // No polling - real-time updates come via Socket.IO
        ...CACHE_TIMES.SHORT,
    });
};

// Get upcoming sessions
export const useGetUpcomingSessionsApi = (filters?: {
    sessionType?: string;
    referenceId?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (filters?.sessionType) queryParams.append("sessionType", filters.sessionType);
    if (filters?.referenceId) queryParams.append("referenceId", filters.referenceId);

    const queryString = queryParams.toString();
    const url = queryString
        ? `${apiUrls.liveSessions}/upcoming?${queryString}`
        : `${apiUrls.liveSessions}/upcoming`;

    return useQuery({
        queryKey: ["liveSessions", "upcoming", filters],
        queryFn: async () => {
            const response = await callApi(url, "GET");
            return response as ApiResponse & { sessions: LiveSession[] };
        },
        ...CACHE_TIMES.SHORT,
    });
};

// Get session history (ended sessions)
export const useGetSessionHistoryApi = (filters?: {
    sessionType?: string;
    referenceId?: string;
    limit?: number;
}) => {
    const queryParams = new URLSearchParams();
    if (filters?.sessionType) queryParams.append("sessionType", filters.sessionType);
    if (filters?.referenceId) queryParams.append("referenceId", filters.referenceId);
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
        ? `${apiUrls.liveSessions}/history?${queryString}`
        : `${apiUrls.liveSessions}/history`;

    return useQuery({
        queryKey: ["liveSessions", "history", filters],
        queryFn: async () => {
            const response = await callApi(url, "GET");
            return response as ApiResponse & { sessions: LiveSession[] };
        },
        ...CACHE_TIMES.SHORT,
    });
};

// Get single session
export const useGetSessionApi = (sessionId: string) => {
    return useQuery({
        queryKey: ["liveSessions", sessionId],
        queryFn: async () => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}`, "GET");
            return response as ApiResponse & { session: LiveSession };
        },
        enabled: !!sessionId,
    });
};

// Create session
export const useCreateSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateSessionPayload) => {
            const response = await callApi(apiUrls.liveSessions, "POST", data);
            return response as ApiResponse & { session: LiveSession };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            CustomSnackBar.successSnackbar("Session scheduled successfully!");
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to schedule session");
        },
    });
};

// Update session
export const useUpdateSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { id: string; data: Partial<CreateSessionPayload> }) => {
            const response = await callApi(
                `${apiUrls.liveSessions}/${payload.id}`,
                "PUT",
                payload.data
            );
            return response as ApiResponse & { session: LiveSession };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            CustomSnackBar.successSnackbar("Session updated successfully!");
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to update session");
        },
    });
};

// Start session
export const useStartSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}/start`, "PATCH" as any);
            return response as ApiResponse & { session: LiveSession };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            CustomSnackBar.successSnackbar("Session started! Students can now join.");
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to start session");
        },
    });
};

// End session
export const useEndSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}/end`, "PATCH" as any);
            return response as ApiResponse & { session: LiveSession };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            CustomSnackBar.successSnackbar("Session ended successfully.");
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to end session");
        },
    });
};

// Cancel session
export const useCancelSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}/cancel`, "PATCH" as any);
            return response as ApiResponse & { session: LiveSession };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            CustomSnackBar.successSnackbar("Session cancelled.");
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to cancel session");
        },
    });
};

// Delete session
export const useDeleteSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}`, "DELETE");
            return response as ApiResponse;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            CustomSnackBar.successSnackbar("Session deleted successfully.");
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to delete session");
        },
    });
};

// Join session (for tracking)
export const useJoinSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}/join`, "POST", {
                deviceId: getDeviceId(),
                platform: getPlatform()
            });
            return response as ApiResponse & { session: LiveSession; roomId: string };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
            queryClient.invalidateQueries({ queryKey: ["activeSession"] });
        },
        onError: (error: any) => {
            console.error(error);
            CustomSnackBar.errorSnackbar(error.message || "Failed to join session");
        },
    });
};

// Leave session (for tracking)
export const useLeaveSessionApi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await callApi(`${apiUrls.liveSessions}/${sessionId}/leave`, "POST");
            return response as ApiResponse;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
        },
        onError: (error: any) => {
            console.error(error);
        },
    });
};
