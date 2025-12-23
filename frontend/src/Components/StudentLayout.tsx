import { Box, useMediaQuery } from "@mui/material";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import Header from "./Header";
import {
    LayoutMain,
    LayoutSidebar,
    LayoutStyle,
} from "../assets/Styles/LayoutStyle";

const StudentLayout = () => {
    const isMobile = useMediaQuery("(max-width:991px)");
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

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
                        ...(isMobile
                            ? {
                                position: "fixed",
                                left: sidebarOpen ? 0 : "-300px",
                                width: "300px",
                                height: "100vh",
                                zIndex: 9999,
                                transition: "left 0.3s ease-in-out",
                            }
                            : {
                                width: sidebarOpen ? "18%" : "0%",
                                overflow: sidebarOpen ? "auto" : "hidden",
                                transition: "width 0.3s ease-in-out",
                            }),
                    }}
                >
                    <StudentSidebar isOpen={sidebarOpen} isMobile={isMobile} />
                </Box>

                <Box
                    sx={{
                        ...LayoutMain,
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

export default StudentLayout;
