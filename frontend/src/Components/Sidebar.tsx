import {
  Box,
  Typography,
  Dialog,
  Button,
  Tooltip,
} from "@mui/material";
import { cancelButtonStyle, dangerButtonStyle } from "../assets/Styles/ButtonStyles";
import {
  LogoutBox,
  SidebarBottom,
  SidebarBottomLeft,
  SidebarBox,
  SidebarBoxOne,
  SidebarBoxTwo,
  SidebarLinks,
} from "../assets/Styles/SidebarStyle";
import { images } from "../assets/Images/Images";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import Cookies from "js-cookie";
import { FaUsers } from "react-icons/fa";
import { TbLayoutDashboard } from "react-icons/tb";
import { FiBook } from "react-icons/fi";

import { MdOutlineCategory, MdOutlineLocalOffer, MdOutlineAnnouncement, MdAttachMoney, MdSchool } from "react-icons/md";
import {
  CarreerRoutes,
  CategoryRoutes,
  CertificateRoutes,

  DashboardRoutes,
  OffersRoutes,
  SyllabusRoutes,
  UsersRoutes,
} from "./RoutesActive";
import { ProgramsRoutes, PayrollRoutes } from "./RoutesActive";
import { GrUserWorker } from "react-icons/gr";
import { PiCertificate } from "react-icons/pi";
interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
}

