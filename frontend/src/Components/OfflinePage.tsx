import { Box, Button, Typography } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import SignalWifiStatusbarConnectedNoInternet4Icon from "@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4";
import HomeIcon from "@mui/icons-material/Home";
import { useState, useEffect } from "react";
import { images } from "../assets/Images/Images";

interface OfflinePageProps {
    type?: "offline" | "error";
    title?: string;
    message?: string;
    onRetry?: () => void;
}

const OfflinePage = ({
    type = "offline",
    title,
    message,
    onRetry,
}: OfflinePageProps) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Auto-reload when connection is restored
    useEffect(() => {
        if (isOnline && type === "offline") {
            const timer = setTimeout(() => {
                const intendedUrl = sessionStorage.getItem("intendedUrl") || "/";
                sessionStorage.removeItem("intendedUrl");
                window.location.href = `/#${intendedUrl}`;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOnline, type]);

    const handleRetry = async () => {
        setIsRetrying(true);

        if (onRetry) {
            onRetry();
            setTimeout(() => setIsRetrying(false), 2000);
            return;
        }

        try {
            if (navigator.onLine) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                await fetch("https://www.google.com/favicon.ico", {
                    mode: "no-cors",
                    cache: "no-store",
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                const intendedUrl = sessionStorage.getItem("intendedUrl") || "/";
                sessionStorage.removeItem("intendedUrl");
                window.location.href = `/#${intendedUrl}`;
            } else {
                setIsRetrying(false);
            }
        } catch {
            setIsRetrying(false);
        }
    };

    const handleGoHome = () => {
        sessionStorage.removeItem("intendedUrl");
        window.location.href = "/#/";
    };

    const isOfflineType = type === "offline";
    const displayTitle = title || (isOfflineType ? "You're Offline" : "Connection Error");
    const displayMessage =
        message ||
        (isOfflineType
            ? "It looks like you've lost your internet connection. Please check your network settings and try again."
            : "We're having trouble connecting to the server. Please check your connection and try again.");

    return (
        <Box sx={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
            {/* Background overlay - same as landing page */}
            <Box
                sx={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    zIndex: "9",
                }}
            >
                <Box
                    component={"img"}
                    src={images.overlay}
                    alt="background"
                    sx={{
                        width: "100%",
                        height: "100%",
                        "@media (max-width: 600px)": { height: "500px" },
                    }}
                />
            </Box>

            {/* Main content */}
            <Box
                sx={{
                    background: "#ffffffea",
                    padding: "10px 20px",
                    zIndex: "999",
                    position: "relative",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    "@media (max-width: 991px)": { padding: "10px" },
                    "@media (max-width: 600px)": { background: "#ffffffc4" },
                    "@media (max-width: 450px)": { padding: "10px 5px" },
                }}
            >
                {/* Logo/Brand Header */}
                <Box
                    sx={{
                        padding: "20px 30px",
                        "@media (max-width: 991px)": { padding: "15px 20px" },
                        "@media (max-width: 550px)": { padding: "15px 10px" },
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "Bold_W",
                            fontSize: "24px",
                            color: "var(--webprimary)",
                            cursor: "pointer",
                            "@media (max-width: 768px)": { fontSize: "20px" },
                        }}
                        onClick={handleGoHome}
                    >
                        SkillUp
                    </Typography>
                </Box>

                {/* Center Content - Hero style */}
                <Box
                    textAlign="center"
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "40px 20px",
                        "@media (max-width: 690px)": { padding: "30px 20px" },
                        "@media (max-width: 450px)": { padding: "20px 10px" },
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            backgroundColor: "var(--weblight)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 4,
                            "@media (max-width: 768px)": { width: 80, height: 80, mb: 3 },
                        }}
                    >
                        {isOfflineType ? (
                            <WifiOffIcon
                                sx={{
                                    fontSize: 48,
                                    color: "var(--webprimary)",
                                    "@media (max-width: 768px)": { fontSize: 40 },
                                }}
                            />
                        ) : (
                            <SignalWifiStatusbarConnectedNoInternet4Icon
                                sx={{
                                    fontSize: 48,
                                    color: "var(--webprimary)",
                                    "@media (max-width: 768px)": { fontSize: 40 },
                                }}
                            />
                        )}
                    </Box>

                    {/* Title - Hero style */}
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                            fontFamily: "Bold_W",
                            fontSize: 40,
                            color: "var(--title)",
                            "@media (max-width: 768px)": { fontSize: "30px" },
                            "@media (max-width: 690px)": { fontSize: "26px" },
                            "@media (max-width: 450px)": { fontSize: "24px" },
                        }}
                    >
                        {displayTitle}
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "Regular_W",
                            fontSize: "16px",
                            maxWidth: 500,
                            color: "#666",
                            mb: 4,
                            "@media (max-width: 768px)": { fontSize: "14px" },
                        }}
                    >
                        {displayMessage}
                    </Typography>

                    {/* Status Indicator */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 3,
                            padding: "8px 16px",
                            borderRadius: "20px",
                            backgroundColor: isOnline ? "#ecfdf3" : "#fef3f2",
                            border: `1px solid ${isOnline ? "#abefc6" : "#fecdca"}`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: isOnline ? "#067647" : "#b42318",
                            }}
                        />
                        <Typography
                            sx={{
                                fontFamily: "Medium_W",
                                fontSize: "13px",
                                color: isOnline ? "#067647" : "#b42318",
                            }}
                        >
                            {isOnline ? "Back Online!" : "No Connection"}
                        </Typography>
                    </Box>

                    {/* Buttons - Hero style */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                            "@media (max-width: 450px)": { gap: "8px" },
                        }}
                    >
                        <Button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            startIcon={
                                <RefreshIcon
                                    sx={{
                                        animation: isRetrying ? "spin 1s linear infinite" : "none",
                                        "@keyframes spin": {
                                            from: { transform: "rotate(0deg)" },
                                            to: { transform: "rotate(360deg)" },
                                        },
                                    }}
                                />
                            }
                            sx={{
                                border: "solid 1px var(--webprimary)",
                                backgroundColor: "var(--webprimary)",
                                color: "var(--white)",
                                width: "fit-content",
                                textTransform: "capitalize",
                                padding: "10px 24px",
                                fontFamily: "Medium_W",
                                fontSize: "14px",
                                minHeight: "44px",
                                "&:hover": {
                                    backgroundColor: "transparent",
                                    color: "var(--webprimary)",
                                },
                                "&:disabled": {
                                    backgroundColor: "#ccc",
                                    borderColor: "#ccc",
                                    color: "#fff",
                                },
                                "@media (max-width: 450px)": {
                                    padding: "8px 20px",
                                    fontSize: "13px",
                                    minHeight: "40px",
                                },
                            }}
                        >
                            {isRetrying ? "Checking..." : "Try Again"}
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            startIcon={<HomeIcon />}
                            sx={{
                                border: "solid 1px var(--webprimary)",
                                backgroundColor: "transparent",
                                color: "var(--webprimary)",
                                width: "fit-content",
                                textTransform: "capitalize",
                                padding: "10px 24px",
                                fontFamily: "Medium_W",
                                fontSize: "14px",
                                minHeight: "44px",
                                "&:hover": {
                                    backgroundColor: "var(--webprimary)",
                                    color: "var(--white)",
                                },
                                "@media (max-width: 450px)": {
                                    padding: "8px 20px",
                                    fontSize: "13px",
                                    minHeight: "40px",
                                },
                            }}
                        >
                            Go to Home
                        </Button>
                    </Box>

                    {/* Tips Section */}
                    <Box sx={{ mt: 5, maxWidth: 450 }}>
                        <Typography
                            sx={{
                                fontFamily: "Medium_W",
                                fontSize: "14px",
                                color: "#666",
                                mb: 2,
                            }}
                        >
                            Things you can try:
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1.5,
                                justifyContent: "center",
                            }}
                        >
                            {[
                                "Check your WiFi connection",
                                "Restart your router",
                                "Try mobile data",
                                "Wait and try again",
                            ].map((tip, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        backgroundColor: "var(--weblight)",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        fontFamily: "Regular_W",
                                        color: "var(--websecondary)",
                                        "@media (max-width: 450px)": {
                                            fontSize: "12px",
                                            px: 1.5,
                                            py: 0.75,
                                        },
                                    }}
                                >
                                    {tip}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        textAlign: "center",
                        padding: "20px",
                        borderTop: "1px solid #eee",
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "Regular_W",
                            fontSize: "13px",
                            color: "#999",
                        }}
                    >
                        © {new Date().getFullYear()} SkillUp Tech Solutions. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default OfflinePage;
