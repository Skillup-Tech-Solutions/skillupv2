import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Box, FormHelperText, Tooltip, Typography } from "@mui/material";
import {
  customAutoComplete,
  customAutoCompleteBox,
  customAutoCompleteBoxError,
} from "../assets/Styles/CustomAutoCompleteStyle";
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
    <Box sx={{ ...customAutoComplete, ...boxSx }}>
      <Typography
        sx={{
          display: "flex",
          padding: "0px 0px 3px 0px",
          fontFamily: "Regular_M",
          fontSize: "12px",
          height: "22px",
          alignItems: "start",
        }}
      >
        <Tooltip title={label}>{truncatedLabel}</Tooltip>
        {required && (
          <Typography
            sx={{
              color: "var(--buttonPrimary)",
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
            sx={
              errorMessage
                ? { ...customAutoCompleteBoxError }
                : { ...customAutoCompleteBox }
            }
          />
        )}
        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              pointerEvents: option.disabled ? "none" : "auto",
              opacity: option.disabled ? 0.5 : 1,
            }}
          >
            {option.label}
          </li>
        )}
        sx={{
          "& .MuiAutocomplete-inputRoot": {
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          },
        }}
      />

      {helperText && (
        <FormHelperText sx={{ color: "#d32f2f" }}>{helperText}</FormHelperText>
      )}
      {errorMessage && (
        <FormHelperText sx={{ color: "#d32f2f" }}>
          {errorMessage.toString()}
        </FormHelperText>
      )}
    </Box>
  );
};

export default CustomAutoComplete;
