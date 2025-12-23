import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  LayoutMain,
  LayoutSidebar,
  LayoutStyle,
} from "../assets/Styles/LayoutStyle";

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:991px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <>
      <Box sx={{ ...LayoutStyle }}>
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Box
          sx={{
            ...LayoutSidebar,
            // Desktop behavior
            ...(isMobile
              ? {
                  // Mobile behavior - overlay mode
                  position: "fixed",
                  left: sidebarOpen ? 0 : "-300px",
                  width: "300px",
                  height: "100vh",
                  zIndex: 9999,
                  transition: "left 0.3s ease-in-out",
                }
              : {
                  // Desktop behavior - normal flow
                  width: sidebarOpen ? "18%" : "0%",
                  overflow: sidebarOpen ? "auto" : "hidden",
                  transition: "width 0.3s ease-in-out",
                }),
          }}
        >
          <Sidebar isOpen={sidebarOpen} isMobile={isMobile} />
        </Box>

        <Box
          sx={{
            ...LayoutMain,
            // On mobile, main content is always full width
            // On desktop, it adjusts based on sidebar state
            width: isMobile ? "100%" : sidebarOpen ? "82%" : "100%",
            transition: isMobile ? "none" : "width 0.3s ease-in-out",
          }}
        >
          <Header
            onToggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
          <Box sx={{ padding: "20px" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default Layout;
