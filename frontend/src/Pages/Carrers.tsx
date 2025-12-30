import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Switch,
  Dialog,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { PencilSimple, Trash, Briefcase, Plus, X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import CustomSnackBar from "../Custom/CustomSnackBar";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema } from "../assets/Validation/Schema";
import {
  carrersDeleteApi,
  carrerStatusUpdateApi,
  carrersUpdateApi,
  useCarrersAddApi,
  useGetCarrers,
} from "../Hooks/carrers";
import CustomAutoComplete from "../Custom/CustomAutocomplete";

// Dark modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxWidth: "95vw",
  maxHeight: "90vh",
  bgcolor: "#1e293b",
  outline: "none",
  borderRadius: "6px",
  border: "1px solid rgba(71, 85, 105, 0.5)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  padding: "20px 24px",
  overflow: "hidden",
};

// DataGrid dark styling
const dataGridStyles = {
  bgcolor: "rgba(30, 41, 59, 0.4)",
  border: "1px solid rgba(71, 85, 105, 0.6)",
  borderRadius: "6px",
  "& .MuiDataGrid-columnHeaders": {
    bgcolor: "rgba(15, 23, 42, 0.8)",
    color: "#94a3b8",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontFamily: "'JetBrains Mono', monospace",
    borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
  },
  "& .MuiDataGrid-columnHeader": {
    "&:focus, &:focus-within": { outline: "none" },
  },
  "& .MuiDataGrid-row": {
    bgcolor: "transparent",
    color: "#f8fafc",
    "&:hover": { bgcolor: "rgba(51, 65, 85, 0.3)" },
  },
  "& .MuiDataGrid-cell": {
    borderColor: "rgba(71, 85, 105, 0.4)",
    fontSize: "13px",
    fontFamily: "'Inter', sans-serif",
    "&:focus, &:focus-within": { outline: "none" },
  },
  "& .MuiDataGrid-footerContainer": {
    bgcolor: "rgba(15, 23, 42, 0.5)",
    borderTop: "1px solid rgba(71, 85, 105, 0.4)",
    color: "#94a3b8",
  },
  "& .MuiTablePagination-root": { color: "#94a3b8" },
  "& .MuiTablePagination-selectIcon": { color: "#64748b" },
  "& .MuiIconButton-root": { color: "#64748b" },
};

