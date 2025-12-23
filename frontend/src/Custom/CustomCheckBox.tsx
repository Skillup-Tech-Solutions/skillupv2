import { Box, Checkbox, Typography } from "@mui/material";
import type { CustomCheckboxProps } from "../Interface/interface";

export const CustomCheckbox = ({
  name,
  label,
  required = false,
  register,
  inputCursor = false,
  labelsx,
  checkboxsx,
  defaultChecked = false,
  disabled = false,
  onChange,
}: CustomCheckboxProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Checkbox
        {...(register ? register(name) : {})}
        sx={{
          cursor: inputCursor ? "pointer" : "default",
          color: "white",
          padding:"0px",
          "&.Mui-checked": {
            color: "#1976d2", 
          },
          "& .MuiSvgIcon-root": {
            fill: "#1976d2", 
          },
          ...checkboxsx,
        }}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
      />
      {label && (
        <Typography
          sx={{
            fontWeight: "400",
            textAlign: "left",
            fontSize: "14px",
            marginLeft: "10px",
            color: "#fff",
            ...labelsx,
          }}
        >
          {label}
          {required && (
            <span style={{ color: "red", paddingLeft: "3px" }}>*</span>
          )}
        </Typography>
      )}
    </Box>
  );
};
