export const labelStyle = {
  textAlign: "left",
  fontSize: "12px",
  paddingBottom:"5px",
  display:"flex",
  alignItems:"top",
  fontFamily:"Regular_M"
};
export const span = {
  color: "#d32f2f !important",
  width: "5px",
  height: "5px",
  position:"relative",
  top:"-10px",
  marginLeft:"3px"
}
export const customRelativeBox = {
  position:"relative",
}
export const customBoxIcon = {
  position:"absolute",
  top:"14px",
  right:"20px",
  cursor:"pointer"
}
export const inputStyle = {
  textAlign: "left",
  fontSize: "12px",
  width: "100%",
  // background:"red",
  "& fieldset": {
    backgroundColor:"#00800000 !important"
  },
  "& .MuiOutlinedInput-root": {
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
    padding: "10px",
    fontSize:"14px",
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
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d32f2f",
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#d32f2f",
        borderWidth: "1px",

      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d32f2f",
      borderWidth: "1px",
    },
    color:"grey",
  },
  "& .MuiFormHelperText-root": {
    margin: "5px 0px",
    color:"#d32f2f"
},
};
export const inputStyleColorLight = {
  "& .MuiOutlinedInput-root": {
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--borderColor)",
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--borderColor)",
        borderWidth: "1px",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--borderColor)",
      borderWidth: "1px",
    },
    color: "var(---grey)",
  },
};
export const customBox = {
  marginBottom: "20px",
  "& .MuiPickersSectionList-root":{
    padding:"8px 0px !important"
  }
}


export const inputStyleNew = {
  textAlign: "left",
  fontSize: "12px",
  width: "100%",
  position:"relative",
  bottom:"5px",
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