import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import { PencilSimple, Trash, Clock, Tag, ChartLineUp } from "@phosphor-icons/react";

interface CourseCardProps {
  id: string | number;
  thumbnail: string;
  courseName: string;
  description: string;
  prize: number;
  duration: string;
  discount?: number;
  onEdit: (id: any) => void;
  onDelete: (id: any) => void;
  onToggleStatus: (id: any) => void;
  status: string;
}

const CourseCard = ({
  id,
  thumbnail,
  courseName,
  description,
  prize,
  duration,
  discount,
  onEdit,
  onDelete,
  onToggleStatus,
  status,
}: CourseCardProps) => {
  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const calculateDiscountedPrice = () => {
    if (discount && discount > 0) {
      return prize - (prize * discount) / 100;
    }
    return prize;
  };

  return (
    <Card
      sx={{
        width: "100%",
        bgcolor: "rgba(30, 41, 59, 0.4)",
        border: "1px solid rgba(71, 85, 105, 0.6)",
        borderRadius: "6px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "#3b82f6",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          "& .course-thumbnail": {
            transform: "scale(1.05)"
          }
        },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden", height: 180 }}>
        <CardMedia
          component="img"
          className="course-thumbnail"
          image={thumbnail}
          alt={courseName}
          sx={{
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />
        {discount && discount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "#ef4444",
              color: "#fff",
              px: 1,
              py: 0.5,
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)",
              zIndex: 1
            }}
          >
            {discount}% OFF
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#f8fafc",
              fontFamily: "'Chivo', sans-serif",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {courseName}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton size="small" onClick={() => onEdit(id)} sx={{ color: "#94a3b8", "&:hover": { color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
              <PencilSimple size={18} weight="duotone" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(id)} sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)" } }}>
              <Trash size={18} weight="duotone" />
            </IconButton>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#94a3b8",
            fontSize: "12px",
            lineHeight: 1.5,
            mb: 2,
            minHeight: "36px"
          }}
        >
          {truncateDescription(description)}
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
            <Clock size={16} weight="duotone" style={{ color: "#3b82f6" }} />
            <Typography variant="caption" sx={{ color: "#f1f5f9", fontWeight: 600 }}>{duration}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
            <Tag size={16} weight="duotone" style={{ color: "#22c55e" }} />
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              {discount && discount > 0 && (
                <Typography variant="caption" sx={{ color: "#64748b", textDecoration: "line-through", fontSize: "10px" }}>
                  ₹{prize}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: "#f8fafc", fontWeight: 700 }}>
                ₹{calculateDiscountedPrice().toFixed(0)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid rgba(71, 85, 105, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={status === "Active"}
                  onChange={() => onToggleStatus(id)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#22c55e" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#22c55e" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: status === "Active" ? "#4ade80" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {status}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>
          <Tooltip title="View Submissions">
            <IconButton size="small" sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", borderRadius: "4px" }}>
              <ChartLineUp size={16} weight="bold" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
