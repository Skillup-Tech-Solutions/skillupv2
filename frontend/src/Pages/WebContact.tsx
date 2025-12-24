import { Box, Typography, Button } from "@mui/material";
import CustomInput from "../Custom/CustomInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactUsSchema } from "../assets/Validation/Schema";
import { useContactPost } from "../Hooks/review";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { submitButtonStyle } from "../assets/Styles/ButtonStyles";
import { useState } from "react";
import emailjs from "emailjs-com";

const WebContact = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactUsSchema),
  });
  useContactPost();
  const onsubmit = async (data: any) => {
    setLoading(true);

    const emailParams = {
      name: data.name,
      email: data.email,
      contactNumber: data.mobile,
      description: data.description,
      year: new Date().getFullYear(),
    };

    try {
      await emailjs.send(
        "service_xto17zc",
        "template_v4zyapd",
        emailParams,
        "j0ZYBw2nraPLfCMAv"
      );
      CustomSnackBar.successSnackbar("Email sent successfully!");
    } catch (error) {
      console.error("EmailJS error:", error);
      CustomSnackBar.errorSnackbar("Failed to send email.");
      setLoading(false);
    }
    finally {
      reset();
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 2,
          padding: 3,
        }}
      >
        {/* Contact Form */}
        <Box
          sx={{
            width: "50%",
            "@media (max-width: 991px)": { width: "70%" },
            "@media (max-width: 690px)": { width: "100%" },
          }}
        >
          <Box
            sx={{
              padding: 4,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="medium"
              sx={{
                fontFamily: "Medium_W",
                mb: 3,
                textAlign: "center",
                fontSize: "24px",
                "@media (max-width: 690px)": { fontSize: "20px" },
              }}
            >
              Contact Us
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onsubmit)}
              autoComplete="off"
            >
              <CustomInput
                name="name"
                placeholder="Enter Name"
                label="Name"
                type="text"
                bgmode="dark"
                required={false}
                register={register}
                errors={errors}
              />
              <CustomInput
                name="email"
                placeholder="Enter Email"
                label="Email"
                type="email"
                bgmode="dark"
                required={false}
                register={register}
                errors={errors}
              />
              <CustomInput
                name="mobile"
                placeholder="Enter Mobile Number"
                label="Mobile Number"
                type="number"
                bgmode="dark"
                required={false}
                register={register}
                errors={errors}
              />
              <CustomInput
                name="description"
                placeholder="Enter Description"
                label="Description"
                type="text"
                bgmode="dark"
                required={false}
                register={register}
                errors={errors}
              />

              <Button
                variant="contained"
                type="submit"
                onClick={handleSubmit(onsubmit)}
                disabled={loading}
                fullWidth
                sx={{
                  ...submitButtonStyle,
                  borderRadius: "6px",
                  mt: 2,
                  py: 1.5,
                  fontSize: "16px",
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WebContact;
