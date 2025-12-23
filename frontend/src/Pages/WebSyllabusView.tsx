import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetSyllabusApi } from "../Hooks/syllabusView";
import {
  FaAngleLeft,
  FaChevronDown,
  FaBook,
  FaPlayCircle,
} from "react-icons/fa";

const WebSyllabusView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobId } = location.state || {};
  const { data: syllabus, isLoading, error } = useGetSyllabusApi(jobId);

  const syllabusData = syllabus?.data;

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            fontFamily: "Medium_W",
            borderColor: "var(--webprimary)",
            color: "var(--webprimary)",
            width: "35px",
            minWidth: "35px",
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
        <Alert severity="error">Failed to load syllabus data</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        onClick={() => navigate(-1)}
        sx={{
          mb: 3,
          fontFamily: "Medium_W",
          borderColor: "var(--webprimary)",
          color: "var(--webprimary)",
          width: "35px",
          minWidth: "35px",
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

      {syllabusData && (
        <>
          {/* Course Information */}
          {syllabusData?.units && (
            <Card sx={{ mb: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography
                  variant="h4"
                  component="h1"
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
                  {syllabusData.courseId?.name}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "Regular_W",
                    fontSize: "14px",
                    padding: "10px 0px",
                  }}
                >
                  {syllabusData.courseId?.description}
                </Typography>

                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                  {syllabusData.courseId?.discount ? (
                    <>
                      <Chip
                        label={`₹${Math.round(
                          syllabusData.courseId.price -
                            (syllabusData.courseId.price *
                              syllabusData.courseId.discount) /
                              100
                        )}`}
                        variant="filled"
                        sx={{ fontFamily: "Medium_W" }}
                      />
                      <Chip
                        label={`₹${syllabusData.courseId.price}`}
                        variant="outlined"
                        sx={{
                          fontFamily: "Medium_W",
                          textDecoration: "line-through",
                          color: "text.secondary",
                        }}
                      />
                      <Chip
                        label={`${syllabusData.courseId.discount}% OFF`}
                        color="success"
                        variant="outlined"
                        sx={{ fontFamily: "Medium_W" }}
                      />
                    </>
                  ) : (
                    <Chip
                      label={`₹${syllabusData.courseId?.price}`}
                      // color="primary"
                      variant="filled"
                      sx={{ fontFamily: "Medium_W" }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Course Syllabus */}
          <Typography
            variant="h5"
            component="h2"
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
            Course Syllabus
          </Typography>

          {!syllabusData.units || syllabusData.units.length === 0 ? (
            <Card
              sx={{ textAlign: "center", py: 4, backgroundColor: "#f8f9fa" }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "Medium_W",
                    fontSize: "16px",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  No Syllabus found for this course
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Regular_W",
                    fontSize: "14px",
                    color: "text.secondary",
                  }}
                >
                  The syllabus for this course is not available at the moment.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            syllabusData.units?.map((unit: any, unitIndex: number) => (
              <Accordion
                key={unit._id}
                defaultExpanded={unitIndex === 0}
                sx={{
                  mb: 2,
                  boxShadow: 2,
                  "&:before": { display: "none" },
                  borderRadius: "8px !important",
                }}
              >
                <AccordionSummary
                  expandIcon={<FaChevronDown />}
                  sx={{
                    backgroundColor: "var(--weblight)",
                    color: "var(--webprimary)",
                    borderRadius: "8px",
                    fontFamily: "SemiBold_W",
                    "&.Mui-expanded": {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <FaBook />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Medium_W",
                        fontSize: "16px",
                        "@media (max-width: 768px)": {
                          fontSize: "16px",
                          "@media (max-width: 690px)": { fontSize: "14px" },
                        },
                      }}
                    >
                      Unit {unitIndex + 1}: {unit.unitName}
                    </Typography>
                    <Chip
                      label={`${unit.lessons?.length || 0} Lessons`}
                      size="small"
                      sx={{
                        backgroundColor: "var(--webprimary)",
                        color: "white",
                        fontFamily: "Regular_W",
                      }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <List>
                    {unit.lessons?.map((lesson: any, lessonIndex: number) => (
                      <ListItem
                        key={lesson._id}
                        sx={{
                          borderBottom:
                            lessonIndex < unit.lessons.length - 1
                              ? "1px solid #e0e0e0"
                              : "none",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          width="100%"
                        >
                          <FaPlayCircle
                            style={{
                              color: "var(--webprimary)",
                              fontSize: "16px",
                            }}
                          />
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontFamily: "Medium_W",
                                  fontSize: "14px",
                                  "@media (max-width: 768px)": {
                                    fontSize: "14px",
                                    "@media (max-width: 690px)": {
                                      fontSize: "14px",
                                    },
                                  },
                                }}
                              >
                                Lesson {lessonIndex + 1}: {lesson.title}
                              </Typography>
                            }
                          />
                        </Box>
                      </ListItem>
                    ))}

                    {(!unit.lessons || unit.lessons.length === 0) && (
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              No lessons available in this unit
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          )}

          {/* Course Features Section */}
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
              What You'll Get
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
              {/* Project-Based Learning */}
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    🚀
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "SemiBold_W",
                      fontSize: "18px",
                    }}
                  >
                    Project-Based Learning
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
                  Build real-world projects that showcase your skills and add
                  value to your portfolio
                </Typography>
              </Card>

              {/* Interactive Assignments */}
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
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
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
                    📝
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "SemiBold_W",
                      fontSize: "18px",
                    }}
                  >
                    Session Assignments
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
                  Practice with carefully crafted assignments after each session
                  to reinforce learning
                </Typography>
              </Card>

              {/* Live Coding Sessions */}
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
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
                    Live Coding Sessions
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
                  Interactive live coding sessions where you code along with the
                  instructor
                </Typography>
              </Card>

              {/* Personalized Feedback */}
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
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
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
                    Personalized Feedback
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
                  Get detailed feedback on your assignments and projects from
                  expert instructors
                </Typography>
              </Card>

              {/* Industry Mentorship */}
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
                  background:
                    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
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
                    👨‍🏫
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
                    opacity: 0.8,
                    lineHeight: 1.6,
                  }}
                >
                  Connect with industry professionals and get career guidance
                  throughout your journey
                </Typography>
              </Card>

              {/* Certificate of Completion */}
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
                  background:
                    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
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
                    🏆
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "SemiBold_W",
                      fontSize: "18px",
                    }}
                  >
                    Certificate of Completion
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
                  Earn a verified certificate upon successful completion to
                  showcase your achievement
                </Typography>
              </Card>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
export default WebSyllabusView;