const Sidebar = ({ isOpen, isMobile }: SidebarProps) => {
  const username = Cookies.get("name");
  const role = Cookies.get("role");
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const displayUsername =
    username && username.length > 10
      ? `${username.substring(0, 10)}...`
      : username;
  const displayrole =
    role && role.length > 10 ? `${role.substring(0, 10)}...` : role;

  const HandleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const HandleLogoutConfirm = () => {
    Cookies.remove("name");
    Cookies.remove("role");
    Cookies.remove("skToken");
    Cookies.remove("email");
    setLogoutModalOpen(false);
    navigate("/");
  };

  const HandleLogoutCancel = () => {
    setLogoutModalOpen(false);
  };
  return (
    <>
      <Box
        sx={{
          ...SidebarBox,
          // On mobile, always show content when sidebar is rendered
          // On desktop, use opacity/visibility transitions
          ...(isMobile
            ? {
              opacity: 1,
              visibility: "visible",
            }
            : {
              opacity: isOpen ? 1 : 0,
              visibility: isOpen ? "visible" : "hidden",
              transition:
                "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
            }),
        }}
      >
        <Box>
          <Box sx={{ ...SidebarBoxOne }}>
            <Box component={"img"} src={images.logo} />
          </Box>
          <Box sx={{ ...SidebarBoxTwo }}>
            {(isOpen || isMobile) && (
              <Typography variant="h4">Main Menu</Typography>
            )}
            <Box sx={{ ...SidebarLinks }}>
              {role === "admin" && (
                <>
                  <Link to={"/dashboard"}>
                    <Box sx={{
                      backgroundColor: DashboardRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: DashboardRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <TbLayoutDashboard />
                      {(isOpen || isMobile) && "Dashboard"}
                    </Box>
                  </Link>
                  <Link to={"/users"}>
                    <Box sx={{
                      backgroundColor: UsersRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: UsersRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <FaUsers />
                      {(isOpen || isMobile) && "People Management"}
                    </Box>
                  </Link>
                  <Link to={"/courses"}>
                    <Box sx={{
                      backgroundColor: ProgramsRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: ProgramsRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <MdSchool />
                      {(isOpen || isMobile) && "Program Management"}
                    </Box>
                  </Link>
                  <Link to={"/syllabus"}>
                    <Box sx={{
                      backgroundColor: SyllabusRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: SyllabusRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <FiBook />
                      {(isOpen || isMobile) && "Syllabus"}
                    </Box>
                  </Link>
                  <Link to={"/category"}>
                    <Box sx={{
                      backgroundColor: CategoryRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: CategoryRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <MdOutlineCategory />
                      {(isOpen || isMobile) && "Category"}
                    </Box>
                  </Link>
                  <Link to={"/offers"}>
                    <Box sx={{
                      backgroundColor: OffersRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: OffersRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <MdOutlineLocalOffer />
                      {(isOpen || isMobile) && "Offers"}
                    </Box>
                  </Link>
                  <Link to={"/admincareers"}>
                    <Box sx={{
                      backgroundColor: CarreerRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: CarreerRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <GrUserWorker />
                      {(isOpen || isMobile) && "Careers"}
                    </Box>
                  </Link>
                  <Link to={"/certificate"}>
                    <Box sx={{
                      backgroundColor: CertificateRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: CertificateRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <PiCertificate />
                      {(isOpen || isMobile) && "Certificate"}
                    </Box>
                  </Link>
                  <Link to={"/announcements"}>
                    <Box sx={{
                      backgroundColor: location.pathname === "/announcements" ? "var(--buttonPrimary)" : "transparent",
                      color: location.pathname === "/announcements" ? "var(--white)" : "inherit",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}>
                      <MdOutlineAnnouncement />
                      {(isOpen || isMobile) && "Announcements"}
                    </Box>
                  </Link>



                  <Link to={"/payroll/generate"}>
                    <Box sx={{
                      backgroundColor: PayrollRoutes.includes(location.pathname) ? "var(--buttonPrimary)" : "transparent",
                      color: PayrollRoutes.includes(location.pathname) ? "var(--white)" : "inherit",
                      transition: "all 0.3s ease"
                    }}>
                      <MdAttachMoney />
                      {(isOpen || isMobile) && "Payroll Management"}
                    </Box>
                  </Link>

                  <Link to={"/payment/settings"}>
                    <Box sx={{
                      backgroundColor: location.pathname.includes("/payment/settings") ? "var(--buttonPrimary)" : "transparent",
                      color: location.pathname.includes("/payment/settings") ? "var(--white)" : "inherit",
                      transition: "all 0.3s ease"
                    }}>
                      <MdAttachMoney />
                      {(isOpen || isMobile) && "Payment Settings"}
                    </Box>
                  </Link>

                  <Link to={"/payment-management"}>
                    <Box sx={{
                      backgroundColor: location.pathname === "/payment-management" ? "var(--buttonPrimary)" : "transparent",
                      color: location.pathname === "/payment-management" ? "var(--white)" : "inherit",
                      transition: "all 0.3s ease"
                    }}>
                      <MdAttachMoney />
                      {(isOpen || isMobile) && "Payment Management"}
                    </Box>
                  </Link>


                </>
              )}

              {role === "employee" && (
                <Link to={"/employee/portal"}>
                  <Box sx={{
                    backgroundColor: location.pathname.includes("/employee/portal") ? "var(--buttonPrimary)" : "transparent",
                    color: location.pathname.includes("/employee/portal") ? "var(--white)" : "inherit",
                    transition: "all 0.3s ease"
                  }}>
                    <MdAttachMoney />
                    {(isOpen || isMobile) && "My Payslips"}
                  </Box>
                </Link>
              )}
            </Box>
            {/* <Box sx={{ ...SidebarBoxThree }}>
            {(isOpen || isMobile) && (
              <Typography variant="h4">Advance Menu</Typography>
            )}
            <Box sx={{ ...SidebarLinks }}>
              <Link to={"/"}>
                <Box>
                  <PiCertificateLight />
                  {(isOpen || isMobile) && "Certificate"}
                </Box>
              </Link>
              <Link to={"/"}>
                <Box>
                  <GoMail />
                  {(isOpen || isMobile) && "Mail"}
                </Box>
              </Link>
            </Box>
          </Box> */}
          </Box>
        </Box>
        <Box sx={{ ...SidebarBottom }}>
          <Box sx={{ ...SidebarBottomLeft }}>
            <Box
              sx={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                backgroundColor: "var(--buttonPrimary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--white)",
                fontFamily: "Medium_M",
                fontSize: "16px",
              }}
            >
              {(displayUsername || "User").charAt(0).toUpperCase()}
            </Box>
            {(isOpen || isMobile) && (
              <Box>
                <Typography variant="h2">
                  {displayUsername || "User"}
                </Typography>
                <Typography variant="h3">
                  <Tooltip title={role}>
                    <span>{displayrole || "role"}</span>
                  </Tooltip>
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ ...LogoutBox }} onClick={HandleLogoutClick}>
            <HiOutlineLogout />
          </Box>
        </Box>
      </Box>

      {/* Logout Confirmation Modal */}
      <Dialog
        open={logoutModalOpen}
        onClose={HandleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "24px",
            padding: 0,
            margin: { xs: "20px", sm: "32px" },
            maxWidth: { xs: "calc(100vw - 40px)", sm: "450px" },
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            background:
              "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444, #f59e0b)",
            },
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(12px)",
          },
        }}
        TransitionProps={{
          timeout: 500,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            padding: { xs: "32px 24px", sm: "40px 32px" },
            background: "transparent",
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2)",
            }}
          >
            <HiOutlineLogout
              style={{
                fontSize: "32px",
                color: "#ef4444",
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            id="logout-dialog-title"
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "18px", sm: "20px" },
              color: "#1e293b",
              marginBottom: "12px",
              background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Confirm Logout
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              fontSize: { xs: "12px", sm: "14px" },
              lineHeight: 1.6,
              fontWeight: 400,
              marginBottom: "32px",
              maxWidth: "300px",
              margin: "0 auto 32px",
            }}
          >
            Are you sure you want to sign out of your account? You'll need to
            sign in again to access your dashboard.
          </Typography>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: "12px", sm: "16px" },
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
            }}
          >
            <Button
              onClick={HandleLogoutCancel}
              variant="outlined"
              sx={{ ...cancelButtonStyle, minWidth: { xs: "100%", sm: "120px" }, height: "max-content", borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              onClick={HandleLogoutConfirm}
              variant="contained"
              sx={{ ...dangerButtonStyle, minWidth: { xs: "100%", sm: "120px" }, height: "max-content", borderRadius: "8px" }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
export default Sidebar;
