import { Box, Typography } from "@mui/material";
import CountUp from "react-countup";

// Numeric values extracted separately for animation
const stats = [
  { label: "Software Projects", value: 200 },
  { label: "Clients Served", value: 80 },
  { label: "Experience", value: 3, suffix: "+ Years" },
  { label: "Success Rate", value: 99 },
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
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 2,
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
        "@media (max-width: 768px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 3,
          px: 3,
        },
        "@media (max-width: 450px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
          px: 2,
          py: 2.5,
        },
        "@media (max-width: 320px)": {
          gridTemplateColumns: "1fr",
          gap: 2,
        },
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
            py: 1,
            textAlign: "center",
            borderRight: {
              xs: "none",
              md: index !== stats.length - 1 ? "1px solid #eee" : "none",
            },
            "@media (max-width: 768px)": {
              borderRight: "none",
              py: 1.5,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--webprimary)",
              fontFamily: "SemiBold_W",
              "@media (max-width: 450px)": { fontSize: "18px" },
              "@media (max-width: 320px)": { fontSize: "16px" },
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
              "@media (max-width: 450px)": { fontSize: "12px" },
              "@media (max-width: 320px)": { fontSize: "11px" },
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
