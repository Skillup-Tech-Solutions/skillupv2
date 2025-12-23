import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import { HeaderStyle } from "../assets/Styles/HeaderStyle";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineMenuAlt2, HiOutlineMenuAlt3 } from "react-icons/hi";
import Cookies from "js-cookie";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { IoClose, IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import CustomInput from "../Custom/CustomInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema } from "../assets/Validation/Schema";
import { marginBottom10 } from "../assets/Styles/LoginStyle";
import CustomButton from "../Custom/CustomButton";
import { useChangePasswordApi } from "../Hooks/user";
import CustomSnackBar from "../Custom/CustomSnackBar";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  outline: "none",
  borderRadius: "5px",
  boxShadow: 24,
  padding: "10px 20px",
  "@media (max-width: 600px)": {
    width: "90vw",
    margin: "auto",
  },
};

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  isMobile?: boolean;
}

const Header = ({ onToggleSidebar, sidebarOpen, isMobile }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [visibilityOne, setVisibilityOne] = useState(false);
  const [visibilityTwo, setVisibilityTwo] = useState(false);
  const { mutate: changePasswordApi } = useChangePasswordApi();
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset();
    setVisibility(false);
    setVisibilityOne(false);
    setVisibilityTwo(false);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ChangePasswordSchema),
  });
  const username = Cookies.get("name");
  const email = Cookies.get("email");
  const displayUsername =
    username && username.length > 10
      ? `${username.substring(0, 10)}...`
      : username;
  const onsubmit = (data: any) => {
    console.log("Password change data:", data);
    changePasswordApi(
      {
        email: email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Password Changed Successfully");
          handleClose();
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message);
        },
      }
    );
  };
  return (
    <>
      <Box sx={{ ...HeaderStyle }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}>
            <IconButton
              onClick={onToggleSidebar}
              sx={{
                "&:hover": {
                  backgroundColor: "var(--buttonPrimary)",
                  "& svg": {
                    color: "var(--white)",
                  },
                },
              }}
            >
              {sidebarOpen ? (
                <HiOutlineMenuAlt3 size={18} />
              ) : (
                <HiOutlineMenuAlt2 size={18} />
              )}
            </IconButton>
          </Tooltip>
          <Typography variant="h4" sx={{"@media (max-width: 600px)": { display: "none" }}}>
            Welcome Back , {displayUsername || "Admin"}
          </Typography>
        </Box>
        {/* <Box>
          <Tooltip title="Change Password">
            <IconButton
              sx={{ color: "var(--textPrimary)" }}
              onClick={handleOpen}
            >
              <FaRegUserCircle />
            </IconButton>
          </Tooltip>
        </Box> */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {/* Header  */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "8px",
                borderBottom: "0.4px solid var(--greyText)",
              }}
            >
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                sx={{ fontSize: "14px", fontFamily: "Medium_M" }}
              >
                Change Password
              </Typography>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={handleClose}
                sx={{
                  "& svg": {
                    fontSize: "18px",
                  },
                }}
              >
                <IoClose className="close-icon" />
              </IconButton>
            </Box>
            {/* Body */}
            <Box
              component={"form"}
              sx={{ marginTop: "12px", maxHeight: "50vh", overflowY: "auto" }}
              onSubmit={handleSubmit(onsubmit)}
            >
              <CustomInput
                name="currentPassword"
                placeholder="Enter your current password"
                label="Current Password"
                type={visibility ? "text" : "password"}
                bgmode="dark"
                boxSx={{ ...marginBottom10 }}
                icon={
                  visibility ? (
                    <IoEyeOutline onClick={() => setVisibility(!visibility)} />
                  ) : (
                    <IoEyeOffOutline
                      onClick={() => setVisibility(!visibility)}
                    />
                  )
                }
                required={false}
                register={register}
                errors={errors}
              />
              <CustomInput
                name="newPassword"
                placeholder="Enter your new password"
                label="New Password"
                type={visibilityOne ? "text" : "password"}
                bgmode="dark"
                boxSx={{ ...marginBottom10 }}
                icon={
                  visibilityOne ? (
                    <IoEyeOutline
                      onClick={() => setVisibilityOne(!visibilityOne)}
                    />
                  ) : (
                    <IoEyeOffOutline
                      onClick={() => setVisibilityOne(!visibilityOne)}
                    />
                  )
                }
                required={false}
                register={register}
                errors={errors}
              />
              <CustomInput
                name="confirmPassword"
                placeholder="Confirm your new password"
                label="Confirm Password"
                type={visibilityTwo ? "text" : "password"}
                bgmode="dark"
                boxSx={{ ...marginBottom10 }}
                icon={
                  visibilityTwo ? (
                    <IoEyeOutline
                      onClick={() => setVisibilityTwo(!visibilityTwo)}
                    />
                  ) : (
                    <IoEyeOffOutline
                      onClick={() => setVisibilityTwo(!visibilityTwo)}
                    />
                  )
                }
                required={false}
                register={register}
                errors={errors}
              />
            </Box>
            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "12px",
                paddingBottom: "12px",
                gap: "20px",
              }}
            >
              <CustomButton
                type="button"
                variant="contained"
                label="cancel"
                btnSx={{ background: "transparent", color: "var(--title)" }}
                onClick={handleClose}
              />
              <CustomButton
                type="submit"
                variant="contained"
                label="Change"
                btnSx={{ background: "var(--primary)", color: "var(--white)" }}
                onClick={handleSubmit(onsubmit)}
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default Header;
