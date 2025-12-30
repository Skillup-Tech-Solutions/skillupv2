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
  Button,
} from "@mui/material";
import CustomInput from "../Custom/CustomInput";
import CustomAutoComplete from "../Custom/CustomAutocomplete";
import CustomDatePicker from "../Custom/CustomDatePicker";
import CustomTimePicker from "../Custom/CustomTimePicker";
import CustomFileUpload from "../Custom/CustomFileUpload";
import { X, PencilSimple, Trash, Plus, MapPin, Tag, Clock, CalendarBlank, CurrencyInr } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema } from "../assets/Validation/Schema";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  useCategoryAddApi,
  useGetCategoryApi,
  useCategoryUpdateApi,
  useCategoryDeleteApi,
} from "../Hooks/category";
import CustomSnackBar from "../Custom/CustomSnackBar";
import config from "../Config/Config";

dayjs.extend(isSameOrBefore);

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "#1e293b",
  border: "1px solid rgba(71, 85, 105, 0.5)",
  borderRadius: "6px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  outline: "none",
  "@media (max-width: 600px)": {
    width: "90vw",
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
  const [loading, setLoading] = useState(false);

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
    setCategoryValue(null);
    setModeValue(null);
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const onsubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("category", categoryValue || "");
    formData.append("description", data.description);
    formData.append("mode", modeValue || "");
    formData.append("price", data.prize);
    formData.append("title", data.title);
    formData.append("venue", data.venue);

    if (data.image) {
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }
    }

    formData.append("startDate", startDate?.format("MM/DD/YYYY") || "");
    formData.append("endDate", endDate?.format("MM/DD/YYYY") || "");
    formData.append("endTime", endTime?.format("HH:mm") || "");
    formData.append("startTime", startTime?.format("HH:mm") || "");

    if (editMode && editingCategory) {
      categoryUpdate(
        { id: editingCategory._id, formData },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Category Updated!");
            handleClose();
          },
          onError: (error: any) => CustomSnackBar.errorSnackbar(error.message || "Error Updating."),
          onSettled: () => setLoading(false)
        }
      );
    } else {
      categoryAdd(formData, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Category Added!");
          handleClose();
        },
        onError: (error: any) => CustomSnackBar.errorSnackbar(error.message || "Error Adding."),
        onSettled: () => setLoading(false)
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditMode(true);
    setEditingCategory(category);
    setOpen(true);
    setCategoryValue(category.category);
    setModeValue(category.mode);
    setStartDate(dayjs(category.startDate));
    setEndDate(dayjs(category.endDate));
    setStartTime(dayjs(`2000-01-01 ${category.startTime}`));
    setEndTime(dayjs(`2000-01-01 ${category.endTime}`));
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
    setValue("image", category.image ? { filename: category.image, url: `/uploads/${category.image}` } : "");
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      categoryDelete(categoryToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Category Deleted!");
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        },
        onError: (error: any) => CustomSnackBar.errorSnackbar(error.message || "Error Deleting.")
      });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tag size={28} weight="duotone" style={{ color: "#3b82f6" }} />
          <Typography component="h1" sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} weight="bold" />}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "#3b82f6",
            color: "#fff",
            borderRadius: "6px",
            px: 2.5,
            py: 1,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            "&:hover": { bgcolor: "#2563eb" },
          }}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {getCategoriesData?.data?.map((category: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category._id}>
            <Card
              sx={{
                bgcolor: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                borderRadius: "6px",
                overflow: "hidden",
                transition: "all 0.2s ease",
                "&:hover": { transform: "translateY(-4px)", borderColor: "#3b82f6" },
              }}
            >
              {category.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`${config.BASE_URL_MAIN}/uploads/${category.image}`}
                  alt={category.title}
                />
              )}
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700, fontFamily: "'Chivo', sans-serif", fontSize: "16px" }}>
                    {category.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEdit(category)} sx={{ color: "#94a3b8", "&:hover": { color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
                      <PencilSimple size={18} weight="duotone" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setCategoryToDelete(category._id); setDeleteModalOpen(true); }} sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)" } }}>
                      <Trash size={18} weight="duotone" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography sx={{ color: "#94a3b8", fontSize: "12px", mb: 2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {category.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={category.category === "workShop" ? "Workshop" : "Internship"}
                    size="small"
                    sx={{ bgcolor: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", fontSize: "10px", fontWeight: 700 }}
                  />
                  <Chip
                    label={category.mode}
                    size="small"
                    sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", border: "1px solid rgba(139, 92, 246, 0.3)", fontSize: "10px", fontWeight: 700, textTransform: "capitalize" }}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: "auto" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                    <CurrencyInr size={14} weight="bold" />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#f1f5f9" }}>₹{category.price}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                    <MapPin size={14} weight="duotone" />
                    <Typography variant="caption" noWrap sx={{ color: "#f1f5f9" }}>{category.venue}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                    <CalendarBlank size={14} weight="duotone" />
                    <Typography variant="caption" sx={{ color: "#f1f5f9" }}>{dayjs(category.startDate).format("MMM DD")}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                    <Clock size={14} weight="duotone" />
                    <Typography variant="caption" sx={{ color: "#f1f5f9" }}>{category.startTime}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "16px", fontFamily: "'Chivo', sans-serif" }}>
              {editMode ? "Edit Category" : "Add New Category"}
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
              <X size={20} />
            </IconButton>
          </Box>
          <Box component="form" onSubmit={handleSubmit(onsubmit)} sx={{ p: 2.5, maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="category"
              control={control}
              render={() => (
                <CustomAutoComplete
                  options={categoryOptions}
                  label="Category"
                  placeholder="Select Category"
                  value={categoryValue}
                  onValueChange={(val) => { setCategoryValue(val as string); setValue("category", val as string); clearErrors("category"); }}
                  errors={errors}
                  name="category"
                  register={register}
                />
              )}
            />
            <CustomInput name="title" label="Title" type="text" placeholder="Enter title" bgmode="dark" register={register} errors={errors} />
            <CustomInput name="description" label="Description" type="text" placeholder="Enter description" bgmode="dark" register={register} errors={errors} />
            <CustomInput name="prize" label="Price" type="number" placeholder="Enter price" bgmode="dark" register={register} errors={errors} />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="mode"
                  control={control}
                  render={() => (
                    <CustomAutoComplete
                      options={modeOptions}
                      label="Mode"
                      placeholder="Select Mode"
                      value={modeValue}
                      onValueChange={(val) => { setModeValue(val as string); setValue("mode", val as string); clearErrors("mode"); }}
                      errors={errors}
                      name="mode"
                      register={register}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="venue" label="Venue" type="text" placeholder="Enter venue" bgmode="dark" register={register} errors={errors} />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker label="Start Date" value={startDate} onChange={(val) => { setStartDate(val); if (val) setValue("startDate", val.toDate()); }} errors={errors} name="startDate" clearErrors={clearErrors} bgmode="dark" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker label="End Date" value={endDate} onChange={(val) => { setEndDate(val); if (val) setValue("endDate", val.toDate()); }} errors={errors} name="endDate" clearErrors={clearErrors} bgmode="dark" />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomTimePicker label="Start Time" value={startTime} onChange={(val) => { setStartTime(val); if (val) setValue("startTime", val.format("HH:mm")); }} errors={errors} name="startTime" clearErrors={clearErrors} bgmode="dark" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomTimePicker label="End Time" value={endTime} onChange={(val) => { setEndTime(val); if (val) setValue("endTime", val.format("HH:mm")); }} errors={errors} name="endTime" clearErrors={clearErrors} bgmode="dark" />
              </Box>
            </Box>

            <Controller
              name="image"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomFileUpload
                  label="Category Image"
                  name="image"
                  value={value}
                  onChange={onChange}
                  error={errors.image as any}
                />
              )}
            />

            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button onClick={handleClose} sx={{ color: "#94a3b8", fontWeight: 600, "&:hover": { color: "#f8fafc" } }}>Cancel</Button>
              <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: "#3b82f6", color: "#fff", px: 4, py: 1, borderRadius: "6px", fontWeight: 700, "&:hover": { bgcolor: "#2563eb" } }}>
                {loading ? "Saving..." : editMode ? "Update" : "Create"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box sx={{ ...style, width: 400, p: 3, textAlign: "center" }}>
          <Trash size={48} weight="duotone" style={{ color: "#ef4444", marginBottom: 16 }} />
          <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700, mb: 1 }}>Delete Category?</Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "14px", mb: 3 }}>This action cannot be undone and will remove all related data.</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth onClick={() => setDeleteModalOpen(false)} sx={{ bgcolor: "#334155", color: "#f8fafc", py: 1, "&:hover": { bgcolor: "#475569" } }}>Cancel</Button>
            <Button fullWidth onClick={handleDeleteConfirm} variant="contained" sx={{ bgcolor: "#ef4444", color: "#fff", py: 1, "&:hover": { bgcolor: "#dc2626" } }}>Delete</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Category;
