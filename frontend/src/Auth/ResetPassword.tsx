import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../assets/Validation/Schema";
import { resetPassword } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { images } from "../assets/Images/Images";
import { Lock, Eye, EyeSlash, ShieldCheck } from "@phosphor-icons/react";
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
  errorHUD,
  boxThreeHUD,
  forgotPasswordHUD
} from "../assets/Styles/LoginStyle";

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
            response.message || "Password Changed Successfully"
          );
          navigate("/login");
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message || "Something went wrong");
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <Box sx={LoginStyle}>
      <Box sx={scanlineOverlay} />
      <Box sx={backdropOverlay} />

      <Box sx={boxTwo}>
        {/* Header */}
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
          <Typography variant="h3">Secure Reset</Typography>
          <Typography variant="h6">Establish a new secure password for your account</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onsubmit)}>
          {/* New Password Input */}
          <Box>
            <Typography sx={labelStyleHUD}>New Password</Typography>
            <Box sx={inputContainerHUD}>
              <Box sx={inputIconHUD}>
                <Lock size={18} />
              </Box>
              <Box
                component="input"
                type={visibility ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                {...register("newPassword")}
                sx={inputHUD}
              />
              <Box sx={eyeIconHUD} onClick={() => setVisibility(!visibility)}>
                {visibility ? <Eye size={18} /> : <EyeSlash size={18} />}
              </Box>
            </Box>
            {errors.newPassword && (
              <Typography sx={errorHUD}>{String(errors.newPassword.message)}</Typography>
            )}
          </Box>

          <Box
            component="button"
            type="submit"
            disabled={loading}
            sx={buttonHUD}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <ShieldCheck size={20} weight="bold" />
              {loading ? 'Changing...' : 'Change Password'}
            </Box>
          </Box>

          <Typography
            sx={{ ...forgotPasswordHUD, textAlign: 'center', mt: 3, mb: 0 }}
            onClick={() => navigate("/login")}
          >
            Back to <span style={{ fontWeight: 700 }}>Sign In</span>
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={boxThreeHUD}>
          <Typography variant="h4">
            © SkillUp Tech Solutions {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
