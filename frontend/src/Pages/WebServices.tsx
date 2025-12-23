import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import CodeIcon from "@mui/icons-material/Code";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CloudIcon from "@mui/icons-material/Cloud";
import SecurityIcon from "@mui/icons-material/Security";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useLocation, useNavigate } from "react-router-dom";

// IT Services - Primary (with icons)
const itServices = [
  {
    number: "01",
    title: "Web Development",
    desc: "Custom website development using React, Angular, Vue.js for responsive, scalable web applications.",
    icon: CodeIcon,
  },
  {
    number: "02",
    title: "Mobile App Development",
    desc: "Native and cross-platform mobile app development for iOS and Android using React Native, Flutter.",
    icon: PhoneAndroidIcon,
  },
  {
    number: "03",
    title: "Cloud Solutions",
    desc: "AWS, Azure, and Google Cloud services including migration, deployment, and serverless architecture.",
    icon: CloudIcon,
  },
  {
    number: "04",
    title: "Cybersecurity Services",
    desc: "Comprehensive security solutions including vulnerability assessment and penetration testing.",
    icon: SecurityIcon,
  },
  {
    number: "05",
    title: "AI & Machine Learning",
    desc: "Intelligent solutions powered by AI, ML, deep learning, NLP, and computer vision.",
    icon: PsychologyIcon,
  },
  {
    number: "06",
    title: "Data Analytics & BI",
    desc: "Transform raw data into actionable insights with business intelligence and analytics.",
    icon: BarChartIcon,
  },
];

// Training Services - Secondary
const trainingServices = [
  {
    number: "01",
    title: "Inplant Training",
    desc: "Gain hands-on exposure in real-time industrial environments.",
  },
  {
    number: "02",
    title: "Internship Programmes",
    desc: "Work on live projects under professional guidance.",
  },
  {
    number: "03",
    title: "Final Year Projects",
    desc: "Complete assistance on innovative final year projects.",
  },
  {
    number: "04",
    title: "Workshop Sessions",
    desc: "Expert-led workshops on current technologies.",
  },
  {
    number: "05",
    title: "Courses",
    desc: "Industry-relevant skills through hands-on training.",
  },
];

