import {
  Box,
  IconButton,
  Modal,
  Typography,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import { X, Plus, MagnifyingGlass, WarningCircle, Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseSchema } from "../assets/Validation/Schema";
import CustomInput from "../Custom/CustomInput";
import CustomFileUpload from "../Custom/CustomFileUpload";
import CourseCard from "../Custom/CourseCard";
import {
  coursesDeleteApi,
  coursesUpdateApi,
  useCoursesAddApi,
  useGetCoursesApi,
  useCourseStatusToggleApi,
} from "../Hooks/courses";
import CustomSnackBar from "../Custom/CustomSnackBar";
import config from "../Config/Config";
import CourseSubmissionsList from "../Components/Admin/CourseSubmissionsList";
import LiveSessionsTab from "../Components/Admin/LiveSessionsTab";
import { getFromStorage } from "../utils/pwaUtils";

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

const textFieldDarkStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(15, 23, 42, 0.5)",
    color: "#f8fafc",
    borderRadius: "6px",
    "& fieldset": { borderColor: "rgba(71, 85, 105, 0.4)" },
    "&:hover fieldset": { borderColor: "rgba(71, 85, 105, 0.6)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
  },
  "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
};

const Courses = ({ activeSubTab = 0 }: { activeSubTab?: number }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const { data: courseGet } = useGetCoursesApi();
  const { mutate: courseAdd } = useCoursesAddApi();
  const { mutate: courseUpdate } = coursesUpdateApi();
  const { mutate: courseDelete } = coursesDeleteApi();
  const { mutate: courseToggleStatus } = useCourseStatusToggleApi();

  useEffect(() => {
    if (courseGet) {
      setCourses((courseGet as any)?.courses || []);
    }
  }, [courseGet]);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: zodResolver(CourseSchema),
  });

  const handleClose = () => {
    setOpen(false);
    setEditingCourse(null);
    reset({
      courseName: "",
      description: "",
      prize: "",
      duration: "",
      discount: "",
      thumbnail: "",
      showOnLandingPage: true,
      startDate: "",
      endDate: "",
      timing: "",
    });
  };

  const handleEdit = (id: any) => {
    const course = courses.find((c) => c._id === id);
    if (course) {
      setEditingCourse(course);
      reset({
        courseName: course.name || "",
        description: course.description || "",
        prize: course.price?.toString() || "",
        duration: course.duration || "",
        discount: course.discount?.toString() || "",
        thumbnail: course.fileupload ? { filename: course.fileupload, url: `/uploads/${course.fileupload}` } : "",
        showOnLandingPage: course.showOnLandingPage ?? true,
        startDate: course.startDate?.split?.("T")[0] || course.startDate || "",
        endDate: course.endDate?.split?.("T")[0] || course.endDate || "",
        timing: course.timing || "",
      });
      setOpen(true);
    }
  };

  const onsubmit = (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.courseName);
    formData.append("description", data.description);
    formData.append("price", data.prize);
    formData.append("duration", data.duration);
    formData.append("discount", data.discount);
    formData.append("showOnLandingPage", data.showOnLandingPage);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("timing", data.timing);

    if (data.thumbnail instanceof File) {
      formData.append("image", data.thumbnail);
    }

    if (editingCourse) {
      courseUpdate({ id: editingCourse._id, formData }, {
        onSuccess: () => { CustomSnackBar.successSnackbar("Course Updated!"); handleClose(); },
        onSettled: () => setLoading(false)
      });
    } else {
      courseAdd(formData, {
        onSuccess: () => { CustomSnackBar.successSnackbar("Course Added!"); handleClose(); },
        onSettled: () => setLoading(false)
      });
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If subTab is 1 (Submissions & Credentials), show submissions list
  if (activeSubTab === 1) {
    return <CourseSubmissionsList />;
  }

  // If subTab is 2 (Live Sessions), show live sessions tab
  if (activeSubTab === 2) {
    if (selectedCourse) {
      return (
        <LiveSessionsTab
          sessionType="COURSE"
          referenceId={selectedCourse._id}
          referenceName={selectedCourse.name}
          userName={getFromStorage("name") || "Admin"}
          userEmail={getFromStorage("email") || "admin@skillup.com"}
        />
      );
    }
    // Show course selector for live sessions
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px" }}>Select a Course</Typography>
            <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>Choose a course to manage its live sessions</Typography>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {courses.map((course: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course._id}>
              <Box
                onClick={() => setSelectedCourse(course)}
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid rgba(71, 85, 105, 0.4)",
                  borderRadius: "6px",
                  p: 2.5,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)" },
                }}
              >
                <Typography sx={{ color: "#f8fafc", fontWeight: 600, fontSize: "15px", mb: 0.5 }}>{course.name}</Typography>
                <Typography sx={{ color: "#64748b", fontSize: "12px" }}>{course.duration || "No duration set"}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Search and Add Button Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search courses by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <MagnifyingGlass size={18} style={{ color: "#64748b", marginRight: 12 }} /> }}
          sx={{ minWidth: 280, maxWidth: 400, ...textFieldDarkStyles }}
        />
        <Button
          variant="contained"
          startIcon={<Plus size={18} weight="bold" />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 2.5, py: 1, fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", "&:hover": { bgcolor: "#2563eb" } }}
        >
          Add Course
        </Button>
      </Box>

      {/* Course Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course._id}>
            <CourseCard
              id={course._id}
              courseName={course.name}
              description={course.description}
              duration={course.duration}
              prize={course.price}
              discount={course.discount}
              thumbnail={`${config.BASE_URL_MAIN}/uploads/${course.fileupload}`}
              status={course.status ? "Active" : "Inactive"}
              onEdit={handleEdit}
              onDelete={(id: string) => { setCourseToDelete(id); setDeleteModalOpen(true); }}
              onToggleStatus={(id: string) => courseToggleStatus(id)}
            />
          </Grid>
        ))}
        {filteredCourses.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ py: 10, textAlign: "center", border: "1px dashed rgba(71, 85, 105, 0.4)", borderRadius: "6px" }}>
              <WarningCircle size={48} weight="duotone" style={{ color: "#64748b", marginBottom: 16 }} />
              <Typography sx={{ color: "#94a3b8" }}>No courses found matching your search.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "16px", fontFamily: "'Chivo', sans-serif" }}>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
              <X size={20} />
            </IconButton>
          </Box>
          <Box component="form" onSubmit={handleSubmit(onsubmit)} sx={{ p: 2.5, maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>
            <CustomInput name="courseName" label="Course Name" type="text" placeholder="e.g., Full Stack Development" bgmode="dark" register={register} errors={errors} />
            <CustomInput name="description" label="Description" type="text" placeholder="Enter course description" bgmode="dark" register={register} errors={errors} />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="prize" label="Price (₹)" type="number" placeholder="999" bgmode="dark" register={register} errors={errors} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="discount" label="Discount (%)" type="number" placeholder="10" bgmode="dark" register={register} errors={errors} />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="duration" label="Duration" type="text" placeholder="3 Months" bgmode="dark" register={register} errors={errors} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="timing" label="Batches Timing" type="text" placeholder="Eve 6PM - 8PM" bgmode="dark" register={register} errors={errors} />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="startDate" label="Start Date" type="date" placeholder="YYYY-MM-DD" bgmode="dark" register={register} errors={errors} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomInput name="endDate" label="End Date" type="date" placeholder="YYYY-MM-DD" bgmode="dark" register={register} errors={errors} />
              </Box>
            </Box>

            <Controller
              name="thumbnail"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomFileUpload
                  label="Course Thumbnail"
                  name="thumbnail"
                  value={value}
                  onChange={onChange}
                  error={errors.thumbnail as any}
                />
              )}
            />

            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button onClick={handleClose} sx={{ color: "#94a3b8", fontWeight: 600, "&:hover": { color: "#f8fafc" } }}>Cancel</Button>
              <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: "#3b82f6", color: "#fff", px: 4, py: 1, borderRadius: "6px", fontWeight: 700, "&:hover": { bgcolor: "#2563eb" } }}>
                {loading ? "Saving..." : editingCourse ? "Update" : "Create"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box sx={{ ...style, width: 400, p: 4, textAlign: "center" }}>
          <Trash size={48} weight="duotone" style={{ color: "#ef4444", marginBottom: 16 }} />
          <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700, mb: 1 }}>Delete Course?</Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "14px", mb: 3 }}>This will permanently remove the course and all associated data. This action is irreversible.</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth onClick={() => setDeleteModalOpen(false)} sx={{ bgcolor: "#334155", color: "#f8fafc" }}>Cancel</Button>
            <Button fullWidth onClick={() => { courseDelete(courseToDelete!); setDeleteModalOpen(false); }} variant="contained" sx={{ bgcolor: "#ef4444", color: "#fff" }}>Delete</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Courses;
