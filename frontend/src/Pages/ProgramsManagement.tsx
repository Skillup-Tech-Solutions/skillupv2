import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { BookOpen, ProjectorScreen, Briefcase, ListBullets, Certificate, VideoCamera } from "@phosphor-icons/react";
import Courses from "./Courses";
import ProjectManagement from "./ProjectManagement";
import InternshipManagement from "./InternshipManagement";

const ProgramsManagement = () => {
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [subTab, setSubTab] = useState(0);

    useEffect(() => {
        if (location.pathname.includes("projects")) setTabValue(1);
        else if (location.pathname.includes("internships")) setTabValue(2);
        else setTabValue(0);
    }, [location.pathname]);

    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setSubTab(0);
    };

    return (
        <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <Box>
                <Typography sx={{ fontSize: "28px", fontFamily: "'Chivo', sans-serif", fontWeight: 800, color: "#f8fafc", mb: 1 }}>Program Orchestrator</Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "14px" }}>Control your academic offerings, track submissions, and issue professional certifications.</Typography>
            </Box>

            <Paper elevation={0} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "6px", border: "1px solid rgba(71, 85, 105, 0.6)", overflow: "hidden" }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
                        "& .MuiTabs-indicator": { bgcolor: "#3b82f6", height: 3 },
                        "& .MuiTab-root": {
                            color: "#64748b",
                            py: 3,
                            fontWeight: 700,
                            fontSize: "13px",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            gap: 1.5,
                            "&.Mui-selected": { color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.05)" }
                        }
                    }}
                >
                    <Tab label="Courses" icon={<BookOpen size={22} weight="duotone" />} iconPosition="start" />
                    <Tab label="Projects" icon={<ProjectorScreen size={22} weight="duotone" />} iconPosition="start" />
                    <Tab label="Internships" icon={<Briefcase size={22} weight="duotone" />} iconPosition="start" />
                </Tabs>

                <Tabs
                    value={subTab}
                    onChange={(_, v) => setSubTab(v)}
                    sx={{
                        px: 2,
                        minHeight: 56,
                        "& .MuiTabs-indicator": { bgcolor: "#ea580c" },
                        "& .MuiTab-root": {
                            color: "#94a3b8",
                            fontWeight: 600,
                            fontSize: "12px",
                            textTransform: "none",
                            gap: 1,
                            "&.Mui-selected": { color: "#f97316" }
                        }
                    }}
                >
                    <Tab label="Catalog Management" icon={<ListBullets size={18} />} iconPosition="start" />
                    <Tab label="Submissions & Credentials" icon={<Certificate size={18} />} iconPosition="start" />
                    <Tab label="Live Sessions" icon={<VideoCamera size={18} weight="fill" />} iconPosition="start" />
                </Tabs>
            </Paper>

            <Box sx={{ animation: "fadeIn 0.4s ease-out" }}>
                {tabValue === 0 && <Courses activeSubTab={subTab} />}
                {tabValue === 1 && <ProjectManagement activeSubTab={subTab} />}
                {tabValue === 2 && <InternshipManagement activeSubTab={subTab} />}
            </Box>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </Box>
    );
};

export default ProgramsManagement;
