import { Box, Button } from "@mui/material";
import WebCourses from "./WebCourses";
import { FaAngleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WebCoursesPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* <Box
        sx={{
          fontSize: "130px",
          fontFamily: "Bold_W",
          paddingTop: "40px",
          textTransform: "uppercase",
          background: "linear-gradient(-1deg, #fff, var(--webprimary))",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          opacity: "0.4",
          "@media (max-width: 768px)": { fontSize: "100px" },
          "@media (max-width: 650px)": { fontSize: "80px" },
          "@media (max-width: 500px)": { fontSize: "60px" },
          "@media (max-width: 450px)": { fontSize: "50px" },
        }}
      >
        Courses
      </Box> */}
      <Button
        variant="outlined"
        onClick={() => navigate(-1)}
        sx={{
          mb: 3,
          fontFamily: "Medium_W",
          borderColor: "var(--webprimary)",
          color: "var(--webprimary)",
          width: "35px ",
          minWidth: "35px ",
          height: "35px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "100%",
          padding: 0,
          "&:hover": {
            backgroundColor: "var(--webprimary)",
            color: "#fff",
          },
        }}
      >
        <FaAngleLeft style={{ fontSize: "14px" }} />
      </Button>
      <WebCourses />
    </Box>
  );
};

export default WebCoursesPage;
