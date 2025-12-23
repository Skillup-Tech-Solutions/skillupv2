import { Box, Typography } from "@mui/material";
import {
    blueStarOne,
    blueStarTwo,
    boxTwo,
    LoginContentOverlay,
    LoginImage,
    LoginLeft,
    LoginOverLay,
    LoginRight,
    LoginStyle,
    marginBottom10,
    whiteStar,
    boxThree,
} from "../assets/Styles/LoginStyle";
import { images } from "../assets/Images/Images";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomInput from "../Custom/CustomInput";
import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import CustomButton from "../Custom/CustomButton";
import { useNavigate } from "react-router-dom";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

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
        mutationFn: async (data: { name: string; email: string; mobile: string; password: string }) => {
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
                    setTimeout(() => {
                        navigate("/login");
                    }, 1500);
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
                            Start Your <br /> Learning Journey
                        </Typography>
                        <Typography variant="h4">
                            Join SkillUp Tech and unlock your potential
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
                        <Typography variant="h3">Student Registration</Typography>
                        <Typography variant="h6">Create your account to get started</Typography>
                        <form onSubmit={handleSubmit(onsubmit)}>
                            <CustomInput
                                name="name"
                                placeholder="Enter your Full Name"
                                label="Full Name"
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
                                type="email"
                                bgmode="dark"
                                required={false}
                                register={register}
                                errors={errors}
                            />
                            <CustomInput
                                name="mobile"
                                placeholder="Enter your Mobile (10 digits)"
                                label="Mobile Number"
                                type="text"
                                bgmode="dark"
                                required={false}
                                register={register}
                                errors={errors}
                            />
                            <CustomInput
                                name="password"
                                placeholder="Create a Password"
                                label="Password"
                                type={visibility ? "text" : "password"}
                                bgmode="dark"
                                icon={
                                    visibility ? (
                                        <IoEyeOutline onClick={() => setVisibility(!visibility)} />
                                    ) : (
                                        <IoEyeOffOutline onClick={() => setVisibility(!visibility)} />
                                    )
                                }
                                required={false}
                                register={register}
                                errors={errors}
                            />
                            <CustomInput
                                name="confirmPassword"
                                placeholder="Confirm your Password"
                                label="Confirm Password"
                                type={confirmVisibility ? "text" : "password"}
                                bgmode="dark"
                                boxSx={{ ...marginBottom10 }}
                                icon={
                                    confirmVisibility ? (
                                        <IoEyeOutline onClick={() => setConfirmVisibility(!confirmVisibility)} />
                                    ) : (
                                        <IoEyeOffOutline onClick={() => setConfirmVisibility(!confirmVisibility)} />
                                    )
                                }
                                required={false}
                                register={register}
                                errors={errors}
                            />
                            <CustomButton type="submit" variant="contained" label="Sign Up" disabled={loading} />
                            <Box sx={{ textAlign: "center", marginTop: "15px" }}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "var(--textLight)", cursor: "pointer" }}
                                    onClick={() => navigate("/login")}
                                >
                                    Already have an account? <span style={{ color: "var(--primary)", fontWeight: 600 }}>Sign In</span>
                                </Typography>
                            </Box>
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

export default StudentSignup;
