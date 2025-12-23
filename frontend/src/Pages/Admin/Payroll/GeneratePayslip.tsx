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
import { useGetEmployees, useGeneratePayslip } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";

const GeneratePayslip = () => {
    const { data: employees } = useGetEmployees();
    const generateMutation = useGeneratePayslip();

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [month, setMonth] = useState("January");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    // Simple View Logic

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
        <Box p={3} maxWidth="md" mx="auto">
            <Typography variant="h5" fontWeight="bold" mb={3}>Generate Monthly Payslip</Typography>

            <Card>
                <CardContent>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        <Box sx={{ width: "100%" }}>
                            <TextField select label="Select Employee" fullWidth value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
                                {employees?.map((emp: any) => (
                                    <MenuItem key={emp._id} value={emp._id}>{emp.user?.name} ({emp.employeeId})</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ width: "calc(50% - 12px)" }}>
                            <TextField select label="Month" fullWidth value={month} onChange={e => setMonth(e.target.value)}>
                                {["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"]
                                    .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                        </Box>

                        <Box sx={{ width: "calc(50% - 12px)" }}>
                            <TextField label="Year" fullWidth value={year} onChange={e => setYear(e.target.value)} />
                        </Box>

                        <Box sx={{ width: "100%" }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleGenerate}
                                disabled={generateMutation.isPending}
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
