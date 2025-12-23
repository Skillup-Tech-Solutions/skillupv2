import { Box } from "@mui/material"
import WebHero from "../Pages/WebHero"
import WebCarousel from "../Pages/WebCarousel"
import WebServices from "../Pages/WebServices"
import WebCourses from "../Pages/WebCourses"
import WebTesti from "../Pages/WebTesti"
import WebContact from "../Pages/WebContact"
import WebCount from "../Pages/WebCount"
import WebCategory from "../Pages/WebCategory"

const WebHome = () => {
    return (
        <Box>
            <WebHero />
            <WebCarousel />
            <WebCount />
            <WebServices />
            <WebCourses />
            <WebCategory />
            <WebTesti />
            <WebContact />
        </Box>
    )
}
export default WebHome