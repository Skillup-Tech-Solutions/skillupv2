import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WebHero = () => {
  const navigate = useNavigate();
  return (
    <Box
      textAlign="center"
      sx={{
        padding: "80px 0px",
        "@media (max-width: 690px)": { padding: "55px 30px" },
        "@media (max-width: 450px)": { padding: "55px 10px" },
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{
          fontFamily: "Bold_W",
          fontSize: 40,
          color: "var(--title)",
          "@media (max-width: 768px)": { fontSize: "30px" },
          "@media (max-width: 690px)": { fontSize: "26px" },
          "@media (max-width: 450px)": { fontSize: "24px" },
        }}
      >
        Build Your Future with Tech-Driven Learning
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Regular_W",
          fontSize: "16px",
          "@media (max-width: 768px)": { fontSize: "14px" },
        }}
      >
        From Web Solutions to Inplant Training, Internships, Courses, and Final
        Year Projects — We Shape Careers.
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Button
          sx={{
            marginTop: "20px",
            border: "solid 1px var(--webprimary)",
            backgroundColor: "var(--webprimary)",
            color: "var(--white)",
            width: "fit-content",
            textTransform: "capitalize",
            padding: "5px 20px",
            fontFamily: "Medium_W",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "transparent",
              color: "var(--webprimary)",
            },
          }}
          onClick={() => navigate("/services")}
        >
          Explore More
        </Button>
        <Button
          sx={{
            marginTop: "20px",
            border: "solid 1px var(--webprimary)",
            backgroundColor: "transparent",
            color: "var(--webprimary)",
            width: "fit-content",
            textTransform: "capitalize",
            padding: "5px 20px",
            fontFamily: "Medium_W",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "var(--webprimary)",
              color: "var(--white)",
            },
          }}
          onClick={() => navigate("/contact")}
        >
          Contact Us
        </Button>
      </Box>
    </Box>
  );
};

export default WebHero;
