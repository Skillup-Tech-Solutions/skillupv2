import { Box, Typography } from "@mui/material"
import WebContact from "./WebContact"

const WebContactUs = () => {
    return (
        <Box>
        <Box sx={{fontSize:"130px",fontFamily:'Bold_W',paddingTop:"40px",textTransform:"uppercase",background: "linear-gradient(-1deg, #fff, var(--webprimary))", "-webkit-background-clip": "text", "-webkit-text-fill-color": "transparent",opacity:"0.8",
            "@media (max-width: 991px)": {fontSize:"100px"},
            "@media (max-width: 768px)": {fontSize:"80px"},
            "@media (max-width: 650px)": {fontSize:"60px"},
            "@media (max-width: 450px)": {fontSize:"50px"},
            "@media (max-width: 380px)": {fontSize:"40px"},
            }}>
            Contact Us
        </Box>
      <WebContact />
    </Box>
    )
}

export default WebContactUs