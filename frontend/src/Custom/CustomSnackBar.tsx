import { Alert, Snackbar } from "@mui/material";
import { useState, useEffect } from "react";
import type { AlertColor } from "@mui/material";
import { createRoot } from "react-dom/client";

interface CustomSnackBarProps {
  message: string;
  severity?: AlertColor;
  open: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  position?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

const CustomSnackBar = ({
  message,
  severity = "info",
  open,
  onClose,
  autoHideDuration = 3000,
  position = { vertical: "bottom", horizontal: "left" },
}: CustomSnackBarProps) => {
  const [isOpen, setIsOpen] = useState(open);

  // Sync internal state with prop
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsOpen(false);

    // Call parent's onClose callback if provided
    if (onClose) {
      onClose();
    }
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={position}
      sx={{
        zIndex: 9999999999999,
        "& .MuiPaper-elevation": {
          display: "flex",
          alignItems: "center",
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          maxWidth: "100%",
          minWidth: "300px",
          boxShadow: 3,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Utility functions similar to your notify functions
let snackbarContainer: HTMLElement | null = null;

const createSnackbarContainer = () => {
  if (!snackbarContainer) {
    snackbarContainer = document.createElement("div");
    snackbarContainer.id = "custom-snackbar-container";
    document.body.appendChild(snackbarContainer);
  }
  return snackbarContainer;
};

const showSnackbar = (
  message: string,
  severity: AlertColor = "info",
  autoHideDuration: number = 3000,
  position: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  } = { vertical: "bottom", horizontal: "left" }
) => {
  const container = createSnackbarContainer();
  const snackbarElement = document.createElement("div");
  container.appendChild(snackbarElement);

  const root = createRoot(snackbarElement);

  const handleClose = () => {
    root.unmount();
    if (container.contains(snackbarElement)) {
      container.removeChild(snackbarElement);
    }
  };

  root.render(
    <CustomSnackBar
      message={message}
      severity={severity}
      open={true}
      onClose={handleClose}
      autoHideDuration={autoHideDuration}
      position={position}
    />
  );
  setTimeout(() => {
    try {
      if (container.contains(snackbarElement)) {
        root.unmount();
        container.removeChild(snackbarElement);
      }
    } catch (error) {
    }
  }, autoHideDuration + 1000);
};

export const successSnackbar = (message: string) => {
  showSnackbar(message, "success", 1000, {
    vertical: "bottom",
    horizontal: "left",
  });
};

export const errorSnackbar = (title: string, message?: string) => {
  const displayMessage = message ? `${title}: ${message}` : title;
  showSnackbar(displayMessage, "error", 3000, {
    vertical: "bottom",
    horizontal: "left",
  });
};

export const infoSnackbar = (message: string) => {
  showSnackbar(message, "info", 2000, {
    vertical: "bottom",
    horizontal: "left",
  });
};

export const warningSnackbar = (message: string) => {
  showSnackbar(message, "warning", 2500, {
    vertical: "bottom",
    horizontal: "left",
  });
};

export { CustomSnackBar };
export default {
  CustomSnackBar,
  successSnackbar,
  errorSnackbar,
  infoSnackbar,
  warningSnackbar,
};
