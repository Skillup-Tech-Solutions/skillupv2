import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { images } from "../assets/Images/Images";
import { User, Envelope, ChatText, PaperPlaneTilt } from "@phosphor-icons/react";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { ReviewSchema } from "../assets/Validation/Schema";
import { useReviewPost } from "../Hooks/review";
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

const Review = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ReviewSchema),
  });
  const { mutate: reviewMutation } = useReviewPost();

  const onsubmit = async (data: { email: string, name: string, review: string }) => {
    reviewMutation(
      { email: data.email, name: data.name, review: data.review },
      {
        onSuccess: (response: any) => {
          CustomSnackBar.successSnackbar(
            response.message || "Review submitted successfully. Thank you!"
          );
          navigate("/");
          reset();
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message || "Something went wrong while submitting.");
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
          <Typography variant="h3">Share Feedback</Typography>
          <Typography variant="h6">Your insights help us build a better platform</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onsubmit)}>
          {/* Name */}
          <Box>
            <Typography sx={labelStyleHUD}>Your Name</Typography>
            <Box sx={inputContainerHUD}>
              <Box sx={inputIconHUD}><User size={18} /></Box>
              <Box
                component="input"
                type="text"
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
                {...register("email")}
                sx={inputHUD}
              />
            </Box>
            {errors.email && <Typography sx={errorHUD}>{String(errors.email.message)}</Typography>}
          </Box>

          {/* Review */}
          <Box>
            <Typography sx={labelStyleHUD}>Your Review</Typography>
            <Box sx={inputContainerHUD}>
              <Box sx={inputIconHUD}><ChatText size={18} /></Box>
              <Box
                component="textarea"
                placeholder="Write your experience with SkillUp..."
                {...register("review")}
                sx={{
                  ...inputHUD,
                  minHeight: '100px',
                  paddingTop: '12px',
                  resize: 'none'
                }}
              />
            </Box>
            {errors.review && <Typography sx={errorHUD}>{String(errors.review.message)}</Typography>}
          </Box>

          <Box
            component="button"
            type="submit"
            sx={buttonHUD}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <PaperPlaneTilt size={20} weight="bold" />
              Submit Review
            </Box>
          </Box>

          <Typography
            sx={{ ...forgotPasswordHUD, textAlign: 'center', mt: 3, mb: 0 }}
            onClick={() => navigate("/")}
          >
            Skip & Return to <span style={{ fontWeight: 700 }}>Home</span>
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

export default Review;
