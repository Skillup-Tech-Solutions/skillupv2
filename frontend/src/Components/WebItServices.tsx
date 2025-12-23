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
import SettingsIcon from "@mui/icons-material/Settings";
import BrushIcon from "@mui/icons-material/Brush";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RouterIcon from "@mui/icons-material/Router";
import BugReportIcon from "@mui/icons-material/BugReport";
import CampaignIcon from "@mui/icons-material/Campaign";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useLocation, useNavigate } from "react-router-dom";

const itServices = [
  {
    number: "01",
    icon: CodeIcon,
    title: "Web Development",
    desc: "Custom website development using React, Angular, Vue.js, and modern technologies. We build responsive, scalable, and SEO-friendly web applications tailored to your business needs.",
  },
  {
    number: "02",
    icon: PhoneAndroidIcon,
    title: "Mobile App Development",
    desc: "Native and cross-platform mobile app development for iOS and Android using React Native, Flutter, and Swift/Kotlin. We deliver apps with seamless UX and robust performance.",
  },
  {
    number: "03",
    icon: CloudIcon,
    title: "Cloud Solutions",
    desc: "AWS, Azure, and Google Cloud services including migration, deployment, serverless architecture, and cloud infrastructure management for scalable applications.",
  },
  {
    number: "04",
    icon: SecurityIcon,
    title: "Cybersecurity",
    desc: "Comprehensive security solutions including vulnerability assessment, penetration testing, security audits, and compliance management to protect your digital assets.",
  },
  {
    number: "05",
    icon: PsychologyIcon,
    title: "AI & Machine Learning",
    desc: "Intelligent solutions powered by AI, ML, deep learning, NLP, and computer vision for automation and data-driven decision making that transforms your business.",
  },
  {
    number: "06",
    icon: BarChartIcon,
    title: "Data Analytics & BI",
    desc: "Transform raw data into actionable insights with business intelligence, data visualization, and advanced analytics solutions for smarter decision-making.",
  },
  {
    number: "07",
    icon: SettingsIcon,
    title: "DevOps & Automation",
    desc: "Streamline development with CI/CD pipelines, containerization (Docker/Kubernetes), infrastructure as code, and automated deployments for faster delivery.",
  },
  {
    number: "08",
    icon: BrushIcon,
    title: "UI/UX Design",
    desc: "User-centered design services including wireframing, prototyping, user research, and creating intuitive digital experiences that users love.",
  },
  {
    number: "09",
    icon: AccountTreeIcon,
    title: "ERP Solutions",
    desc: "Custom ERP development and implementation to streamline business processes, inventory, HR, and financial management in one integrated platform.",
  },
  {
    number: "10",
    icon: RouterIcon,
    title: "Network Infrastructure",
    desc: "Complete networking solutions including setup, configuration, monitoring, and maintenance of LAN/WAN infrastructure for optimal connectivity.",
  },
  {
    number: "11",
    icon: BugReportIcon,
    title: "Software Testing & QA",
    desc: "Manual and automated testing services including functional, performance, security, and compatibility testing to ensure software quality.",
  },
  {
    number: "12",
    icon: CampaignIcon,
    title: "Digital Marketing",
    desc: "SEO, SEM, social media marketing, content strategy, and analytics to boost your online presence and drive business growth.",
  },
  {
    number: "13",
    icon: SupportAgentIcon,
    title: "IT Consulting",
    desc: "Strategic IT consulting to help businesses optimize technology investments, digital transformation, and IT governance for competitive advantage.",
  },
];

const whyChooseUs = [
  {
    icon: "⚡",
    title: "On-Time Delivery",
    desc: "We respect deadlines and deliver projects on schedule without compromising quality.",
  },
  {
    icon: "👨‍💻",
    title: "Expert Team",
    desc: "Our skilled professionals bring years of experience and cutting-edge expertise.",
  },
  {
    icon: "🛠️",
    title: "24/7 Support",
    desc: "Round-the-clock technical support to ensure your business runs smoothly.",
  },
  {
    icon: "💰",
    title: "Cost-Effective",
    desc: "Premium quality services at competitive prices that fit your budget.",
  },
  {
    icon: "🚀",
    title: "Latest Technology",
    desc: "We use cutting-edge tools and frameworks to build future-ready solutions.",
  },
  {
    icon: "📈",
    title: "Scalable Solutions",
    desc: "Our solutions grow with your business, adapting to your evolving needs.",
  },
];