const Carrers = () => {
  const [loading, setLoading] = useState(false);
  const { data: getUsersResponse, isLoading, error } = useGetCarrers();
  const { mutate: carrersUpdate } = carrersUpdateApi();
  const { mutate: carrersAdd } = useCarrersAddApi();
  const { mutate: carrersStatus } = carrerStatusUpdateApi();
  const { mutate: carrersDelete } = carrersDeleteApi();
  const [rows, setRows] = useState<any>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(jobFormSchema),
  });

  const handleClose = () => {
    setOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    reset({ description: "" });
    clearErrors();
  };

  useEffect(() => {
    if (getUsersResponse) {
      setRows(getUsersResponse?.data);
    }
  }, [getUsersResponse]);

  const handleAction = (id: string) => {
    if (id) {
      setUserToDelete(id);
      setDeleteModalOpen(true);
    } else {
      CustomSnackBar.errorSnackbar("Something Went Wrong!");
    }
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      carrersDelete(userToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Deleted Successfully!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
        onError: () => {
          CustomSnackBar.errorSnackbar("Failed to delete Career!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleEdit = (row: any) => {
    setIsEditMode(true);
    setEditingItem(row);
    setOpen(true);
    reset({
      description: row.description,
      keySkill: row.keySkill,
      jobTitle: row.jobTitle,
      vancancy: row.vancancy,
      workType: row.workType,
      noOfopening: row.noOfopening,
      salaryRange: row.salaryRange,
    });
  };

  const workTypeOptions = [
    { label: "On-site", value: "on-site" },
    { label: "Work From Home", value: "wfh" },
    { label: "Hybrid", value: "hybrid" },
  ];
  const vancancyOptions = [
    { label: "Opened", value: "open" },
    { label: "Closed", value: "close" },
  ];

  const handleStatusToggle = (newRow: any) => {
    setRows((prevRows: any) =>
      prevRows.map((row: any) =>
        row._id === newRow._id || row.id === newRow.id
          ? { ...row, status: row.status === "Active" ? "InActive" : "Active" }
          : row
      )
    );
    carrersStatus(
      {
        id: newRow._id,
        status: newRow.status === "Active" ? "InActive" : "Active",
      },
      {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Status Updated!");
        },
        onError: () => {
          CustomSnackBar.errorSnackbar("Something Went Wrong!");
        },
      }
    );
  };

  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "S.No",
      width: 70,
      renderCell: (params: any) => {
        const rowIndex = rows?.findIndex(
          (row: any) => (row._id || row.id) === (params.row._id || params.row.id)
        );
        return <Box sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{(rowIndex ?? 0) + 1}</Box>;
      },
    },
    { field: "jobTitle", headerName: "Job Title", width: 180 },
    { field: "keySkill", headerName: "Key Skill", width: 160 },
    {
      field: "vancancy",
      headerName: "Vacancy",
      width: 100,
      renderCell: (params: any) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            bgcolor: params.value === "open" ? "rgba(22, 101, 52, 0.3)" : "rgba(127, 29, 29, 0.3)",
            color: params.value === "open" ? "#4ade80" : "#f87171",
            border: params.value === "open" ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
          }}
        >
          {params.value === "open" ? "Open" : "Closed"}
        </Box>
      ),
    },
    { field: "workType", headerName: "Work Type", width: 120 },
    { field: "noOfopening", headerName: "Openings", width: 100 },
    { field: "salaryRange", headerName: "Salary", width: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 90,
      renderCell: (params: any) => (
        <Switch
          checked={params.row.status === "Active"}
          onChange={() => handleStatusToggle(params.row)}
          size="small"
          sx={{
            "& .MuiSwitch-thumb": {
              backgroundColor: params.row.status === "Active" ? "#22c55e" : "#64748b",
            },
            "& .MuiSwitch-track": {
              backgroundColor: params.row.status === "Active" ? "#16a34a !important" : "#475569 !important",
            },
          }}
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      sortable: false,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ color: "#60a5fa", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
          >
            <PencilSimple size={18} weight="duotone" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleAction(params.row._id || params.row.id)}
            sx={{ color: "#f87171", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
          >
            <Trash size={18} weight="duotone" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const onsubmit = async (data: any) => {
    setLoading(true);
    if (isEditMode) {
      carrersUpdate(
        {
          id: editingItem._id,
          description: data.description,
          status: editingItem.status,
          jobTitle: data.jobTitle,
          keySkill: data.keySkill,
          vancancy: data.vancancy,
          workType: data.workType,
          noOfopening: data.noOfopening,
          salaryRange: data.salaryRange,
        },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Career Updated!");
            handleClose();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(error.message || "Error updating Career.");
          },
          onSettled: () => setLoading(false),
        }
      );
    } else {
      carrersAdd(
        {
          description: data.description,
          jobTitle: data.jobTitle,
          keySkill: data.keySkill,
          vancancy: data.vancancy,
          workType: data.workType,
          noOfopening: data.noOfopening,
          salaryRange: data.salaryRange,
          status: "Active",
        },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Career Added!");
            handleClose();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(error.message || "Error adding Career.");
          },
          onSettled: () => setLoading(false),
        }
      );
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "#f87171" }}>
        Error loading careers: {error.message || "Something went wrong"}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Briefcase size={28} weight="duotone" style={{ color: "#c084fc" }} />
          <Box
            component="h1"
            sx={{
              fontSize: "24px",
              fontFamily: "'Chivo', sans-serif",
              fontWeight: 700,
              color: "#f8fafc",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              m: 0,
            }}
          >
            Careers
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} weight="bold" />}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "#3b82f6",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            px: 2.5,
            py: 1,
            "&:hover": { bgcolor: "#2563eb" },
          }}
        >
          Add Career
        </Button>
      </Box>

      {/* DataGrid */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#60a5fa" }} />
        </Box>
      ) : (
        <DataGrid
          rows={rows || []}
          columns={columns}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          disableRowSelectionOnClick
          autoHeight
          getRowId={(row) => row._id || row.id}
          sx={dataGridStyles}
        />
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": { bgcolor: "transparent", boxShadow: "none" },
          "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
        }}
      >
        <Box sx={modalStyle}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
            <Box sx={{ fontSize: "16px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc" }}>
              {isEditMode ? "Edit Career" : "Add Career"}
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc", bgcolor: "rgba(51, 65, 85, 0.5)" } }}>
              <X size={18} />
            </IconButton>
          </Box>
          {/* Body */}
          <Box component="form" sx={{ mt: 2, maxHeight: "50vh", overflowY: "auto", pr: 1 }} onSubmit={handleSubmit(onsubmit)}>
            <CustomInput name="jobTitle" placeholder="Enter Job Title" label="Job Title" type="text" bgmode="dark" required={false} register={register} errors={errors} />
            <CustomInput name="description" placeholder="Enter Description" label="Description" type="text" bgmode="dark" required={false} register={register} errors={errors} />
            <CustomInput name="keySkill" placeholder="Enter Key Skills" label="Key Skills" type="text" bgmode="dark" required={false} register={register} errors={errors} />
            <Controller
              name="vancancy"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <CustomAutoComplete
                  {...field}
                  options={vancancyOptions}
                  label="Vacancy"
                  name="vancancy"
                  placeholder="Select Vacancy Status"
                  register={register}
                  multiple={false}
                  errors={errors}
                  boxSx={{ width: "100%" }}
                  onValueChange={(value: string | string[] | null) => {
                    setValue("vancancy", typeof value === "string" ? value : value ? value[0] : "");
                    clearErrors("vancancy");
                  }}
                />
              )}
            />
            <Controller
              name="workType"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <CustomAutoComplete
                  {...field}
                  options={workTypeOptions}
                  label="Work Type"
                  name="workType"
                  placeholder="Select Work Type"
                  register={register}
                  multiple={false}
                  errors={errors}
                  boxSx={{ width: "100%" }}
                  onValueChange={(value: string | string[] | null) => {
                    setValue("workType", typeof value === "string" ? value : value ? value[0] : "");
                    clearErrors("workType");
                  }}
                />
              )}
            />
            <CustomInput name="noOfopening" placeholder="Enter No. of Openings" label="No. of Openings" type="number" bgmode="dark" required={false} register={register} errors={errors} />
            <CustomInput name="salaryRange" placeholder="Enter Salary Range" label="Salary Range" type="text" bgmode="dark" required={false} register={register} errors={errors} />
          </Box>
          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)", gap: 1.5 }}>
            <CustomButton type="button" variant="contained" label="Cancel" btnSx={{ background: "#334155", color: "#f8fafc", borderRadius: "6px", "&:hover": { background: "#475569" } }} onClick={handleClose} />
            <CustomButton type="submit" variant="contained" label={isEditMode ? "Update" : "Add"} btnSx={{ background: "#3b82f6", color: "#fff", borderRadius: "6px", fontWeight: 600, "&:hover": { background: "#2563eb" } }} onClick={handleSubmit(onsubmit)} disabled={loading} />
          </Box>
        </Box>
      </Dialog>

      {/* Delete Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        sx={{
          "& .MuiDialog-paper": { bgcolor: "#1e293b", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "6px", p: 2 },
          "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
        }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Trash size={48} weight="duotone" style={{ color: "#f87171", marginBottom: 16 }} />
          <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>Delete Career?</Box>
          <Box sx={{ fontSize: "14px", color: "#94a3b8", mb: 2 }}>This action cannot be undone.</Box>
        </Box>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button onClick={handleDeleteCancel} sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "6px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase", "&:hover": { bgcolor: "#475569" } }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} sx={{ bgcolor: "#ef4444", color: "#fff", px: 3, py: 1, borderRadius: "6px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase", "&:hover": { bgcolor: "#dc2626" } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Carrers;
