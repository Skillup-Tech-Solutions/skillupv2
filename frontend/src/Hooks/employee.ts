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
            const response = await api.get("employee/my-payslips");
            return response.data;
        },
    });
};

export const useGetEmployeeDashboardStats = () => {
    return useQuery({
        queryKey: ["employeeDashboardStats"],
        queryFn: async () => {
            const response = await api.get("employee/dashboard-stats");
            return response.data;
        },
    });
};

export const useGetMyAssignedCourses = () => {
    return useQuery({
        queryKey: ["myAssignedCourses"],
        queryFn: async () => {
            const response = await api.get("employee/my-courses");
            return response.data;
        },
    });
};

export const useGetMyAssignedInternships = () => {
    return useQuery({
        queryKey: ["myAssignedInternships"],
        queryFn: async () => {
            const response = await api.get("employee/my-internships");
            return response.data;
        },
    });
};

export const useGetMyAssignedProjects = () => {
    return useQuery({
        queryKey: ["myAssignedProjects"],
        queryFn: async () => {
            const response = await api.get("employee/my-projects");
            return response.data;
        },
    });
};

export const useGetEmployeeProfile = () => {
    return useQuery({
        queryKey: ["employeeProfile"],
        queryFn: async () => {
            const response = await api.get("employee/my-profile");
            return response.data;
        },
    });
};

export const useGetEmployeeLiveSessions = () => {
    return useQuery({
        queryKey: ["employeeLiveSessions"],
        queryFn: async () => {
            const response = await api.get("employee/my-live-sessions");
            return response.data;
        },
    });
};

export const useGetEmployeeAnnouncements = () => {
    return useQuery({
        queryKey: ["employeeAnnouncements"],
        queryFn: async () => {
            const response = await api.get("employee/announcements");
            return response.data;
        },
    });
};

export const useGetCourseDetail = (id: string) => {
    return useQuery({
        queryKey: ["employeeCourseDetail", id],
        queryFn: async () => {
            const response = await api.get(`employee/course/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useGetInternshipDetail = (id: string) => {
    return useQuery({
        queryKey: ["employeeInternshipDetail", id],
        queryFn: async () => {
            const response = await api.get(`employee/internship/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useGetProjectDetail = (id: string) => {
    return useQuery({
        queryKey: ["employeeProjectDetail", id],
        queryFn: async () => {
            const response = await api.get(`employee/project/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};

// --- Student Management Hooks (Employee Portal) ---

export const useEmployeeUploadFiles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const response = await api.post(`employee/assignments/${id}/upload-files`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeCourseDetail"] });
            queryClient.invalidateQueries({ queryKey: ["employeeInternshipDetail"] });
            queryClient.invalidateQueries({ queryKey: ["employeeProjectDetail"] });
        },
    });
};

export const useEmployeeCompleteAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const response = await api.post(`employee/assignments/${id}/complete`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeCourseDetail"] });
            queryClient.invalidateQueries({ queryKey: ["employeeInternshipDetail"] });
        },
    });
};

export const useEmployeeUpdateCertDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`employee/assignments/${id}/certificate-details`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeCourseDetail"] });
            queryClient.invalidateQueries({ queryKey: ["employeeInternshipDetail"] });
        },
    });
};

export const useEmployeeProjectAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, action, data }: { id: string; action: string; data?: any }) => {
            const response = await api.post(`employee/project-assignments/${id}/${action}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeProjectDetail"] });
        },
    });
};

export const useEmployeeGlobalUpload = (type: "course" | "internship" | "project") => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const response = await api.post(`employee/${type}/${id}/materials`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type === "course" ? "employeeCourseDetail" : type === "internship" ? "employeeInternshipDetail" : "employeeProjectDetail"] });
        },
    });
};
