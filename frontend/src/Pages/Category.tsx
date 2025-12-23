import {
  Box,
  IconButton,
  Modal,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
} from "@mui/material";
import CustomButton from "../Custom/CustomButton";
import CustomInput from "../Custom/CustomInput";
import CustomAutoComplete from "../Custom/CustomAutocomplete";
import CustomDatePicker from "../Custom/CustomDatePicker";
import CustomTimePicker from "../Custom/CustomTimePicker";
import CustomFileUpload from "../Custom/CustomFileUpload";
import { IoClose } from "react-icons/io5";
import { MdEdit, MdDelete } from "react-icons/md";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema } from "../assets/Validation/Schema";
import dayjs, { Dayjs } from "dayjs";
import {
  useCategoryAddApi,
  useGetCategoryApi,
  useCategoryUpdateApi,
  useCategoryDeleteApi,
} from "../Hooks/category";
import CustomSnackBar from "../Custom/CustomSnackBar";
import config from "../Config/Config";
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
const Category = () => {
  const { data: getCategoriesData } = useGetCategoryApi();
  const { mutate: categoryAdd } = useCategoryAddApi();
  const { mutate: categoryUpdate } = useCategoryUpdateApi();
  const { mutate: categoryDelete } = useCategoryDeleteApi();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [modeValue, setModeValue] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Options for autocomplete fields
  const categoryOptions = [
    { label: "Workshop", value: "workShop" },
    { label: "Internship", value: "internShip" },
  ];

  const modeOptions = [
    { label: "Online", value: "online" },
    { label: "Offline", value: "offline" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(CategorySchema),
  });
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setEditingCategory(null);
    reset();
    clearErrors();
    // Reset all state values
    setCategoryValue(null);
    setModeValue(null);
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
    setImageFile(null);
  };
  const onsubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("category", categoryValue);
    formData.append("description", data.description);
    formData.append("mode", modeValue);
    formData.append("price", data.prize);
    formData.append("title", data.title);
    formData.append("venue", data.venue);
    // Handle image upload - check if it's a new file or existing image
    if (data.image) {
      if (typeof data.image === "object" && data.image.filename) {
        // Existing image - don't append to formData, backend will keep existing
        // Or you can append the filename if your backend expects it
      } else if (data.image instanceof File) {
        // New file upload
        formData.append("image", data.image);
      }
    }
    formData.append("startDate", startDate?.format("MM/DD/YYYY"));
    formData.append("endDate", endDate?.format("MM/DD/YYYY"));
    formData.append("endTime", endTime?.format("HH:mm"));
    formData.append("startTime", startTime?.format("HH:mm"));

    if (editMode && editingCategory) {
      categoryUpdate(
        { id: editingCategory._id, formData },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Category Updated Successfully!");
            handleClose();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(
              error.message || "Error Updating Category."
            );
          },
          onSettled: () => {
          setLoading(false);
        }
        }
      );
    } else {
      categoryAdd(formData, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Category Added Successfully!");
          handleClose();
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(
            error.message || "Error Adding Category."
          );
        },
        onSettled: () => {
          setLoading(false);
        }
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditMode(true);
    setEditingCategory(category);
    setOpen(true);

    // Populate form with existing data
    setCategoryValue(category.category);
    setModeValue(category.mode);
    setStartDate(dayjs(category.startDate));
    setEndDate(dayjs(category.endDate));
    setStartTime(dayjs(`2000-01-01 ${category.startTime}`));
    setEndTime(dayjs(`2000-01-01 ${category.endTime}`));

    // Set form values
    setValue("title", category.title);
    setValue("description", category.description);
    setValue("prize", category.price);
    setValue("venue", category.venue);
    setValue("category", category.category);
    setValue("mode", category.mode);
    setValue("startDate", dayjs(category.startDate).toDate());
    setValue("endDate", dayjs(category.endDate).toDate());
    setValue("startTime", category.startTime);
    setValue("endTime", category.endTime);

    // Set image value for edit mode - similar to courses
    setValue(
      "image",
      category.image
        ? {
            filename: category.image,
            url: `/uploads/${category.image}`,
          }
        : ""
    );

    // Set imageFile state to null for edit mode (existing image will be shown via setValue)
    setImageFile(null);
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      categoryDelete(categoryToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Category Deleted Successfully!");
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        },
        onError: (error: any) => {
          CustomSnackBar.errorSnackbar(
            error.message || "Error Deleting Category."
          );
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };
  return (
    <>
      <Box sx={{ padding: { xs: "0px", sm: "20px", md: "24px" } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            marginBottom: "20px",
            "@media (max-width: 600px)": {
              flexDirection: "column",
              alignItems: "start",
            },
          }}
        >
          <CustomButton
            type="button"
            label="Add Category"
            variant="contained"
            btnSx={{
              background: "var(--primary)",
              color: "var(--white)",
              width: "fit-content",
            }}
            onClick={() => setOpen(true)}
          />
        </Box>

        {/* Categories Cards Display */}
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
          sx={{
            "@media (max-width: 600px)": {
              padding: "0 8px",
            },
          }}
        >
          {getCategoriesData?.data && getCategoriesData.data.length > 0 ? (
            getCategoriesData.data.map((category: any) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={category._id}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexBasis: "30% !important",
                  "@media (max-width: 991px)": {
                    flexBasis: "48% !important",
                  },
                  "@media (max-width: 767px)": {
                    flexBasis: "100% !important",
                  },
                }}
              >
                <Card
                  sx={{
                    maxWidth: 345,
                    // flexBasis:"30%",
                    width: "100%",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    },
                    "@media (max-width: 600px)": {
                      maxWidth: "100%",
                    },
                  }}
                >
                  {category.image && (
                    <CardMedia
                      component="img"
                      sx={{
                        height: { xs: "180px", sm: "200px", md: "220px" },
                        objectFit: "cover",
                        width: "100%",
                      }}
                      image={`${config.BASE_URL_MAIN}/uploads/${category.image}`}
                      alt={category.title}
                    />
                  )}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      padding: { xs: "12px", sm: "16px" },
                      display: "flex",
                      flexDirection: "column",
                      gap: { xs: 1, sm: 1.5 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: "0px",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontFamily: "SemiBold_M",
                          fontSize: "14px",
                          lineHeight: 1.2,
                          flex: 1,
                          mr: 1,
                        }}
                      >
                        {category.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(category)}
                          sx={{
                            color: "var(--primary)",
                            "&:hover": {
                              backgroundColor: "rgba(25, 118, 210, 0.1)",
                            },
                          }}
                        >
                          <MdEdit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(category._id)}
                          sx={{
                            color: "#f44336",
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 0.1)",
                            },
                          }}
                        >
                          <MdDelete />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.5,
                        fontSize: "12px",
                        fontFamily: "Regular_M",
                        display: "-webkit-box",
                        WebkitLineClamp: { xs: 2, sm: 3 },
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mb: "5px",
                      }}
                    >
                      {category.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: { xs: 0.5, sm: 1 },
                        mb: { xs: 1, sm: 2 },
                        flexWrap: "wrap",
                        justifyContent: { xs: "flex-start", sm: "flex-start" },
                      }}
                    >
                      <Chip
                        label={
                          category.category === "workShop"
                            ? "Workshop"
                            : "Internship"
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontSize: { xs: "11px", sm: "12px" },
                          height: { xs: "24px", sm: "28px" },
                          fontFamily: "Regular_M",
                        }}
                      />
                      <Chip
                        label={
                          category.mode === "online" ? "Online" : "Offline"
                        }
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{
                          fontSize: { xs: "11px", sm: "12px" },
                          height: { xs: "24px", sm: "28px" },
                          fontFamily: "Regular_M",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: { xs: 0.5, sm: 1 },
                        mb: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "medium",
                          fontSize: "12px",
                          fontFamily: "Regular_M",
                        }}
                      >
                        <strong>Price:</strong> ₹{category.price}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "12px",
                          fontFamily: "Regular_M",
                        }}
                      >
                        <strong>Venue:</strong> {category.venue}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: { xs: 0.5, sm: 1 },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "12px", fontFamily: "Regular_M" }}
                      >
                        <strong>Start:</strong>{" "}
                        {dayjs(category.startDate).format("MMM DD, YYYY")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "12px", fontFamily: "Regular_M" }}
                      >
                        <strong>End:</strong>{" "}
                        {dayjs(category.endDate).format("MMM DD, YYYY")}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: { xs: 0.5, sm: 1 },
                        mt: "auto", // Push to bottom of card
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "12px", fontFamily: "Regular_M" }}
                      >
                        <strong>Start Time:</strong> {category.startTime}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "12px", fontFamily: "Regular_M" }}
                      >
                        <strong>End Time:</strong> {category.endTime}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: { xs: "150px", sm: "200px" },
                  flexDirection: "column",
                  gap: { xs: 1, sm: 2 },
                  padding: { xs: 2, sm: 3 },
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "18px", sm: "20px" },
                    textAlign: "center",
                  }}
                >
                  No categories found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "14px", sm: "16px" },
                    textAlign: "center",
                  }}
                >
                  Click "Add Category" to create your first category
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {/* Header  */}
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
                {editMode ? "Edit Category" : "Add Category"}
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
              sx={{ marginTop: "12px", maxHeight: "60vh", overflowY: "auto" }}
              onSubmit={handleSubmit(onsubmit)}
            >
              {/* Category Field */}
              <Controller
                name="category"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <CustomAutoComplete
                    {...field}
                    options={categoryOptions}
                    label="Category"
                    placeholder="Select Category"
                    value={categoryValue}
                    onValueChange={(value) => {
                      setCategoryValue(
                        typeof value === "string"
                          ? value
                          : value
                          ? value[0]
                          : ""
                      );
                      setValue(
                        "category",
                        typeof value === "string"
                          ? value
                          : value
                          ? value[0]
                          : ""
                      );
                      clearErrors("category");
                    }}
                    errors={errors}
                    name="category"
                    register={register}
                  />
                )}
              />

              {/* Title Field */}
              <CustomInput
                name="title"
                placeholder="Enter Title"
                label="Title"
                type="text"
                bgmode="dark"
                register={register}
                errors={errors}
              />

              {/* Description Field */}
              <CustomInput
                name="description"
                placeholder="Enter Description"
                label="Description"
                type="text"
                bgmode="dark"
                register={register}
                errors={errors}
              />

              {/* Prize Field */}
              <CustomInput
                name="prize"
                placeholder="Enter Prize"
                label="Prize"
                type="number"
                bgmode="dark"
                register={register}
                errors={errors}
              />

              {/* Mode Field */}
              <Controller
                name="mode"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <CustomAutoComplete
                    options={modeOptions}
                    label="Mode"
                    placeholder="Select Mode"
                    value={modeValue}
                    onValueChange={(value) => {
                      setModeValue(
                        typeof value === "string"
                          ? value
                          : value
                          ? value[0]
                          : ""
                      );
                      setValue(
                        "mode",
                        typeof value === "string"
                          ? value
                          : value
                          ? value[0]
                          : ""
                      );
                      clearErrors("mode");
                    }}
                    errors={errors}
                    name="mode"
                    register={register}
                  />
                )}
              />

              {/* Venue Field */}
              <CustomInput
                name="venue"
                placeholder="Enter Venue"
                label="Venue"
                type="text"
                bgmode="dark"
                register={register}
                errors={errors}
              />

              {/* Date and Time Fields */}
              <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {/* Start Date */}
                <Box sx={{ flex: "1", minWidth: "150px" }}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        label="Start Date"
                        placeholder="Select Start Date"
                        value={startDate}
                        onChange={(value) => {
                          setStartDate(value);
                          setValue("startDate", value?.toDate() || new Date());
                        }}
                        errors={errors}
                        name="startDate"
                        clearErrors={clearErrors}
                        minDate={dayjs()} // Only allow today and future dates
                        maxDate={endDate || undefined}
                        bgmode="dark"
                      />
                    )}
                  />
                </Box>

                {/* End Date */}
                <Box sx={{ flex: "1", minWidth: "150px" }}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        label="End Date"
                        placeholder="Select End Date"
                        value={endDate}
                        onChange={(value) => {
                          setEndDate(value);
                          setValue("endDate", value?.toDate() || new Date());
                        }}
                        errors={errors}
                        name="endDate"
                        clearErrors={clearErrors}
                        minDate={startDate || undefined}
                        bgmode="dark"
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {/* Start Time */}
                <Box sx={{ flex: "1", minWidth: "150px" }}>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <CustomTimePicker
                        label="Start Time"
                        placeholder="Select Start Time"
                        value={startTime}
                        onChange={(value) => {
                          setStartTime(value);
                          setValue("startTime", value?.format("HH:mm") || "");

                          // If both dates are the same and end time is before or equal to new start time, reset end time
                          if (
                            startDate &&
                            endDate &&
                            startDate.isSame(endDate, "day") &&
                            endTime &&
                            value &&
                            endTime.isSameOrBefore(value)
                          ) {
                            setEndTime(null);
                            setValue("endTime", "");
                          }
                        }}
                        errors={errors}
                        name="startTime"
                        clearErrors={clearErrors}
                        bgmode="dark"
                        selectedDate={startDate}
                      />
                    )}
                  />
                </Box>

                {/* End Time */}
                <Box sx={{ flex: "1", minWidth: "150px" }}>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <CustomTimePicker
                        label="End Time"
                        placeholder="Select End Time"
                        value={endTime}
                        onChange={(value) => {
                          setEndTime(value);
                          setValue("endTime", value?.format("HH:mm") || "");
                        }}
                        errors={errors}
                        name="endTime"
                        clearErrors={clearErrors}
                        bgmode="dark"
                        selectedDate={endDate}
                        minTime={
                          startDate &&
                          endDate &&
                          startDate.isSame(endDate, "day") &&
                          startTime
                            ? startTime.add(1, "minute") // End time must be at least 1 minute after start time
                            : endDate && endDate.isSame(dayjs(), "day")
                            ? dayjs()
                            : undefined
                        }
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Image Upload Field */}
              <Controller
                name="image"
                control={control}
                render={({ field, fieldState }) => (
                  <CustomFileUpload
                    label="Category Image "
                    name={field.name}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    value={field.value}
                    onChange={(file) => {
                      field.onChange(file);
                      setImageFile(file as File);
                      clearErrors("image");
                    }}
                    error={fieldState.error}
                  />
                )}
              />
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
                label={editMode ? "Update Category" : "Add Category"}
                btnSx={{ background: "var(--primary)", color: "var(--white)" }}
                onClick={handleSubmit(onsubmit)}
                disabled={loading}
              />
            </Box>
          </Box>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModalOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
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
                id="delete-modal-title"
                variant="h6"
                component="h2"
                sx={{ fontSize: "14px", fontFamily: "Medium_M" }}
              >
                Delete Category
              </Typography>
              <IconButton
                edge="end"
                aria-label="close"
                onClick={handleDeleteCancel}
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
            <Box sx={{ marginTop: "20px", marginBottom: "20px" }}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "14px",
                  fontFamily: "Regular_M",
                  color: "var(--title)",
                  textAlign: "center",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to delete this category?
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  fontFamily: "Regular_M",
                  color: "var(--greyText)",
                  textAlign: "center",
                  marginTop: "8px",
                }}
              >
                This action cannot be undone.
              </Typography>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                paddingTop: "12px",
              }}
            >
              <CustomButton
                type="button"
                variant="outlined"
                label="Cancel"
                btnSx={{
                  background: "transparent",
                  color: "var(--greyText)",
                  borderColor: "var(--borderColor)",
                  "&:hover": {
                    backgroundColor: "var(--toogleHover)",
                  },
                }}
                onClick={handleDeleteCancel}
              />
              <CustomButton
                type="button"
                variant="contained"
                label="Delete"
                btnSx={{
                  background: "#f44336",
                  color: "var(--white)",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  },
                }}
                onClick={handleDeleteConfirm}
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default Category;
