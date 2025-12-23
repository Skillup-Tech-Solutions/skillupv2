import type { SxProps, Theme } from "@mui/material";
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiRequestConfig {
  url: string;
  method: HttpMethod;
  data?: Record<string, any>;
  headers?: Record<string, string>;
  responseType?: "json" | "arraybuffer";
}

export interface ApiResponse<T = any> {
  data: T;
  status: boolean;
  message?: string;
  tickets?: T[];
  statusCode?: number;
}

export interface ApiError {
  message: string;
  fullResponse: any;
  status: number;
  errors?: { [key: string]: string };
}

export interface CustomInputProps<T extends FieldValues = FieldValues> {
  label: string;
  placeholder: string;
  helperText?: string;
  name: Path<T>;
  type: string;
  value?: any;
  labelSx?: any;
  inputSx?: any;
  bgmode?: "light" | "dark";
  boxSx?: SxProps<Theme>;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  register?: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  icon?: React.ReactNode;
}

export interface optionType {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CustomAutoCompleteProps<T extends FieldValues = FieldValues> {
  options: optionType[];
  label: string;
  onValueChange: (value: string | string[] | null) => void;
  value: string | string[] | null;
  placeholder?: string;
  required?: boolean;
  multiple?: boolean;
  helperText?: string;
  errors?: FieldErrors<T>;
  name: Path<T>;
  register: UseFormRegister<T>;
  readonly?: boolean;
  boxSx?: any;
}

export interface CustomCheckboxProps {
  name: string;
  label?: string;
  required?: boolean;
  register?: UseFormRegister<FieldValues>;
  inputCursor?: boolean;
  labelsx?: SxProps<Theme>;
  checkboxsx?: SxProps<Theme>;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface customButton {
  label: string;
  variant?: "text" | "contained" | "outlined";
  type: "button" | "submit" | "reset";
  btnSx?: SxProps<Theme>;
  startIcon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface CustomTableColumn {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  hideable?: boolean;
  type?:
    | "string"
    | "number"
    | "date"
    | "dateTime"
    | "boolean"
    | "singleSelect"
    | "actions";
  valueGetter?: (params: any) => any;
  renderCell?: (params: any) => React.ReactNode;
  valueOptions?: string[];
}

export interface CustomTableProps {
  rows: any[];
  columns: CustomTableColumn[];
  loading?: boolean;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  autoHeight?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  columnVisibility?: boolean;
  density?: "compact" | "standard" | "comfortable";
  onRowClick?: (params: any) => void;
  onSelectionModelChange?: (selectionModel: any[]) => void;
  sx?: SxProps<Theme>;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  hideFooterSelectedRowCount?: boolean;
  disableColumnFilter?: boolean;
  disableColumnMenu?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  getRowId?: (row: any) => string | number;
}
