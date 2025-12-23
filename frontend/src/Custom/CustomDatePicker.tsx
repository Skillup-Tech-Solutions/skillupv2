import { Box, FormHelperText, Tooltip, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { get } from "lodash";
import type {
  FieldValues,
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormClearErrors,
} from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import {
  customBox,
  customRelativeBox,
  inputStyle,
  inputStyleColor,
  inputStyleColorLight,
  inputStyleColorRed,
  labelStyle,
  span,
} from "../assets/Styles/CustomInputStyle";

interface CustomDatePickerProps<T extends FieldValues = FieldValues> {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  placeholder?: string;
  required?: boolean;
  errors?: FieldErrors<T>;
  name: Path<T>;
  register?: UseFormRegister<T>;
  clearErrors?: UseFormClearErrors<T>;
  boxSx?: any;
  readonly?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  bgmode?: "light" | "dark";
}

const CustomDatePicker = <T extends FieldValues>({
  label,
  value,
  onChange,
  placeholder,
  required,
  errors,
  name,
  clearErrors,
  boxSx,
  readonly,
  minDate,
  maxDate,
  bgmode = "dark",
}: CustomDatePickerProps<T>) => {
  const truncatedLabel: any =
    label.length > 17 ? `${label.substring(0, 17)}...` : label;
  const errorMessage = get(errors, `${name}.message`, null);

  const handleDateChange = (newValue: Dayjs | null) => {
    // Clear errors when value changes
    if (clearErrors) {
      clearErrors(name);
    }
    onChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ ...customBox, ...boxSx }}>
        <Typography variant="h5" sx={{ ...labelStyle }}>
          <Tooltip title={label}>{truncatedLabel}</Tooltip>
          {required && (
            <Typography variant="h6" sx={{ ...span }}>
              *
            </Typography>
          )}
        </Typography>

        <Box sx={{ ...customRelativeBox }}>
          <DatePicker
            value={value}
            onChange={handleDateChange}
            readOnly={readonly}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                placeholder: placeholder,
                error: !!errorMessage,
                helperText: errorMessage ? errorMessage.toString() : undefined,
                sx: {
                  ...inputStyle,
                  ...(errorMessage
                    ? inputStyleColorRed
                    : bgmode === "dark"
                    ? inputStyleColorLight
                    : inputStyleColor),
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "1px",
                        borderColor: errorMessage
                          ? "#d32f2f"
                          : bgmode === "dark"
                          ? "var(--borderColor)"
                          : "#000",
                      },
                      boxShadow: "none",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: errorMessage
                        ? "#d32f2f"
                        : bgmode === "dark"
                        ? "var(--borderColor)"
                        : "#000",
                      borderWidth: "1px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errorMessage
                        ? "#d32f2f"
                        : bgmode === "dark"
                        ? "var(--borderColor)"
                        : "#000",
                      borderWidth: "1px",
                    },
                    color: errorMessage
                      ? "grey"
                      : bgmode === "dark"
                      ? "var(---grey)"
                      : "#000",
                  },
                  "& .MuiInputBase-input": {
                    padding: "10px",
                    fontSize: "14px",
                  },
                },
              },
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
