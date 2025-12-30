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
import { PencilSimple, Trash, Percent, Plus, X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import CustomSnackBar from "../Custom/CustomSnackBar";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OffersDescriptionSchema } from "../assets/Validation/Schema";
import {
  offerDeleteApi,
  offerUpdateApi,
  useGetOffers,
  useOfferAddApi,
} from "../Hooks/offer";

// Dark modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "#1e293b",
  outline: "none",
  borderRadius: "6px",
  border: "1px solid rgba(71, 85, 105, 0.5)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  padding: "20px 24px",
  "@media (max-width: 600px)": {
    width: "90vw",
    margin: "auto",
  },
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

const Offers = () => {
  const [loading, setLoading] = useState(false);
  const { data: getUsersResponse, isLoading, error } = useGetOffers();
  const { mutate: offersUpdate } = offerUpdateApi();
  const { mutate: offerAdd } = useOfferAddApi();
  const { mutate: offerDelete } = offerDeleteApi();
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
  } = useForm({
    resolver: zodResolver(OffersDescriptionSchema),
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
      setRows(getUsersResponse);
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
      offerDelete(userToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Deleted Successfully!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
        onError: () => {
          CustomSnackBar.errorSnackbar("Failed to delete!");
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
    reset({ description: row.description });
  };

  const handleStatusToggle = (newRow: any) => {
    setRows((prevRows: any) =>
      prevRows.map((row: any) =>
        row._id === newRow._id || row.id === newRow.id
          ? { ...row, status: row.status === "active" ? "inactive" : "active" }
          : row
      )
    );
    offersUpdate(
      {
        id: newRow._id,
        description: newRow.description,
        status: newRow.status === "active" ? "inactive" : "active",
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
      width: 80,
      renderCell: (params: any) => {
        const rowIndex = rows?.findIndex(
          (row: any) => (row._id || row.id) === (params.row._id || params.row.id)
        );
        return <Box sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{(rowIndex ?? 0) + 1}</Box>;
      },
    },
    { field: "description", headerName: "Description", flex: 1, minWidth: 300 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: any) => (
        <Switch
          checked={params.row.status === "active"}
          onChange={() => handleStatusToggle(params.row)}
          sx={{
            "& .MuiSwitch-thumb": {
              backgroundColor: params.row.status === "active" ? "#22c55e" : "#64748b",
            },
            "& .MuiSwitch-track": {
              backgroundColor: params.row.status === "active" ? "#16a34a !important" : "#475569 !important",
            },
          }}
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
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
      offersUpdate(
        {
          id: editingItem._id,
          description: data.description,
          status: editingItem.status,
        },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Offer Updated!");
            handleClose();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(error.message || "Error updating Offer.");
          },
          onSettled: () => setLoading(false),
        }
      );
    } else {
      offerAdd(
        { description: data.description, status: "inactive" },
        {
          onSuccess: () => {
            CustomSnackBar.successSnackbar("Offer Added!");
            handleClose();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(error.message || "Error adding Offer.");
          },
          onSettled: () => setLoading(false),
        }
      );
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "#f87171" }}>
        Error loading offers: {error.message || "Something went wrong"}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Percent size={28} weight="duotone" style={{ color: "#fbbf24" }} />
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
            Offers
          </Box>
        </Box>
        {(!rows || rows.length < 1) && (
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
            Add Offer
          </Button>
        )}
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
        sx={{
          "& .MuiDialog-paper": { bgcolor: "transparent", boxShadow: "none" },
          "& .MuiBackdrop-root": { bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)" },
        }}
      >
        <Box sx={modalStyle}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)" }}>
            <Box sx={{ fontSize: "16px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc" }}>
              {isEditMode ? "Edit Offer" : "Add Offer"}
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "#94a3b8", "&:hover": { color: "#f8fafc", bgcolor: "rgba(51, 65, 85, 0.5)" } }}>
              <X size={18} />
            </IconButton>
          </Box>
          {/* Body */}
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit(onsubmit)}>
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
          </Box>
          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 2, borderTop: "1px solid rgba(71, 85, 105, 0.4)", gap: 1.5 }}>
            <CustomButton
              type="button"
              variant="contained"
              label="Cancel"
              btnSx={{ background: "#334155", color: "#f8fafc", borderRadius: "6px", "&:hover": { background: "#475569" } }}
              onClick={handleClose}
            />
            <CustomButton
              type="submit"
              variant="contained"
              label={isEditMode ? "Update" : "Add"}
              btnSx={{ background: "#3b82f6", color: "#fff", borderRadius: "6px", fontWeight: 600, "&:hover": { background: "#2563eb" } }}
              onClick={handleSubmit(onsubmit)}
              disabled={loading}
            />
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
          <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", mb: 1 }}>Delete Offer?</Box>
          <Box sx={{ fontSize: "14px", color: "#94a3b8", mb: 2 }}>This action cannot be undone.</Box>
        </Box>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{ bgcolor: "#334155", color: "#f8fafc", px: 3, py: 1, borderRadius: "6px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase", "&:hover": { bgcolor: "#475569" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{ bgcolor: "#ef4444", color: "#fff", px: 3, py: 1, borderRadius: "6px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase", "&:hover": { bgcolor: "#dc2626" } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Offers;
