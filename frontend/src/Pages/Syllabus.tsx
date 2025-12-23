import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdEdit, MdDeleteOutline, MdExpandMore } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomButton from "../Custom/CustomButton";
import CustomInput from "../Custom/CustomInput";
import CustomAutoComplete from "../Custom/CustomAutocomplete";
import CustomSnackBar from "../Custom/CustomSnackBar";
import {
  lessonUpdateApi,
  SyllabusDeleteApi,
  useGetCoursesApi,
  useGetLessonApi,
  useSyllabusAddApi,
} from "../Hooks/courses";

// Validation schemas
const syllabusSchema = z.object({
  course: z.string().min(1, "Course selection is required"),
});

const unitSchema = z.object({
  unitName: z.string().min(1, "Unit name is required"),
  unitDescription: z.string().optional(),
});

const lessonSchema = z.object({
  lessonName: z.string().min(1, "Lesson name is required"),
  lessonDescription: z.string().optional(),
});

// Interfaces
interface Lesson {
  id: string;
  lessonName: string;
  lessonDescription?: string;
}

interface Unit {
  id: string;
  unitName: string;
  unitDescription?: string;
  lessons: Lesson[];
}

interface SyllabusData {
  id: string;
  course: string;
  courseName: string;
  units: Unit[];
  status: "Active" | "InActive";
}

// Modal styles
const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  padding: "20px",
  maxHeight: "90vh",
  overflowY: "auto",
  "@media (max-width: 768px)": {
    width: "95vw",
    padding: "16px",
    maxHeight: "95vh",
  },
};

const smallModalStyle = {
  ...modalStyle,
  width: 500,
  "@media (max-width: 768px)": {
    width: "95vw",
    padding: "16px",
  },
};

