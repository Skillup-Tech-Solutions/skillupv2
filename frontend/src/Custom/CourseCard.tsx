import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";

interface CourseCardProps {
  id: number;
  thumbnail: string;
  courseName: string;
  description: string;
  prize: number;
  duration: string;
  discount?: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
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
  const truncateDescription = (text: string, maxLength: number = 20) => {
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
        maxWidth: 345,
        // flexBasis:"30%",
        width: "100%",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
        "@media (max-width: 600px)": {
          maxWidth: "100%",
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={thumbnail}
        alt={courseName}
        sx={{
          objectFit: "cover",
          "@media (max-width: 600px)": {
            height: "180px",
          },
        }}
      />
      <CardContent
        sx={{
          padding: "16px",
          "&:last-child": {
            paddingBottom: "16px",
          },
        }}
      >
        {/* Course Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "var(--title)",
            fontFamily: "Medium_M",
            "@media (max-width: 600px)": {
              fontSize: "14px",
            },
          }}
        >
          {courseName}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: "var(--greyText)",
            marginBottom: "12px",
            fontSize: "12px",
            lineHeight: "1.4",
            fontFamily: "Regular_M",
            "@media (max-width: 600px)": {
              fontSize: "11px",
            },
          }}
        >
          {truncateDescription(description)}
        </Typography>

        {/* Duration */}
        <Typography
          variant="body2"
          sx={{
            color: "var(--greyText)",
            marginBottom: "12px",
            fontSize: "12px",
            fontFamily: "Regular_M",
            "@media (max-width: 600px)": {
              fontSize: "11px",
            },
          }}
        >
          Duration: {duration}
        </Typography>

        {/* Price Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {discount && discount > 0 ? (
            <>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--primary)",
                  fontFamily: "Medium_M",
                  "@media (max-width: 600px)": {
                    fontSize: "14px",
                  },
                }}
              >
                ₹{calculateDiscountedPrice().toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  color: "var(--greyText)",
                  textDecoration: "line-through",
                  fontFamily: "Regular_M",
                  "@media (max-width: 600px)": {
                    fontSize: "11px",
                  },
                }}
              >
                ₹{prize.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "10px",
                  color: "var(--primary)",
                  backgroundColor: "rgba(24, 34, 48, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontFamily: "Medium_M",
                  "@media (max-width: 600px)": {
                    fontSize: "9px",
                  },
                }}
              >
                {discount}% OFF
              </Typography>
            </>
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--primary)",
                fontFamily: "Medium_M",
                "@media (max-width: 600px)": {
                  fontSize: "14px",
                },
              }}
            >
              ₹{prize.toFixed(2)}
            </Typography>
          )}
        </Box>


        {/* Footer Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Status Toggle */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={status === "Active"}
                onChange={() => onToggleStatus(id)}
                color="success"
              />
            }
            label={
              <Typography sx={{ fontSize: "12px", fontFamily: "Regular_M", color: "var(--greyText)" }}>
                {status === "Active" ? "Active" : "Inactive"}
              </Typography>
            }
          />

          {/* Edit/Delete Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: "8px",
            }}
          >
            <IconButton
              onClick={() => onEdit(id)}
              sx={{
                color: "var(--primary)",
                backgroundColor: "rgba(24, 34, 48, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(24, 34, 48, 0.2)",
                },
                "& svg": {
                  fontSize: "18px",
                },
                "@media (max-width: 600px)": {
                  "& svg": {
                    fontSize: "16px",
                  },
                },
              }}
            >
              <MdEdit />
            </IconButton>
            <IconButton
              onClick={() => onDelete(id)}
              sx={{
                color: "#f44336",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                },
                "& svg": {
                  fontSize: "18px",
                },
                "@media (max-width: 600px)": {
                  "& svg": {
                    fontSize: "16px",
                  },
                },
              }}
            >
              <MdDelete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
