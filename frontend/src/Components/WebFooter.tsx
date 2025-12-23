import { Box, Typography } from "@mui/material";
import { images } from "../assets/Images/Images";
import { IoIosMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const WebFooter = () => {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear();
  return (
    <Box
      sx={{
        backgroundColor: "var(--weblight)",
        padding: "30px 30px 20px 30px",
        borderRadius: "5px",
        "@media (max-width: 450px)": { padding: "20px" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          paddingBottom: "15px",
          "@media (max-width: 768px)": { flexDirection: "column" },
          "@media (max-width: 690px)": { gap: "20px" },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              alignItems: "start",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                fontSize: "25px",
                fontFamily: "Bold_W",
                background: "var(--websecondary)",
                color: "var(--white)",
                width: "100px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "3px",
                cursor:"pointer"
              }}
            >
              <Box
                component={"img"}
                sx={{ width: "80px" }}
                src={images.logonew}
              ></Box>
            </Box>
            <Box sx={{ display: "flex", gap: "10px", flexDirection: "column" }}>
              <Typography
                component={"a"}
                href="mailto:skilluptechsolution@gmail.com"
                sx={{
                  display: "flex",
                  gap: "3px",
                  color: "var(--title)",
                  fontFamily: "Regular_W",
                  textDecoration: "none",
                  fontSize: "12px",
                  alignItems: "center",
                }}
              >
                <IoIosMail style={{ fontSize: "18px" }} />
                skilluptechsolution@gmail.com
              </Typography>
              <Typography
                component={"a"}
                href="tel:8220079950"
                sx={{
                  display: "flex",
                  gap: "3px",
                  color: "var(--title)",
                  fontFamily: "Regular_W",
                  textDecoration: "none",
                  fontSize: "12px",
                  alignItems: "center",
                }}
              >
                <FaPhoneAlt style={{ fontSize: "14px" }} />
                +91 8220079950
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          <Link
            to="/"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            About Us
          </Link>

          <Link
            to="/careers"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Carrers
          </Link>
          <Link
            to="/contact"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "5px",
            }}
          >
            Contact Us
          </Link>
        </Box>
        <Box>
          <Link
            to="/services"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "SemiBold_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Services
          </Link>
          <Link
            to="/services"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Courses
          </Link>
          <Link
            to="/services"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Inplant Training
          </Link>
          <Link
            to="/services"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Intenship
          </Link>
          <Link
            to="/services"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Final Year Project
          </Link>
          <Link
            to="/services"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "5px",
            }}
          >
            Workshop
          </Link>
        </Box>
        <Box>
          <Link
            to="/itservices"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "SemiBold_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Software Development
          </Link>
          <Link
            to="/itservices"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Web Development
          </Link>
          <Link
            to="/itservices"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            App Development
          </Link>
          <Link
            to="/itservices"
            style={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "Regular_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "5px",
            }}
          >
            Digital Marketing
          </Link>
        </Box>
        <Box>
          <Typography
            component={"h4"}
            sx={{
              display: "flex",
              gap: "3px",
              color: "var(--title)",
              fontFamily: "SemiBold_W",
              textDecoration: "none",
              fontSize: "12px",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          >
            Social Profile
          </Typography>
          <Box sx={{ display: "flex", gap: "10px", alignContent: "center" }}>
            <Typography
              component={"a"}
              href="https://www.facebook.com/profile.php?id=61556893161389&mibextid=LQQJ4d"
              sx={{
                display: "flex",
                gap: "3px",
                color: "var(--white)",
                fontFamily: "Regular_W",
                textDecoration: "none",
                fontSize: "12px",
                alignItems: "center",
                width: "30px",
                height: "30px",
                backgroundColor: "var(--webprimary)",
                justifyContent: "center",
                borderRadius: "3px",
              }}
            >
              <FaFacebookF style={{ fontSize: "12px" }} />
            </Typography>
            <Typography
              component={"a"}
              href="https://www.linkedin.com/company/skill-up-tech-solution/"
              sx={{
                display: "flex",
                gap: "3px",
                color: "var(--white)",
                fontFamily: "Regular_W",
                textDecoration: "none",
                fontSize: "12px",
                alignItems: "center",
                width: "30px",
                height: "30px",
                backgroundColor: "var(--webprimary)",
                justifyContent: "center",
                borderRadius: "3px",
              }}
            >
              <FaLinkedinIn style={{ fontSize: "14px" }} />
            </Typography>
            <Typography
              component={"a"}
              href="https://api.whatsapp.com/send?phone=8220079950"
              sx={{
                display: "flex",
                gap: "3px",
                color: "var(--white)",
                fontFamily: "Regular_W",
                textDecoration: "none",
                fontSize: "12px",
                alignItems: "center",
                width: "30px",
                height: "30px",
                backgroundColor: "var(--webprimary)",
                justifyContent: "center",
                borderRadius: "3px",
              }}
            >
              <FaWhatsapp style={{ fontSize: "14px" }} />
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
        <Typography
          sx={{
            color: "var(--title)",
            fontFamily: "Regular_W",
            fontSize: "12px",
            textAlign: "center",
            paddingTop: "20px",
          }}
        >
          © <span id="year">{currentYear}</span> <Typography component={"a"}           sx={{
            color: "var(--title)",
            fontFamily: "Regular_W",
            fontSize: "12px",
            textAlign: "center",
            paddingTop: "20px",
            cursor:"pointer",
          }} href="https://skilluptechbuzz.in/" target="_blank" >SkillUp Tech Solutions</Typography>. All
          rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default WebFooter;
