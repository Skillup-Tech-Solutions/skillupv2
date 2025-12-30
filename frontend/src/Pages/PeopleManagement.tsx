import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { Users as UsersIcon, UserCircleGear } from "@phosphor-icons/react";
import Users from "../Custom/Users";
import EmployeeManagement from "./Admin/Payroll/EmployeeManagement";

const PeopleManagement = () => {
    const location = useLocation();
    const [tabValue, setTabValue] = useState(location.pathname.includes("employees") ? 1 : 0);

    const tabs = [
        { label: "User Management", icon: UsersIcon },
        { label: "Employee Management", icon: UserCircleGear },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <UsersIcon size={28} weight="duotone" style={{ color: "#60a5fa" }} />
                <Box
                    component="h1"
                    sx={{
                        fontSize: "24px",
                        fontFamily: "'Chivo', sans-serif",
                        fontWeight: 700,
                        color: "#f8fafc",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        m: 0,
                    }}
                >
                    People Management
                </Box>
            </Box>

            {/* Tabs */}
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
                    pb: 0,
                }}
            >
                {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = tabValue === index;
                    return (
                        <Box
                            key={tab.label}
                            onClick={() => setTabValue(index)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 1.5,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                borderBottom: isActive ? "2px solid #60a5fa" : "2px solid transparent",
                                color: isActive ? "#60a5fa" : "#94a3b8",
                                "&:hover": {
                                    color: isActive ? "#60a5fa" : "#f8fafc",
                                },
                            }}
                        >
                            <Icon size={18} weight="duotone" />
                            <Box
                                sx={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {tab.label}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* TAB 1: USER MANAGEMENT (Students & Admins) */}
            {tabValue === 0 && (
                <Box>
                    <Users />
                </Box>
            )}

            {/* TAB 2: EMPLOYEE MANAGEMENT (Payroll) */}
            {tabValue === 1 && (
                <Box>
                    <EmployeeManagement />
                </Box>
            )}
        </Box>
    );
};

export default PeopleManagement;
