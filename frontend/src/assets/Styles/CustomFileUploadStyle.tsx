import { marginBottom10, width100 } from "./LoginStyle";

export const fileuploadBox = {
  width: "100%",
  position: `relative`,
  top: `-6px`,
  ...marginBottom10,
  "& label": {
    fontSize: "12px",
    ...width100,
    backgroundColor: "transparent",
    boxShadow: "unset !important",
    border: "dashed 1px var(--grey)",
    color: "var(--title)",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    padding: "20px 0px",
    "& .BoldText": {
      fontWeight: "bold",
      fontSize: "12px",
      color: "var(--buttonPrimary)",
    },
    "& svg": {
      color: "var(--grey)",
    },
  },
  "& button": {
    background: "var(--white) !important",
  },
};
export const fileuploadBoxLabel = {
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  position: "relative",
  fontSize: "12px",
  fontFamily: `Regular_M`,
  color: "var(--title)",
  paddingBottom: `5px`,
};
export const FileNames = {
  maxHeight: "50px",
  overflow: "auto",
};
export const errorsFileUpload = {
  display: "block",
  paddingTop: "3px",
};
