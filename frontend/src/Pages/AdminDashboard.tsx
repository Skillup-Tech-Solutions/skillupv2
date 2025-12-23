import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  People,
  School,
  Work,
  BusinessCenter,
  Category,
} from "@mui/icons-material";
import { useGetDashboardCountsApi } from "../Hooks/dashboard";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Utility: generate last 12 months
const getLast12Months = () => {
  const now = new Date();
  const result = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    result.push(`${month}-${year}`);
  }
  return result;
};

const AdminDashboard = () => {
  // Default to current month
  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${month}-${year}`;
  };
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const { data, isLoading, error } = useGetDashboardCountsApi(monthYear);

  const cards = [
    {
      title: "Careers",
      count: data?.carrierCount || 0,
      icon: <BusinessCenter />,
    },
    {
      title: "Courses",
      count: data?.courseCount || 0,
      icon: <School />,
    },
    {
      title: "Users",
      count: data?.userCount || 0,
      icon: <People />,
    },
    {
      title: "Internships",
      count: data?.categoryInternshipCount || 0,
      icon: <Work />,
    },
    {
      title: "Workshops",
      count: data?.categoryWorkshopCount || 0,
      icon: <Category />,
    },
  ];

  const chartData = {
    labels: cards.map((card) => card.title),
    datasets: [
      {
        label: "Count",
        data: cards.map((card) => card.count),
        backgroundColor: "#90caf9",
        borderRadius: 8,
        barThickness: 35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            return `Count: ${context.raw}`;
          },
        },
      },

    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: "#888", font: { size: 12 } },
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
    },
  };

  return (
    <Box sx={{ p: 3, "@media (max-width: 600px)": { p: 1 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Admin Dashboard
        </Typography>

        <FormControl size="small" sx={{ minWidth: 140, mt: { xs: 2, sm: 0 } }}>
          <InputLabel id="month-year-select-label">Month</InputLabel>
          <Select
            labelId="month-year-select-label"
            value={monthYear}
            label="Month"
            onChange={(e) => setMonthYear(e.target.value)}
          >
            {getLast12Months().map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">Failed to load dashboard data.</Alert>
      ) : (
        <>
          {/* Cards */}
          <Grid
            container
            sx={{
              flexBasis: "100%",
              gap: 2,
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            {cards.map((card, idx) => (
              <Box
                key={idx}
                sx={{
                  flexBasis: "18%",
                  flexGrow: 1,
                  "@media (max-width: 600px)": { flexBasis: "100%" },
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {card.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "#f5f5f5",
                      borderRadius: "50%",
                      p: 1.2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Paper>
              </Box>
            ))}
          </Grid>

          {/* Chart */}
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: 300 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Overview Chart
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {monthYear}
              </Typography>
            </Box>
            <Box sx={{ height: "100%" }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;
