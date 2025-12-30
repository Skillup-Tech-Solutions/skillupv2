import { Box } from "@mui/material";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

interface DataCardProps {
    title: string;
    value: string | number;
    icon?: PhosphorIcon;
    className?: string;
}

const DataCard = ({ title, value, icon: Icon, className = "" }: DataCardProps) => {
    return (
        <Box
            className={className}
            sx={{
                // Exact frontend-ref styling: bg-slate-800/40 border border-slate-700/60 rounded-sm
                bgcolor: "rgba(30, 41, 59, 0.4)", // slate-800/40
                border: "1px solid rgba(71, 85, 105, 0.6)", // slate-700/60
                borderRadius: "5px",
                p: { xs: "16px", sm: "24px" },
                transition: "all 0.2s",
                "&:hover": {
                    borderColor: "#64748b", // slate-500
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box>
                    {/* text-slate-500 text-xs uppercase tracking-wider font-mono mb-2 */}
                    <Box
                        sx={{
                            color: "#64748b", // slate-500
                            fontSize: "12px", // text-xs
                            textTransform: "uppercase",
                            letterSpacing: "0.05em", // tracking-wider
                            fontFamily: "'JetBrains Mono', monospace",
                            mb: "8px", // mb-2
                        }}
                    >
                        {title}
                    </Box>
                    {/* text-3xl font-bold font-mono text-slate-100 */}
                    <Box
                        sx={{
                            fontSize: "30px", // text-3xl = 1.875rem
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#f1f5f9", // slate-100
                        }}
                    >
                        {value}
                    </Box>
                </Box>
                {Icon && (
                    <Box sx={{ color: "#60a5fa" }}> {/* blue-400 */}
                        <Icon size={28} weight="duotone" />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default DataCard;
