import { Box, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { images } from "../assets/Images/Images";
import { Lock, Eye, EyeSlash, ShieldCheck, CheckCircle, WarningCircle } from "@phosphor-icons/react";
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
    boxThreeHUD
} from "../assets/Styles/LoginStyle";

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

    if (!token || tokenError || (!isValidating && !tokenData?.valid)) {
        return (
            <Box sx={LoginStyle}>
                <Box sx={scanlineOverlay} />
                <Box sx={backdropOverlay} />
                <Box sx={boxTwo}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <WarningCircle size={64} color="#ef4444" weight="duotone" />
                        <Typography variant="h3" sx={{ mt: 2, color: '#ef4444' }}>Invalid Access</Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            This activation link is invalid or has expired. Please request a new invite from the administrator.
                        </Typography>
                        <Box component="button" onClick={() => navigate("/login")} sx={{ ...buttonHUD, mt: 4 }}>
                            Return to Login
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (isValidating) {
        return (
            <Box sx={LoginStyle}>
                <Box sx={scanlineOverlay} />
                <Box sx={backdropOverlay} />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <CircularProgress sx={{ color: '#3b82f6' }} />
                    <Typography sx={{ mt: 2, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                        AUTHENTICATING TOKEN...
                    </Typography>
                </Box>
            </Box>
        );
    }

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
                    <Typography variant="h3">Initialize Account</Typography>
                    <Typography variant="h6">Welcome, {tokenData?.user?.name}! Set your secure password.</Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onsubmit)}>
                    {/* Password */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Create Password</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}><Lock size={18} /></Box>
                            <Box
                                component="input"
                                type={visibility ? "text" : "password"}
                                placeholder="Min 6 characters"
                                autoComplete="new-password"
                                {...register("password")}
                                sx={inputHUD}
                            />
                            <Box sx={eyeIconHUD} onClick={() => setVisibility(!visibility)}>
                                {visibility ? <Eye size={18} /> : <EyeSlash size={18} />}
                            </Box>
                        </Box>
                        {errors.password && <Typography sx={errorHUD}>{errors.password.message}</Typography>}
                    </Box>

                    {/* Confirm Password */}
                    <Box>
                        <Typography sx={labelStyleHUD}>Confirm Password</Typography>
                        <Box sx={inputContainerHUD}>
                            <Box sx={inputIconHUD}><ShieldCheck size={18} /></Box>
                            <Box
                                component="input"
                                type={confirmVisibility ? "text" : "password"}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                {...register("confirmPassword")}
                                sx={inputHUD}
                            />
                            <Box sx={eyeIconHUD} onClick={() => setConfirmVisibility(!confirmVisibility)}>
                                {confirmVisibility ? <Eye size={18} /> : <EyeSlash size={18} />}
                            </Box>
                        </Box>
                        {errors.confirmPassword && <Typography sx={errorHUD}>{errors.confirmPassword.message}</Typography>}
                    </Box>

                    <Box component="button" type="submit" disabled={loading} sx={buttonHUD}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CheckCircle size={20} weight="bold" />
                            {loading ? 'Activating...' : 'Activate System Access'}
                        </Box>
                    </Box>
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

export default ActivateAccount;
