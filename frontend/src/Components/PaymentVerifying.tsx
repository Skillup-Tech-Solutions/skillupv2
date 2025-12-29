import { Box, Typography, keyframes, Button } from "@mui/material";
import { MdAccessTime, MdUpload } from "react-icons/md";
import { outlinedButtonStyle } from "../assets/Styles/ButtonStyles";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

interface PaymentVerifyingProps {
    onReupload?: () => void;
}

const PaymentVerifying = ({ onReupload }: PaymentVerifyingProps) => {
    return (
        <Box
            sx={{
                p: 4,
                bgcolor: "#fffbeb",
                borderRadius: "12px",
                border: "1px solid #fcd34d",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: `${pulse} 2s infinite ease-in-out`,
                }}
            >
                <MdAccessTime size={36} color="#f59e0b" />
            </Box>

            <Box>
                <Typography
                    sx={{
                        fontFamily: "SemiBold_W",
                        fontSize: "18px",
                        color: "#d97706",
                        mb: 0.5,
                    }}
                >
                    Payment under verification
                </Typography>
                <Typography
                    sx={{
                        fontFamily: "Regular_W",
                        fontSize: "14px",
                        color: "#92400e",
                        maxWidth: "300px",
                        lineHeight: 1.5,
                    }}
                >
                    We've received your payment proof. Our team is currently verifying it. This usually takes a few hours.
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                    width: "100%"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                        px: 2,
                        py: 0.5,
                        bgcolor: "#fef3c7",
                        borderRadius: "20px",
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#f59e0b",
                            animation: `${pulse} 1.5s infinite ease-in-out`,
                        }}
                    />
                    <Typography
                        sx={{
                            fontFamily: "Medium_W",
                            fontSize: "12px",
                            color: "#b45309",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Verifying Proof
                    </Typography>
                </Box>

                {onReupload && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MdUpload />}
                        onClick={onReupload}
                        sx={{
                            ...outlinedButtonStyle,
                            px: 3,
                            py: 0.8,
                            fontSize: "12px",
                            color: "#b45309",
                            borderColor: "#fcd34d",
                            "&:hover": {
                                borderColor: "#f59e0b",
                                bgcolor: "#fffbeb",
                            },
                        }}
                    >
                        Upload Again
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default PaymentVerifying;
