import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { images } from "../assets/Images/Images";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import WorkIcon from "@mui/icons-material/Work";
import BuildIcon from "@mui/icons-material/Build";
import ComputerIcon from "@mui/icons-material/Computer";
import PersonIcon from "@mui/icons-material/Person";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CodeIcon from "@mui/icons-material/Code";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import InsightsIcon from "@mui/icons-material/Insights";
import type { ReactNode } from "react";

const serviceDetails: Record<
  string,
  {
    title: string;
    desc: string;
    highlights: { img: string; title: string; desc: string }[];
    benefits: {
      icon: ReactNode;
      title: string;
      desc: string;
    }[];
  }
> = {
  "Inplant Training": {
    title: "Inplant Training",
    desc: "Gain hands-on exposure in real-time industrial environments to bridge the gap between academic learning and industry expectations. Our inplant training programs help students understand the professional work environment and the application of theoretical concepts. We focus on giving practical exposure that prepares students to meet industrial requirements. The training includes basic IT knowledge, tools walkthrough, and interaction with professionals in the field.",
    highlights: [
      {
        img: images.loginBack,
        title: "Real-time Industry Visit",
        desc: "Students get to explore real companies and understand practical workflows.",
      },
      {
        img: images.banner,
        title: "Internship Certificate",
        desc: "Get a certified experience to boost your resume and job readiness.",
      },
    ],
    benefits: [
      {
        icon: <BusinessIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Industry Exposure",
        desc: "Get firsthand experience of how real companies operate and function",
      },
      {
        icon: <SchoolIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Professional Skills",
        desc: "Develop workplace etiquette and professional communication skills",
      },
      {
        icon: <HandshakeIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Industry Connections",
        desc: "Build valuable connections with industry professionals and mentors",
      },
      {
        icon: <CardMembershipIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Training Certificate",
        desc: "Receive official certification to validate your industrial training",
      },
      {
        icon: <WorkIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Career Readiness",
        desc: "Prepare yourself for the transition from academics to professional life",
      },
      {
        icon: <BuildIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Practical Knowledge",
        desc: "Apply theoretical concepts in real-world industrial scenarios",
      },
    ],
  },
  "Internship Programmes": {
    title: "Internship & Workshop ",
    desc: "Our internship programmes are designed to bridge the gap between academics and industry. Interns work on real-time projects under the supervision of industry experts. This opportunity helps them enhance their technical skills, teamwork, time management, and communication. The programme ensures that candidates leave with hands-on experience and practical knowledge useful for job placements and career growth.",
    highlights: [
      {
        img: "https://via.placeholder.com/400x200?text=Project+Work",
        title: "Project-Based Learning",
        desc: "Get assigned real tech problems and solve them using industry-standard tools.",
      },
      {
        img: "https://via.placeholder.com/400x200?text=Mentorship",
        title: "Expert Mentorship",
        desc: "Learn under experienced professionals for structured guidance and feedback.",
      },
    ],
    benefits: [
      {
        icon: <ComputerIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Real Project Experience",
        desc: "Work on actual industry projects and gain hands-on development experience",
      },
      {
        icon: <PersonIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Industry Mentorship",
        desc: "Get guided by experienced professionals throughout your internship journey",
      },
      {
        icon: <TrackChangesIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Skill Enhancement",
        desc: "Develop technical skills, teamwork, and time management abilities",
      },
      {
        icon: <TrendingUpIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Career Growth",
        desc: "Build practical knowledge that directly contributes to job placement success",
      },
      {
        icon: <HandshakeIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Professional Network",
        desc: "Connect with industry experts and build valuable professional relationships",
      },
      {
        icon: <CardMembershipIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Internship Certificate",
        desc: "Receive official certification that validates your internship completion",
      },
    ],
  },
  "Final Year Projects": {
    title: "Final Year Projects",
    desc: "We assist students in developing innovative final-year academic projects with end-to-end support, including idea selection, design, development, and documentation. Students can choose from a wide range of domains such as web, mobile, IoT, AI, and more. The goal is to help students build portfolio-worthy projects that enhance their technical skills and impress recruiters.",
    highlights: [
      {
        img: images.loginBack,
        title: "Real-time Industry Visit",
        desc: "Students get to explore real companies and understand practical workflows.",
      },
      {
        img: images.banner,
        title: "Internship Certificate",
        desc: "Get a certified experience to boost your resume and job readiness.",
      },
    ],
    benefits: [
      {
        icon: <LightbulbIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Innovative Project Ideas",
        desc: "Get access to cutting-edge project concepts that align with industry trends",
      },
      {
        icon: <CodeIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Expert Technical Guidance",
        desc: "Receive mentorship from experienced developers throughout your project development",
      },
      {
        icon: <ArchitectureIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "End-to-End Development",
        desc: "Learn complete project lifecycle from planning to deployment and maintenance",
      },
      {
        icon: <DescriptionIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Professional Documentation",
        desc: "Create industry-standard documentation including reports and technical specifications",
      },
      {
        icon: <TrackChangesIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Portfolio Enhancement",
        desc: "Build impressive projects that showcase your skills to potential employers",
      },
      {
        icon: <EmojiEventsIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Academic Excellence",
        desc: "Achieve high grades with well-structured and innovative project submissions",
      },
    ],
  },
  "Workshop Sessions": {
    title: "Workshop Sessions",
    desc: "We conduct practical and hands-on workshops on trending technologies like web development, data science, AI, cloud computing, etc. These workshops are designed to be interactive, beginner-friendly, and include live coding, demos, and Q&A. It's ideal for both students and professionals looking to upskill quickly.",
    highlights: [
      {
        img: "https://via.placeholder.com/400x200?text=Live+Coding",
        title: "Interactive Demos",
        desc: "Practice what you learn with live examples and instructor guidance.",
      },
      {
        img: "https://via.placeholder.com/400x200?text=Certificate",
        title: "Certificate of Participation",
        desc: "Receive certificates to validate your skills and participation.",
      },
    ],
    benefits: [
      {
        icon: <ComputerIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Live Coding Sessions",
        desc: "Practice coding in real-time with expert instructors and immediate feedback",
      },
      {
        icon: <RocketLaunchIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Latest Technologies",
        desc: "Learn cutting-edge technologies that are currently trending in the industry",
      },
      {
        icon: <TrackChangesIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Hands-on Practice",
        desc: "Get practical experience through interactive demos and guided exercises",
      },
      {
        icon: <LiveHelpIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Q&A Sessions",
        desc: "Clear your doubts instantly with dedicated question and answer sessions",
      },
      {
        icon: <AccessibilityNewIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Beginner Friendly",
        desc: "Workshops designed for all skill levels, from beginners to advanced learners",
      },
      {
        icon: <CardMembershipIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Participation Certificate",
        desc: "Receive official certificates to validate your workshop participation and learning",
      },
    ],
  },
  "Career Guidance": {
    title: "Career Guidance",
    desc: "We offer personalized career mentoring, resume building, mock interviews, and job search strategy sessions. Our career experts help you prepare for technical interviews, choose the right path, and stand out in the competitive job market. Whether you're a fresher or switching domains, we have tailored support for everyone.",
    highlights: [
      {
        img: images.loginBack,
        title: "Mock Interview Practice",
        desc: "Get interview-ready with real-world practice sessions and feedback.",
      },
      {
        img: images.banner,
        title: "Resume Building",
        desc: "Learn how to craft an impressive resume tailored to your goals.",
      },
    ],
    benefits: [
      {
        icon: <TrackChangesIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Personalized Career Mentoring",
        desc: "Get one-on-one guidance tailored to your specific career goals and aspirations",
      },
      {
        icon: <DescriptionIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Professional Resume Building",
        desc: "Learn to craft compelling resumes that stand out to recruiters and employers",
      },
      {
        icon: <MicIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Mock Interview Practice",
        desc: "Practice with real interview scenarios and receive detailed feedback for improvement",
      },
      {
        icon: <SearchIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Job Search Strategy",
        desc: "Learn effective job search techniques and strategies to find the right opportunities",
      },
      {
        icon: <InsightsIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Industry Insights",
        desc: "Gain valuable insights about different industries and career paths available",
      },
      {
        icon: <RocketLaunchIcon sx={{ color: "var(--webprimary)", fontSize: 24 }} />,
        title: "Career Transition Support",
        desc: "Get specialized support whether you're a fresher or switching career domains",
      },
    ],
  },
};

const WebServiceDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const serviceTitle = location.state;
  const data = serviceDetails[serviceTitle];

  return (
    <Box>
      {/* Back Button */}
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

      {data ? (
        <>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              fontFamily: "Bold_W",
              mb: 2,
              "@media (max-width: 768px)": { fontSize: "26px" },
              "@media (max-width: 480px)": { fontSize: "22px" },
            }}
          >
            {data.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "Regular_W",
              maxWidth: "800px",
              mb: 4,
              color: "#555",
              fontSize: "16px",
              "@media (max-width: 768px)": { fontSize: "16px" },
              "@media (max-width: 480px)": { fontSize: "14px" },
            }}
          >
            {data.desc}
          </Typography>
          {data.title === "Final Year Projects" && (
            <Box
              sx={{
                background: "linear-gradient(135deg, #f8f9fa, #eef3ff)",
                borderRadius: "12px",
                p: { xs: 2, sm: 3, md: 4 },
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                mt: 3,
                mb: 5,
                mx: "auto",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "SemiBold_W",
                  color: "var(--webprimary)",
                  mb: 2,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Domains We Offer
              </Typography>

              <Grid container spacing={1.5}>
                {[
                  "Machine Learning",
                  "Artificial Intelligence",
                  "Data Science",
                  "Full Stack Development",
                  "Blockchain",
                  "Deep Learning",
                  "Cloud Computing",
                  "IoT",
                  "Robotics",
                  "Microcontroller",
                  "Raspberry Pi",
                  "Arduino",
                  "RF & RFID",
                  "Cyber Security",
                  "GSM & GPS Control",
                ].map((domain, index) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        textAlign: "center",
                        p: 1.5,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        fontFamily: "Medium_W",
                        fontSize: { xs: "13px", sm: "14px" },
                        color: "#333",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          backgroundColor: "var(--webprimary)",
                          color: "#fff",
                        },
                      }}
                    >
                      {domain}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Grid container spacing={3}>
            {data.highlights.map((item, index) => (
              <Grid
                flexBasis={"48%"}
                sx={{ "@media (max-width:690px)": { flexBasis: "100%" } }}
                key={index}
              >
                <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.img}
                    alt={item.title}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: "SemiBold_W", mb: 1, fontSize: "18px" }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "Regular_W", color: "#666" }}
                    >
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Service Benefits Section */}
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
                },
                "@media (max-width: 690px)": { fontSize: "20px" },
              }}
            >
              What You'll Get From This Service
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                justifyContent: "space-between",
                mb: 4,
              }}
            >
              {data.benefits.map((benefit, index) => (
                <Box
                  key={index}
                  sx={{
                    flexBasis: "30%",
                    "@media (max-width: 991px)": { flexBasis: "48%" },
                    "@media (max-width: 690px)": { flexBasis: "100%" },
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: "10px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#fff",
                      transition: "all 0.3s ease",
                      cursor: "default",
                      "&:hover": {
                        borderColor: "var(--webprimary)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        "& .benefit-icon-bg": {
                          transform: "scale(1.1)",
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Box
                        className="benefit-icon-bg"
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "10px",
                          backgroundColor: "var(--weblight)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          flexShrink: 0,
                          transition: "transform 0.3s ease",
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: "SemiBold_W",
                            fontSize: "16px",
                            color: "#333",
                            mb: 0.5,
                          }}
                        >
                          {benefit.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Regular_W",
                            fontSize: "13px",
                            color: "#666",
                            lineHeight: 1.6,
                          }}
                        >
                          {benefit.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontFamily: "SemiBold_W", mb: 2 }}
          >
            Our Services
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "Regular_W" }}>
            Please select a service to view its details.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default WebServiceDetail;
