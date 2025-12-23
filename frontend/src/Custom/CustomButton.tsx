import { Button } from "@mui/material";
import type { customButton } from "../Interface/interface";

export const customBtnStyle ={
    width: "100%",
    marginTop:"10px",
    fontWeight:"500",
    backgroundColor:"var(--webprimary)",
    fontFamily:"Medium_W",
    fontSize:"12px",
    border: "solid 1px var(--webprimary)",
    color: "var(--white)",
    textTransform: "capitalize",
    padding: "8px 20px",
    transition: "all 0.3s ease",
    "&:hover": {
        backgroundColor: "transparent",
        color: "var(--webprimary)",
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
          color: "var(--webprimary)",
          border: "solid 1px var(--webprimary)",
          "&:hover": {
            backgroundColor: "var(--webprimary)",
            color: "var(--white)",
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
