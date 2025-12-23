import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Grid,
} from "@mui/material";
import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useGetReviews } from "../Hooks/review";

// const testimonials = [
//   {
//     name: "Sarah L",
//     email: "sarah@example.com",
//     review:
//       "The web design course provided a solid foundation for me. The instructors were knowledgeable and supportive, and the interactive learning environment was engaging. I highly recommend it!",
//     image: "",
//   },
//   {
//     name: "Jason M",
//     email: "jason@example.com",
//     review:
//       "The UI/UX design course exceeded my expectations. The instructor’s expertise and practical assignments helped me improve my design skills. I feel more confident in my career now. Thank you!",
//     image: "",
//   },
//   {
//     name: "Priya R",
//     email: "priya@example.com",
//     review:
//       "The inplant training helped me gain real-world exposure. I gained clarity on my career goals, and the instructors were incredibly helpful and patient.",
//     image: "",
//   },
//   {
//     name: "Rahul K",
//     email: "rahul@example.com",
//     review:
//       "Workshops were well-organized and informative. It helped me understand the latest trends and tools used in industry today.",
//     image: "",
//   },
// ];

const WebTesti = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 2;
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
        padding: "60px 0px",
        "@media (max-width: 768px)": { padding: "30px 0px" },
        "@media (max-width: 690px)": { padding: "20px 0px" },
      }}
    >
      {/* Header */}
      <Box
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
      </Box>
      {/* Bottom-right Arrows */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ margin: "0px 0px 10px 0px" }}
      >
        <IconButton
          onClick={handlePrev}
          sx={{
            bgcolor: "#fff",
            border: "1px solid #ccc",
            "&:hover": { bgcolor: "#f5f5f5" },
            "@media (max-width: 690px)": { width: "35px", height: "35px" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          onClick={handleNext}
          sx={{
            bgcolor: "#fff",
            border: "1px solid #ccc",
            "&:hover": { bgcolor: "#f5f5f5" },
            "@media (max-width: 690px)": { width: "35px", height: "35px" },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      {/* Carousel Cards */}
      {reviewData && reviewData.data.length === 0 && (
        <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px",textAlign:"center",margin:"auto",width:"max-content" }}>
            No Review Yet
          </Typography>
      )}
      <Grid container sx={{ gap: "10px", justifyContent: "space-between" }}>
        {reviewData ?
          visibleTestimonials.map((item, index) => (
            <Box
              key={index}
              flexBasis={"48%"}
              sx={{ "@media (max-width: 690px)": { flexBasis: "100%" } }}
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
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ mb: 3, fontFamily: "Regular_W", color: "#444" }}
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
            <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px",textAlign:"center",margin:"auto",width:"max-content" }}>
            No Review Yet
          </Typography>
          )
          }
      </Grid>
    </Box>
  );
};

export default WebTesti;
