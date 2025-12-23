import { Box, Typography, Grid } from "@mui/material";
import { images } from "../assets/Images/Images";

const WebAbout = () => {
  return (
    <Box>
      <Box
        sx={{
          fontSize: "130px",
          fontFamily: "Bold_W",
          paddingTop: "40px",
          textTransform: "uppercase",
          background: "linear-gradient(-1deg, #fff, var(--webprimary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: "0.8",
          "@media (max-width: 768px)": { fontSize: "100px" },
          "@media (max-width: 650px)": { fontSize: "80px" },
          "@media (max-width: 500px)": { fontSize: "60px" },
          "@media (max-width: 450px)": { fontSize: "50px" },
        }}
      >
        About Us
      </Box>

      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontFamily: "Regular_W",
            fontSize: "24px",
            "@media (max-width: 768px)": {
              fontSize: "22px",
            },
            "@media (max-width: 690px)": { fontSize: "20px" },
          }}
        >
          About Us
        </Typography>
        <Typography
          sx={{
            fontFamily: "Regular_W",
            fontSize: "16px",
            paddingBottom: "5px",
          }}
        >
          Empowering the Next Generation of Tech Innovators
        </Typography>
        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
          SkillUp Tech Solutions helps students and professionals become skilled
          IT experts through cutting-edge software development and hands-on
          training programs. 
          We combine industry experience, modern technology,
          and practical learning to bridge the gap between education and
          employment. 
           As a leading software development and training company, we
          specialize in real-world projects, inplant training, and
          career-focused IT courses designed to build future-ready
          professionals. Through partnerships with colleges, universities, and
          corporate clients, SkillUp Tech Solutions delivers structured
          internship programs, live project exposure, and professional
          certifications — ensuring every learner gains the skills, confidence,
          and experience to succeed in the tech industry.
        </Typography>

        {/* ✅ Certifications section with logos */}
        <Grid container spacing={2} alignItems="center" mt={3}>
          <Box>
            <img
              src={images.iso}
              alt="ISO Certified"
              style={{ height: "50px", objectFit: "contain" }}
            />
          </Box>
          <Box>
            <img
              src={images.msme}
              alt="MSME Registered"
              style={{ height: "50px", objectFit: "contain" }}
            />
          </Box>
        </Grid>
        <Box>
          <Typography
            sx={{
              fontFamily: "Medium_W",
              fontSize: "14px",
              color: "var(--webprimary)",
            }}
          >
            We are a government-recognized, ISO-certified and MSME-registered
            company, ensuring trust, quality, and compliance in all our
            services.
          </Typography>
        </Box>
      </Box>

      {/* MISSION */}
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontFamily: "Regular_W",
            fontSize: "20px",
            paddingTop: "30px",
            "@media (max-width: 768px)": { fontSize: "20px" },
            "@media (max-width: 690px)": { fontSize: "18px" },
          }}
        >
          Our Mission
        </Typography>
        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
          To deliver exceptional IT services, equipping individuals with the
          expertise and guidance needed to excel in their careers and make a
          meaningful impact in the tech industry.
        </Typography>
      </Box>

      {/* VISION */}
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontFamily: "Regular_W",
            fontSize: "20px",
            paddingTop: "30px",
            "@media (max-width: 768px)": { fontSize: "20px" },
            "@media (max-width: 690px)": { fontSize: "18px" },
          }}
        >
          Our Vision
        </Typography>
        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
          To be the premier destination for aspiring technologists, empowering
          them with cutting-edge skills and opportunities to thrive in the
          digital age.
        </Typography>
      </Box>

      {/* GOAL */}
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontFamily: "Regular_W",
            fontSize: "20px",
            paddingTop: "30px",
            "@media (max-width: 768px)": { fontSize: "20px" },
            "@media (max-width: 690px)": { fontSize: "18px" },
          }}
        >
          Our Goal
        </Typography>
        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
          To spark excitement for tech and propel careers through outstanding
          projects, engaging training, and eye-catching websites. With hands-on
          internships and personalized career guidance, we’re shaping the future
          of tech talent, step by step.
        </Typography>
      </Box>
    </Box>
  );
};

export default WebAbout;
