import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    IconButton
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { MdDownload } from "react-icons/md";
import { useGetMyPayslips } from "../../Hooks/employee"; // Correct path
import CustomSnackBar from "../../Custom/CustomSnackBar"; // Verify path

const EmployeePortal = () => {
    const { data: payslips, isLoading, error } = useGetMyPayslips();

    const handleDownload = (url: string) => {
        if (url) {
            window.open(url, "_blank");
        } else {
            CustomSnackBar.errorSnackbar("Payslip file not available");
        }
    };

    const columns: GridColDef[] = [
        { field: "month", headerName: "Month", width: 150 },
        { field: "year", headerName: "Year", width: 100 },
        {
            field: "totalEarnings",
            headerName: "Total Earnings",
            width: 150,
            valueGetter: (value, row) => row.calculations?.totalEarnings || 0
        },
        {
            field: "totalDeductions",
            headerName: "Total Deductions",
            width: 150,
            valueGetter: (value, row) => row.calculations?.totalDeductions || 0
        },
        {
            field: "netPay",
            headerName: "Net Pay",
            width: 150,
            renderCell: (params: any) => (
                <Typography fontWeight="bold" color="green">₹{params.row.netPay}</Typography>
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: (params: any) => (
                <Chip
                    label={params.row.status}
                    color={params.row.status === "GENERATED" ? "success" : "default"}
                    size="small"
                />
            )
        },
        {
            field: "action",
            headerName: "Action",
            width: 150,
            renderCell: (params: any) => (
                <Button
                    startIcon={<MdDownload />}
                    size="small"
                    variant="contained"
                    onClick={() => handleDownload(params.row.pdfUrl)}
                >
                    Download
                </Button>
            )
        }
    ];

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Box p={3}><Typography color="error">Failed to load payslips</Typography></Box>;

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight="bold" mb={3}>My Payslips</Typography>

            <Card>
                <CardContent>
                    <DataGrid
                        rows={payslips || []}
                        columns={columns}
                        autoHeight
                        getRowId={(row) => row._id}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        pageSizeOptions={[10, 20]}
                        sx={{ border: "none" }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default EmployeePortal;
