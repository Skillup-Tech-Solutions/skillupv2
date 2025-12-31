import { Box, Typography } from "@mui/material";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "../assets/Validation/Schema";
import { useRegisterApi, verifyOtp } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { images } from "../assets/Images/Images";
import {
  User,
  Envelope,
  Phone,
  ShieldCheck,
  ArrowCounterClockwise,
  CheckCircle
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
  buttonHUD,
  errorHUD,
  boxThreeHUD,
  forgotPasswordHUD
} from "../assets/Styles/LoginStyle";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOpenOpen] = useState<boolean>(false);
  const [valueStore, setValueStore] = useState<any>({});
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: RegisterUser } = useRegisterApi();
  const { mutate: otpFunction } = verifyOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const onsubmit = async (data: { email: string; name: string; mobile: string }) => {
    setLoading(true);
    RegisterUser(
      { email: data.email, name: data.name, mobile: data.mobile },
      {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("OTP sent to your email.");
          setOpenOpen(true);
          setValueStore(data);
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message);
        },
        onSettled: () => setLoading(false),
      }
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    setLoading(true);
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      otpFunction(
        { otp: otpValue, email: valueStore.email },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Account Registered Successfully");
            setValueStore({});
            navigate("/login");
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(error.message);
          },
          onSettled: () => setLoading(false),
        }
      );
    } else {
      CustomSnackBar.errorSnackbar("Please enter a valid 6-digit OTP");
      setLoading(false);
    }
  };

  const handleResendClick = () => {
    if (!valueStore.email) return;
    RegisterUser(
      { email: valueStore.email, name: valueStore.name, mobile: valueStore.mobile },
      {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("OTP Resent Successfully");
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message);
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
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
          <Typography variant="h3">{otpOpen ? "Verify Access" : "Create Account"}</Typography>
          <Typography variant="h6">
            {otpOpen ? "Enter the 6-digit code sent to your email" : "Join the SkillUp professional network"}
          </Typography>
        </Box>

        {!otpOpen ? (
          <Box component="form" onSubmit={handleSubmit(onsubmit)}>
            {/* Name */}
            <Box>
              <Typography sx={labelStyleHUD}>Full Name</Typography>
              <Box sx={inputContainerHUD}>
                <Box sx={inputIconHUD}><User size={18} /></Box>
                <Box
                  component="input"
                  placeholder="Enter your Name"
                  autoComplete="name"
                  {...register("name")}
                  sx={inputHUD}
                />
              </Box>
              {errors.name && <Typography sx={errorHUD}>{String(errors.name.message)}</Typography>}
            </Box>

            {/* Email */}
            <Box>
              <Typography sx={labelStyleHUD}>Email Address</Typography>
              <Box sx={inputContainerHUD}>
                <Box sx={inputIconHUD}><Envelope size={18} /></Box>
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
              {errors.email && <Typography sx={errorHUD}>{String(errors.email.message)}</Typography>}
            </Box>

            {/* Mobile */}
            <Box>
              <Typography sx={labelStyleHUD}>Mobile Number</Typography>
              <Box sx={inputContainerHUD}>
                <Box sx={inputIconHUD}><Phone size={18} /></Box>
                <Box
                  component="input"
                  type="tel"
                  placeholder="Enter Mobile Number"
                  autoComplete="tel"
                  inputMode="tel"
                  {...register("mobile")}
                  sx={inputHUD}
                />
              </Box>
              {errors.mobile && <Typography sx={errorHUD}>{String(errors.mobile.message)}</Typography>}
            </Box>

            <Box component="button" type="submit" disabled={loading} sx={buttonHUD}>
              {loading ? 'Processing...' : 'Request Access'}
            </Box>

            <Typography
              sx={{ ...forgotPasswordHUD, textAlign: 'center', mt: 3, mb: 0 }}
              onClick={() => navigate("/login")}
            >
              Already have an account? <span style={{ fontWeight: 700 }}>Sign In</span>
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 4, mt: 2 }}>
              {otp.map((digit, index) => (
                <Box
                  key={index}
                  component="input"
                  ref={(el: HTMLInputElement | null) => (otpRefs.current[index] = el)}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => handleOtpKeyDown(index, e)}
                  maxLength={1}
                  inputMode="numeric"
                  sx={{
                    width: '45px',
                    height: '50px',
                    backgroundColor: '#020617',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    color: '#3b82f6',
                    fontSize: '20px',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 1px #3b82f6',
                      outline: 'none',
                    },
                  }}
                />
              ))}
            </Box>

            <Box
              component="button"
              onClick={handleOtpSubmit}
              disabled={loading}
              sx={{ ...buttonHUD, backgroundColor: '#10b981', boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)', '&:hover': { backgroundColor: '#059669' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckCircle size={20} weight="bold" />
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
                px: 1
              }}
            >
              <Typography
                sx={{ ...forgotPasswordHUD, textAlign: 'left', m: 0, fontSize: '11px' }}
                onClick={handleResendClick}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowCounterClockwise size={14} /> Resend Code
                </Box>
              </Typography>
              <Typography
                sx={{ ...forgotPasswordHUD, textAlign: 'right', m: 0, fontSize: '11px', color: '#94a3b8' }}
                onClick={() => setOpenOpen(false)}
              >
                Edit Information
              </Typography>
            </Box>
          </Box>
        )}

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

export default SignUp;
