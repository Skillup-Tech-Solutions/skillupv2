
export const customAutoCompleteBox = {
  border:"1px solid var(--borderColor)",
  minHeight:"30px",
  maxHeight:"80px",
  borderRadius:"5px",
  overflowY:"auto",
  "& .MuiInputBase-root ": {
    backgroundColor: "transparent !important",
      fontSize:"14px",

  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: "transparent",
      borderWidth: "1px",
      outline: "none",
    },
    padding: "2px !important",
    paddingRight: "60px !important",
  },
};
export const customAutoCompleteBoxError = {
  border:"1px solid red ",
  minHeight:"30px",
  maxHeight:"80px",
  borderRadius:"5px",
  overflowY:"auto",
  borderWidth:"1px ",
  "& .MuiFormHelperText-root": {
    marginLeft:"0px",
    marginRight:"0px"
  },
  "& .MuiInputBase-root ": {
    backgroundColor: "transparent",
          fontSize:"14px",

  },
  "& .MuiOutlinedInput-root": {
    borderColor: "transparent",
    
    "& fieldset": {
      borderColor: "transparent !important",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: "transparent",
      outline: "none",
      
    },
    padding: "2px",
  },
};
export const customAutoComplete = {
  marginBottom:"20px"
};
