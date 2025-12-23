import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { FaBook, FaProjectDiagram, FaBriefcase } from "react-icons/fa";
import Courses from "./Courses";
import ProjectManagement from "./ProjectManagement";
import InternshipManagement from "./InternshipManagement";

const ProgramsManagement = () => {
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);

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
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Program Management
            </Typography>

            {/* Main Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        "& .MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "0.95rem",
                            minHeight: 56,
                        }
                    }}
                >
                    <Tab
                        label="Courses"
                        icon={<FaBook size={18} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                    <Tab
                        label="Projects"
                        icon={<FaProjectDiagram size={18} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                    <Tab
                        label="Internships"
                        icon={<FaBriefcase size={18} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                </Tabs>
            </Paper>

            {/* TAB 1: COURSES */}
            {tabValue === 0 && (
                <Box sx={{ mx: -3 }}>
                    <Courses />
                </Box>
            )}

            {/* TAB 2: PROJECTS */}
            {tabValue === 1 && (
                <Box sx={{ mx: -3 }}>
                    <ProjectManagement />
                </Box>
            )}

            {/* TAB 3: INTERNSHIPS */}
            {tabValue === 2 && (
                <Box sx={{ mx: -3 }}>
                    <InternshipManagement />
                </Box>
            )}
        </Box>
    );
};

export default ProgramsManagement;
