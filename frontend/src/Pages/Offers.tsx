import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Modal,
} from "@mui/material";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { useState, useEffect } from "react";
import CustomSnackBar from "../Custom/CustomSnackBar";
import { cancelButtonStyle, dangerButtonStyle } from "../assets/Styles/ButtonStyles";
import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OffersDescriptionSchema } from "../assets/Validation/Schema";
import { IoClose } from "react-icons/io5";
import {
  offerDeleteApi,
  offerUpdateApi,
  useGetOffers,
  useOfferAddApi,
} from "../Hooks/offer";
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
const Offers = () => {
  const [loading, setLoading] = useState(false);
  const { data: getUsersResponse, isLoading, error } = useGetOffers();
  const { mutate: offersUpdate } = offerUpdateApi();
  const { mutate: offerAdd } = useOfferAddApi();
  const { mutate: offerDelete } = offerDeleteApi();
  const [rows, setRows] = useState<any>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
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
    reset({
      description: "",
    });
    clearErrors();
  };
  useEffect(() => {
    if (getUsersResponse) {
      setRows(getUsersResponse);
    }
  }, [getUsersResponse]);

  const handleAction = (id: string) => {
    console.log("Action clicked for ID:", id);
    if (id) {
      setUserToDelete(id);
      setDeleteModalOpen(true);
    } else {
      CustomSnackBar.errorSnackbar("SomeThing Went Wrong!");
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
        onError: (error: any) => {
          CustomSnackBar.errorSnackbar("Failed to delete user!");
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
    });
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
          CustomSnackBar.successSnackbar("Status Updated Successfully!");
        },
        onError: (error: any) => {
          CustomSnackBar.errorSnackbar("SomeThing Went Wrong!");
        },
      }
    );
  };

  const columns: any = [
    {
      field: "sno",
      headerName: "S.No",
      width: 80,
      renderCell: (params: any) => {
        const rowIndex = rows.findIndex(
          (row: any) =>
            (row._id || row.id) === (params.row._id || params.row.id)
        );
        return rowIndex + 1;
      },
    },
    { field: "description", headerName: "Description", width: 500 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params: any) => (
        <Switch
          checked={params.row.status === "active"}
          onChange={() => handleStatusToggle(params.row)}
          sx={{
            "& .MuiSwitch-thumb": {
              backgroundColor:
                params.row.status === "active"
                  ? "var(--primary)"
                  : "var(--grey)",
            },
            "& .MuiSwitch-track": {
              backgroundColor:
                params.row.status === "active"
                  ? "var(--primary) !important"
                  : "var(--grey) !important",
            },
          }}
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", gap: "8px" }}>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => handleEdit(params.row)}
            sx={{
              "& svg": {
                color: "var(--primary)",
                fontSize: "18px",
              },
            }}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => handleAction(params.row._id || params.row.id)}
            sx={{
              "& svg": {
                color: "var(--red)",
                fontSize: "18px",
              },
            }}
          >
            <MdDeleteOutline />
          </IconButton>
        </Box>
      ),
    },
  ];
  if (error) {
    return (
      <div className="Submitted_form_table">
        <Box sx={{ padding: 2, textAlign: "center", color: "var(--red)" }}>
          Error loading users: {error.message || "Something went wrong"}
        </Box>
      </div>
    );
  }
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
            CustomSnackBar.successSnackbar("Offers Updated Successfully!");
            handleClose();
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(
              error.message || "Error updating Offer."
            );
          },
          onSettled: () => {
          setLoading(false);
        }
        }
      );
    } else {
      offerAdd(
        {
          description: data.description,
          status: "inactive",
        },
        {
          onSuccess: (response) => {
            handleClose();
            console.log("Offer added", response);
          },
          onError: (error) => {
            CustomSnackBar.errorSnackbar(
              error.message || "Error adding Offer."
            );
          },
          onSettled: () => {
          setLoading(false);
        }
        }
      );
    }
  };
  return (
    <>
      <div className="Submitted_form_table">
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
          {rows && rows.length < 1 && (
            <CustomButton
              type="button"
              label="Add Offers"
              variant="contained"
              btnSx={{
                background: "var(--primary)",
                color: "var(--white)",
                width: "fit-content",
              }}
              onClick={() => setOpen(true)}
            />
          )}
        </Box>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[10, 20]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          className="table_border"
          autoHeight
          getRowId={(row) => row._id || row.id}
        />
      </div>

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
              {isEditMode ? "Edit Offer" : "Add Offer"}
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
              label={isEditMode ? "Update Offer" : "Add Offer"}
              btnSx={{ background: "var(--primary)", color: "var(--white)" }}
              onClick={handleSubmit(onsubmit)}
              disabled={loading}
            />
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            padding: "0",
            margin: "16px",
            maxWidth: "380px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            "@media (max-width: 600px)": {
              margin: "16px",
              maxWidth: "calc(100vw - 32px)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            padding: "32px 24px 16px",
            color: "var(--red)",
            fontWeight: "600",
            fontSize: "1.25rem",
            "@media (max-width: 600px)": {
              padding: "24px 20px 12px",
              fontSize: "1.1rem",
            },
          }}
        >
          Delete User
        </DialogTitle>

        <DialogContent
          sx={{
            padding: "0 24px 24px",
            textAlign: "center",
            "@media (max-width: 600px)": {
              padding: "0 20px 20px",
            },
          }}
        >
          <Typography
            sx={{
              color: "#666",
              fontSize: "1rem",
              lineHeight: "1.5",
              "@media (max-width: 600px)": {
                fontSize: "0.9rem",
              },
            }}
          >
            Are you sure you want to delete this user?
          </Typography>
          <Typography
            sx={{
              color: "#999",
              fontSize: "0.875rem",
              marginTop: "8px",
              "@media (max-width: 600px)": {
                fontSize: "0.8rem",
              },
            }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "0 24px 32px",
            gap: "12px",
            justifyContent: "center",
            "@media (max-width: 600px)": {
              padding: "0 20px 24px",
              flexDirection: "column",
              gap: "8px",
            },
          }}
        >
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              ...cancelButtonStyle,
              minWidth: "100px",
              height: "40px",
              borderRadius: "8px",
              "@media (max-width: 600px)": {
                width: "100%",
                height: "44px",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              ...dangerButtonStyle,
              minWidth: "100px",
              height: "40px",
              borderRadius: "8px",
              "@media (max-width: 600px)": {
                width: "100%",
                height: "44px",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Offers;
