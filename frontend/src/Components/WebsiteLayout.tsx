import { Box, Fab } from "@mui/material";
import { useState, useEffect } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WebOffer from "./WebOffer";
import WebFooter from "./WebFooter";
import WebNavbar from "./WebNavbar";
import { Outlet, useLocation } from "react-router-dom";
import { images } from "../assets/Images/Images";
export const webImages = {
  //   backgroundImage:`url(${images.overlay})`,
  //   width:"100%",
  //   height:"100%",
  //   backgroundSize:"cover",
  position: "absolute",
  top: "0px",
  left: "0px",
  zIndex: "9",
};
const WebsiteLayout = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // Show button after scrolling 300px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ ...webImages }}>
        <Box
          component={"img"}
          src={images.overlay}
          alt="sefsef"
          sx={{
            width: "100%",
            height: "100%",
            "@media (max-width: 600px)": { height: "500px" },
          }}
        />
      </Box>
      <Box
        sx={{
          background: "#ffffffea",
          padding: "10px 20px",
          zIndex: "999",
          position: "relative",
          "@media (max-width: 991px)": { padding: "10px" },
          "@media (max-width: 600px)": { background: "#ffffffc4" },
          "@media (max-width: 450px)": { padding: "10px 5px" },
        }}
      >
        <WebOffer />
        <Box
          sx={{
            padding: "10px 30px",
            zIndex: "999",
            position: "relative",
            "@media (max-width: 991px)": { padding: "10px 20px" },
            "@media (max-width: 550px)": { padding: "10px" },
          }}
        >
          <WebNavbar />
          <Box sx={{ margin: "20px 0px", zIndex: "999", position: "relative" }}>
            <Outlet />
          </Box>
        </Box>
        <WebFooter />
      </Box>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Fab
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            border: "solid 2px var(--webprimary)",
            bgcolor: "transparent",
            width: 40,
            height: 40,
            color: "var(--webprimary)",
            zIndex: 1000,
            "&:hover": {
              bgcolor: "var(--webprimary)",
              color: "var(--white)",
              opacity: 0.8,
            },
            "@media (max-width: 768px)": {
              bottom: 15,
              right: 15,
              width: 40,
              height: 40,
            },
          }}
          size="medium"
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </Box>
  );
};

export default WebsiteLayout;
