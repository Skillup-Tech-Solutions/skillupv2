import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { MdAttachMoney, MdHistory, MdSettings } from "react-icons/md";
import GeneratePayslip from "./GeneratePayslip";
import PayslipHistory from "./PayslipHistory";
import PayslipSettings from "./PayslipSettings";

const PayrollManagement = () => {
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);

    // Sync tab with URL path
    useEffect(() => {
        if (location.pathname.includes("history")) {
            setTabValue(1);
        } else if (location.pathname.includes("settings")) {
            setTabValue(2);
        } else {
            setTabValue(0); // Default to Generate Payslip
        }
    }, [location.pathname]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Payroll Management
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
                        label="Generate Payslip"
                        icon={<MdAttachMoney size={20} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                    <Tab
                        label="Payslip History"
                        icon={<MdHistory size={20} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                    <Tab
                        label="Payroll Settings"
                        icon={<MdSettings size={20} />}
                        iconPosition="start"
                        sx={{ gap: 1 }}
                    />
                </Tabs>
            </Paper>

            {/* TAB 0: GENERATE PAYSLIP */}
            {tabValue === 0 && (
                <Box sx={{ mx: -3 }}>
                    <GeneratePayslip />
                </Box>
            )}

            {/* TAB 1: HISTORY */}
            {tabValue === 1 && (
                <Box sx={{ mx: -3 }}>
                    <PayslipHistory />
                </Box>
            )}

            {/* TAB 2: SETTINGS */}
            {tabValue === 2 && (
                <Box sx={{ mx: -3 }}>
                    <PayslipSettings />
                </Box>
            )}
        </Box>
    );
};

export default PayrollManagement;
