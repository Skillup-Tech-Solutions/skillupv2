import { Box, Typography } from "@mui/material";
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

import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { useNavigate } from "react-router-dom";
import { forgetPassword } from "../Hooks/login";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { ReviewSchema } from "../assets/Validation/Schema";
import { useReviewPost } from "../Hooks/review";

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

  const onsubmit = async (data: { email: string,name:string,review:string }) => {
    console.log(data);

    reviewMutation(
      { email: data.email, name: data.name, review: data.review },
      {
        onSuccess: (response: any) => {
          CustomSnackBar.successSnackbar(
            response.message || "Review created successfully"
          );
          navigate("/");
          reset();
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(error.message || "Somethimg went wrong");
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
            <Typography variant="h3">Review</Typography>{" "}
            <>
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
                  boxSx={{ marginBottom: "10px" }}
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
                  boxSx={{ marginBottom: "10px" }}
                />
                <CustomInput
                  name="review"
                  placeholder="Enter your Review"
                  label="review"
                  type="text"
                  bgmode="dark"
                  required={false}
                  register={register}
                  errors={errors}
                  boxSx={{ marginBottom: "10px" }}
                />
                <CustomButton
                  type="submit"
                  variant="contained"
                  label="Submit Review"
                  btnSx={{ marginTop: "0px" }}
                />
              </Box>
            </>
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

export default Review;
