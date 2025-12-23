import get from "lodash/get";
import {
  Box,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  customBox,
  customBoxIcon,
  customRelativeBox,
  inputStyle,
  inputStyleColor,
  inputStyleColorLight,
  inputStyleColorRed,
  labelStyle,
  span,
} from "../assets/Styles/CustomInputStyle";
import React from "react";
import type { CustomInputProps } from "../Interface/interface";
import type { FieldValues } from "react-hook-form";

const CustomInput =  <T extends FieldValues> ({
  label,
  placeholder,
  helperText,
  name,
  type,
  value,
  labelSx,
  inputSx,
  bgmode,
  boxSx,
  icon,
  required,
  readonly,
  register,
  disabled,
  errors,
}: CustomInputProps<T>) => {
  const truncatedLabel: any =
    label.length > 17 ? `${label.substring(0, 17)}...` : label;
  const errorMessage = get(errors, `${name}.message`, null);

  return (
    <Box sx={{ ...customBox,...boxSx }}>
      <Typography variant="h5" sx={{ ...labelStyle, ...labelSx }}>
        <Tooltip title={label}>{truncatedLabel}</Tooltip>
        {required && (
          <Typography variant="h6" sx={{ ...span }}>
            *
          </Typography>
        )}
      </Typography>

      <Box sx={{ ...customRelativeBox }}>
        <TextField
          variant="outlined"
          type={type}
          placeholder={placeholder}
          {...(register && register(name))}
          sx={{
            ...inputStyle,
            ...(errorMessage
              ? inputStyleColorRed
              : bgmode === "dark"
              ? inputStyleColorLight
              : inputStyleColor),
            ...inputSx,
          }}
          helperText={errorMessage ? errorMessage.toString() : helperText}
          error={!!errorMessage}
          name={name as string}
          value={value}
          inputProps={{
            ...(type === "number" && {
              inputMode: "numeric",
              pattern: "[0-9]*",
              min: 0,
              onWheel: (e) => e.currentTarget.blur(),
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "-" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              },
            }),
            ...(type === "email" && {
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === " ") e.preventDefault();
              },
            }),
          }}
          disabled={disabled}
          slotProps={{
            input: {
              readOnly: readonly,
            },
          }}
        />
        <Box sx={{ ...customBoxIcon }}>{icon}</Box>
      </Box>
    </Box>
  );
};

export default CustomInput;
