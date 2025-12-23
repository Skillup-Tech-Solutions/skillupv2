import { Box, Typography } from "@mui/material";
import { useGetOffers } from "../Hooks/offer";

const WebOffer = () => {
  const { data: getUsersResponse } = useGetOffers();
  const offers:any = getUsersResponse
  return (
    <>
      {offers && offers[0]?.status === "active" && (
        <Box
          sx={{
            background: "var(--webprimary)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "var(--white)",
              fontFamily: "Regular_W",
              fontSize: "14px",
              textAlign: "center",
              "@media (max-width: 450px)": { fontSize: "12px" },
            }}
          >
            {offers[0].description}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default WebOffer;
