import { Box } from "@mui/material";
import React from "react";

const LoaderSplash: React.FC = () => {
  return (
    <Box className="splash-overlay">
      <Box component={"span"} className="loader">Loading...</Box>
    </Box>
  );
};

export default LoaderSplash;
