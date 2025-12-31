import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgetPasswordSchema } from "../assets/Validation/Schema";
import { forgetPassword } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { images } from "../assets/Images/Images";
import { Envelope, Key } from "@phosphor-icons/react";
import {
  LoginStyle,
  scanlineOverlay,
  backdropOverlay,
  boxTwo,
  labelStyleHUD,
  inputContainerHUD,
  inputIconHUD,
  inputHUD,
  buttonHUD,
  errorHUD,
  boxThreeHUD,
  forgotPasswordHUD
} from "../assets/Styles/LoginStyle";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgetPasswordSchema),
  });

  const { mutate: forgetPasswordNew } = forgetPassword();

  const onsubmit = async (data: { email: string }) => {
    setLoading(true);
    forgetPasswordNew(
      { email: data.email },
      {
        onSuccess: (response: any) => {
          CustomSnackBar.successSnackbar(
            response.message || "Password reset link sent to your email"
          );
          navigate("/login");
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message || "Something went wrong");
        },
        onSettled: () => {
          setLoading(false);
        }
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
          <Typography variant="h3">Reset Access</Typography>
          <Typography variant="h6">Enter your email to receive recovery link</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onsubmit)}>
          {/* Email Input */}
          <Box>
            <Typography sx={labelStyleHUD}>Registered Email</Typography>
            <Box sx={inputContainerHUD}>
              <Box sx={inputIconHUD}>
                <Envelope size={18} />
              </Box>
              <Box
                component="input"
                type="email"
                placeholder="Enter your registered email"
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

          <Box
            component="button"
            type="submit"
            disabled={loading}
            sx={buttonHUD}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Key size={20} weight="bold" />
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </Box>
          </Box>

          <Typography
            sx={{ ...forgotPasswordHUD, textAlign: 'center', mt: 3, mb: 0 }}
            onClick={() => navigate("/login")}
          >
            Remembered your password? <span style={{ fontWeight: 700 }}>Sign In</span>
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

export default ForgetPassword;
