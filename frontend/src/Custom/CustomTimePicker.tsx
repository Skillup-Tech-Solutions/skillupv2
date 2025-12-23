import { Box, FormHelperText, Tooltip, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
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

interface CustomTimePickerProps<T extends FieldValues = FieldValues> {
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
  bgmode?: "light" | "dark";
  minTime?: Dayjs;
  maxTime?: Dayjs;
  selectedDate?: Dayjs | null;
}

const CustomTimePicker = <T extends FieldValues>({
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
  bgmode = "dark",
  minTime,
  maxTime,
  selectedDate,
}: CustomTimePickerProps<T>) => {
  const truncatedLabel: any =
    label.length > 17 ? `${label.substring(0, 17)}...` : label;
  const errorMessage = get(errors, `${name}.message`, null);

  // Calculate minimum time based on selected date and passed minTime
  const getMinTime = () => {
    // If minTime is explicitly passed, use it (this handles end time after start time)
    if (minTime) {
      return minTime;
    }

    // If selected date is today, minimum time is current time
    if (selectedDate && selectedDate.isSame(dayjs(), "day")) {
      return dayjs();
    }

    return undefined;
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
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
          <TimePicker
            value={value}
            onChange={handleTimeChange}
            readOnly={readonly}
            minTime={getMinTime()}
            maxTime={maxTime}
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
                          ? "green"
                          : bgmode === "dark"
                          ? "var(--borderColor)"
                          : "#000",
                      },
                      boxShadow: "none",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: errorMessage
                        ? "green"
                        : bgmode === "dark"
                        ? "var(--borderColor)"
                        : "#000",
                      borderWidth: "1px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errorMessage
                        ? "green"
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

export default CustomTimePicker;
