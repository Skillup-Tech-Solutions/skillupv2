import { Box, Typography } from "@mui/material";
import {
  blueStarOne,
  blueStarTwo,
  boxOne,
  boxThree,
  boxTwo,
  LoginContentOverlay,
  LoginImage,
  LoginLeft,
  loginLogo,
  LoginOverLay,
  LoginRight,
  LoginStyle,
  marginBottom10,
  microsoftBottom,
  whiteStar,
} from "../assets/Styles/LoginStyle";
import { images } from "../assets/Images/Images";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, SignupSchema } from "../assets/Validation/Schema";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { CiMail } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { successnotify } from "../Custom/Notify";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useState } from "react";
import { resetPassword } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const [visibility, setVisibility] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });
  const { mutate: resetPasswordNew } = resetPassword();

  const onsubmit = async (data: { newPassword: string }) => {
    setLoading(true);
    resetPasswordNew(
      { token: token, newPassword: data.newPassword },
      {
        onSuccess: (response: any) => {
          CustomSnackBar.successSnackbar(
            response.message || "Password Changes Successfully"
          );
          navigate("/login");
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message || "Somethimg went wrong");
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };
  return (
    <>
      <Box sx={{ ...LoginStyle }}>
        <Box sx={{ ...LoginLeft }}>
          <Box
            component={"img"}
            src={images.loginBack}
            sx={{ ...LoginImage }}
          />
          <Box
            component={"img"}
            src={images.loginOverlay}
            sx={{ ...LoginOverLay }}
          />
          <Box sx={{ ...LoginContentOverlay }}>
            <Box
              component={"img"}
              src={images.whiteStar}
              sx={{ ...blueStarOne }}
            />
            <Box
              component={"img"}
              src={images.whiteStar}
              sx={{ ...whiteStar }}
            />
            <Box
              component={"img"}
              src={images.whiteStar}
              sx={{ ...blueStarTwo }}
            />
            <Typography variant="h3">
              Let’s Get to <br /> Work
            </Typography>
            <Typography variant="h4">
              All-in-One Platform for Management and Collaboration
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ...LoginRight }}>
          <Box sx={{ ...boxTwo }}>
            <Box
              sx={{
                background: "var(--websecondary)",
                width: "100px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "3px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              <Box
                component={"img"}
                sx={{ width: "80px" }}
                src={images.logonew}
              />
            </Box>
            <Typography variant="h3">Welcome to SkillUp Tech</Typography>{" "}
            <>
              <Typography variant="h6">Reset Password</Typography>
              <Box component={"form"} onSubmit={handleSubmit(onsubmit)}>
                <CustomInput
                  name="newPassword"
                  placeholder="Enter your Password"
                  label="Password"
                  type={visibility ? "text" : "password"}
                  bgmode="dark"
                  boxSx={{ ...marginBottom10 }}
                  icon={
                    visibility ? (
                      <IoEyeOutline
                        onClick={() => setVisibility(!visibility)}
                      />
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
                <CustomButton
                  type="submit"
                  variant="contained"
                  label="Change Password"
                  btnSx={{ marginTop: "0px" }}
                  disabled={loading}
                />
                <Box sx={{ ...microsoftBottom }}>
                  Already have an account?{" "}
                  <Box component={"span"} onClick={() => navigate("/login")}>
                    Sign In
                  </Box>
                </Box>
              </Box>
            </>
          </Box>
          <Box sx={{ ...boxThree }}>
            <Typography variant="h4">
              © SkillUp Tech Solutions {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ResetPassword;
