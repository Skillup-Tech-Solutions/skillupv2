import { Box, Button, keyframes } from "@mui/material";
import { HourglassMedium, UploadSimple } from "@phosphor-icons/react";

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
                background: "linear-gradient(135deg, rgba(120, 53, 15, 0.2) 0%, rgba(120, 53, 15, 0.1) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(245, 158, 11, 0.2)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: `${pulse} 2s infinite ease-in-out`,
                }}
            >
                <HourglassMedium size={36} weight="duotone" color="#f59e0b" />
            </Box>

            <Box>
                <Box
                    sx={{
                        fontFamily: "'Chivo', sans-serif",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#f59e0b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 0.5,
                    }}
                >
                    Payment Under Verification
                </Box>
                <Box
                    sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        color: "#94a3b8",
                        maxWidth: "300px",
                        lineHeight: 1.6,
                    }}
                >
                    We've received your payment proof. Our team is currently verifying it. This usually takes a few hours.
                </Box>
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
                        bgcolor: "rgba(245, 158, 11, 0.15)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
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
                    <Box
                        sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px",
                            color: "#f59e0b",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                        }}
                    >
                        Verifying Proof
                    </Box>
                </Box>

                {onReupload && (
                    <Button
                        size="small"
                        startIcon={<UploadSimple size={16} />}
                        onClick={onReupload}
                        sx={{
                            px: 3,
                            py: 0.8,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#f59e0b",
                            bgcolor: "rgba(51, 65, 85, 0.5)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            "&:hover": {
                                bgcolor: "rgba(51, 65, 85, 0.8)",
                                borderColor: "#f59e0b",
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
