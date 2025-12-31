import { Button } from "@mui/material";
import type { customButton } from "../Interface/interface";

// Premium dark theme button style matching student dashboard
export const customBtnStyle = {
  width: "100%",
  marginTop: "12px",
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  fontSize: "14px",
  backgroundColor: "#3b82f6", // blue-500
  border: "none",
  color: "#ffffff",
  textTransform: "none" as const,
  padding: "12px 24px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
  boxShadow: "0 0 0 0 transparent",
  "&:hover": {
    backgroundColor: "#2563eb", // blue-600
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  "&:disabled": {
    backgroundColor: "#475569", // slate-600
    color: "#94a3b8", // slate-400
  }
}

const CustomButton = ({
  label,
  variant = "contained",
  type,
  btnSx,
  startIcon,
  onClick,
  disabled,
}: customButton) => {
  return (
    <Button
      variant={variant ? variant : "contained"}
      type={type}
      sx={{
        ...customBtnStyle,
        ...btnSx,
        ...(variant === "outlined" && {
          backgroundColor: "transparent",
          color: "#60a5fa", // blue-400
          border: "1px solid rgba(96, 165, 250, 0.5)",
          "&:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "#60a5fa",
          }
        }),
      }}
      startIcon={startIcon}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
