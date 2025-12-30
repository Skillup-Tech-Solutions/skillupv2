import { useState, useEffect } from "react";
import { Box } from "@mui/material";
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

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MdAttachMoney size={28} style={{ color: "#4ade80" }} />
                <Box component="h1" sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em", m: 0 }}>
                    Payroll Management
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: "flex", gap: 1, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", pb: 0 }}>
                {[
                    { label: "Generate Payslip", icon: <MdAttachMoney size={18} /> },
                    { label: "Payslip History", icon: <MdHistory size={18} /> },
                    { label: "Payroll Settings", icon: <MdSettings size={18} /> },
                ].map((tab, index) => {
                    const isActive = tabValue === index;
                    return (
                        <Box key={index} onClick={() => setTabValue(index)}
                            sx={{
                                display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, cursor: "pointer",
                                transition: "all 0.2s ease",
                                borderBottom: isActive ? "2px solid #60a5fa" : "2px solid transparent",
                                color: isActive ? "#60a5fa" : "#94a3b8",
                                "&:hover": { color: isActive ? "#60a5fa" : "#f8fafc" },
                            }}>
                            {tab.icon}
                            <Box sx={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {tab.label}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* TAB 0: GENERATE PAYSLIP */}
            {tabValue === 0 && (
                <Box>
                    <GeneratePayslip />
                </Box>
            )}

            {/* TAB 1: HISTORY */}
            {tabValue === 1 && (
                <Box>
                    <PayslipHistory />
                </Box>
            )}

            {/* TAB 2: SETTINGS */}
            {tabValue === 2 && (
                <Box>
                    <PayslipSettings />
                </Box>
            )}
        </Box>
    );
};

export default PayrollManagement;
