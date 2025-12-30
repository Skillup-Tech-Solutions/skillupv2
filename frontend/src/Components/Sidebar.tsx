import {
  Box,
  Tooltip,
  Dialog,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import { images } from "../assets/Images/Images";
import {
  Gauge,
  Users,
  GraduationCap,
  Books,
  FolderSimple,
  Tag,
  Percent,
  Briefcase,
  Certificate,
  Megaphone,
  CurrencyDollar,
  Gear,
  SignOut,
} from "@phosphor-icons/react";

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

  const isActive = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));
  const isExactActive = (path: string) => location.pathname === path;

  const menuItems = role === "admin" ? [
    { paths: ["/dashboard"], label: "Dashboard", icon: Gauge },
    { paths: ["/users"], label: "People", icon: Users },
    { paths: ["/courses", "/internships", "/projects"], label: "Programs", icon: GraduationCap },
    { paths: ["/syllabus"], label: "Syllabus", icon: Books },
    { paths: ["/category"], label: "Category", icon: Tag },
    { paths: ["/offers"], label: "Offers", icon: Percent },
    { paths: ["/admincareers"], label: "Careers", icon: Briefcase },
    { paths: ["/certificate"], label: "Certificates", icon: Certificate },
    { paths: ["/announcements"], label: "Announcements", icon: Megaphone },
    { paths: ["/payroll"], label: "Payroll", icon: CurrencyDollar },
    { paths: ["/payment/settings"], label: "Payment Settings", icon: Gear },
    { paths: ["/payment-management"], label: "Payments", icon: CurrencyDollar },
  ] : [
    { paths: ["/employee/portal"], label: "My Payslips", icon: CurrencyDollar },
  ];

  // Collapsed = narrow sidebar, Expanded = wide sidebar
  const isCollapsed = !isOpen && !isMobile;
  const showLabels = isOpen || isMobile;

  return (
    <>
      <Box
        sx={{
          // bg-slate-900 border-r border-slate-800
          bgcolor: "#0f172a", // slate-900
          borderRight: "1px solid #1e293b", // slate-800
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          transition: "all 0.2s ease",
          zIndex: 50,
        }}
      >
        {/* Header - p-4 border-b border-slate-800 */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: 1.5,
          }}
        >
          <Box
            component="img"
            src={images.logo}
            sx={{ width: 32, height: 32, flexShrink: 0 }}
          />
          {showLabels && (
            <Box sx={{ overflow: "hidden" }}>
              {/* font-chivo font-bold text-sm uppercase tracking-wider */}
              <Box
                component="h1"
                sx={{
                  fontFamily: "'Chivo', sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  color: "#f8fafc",
                  m: 0,
                }}
              >
                Skill Up
              </Box>
              {/* text-xs text-slate-500 font-mono */}
              <Box
                sx={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                }}
              >
                {role || "ADMIN"}
              </Box>
            </Box>
          )}
        </Box>

        {/* Navigation - flex-1 p-2 overflow-y-auto */}
        <Box
          component="nav"
          sx={{
            flex: 1,
            p: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0.5 }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.paths);
              return (
                <Box component="li" key={item.paths[0]}>
                  <Tooltip title={isCollapsed ? item.label : ""} placement="right" arrow>
                    <Box
                      onClick={() => navigate(item.paths[0])}
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: "2px", // rounded-sm
                        transition: "all 0.15s ease",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        // Active: text-blue-400 bg-blue-950/50 border-l-2 border-blue-400
                        // Inactive: text-slate-400 hover:text-slate-100 hover:bg-slate-800
                        ...(active
                          ? {
                            color: "#60a5fa", // blue-400
                            bgcolor: "rgba(23, 37, 84, 0.5)", // blue-950/50
                            borderLeft: "2px solid #60a5fa",
                          }
                          : {
                            color: "#94a3b8", // slate-400
                            "&:hover": {
                              color: "#f1f5f9", // slate-100
                              bgcolor: "#1e293b", // slate-800
                            },
                          }),
                      }}
                    >
                      <Icon size={20} weight="duotone" style={{ flexShrink: 0 }} />
                      {showLabels && (
                        <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.label}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* User Info + Logout - p-2 border-t border-slate-800 */}
        <Box sx={{ p: 1, borderTop: "1px solid #1e293b" }}>
          {/* User Info */}
          {showLabels && (
            <Box sx={{ px: 1.5, py: 1, mb: 0.5 }}>
              <Box sx={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>
                {username || "Admin"}
              </Box>
              <Box sx={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                {role || "admin"}
              </Box>
            </Box>
          )}
          <Tooltip title={isCollapsed ? "Sign Out" : ""} placement="right" arrow>
            <Box
              onClick={HandleLogoutClick}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                borderRadius: "2px",
                transition: "all 0.15s ease",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                justifyContent: isCollapsed ? "center" : "flex-start",
                color: "#f87171", // red-400
                "&:hover": {
                  color: "#fca5a5", // red-300
                  bgcolor: "#1e293b",
                },
              }}
            >
              <SignOut size={20} style={{ flexShrink: 0 }} />
              {showLabels && "Sign Out"}
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Logout Modal */}
      <Dialog
        open={logoutModalOpen}
        onClose={HandleLogoutCancel}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "#1e293b",
            border: "1px solid rgba(71, 85, 105, 0.5)",
            borderRadius: "6px",
            p: 2,
          },
          "& .MuiBackdrop-root": {
            bgcolor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <SignOut size={48} weight="duotone" style={{ color: "#f87171", marginBottom: 16 }} />
          <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>
            Sign Out?
          </Box>
          <Box sx={{ fontSize: "14px", color: "#94a3b8", mb: 2 }}>
            Are you sure you want to sign out of your account?
          </Box>
        </Box>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={HandleLogoutCancel}
            sx={{
              bgcolor: "#334155",
              color: "#f8fafc",
              px: 3,
              py: 1,
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "uppercase",
              "&:hover": { bgcolor: "#475569" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={HandleLogoutConfirm}
            sx={{
              bgcolor: "#ef4444",
              color: "#fff",
              px: 3,
              py: 1,
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "uppercase",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
