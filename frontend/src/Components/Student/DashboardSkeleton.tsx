import { Box, Paper, Skeleton } from "@mui/material";

const DashboardSkeleton = () => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Header Skeleton */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                    <Skeleton variant="text" width={150} height={20} sx={{ mt: 1, bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                </Box>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: "6px", bgcolor: "rgba(255, 255, 255, 0.05)" }} />
            </Box>

            {/* Stats Grid Skeleton */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" },
                    gap: { xs: 1, sm: 2 },
                }}
            >
                {[1, 2, 3, 4].map((i) => (
                    <Paper
                        key={i}
                        sx={{
                            p: 2,
                            bgcolor: "rgba(30, 41, 59, 0.4)",
                            border: "1px solid rgba(71, 85, 105, 0.4)",
                            borderRadius: "6px",
                        }}
                    >
                        <Skeleton variant="circular" width={24} height={24} sx={{ mb: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
                        <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                        <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1, bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                    </Paper>
                ))}
            </Box>

            {/* Two Column Layout Skeleton */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                    gap: 3,
                }}
            >
                {/* Live Sessions Skeleton */}
                <Paper
                    sx={{
                        p: 3,
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "6px",
                    }}
                >
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 3, bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                    {[1, 2].map((i) => (
                        <Box key={i} sx={{ mb: 2, display: "flex", gap: 2 }}>
                            <Skeleton variant="rectangular" width={80} height={60} sx={{ borderRadius: "4px", bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="80%" sx={{ bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                                <Skeleton variant="text" width="40%" sx={{ bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* Announcements Skeleton */}
                <Paper
                    sx={{
                        p: 3,
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(71, 85, 105, 0.6)",
                        borderRadius: "6px",
                    }}
                >
                    <Skeleton variant="text" width={180} height={24} sx={{ mb: 3, bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: "6px", bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                    ))}
                </Paper>
            </Box>

            {/* Quick Actions Skeleton */}
            <Paper
                sx={{
                    p: 3,
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    borderRadius: "6px",
                }}
            >
                <Skeleton variant="rectangular" width={100} height={24} sx={{ mb: 3, borderRadius: "4px", bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                        gap: 2,
                    }}
                >
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: "6px", bgcolor: "rgba(255, 255, 255, 0.05)" }} />
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default DashboardSkeleton;
