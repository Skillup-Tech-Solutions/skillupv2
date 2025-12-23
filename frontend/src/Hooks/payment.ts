import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";
import Cookies from "js-cookie";

// Using the api interceptor which handles token refresh automatically

export const useGetPaymentSettings = () => {
    return useQuery({
        queryKey: ["paymentSettings"],
        queryFn: async () => {
            const response = await api.get("payment/settings");
            return response.data;
        },
    });
};

export const useGetPaymentSettingsAdmin = () => {
    return useQuery({
        queryKey: ["adminPaymentSettings"],
        queryFn: async () => {
            const response = await api.get("admin/payment/settings");
            return response.data;
        },
    });
};

export const useUpdatePaymentSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.put("admin/payment/settings", data);
            return response.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPaymentSettings"] }),
    });
};

export const useUploadPaymentQR = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            // For file uploads, we need to manually set Content-Type
            const response = await api.post("admin/payment/settings/upload-qr", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPaymentSettings"] })
    });
};

// ===== Payment Management Hooks =====

// Get all pending payments (admin)
export const useGetPendingPayments = (filters?: { status?: string; itemType?: string }) => {
    return useQuery({
        queryKey: ["pendingPayments", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append("status", filters.status);
            if (filters?.itemType) params.append("itemType", filters.itemType);
            const response = await api.get(`admin/pending-payments?${params.toString()}`);
            return response.data;
        },
    });
};

// Mark payment as paid (admin)
export const useMarkPaymentPaid = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ assignmentId, transactionId, notes }: { assignmentId: string; transactionId?: string; notes?: string }) => {
            const response = await api.put(`admin/assignments/${assignmentId}/mark-paid`, { transactionId, notes });
            return response.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pendingPayments"] });
            qc.invalidateQueries({ queryKey: ["assignments"] });
            // Sync payment status across all management pages
            qc.invalidateQueries({ queryKey: ["course-assignments"] });
            qc.invalidateQueries({ queryKey: ["project-requirements"] });
            qc.invalidateQueries({ queryKey: ["internship-assignments"] });
        }
    });
};

// Upload payment proof (student)
export const useUploadPaymentProof = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ assignmentId, formData }: { assignmentId: string; formData: FormData }) => {
            const response = await api.post(
                `student/assignments/${assignmentId}/upload-payment-proof`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return response.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-courses"] });
            qc.invalidateQueries({ queryKey: ["my-projects"] });
            qc.invalidateQueries({ queryKey: ["my-internships"] });
        }
    });
};

// Generate invoice (admin)
export const useGenerateInvoice = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await api.post(`admin/assignments/${assignmentId}/generate-invoice`, {});
            return response.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pendingPayments"] });
        }
    });
};
