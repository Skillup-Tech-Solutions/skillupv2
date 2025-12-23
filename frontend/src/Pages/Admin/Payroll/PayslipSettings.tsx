import {
    Box,
    Button,
    Typography,
    TextField,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Alert
} from "@mui/material";
import { useState, useEffect } from "react";
import { useGetPayrollSettings, useUpdatePayrollSettings } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";

const PayslipSettings = () => {
    const { data, isLoading } = useGetPayrollSettings();
    const updateMutation = useUpdatePayrollSettings();

    const [settings, setSettings] = useState<any>({
        organizationName: "",
        organizationAddress: "",
        footerNote: "",
        themeColor: "#1a73e8",
        showLogo: true,
        templateId: "classic",
        defaultAllowances: [],
        defaultDeductions: []
    });

    const [allowancesInput, setAllowancesInput] = useState("");
    const [deductionsInput, setDeductionsInput] = useState("");

    useEffect(() => {
        if (data) {
            setSettings({
                organizationName: data.organizationName || "SkillUp",
                organizationAddress: data.organizationAddress || "",
                footerNote: data.footerNote || "",
                themeColor: data.themeColor || "#1a73e8",
                showLogo: data.showLogo ?? true,
                templateId: data.templateId || "classic",
                defaultAllowances: data.defaultAllowances || [],
                defaultDeductions: data.defaultDeductions || []
            });
            setAllowancesInput(data.defaultAllowances?.join(", ") || "");
            setDeductionsInput(data.defaultDeductions?.join(", ") || "");
        }
    }, [data]);

    const handleSave = () => {
        const payload = {
            ...settings,
            defaultAllowances: allowancesInput.split(",").map(s => s.trim()).filter(Boolean),
            defaultDeductions: deductionsInput.split(",").map(s => s.trim()).filter(Boolean)
        };

        updateMutation.mutate(payload, {
            onSuccess: () => CustomSnackBar.successSnackbar("Settings Updated Successfully"),
            onError: () => CustomSnackBar.errorSnackbar("Failed to update settings")
        });
    };

    if (isLoading) return <Box p={3}>Loading...</Box>;

    return (
        <Box p={3} maxWidth="lg" mx="auto">
            <Typography variant="h5" fontWeight="bold" mb={3}>Payroll Configuration</Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Organization Details</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <TextField
                                    label="Organization Name"
                                    fullWidth
                                    value={settings.organizationName}
                                    onChange={e => setSettings({ ...settings, organizationName: e.target.value })}
                                />
                                <TextField
                                    label="Address"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={settings.organizationAddress}
                                    onChange={e => setSettings({ ...settings, organizationAddress: e.target.value })}
                                />
                                <TextField
                                    label="Footer Note"
                                    fullWidth
                                    placeholder="e.g. This is a computer generated document."
                                    value={settings.footerNote || ""}
                                    onChange={e => setSettings({ ...settings, footerNote: e.target.value })}
                                    helperText="This text appears at the bottom of the PDF."
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Payslip Appearance</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <TextField
                                        label="Theme Color (Hex)"
                                        value={settings.themeColor}
                                        onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                                        sx={{ width: 150 }}
                                    />
                                    <input
                                        type="color"
                                        value={settings.themeColor}
                                        onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                                        style={{ width: 50, height: 50, padding: 0, border: "none" }}
                                    />
                                </Box>
                                <FormControlLabel
                                    control={<Switch checked={settings.showLogo} onChange={e => setSettings({ ...settings, showLogo: e.target.checked })} />}
                                    label="Show Organization Logo on Payslip"
                                />
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    Logo acts as the brand header. Ensure 'logoUrl' is set in DB or use default.
                                </Alert>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: "100%" }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Default Salary Components</Typography>
                            <Typography variant="body2" color="textSecondary" mb={2}>
                                Enter values separated by comma. These will appear as suggestions when setting up employee salary.
                            </Typography>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                                    <TextField
                                        label="Default Allowances"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Special Allowance, Conveyance, Internet"
                                        value={allowancesInput}
                                        onChange={e => setAllowancesInput(e.target.value)}
                                        helperText="Comma separated values"
                                    />
                                </Box>
                                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                                    <TextField
                                        label="Default Deductions"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Provident Fund, Professional Tax"
                                        value={deductionsInput}
                                        onChange={e => setDeductionsInput(e.target.value)}
                                        helperText="Comma separated values"
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
            </Box>
        </Box>
    );
};

export default PayslipSettings;
