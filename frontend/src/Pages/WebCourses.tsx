import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Stack,
  Modal,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { carrersWebSchema } from "../assets/Validation/Schema";
import { useState } from "react";
import CustomButton from "../Custom/CustomButton";
import { IoClose } from "react-icons/io5";
import CustomInput from "../Custom/CustomInput";
import { useGetCoursesApi, useGetActiveCoursesApi } from "../Hooks/courses";
import config from "../Config/Config";
import { useCoursesMail } from "../Hooks/review";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { primaryButtonStyle, outlinedButtonStyle } from "../assets/Styles/ButtonStyles";
import emailjs from "emailjs-com";

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

const WebCourses = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    title: string;
    id: string;
  } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(carrersWebSchema),
  });
  const { data: courseGet } = useGetActiveCoursesApi();
  const allCourses: any = courseGet && courseGet.courses;
  const courses =
    location.pathname === "/"
      ? allCourses
        ? allCourses
          .filter((course: any) => course.showOnLandingPage !== false) // Filter hidden courses
          .slice(0, 2)
        : null
      : allCourses;

  const handleOpen = (jobTitle: string, jobId: string) => {
    setSelectedJob({ title: jobTitle, id: jobId });
    setOpen(true);
  };
  const handleSyllabus = (jobId: string) => {
    console.log(jobId);
    navigate(`/services/courses/syllabus`, {
      state: { jobId },
    });
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };
  const { mutate: coursesMutation } = useCoursesMail();
  const onsubmit = async (data: any) => {
    setLoading(true);

    if (selectedJob) {
      const submissionData = {
        ...data,
        coursesId: selectedJob.id,
        courseName: selectedJob.title,
      };
      const emailParams = {
        name: submissionData.name,
        email: submissionData.email,
        mobile: submissionData.mobile,
        courseName: submissionData.courseName,
        categoryName: "-",
        categoryType: "-",
        year: new Date().getFullYear(),
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

  return (
    <Box>
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
            Our Courses
          </Typography>
          <Typography sx={{ fontFamily: "Regular_W", fontSize: "14px" }}>
            Our expert-led courses are designed to equip students with practical
            skills, real-world experience, and confidence to succeed in today’s
            competitive tech landscape.
          </Typography>
        </Box>
        <Box
          width={"20%"}
          sx={{
            textAlign: "right",
            "@media (max-width: 690px)": { width: "100%", textAlign: "left" },
          }}
        >
          {location.pathname === "/" ? (
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
              onClick={() => navigate("/services/courses")}
            >
              View All
            </Box>
          ) : (
            " "
          )}
        </Box>
      </Box>

      {/* Courses Grid */}
      <Grid
        container
        sx={{ gap: 3, alignItems: "center", justifyContent: "space-between" }}
      >
        {courses ? (
          courses.map((course, index) => (
            <Box
              flexBasis={"48%"}
              sx={{ "@media (max-width: 690px)": { flexBasis: "100%" } }}
              key={index}
            >
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                {/* Course Image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={course.fileupload
                    ? `${config.BASE_URL_MAIN}/uploads/${course.fileupload}`
                    : 'https://placehold.co/400x200/f5f5f5/999999?text=No+Image'
                  }
                  alt={course.name}
                  sx={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                    backgroundColor: '#f8f8f8',
                  }}
                />

                {/* Course Content */}
                <CardContent>
                  {/* Top Row: Duration, Level, Author */}
                  <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                    <Chip
                      label={course.duration}
                      size="small"
                      sx={{ fontFamily: "Regular_W", fontSize: "12px" }}
                    />
                  </Stack>

                  {/* Title & Description */}
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{
                      fontFamily: "SemiBold_W",
                      fontSize: "18px",
                      "@media (max-width: 690px)": { fontSize: "16px" },
                    }}
                  >
                    {course.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                      fontFamily: "Regular_W",
                      "@media (max-width: 690px)": { fontSize: "14px" },
                    }}
                  >
                    {course.description}
                  </Typography>

                  {/* Price Section */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={2}
                    >
                      {course.discount ? (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              textDecoration: "line-through",
                              fontFamily: "Regular_W",
                              "@media (max-width: 690px)": { fontSize: "14px" },
                            }}
                          >
                            ₹{course.price}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{
                              fontFamily: "SemiBold_W",
                              color: "var(--webprimary)",
                              "@media (max-width: 690px)": { fontSize: "14px" },
                            }}
                          >
                            ₹
                            {Math.round(
                              course.price -
                              (course.price * course.discount) / 100
                            )}
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            fontFamily: "SemiBold_W",
                            "@media (max-width: 690px)": { fontSize: "14px" },
                          }}
                        >
                          ₹{course.price}
                        </Typography>
                      )}
                    </Stack>
                    <Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ ...primaryButtonStyle, width: "max-content", marginBottom: "10px", borderRadius: "6px" }}
                        onClick={() => handleSyllabus(course._id)}
                      >
                        View Syllabus
                      </Button>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ ...outlinedButtonStyle, borderRadius: "6px" }}
                    onClick={() => handleOpen(course.name, course._id)}
                  >
                    Get it Now
                  </Button>
                </CardContent>
              </Card>
            </Box>
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
            No Courses Yet
          </Typography>
        )}
      </Grid>
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

export default WebCourses;
