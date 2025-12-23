import { Box, Typography, Card, CardContent, Button, Avatar } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useGetPaymentSettings } from "../../Hooks/payment";

const Pay = () => {
    const [searchParams] = useSearchParams();
    const assignmentId = searchParams.get("assignmentId");
    const navigate = useNavigate();

    const token = Cookies.get("skToken");

    const { data: myCoursesData, isLoading } = useQuery({
        queryKey: ["my-courses-for-pay" , assignmentId],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}student/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
        enabled: !!assignmentId
    });

    const { data: paymentSettings } = useGetPaymentSettings();

    if (!assignmentId) return <Box p={3}>Invalid payment link</Box>;
    if (isLoading) return <Box p={3}>Loading...</Box>;

    const assignment = myCoursesData?.find((a: any) => a._id === assignmentId) || null;
    if (!assignment) return <Box p={3}>Assignment not found or you are not authorized to view it.</Box>;

    const amount = assignment.payment?.advanceAmount || assignment.payment?.finalAmount || assignment.payment?.amount || 0;

    return (
        <Box p={3} maxWidth="md" mx="auto">
            <Typography variant="h5" mb={2}>Pay for: {assignment.itemId?.title || assignment.itemId?.name}</Typography>
            <Card>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight="600">Amount Due</Typography>
                    <Typography variant="h4" color="primary" sx={{ mb: 2 }}>₹{amount}</Typography>

                    <Typography variant="subtitle1" fontWeight="600" sx={{ mt: 2 }}>Payment Instructions</Typography>
                    {paymentSettings?.enableBankTransfer && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">Account Holder: {paymentSettings.bankDetails?.accountHolderName || "-"}</Typography>
                            <Typography variant="body2">Account Number: {paymentSettings.bankDetails?.accountNumber || "-"}</Typography>
                            <Typography variant="body2">Bank: {paymentSettings.bankDetails?.bankName || "-"} | IFSC: {paymentSettings.bankDetails?.ifsc || "-"}</Typography>
                        </Box>
                    )}

                    {paymentSettings?.enableUPI && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body2">UPI ID: {paymentSettings.upiId || "-"}</Typography>
                                {paymentSettings.qrUrl && <Avatar variant="square" src={paymentSettings.qrUrl} sx={{ width: 120, height: 120, mt: 1 }} />}
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button variant="contained" onClick={() => window.open(paymentSettings?.qrUrl || '#', '_blank')}>Open QR</Button>
                        <Button variant="outlined" onClick={() => navigate('/student/my-projects')}>Back to Projects</Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Pay;
