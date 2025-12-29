import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useGetReviews } from "../Hooks/review";

const WebTesti = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width:690px)");
  const visibleCount = isMobile ? 1 : 2;
  const { data: reviewData } = useGetReviews();
  const testimonials = reviewData && reviewData?.data;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - visibleCount < 0
        ? Math.max(0, testimonials.length - visibleCount)
        : prev - visibleCount
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + visibleCount >= testimonials.length ? 0 : prev + visibleCount
    );
  };

  const visibleTestimonials = testimonials?.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  return (
    <Box
      sx={{
        padding: "30px 0px",
        "@media (max-width: 768px)": { padding: "20px 0px" },
        "@media (max-width: 690px)": { padding: "15px 0px" },
      }}
    >
      {/* Header */}
      {/* <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          "@media (max-width: 690px)": {
            flexDirection: "column",
            alignItems: "start",
            gap: "10px",
          },
        }}
      >
        <Box
          width={"80%"}
          sx={{ "@media (max-width: 690px)": { width: "100%" } }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontFamily: "SemiBold_W",
              fontSize: "24px",
              "@media (max-width: 768px)": { fontSize: "22px" },
              "@media (max-width: 690px)": { fontSize: "20px" },
            }}
          >
            Our Testimonials
          </Typography>
          <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
            Discover what students and professionals say about us
          </Typography>
        </Box>
        <Box
          width={"20%"}
          sx={{
            textAlign: "right",
            "@media (max-width: 690px)": { width: "100%", textAlign: "left" },
          }}
        ></Box>
      </Box> */}
      {/* Navigation Arrows - Show when there are multiple testimonials */}
      {testimonials && testimonials.length > visibleCount && (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ margin: "0px 0px 15px 0px" }}
        >
          <IconButton
            onClick={handlePrev}
            aria-label="Previous testimonial"
            sx={{
              bgcolor: "#fff",
              border: "1px solid #ccc",
              width: 44,
              height: 44,
              "&:hover": { bgcolor: "#f5f5f5" },
              "@media (max-width: 690px)": { width: 40, height: 40 },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            aria-label="Next testimonial"
            sx={{
              bgcolor: "#fff",
              border: "1px solid #ccc",
              width: 44,
              height: 44,
              "&:hover": { bgcolor: "#f5f5f5" },
              "@media (max-width: 690px)": { width: 40, height: 40 },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      )}

      {/* Testimonial Cards */}
      <Grid container sx={{ gap: "10px", justifyContent: "space-between" }}>
        {reviewData ?
          visibleTestimonials.map((item, index) => (
            <Box
              key={index}
              flexBasis={"48%"}
              sx={{
                maxWidth: "100%",
                "@media (max-width: 690px)": { flexBasis: "100%" },
                "@media (max-width: 450px)": { flexBasis: "100%" },
              }}
            >
              <Box
                sx={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
                  border: "1px solid #e0e0e0",
                  p: 3,
                  minHeight: "200px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "@media (max-width: 690px)": {
                    p: 2.5,
                    minHeight: "180px",
                  },
                  "@media (max-width: 450px)": {
                    p: 2,
                    minHeight: "160px",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 3,
                    fontFamily: "Regular_W",
                    color: "#444",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    "@media (max-width: 450px)": {
                      fontSize: "13px",
                      mb: 2,
                      lineHeight: 1.5,
                    },
                  }}
                >
                  {item.review}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        bgcolor: "var(--webprimary)",
                        width: 40,
                        height: 40,
                        fontSize: "16px",
                      }}
                      src={item.image || undefined}
                    >
                      {!item.image && item?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        fontWeight="500"
                        sx={{ fontFamily: "Medium_W", fontSize: "14px" }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "12px",
                          color: "#666",
                          fontFamily: "Regular_W",
                        }}
                      >
                        {item.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )) :
          (
            <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px", textAlign: "center", margin: "auto", width: "max-content" }}>
              No Review Yet
            </Typography>
          )
        }
      </Grid>
    </Box>
  );
};

export default WebTesti;