const WebServices = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleITDetail = (title: string) => {
    navigate("/itservices", { state: title });
  };

  const handleTrainingDetail = (data: string) => {
    if (data === "Courses") {
      navigate("/services/courses");
    } else if (
      data === "Internship Programmes" ||
      data === "Workshop Sessions"
    ) {
      navigate("/services/category", { state: data });
    } else {
      navigate("/services/details", { state: data });
    }
  };

  return (
    <Box
      className="webServices"
      sx={{
        padding: "60px 0px",
        "@media (max-width: 768px)": { padding: "40px 0px" },
      }}
    >
      {/* IT Services Section - Primary */}
      <Box sx={{ mb: 5 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
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
                "@media (max-width: 768px)": { fontSize: "22px" },
                "@media (max-width: 690px)": { fontSize: "20px" },
              }}
            >
              IT Services
            </Typography>
            <Typography
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                "@media (max-width: 768px)": { fontSize: "14px" },
              }}
            >
              Complete technology solutions to help businesses build, grow, and
              compete in the digital world.
            </Typography>
          </Box>
          <Box
            width={"20%"}
            sx={{
              textAlign: "right",
              "@media (max-width: 690px)": { width: "100%", textAlign: "left" },
            }}
          >
            <Box
              component="button"
              sx={{
                background: "var(--webprimary)",
                border: "none",
                color: "#fff",
                px: 2,
                py: 1,
                borderRadius: "6px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Medium_W",
                transition: "all 0.3s ease",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
              onClick={() => navigate("/itservices")}
            >
              View All
            </Box>
          </Box>
        </Box>

        {/* IT Services Grid - Creative Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "space-between",
          }}
        >
          {itServices.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Box
                flexBasis={"30%"}
                key={index}
                sx={{
                  "@media (max-width: 991px)": { flexBasis: "48%" },
                  "@media (max-width: 690px)": { flexBasis: "100%" },
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "10px",
                    border: "1px solid #e0e0e0",
                    height: "100%",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      borderColor: "var(--webprimary)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      "& .service-icon-bg": {
                        transform: "scale(1.1)",
                      },
                      "& .service-arrow": {
                        backgroundColor: "var(--webprimary)",
                        borderColor: "var(--webprimary)",
                        "& svg": {
                          color: "#fff",
                        },
                      },
                    },
                  }}
                  onClick={() => handleITDetail(item.title)}
                >
                  <CardContent sx={{ position: "relative", zIndex: 1 }}>
                    {/* Icon and Number Row */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      {/* Icon */}
                      <Box
                        className="service-icon-bg"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "10px",
                          backgroundColor: "var(--weblight)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.3s ease",
                        }}
                      >
                        <IconComponent
                          sx={{
                            fontSize: 24,
                            color: "var(--webprimary)",
                          }}
                        />
                      </Box>
                      {/* Number */}
                      <Typography
                        sx={{
                          fontFamily: "SemiBold_W",
                          fontSize: "20px",
                          color: "var(--webprimary)",
                          opacity: 0.6,
                        }}
                      >
                        {item.number}
                      </Typography>
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: "Bold_W",
                        fontSize: "18px",
                        lineHeight: "1.4",
                        mb: 1,
                        "@media (max-width: 768px)": { fontSize: "16px" },
                      }}
                    >
                      {item.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontFamily: "Regular_W",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        "@media (max-width: 768px)": { fontSize: "13px" },
                      }}
                    >
                      {item.desc}
                    </Typography>

                    {/* Arrow Button */}
                    <Box mt={2}>
                      <IconButton
                        className="service-arrow"
                        sx={{
                          border: "1px solid #eee",
                          width: 36,
                          height: 36,
                          transition: "all 0.3s ease",
                        }}
                      >
                        <NorthEastIcon
                          fontSize="small"
                          sx={{ color: "var(--webprimary)" }}
                        />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        {/* More IT Services Indicator */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "var(--weblight)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            },
          }}
          onClick={() => navigate("/itservices")}
        >
          <Typography
            sx={{
              fontFamily: "Medium_W",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Explore more:
          </Typography>
          {["DevOps", "UI/UX Design", "ERP", "Network", "Testing", "Marketing", "Consulting"].map((service, idx) => (
            <Box
              key={idx}
              sx={{
                px: 1.5,
                py: 0.5,
                backgroundColor: "#fff",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "Medium_W",
                color: "var(--webprimary)",
                border: "1px solid #e8e8e8",
              }}
            >
              {service}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Training & Education Section - Secondary */}
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
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
                "@media (max-width: 768px)": { fontSize: "22px" },
                "@media (max-width: 690px)": { fontSize: "20px" },
              }}
            >
              Training & Education
            </Typography>
            <Typography
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                "@media (max-width: 768px)": { fontSize: "14px" },
              }}
            >
              Industry-ready skills through hands-on training and project-based learning programs.
            </Typography>
          </Box>
          <Box
            width={"20%"}
            sx={{
              textAlign: "right",
              "@media (max-width: 690px)": { width: "100%", textAlign: "left" },
            }}
          >
            {location.pathname !== "/services" && (
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
                onClick={() => navigate("/services")}
              >
                View All
              </Box>
            )}
          </Box>
        </Box>

        {/* Training Services Grid */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "space-between",
          }}
        >
          {trainingServices.map((item, index) => (
            <Box
              flexBasis={"30%"}
              key={index}
              sx={{
                "@media (max-width: 991px)": { flexBasis: "48%" },
                "@media (max-width: 690px)": { flexBasis: "100%" },
              }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: "10px",
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "var(--webprimary)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  },
                }}
                onClick={() => handleTrainingDetail(item.title)}
              >
                <CardContent>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                      fontFamily: "SemiBold_W",
                      fontSize: "24px",
                      textAlign: "right",
                      "@media (max-width: 768px)": { fontSize: "20px" },
                    }}
                  >
                    {item.number}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    mt={1}
                    sx={{
                      fontFamily: "Bold_W",
                      fontSize: "20px",
                      lineHeight: "1.4",
                      "@media (max-width: 768px)": { fontSize: "18px" },
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                    sx={{
                      fontFamily: "Regular_W",
                      "@media (max-width: 768px)": { fontSize: "14px" },
                    }}
                  >
                    {item.desc}
                  </Typography>

                  <Box mt={2}>
                    <IconButton
                      sx={{
                        border: "1px solid #eee",
                        width: 36,
                        height: 36,
                      }}
                    >
                      <NorthEastIcon
                        fontSize="small"
                        sx={{ color: "var(--webprimary)" }}
                      />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default WebServices;
