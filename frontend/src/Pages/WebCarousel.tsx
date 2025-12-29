import { Box, Typography, Fade, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { images } from "../assets/Images/Images";

const carouselData = [
  "We Provide Outsourced Software Development Services & Solutions",
  "Now learning from anywhere & build your bright career.",
  "Let’s Experience be Your Guide",
  "Transform Your Ideas Into Projects",
];

const WebCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "400px",
        borderRadius: "6px",
        overflow: "hidden",
        "@media (max-width: 768px)": { height: "300px" },
        "@media (max-width: 690px)": { height: "250px" },
        "@media (max-width: 450px)": { height: "200px" },
      }}
    >
      {/* Background image */}
      <Box
        component="img"
        src={images.banner}
        alt="banner"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "6px",
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#6c3403b3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        {carouselData.map((text, i) => (
          <Fade in={index === i} key={i} timeout={600} unmountOnExit>
            <Typography
              variant="h4"
              color="white"
              fontFamily="Bold_W"
              textAlign="center"
              sx={{
                position: "absolute",
                px: 10,
                fontSize: "50px",
                lineHeight: "60px",
                "@media (max-width: 768px)": {
                  fontSize: "30px",
                  lineHeight: "1.4",
                  px: 4,
                },
                "@media (max-width: 690px)": { fontSize: "26px", px: 3 },
                "@media (max-width: 450px)": { fontSize: "20px", px: 2 },
                "@media (max-width: 320px)": { fontSize: "18px", px: 1.5 },
              }}
            >
              {text}
            </Typography>
          </Fade>
        ))}

        {/* Dots */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
          }}
        >
          {carouselData.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIndex(i)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: index === i ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.2)" },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default WebCarousel;
