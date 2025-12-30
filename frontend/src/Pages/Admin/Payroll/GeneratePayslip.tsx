import {
    Box,
    Button,
    Typography,
    TextField,
    MenuItem,
    Card,
    CardContent
} from "@mui/material";
import { useState } from "react";
import { MdReceipt } from "react-icons/md";
import { useGetEmployees, useGeneratePayslip } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)", color: "#f8fafc", borderRadius: "6px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
    "& .MuiSelect-icon": { color: "#64748b" },
};

const GeneratePayslip = () => {
    const { data: employees } = useGetEmployees();
    const generateMutation = useGeneratePayslip();

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [month, setMonth] = useState("January");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const handleGenerate = () => {
        if (!selectedEmployee) {
            CustomSnackBar.errorSnackbar("Select an employee");
            return;
        }

        generateMutation.mutate({
            employeeProfileId: selectedEmployee,
            month,
            year,
            extraEarnings: [],
            extraDeductions: []
        }, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Payslip generated successfully!");
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed");
            }
        });
    };

    return (
        <Box maxWidth="md" mx="auto">
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <MdReceipt size={28} style={{ color: "#4ade80" }} />
                <Typography sx={{ fontSize: "20px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Generate Monthly Payslip
                </Typography>
            </Box>

            <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px" }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        <Box sx={{ width: "100%" }}>
                            <TextField select label="Select Employee" fullWidth value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} sx={textFieldDarkStyles} size="small">
                                {employees?.map((emp: any) => (
                                    <MenuItem key={emp._id} value={emp._id}>{emp.user?.name} ({emp.employeeId})</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ width: "calc(50% - 12px)" }}>
                            <TextField select label="Month" fullWidth value={month} onChange={e => setMonth(e.target.value)} sx={textFieldDarkStyles} size="small">
                                {["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"]
                                    .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                        </Box>

                        <Box sx={{ width: "calc(50% - 12px)" }}>
                            <TextField label="Year" fullWidth value={year} onChange={e => setYear(e.target.value)} sx={textFieldDarkStyles} size="small" />
                        </Box>

                        <Box sx={{ width: "100%" }}>
                            <Button
                                fullWidth
                                onClick={handleGenerate}
                                disabled={generateMutation.isPending}
                                sx={{ bgcolor: "#22c55e", color: "#fff", borderRadius: "6px", py: 1.5, fontWeight: 600, fontSize: "14px", "&:hover": { bgcolor: "#16a34a" } }}
                            >
                                {generateMutation.isPending ? "Generating..." : "Generate Payslip"}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GeneratePayslip;
