import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { span } from "../assets/Styles/CustomInputStyle";
import {
  errorsFileUpload,
  FileNames,
  fileuploadBox,
  fileuploadBoxLabel,
} from "../assets/Styles/CustomFileUploadStyle";
import config from "../Config/Config";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface CustomFileUploadProps {
  label?: string;
  name: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  error?: { message?: string };
  value?: File | File[] | null | { filename: string; url: string };
  onChange: (file: File | File[] | null) => void;
}

const CustomFileUpload: React.FC<CustomFileUploadProps> = ({
  label = "PNG, JPG or JPEG (max 20KB)",
  name,
  error,
  value,
  required,
  multiple = false,
  accept = "image/png, image/jpeg, image/jpg, image/webp, .jpg, .jpeg, .png, .webp, application/pdf, .pdf, application/msword, .doc, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .docx",
  maxFiles = 10,
  onChange,
}) => {
  const truncatedLabel: any =
    label.length > 17 ? `${label.substring(0, 17)}...` : label;
  const truncateFileName = (
    fileName: string,
    maxLength: number = 20
  ): string => {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split(".").pop();
    const nameWithoutExtension = fileName.substring(
      0,
      fileName.lastIndexOf(".")
    );
    const maxNameLength = maxLength - (extension ? extension.length + 4 : 3); // +4 for "..." and "."

    return `${nameWithoutExtension.substring(0, maxNameLength)}...${
      extension ? "." + extension : ""
    }`;
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (multiple) {
        const fileArray = Array.from(files);
        const currentFiles = Array.isArray(value) ? value : [];
        const newFiles = [...currentFiles, ...fileArray];

        // Check max files limit
        if (newFiles.length > maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          return;
        }

        onChange(newFiles);
      } else {
        const file = files[0];
        onChange(files[0]);
      }
    }
    // Clear the input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleRemoveFile = (index?: number) => {
    if (multiple && Array.isArray(value)) {
      if (typeof index === "number") {
        const updatedFiles = value.filter((_, i) => i !== index);
        onChange(updatedFiles.length > 0 ? updatedFiles : null);
      } else {
        onChange(null);
      }
    } else {
      onChange(null);
    }
  };

  // Helper function to get files as array for consistent rendering
  const getFilesArray = (): File[] => {
    if (!value) return [];

    // Handle case where value is an object with filename and url
    if (
      value &&
      typeof value === "object" &&
      "filename" in value &&
      "url" in value
    ) {
      // If we have a file object with filename and url, we'll display it differently
      return [];
    }

    return Array.isArray(value) ? value : [value as File];
  };

  // Check if we have an image URL to display
  const hasImageUrl = value && typeof value === "object" && "url" in value;

  return (
    <Box sx={{ ...fileuploadBox }}>
      {label && (
        <Typography sx={{ ...fileuploadBoxLabel }}>
          <Tooltip title={label}>{truncatedLabel}</Tooltip>
          {required && (
            <Typography variant="h6" sx={{ ...span }}>
              *
            </Typography>
          )}
        </Typography>
      )}

      {/* Upload Button */}
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{ mt: 1 }}
      >
        {hasImageUrl ? (
          <span className="BoldText">Change Image</span>
        ) : multiple ? (
          <>
            <div>
              <span className="BoldText">Click to upload </span>PNG, JPG,Webp or
              JPEG (Max 20KB)
            </div>
          </>
        ) : (
          <>
            <span className="BoldText">Click to upload </span>PNG, JPG,Webp or
            JPEG (Max 20KB)
          </>
        )}
        <VisuallyHiddenInput
          type="file"
          accept={accept}
          name={name}
          multiple={multiple}
          onChange={handleFileChange}
        />
      </Button>

      {/* Display uploaded files */}
      {getFilesArray().length > 0 && (
        <Box sx={{ mt: 1 }}>
          {getFilesArray().map((file, index) => {
            const isImage = file.type?.startsWith("image/");
            const imageUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <Box key={`${file.name}-${index}`} sx={{ mb: 2 }}>
                {/* Image preview for newly selected files */}
                {isImage && imageUrl && (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      mb: 1,
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={file.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "5px",
                      }}
                      onLoad={() => URL.revokeObjectURL(imageUrl)} // Clean up object URL
                    />
                    <IconButton
                      onClick={() =>
                        handleRemoveFile(multiple ? index : undefined)
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "white",
                        boxShadow: 1,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                )}

                {/* File name */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ ...FileNames }}
                >
                  <Tooltip title={file.name} placement="top">
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: "default",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {truncateFileName(file.name)}
                    </Typography>
                  </Tooltip>
                  {!isImage && (
                    <IconButton
                      onClick={() =>
                        handleRemoveFile(multiple ? index : undefined)
                      }
                      size="small"
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  )}
                </Stack>
              </Box>
            );
          })}

          {multiple && getFilesArray().length > 1 && (
            <Typography variant="caption" color="text.secondary">
              {getFilesArray().length} files selected
            </Typography>
          )}
        </Box>
      )}

      {/* Display image from URL if available */}
      {hasImageUrl && value && "url" in value && (
        <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
          <img
            src={`${config.BASE_URL_MAIN}${value.url}`}
            alt={value.filename || "Uploaded image"}
            style={{
              maxWidth: "100%",
              maxHeight: "100px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "5px",
            }}
          />
          {/* Delete icon */}
          <IconButton
            onClick={() => handleRemoveFile()}
            size="small"
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "white",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>

          <Tooltip title={value.filename}>
            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 0.5, cursor: "pointer" }}
            >
              {value.filename
                ? truncateFileName(value.filename)
                : "Uploaded image"}
            </Typography>
          </Tooltip>
        </Box>
      )}

      {error?.message && (
        <Typography
          variant="caption"
          color="error"
          sx={{ ...errorsFileUpload }}
        >
          {error.message}
        </Typography>
      )}
    </Box>
  );
};

export default CustomFileUpload;
