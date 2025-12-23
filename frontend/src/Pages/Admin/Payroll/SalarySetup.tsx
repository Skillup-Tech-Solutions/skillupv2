import {
    Box,
    Button,
    Typography,
    TextField,
    Card,
    CardContent,
    IconButton,
    Divider
} from "@mui/material";
import { MdDelete, MdAdd } from "react-icons/md";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetEmployeeById, useUpdateSalaryStructure } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";

const SalarySetup = () => {
    const { id } = useParams(); // Employee Profile ID
    const navigate = useNavigate();
    const { data, isLoading } = useGetEmployeeById(id!);
    const updateMutation = useUpdateSalaryStructure();

    // State for structure
    const [structure, setStructure] = useState<any>({
        basic: 0,
        hra: 0,
        allowances: [],
        deductions: []
    });

    useEffect(() => {
        if (data?.salaryStructure) {
            setStructure({
                basic: data.salaryStructure.basic || 0,
                hra: data.salaryStructure.hra || 0,
                allowances: data.salaryStructure.allowances || [],
                deductions: data.salaryStructure.deductions || []
            });
        }
    }, [data]);

    const handleSave = () => {
        updateMutation.mutate({ id: id!, data: structure }, {
            onSuccess: () => CustomSnackBar.successSnackbar("Salary Structure Updated"),
            onError: () => CustomSnackBar.errorSnackbar("Failed to update")
        });
    };

    const addAllowance = () => {
        setStructure({ ...structure, allowances: [...structure.allowances, { name: "", amount: 0, taxable: true }] });
    };

    const removeAllowance = (index: number) => {
        const newArr = [...structure.allowances];
        newArr.splice(index, 1);
        setStructure({ ...structure, allowances: newArr });
    };

    const updateAllowance = (index: number, field: string, value: any) => {
        const newArr = [...structure.allowances];
        newArr[index] = { ...newArr[index], [field]: value };
        setStructure({ ...structure, allowances: newArr });
    };

    const addDeduction = () => {
        setStructure({ ...structure, deductions: [...structure.deductions, { name: "", amount: 0 }] });
    };

    const removeDeduction = (index: number) => {
        const newArr = [...structure.deductions];
        newArr.splice(index, 1);
        setStructure({ ...structure, deductions: newArr });
    };

    const updateDeduction = (index: number, field: string, value: any) => {
        const newArr = [...structure.deductions];
        newArr[index] = { ...newArr[index], [field]: value };
        setStructure({ ...structure, deductions: newArr });
    };

    if (isLoading) return <Box p={3}>Loading...</Box>;

    const totalEarnings = Number(structure.basic) + Number(structure.hra) + structure.allowances.reduce((acc: any, curr: any) => acc + Number(curr.amount || 0), 0);
    const totalDeductions = structure.deductions.reduce((acc: any, curr: any) => acc + Number(curr.amount || 0), 0);
    const netSalary = totalEarnings - totalDeductions;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Salary Setup: {data?.profile?.user?.name}
                </Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {/* Earnings */}
                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2} color="primary">Earnings</Typography>
                            <Box display="flex" gap={2} mb={2}>
                                <TextField label="Basic Pay" type="number" fullWidth size="small"
                                    value={structure.basic || ""} onChange={e => setStructure({ ...structure, basic: e.target.value === "" ? 0 : Number(e.target.value) })}
                                />
                                <TextField label="HRA" type="number" fullWidth size="small"
                                    value={structure.hra || ""} onChange={e => setStructure({ ...structure, hra: e.target.value === "" ? 0 : Number(e.target.value) })}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Allowances</Typography>
                                <Button size="small" startIcon={<MdAdd />} onClick={addAllowance}>Add</Button>
                            </Box>

                            {structure.allowances.map((item: any, index: number) => (
                                <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
                                    <TextField placeholder="Name" size="small" value={item.name} onChange={e => updateAllowance(index, "name", e.target.value)} />
                                    <TextField placeholder="Amount" type="number" size="small" value={item.amount || ""} onChange={e => updateAllowance(index, "amount", e.target.value === "" ? 0 : Number(e.target.value))} />
                                    <IconButton size="small" color="error" onClick={() => removeAllowance(index)}><MdDelete /></IconButton>
                                </Box>
                            ))}

                            <Box mt={3} p={2} bgcolor="#f0f9ff" borderRadius={1}>
                                <Typography fontWeight="bold">Total Earnings: ₹{totalEarnings}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Deductions */}
                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2} color="error">Deductions</Typography>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Components</Typography>
                                <Button size="small" startIcon={<MdAdd />} onClick={addDeduction}>Add</Button>
                            </Box>

                            {structure.deductions.map((item: any, index: number) => (
                                <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
                                    <TextField placeholder="Name" size="small" value={item.name} onChange={e => updateDeduction(index, "name", e.target.value)} />
                                    <TextField placeholder="Amount" type="number" size="small" value={item.amount || ""} onChange={e => updateDeduction(index, "amount", e.target.value === "" ? 0 : Number(e.target.value))} />
                                    <IconButton size="small" color="error" onClick={() => removeDeduction(index)}><MdDelete /></IconButton>
                                </Box>
                            ))}

                            <Box mt={3} p={2} bgcolor="#fff0f0" borderRadius={1}>
                                <Typography fontWeight="bold">Total Deductions: ₹{totalDeductions}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Summary */}
                <Box sx={{ width: "100%" }}>
                    <Card sx={{ bgcolor: "#2e7d32", color: "white" }}>
                        <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h5">Net Salary (Monthly)</Typography>
                            <Typography variant="h4" fontWeight="bold">₹{netSalary}</Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" size="large" onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Structure"}
                </Button>
            </Box>
        </Box>
    );
};

export default SalarySetup;
