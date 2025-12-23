import { Box, Typography, TextField } from "@mui/material";
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
  microsoftBottom,
  whiteStar,
} from "../assets/Styles/LoginStyle";
import { images } from "../assets/Images/Images";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "../assets/Validation/Schema";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { CiMail } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useRegisterApi, verifyOtp } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";

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

  const onsubmit = async (data: {
    email: string;
    name: string;
    mobile: string;
  }) => {
    setLoading(true);
    RegisterUser(
      { email: data.email, name: data.name, mobile: data.mobile },
      {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Please check your mail");
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

      // Auto-focus next input
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
            CustomSnackBar.successSnackbar("Register Successfully");
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
      CustomSnackBar.errorSnackbar("Please enter valid OTP");
    }
  };
  const handleResendClick = () => {
    console.log(valueStore);

    RegisterUser(
      {
        email: valueStore.email,
        name: valueStore.name,
        mobile: valueStore.mobile,
      },
      {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Please check your mail");
          setOpenOpen(true);
          setValueStore(valueStore);
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message);
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
            <Typography variant="h3">Welcome to SkillUp Tech</Typography>
            {otpOpen === false ? (
              <>
                <Typography variant="h6">Please Sign up to continue</Typography>
                <Box component={"form"} onSubmit={handleSubmit(onsubmit)}>
                  <CustomInput
                    name="name"
                    placeholder="Enter your Name"
                    label="Name"
                    type="text"
                    bgmode="dark"
                    required={false}
                    register={register}
                    errors={errors}
                  />
                  <CustomInput
                    name="email"
                    placeholder="Enter your Email"
                    label="Email"
                    type="text"
                    bgmode="dark"
                    required={false}
                    register={register}
                    errors={errors}
                  />
                  <CustomInput
                    name="mobile"
                    placeholder="Enter your Mobile Number"
                    label="Mobile Number"
                    type="number"
                    bgmode="dark"
                    required={false}
                    register={register}
                    errors={errors}
                  />
                  <CustomButton
                    type="submit"
                    variant="contained"
                    label="Sign Up"
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
            ) : (
              <>
                <Box>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    We've sent a 6-digit code to your email
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    {otp.map((digit, index) => (
                      <TextField
                        key={index}
                        inputRef={(el) => (otpRefs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        inputProps={{
                          maxLength: 1,
                          style: {
                            textAlign: "center",
                            fontSize: "16px",
                            fontWeight: "bold",
                          },
                        }}
                        sx={{
                          width: "40px",
                          height: "40px",
                          "& .MuiOutlinedInput-root": {
                            height: "40px",
                            "& fieldset": {
                              borderColor: "#ccc",
                            },
                            "&:hover fieldset": {
                              borderColor: "#ccc",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#ccc",
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                  <CustomButton
                    type="button"
                    variant="contained"
                    label="Verify OTP"
                    onClick={handleOtpSubmit}
                    disabled={loading}
                    btnSx={{ marginTop: "0px" }}
                  />
                  <Box sx={{ ...microsoftBottom }}>
                    Didn't receive the code?{" "}
                    <Box component={"span"} onClick={handleResendClick}>
                      Resend
                    </Box>
                  </Box>
                  <Box sx={{ ...microsoftBottom }}>
                    Already have an account?{" "}
                    <Box component={"span"} onClick={() => navigate("/login")}>
                      Sign In
                    </Box>
                  </Box>
                </Box>
              </>
            )}
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

export default SignUp;
