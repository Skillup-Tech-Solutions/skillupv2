import { Box, Typography, CircularProgress } from "@mui/material";
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
import { useState, useEffect } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import CustomButton from "../Custom/CustomButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const ActivateSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ActivateForm = z.infer<typeof ActivateSchema>;

const ActivateAccount = () => {
    const [visibility, setVisibility] = useState(false);
    const [confirmVisibility, setConfirmVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ActivateForm>({
        resolver: zodResolver(ActivateSchema),
    });

    // Validate token
    const { data: tokenData, isLoading: isValidating, error: tokenError } = useQuery({
        queryKey: ["validate-token", token],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/validate-token/${token}`
            );
            return response.data;
        },
        enabled: !!token,
        retry: false,
    });

    const activateMutation = useMutation({
        mutationFn: async (data: { token: string; password: string }) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/activate`,
                data
            );
            return response.data;
        },
    });

    const onsubmit = async (data: ActivateForm) => {
        if (!token) {
            CustomSnackBar.errorSnackbar("Invalid activation link");
            return;
        }

        setLoading(true);
        activateMutation.mutate(
            { token, password: data.password },
            {
                onSuccess: () => {
                    CustomSnackBar.successSnackbar("Account activated! You can now login.");
                    setTimeout(() => {
                        navigate("/login");
                    }, 1500);
                },
                onError: (error: any) => {
                    CustomSnackBar.errorSnackbar(error.response?.data?.message || "Activation failed!");
                },
                onSettled: () => {
                    setLoading(false);
                }
            }
        );
    };

    if (!token) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: 2 }}>
                <Typography variant="h5" color="error">Invalid Activation Link</Typography>
                <Typography>No activation token found in the URL.</Typography>
                <CustomButton type="button" label="Go to Login" onClick={() => navigate("/login")} />
            </Box>
        );
    }

    if (isValidating) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: 2 }}>
                <CircularProgress />
                <Typography>Validating activation link...</Typography>
            </Box>
        );
    }

    if (tokenError || !tokenData?.valid) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: 2 }}>
                <Typography variant="h5" color="error">Invalid or Expired Link</Typography>
                <Typography>This activation link is no longer valid. Please contact admin for a new invite.</Typography>
                <CustomButton type="button" label="Go to Login" onClick={() => navigate("/login")} />
            </Box>
        );
    }

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
                            Activate Your <br /> Account
                        </Typography>
                        <Typography variant="h4">
                            Set your password to complete registration
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
                        <Typography variant="h3">Welcome, {tokenData?.user?.name}!</Typography>
                        <Typography variant="h6">Set your password to activate your account</Typography>
                        <form onSubmit={handleSubmit(onsubmit)}>
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
                            <CustomButton type="submit" variant="contained" label="Activate Account" disabled={loading} />
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

export default ActivateAccount;
