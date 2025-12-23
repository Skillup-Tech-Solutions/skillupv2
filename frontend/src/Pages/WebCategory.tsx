import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip,
  Stack,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { carrersWebSchema } from "../assets/Validation/Schema";
import { IoClose } from "react-icons/io5";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { outlinedButtonStyle } from "../assets/Styles/ButtonStyles";
import { useState } from "react";
import { useGetCategoryApi } from "../Hooks/category";
import CustomAutoComplete from "../Custom/CustomAutocomplete";
import config from "../Config/Config";
import { useCategoryMail } from "../Hooks/review";
import CustomSnackBar from "../Custom/CustomSnackBar";
import emailjs from "emailjs-com";

// const mockCategoryData = [
//   {
//     title: "React Internship Program", //title
//     startDate: "2025-08-01", // startDate
//     endDate: "2025-09-01", // endDate
//     startTime: "10:00 AM", //startTime
//     endTime: "4:00 PM", //endTime
//     venue: "Online Zoom", //venue
//     mode: "Online", // mode
//     price: "₹2999", //price
//     image: images.loginBack, //image
//     description:
//       "This React internship helps you build real-world UI with hands-on projects, expert sessions, and mentorship.", // description
//     id: "43", // _id
//   },
//   {
//     title: "Web Dev Workshop",
//     startDate: "2025-08-15",
//     endDate: "2025-08-17",
//     startTime: "9:00 AM",
//     endTime: "3:00 PM",
//     venue: "Tech Auditorium, Chennai",
//     mode: "Offline",
//     price: "₹1499",
//     image: images.banner,
//     description:
//       "Join this 3-day offline workshop covering HTML, CSS, JS, and deployment for beginners and students.",
//     id: "23",
//   },
// ];
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  outline: "none",
  borderRadius: "5px",
  boxShadow: 24,
  padding: "10px 20px",
  "@media (max-width: 600px)": {
    width: "90vw",
    margin: "auto",
  },
};
const WebCategory = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    title: string;
    id: string;
    category: string;
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  console.log(selectedFilter, "selectedFilter");

  const location = useLocation();
  const categoryTitle = location.state;
  const navigate = useNavigate();
  const { data: getCategoriesData } = useGetCategoryApi();
  const categoryData = getCategoriesData && getCategoriesData?.data;

  // Filter data based on selectedFilter
  const getFilteredData = (data: any[]) => {
    if (!data) return null;

    if (selectedFilter === "all") {
      return data;
    }

    const filteredResult = data.filter(
      (item) => item.category?.toLowerCase() === selectedFilter?.toLowerCase()
    );

    // If filtered result is empty, return all data
    return filteredResult.length > 0 ? filteredResult : data;
  };

  const mockCategoryData =
    location.pathname === "/"
      ? categoryData
        ? getFilteredData(categoryData)?.slice(0, 2)
        : null
      : getFilteredData(categoryData);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(carrersWebSchema),
  });
  const { mutate: categoryMutation } = useCategoryMail();
  const onsubmit = async (data: any) => {
    setLoading(true);

    if (selectedJob) {
      const submissionData = {
        ...data,
        categoryId: selectedJob.id,
        categoryTitle: selectedJob.title,
        category: selectedJob.category,
      };

      // Prepare EmailJS parameters
      const emailParams = {
        name: submissionData.name,
        email: submissionData.email,
        mobile: submissionData.mobile,
        categoryName: submissionData.categoryTitle,
        categoryType: submissionData.category,
        year: new Date().getFullYear(),
        courseName: "-",
      };

      try {
        await emailjs.send(
          "service_xto17zc",
          "template_d26jy52",
          emailParams,
          "j0ZYBw2nraPLfCMAv"
        );
        CustomSnackBar.successSnackbar("Email sent successfully!");
      } catch (error) {
        console.error("EmailJS error:", error);
        CustomSnackBar.errorSnackbar("Failed to send email.");
        setLoading(false);
      }
      finally {
        handleClose();
        setLoading(false);
      }
    }
  };

  const handleOpen = (
    jobTitle: string,
    jobId: string,
    categoryTitle: string
  ) => {
    setSelectedJob({ title: jobTitle, id: jobId, category: categoryTitle });
    setOpen(true);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };
  return (
    <Box
      sx={
        location.pathname === "/"
          ? {
            paddingTop: "60px",
            "@media (max-width: 768px)": { paddingTop: "40px" },
          }
          : { padding: "0px" }
      }
    >
      {location.pathname === "/services/category" ? (
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
      ) : (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          sx={{
            "@media (max-width: 690px)": {
              flexDirection: "column",
              alignItems: "start",
              gap: 2,
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
                "@media (max-width: 768px)": {
                  fontSize: "22px",
                  "@media (max-width: 690px)": { fontSize: "20px" },
                },
              }}
            >
              Intenships & Workshops
            </Typography>
            <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
              Our expert-led courses are designed to equip students with
              practical skills, real-world experience, and confidence to succeed
              in today’s competitive tech landscape.
            </Typography>
          </Box>
          <Box
            width={"20%"}
            sx={{
              textAlign: "right",
              "@media (max-width: 690px)": { width: "100%", textAlign: "left" },
            }}
          >
            {location.pathname === "/courses" ? (
              ""
            ) : (
              <Box
                component="button"
                sx={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  px: 2,
                  py: 1,
                  borderRadius: "6px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "Medium_W",
                }}
                onClick={() => navigate("/services/category")}
              >
                View All
              </Box>
            )}
          </Box>
        </Box>
      )}
      {location.pathname !== "/" && (
        <>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Bold_W",
              mb: 2,
              "@media (max-width: 768px)": { fontSize: "26px" },
              "@media (max-width: 480px)": { fontSize: "22px" },
            }}
          >
            {"Internship & Workshop Programmes"}
          </Typography>
          <CustomAutoComplete
            name="filter"
            label="Filter"
            placeholder="Select filter type"
            options={[
              { label: "All", value: "all" },
              { label: "Internship", value: "internship" },
              { label: "Workshop", value: "workshop" },
            ]}
            value={selectedFilter}
            onValueChange={(value: any) => setSelectedFilter(value)}
            boxSx={{ mb: 3, maxWidth: 300 }}
            required={false}
          />
        </>
      )}

      <Grid
        container
        spacing={3}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        {getCategoriesData ? (
          mockCategoryData.map((item, index) => (
            <Grid
              flexBasis={"48%"}
              sx={{ "@media (max-width:690px)": { flexBasis: "100%" } }}
              key={index}
            >
              <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image
                    ? `${config.BASE_URL_MAIN}/uploads/${item.image}`
                    : 'https://placehold.co/400x200/f5f5f5/999999?text=No+Image'
                  }
                  alt={item.title}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: "SemiBold_W", mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "Regular_W", color: "#555", mb: 2 }}
                  >
                    {item.description}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    mb={1}
                    sx={{ gap: 1 }}
                  >
                    <Chip
                      sx={{ fontFamily: "Medium_W", fontSize: "10px" }}
                      label={`Start: ${item.startDate}`}
                      size="small"
                    />
                    <Chip
                      sx={{ fontFamily: "Medium_W", fontSize: "10px" }}
                      label={`End: ${item.endDate}`}
                      size="small"
                    />
                    <Chip
                      sx={{ fontFamily: "Medium_W", fontSize: "10px" }}
                      label={`Time: ${item.startTime} - ${item.endTime}`}
                      size="small"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ gap: 1 }}
                  >
                    <Chip
                      sx={{ fontFamily: "Medium_W", fontSize: "10px" }}
                      label={`Venue: ${item.venue}`}
                      size="small"
                    />
                    <Chip
                      sx={{ fontFamily: "Medium_W", fontSize: "10px" }}
                      label={`Mode: ${item.mode}`}
                      size="small"
                    />
                    <Chip
                      sx={{ fontFamily: "Medium_W", fontSize: "10px" }}
                      label={`Price: ${item.price}`}
                      size="small"
                    />
                    <Chip
                      sx={{
                        fontFamily: "Medium_W",
                        fontSize: "10px",
                        color: "var(--webprimary)",
                      }}
                      label={`Category: ${item.category}`}
                      size="small"
                    />
                  </Stack>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      handleOpen(item.title, item._id, item.category)
                    }
                    sx={{ ...outlinedButtonStyle, textTransform: "none", margin: "20px 0px 0px 0px", borderRadius: "6px" }}
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography
            sx={{
              fontFamily: "Regular_W",
              fontSize: "14px",
              textAlign: "center",
              margin: "auto",
              width: "max-content",
            }}
          >
            No Category Yet
          </Typography>
        )}
      </Grid>

      {/* Benefits Section */}
      {location.pathname === "/services/category" ? (
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontFamily: "SemiBold_W",
              fontSize: "24px",
              mb: 3,
              "@media (max-width: 768px)": {
                fontSize: "22px",
                "@media (max-width: 690px)": { fontSize: "20px" },
              },
            }}
          >
            What You'll Get From Our Programs
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Benefit 1: Hands-on Experience */}
            <Card
              sx={{
                p: 3,
                height: "100%",
                boxShadow: 3,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  💻
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                  }}
                >
                  Hands-on Experience
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Regular_W",
                  fontSize: "14px",
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                Get practical exposure to real-world projects and
                industry-standard tools and technologies.
              </Typography>
            </Card>

            {/* Benefit 2: Industry Mentorship */}
            <Card
              sx={{
                p: 3,
                height: "100%",
                boxShadow: 3,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  👨‍💼
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                  }}
                >
                  Industry Mentorship
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Regular_W",
                  fontSize: "14px",
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                Learn from experienced professionals and get guided support
                throughout your learning journey.
              </Typography>
            </Card>

            {/* Benefit 3: Skill Development */}
            <Card
              sx={{
                p: 3,
                height: "100%",
                boxShadow: 3,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🎯
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                  }}
                >
                  Skill Development
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Regular_W",
                  fontSize: "14px",
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                Enhance your technical skills, teamwork abilities, and
                professional communication.
              </Typography>
            </Card>

            {/* Benefit 4: Career Readiness */}
            <Card
              sx={{
                p: 3,
                height: "100%",
                boxShadow: 3,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "white",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  💼
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                  }}
                >
                  Career Readiness
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Regular_W",
                  fontSize: "14px",
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                Prepare yourself for job placements with portfolio-worthy
                projects and industry connections.
              </Typography>
            </Card>

            {/* Benefit 5: Official Certification */}
            <Card
              sx={{
                p: 3,
                height: "100%",
                boxShadow: 3,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                color: "#333",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  📜
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                  }}
                >
                  Official Certification
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Regular_W",
                  fontSize: "14px",
                  opacity: 0.8,
                  lineHeight: 1.6,
                }}
              >
                Receive verified certificates that validate your participation
                and enhance your resume.
              </Typography>
            </Card>

            {/* Benefit 6: Networking Opportunities */}
            <Card
              sx={{
                p: 3,
                height: "100%",
                boxShadow: 3,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                color: "#333",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🤝
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "18px",
                  }}
                >
                  Networking Opportunities
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Regular_W",
                  fontSize: "14px",
                  opacity: 0.8,
                  lineHeight: 1.6,
                }}
              >
                Connect with industry professionals, peers, and build valuable
                relationships for your career.
              </Typography>
            </Card>
          </Box>
        </Box>
      ) : (
        ""
      )}

      {/* Apply Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              borderBottom: "0.4px solid var(--greyText)",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ fontSize: "14px", fontFamily: "Medium_M" }}
            >
              {selectedJob?.title}
            </Typography>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={handleClose}
              sx={{
                "& svg": {
                  fontSize: "18px",
                },
              }}
            >
              <IoClose className="close-icon" />
            </IconButton>
          </Box>
          {/* Body */}
          <Box
            component={"form"}
            sx={{ marginTop: "12px", maxHeight: "50vh", overflowY: "auto" }}
            onSubmit={handleSubmit(onsubmit)}
          >
            <CustomInput
              name="name"
              placeholder="Enter Name"
              label="Name"
              type="text"
              bgmode="dark"
              required={false}
              register={register}
              errors={errors}
            />
            <CustomInput
              name="email"
              placeholder="Enter Email"
              label="Email"
              type="text"
              bgmode="dark"
              required={false}
              register={register}
              errors={errors}
            />
            <CustomInput
              name="mobile"
              placeholder="Enter Phone Number"
              label="Mobile Number"
              type="number"
              bgmode="dark"
              required={false}
              register={register}
              errors={errors}
            />
          </Box>
          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "12px",
              gap: "20px",
            }}
          >
            <CustomButton
              type="button"
              variant="contained"
              label="cancel"
              btnSx={{ background: "transparent", color: "var(--title)" }}
              onClick={handleClose}
            />
            <CustomButton
              type="submit"
              variant="contained"
              label={"Apply"}
              btnSx={{ background: "var(--primary)", color: "var(--white)" }}
              onClick={handleSubmit(onsubmit)}
              disabled={loading}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default WebCategory;
