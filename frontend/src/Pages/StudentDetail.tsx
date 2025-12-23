import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { MdArrowBack, MdAdd, MdDelete, MdEmail } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle } from "../assets/Styles/ButtonStyles";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// Form row style helper
const FormRow = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", "& > *": { flex: "1 1 calc(50% - 8px)", minWidth: 200 } }}>
        {children}
    </Box>
);

// Default form states
const defaultCourseForm = {
    name: "", description: "", duration: "", level: "beginner", mode: "online",
    startDate: "", endDate: "", trainer: "", status: "Active"
};

const defaultInternshipForm = {
    title: "", description: "", company: "", department: "", duration: "",
    mode: "on-site", startDate: "", endDate: "", mentor: "", dailyTasks: "",
    stipend: 0, status: "Active"
};

const defaultProjectForm = {
    title: "", description: "", requirements: "", tasks: "", deadline: "",
    mentor: "", projectType: "individual", status: "Active"
};

const StudentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignType, setAssignType] = useState<"course" | "internship" | "project">("course");

    // Form states for each type
    const [courseForm, setCourseForm] = useState(defaultCourseForm);
    const [internshipForm, setInternshipForm] = useState(defaultInternshipForm);
    const [projectForm, setProjectForm] = useState(defaultProjectForm);

    const [assignMode, setAssignMode] = useState<"create" | "existing">("create");
    const [selectedItemId, setSelectedItemId] = useState("");

    // Fetch all courses
    const { data: allCourses } = useQuery({
        queryKey: ["all-courses"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}courses`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data.courses;
        },
        enabled: assignModalOpen && assignType === "course" && assignMode === "existing"
    });

    // Fetch all internships
    const { data: allInternships } = useQuery({
        queryKey: ["all-internships"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/internships`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
        enabled: assignModalOpen && assignType === "internship" && assignMode === "existing"
    });

    // Fetch all projects
    const { data: allProjects } = useQuery({
        queryKey: ["all-projects"],
        queryFn: async () => {
            const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}admin/projects`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
        enabled: assignModalOpen && assignType === "project" && assignMode === "existing"
    });

    // Fetch student details
    const { data: student, isLoading, error } = useQuery({
        queryKey: ["student", id],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/students/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    // Fetch student assignments
    const { data: assignmentsData } = useQuery({
        queryKey: ["student-assignments", id],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/students/${id}/assignments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    // Extract assignments array from response
    const assignments = assignmentsData?.assignments || [];

    const sendInviteMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/students/${id}/invite`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Invite sent successfully!");
            queryClient.invalidateQueries({ queryKey: ["student", id] });
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to send invite");
        },
    });

    // Create and assign mutation
    const createAndAssignMutation = useMutation({
        mutationFn: async (data: { type: string; payload: any }) => {
            let endpoint = "";
            switch (data.type) {
                case "course":
                    endpoint = "courses";
                    break;
                case "internship":
                    endpoint = "admin/internships";
                    break;
                case "project":
                    endpoint = "admin/projects";
                    break;
            }

            // Create the item first
            const createResponse = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}${endpoint}`,
                data.payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newItem = createResponse.data.course || createResponse.data.internship || createResponse.data.project || createResponse.data;

            // Then assign to student
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments`,
                { studentId: id, itemType: data.type, itemId: newItem._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return newItem;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Created and assigned successfully!");
            queryClient.invalidateQueries({ queryKey: ["student-assignments", id] });
            handleCloseModal();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to create/assign");
        },
    });

    // Assign existing item mutation
    const assignExistingMutation = useMutation({
        mutationFn: async () => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments`,
                { studentId: id, itemType: assignType, itemId: selectedItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assigned successfully!");
            queryClient.invalidateQueries({ queryKey: ["student-assignments", id] });
            handleCloseModal();
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to assign");
        }
    });

    const removeAssignmentMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await axios.delete(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments/${assignmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assignment removed!");
            queryClient.invalidateQueries({ queryKey: ["student-assignments", id] });
        },
        onError: (error: any) => {
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to remove");
        },
    });

    const handleCloseModal = () => {
        setAssignModalOpen(false);
        setCourseForm(defaultCourseForm);
        setInternshipForm(defaultInternshipForm);
        setProjectForm(defaultProjectForm);
        setAssignMode("create");
        setSelectedItemId("");
    };



    const handleSubmit = () => {
        if (assignMode === "existing") {
            if (!selectedItemId) {
                CustomSnackBar.errorSnackbar("Please select an item");
                return;
            }
            assignExistingMutation.mutate();
            return;
        }

        if (assignType === "course") {
            if (!courseForm.name.trim()) {
                CustomSnackBar.errorSnackbar("Course title is required");
                return;
            }
            createAndAssignMutation.mutate({
                type: "course",
                payload: { ...courseForm, price: 0 }
            });
        } else if (assignType === "internship") {
            if (!internshipForm.title.trim() || !internshipForm.company.trim()) {
                CustomSnackBar.errorSnackbar("Title and Company are required");
                return;
            }
            createAndAssignMutation.mutate({
                type: "internship",
                payload: {
                    ...internshipForm,
                    startDate: internshipForm.startDate || new Date(),
                    endDate: internshipForm.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }
            });
        } else if (assignType === "project") {
            if (!projectForm.title.trim()) {
                CustomSnackBar.errorSnackbar("Project title is required");
                return;
            }
            createAndAssignMutation.mutate({
                type: "project",
                payload: {
                    ...projectForm,
                    tasks: projectForm.tasks.split("\n").filter(Boolean),
                    deadline: projectForm.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "success";
            case "Self-Signed": return "info";
            case "Invited": return "warning";
            case "Created": return "default";
            case "Suspended": return "error";
            default: return "default";
        }
    };

    const courseAssignments = assignments?.filter((a: any) => a.itemType === "course") || [];
    const internshipAssignments = assignments?.filter((a: any) => a.itemType === "internship") || [];
    const projectAssignments = assignments?.filter((a: any) => a.itemType === "project") || [];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !student) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Failed to load student details</Alert>
                <Button onClick={() => navigate("/users")} sx={{ mt: 2 }}>Back to Users</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate("/users")}>
                    <MdArrowBack />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">Student Details</Typography>
            </Box>

            {/* Student Info Card */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                        <Avatar sx={{ width: 80, height: 80, fontSize: 32, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                            {student.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="h5" fontWeight="600">{student.name}</Typography>
                            <Typography color="text.secondary">{student.email}</Typography>
                            <Typography color="text.secondary">{student.mobile}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Chip label={student.status} color={getStatusColor(student.status) as any} size="small" />
                                <Chip label={student.role} sx={{ ml: 1, textTransform: "capitalize" }} size="small" />
                            </Box>
                        </Box>
                        {(student.status === "Created" || student.status === "Invited") && (
                            <Button variant="outlined" startIcon={<MdEmail />} onClick={() => sendInviteMutation.mutate()} disabled={sendInviteMutation.isPending}>
                                {student.status === "Created" ? "Send Invite" : "Resend Invite"}
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Tabs for Assignments */}
            <Card sx={{ borderRadius: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                        <Tab label={`Courses (${courseAssignments.length})`} />
                        <Tab label={`Internships (${internshipAssignments.length})`} />
                        <Tab label={`Projects (${projectAssignments.length})`} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, px: 2 }}>
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => { setAssignType("course"); setAssignModalOpen(true); }} sx={{ ...primaryButtonStyle }}>
                            Add Course
                        </Button>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Course Name</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Trainer</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courseAssignments.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center">No courses assigned</TableCell></TableRow>
                            ) : courseAssignments.map((a: any) => (
                                <TableRow key={a._id}>
                                    <TableCell>{a.itemId?.name || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.duration || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.trainer || "N/A"}</TableCell>
                                    <TableCell><Chip label={a.itemId?.status || a.status} size="small" /></TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => removeAssignmentMutation.mutate(a._id)} sx={{ color: "error.main" }}><MdDelete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, px: 2 }}>
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => { setAssignType("internship"); setAssignModalOpen(true); }} sx={{ ...primaryButtonStyle }}>
                            Add Internship
                        </Button>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Company</TableCell>
                                <TableCell>Mentor</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {internshipAssignments.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">No internships assigned</TableCell></TableRow>
                            ) : internshipAssignments.map((a: any) => (
                                <TableRow key={a._id}>
                                    <TableCell>{a.itemId?.title || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.company || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.mentor || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.duration || "N/A"}</TableCell>
                                    <TableCell><Chip label={a.itemId?.status || a.status} size="small" /></TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => removeAssignmentMutation.mutate(a._id)} sx={{ color: "error.main" }}><MdDelete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, px: 2 }}>
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => { setAssignType("project"); setAssignModalOpen(true); }} sx={{ ...primaryButtonStyle }}>
                            Add Project
                        </Button>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Mentor</TableCell>
                                <TableCell>Deadline</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectAssignments.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">No projects assigned</TableCell></TableRow>
                            ) : projectAssignments.map((a: any) => (
                                <TableRow key={a._id}>
                                    <TableCell>{a.itemId?.title || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.mentor || "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.deadline ? new Date(a.itemId.deadline).toLocaleDateString() : "N/A"}</TableCell>
                                    <TableCell>{a.itemId?.projectType || "N/A"}</TableCell>
                                    <TableCell><Chip label={a.itemId?.status || a.status} size="small" /></TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => removeAssignmentMutation.mutate(a._id)} sx={{ color: "error.main" }}><MdDelete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabPanel>
            </Card>

            {/* Add Course/Internship/Project Modal */}
            <Dialog open={assignModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    Add {assignType === "course" ? "Course" : assignType === "internship" ? "Internship" : "Project"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", gap: 1, mb: 3, mt: 1 }}>
                        {["course", "internship", "project"].map((type) => (
                            <Button key={type} variant={assignType === type ? "contained" : "outlined"} onClick={() => { setAssignType(type as any); setAssignMode("create"); setSelectedItemId(""); }} sx={{ textTransform: "capitalize", flex: 1 }} size="small">
                                {type}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: "center" }}>
                        <Button variant={assignMode === "create" ? "contained" : "outlined"} onClick={() => setAssignMode("create")} size="small">Create New</Button>
                        <Button variant={assignMode === "existing" ? "contained" : "outlined"} onClick={() => setAssignMode("existing")} size="small">Select Existing</Button>
                    </Box>

                    {/* Select Existing Form */}
                    {assignMode === "existing" && (
                        <Box sx={{ mt: 2 }}>
                            {assignType === "course" && (
                                <TextField select label="Select Course" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} fullWidth>
                                    {allCourses?.map((c: any) => (
                                        <MenuItem key={c._id} value={c._id}>{c.name} ({c.duration})</MenuItem>
                                    ))}
                                </TextField>
                            )}
                            {assignType === "internship" && (
                                <TextField select label="Select Internship" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} fullWidth>
                                    {allInternships?.map((i: any) => (
                                        <MenuItem key={i._id} value={i._id}>{i.title} - {i.company}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                            {assignType === "project" && (
                                <TextField select label="Select Project" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} fullWidth>
                                    {allProjects?.map((p: any) => (
                                        <MenuItem key={p._id} value={p._id}>{p.title} ({p.projectType})</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                    )}

                    {/* Create New Forms */}
                    {assignMode === "create" && (
                        <>
                            {/* Course Form */}
                            {assignType === "course" && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <FormRow>
                                        <TextField label="Course Title *" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} fullWidth />
                                        <TextField label="Duration (e.g., 3 months)" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} fullWidth />
                                    </FormRow>
                                    <TextField label="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} fullWidth multiline rows={2} />
                                    <FormRow>
                                        <TextField select label="Level" value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} fullWidth>
                                            <MenuItem value="beginner">Beginner</MenuItem>
                                            <MenuItem value="intermediate">Intermediate</MenuItem>
                                            <MenuItem value="advanced">Advanced</MenuItem>
                                        </TextField>
                                        <TextField select label="Mode" value={courseForm.mode} onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value })} fullWidth>
                                            <MenuItem value="online">Online</MenuItem>
                                            <MenuItem value="offline">Offline</MenuItem>
                                            <MenuItem value="hybrid">Hybrid</MenuItem>
                                        </TextField>
                                    </FormRow>
                                    <FormRow>
                                        <TextField label="Start Date" type="date" value={courseForm.startDate} onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                                        <TextField label="End Date" type="date" value={courseForm.endDate} onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                                    </FormRow>
                                    <FormRow>
                                        <TextField label="Trainer / Mentor Name" value={courseForm.trainer} onChange={(e) => setCourseForm({ ...courseForm, trainer: e.target.value })} fullWidth />
                                        <TextField select label="Status" value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })} fullWidth>
                                            <MenuItem value="Active">Active</MenuItem>
                                            <MenuItem value="Completed">Completed</MenuItem>
                                            <MenuItem value="Upcoming">Upcoming</MenuItem>
                                        </TextField>
                                    </FormRow>
                                </Box>
                            )}

                            {/* Internship Form */}
                            {assignType === "internship" && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <FormRow>
                                        <TextField label="Internship Title *" value={internshipForm.title} onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })} fullWidth />
                                        <TextField label="Company / Department *" value={internshipForm.company} onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })} fullWidth />
                                    </FormRow>
                                    <TextField label="Description" value={internshipForm.description} onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })} fullWidth multiline rows={2} />
                                    <FormRow>
                                        <TextField label="Duration (e.g., 3 months)" value={internshipForm.duration} onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })} fullWidth />
                                        <TextField select label="Mode" value={internshipForm.mode} onChange={(e) => setInternshipForm({ ...internshipForm, mode: e.target.value })} fullWidth>
                                            <MenuItem value="on-site">On-site</MenuItem>
                                            <MenuItem value="remote">Remote</MenuItem>
                                            <MenuItem value="hybrid">Hybrid</MenuItem>
                                        </TextField>
                                    </FormRow>
                                    <FormRow>
                                        <TextField label="Start Date" type="date" value={internshipForm.startDate} onChange={(e) => setInternshipForm({ ...internshipForm, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                                        <TextField label="End Date" type="date" value={internshipForm.endDate} onChange={(e) => setInternshipForm({ ...internshipForm, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                                    </FormRow>
                                    <FormRow>
                                        <TextField label="Mentor / Supervisor" value={internshipForm.mentor} onChange={(e) => setInternshipForm({ ...internshipForm, mentor: e.target.value })} fullWidth />
                                        <TextField label="Stipend (₹)" type="number" value={internshipForm.stipend} onChange={(e) => setInternshipForm({ ...internshipForm, stipend: Number(e.target.value) })} fullWidth />
                                    </FormRow>
                                    <TextField label="Daily Tasks / Responsibilities" value={internshipForm.dailyTasks} onChange={(e) => setInternshipForm({ ...internshipForm, dailyTasks: e.target.value })} fullWidth multiline rows={2} />
                                    <TextField select label="Status" value={internshipForm.status} onChange={(e) => setInternshipForm({ ...internshipForm, status: e.target.value })} fullWidth sx={{ maxWidth: "50%" }}>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Ongoing">Ongoing</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                    </TextField>
                                </Box>
                            )}

                            {/* Project Form */}
                            {assignType === "project" && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <FormRow>
                                        <TextField label="Project Title *" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} fullWidth />
                                        <TextField label="Mentor / Guide" value={projectForm.mentor} onChange={(e) => setProjectForm({ ...projectForm, mentor: e.target.value })} fullWidth />
                                    </FormRow>
                                    <TextField label="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} fullWidth multiline rows={2} />
                                    <TextField label="Requirements / Tasks (one per line)" value={projectForm.tasks} onChange={(e) => setProjectForm({ ...projectForm, tasks: e.target.value })} fullWidth multiline rows={3} placeholder="Task 1&#10;Task 2&#10;Task 3" />
                                    <FormRow>
                                        <TextField label="Deadline / Submission Date" type="date" value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                                        <TextField select label="Project Type" value={projectForm.projectType} onChange={(e) => setProjectForm({ ...projectForm, projectType: e.target.value })} fullWidth>
                                            <MenuItem value="individual">Individual</MenuItem>
                                            <MenuItem value="group">Group</MenuItem>
                                        </TextField>
                                    </FormRow>
                                    <TextField select label="Status" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })} fullWidth sx={{ maxWidth: "50%" }}>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Assigned">Assigned</MenuItem>
                                        <MenuItem value="In Progress">In Progress</MenuItem>
                                        <MenuItem value="Submitted">Submitted</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                    </TextField>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseModal} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={createAndAssignMutation.isPending || assignExistingMutation.isPending} sx={{ ...submitButtonStyle }}>
                        {createAndAssignMutation.isPending || assignExistingMutation.isPending ? "Processing..." : (assignMode === "create" ? "Create & Assign" : "Assign")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentDetail;
