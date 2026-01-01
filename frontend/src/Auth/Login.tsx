import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../assets/Validation/Schema";
import { useLoginApi } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { authService } from "../services/authService";
import { pushNotificationService } from "../services/pushNotificationService";
import { analyticsService } from "../services/analyticsService";
import { images } from "../assets/Images/Images";
import { getDeviceInfo, storeDeviceId } from "../utils/deviceInfo";
import {
  User,
  Lock,
  Eye,
  EyeSlash
} from "@phosphor-icons/react";
import {
  LoginStyle,
  scanlineOverlay,
  backdropOverlay,
  boxTwo,
  labelStyleHUD,
  inputContainerHUD,
  inputIconHUD,
  inputHUD,
  eyeIconHUD,
  buttonHUD,
  forgotPasswordHUD,
  errorHUD,
  boxThreeHUD
} from "../assets/Styles/LoginStyle";

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

  const onsubmit = async (data: any) => {
    setLoading(true);

    // Get device info for session tracking
    let deviceInfoData = null;
    try {
      deviceInfoData = await getDeviceInfo();
      // Store device ID for subsequent requests
      storeDeviceId(deviceInfoData.deviceId);
    } catch (err) {
      console.warn('[Login] Could not get device info:', err);
    }

    loginFunction(
      {
        email: data.email,
        password: data.password,
        deviceInfo: deviceInfoData
      },
      {
        onSuccess: (response: any) => {
          const user = response.user;
          // Use centralized authService for production-level persistence
          authService.setTokens({
            accessToken: response.accessToken || response.token,
            refreshToken: response.refreshToken,
            email: user.email,
            role: user.role,
            name: user.name,
            mobile: user.mobile
          });

          if (user.status !== "Active" && user.status !== "Self-Signed") {
            CustomSnackBar.errorSnackbar("Your account is not active. Please contact admin.");
            return;
          }

          CustomSnackBar.successSnackbar("Login Successfully");

          // Analytics: Log Login
          analyticsService.logEvent('login', { scheme: 'email', role: user.role });

          // Push Notification: Register device with backend
          pushNotificationService.registerWithBackend();

          if (user.role === "admin") {
            setTimeout(() => navigate("/dashboard"), 1000);
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
        onError: (error: any) => {
          CustomSnackBar.errorSnackbar(error.message || "Invalid Credentials!");
        },
        onSettled: () => {
          setLoading(false);
        }
      }
    );
  };

  return (
    <Box sx={LoginStyle}>
      {/* HUD CRT Effect */}
      <Box sx={scanlineOverlay} />
      <Box sx={backdropOverlay} />

      <Box sx={boxTwo}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: "80px",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <Box
              component="img"
              src={images.logonew}
              alt="SkillUp Logo"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
          <Typography variant="h3">Welcome Back</Typography>
          <Typography variant="h6">Sign in to continue to SkillUp</Typography>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit(onsubmit)}>
          {/* Email Input */}
          <Box>
            <Typography sx={labelStyleHUD}>Email Address</Typography>
            <Box sx={inputContainerHUD}>
              <Box sx={inputIconHUD}>
                <User size={18} weight="regular" />
              </Box>
              <Box
                component="input"
                type="email"
                placeholder="Enter your Email"
                autoComplete="email"
                inputMode="email"
                {...register("email")}
                sx={inputHUD}
              />
            </Box>
            {errors.email && (
              <Typography sx={errorHUD}>{String(errors.email.message)}</Typography>
            )}
          </Box>

          {/* Password Input */}
          <Box>
            <Typography sx={labelStyleHUD}>Password</Typography>
            <Box sx={inputContainerHUD}>
              <Box sx={inputIconHUD}>
                <Lock size={18} weight="regular" />
              </Box>
              <Box
                component="input"
                type={visibility ? "text" : "password"}
                placeholder="Enter your Password"
                autoComplete="current-password"
                {...register("password")}
                sx={inputHUD}
              />
              <Box sx={eyeIconHUD} onClick={() => setVisibility(!visibility)}>
                {visibility ? <Eye size={18} /> : <EyeSlash size={18} />}
              </Box>
            </Box>
            {errors.password && (
              <Typography sx={errorHUD}>{String(errors.password.message)}</Typography>
            )}
          </Box>

          {/* Action Links */}
          <Typography
            sx={forgotPasswordHUD}
            onClick={() => navigate("/forgotpassword")}
          >
            Forgot Password?
          </Typography>

          <Box
            component="button"
            type="submit"
            disabled={loading}
            sx={buttonHUD}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Box>

          <Typography
            sx={{ ...forgotPasswordHUD, textAlign: 'center', mt: 3, mb: 0 }}
            onClick={() => navigate("/signup")}
          >
            Don't have an account? <span style={{ fontWeight: 700 }}>Sign Up</span>
          </Typography>
        </Box>

        {/* Footer Section */}
        <Box sx={boxThreeHUD}>
          <Typography variant="h4">
            © SkillUp Tech Solutions {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
