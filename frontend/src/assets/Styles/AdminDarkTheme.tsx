// Dark Theme Styles for Admin Pages - Matching Student Dashboard

// DataGrid dark theme styling
export const dataGridDarkStyles = {
    bgcolor: "rgba(30, 41, 59, 0.4)",
    border: "1px solid rgba(71, 85, 105, 0.6)",
    borderRadius: "6px",
    "& .MuiDataGrid-columnHeaders": {
        bgcolor: "rgba(15, 23, 42, 0.8)",
        color: "#94a3b8",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "'JetBrains Mono', monospace",
        borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
    },
    "& .MuiDataGrid-columnHeader": {
        "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-row": {
        bgcolor: "transparent",
        color: "#f8fafc",
        "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" },
        "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
    },
    "& .MuiDataGrid-cell": {
        borderColor: "rgba(71, 85, 105, 0.4)",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
        "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-footerContainer": {
        bgcolor: "rgba(15, 23, 42, 0.5)",
        borderTop: "1px solid rgba(71, 85, 105, 0.4)",
        color: "#94a3b8",
    },
    "& .MuiTablePagination-root": { color: "#94a3b8" },
    "& .MuiTablePagination-selectIcon": { color: "#64748b" },
    "& .MuiIconButton-root": { color: "#64748b" },
    "& .MuiDataGrid-overlay": {
        bgcolor: "rgba(15, 23, 42, 0.8)",
        color: "#94a3b8",
    },
};

// TextField dark theme styling
export const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        color: "#f8fafc",
        bgcolor: "rgba(15, 23, 42, 0.5)",
        borderRadius: "6px",
        fontFamily: "'Inter', sans-serif",
        fontSize: "14px",
        "& fieldset": { borderColor: "#475569" },
        "&:hover fieldset": { borderColor: "#64748b" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    },
    "& .MuiInputLabel-root": {
        color: "#94a3b8",
        fontFamily: "'Inter', sans-serif",
        "&.Mui-focused": { color: "#60a5fa" },
    },
    "& .MuiSelect-icon": { color: "#64748b" },
};

// Dialog dark theme styling
export const dialogDarkStyles = {
    "& .MuiDialog-paper": {
        bgcolor: "#1e293b",
        border: "1px solid rgba(71, 85, 105, 0.5)",
        borderRadius: "6px",
    },
    "& .MuiBackdrop-root": {
        bgcolor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(8px)",
    },
};

// Primary button styling
export const primaryButtonDarkStyles = {
    bgcolor: "#3b82f6",
    color: "#fff",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    px: 2.5,
    py: 1,
    "&:hover": { bgcolor: "#2563eb" },
    "&:disabled": { bgcolor: "#475569", color: "#94a3b8" },
};

// Cancel button styling
export const cancelButtonDarkStyles = {
    bgcolor: "#334155",
    color: "#f8fafc",
    borderRadius: "6px",
    px: 3,
    py: 1,
    fontWeight: 500,
    fontSize: "13px",
    "&:hover": { bgcolor: "#475569" },
};

// Danger button styling
export const dangerButtonDarkStyles = {
    bgcolor: "#ef4444",
    color: "#fff",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    px: 2.5,
    py: 1,
    "&:hover": { bgcolor: "#dc2626" },
};

// Success button styling
export const successButtonDarkStyles = {
    bgcolor: "#22c55e",
    color: "#fff",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    px: 2.5,
    py: 1,
    "&:hover": { bgcolor: "#16a34a" },
};

// Card container styling
export const cardDarkStyles = {
    bgcolor: "rgba(30, 41, 59, 0.4)",
    border: "1px solid rgba(71, 85, 105, 0.6)",
    borderRadius: "6px",
    p: 3,
};

// Page header styling
export const pageHeaderStyles = {
    fontSize: "24px",
    fontFamily: "'Chivo', sans-serif",
    fontWeight: 700,
    color: "#f8fafc",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    m: 0,
};

// Section title styling
export const sectionTitleStyles = {
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
};

// Badge/chip styling helper
export const getBadgeStyles = (variant: "success" | "error" | "warning" | "info" | "purple" | "cyan" | "default") => {
    const variants = {
        success: { color: "#4ade80", bgcolor: "rgba(22, 101, 52, 0.3)", borderColor: "rgba(34, 197, 94, 0.4)" },
        error: { color: "#f87171", bgcolor: "rgba(127, 29, 29, 0.3)", borderColor: "rgba(239, 68, 68, 0.4)" },
        warning: { color: "#fbbf24", bgcolor: "rgba(120, 53, 15, 0.3)", borderColor: "rgba(245, 158, 11, 0.4)" },
        info: { color: "#60a5fa", bgcolor: "rgba(30, 58, 138, 0.3)", borderColor: "rgba(59, 130, 246, 0.4)" },
        purple: { color: "#c084fc", bgcolor: "rgba(88, 28, 135, 0.3)", borderColor: "rgba(168, 85, 247, 0.4)" },
        cyan: { color: "#22d3ee", bgcolor: "rgba(22, 78, 99, 0.3)", borderColor: "rgba(6, 182, 212, 0.4)" },
        default: { color: "#94a3b8", bgcolor: "rgba(51, 65, 85, 0.3)", borderColor: "rgba(71, 85, 105, 0.4)" },
    };
    return {
        px: 1.5,
        py: 0.5,
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        border: `1px solid ${variants[variant].borderColor}`,
        ...variants[variant],
    };
};

// Table/Select Menu styling
export const menuDarkStyles = {
    PaperProps: {
        sx: {
            bgcolor: "#1e293b",
            border: "1px solid rgba(71, 85, 105, 0.5)",
            borderRadius: "6px",
            "& .MuiMenuItem-root": {
                color: "#f8fafc",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" },
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" },
            },
        },
    },
};
