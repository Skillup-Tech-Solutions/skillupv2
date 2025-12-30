import { Box, Skeleton, Grid, Paper } from "@mui/material";

// Shared styles for skeleton pulses
const skeletonStyles = {
    bgcolor: "rgba(30, 41, 59, 0.4)",
    borderRadius: "12px",
    "&::after": {
        background: "linear-gradient(90deg, transparent, rgba(71, 85, 105, 0.2), transparent)",
    }
};

// 1. Skeleton for Program Cards (Courses, Internships, Projects)
export const ProgramCardSkeleton = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[1, 2, 3].map((i) => (
            <Paper
                key={i}
                sx={{
                    p: 3,
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "16px",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={32} sx={skeletonStyles} />
                        <Skeleton variant="text" width="40%" height={20} sx={{ ...skeletonStyles, mt: 1 }} />
                    </Box>
                    <Skeleton variant="rectangular" width={80} height={24} sx={skeletonStyles} />
                </Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[1, 2, 3].map((j) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={j}>
                            <Skeleton variant="rectangular" height={60} sx={skeletonStyles} />
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Skeleton variant="rectangular" width={120} height={36} sx={skeletonStyles} />
                    <Skeleton variant="rectangular" width={120} height={36} sx={skeletonStyles} />
                </Box>
            </Paper>
        ))}
    </Box>
);

// 2. Skeleton for Live Sessions
export const LiveSessionSkeleton = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" width={100} height={40} sx={skeletonStyles} />
            ))}
        </Box>
        <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, md: 6 }} key={i}>
                    <Paper sx={{ p: 2, bgcolor: "rgba(30, 41, 59, 0.4)", borderRadius: "12px", border: "1px solid rgba(71, 85, 105, 0.4)" }}>
                        <Skeleton variant="rectangular" height={160} sx={{ ...skeletonStyles, mb: 2 }} />
                        <Skeleton variant="text" width="80%" height={24} sx={skeletonStyles} />
                        <Skeleton variant="text" width="50%" height={20} sx={{ ...skeletonStyles, mt: 1 }} />
                    </Paper>
                </Grid>
            ))}
        </Grid>
    </Box>
);

// 3. Skeleton for Announcements
export const AnnouncementSkeleton = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[1, 2, 3, 4].map((i) => (
            <Paper
                key={i}
                sx={{
                    p: 3,
                    bgcolor: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(71, 85, 105, 0.4)",
                    borderRadius: "12px",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Skeleton variant="text" width="40%" height={28} sx={skeletonStyles} />
                    <Skeleton variant="rectangular" width={60} height={20} sx={skeletonStyles} />
                </Box>
                <Skeleton variant="text" width="95%" sx={skeletonStyles} />
                <Skeleton variant="text" width="90%" sx={skeletonStyles} />
                <Skeleton variant="text" width="40%" sx={skeletonStyles} />
                <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(71, 85, 105, 0.2)", display: "flex", gap: 3 }}>
                    <Skeleton variant="text" width={100} sx={skeletonStyles} />
                    <Skeleton variant="text" width={100} sx={skeletonStyles} />
                </Box>
            </Paper>
        ))}
    </Box>
);

// 4. Skeleton for Profile
export const ProfileSkeleton = () => (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 4, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "16px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
                <Skeleton variant="circular" width={80} height={80} sx={skeletonStyles} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" height={32} sx={skeletonStyles} />
                    <Skeleton variant="text" width="20%" height={20} sx={skeletonStyles} />
                </Box>
            </Box>
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                        <Skeleton variant="text" width="30%" height={20} sx={{ ...skeletonStyles, mb: 1 }} />
                        <Skeleton variant="rectangular" height={50} sx={skeletonStyles} />
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Skeleton variant="rectangular" width={140} height={40} sx={skeletonStyles} />
            </Box>
        </Paper>
    </Box>
);

// 5. Skeleton for Project Submission / Generic Form
export const FormSkeleton = () => (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: 3, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "16px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Skeleton variant="circular" width={24} height={24} sx={skeletonStyles} />
                <Skeleton variant="text" width="50%" height={28} sx={skeletonStyles} />
            </Box>
            <Skeleton variant="rectangular" height={100} sx={{ ...skeletonStyles, mb: 3 }} />
            <Skeleton variant="rectangular" height={60} sx={{ ...skeletonStyles, mb: 3 }} />
            <Skeleton variant="rectangular" height={150} sx={{ ...skeletonStyles, mb: 3 }} />
            <Box sx={{ display: "flex", gap: 2 }}>
                <Skeleton variant="rectangular" width={140} height={40} sx={skeletonStyles} />
                <Skeleton variant="rectangular" width={100} height={40} sx={skeletonStyles} />
            </Box>
        </Paper>
    </Box>
);

// 6. Skeleton for Payment Page
export const PaySkeleton = () => (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Skeleton variant="rectangular" width={100} height={32} sx={{ ...skeletonStyles, mb: 3 }} />
        <Skeleton variant="text" width="60%" height={40} sx={{ ...skeletonStyles, mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ ...skeletonStyles, mb: 4 }} />
        <Skeleton variant="rectangular" height={180} sx={{ ...skeletonStyles, mb: 3 }} />
        <Paper sx={{ p: 3, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.4)", borderRadius: "16px" }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ ...skeletonStyles, mb: 3 }} />
            <Skeleton variant="rectangular" height={120} sx={{ ...skeletonStyles, mb: 3 }} />
            <Skeleton variant="rectangular" height={120} sx={skeletonStyles} />
        </Paper>
    </Box>
);
