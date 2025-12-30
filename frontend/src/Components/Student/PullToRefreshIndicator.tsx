import { Box, Typography } from "@mui/material";
import { ArrowDown, ArrowsClockwise } from "@phosphor-icons/react";

interface PullToRefreshIndicatorProps {
    pullDistance: number;
    isRefreshing: boolean;
    threshold: number;
}

const PullToRefreshIndicator = ({ pullDistance, isRefreshing, threshold }: PullToRefreshIndicatorProps) => {
    if (pullDistance <= 0 && !isRefreshing) return null;

    const opacity = Math.min(pullDistance / threshold, 1);
    const rotation = Math.min((pullDistance / threshold) * 180, 180);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: isRefreshing ? 80 : Math.max(0, pullDistance),
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: isRefreshing ? 1 : opacity,
                transition: isRefreshing ? 'top 0.3s ease' : 'none',
                pointerEvents: 'none',
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'rgba(30, 41, 59, 0.9)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(71, 85, 105, 0.6)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                }}
            >
                {isRefreshing ? (
                    <ArrowsClockwise
                        size={24}
                        weight="bold"
                        style={{
                            color: '#3b82f6',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                ) : (
                    <ArrowDown
                        size={24}
                        weight="bold"
                        style={{
                            color: pullDistance >= threshold ? '#3b82f6' : '#94a3b8',
                            transform: `rotate(${rotation}deg)`,
                            transition: 'color 0.2s, transform 0.1s',
                        }}
                    />
                )}
            </Box>
            {!isRefreshing && pullDistance > 20 && (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 1,
                        color: '#94a3b8',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                >
                    {pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
                </Typography>
            )}

            <style>
                {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
            </style>
        </Box>
    );
};

export default PullToRefreshIndicator;
