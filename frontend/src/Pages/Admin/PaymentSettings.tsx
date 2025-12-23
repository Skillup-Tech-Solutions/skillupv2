import { Box, Card, CardContent, Typography, TextField, Switch, FormControlLabel, Button, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetPaymentSettingsAdmin, useUpdatePaymentSettings, useUploadPaymentQR } from "../../Hooks/payment";
import CustomSnackBar from "../../Custom/CustomSnackBar";

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

    if (isLoading) return <Box p={3}>Loading...</Box>;

    return (
        <Box p={3} maxWidth="lg" mx="auto">
            <Typography variant="h5" fontWeight="bold" mb={3}>Payment Settings</Typography>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Payment Methods</Typography>
                            <FormControlLabel
                                control={<Switch checked={settings.enableBankTransfer} onChange={e => setSettings(prev => ({ ...prev, enableBankTransfer: e.target.checked }))} />}
                                label="Enable Bank Transfer"
                            />
                            <FormControlLabel
                                control={<Switch checked={settings.enableUPI} onChange={e => setSettings(prev => ({ ...prev, enableUPI: e.target.checked }))} />}
                                label="Enable UPI Payment"
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Bank Details</Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <TextField label="Account Holder Name" fullWidth value={settings.bankDetails?.accountHolderName || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value } }))} />
                                <TextField label="Account Number" fullWidth value={settings.bankDetails?.accountNumber || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value } }))} />
                                <TextField label="Bank Name" fullWidth value={settings.bankDetails?.bankName || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))} />
                                <TextField label="IFSC Code" fullWidth value={settings.bankDetails?.ifsc || ""} onChange={e => setSettings(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, ifsc: e.target.value } }))} />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>UPI & QR Code</Typography>
                            <TextField label="UPI ID" fullWidth value={settings.upiId || ""} onChange={e => setSettings(prev => ({ ...prev, upiId: e.target.value }))} sx={{ mb: 2 }} />

                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <Box>
                                    {settings.qrUrl ? (
                                        <Avatar variant="square" src={settings.qrUrl} sx={{ width: 96, height: 96, mr: 2 }} />
                                    ) : (
                                        <Box sx={{ width: 96, height: 96, bgcolor: "#f1f5f9", borderRadius: 1, mr: 2 }} />
                                    )}
                                </Box>
                                <Box>
                                    <Button variant="outlined" component="label">Choose file<input type="file" hidden accept="image/*" onChange={e => setQrFile(e.target.files?.[0] || null)} /></Button>
                                    <Button sx={{ ml: 2 }} onClick={handleUploadQR} disabled={!qrFile || uploadMutation.isPending}>{uploadMutation.isPending ? "Uploading..." : "Upload"}</Button>
                                </Box>
                            </Box>

                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>Upload a square image of your UPI QR code.</Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" size="large" onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Settings"}</Button>
            </Box>
        </Box>
    );
};

export default PaymentSettings;
