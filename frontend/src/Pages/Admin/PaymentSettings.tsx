import { Box, Card, CardContent, Typography, TextField, Switch, FormControlLabel, Button, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { useGetPaymentSettingsAdmin, useUpdatePaymentSettings, useUploadPaymentQR } from "../../Hooks/payment";
import CustomSnackBar from "../../Custom/CustomSnackBar";

const textFieldDarkStyles = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(15, 23, 42, 0.5)", color: "#f8fafc", borderRadius: "6px",
        "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
        "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
    "& .MuiInputLabel-root": { color: "#94a3b8", "&.Mui-focused": { color: "#3b82f6" } },
};

const PaymentSettings = () => {
    const { data, isLoading } = useGetPaymentSettingsAdmin();
    const updateMutation = useUpdatePaymentSettings();
    const uploadMutation = useUploadPaymentQR();

    const [settings, setSettings] = useState<any>({
        enableBankTransfer: false,
        bankDetails: { accountHolderName: "", accountNumber: "", bankName: "", ifsc: "" },
        enableUPI: true,
        upiId: "",
        qrUrl: ""
    });

    const [qrFile, setQrFile] = useState<File | null>(null);

    useEffect(() => {
        if (data) {
            setSettings({
                enableBankTransfer: data.enableBankTransfer || false,
                bankDetails: data.bankDetails || { accountHolderName: "", accountNumber: "", bankName: "", ifsc: "" },
                enableUPI: data.enableUPI ?? true,
                upiId: data.upiId || "",
                qrUrl: data.qrUrl || ""
            });
        }
    }, [data]);

    const handleSave = () => {
        updateMutation.mutate(settings, {
            onSuccess: () => CustomSnackBar.successSnackbar("Payment settings updated"),
            onError: () => CustomSnackBar.errorSnackbar("Failed to update payment settings")
        });
    };

    const handleUploadQR = async () => {
        if (!qrFile) return CustomSnackBar.errorSnackbar("Please choose a QR file first");
        const fd = new FormData();
        fd.append("qr", qrFile);
        uploadMutation.mutate(fd, {
            onSuccess: (res: any) => {
                setSettings(prev => ({ ...prev, qrUrl: res.url }));
                CustomSnackBar.successSnackbar("QR uploaded");
            },
            onError: () => CustomSnackBar.errorSnackbar("QR upload failed")
        });
    };

    if (isLoading) return <Box p={3} color="#94a3b8">Loading...</Box>;

    return (
        <Box maxWidth="lg">
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <MdSettings size={28} style={{ color: "#a78bfa" }} />
                <Typography sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Payment Settings
                </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                    <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px" }}>
                        <CardContent>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", mb: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Methods</Typography>
                            <FormControlLabel
                                control={<Switch checked={settings.enableBankTransfer} onChange={e => setSettings(prev => ({ ...prev, enableBankTransfer: e.target.checked }))} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#3b82f6" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#3b82f6" } }} />}
                                label={<Typography sx={{ color: "#f8fafc", fontSize: "13px" }}>Enable Bank Transfer</Typography>}
                            />
                            <FormControlLabel
                                control={<Switch checked={settings.enableUPI} onChange={e => setSettings(prev => ({ ...prev, enableUPI: e.target.checked }))} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#3b82f6" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#3b82f6" } }} />}
                                label={<Typography sx={{ color: "#f8fafc", fontSize: "13px" }}>Enable UPI Payment</Typography>}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 3, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px" }}>
                        <CardContent>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", mb: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Bank Details</Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <TextField label="Account Holder Name" fullWidth value={settings.bankDetails?.accountHolderName || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value } }))} sx={textFieldDarkStyles} size="small" />
                                <TextField label="Account Number" fullWidth value={settings.bankDetails?.accountNumber || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value } }))} sx={textFieldDarkStyles} size="small" />
                                <TextField label="Bank Name" fullWidth value={settings.bankDetails?.bankName || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))} sx={textFieldDarkStyles} size="small" />
                                <TextField label="IFSC Code" fullWidth value={settings.bankDetails?.ifsc || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, ifsc: e.target.value } }))} sx={textFieldDarkStyles} size="small" />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                    <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "6px" }}>
                        <CardContent>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", mb: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>UPI & QR Code</Typography>
                            <TextField label="UPI ID" fullWidth value={settings.upiId || ""} onChange={e => setSettings(prev => ({ ...prev, upiId: e.target.value }))} sx={{ mb: 2, ...textFieldDarkStyles }} size="small" />

                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <Box>
                                    {settings.qrUrl ? (
                                        <Avatar variant="square" src={settings.qrUrl} sx={{ width: 96, height: 96, mr: 2, borderRadius: "6px" }} />
                                    ) : (
                                        <Box sx={{ width: 96, height: 96, bgcolor: "rgba(51, 65, 85, 0.5)", borderRadius: "6px", mr: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Typography sx={{ color: "#64748b", fontSize: "10px" }}>No QR</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box>
                                    <Button component="label" sx={{ border: "1px solid rgba(71, 85, 105, 0.4)", color: "#f8fafc", borderRadius: "6px", fontSize: "12px", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" } }}>
                                        Choose file<input type="file" hidden accept="image/*" onChange={e => setQrFile(e.target.files?.[0] || null)} />
                                    </Button>
                                    <Button sx={{ ml: 1, bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", fontSize: "12px", "&:hover": { bgcolor: "#2563eb" } }} onClick={handleUploadQR} disabled={!qrFile || uploadMutation.isPending}>
                                        {uploadMutation.isPending ? "Uploading..." : "Upload"}
                                    </Button>
                                </Box>
                            </Box>

                            <Typography sx={{ fontSize: "11px", color: "#64748b", mt: 2 }}>Upload a square image of your UPI QR code.</Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button onClick={handleSave} disabled={updateMutation.isPending} sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 3, py: 1, fontWeight: 600, "&:hover": { bgcolor: "#2563eb" } }}>
                    {updateMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
            </Box>
        </Box>
    );
};

export default PaymentSettings;
