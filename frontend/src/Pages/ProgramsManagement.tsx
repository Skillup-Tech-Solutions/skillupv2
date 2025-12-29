import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Divider,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { FaBook, FaProjectDiagram, FaBriefcase, FaListUl, FaCertificate } from "react-icons/fa";
import Courses from "./Courses";
import ProjectManagement from "./ProjectManagement";
import InternshipManagement from "./InternshipManagement";

const ProgramsManagement = () => {
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [subTab, setSubTab] = useState(0);

    // Sync tab with URL path
    useEffect(() => {
        if (location.pathname.includes("projects")) {
            setTabValue(1);
        } else if (location.pathname.includes("internships")) {
            setTabValue(2);
        } else {
            setTabValue(0);
        }
    }, [location.pathname]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSubTab(0); // Reset sub-tab when main tab changes
    };

    const handleSubTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setSubTab(newValue);
    };

    const renderHeader = () => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="800" sx={{ color: "var(--title)", mb: 1 }}>
                Program Management
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--greyText)", mb: 3 }}>
                Manage courses, projects, and internships along with student submissions.
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid var(--borderColor)",
                    bgcolor: "var(--white)"
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        "& .MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "1rem",
                            minHeight: 64,
                            transition: "all 0.3s ease",
                            "&.Mui-selected": {
                                color: "var(--primary)",
                                bgcolor: "rgba(var(--primary-rgb), 0.04)",
                            },
                        }
                    }}
                >
                    <Tab
                        label="Courses"
                        icon={<FaBook size={20} />}
                        iconPosition="start"
                        sx={{ gap: 1.5 }}
                    />
                    <Tab
                        label="Projects"
                        icon={<FaProjectDiagram size={20} />}
                        iconPosition="start"
                        sx={{ gap: 1.5 }}
                    />
                    <Tab
                        label="Internships"
                        icon={<FaBriefcase size={20} />}
                        iconPosition="start"
                        sx={{ gap: 1.5 }}
                    />
                </Tabs>

                <Divider />

                <Tabs
                    value={subTab}
                    onChange={handleSubTabChange}
                    indicatorColor="secondary"
                    textColor="secondary"
                    sx={{
                        minHeight: 48,
                        px: 2,
                        "& .MuiTab-root": {
                            fontWeight: 500,
                            textTransform: "none",
                            fontSize: "0.875rem",
                            minHeight: 48,
                            minWidth: 120,
                            "&.Mui-selected": {
                                color: "var(--secondary)",
                            },
                        },
                        "& .MuiTabs-indicator": {
                            height: 3,
                            borderRadius: "3px 3px 0 0",
                        }
                    }}
                >
                    <Tab
                        label="Management"
                        icon={<FaListUl size={14} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                    <Tab
                        label="Submissions & Certificates"
                        icon={<FaCertificate size={14} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                </Tabs>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ p: 4, bgcolor: "var(--bg)", minHeight: "100vh" }}>
            {renderHeader()}

            <Box sx={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {/* TAB 1: COURSES */}
                {tabValue === 0 && (
                    <Courses activeSubTab={subTab} />
                )}

                {/* TAB 2: PROJECTS */}
                {tabValue === 1 && (
                    <ProjectManagement activeSubTab={subTab} />
                )}

                {/* TAB 3: INTERNSHIPS */}
                {tabValue === 2 && (
                    <InternshipManagement activeSubTab={subTab} />
                )}
            </Box>

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </Box>
    );
};

export default ProgramsManagement;
