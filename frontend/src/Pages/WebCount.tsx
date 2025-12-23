import { Box, Typography } from "@mui/material";
import CountUp from "react-countup";

// Numeric values extracted separately for animation
const stats = [
  { label: "Projects", value: 200 },
  { label: "Placed Students", value: 80 },
  { label: "Experience", value: 3, suffix: "+ Years" },
  { label: "Happy Clients", value: 99 },
];

const WebCount = () => {
  return (
    <Box
      sx={{
        backgroundColor: "var(--weblight)",
        borderRadius: "8px",
        px: 4,
        py: 3,
        marginTop: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
      }}
    >
      {stats.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            px: 2,
            textAlign: "center",
            borderRight: index !== stats.length - 1 ? "1px solid #eee" : "none",
            minWidth: 100,
            "@media (max-width: 690px)": { flexBasis: "48%" },
            "@media (max-width: 550px)": { flexBasis: "100%" },
          }}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--webprimary)",
              fontFamily: "SemiBold_W",
            }}
          >
            {item.label === "Happy Clients" ? (
              <>
                <CountUp
                  end={item.value}
                  duration={2}
                  suffix={item.suffix || "%"}
                />
              </>
            ) : (
              <CountUp
                end={item.value}
                duration={2}
                suffix={item.suffix || "+"}
              />
            )}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#333",
              fontFamily: "Regular_W",
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default WebCount;
