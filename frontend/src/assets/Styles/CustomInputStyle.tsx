// Dark theme input styles

export const labelStyle = {
  textAlign: "left",
  fontSize: "12px",
  paddingBottom: "5px",
  display: "flex",
  alignItems: "top",
  fontFamily: "'JetBrains Mono', monospace",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export const span = {
  color: "#f87171 !important",
  width: "5px",
  height: "5px",
  position: "relative",
  top: "-10px",
  marginLeft: "3px"
};

export const customRelativeBox = {
  position: "relative",
};

export const customBoxIcon = {
  position: "absolute",
  top: "14px",
  right: "20px",
  cursor: "pointer",
  color: "#64748b",
};

export const inputStyle = {
  textAlign: "left",
  fontSize: "13px",
  width: "100%",
  "& fieldset": {
    backgroundColor: "#00800000 !important"
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "1px",
      },
      boxShadow: "none",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input": {
    padding: "12px 14px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
  },
};

export const inputStyleColor = {
  "& .MuiOutlinedInput-root": {
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000",
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000",
        borderWidth: "1px",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000",
      borderWidth: "1px",
    },
    color: "#000",
  },
};

export const inputStyleColorRed = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(127, 29, 29, 0.1)",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#f87171",
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#f87171",
        borderWidth: "1px",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#f87171",
      borderWidth: "1px",
    },
    color: "#f8fafc",
  },
  "& .MuiFormHelperText-root": {
    margin: "5px 0px",
    color: "#f87171",
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
  },
};

// Dark mode input style - used when bgmode="dark"
export const inputStyleColorLight = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#64748b",
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3b82f6",
        borderWidth: "1px",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#475569",
      borderWidth: "1px",
    },
    color: "#f8fafc",
  },
  "& .MuiInputBase-input": {
    "&::placeholder": {
      color: "#64748b",
      opacity: 1,
    },
  },
};

export const customBox = {
  marginBottom: "16px",
  "& .MuiPickersSectionList-root": {
    padding: "8px 0px !important"
  }
};

export const inputStyleNew = {
  textAlign: "left",
  fontSize: "12px",
  width: "100%",
  position: "relative",
  bottom: "5px",
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "0px",
      },
      boxShadow: "none",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: "0px",
    },
  },
  "& .MuiInputBase-input": {
    padding: "0px 0px 0px 5px",
  },
};