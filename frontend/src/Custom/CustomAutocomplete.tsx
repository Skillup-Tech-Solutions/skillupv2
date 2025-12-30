import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Box, FormHelperText, Tooltip, Typography } from "@mui/material";
import { get } from "lodash";
import type {
  CustomAutoCompleteProps,
  optionType,
} from "../Interface/interface";
import type { FieldValues } from "react-hook-form";

const CustomAutoComplete = <T extends FieldValues>({
  options,
  label,
  onValueChange,
  value,
  placeholder,
  required,
  multiple,
  helperText,
  errors,
  name,
  register,
  boxSx,
  readonly,
}: CustomAutoCompleteProps<T>) => {
  const truncatedLabel: any =
    label.length > 17 ? `${label.substring(0, 17)}...` : label;
  const errorMessage = get(errors, `${name}.message`, null);

  return (
    <Box sx={{ mb: 2, ...boxSx }}>
      <Typography
        sx={{
          display: "flex",
          padding: "0px 0px 5px 0px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          alignItems: "start",
        }}
      >
        <Tooltip title={label}>{truncatedLabel}</Tooltip>
        {required && (
          <Typography
            sx={{
              color: "#f87171",
              position: "relative",
              left: "4px",
              top: "-3px",
            }}
          >
            *
          </Typography>
        )}
      </Typography>

      <Autocomplete
        {...(register && register(name))}
        options={options || []}
        value={
          multiple
            ? options.filter((option: optionType) =>
              value?.includes(option.value)
            )
            : options?.find((option: optionType) => option.value === value) ||
            null
        }
        multiple={multiple}
        readOnly={readonly}
        onChange={(_, newValue: any) => {
          if (newValue === null || newValue === undefined) {
            onValueChange(multiple ? [] : null);
          } else if (multiple) {
            const selectedValues = (newValue as optionType[]).map(
              (option: optionType) => option.value
            );
            onValueChange(selectedValues);
          } else {
            onValueChange(newValue.value);
          }
          const inputRef = document.querySelector(
            ".MuiAutocomplete-input"
          ) as HTMLInputElement;
          if (inputRef) {
            inputRef.blur();
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            error={!!errorMessage}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                backgroundColor: "rgba(15, 23, 42, 0.5)",
                color: "#f8fafc",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                "& fieldset": {
                  borderColor: errorMessage ? "#f87171" : "#475569",
                },
                "&:hover fieldset": {
                  borderColor: errorMessage ? "#f87171" : "#64748b",
                },
                "&.Mui-focused fieldset": {
                  borderColor: errorMessage ? "#f87171" : "#3b82f6",
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input": {
                padding: "10px 14px !important",
                "&::placeholder": {
                  color: "#64748b",
                  opacity: 1,
                },
              },
              "& .MuiSvgIcon-root": {
                color: "#64748b",
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              pointerEvents: option.disabled ? "none" : "auto",
              opacity: option.disabled ? 0.5 : 1,
              backgroundColor: "transparent",
              color: "#f8fafc",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
            }}
          >
            {option.label}
          </li>
        )}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#1e293b",
              border: "1px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "6px",
              "& .MuiAutocomplete-listbox": {
                padding: "4px",
              },
              "& .MuiAutocomplete-option": {
                color: "#f8fafc",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "rgba(51, 65, 85, 0.5)",
                },
                "&[aria-selected='true']": {
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                },
              },
            },
          },
        }}
        sx={{
          "& .MuiAutocomplete-inputRoot": {
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            borderRadius: "6px",
          },
          "& .MuiAutocomplete-clearIndicator": {
            color: "#64748b",
            "&:hover": { color: "#f8fafc" },
          },
          "& .MuiAutocomplete-popupIndicator": {
            color: "#64748b",
            "&:hover": { color: "#f8fafc" },
          },
        }}
      />

      {helperText && (
        <FormHelperText sx={{ color: "#64748b", fontSize: "12px", mt: 0.5 }}>{helperText}</FormHelperText>
      )}
      {errorMessage && (
        <FormHelperText sx={{ color: "#f87171", fontSize: "12px", mt: 0.5 }}>
          {errorMessage.toString()}
        </FormHelperText>
      )}
    </Box>
  );
};

export default CustomAutoComplete;
