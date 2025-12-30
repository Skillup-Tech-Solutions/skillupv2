import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  PencilSimple,
  Trash,
  CaretDown,
  X,
  Plus,
  BookOpen,
  Layout
} from "@phosphor-icons/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  bgcolor: "#1e293b",
  border: "1px solid rgba(71, 85, 105, 0.5)",
  borderRadius: "6px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  padding: "24px",
  maxHeight: "90vh",
  overflowY: "auto",
  outline: "none",
  "@media (max-width: 768px)": {
    width: "95vw",
  },
};

const smallModalStyle = {
  ...modalStyle,
  width: 500,
};

const Syllabus: React.FC = () => {
  const { data: coursesData } = useGetCoursesApi();
  const { data: lessonData } = useGetLessonApi();
  const { mutate: lessonDelete } = SyllabusDeleteApi();
  const { mutate: lessonUpdate } = lessonUpdateApi();
  const { mutate: createSyllabus } = useSyllabusAddApi();
  const [loading, setLoading] = useState(false);

  const [syllabusData, setSyllabusData] = useState<SyllabusData[]>([]);

  useEffect(() => {
    if (lessonData && Array.isArray(lessonData)) {
      const transformedData: SyllabusData[] = lessonData.map((item: any) => ({
        id: item._id,
        course: item.courseId?._id || "",
        courseName: item.courseId?.name || "Unknown Course",
        status: "Active",
        units: (item.units || []).map((unit: any) => ({
          id: unit._id,
          unitName: unit.unitName,
          unitDescription: unit.unitDescription || "",
          lessons: (unit.lessons || []).map((lesson: any) => ({
            id: lesson._id || `lesson-${Math.random()}`,
            lessonName: lesson.title || lesson.lessonName || "Untitled Lesson",
            lessonDescription: lesson.description || lesson.lessonDescription || "",
          })),
        })),
      }));
      setSyllabusData(transformedData);
    }
  }, [lessonData]);

  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusData | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [expandedUnit, setExpandedUnit] = useState<string | false>(false);

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; unitId: string } | null>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string>("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [syllabusToDelete, setSyllabusToDelete] = useState<string | null>(null);

  const courseOptions = useMemo(() => {
    return (coursesData as any)?.courses?.map((course: any) => ({
      label: course.name,
      value: course._id,
    })) || [];
  }, [coursesData]);

  const mainForm = useForm({ resolver: zodResolver(syllabusSchema) });
  const unitForm = useForm({ resolver: zodResolver(unitSchema) });
  const lessonForm = useForm({ resolver: zodResolver(lessonSchema) });

  const handleOpenMainModal = () => {
    setMainModalOpen(true);
    setIsEditMode(false);
    setSelectedCourse("");
    setUnits([]);
    mainForm.reset({ course: "" });
  };

  const handleEdit = (syllabus: SyllabusData) => {
    setIsEditMode(true);
    setEditingSyllabus(syllabus);
    setSelectedCourse(syllabus.course);
    setUnits(syllabus.units);
    setMainModalOpen(true);
    mainForm.reset({ course: syllabus.course });
  };

  const handleUnitSubmit = (data: any) => {
    if (editingUnit) {
      setUnits((prev) => prev.map((u) => u.id === editingUnit.id ? { ...u, ...data } : u));
      CustomSnackBar.successSnackbar("Unit updated!");
    } else {
      setUnits((prev) => [...prev, { id: Date.now().toString(), ...data, lessons: [] }]);
      CustomSnackBar.successSnackbar("Unit added!");
    }
    setUnitModalOpen(false);
  };

  const handleLessonSubmit = (data: any) => {
    if (editingLesson) {
      setUnits((prev) => prev.map((u) => u.id === currentUnitId ? { ...u, lessons: u.lessons.map((l) => l.id === editingLesson.lesson.id ? { ...l, ...data } : l) } : u));
      CustomSnackBar.successSnackbar("Lesson updated!");
    } else {
      setUnits((prev) => prev.map((u) => u.id === currentUnitId ? { ...u, lessons: [...u.lessons, { id: Date.now().toString(), ...data }] } : u));
      CustomSnackBar.successSnackbar("Lesson added!");
    }
    setLessonModalOpen(false);
  };

  const handleMainSubmit = (data: any) => {
    if (units.length === 0) {
      CustomSnackBar.errorSnackbar("Add at least one unit!");
      return;
    }
    const invalidUnit = units.find(u => u.lessons.length === 0);
    if (invalidUnit) {
      CustomSnackBar.errorSnackbar(`Unit "${invalidUnit.unitName}" has no lessons!`);
      return;
    }
    setLoading(true);

    const payload = {
      courseId: data.course,
      units: units.map(u => ({
        unitName: u.unitName,
        lessons: u.lessons.map(l => ({ title: l.lessonName })),
      })),
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));

    if (isEditMode) {
      lessonUpdate({ id: editingSyllabus!.id, formData: formData as any }, {
        onSuccess: () => { CustomSnackBar.successSnackbar("Syllabus Updated!"); setMainModalOpen(false); },
        onSettled: () => setLoading(false)
      });
    } else {
      createSyllabus(formData, {
        onSuccess: () => { CustomSnackBar.successSnackbar("Syllabus Created!"); setMainModalOpen(false); },
        onSettled: () => setLoading(false)
      });
    }
  };

  const columns: GridColDef[] = [
    { field: "sno", headerName: "S.NO", width: 80, renderCell: (p) => syllabusData.findIndex(x => x.id === p.row.id) + 1 },
    { field: "courseName", headerName: "COURSE NAME", flex: 1, renderCell: (p) => <Typography sx={{ fontWeight: 600, color: "#f8fafc" }}>{p.value}</Typography> },
    { field: "unitsCount", headerName: "UNITS", width: 100, renderCell: (p) => p.row.units?.length || 0 },
    { field: "lessonsCount", headerName: "LESSONS", width: 100, renderCell: (p) => p.row.units?.reduce((a: number, b: Unit) => a + b.lessons.length, 0) || 0 },
    {
      field: "actions", headerName: "ACTIONS", width: 120, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => handleEdit(p.row)} sx={{ color: "#94a3b8", "&:hover": { color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
            <PencilSimple size={18} weight="duotone" />
          </IconButton>
          <IconButton onClick={() => { setSyllabusToDelete(p.row.id); setDeleteModalOpen(true); }} sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)" } }}>
            <Trash size={18} weight="duotone" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <BookOpen size={28} weight="duotone" style={{ color: "#3b82f6" }} />
          <Typography sx={{ fontSize: "24px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Syllabus Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} weight="bold" />} onClick={handleOpenMainModal}
          sx={{ bgcolor: "#3b82f6", color: "#fff", borderRadius: "6px", px: 2.5, py: 1, fontWeight: 600, textTransform: "uppercase", "&:hover": { bgcolor: "#2563eb" } }}>
          Add Syllabus
        </Button>
      </Box>

      <Box>
        <DataGrid
          rows={syllabusData}
          columns={columns}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 20]}
          autoHeight
          disableRowSelectionOnClick
          className="table_border"
          sx={{
            bgcolor: "rgba(30, 41, 59, 0.4)",
            border: "1px solid rgba(71, 85, 105, 0.6)",
            borderRadius: "6px",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "rgba(15, 23, 42, 0.8)", borderColor: "rgba(71, 85, 105, 0.4)" },
            "& .MuiDataGrid-cell": { borderColor: "rgba(71, 85, 105, 0.4)", color: "#f8fafc" },
            "& .MuiDataGrid-row:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" }
          }}
        />
      </Box>

      {/* Main Syllabus Modal */}
      <Modal open={mainModalOpen} onClose={() => setMainModalOpen(false)}>
        <Box sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, pb: 2, borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
            <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700, fontFamily: "'Chivo', sans-serif" }}>
              {isEditMode ? "Edit Syllabus" : "Create New Syllabus"}
            </Typography>
            <IconButton onClick={() => setMainModalOpen(false)} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box component="form" onSubmit={mainForm.handleSubmit(handleMainSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Controller
              name="course"
              control={mainForm.control}
              render={() => (
                <CustomAutoComplete
                  options={courseOptions}
                  label="Target Course"
                  placeholder="Select a course to bind syllabus"
                  value={selectedCourse}
                  onValueChange={(val) => { setSelectedCourse(val as string); mainForm.setValue("course", val as string); }}
                  errors={mainForm.formState.errors}
                  name="course"
                  register={mainForm.register}
                />
              )}
            />

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "14px", fontFamily: "'JetBrains Mono', monospace" }}>
                  UNITS ({units.length})
                </Typography>
                <Button size="small" startIcon={<Plus size={14} />} onClick={() => { setEditingUnit(null); unitForm.reset({ unitName: "" }); setUnitModalOpen(true); }}
                  sx={{ color: "#3b82f6", textTransform: "none", fontWeight: 700 }}>
                  Add Unit
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {units.map((unit) => (
                  <Accordion
                    key={unit.id}
                    expanded={expandedUnit === unit.id}
                    onChange={(_, ex) => setExpandedUnit(ex ? unit.id : false)}
                    sx={{
                      bgcolor: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(71, 85, 105, 0.4)",
                      borderRadius: "6px !important",
                      "&::before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<CaretDown color="#94a3b8" />}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", pr: 2 }}>
                        <Typography sx={{ color: "#f8fafc", fontWeight: 600 }}>{unit.unitName}</Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingUnit(unit); unitForm.reset({ unitName: unit.unitName }); setUnitModalOpen(true); }} sx={{ color: "#94a3b8" }}>
                            <PencilSimple size={16} />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setUnits(prev => prev.filter(u => u.id !== unit.id)); }} sx={{ color: "#f87171" }}>
                            <Trash size={16} />
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ borderTop: "1px solid rgba(71, 85, 105, 0.4)", bgcolor: "rgba(2, 6, 23, 0.3)", p: 2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {unit.lessons.map((lesson) => (
                          <Box key={lesson.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(71, 85, 105, 0.3)", borderRadius: "4px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Layout size={18} weight="duotone" style={{ color: "#60a5fa" }} />
                              <Typography sx={{ color: "#f1f5f9", fontSize: "13px" }}>{lesson.lessonName}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton size="small" onClick={() => { setCurrentUnitId(unit.id); setEditingLesson({ lesson, unitId: unit.id }); lessonForm.reset({ lessonName: lesson.lessonName }); setLessonModalOpen(true); }} sx={{ color: "#94a3b8" }}>
                                <PencilSimple size={14} />
                              </IconButton>
                              <IconButton size="small" onClick={() => setUnits(units.map(u => u.id === unit.id ? { ...u, lessons: u.lessons.filter(l => l.id !== lesson.id) } : u))} sx={{ color: "#f87171" }}>
                                <Trash size={14} />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                        <Button fullWidth variant="outlined" startIcon={<Plus />} onClick={() => { setCurrentUnitId(unit.id); setEditingLesson(null); lessonForm.reset({ lessonName: "" }); setLessonModalOpen(true); }}
                          sx={{ borderColor: "rgba(71, 85, 105, 0.4)", color: "#94a3b8", textTransform: "none", py: 1 }}>
                          Add Lesson to {unit.unitName}
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2, pt: 3, borderTop: "1px solid rgba(71, 85, 105, 0.4)" }}>
              <Button onClick={() => setMainModalOpen(false)} sx={{ color: "#94a3b8", fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: "#3b82f6", color: "#fff", px: 4, py: 1, borderRadius: "6px", fontWeight: 700, "&:hover": { bgcolor: "#2563eb" } }}>
                {loading ? "Saving..." : isEditMode ? "Update Syllabus" : "Create Syllabus"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Small Modals for Unit/Lesson */}
      <Modal open={unitModalOpen} onClose={() => setUnitModalOpen(false)}>
        <Box sx={smallModalStyle}>
          <Typography variant="h6" sx={{ color: "#f8fafc", mb: 3 }}>{editingUnit ? "Edit Unit" : "New Unit"}</Typography>
          <Box component="form" onSubmit={unitForm.handleSubmit(handleUnitSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <CustomInput name="unitName" label="Unit Name" type="text" placeholder="e.g., Introduction to React" bgmode="dark" register={unitForm.register} errors={unitForm.formState.errors} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button onClick={() => setUnitModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: "#3b82f6", color: "#fff" }}>Save Unit</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)}>
        <Box sx={smallModalStyle}>
          <Typography variant="h6" sx={{ color: "#f8fafc", mb: 3 }}>{editingLesson ? "Edit Lesson" : "New Lesson"}</Typography>
          <Box component="form" onSubmit={lessonForm.handleSubmit(handleLessonSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <CustomInput name="lessonName" label="Lesson Title" type="text" placeholder="e.g., Setting up Environment" bgmode="dark" register={lessonForm.register} errors={lessonForm.formState.errors} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button onClick={() => setLessonModalOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: "#3b82f6", color: "#fff" }}>Save Lesson</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box sx={{ ...modalStyle, width: 400, p: 4, textAlign: "center" }}>
          <Trash size={48} weight="duotone" style={{ color: "#ef4444", marginBottom: 16 }} />
          <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700, mb: 1 }}>Delete Syllabus?</Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "14px", mb: 3 }}>Are you sure you want to remove this course syllabus? This cannot be undone.</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth onClick={() => setDeleteModalOpen(false)} sx={{ bgcolor: "#334155", color: "#f8fafc" }}>Cancel</Button>
            <Button fullWidth onClick={() => { lessonDelete(syllabusToDelete!); setDeleteModalOpen(false); }} variant="contained" sx={{ bgcolor: "#ef4444", color: "#fff" }}>Delete</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Syllabus;