const Syllabus: React.FC = () => {
  const { data: coursesData } = useGetCoursesApi();
  const { data: lessonData } = useGetLessonApi();
  const { mutate: lessonDelete } = SyllabusDeleteApi();
  const { mutate: lessonUpdate } = lessonUpdateApi();
  const [loading, setLoading] = useState(false);
  // Transform API data to match our interface
  const transformedSyllabusData: SyllabusData[] =
    lessonData && Array.isArray(lessonData)
      ? lessonData.map((item: any) => ({
          id: item._id,
          course: item.courseId._id,
          courseName: item.courseId.name,
          status: "Active", // You can add status field to your API response if needed
          units: (item.units || []).map((unit: any) => ({
            id: unit._id,
            unitName: unit.unitName,
            unitDescription: unit.unitDescription || "",
            lessons: (unit.lessons || []).map((lesson: any) => ({
              id: lesson._id || `lesson-${Date.now()}-${Math.random()}`, // fallback if lesson doesn't have _id
              lessonName:
                lesson.title || lesson.lessonName || "Untitled Lesson",
              lessonDescription:
                lesson.description || lesson.lessonDescription || "",
            })),
          })),
        }))
      : [];

  // Main state
  const [syllabusData, setSyllabusData] = useState<SyllabusData[]>(
    transformedSyllabusData
  );

  // Update syllabusData when lessonData changes
  useEffect(() => {
    if (lessonData && Array.isArray(lessonData)) {
      const transformedData: SyllabusData[] = lessonData.map((item: any) => ({
        id: item._id,
        course: item.courseId._id,
        courseName: item.courseId.name,
        status: "Active", // You can add status field to your API response if needed
        units: (item.units || []).map((unit: any) => ({
          id: unit._id,
          unitName: unit.unitName,
          unitDescription: unit.unitDescription || "",
          lessons: (unit.lessons || []).map((lesson: any) => ({
            id: lesson._id || `lesson-${Date.now()}-${Math.random()}`, // fallback if lesson doesn't have _id
            lessonName: lesson.title || lesson.lessonName || "Untitled Lesson",
            lessonDescription:
              lesson.description || lesson.lessonDescription || "",
          })),
        })),
      }));
      setSyllabusData(transformedData);
    }
  }, [lessonData]);
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusData | null>(
    null
  );

  // Form states
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [expandedUnit, setExpandedUnit] = useState<string | false>(false);

  // Unit/Lesson modal states
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson;
    unitId: string;
  } | null>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string>("");

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [syllabusToDelete, setSyllabusToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "unit" | "lesson";
    id: string;
    unitId?: string;
  } | null>(null);

  // Course options
  const courseOptions =
    coursesData?.courses?.map((course: any) => ({
      label: course.name,
      value: course._id,
    })) || [];

  // Forms
  const mainForm = useForm({
    resolver: zodResolver(syllabusSchema),
  });

  const unitForm = useForm({
    resolver: zodResolver(unitSchema),
  });

  const lessonForm = useForm({
    resolver: zodResolver(lessonSchema),
  });

  // Main modal handlers
  const handleOpenMainModal = () => {
    setMainModalOpen(true);
    setIsEditMode(false);
    setEditingSyllabus(null);
    setSelectedCourse("");
    setUnits([]);
    setExpandedUnit(false);
    mainForm.reset({
      course: "",
    });
  };

  const handleCloseMainModal = () => {
    setMainModalOpen(false);
    setIsEditMode(false);
    setEditingSyllabus(null);
    setSelectedCourse("");
    setUnits([]);
    setExpandedUnit(false);
    mainForm.reset({
      course: "",
    });
  };

  const handleEdit = (syllabus: SyllabusData) => {
    setIsEditMode(true);
    setEditingSyllabus(syllabus);
    setSelectedCourse(syllabus.course);
    setUnits(syllabus.units);
    setMainModalOpen(true);
    mainForm.reset({ course: syllabus.course });
  };

  const handleStatusToggle = (syllabus: SyllabusData) => {
    setSyllabusData((prev) =>
      prev.map((item) =>
        item.id === syllabus.id
          ? {
              ...item,
              status: item.status === "Active" ? "InActive" : "Active",
            }
          : item
      )
    );
    CustomSnackBar.successSnackbar("Status updated successfully!");
  };

  // Unit handlers
  const handleAddUnit = () => {
    if (!selectedCourse) {
      CustomSnackBar.errorSnackbar("Please select a course first!");
      return;
    }
    setEditingUnit(null);
    unitForm.reset({
      unitName: "",
    });
    setUnitModalOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    unitForm.reset({
      unitName: unit.unitName,
    });
    setUnitModalOpen(true);
  };

  const handleUnitSubmit = (data: any) => {
    console.log(data);

    if (editingUnit) {
      // Update existing unit
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === editingUnit.id
            ? {
                ...unit,
                unitName: data.unitName,
                unitDescription: data.unitDescription,
              }
            : unit
        )
      );
      CustomSnackBar.successSnackbar("Unit updated successfully!");
    } else {
      // Add new unit
      const newUnit: Unit = {
        id: Date.now().toString(),
        unitName: data.unitName,
        unitDescription: data.unitDescription,
        lessons: [],
      };
      setUnits((prev) => [...prev, newUnit]);
      CustomSnackBar.successSnackbar("Unit added successfully!");
    }
    setUnitModalOpen(false);
    setEditingUnit(null);
    unitForm.reset({
      unitName: "",
    });
  };

  // Lesson handlers
  const handleAddLesson = (unitId: string) => {
    setCurrentUnitId(unitId);
    setEditingLesson(null);
    lessonForm.reset({
      lessonName: "",
    });
    setLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: Lesson, unitId: string) => {
    setCurrentUnitId(unitId);
    setEditingLesson({ lesson, unitId });
    lessonForm.reset({
      lessonName: lesson.lessonName,
      lessonDescription: lesson.lessonDescription || "",
    });
    setLessonModalOpen(true);
  };

  const handleLessonSubmit = (data: any) => {
    if (editingLesson) {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === currentUnitId
            ? {
                ...unit,
                lessons: unit.lessons.map((lesson) =>
                  lesson.id === editingLesson.lesson.id
                    ? { ...lesson, ...data }
                    : lesson
                ),
              }
            : unit
        )
      );
      CustomSnackBar.successSnackbar("Lesson updated successfully!");
    } else {
      // Add new lesson
      const newLesson: Lesson = {
        id: Date.now().toString(),
        ...data,
      };
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === currentUnitId
            ? { ...unit, lessons: [...unit.lessons, newLesson] }
            : unit
        )
      );
      CustomSnackBar.successSnackbar("Lesson added successfully!");
    }
    setLessonModalOpen(false);
    setEditingLesson(null);
    setCurrentUnitId("");
    lessonForm.reset({
      lessonName: "",
    });
  };

  // Delete handlers
  const handleDeleteSyllabus = (id: string) => {
    setSyllabusToDelete(id);
    setDeleteModalOpen(true);
    console.log(syllabusToDelete, "ddd");
  };

  const handleConfirmDeleteSyllabus = () => {
    if (syllabusToDelete) {
      lessonDelete(syllabusToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Deleted Successfully!");
          setDeleteModalOpen(false);
          setSyllabusToDelete(null);
        },
        onError: (error: any) => {
          CustomSnackBar.errorSnackbar("Failed to delete Syllabus!");
          setDeleteModalOpen(false);
          setSyllabusToDelete(null);
        },
      });
    }
  };

  const handleDeleteItem = (
    type: "unit" | "lesson",
    id: string,
    unitId?: string
  ) => {
    setItemToDelete({ type, id, unitId });
  };

  const handleConfirmDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "unit") {
      setUnits((prev) => prev.filter((unit) => unit.id !== itemToDelete.id));
      CustomSnackBar.successSnackbar("Unit deleted successfully!");
    } else if (itemToDelete.type === "lesson" && itemToDelete.unitId) {
      // Check if this is the last lesson in the unit
      const unit = units.find((u) => u.id === itemToDelete.unitId);
      if (unit && unit.lessons.length === 1) {
        CustomSnackBar.errorSnackbar(
          "Cannot delete the last lesson. Each unit must have at least one lesson!"
        );
        setItemToDelete(null);
        return;
      }

      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === itemToDelete.unitId
            ? {
                ...unit,
                lessons: unit.lessons.filter(
                  (lesson) => lesson.id !== itemToDelete.id
                ),
              }
            : unit
        )
      );
      CustomSnackBar.successSnackbar("Lesson deleted successfully!");
    }

    setItemToDelete(null);
  };
  const { mutate: createSyllabus } = useSyllabusAddApi();
  // Main form submit
  const handleMainSubmit = (data: any) => {
    if (units.length === 0) {
      CustomSnackBar.errorSnackbar("Please add at least one unit!");
      return;
    }

    // Validate that each unit has at least one lesson
    const unitsWithoutLessons = units.filter(
      (unit) => unit.lessons.length === 0
    );
    if (unitsWithoutLessons.length > 0) {
      const unitNames = unitsWithoutLessons
        .map((unit) => unit.unitName)
        .join(", ");
      CustomSnackBar.errorSnackbar(
        `Each unit must have at least one lesson. Units without lessons: ${unitNames}`
      );
      return;
    }
    setLoading(true);

    const syllabusPayload = {
      courseId: selectedCourse,
      units: units.map((unit) => ({
        unitName: unit.unitName,
        lessons: unit.lessons.map((lesson) => ({
          title: lesson.lessonName,
        })),
      })),
    };

    const selectedCourseData = coursesData?.courses?.find(
      (course: any) => course._id === selectedCourse
    );

    const newSyllabus: SyllabusData = {
      id: isEditMode ? editingSyllabus!.id : Date.now().toString(),
      course: selectedCourse,
      courseName: selectedCourseData?.name || "",
      units: units,
      status: isEditMode ? editingSyllabus!.status : "Active",
    };

    if (isEditMode) {
      lessonUpdate(
        { id: editingSyllabus!.id, formData: syllabusPayload },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Syllabus Updated Successfully!");
            handleCloseMainModal();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(
              error.message || "Error Updating Syllabus."
            );
          },
          onSettled: () => {
            setLoading(false);
          },
        }
      );
    } else {
      createSyllabus(syllabusPayload, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Syllabus Added Successfully!");
          handleCloseMainModal();
        },
        onError: (error) => {
          CustomSnackBar.errorSnackbar(
            error.message || "Error Adding Syllabus."
          );
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "S.No",
      width: 80,
      renderCell: (params) => {
        const index = syllabusData.findIndex(
          (item) => item.id === params.row.id
        );
        return index + 1;
      },
    },
    {
      field: "courseName",
      headerName: "Course Name",
      width: 200,
      flex: 1,
    },
    {
      field: "unitsCount",
      headerName: "Units",
      width: 100,
      renderCell: (params) => params.row.units?.length || 0,
    },
    {
      field: "lessonsCount",
      headerName: "Lessons",
      width: 100,
      renderCell: (params) => {
        const totalLessons =
          params.row.units?.reduce(
            (total: number, unit: Unit) => total + (unit.lessons?.length || 0),
            0
          ) || 0;
        return totalLessons;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: "8px" }}>
          <IconButton
            onClick={() => handleEdit(params.row)}
            sx={{ "& svg": { color: "var(--primary)", fontSize: "18px" } }}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteSyllabus(params.row.id)}
            sx={{ "& svg": { color: "var(--red)", fontSize: "18px" } }}
          >
            <MdDeleteOutline />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          mb: 3,
        }}
      >
        <CustomButton
          type="button"
          label="Add Syllabus"
          variant="contained"
          btnSx={{
            background: "var(--primary)",
            color: "var(--white)",
            width: "max-content",
          }}
          onClick={handleOpenMainModal}
        />
      </Box>

      {/* DataGrid */}
      <Box className="Submitted_form_table">
        {!lessonData ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              border: "1px solid var(--lightGrey)",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body1" sx={{ color: "var(--greyText)" }}>
              Loading syllabus data...
            </Typography>
          </Box>
        ) : syllabusData.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              border: "1px solid var(--lightGrey)",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body1" sx={{ color: "var(--greyText)" }}>
              No syllabus data found. Click "Add Syllabus" to create one.
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={syllabusData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            className="table_border"
            autoHeight
          />
        )}
      </Box>

      {/* Main Syllabus Modal */}
      <Modal open={mainModalOpen} onClose={handleCloseMainModal}>
        <Box sx={modalStyle}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontFamily: "SemiBold_M", fontSize: "16px" }}
            >
              {isEditMode ? "Edit Syllabus" : "Add Syllabus"}
            </Typography>
            <IconButton
              onClick={handleCloseMainModal}
              sx={{
                "& svg": {
                  color: "var(--primary)",
                  fontSize: "16px",
                },
              }}
            >
              <IoClose />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form */}
          <Box
            component="form"
            onSubmit={mainForm.handleSubmit(handleMainSubmit)}
          >
            {/* Course Selection */}
            <Box sx={{ mb: 3 }}>
              <CustomAutoComplete
                options={courseOptions}
                label="Select Course"
                name="course"
                placeholder="Choose a course"
                multiple={false}
                value={selectedCourse}
                errors={mainForm.formState.errors}
                onValueChange={(value: string | string[] | null) => {
                  const courseValue =
                    typeof value === "string" ? value : value?.[0] || "";
                  setSelectedCourse(courseValue);
                  mainForm.setValue("course", courseValue);
                  mainForm.clearErrors("course");
                  if (!isEditMode) {
                    setUnits([]);
                  }
                }}
                boxSx={{ width: "100%" }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Units Section */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "SemiBold_M", fontSize: "12px" }}
                >
                  Units ({units.length})
                </Typography>
                <CustomButton
                  type="button"
                  label="Add Unit"
                  variant="outlined"
                  btnSx={{
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                    padding: "6px 16px",
                    width: "max-content",
                    fontFamily: "SemiBold_M",
                    fontSize: "12px",
                  }}
                  onClick={handleAddUnit}
                />
              </Box>

              {units.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--greyText)",
                    border: "1px dashed var(--greyText)",
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="body1">No units added yet</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedCourse
                      ? "Click 'Add Unit' to get started"
                      : "Please select a course first"}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                  {units.map((unit) => (
                    <Accordion
                      key={unit.id}
                      expanded={expandedUnit === unit.id}
                      onChange={(_, isExpanded) =>
                        setExpandedUnit(isExpanded ? unit.id : false)
                      }
                      sx={{
                        mb: 1,
                        border: "1px solid var(--lightGrey)",
                        borderRadius: "8px !important",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<MdExpandMore />}
                        sx={{
                          backgroundColor: "var(--lightGrey)",
                          borderRadius: "8px",
                          "& .MuiAccordionSummary-content": {
                            alignItems: "center",
                            justifyContent: "space-between",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flex: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "600" }}
                          >
                            {unit.unitName}
                          </Typography>
                          {unit.unitDescription && (
                            <Typography
                              variant="body2"
                              sx={{ color: "var(--greyText)" }}
                            >
                              - {unit.unitDescription}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{ display: "flex", gap: 1 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEditUnit(unit)}
                            sx={{
                              "& svg": {
                                color: "var(--primary)",
                                fontSize: "16px",
                              },
                            }}
                          >
                            <MdEdit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem("unit", unit.id)}
                            sx={{
                              "& svg": {
                                color: "var(--red)",
                                fontSize: "16px",
                              },
                            }}
                          >
                            <MdDeleteOutline />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontFamily: "SemiBold_M", fontSize: "12px" }}
                          >
                            Lessons ({unit.lessons.length})
                          </Typography>
                          <CustomButton
                            type="button"
                            label="Add Lesson"
                            variant="outlined"
                            btnSx={{
                              borderColor: "var(--primary)",
                              color: "var(--primary)",
                              fontSize: "11px",
                              padding: "4px 12px",
                              width: "max-content",
                            }}
                            onClick={() => handleAddLesson(unit.id)}
                          />
                        </Box>

                        {unit.lessons.length === 0 ? (
                          <Box
                            sx={{
                              textAlign: "center",
                              padding: "20px",
                              color: "var(--greyText)",
                              border: "1px dashed var(--greyText)",
                              borderRadius: "4px",
                            }}
                          >
                            <Typography variant="body2">
                              No lessons added yet
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {unit.lessons.map((lesson, index) => (
                              <Box
                                key={lesson.id}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "12px",
                                  border: "1px solid var(--lightGrey)",
                                  borderRadius: "4px",
                                  backgroundColor: "var(--white)",
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "500" }}
                                  >
                                    {index + 1}. {lesson.lessonName}
                                  </Typography>
                                  {lesson.lessonDescription && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "var(--greyText)",
                                        display: "block",
                                      }}
                                    >
                                      {lesson.lessonDescription}
                                    </Typography>
                                  )}
                                </Box>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEditLesson(lesson, unit.id)
                                    }
                                    sx={{
                                      "& svg": {
                                        color: "var(--primary)",
                                        fontSize: "14px",
                                      },
                                    }}
                                  >
                                    <MdEdit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteItem(
                                        "lesson",
                                        lesson.id,
                                        unit.id
                                      )
                                    }
                                    sx={{
                                      "& svg": {
                                        color: "var(--red)",
                                        fontSize: "14px",
                                      },
                                    }}
                                  >
                                    <MdDeleteOutline />
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <CustomButton
                type="button"
                label="Cancel"
                variant="outlined"
                btnSx={{
                  color: "var(--greyText)",
                  borderColor: "var(--greyText)",
                }}
                onClick={handleCloseMainModal}
              />
              <CustomButton
                type="submit"
                label={isEditMode ? "Update Syllabus" : "Add Syllabus"}
                variant="contained"
                btnSx={{ background: "var(--primary)", color: "var(--white)" }}
                disabled={loading}
              />
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Unit Modal */}
      <Modal open={unitModalOpen} onClose={() => setUnitModalOpen(false)}>
        <Box sx={smallModalStyle}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontFamily: "SemiBold_M", fontSize: "14px" }}
            >
              {editingUnit ? "Edit Unit" : "Add Unit"}
            </Typography>
            <IconButton
              onClick={() => setUnitModalOpen(false)}
              sx={{
                "&   svg": {
                  color: "var(--primary)",
                  fontSize: "15px",
                  width: "max-content",
                },
              }}
            >
              <IoClose />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            onSubmit={unitForm.handleSubmit(handleUnitSubmit)}
          >
            <CustomInput
              name="unitName"
              placeholder="Enter unit name"
              label="Unit Name"
              type="text"
              bgmode="dark"
              register={unitForm.register}
              errors={unitForm.formState.errors}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <CustomButton
                type="button"
                label="Cancel"
                variant="outlined"
                btnSx={{
                  color: "var(--greyText)",
                  borderColor: "var(--greyText)",
                }}
                onClick={() => setUnitModalOpen(false)}
              />
              <CustomButton
                type="submit"
                label={editingUnit ? "Update Unit" : "Add Unit"}
                variant="contained"
                btnSx={{ background: "var(--primary)", color: "var(--white)" }}
              />
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Lesson Modal */}
      <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
        <Box sx={smallModalStyle}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontFamily: "SemiBold_M", fontSize: "14px" }}
            >
              {editingLesson ? "Edit Lesson" : "Add Lesson"}
            </Typography>
            <IconButton
              onClick={() => setLessonModalOpen(false)}
              sx={{
                "& svg": {
                  color: "var(--primary)",
                  fontSize: "16px",
                },
              }}
            >
              <IoClose />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            onSubmit={lessonForm.handleSubmit(handleLessonSubmit)}
          >
            <CustomInput
              name="lessonName"
              placeholder="Enter lesson name"
              label="Lesson Name"
              type="text"
              bgmode="dark"
              register={lessonForm.register}
              errors={lessonForm.formState.errors}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <CustomButton
                type="button"
                label="Cancel"
                variant="outlined"
                btnSx={{
                  color: "var(--greyText)",
                  borderColor: "var(--greyText)",
                }}
                onClick={() => setLessonModalOpen(false)}
              />
              <CustomButton
                type="submit"
                label={editingLesson ? "Update Lesson" : "Add Lesson"}
                variant="contained"
                btnSx={{ background: "var(--primary)", color: "var(--white)" }}
              />
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Syllabus Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ textAlign: "center", color: "var(--red)", fontWeight: "600" }}
        >
          Delete Syllabus
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#666", mb: 1 }}>
            Are you sure you want to delete this syllabus?
          </Typography>
          <Typography sx={{ color: "#999", fontSize: "0.875rem" }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            variant="outlined"
            sx={{ color: "#666", borderColor: "#ddd" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteSyllabus}
            variant="contained"
            sx={{ backgroundColor: "var(--red)" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Unit/Lesson Confirmation Dialog */}
      {itemToDelete && (
        <Dialog
          open={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{ textAlign: "center", color: "var(--red)", fontWeight: "600" }}
          >
            Delete {itemToDelete.type === "unit" ? "Unit" : "Lesson"}
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#666", mb: 1 }}>
              Are you sure you want to delete this {itemToDelete.type}?
            </Typography>
            <Typography sx={{ color: "#999", fontSize: "0.875rem" }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
            <Button
              onClick={() => setItemToDelete(null)}
              variant="outlined"
              sx={{ color: "#666", borderColor: "#ddd" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeleteItem}
              variant="contained"
              sx={{ backgroundColor: "var(--red)" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Syllabus;
