import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { images } from "../assets/Images/Images";
import {
    User,
    Envelope,
    Phone,
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

const StudentSignupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type StudentSignupForm = z.infer<typeof StudentSignupSchema>;

const StudentSignup = () => {
    const [visibility, setVisibility] = useState(false);
    const [confirmVisibility, setConfirmVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<StudentSignupForm>({
        resolver: zodResolver(StudentSignupSchema),
    });

    const signupMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/signup`,
                data
            );
            return response.data;
        },
    });

    const onsubmit = async (data: StudentSignupForm) => {
        setLoading(true);
        signupMutation.mutate(
            { name: data.name, email: data.email, mobile: data.mobile, password: data.password },
            {
                onSuccess: () => {
                    CustomSnackBar.successSnackbar("Registration successful! You can now login.");
                    setTimeout(() => navigate("/login"), 1500);
                },
                onError: (error: any) => {
                    CustomSnackBar.errorSnackbar(error.response?.data?.message || "Registration failed!");
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
                    <Typography variant="h3">Create Account</Typography>
                    <Typography variant="h6">Join SkillUp to start your journey</Typography>
                </Box>

                {/* Signup Form */}
                <Box component="form" onSubmit={handleSubmit(onsubmit)}>
                    {/* Full Name */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Full Name</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}>
                                <User size={18} weight="regular" />
                            </Box>
                            <Box
                                component="input"
                                type="text"
                                placeholder="Enter your Full Name"
                                autoComplete="name"
                                {...register("name")}
                                sx={inputHUD}
                            />
                        </Box>
                        {errors.name && (
                            <Typography sx={errorHUD}>{errors.name.message}</Typography>
                        )}
                    </Box>

                    {/* Email */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Email</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}>
                                <Envelope size={18} weight="regular" />
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
                            <Typography sx={errorHUD}>{errors.email.message}</Typography>
                        )}
                    </Box>

                    {/* Mobile */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Mobile Number</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}>
                                <Phone size={18} weight="regular" />
                            </Box>
                            <Box
                                component="input"
                                type="text"
                                placeholder="Enter your Mobile (10 digits)"
                                autoComplete="tel"
                                inputMode="tel"
                                {...register("mobile")}
                                sx={inputHUD}
                            />
                        </Box>
                        {errors.mobile && (
                            <Typography sx={errorHUD}>{errors.mobile.message}</Typography>
                        )}
                    </Box>

                    {/* Password */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Password</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}>
                                <Lock size={18} weight="regular" />
                            </Box>
                            <Box
                                component="input"
                                type={visibility ? "text" : "password"}
                                placeholder="Create a Password"
                                autoComplete="new-password"
                                {...register("password")}
                                sx={inputHUD}
                            />
                            <Box sx={eyeIconHUD} onClick={() => setVisibility(!visibility)}>
                                {visibility ? <Eye size={18} /> : <EyeSlash size={18} />}
                            </Box>
                        </Box>
                        {errors.password && (
                            <Typography sx={errorHUD}>{errors.password.message}</Typography>
                        )}
                    </Box>

                    {/* Confirm Password */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Confirm Password</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}>
                                <Lock size={18} weight="regular" />
                            </Box>
                            <Box
                                component="input"
                                type={confirmVisibility ? "text" : "password"}
                                placeholder="Confirm your Password"
                                autoComplete="new-password"
                                {...register("confirmPassword")}
                                sx={inputHUD}
                            />
                            <Box sx={eyeIconHUD} onClick={() => setConfirmVisibility(!confirmVisibility)}>
                                {confirmVisibility ? <Eye size={18} /> : <EyeSlash size={18} />}
                            </Box>
                        </Box>
                        {errors.confirmPassword && (
                            <Typography sx={errorHUD}>{errors.confirmPassword.message}</Typography>
                        )}
                    </Box>

                    <Box
                        component="button"
                        type="submit"
                        disabled={loading}
                        sx={{ ...buttonHUD, backgroundColor: '#2563eb', boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)', '&:hover': { backgroundColor: '#3b82f6', boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' } }}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </Box>
                </Box>

                {/* Navigation Link */}
                <Typography
                    sx={{ ...forgotPasswordHUD, textAlign: 'center', mt: 3, mb: 0 }}
                    onClick={() => navigate("/login")}
                >
                    Already have an account? <span style={{ fontWeight: 700 }}>Sign In</span>
                </Typography>

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

export default StudentSignup;
