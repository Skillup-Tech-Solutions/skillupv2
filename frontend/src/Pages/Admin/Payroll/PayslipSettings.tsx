import {
    Box,
    Button,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MdBusiness, MdPalette, MdAccountBalance } from "react-icons/md";
import { useGetPayrollSettings, useUpdatePayrollSettings } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";
import {
    textFieldDarkStyles,
    primaryButtonDarkStyles,
} from "../../../assets/Styles/AdminDarkTheme";

// Section Card Component
const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <Box sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", bgcolor: "rgba(15, 23, 42, 0.5)" }}>
            <Box sx={{ color: "#60a5fa" }}>{icon}</Box>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</Typography>
        </Box>
        <Box sx={{ p: 2.5 }}>{children}</Box>
    </Box>
);

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

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#60a5fa" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Top Row - Two Cards Side by Side */}
            <Box sx={{ display: "flex", gap: 3 }}>
                {/* Organization Details */}
                <Box sx={{ flex: 1 }}>
                    <SectionCard icon={<MdBusiness size={18} />} title="Organization Details">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Organization Name"
                                fullWidth
                                value={settings.organizationName}
                                onChange={e => setSettings({ ...settings, organizationName: e.target.value })}
                                sx={textFieldDarkStyles}
                                size="small"
                            />
                            <TextField
                                label="Address"
                                fullWidth
                                multiline
                                rows={2}
                                value={settings.organizationAddress}
                                onChange={e => setSettings({ ...settings, organizationAddress: e.target.value })}
                                sx={textFieldDarkStyles}
                            />
                            <TextField
                                label="Footer Note"
                                fullWidth
                                placeholder="e.g. This is a computer generated document."
                                value={settings.footerNote || ""}
                                onChange={e => setSettings({ ...settings, footerNote: e.target.value })}
                                helperText="This text appears at the bottom of the PDF."
                                sx={{ ...textFieldDarkStyles, "& .MuiFormHelperText-root": { color: "#64748b" } }}
                                size="small"
                            />
                        </Box>
                    </SectionCard>
                </Box>

                {/* Payslip Appearance */}
                <Box sx={{ flex: 1 }}>
                    <SectionCard icon={<MdPalette size={18} />} title="Payslip Appearance">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <TextField
                                    label="Theme Color (Hex)"
                                    value={settings.themeColor}
                                    onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                                    sx={{ width: 160, ...textFieldDarkStyles }}
                                    size="small"
                                />
                                <input
                                    type="color"
                                    value={settings.themeColor}
                                    onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                                    style={{ width: 40, height: 40, padding: 0, border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px", cursor: "pointer", backgroundColor: "transparent" }}
                                />
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showLogo}
                                        onChange={e => setSettings({ ...settings, showLogo: e.target.checked })}
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": { color: "#3b82f6" },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#3b82f6" },
                                            "& .MuiSwitch-track": { bgcolor: "#475569" }
                                        }}
                                    />
                                }
                                label={<Typography sx={{ color: "#f8fafc", fontSize: "13px" }}>Show Organization Logo on Payslip</Typography>}
                            />
                            <Box sx={{ p: 1.5, bgcolor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "6px" }}>
                                <Typography sx={{ fontSize: "11px", color: "#60a5fa" }}>
                                    Logo acts as the brand header. Ensure 'logoUrl' is set in DB or use default.
                                </Typography>
                            </Box>
                        </Box>
                    </SectionCard>
                </Box>
            </Box>

            {/* Salary Components - Full Width */}
            <SectionCard icon={<MdAccountBalance size={18} />} title="Default Salary Components">
                <Typography sx={{ fontSize: "12px", color: "#64748b", mb: 2 }}>
                    Enter values separated by comma. These will appear as suggestions when setting up employee salary.
                </Typography>
                <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <TextField
                            label="Default Allowances"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Special Allowance, Conveyance, Internet"
                            value={allowancesInput}
                            onChange={e => setAllowancesInput(e.target.value)}
                            helperText="Comma separated values"
                            sx={{ ...textFieldDarkStyles, "& .MuiFormHelperText-root": { color: "#64748b" } }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <TextField
                            label="Default Deductions"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Provident Fund, Professional Tax"
                            value={deductionsInput}
                            onChange={e => setDeductionsInput(e.target.value)}
                            helperText="Comma separated values"
                            sx={{ ...textFieldDarkStyles, "& .MuiFormHelperText-root": { color: "#64748b" } }}
                        />
                    </Box>
                </Box>
            </SectionCard>

            {/* Save Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleSave} disabled={updateMutation.isPending} sx={primaryButtonDarkStyles}>
                    {updateMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
            </Box>
        </Box>
    );
};

export default PayslipSettings;
