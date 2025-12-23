import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  carrersWebSchema,
  carrersWebSchemaNew,
} from "../assets/Validation/Schema";
import { Controller, useForm } from "react-hook-form";
import { useGetCarrers } from "../Hooks/carrers";
import CustomFileUpload from "../Custom/CustomFileUpload";
import { useCarrerMail } from "../Hooks/review";
import CustomSnackBar from "../Custom/CustomSnackBar";
import emailjs from "emailjs-com";
import { outlinedButtonStyle } from "../assets/Styles/ButtonStyles";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  outline: "none",
  borderRadius: "5px",
  boxShadow: 24,
  padding: "10px 20px",
  "@media (max-width: 600px)": {
    width: "90vw",
    margin: "auto",
  },
};

const WebCareers = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(carrersWebSchemaNew),
  });
  const [loading, setLoading] = useState(false);
  const { data: getUsersResponse } = useGetCarrers();
  const jobData = getUsersResponse && getUsersResponse.data;
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    title: string;
    id: string;
  } | null>(null);

  const handleOpen = (jobTitle: string, jobId: string) => {
    setSelectedJob({ title: jobTitle, id: jobId });
    setOpen(true);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };
  const { mutate: carrerMutation } = useCarrerMail();
  const onsubmit = async (data: any) => {
    setLoading(true);
    if (selectedJob) {
      const emailParams = {
        name: data.name,
        email: data.email,
        contactNumber: data.mobile,
        title: selectedJob.title,
        year: new Date().getFullYear(),
      };

      try {
        await emailjs.send(
          "service_xto17zc",
          "template_d26jy52",
          emailParams,
          "j0ZYBw2nraPLfCMAv"
        );
        CustomSnackBar.successSnackbar("Email sent successfully!");
      } catch (error) {
        console.error("EmailJS error:", error);
        CustomSnackBar.errorSnackbar("Failed to send email.");
        setLoading(false);
      } finally {
        handleClose();
        setLoading(false);
        reset();
      }
    }
  };

  return (
    <Box>
      {/* Heading */}
      <Box
        sx={{
          fontSize: "130px",
          fontFamily: "Bold_W",
          textTransform: "uppercase",
          background: "linear-gradient(-1deg, #fff, var(--webprimary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: 0.8,
          paddingTop: "40px",
          mb: 4,
          "@media (max-width: 768px)": { fontSize: "100px" },
          "@media (max-width: 650px)": { fontSize: "80px" },
          "@media (max-width: 500px)": { fontSize: "60px" },
          "@media (max-width: 450px)": { fontSize: "50px" },
        }}
      >
        Careers
      </Box>

      {/* Job Cards */}
      <Grid
        container
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {getUsersResponse &&
          jobData
            ?.filter((job: any) => job.status?.toLowerCase() === "active") // ✅ Only show active careers
            .map((job: any, index: any) => (
              <Box
                flexBasis={"48%"}
                key={index}
                sx={{
                  "@media (max-width: 768px)": { flexBasis: "100%" },
                }}
              >
                <Card
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "SemiBold_W", color: "#222" }}
                      >
                        {job.jobTitle}
                      </Typography>
                      <Chip
                        label={job.vancancy}
                        size="small"
                        sx={{
                          backgroundColor:
                            job.vancancy.toLowerCase() === "open"
                              ? "#e0f7e9"
                              : "#f9e0e0",
                          color:
                            job.vancancy.toLowerCase() === "open"
                              ? "#219653"
                              : "#d32f2f",
                          fontWeight: 500,
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{ color: "#555", fontFamily: "Regular_W", mb: 2 }}
                    >
                      {job.description}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      mb={2}
                      sx={{ gap: "10px" }}
                    >
                      <Chip
                        label={`Work Type: ${job.workType}`}
                        size="small"
                        sx={{ fontSize: "12px" }}
                      />
                      <Chip
                        label={`Openings: ${job.noOfopening}`}
                        size="small"
                        sx={{ fontSize: "12px" }}
                      />
                      <Chip
                        label={`Salary: ${job.salaryRange}`}
                        size="small"
                        sx={{ fontSize: "12px" }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "13px",
                        color: "#777",
                        fontFamily: "Medium_W",
                        mb: 2,
                      }}
                    >
                      <strong>Key Skills:</strong> {job.keySkill}
                    </Typography>

                    <Button
                      variant="outlined"
                      onClick={() => handleOpen(job.jobTitle, job.id)}
                      sx={{ ...outlinedButtonStyle, textTransform: "none", borderRadius: "6px" }}
                      disabled={job.vancancy.toLowerCase() !== "open"}
                    >
                      Apply
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
      </Grid>

      {/* Apply Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              borderBottom: "0.4px solid var(--greyText)",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ fontSize: "14px", fontFamily: "Medium_M" }}
            >
              {selectedJob?.title}
            </Typography>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={handleClose}
              sx={{
                "& svg": {
                  fontSize: "18px",
                },
              }}
            >
              <IoClose className="close-icon" />
            </IconButton>
          </Box>
          {/* Body */}
          <Box
            component={"form"}
            sx={{ marginTop: "12px", maxHeight: "50vh", overflowY: "auto" }}
            onSubmit={handleSubmit(onsubmit)}
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
              type="text"
              bgmode="dark"
              required={false}
              register={register}
              errors={errors}
            />
            <CustomInput
              name="mobile"
              placeholder="Enter Phone Number"
              label="Mobile Number"
              type="number"
              bgmode="dark"
              required={false}
              register={register}
              errors={errors}
            />
            {/* <Controller
              name="resume"
              control={control}
              render={({ field, fieldState }) => (
                <CustomFileUpload
                  name={field.name}
                  label="Resume"
                  value={field.value}
                  onChange={(file) => field.onChange(file)}
                  error={fieldState.error}
                />
              )}
            /> */}
          </Box>
          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "12px",
              paddingBottom: "12px",
              gap: "20px",
            }}
          >
            <CustomButton
              type="button"
              variant="contained"
              label="cancel"
              btnSx={{ background: "transparent", color: "var(--title)" }}
              onClick={handleClose}
            />
            <CustomButton
              type="submit"
              variant="contained"
              label={"Apply"}
              btnSx={{ background: "var(--primary)", color: "var(--white)" }}
              onClick={handleSubmit(onsubmit)}
              disabled={loading}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default WebCareers;
