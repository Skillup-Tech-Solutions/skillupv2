import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import { FaUsers, FaUserTie } from "react-icons/fa";
import Users from "../Custom/Users";
import EmployeeManagement from "./Admin/Payroll/EmployeeManagement";

const PeopleManagement = () => {
    const location = useLocation();
    const [tabValue, setTabValue] = useState(location.pathname.includes("employees") ? 1 : 0);

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                People Management
            </Typography>

            {/* Main Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
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
                        label="User Management"
                        icon={<FaUsers size={18} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                    <Tab
                        label="Employee Management"
                        icon={<FaUserTie size={18} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                </Tabs>
            </Paper>

            {/* TAB 1: USER MANAGEMENT (Students & Admins) */}
            {tabValue === 0 && (
                <Box sx={{ mx: -3 }}>
                    <Users />
                </Box>
            )}

            {/* TAB 2: EMPLOYEE MANAGEMENT (Payroll) */}
            {tabValue === 1 && (
                <Box sx={{ mx: -3 }}>
                    <EmployeeManagement />
                </Box>
            )}
        </Box>
    );
};

export default PeopleManagement;
