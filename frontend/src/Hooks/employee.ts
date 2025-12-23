import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";

// Using the api interceptor which handles token refresh automatically
// No need for manual auth headers - the interceptor adds them

// --- Employee Hooks ---

export const useGetEmployees = () => {
    return useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const response = await api.get("admin/employees");
            return response.data;
        },
    });
};

export const useGetEmployeeById = (id: string) => {
    return useQuery({
        queryKey: ["employee", id],
        queryFn: async () => {
            const response = await api.get(`admin/employees/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("admin/employees", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
};

export const useUpdateEmployeeProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`admin/employees/${id}`, data);
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
        },
    });
};

export const useUpdateSalaryStructure = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.post(`admin/employees/${id}/salary`, data);
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
        },
    });
};

// --- Payroll Hooks ---

export const useGeneratePayslip = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("admin/payroll/generate", data);
            return response.data;
        },
    });
};

export const useGetPayslipHistory = (month?: string, year?: string, employeeId?: string) => {
    return useQuery({
        queryKey: ["payslips", month, year, employeeId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (month) params.append("month", month);
            if (year) params.append("year", year);
            if (employeeId) params.append("employeeId", employeeId);

            const response = await api.get(`admin/payroll/history?${params.toString()}`);
            return response.data;
        },
    });
};

export const useSendPayslipEmail = () => {
    return useMutation({
        mutationFn: async (data: { payslipId: string; type: string }) => {
            const response = await api.post("admin/payroll/send-email", data);
            return response.data;
        },
    });
};

export const useGetPayrollSettings = () => {
    return useQuery({
        queryKey: ["payrollSettings"],
        queryFn: async () => {
            const response = await api.get("admin/payroll/settings");
            return response.data;
        },
    });
};

export const useUpdatePayrollSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.put("admin/payroll/settings", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payrollSettings"] });
        },
    });
};

// --- Employee Portal Hooks ---

export const useGetMyPayslips = () => {
    return useQuery({
        queryKey: ["myPayslips"],
        queryFn: async () => {
            const response = await api.get("employee/payslips");
            return response.data;
        },
    });
};
