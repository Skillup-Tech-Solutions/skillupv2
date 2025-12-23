import { Box, Typography } from "@mui/material";
import {
  blueStarOne,
  blueStarTwo,
  boxOne,
  boxThree,
  boxTwo,
  ForgetButton,
  LoginContentOverlay,
  LoginImage,
  LoginLeft,
  loginLogo,
  loginOr,
  LoginOverLay,
  LoginRight,
  LoginStyle,
  marginBottom10,
  microsoftBottom,
  microsoftBtn,
  relative,
  whiteStar,
} from "../assets/Styles/LoginStyle";
import { images } from "../assets/Images/Images";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../assets/Validation/Schema";
import CustomInput from "../Custom/CustomInput";
import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import CustomButton from "../Custom/CustomButton";
import { useNavigate, useLocation } from "react-router-dom";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { useLoginApi } from "../Hooks/login";
import Cookies from "js-cookie";

const Login = () => {
  const [visibility, setVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname + location.state?.from?.search || null;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });
  const { mutate: loginFunction } = useLoginApi();
  const onsubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    loginFunction(
      { email: data.email, password: data.password },
      {
        onSuccess: (response: any) => {
          console.log(response);
          const user = response.user;

          // Cookie security options
          const isProduction = window.location.protocol === 'https:';
          const cookieOptions = {
            path: "/",
            sameSite: "strict" as const,
            ...(isProduction && { secure: true })
          };

          // Store user info
          Cookies.set("email", user.email, cookieOptions);
          Cookies.set("role", user.role, cookieOptions);
          Cookies.set("name", user.name, cookieOptions);

          // Store tokens (support both old and new format)
          const accessToken = response.accessToken || response.token;
          Cookies.set("skToken", accessToken, cookieOptions);

          // Store refresh token if provided
          if (response.refreshToken) {
            Cookies.set("skRefreshToken", response.refreshToken, {
              ...cookieOptions,
              expires: 7 // 7 days
            });
          }

          // Check user status
          if (user.status !== "Active" && user.status !== "Self-Signed") {
            CustomSnackBar.errorSnackbar("Your account is not active. Please contact admin.");
            return;
          }

          CustomSnackBar.successSnackbar("Login Successfully");

          // Route based on role
          if (user.role === "admin") {
            setTimeout(() => {
              navigate("/dashboard");
            }, 1000);
          } else if (user.role === "student") {
            setTimeout(() => {
              if (from && !from.includes("/login")) {
                navigate(from);
              } else {
                navigate("/student/dashboard");
              }
            }, 1000);
          } else {
            CustomSnackBar.errorSnackbar("Invalid user role!");
          }
        },
        onError: (error) => {
          console.log(error);
          CustomSnackBar.errorSnackbar(error.message || "Invalid Credentials!");
        },
        onSettled: () => {
          setLoading(false);
        }
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
          {/* <Box sx={{ ...boxOne }}>
            <Box component={"img"} src={images.logo} sx={{ ...loginLogo }} />
            <Typography variant="h2">PackRepo</Typography>
          </Box> */}
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
            <Typography variant="h3">Welcome to SkillUp Tech</Typography>
            <Typography variant="h6">Please Sign In to continue</Typography>
            <form onSubmit={handleSubmit(onsubmit)}>
              <CustomInput
                name="email"
                placeholder="Enter your Email"
                label="Email"
                type="email"
                bgmode="dark"
                required={false}
                register={register}
                errors={errors}
              />
              <CustomInput
                name="password"
                placeholder="Enter your Password"
                label="Password"
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
              {/* <Typography
                variant="h6"
                sx={{ ...ForgetButton }}
                onClick={() => navigate("/forgotpassword")}
              >
                Forgot Password?
              </Typography> */}
              <CustomButton type="submit" variant="contained" label="Sign in" disabled={loading} />
              {/* <Box sx={{ ...relative }}>
                <Typography sx={{ ...loginOr }}>or</Typography>
              </Box>
              <CustomButton
                type="button"
                variant="outlined"
                btnSx={{ ...microsoftBtn }}
                label="Sign In with Microsoft"
                startIcon={
                  <img
                    src={images.microsoft}
                    style={{ width: "15px" }}
                    alt="microsoft"
                  />
                }
              /> */}
              {/* <Box sx={{ ...microsoftBottom }}>
                Don’t have an account?{" "}
                <Box component={"span"} onClick={() => navigate("/signup")}>
                  Sign Up
                </Box>
              </Box> */}
            </form>
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

export default Login;