const WebItServices = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedService = location.state;

  const handleServiceClick = (title: string) => {
    navigate("/itservices/detail", { state: title });
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontFamily: "SemiBold_W",
            fontSize: "28px",
            "@media (max-width: 768px)": { fontSize: "24px" },
            "@media (max-width: 690px)": { fontSize: "22px" },
          }}
        >
          IT Services
        </Typography>
        <Typography
          sx={{
            fontFamily: "Regular_W",
            fontSize: "14px",
            color: "#666",
            maxWidth: "600px",
          }}
        >
          We provide professional IT services that empower businesses and students
          to build, grow, and compete in the digital world. From interactive
          websites to mobile apps and performance-focused solutions.
        </Typography>
      </Box>

      {/* IT Services Grid */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "space-between",
          mb: 6,
        }}
      >
        {itServices.map((item, index) => {
          const IconComponent = item.icon;
          const isSelected = selectedService === item.title;

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
                onClick={() => handleServiceClick(item.title)}
                sx={{
                  borderRadius: "10px",
                  border: isSelected ? "2px solid var(--webprimary)" : "1px solid #e0e0e0",
                  height: "100%",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "var(--weblight)" : "#fff",
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
              >
                <CardContent>
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

      {/* Why Choose Us Section */}
      <Box sx={{ mb: 4 }}>
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
          <Box>
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
              Why Choose Us
            </Typography>
            <Typography
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Trusted by businesses and students for delivering exceptional IT solutions
            </Typography>
          </Box>
        </Box>

        {/* Why Choose Us Grid */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "space-between",
          }}
        >
          {whyChooseUs.map((item, index) => (
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
                  "&:hover": {
                    borderColor: "var(--webprimary)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "10px",
                      backgroundColor: "var(--weblight)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: "Bold_W",
                      fontSize: "16px",
                      lineHeight: "1.4",
                      mb: 1,
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
                    }}
                  >
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          backgroundColor: "var(--weblight)",
          borderRadius: "8px",
          px: 4,
          py: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
          mb: 4,
        }}
      >
        {[
          { label: "Projects Completed", value: "500+" },
          { label: "Happy Clients", value: "150+" },
          { label: "Team Experts", value: "50+" },
          { label: "Client Satisfaction", value: "99%" },
        ].map((stat, index, arr) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              px: 2,
              textAlign: "center",
              borderRight: index !== arr.length - 1 ? "1px solid #e0e0e0" : "none",
              minWidth: 100,
              flex: 1,
              "@media (max-width: 690px)": {
                flexBasis: "48%",
                borderRight: "none",
              },
              "@media (max-width: 550px)": { flexBasis: "100%" },
            }}
          >
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "var(--webprimary)",
                fontFamily: "SemiBold_W",
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#333",
                fontFamily: "Regular_W",
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Contact CTA */}
      <Box
        sx={{
          backgroundColor: "var(--weblight)",
          borderRadius: "10px",
          p: 4,
          textAlign: "center",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          sx={{
            fontFamily: "SemiBold_W",
            fontSize: "20px",
            mb: 1,
          }}
        >
          Ready to Transform Your Business?
        </Typography>
        <Typography
          sx={{
            fontFamily: "Regular_W",
            fontSize: "14px",
            color: "#666",
            mb: 3,
          }}
        >
          Let's discuss your project and find the perfect solution for your needs
        </Typography>
        <Box
          component="a"
          href="/#/contact"
          sx={{
            display: "inline-block",
            background: "var(--webprimary)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "6px",
            fontFamily: "Medium_W",
            fontSize: "14px",
            textDecoration: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          Contact Us Today
        </Box>
      </Box>
    </Box>
  );
};

export default WebItServices;
