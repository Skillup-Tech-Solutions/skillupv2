import { useState } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  Briefcase,
  GraduationCap,
  Users,
  Buildings,
  Tag,
  ChartLineUp,
  CalendarBlank,
} from "@phosphor-icons/react";
import { useGetDashboardCountsApi } from "../Hooks/dashboard";
import LiveSessionsWidget from "../Components/LiveSessionsWidget";
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
      icon: Briefcase,
      color: "#60a5fa", // blue-400
      iconBg: "rgba(30, 58, 138, 0.4)",
      cardBg: "linear-gradient(to bottom right, rgba(23, 37, 84, 0.3), rgba(30, 58, 138, 0.1))",
      borderColor: "rgba(29, 78, 216, 0.3)",
    },
    {
      title: "Courses",
      count: data?.courseCount || 0,
      icon: GraduationCap,
      color: "#4ade80", // green-400
      iconBg: "rgba(22, 101, 52, 0.4)",
      cardBg: "linear-gradient(to bottom right, rgba(20, 83, 45, 0.3), rgba(22, 101, 52, 0.1))",
      borderColor: "rgba(22, 163, 74, 0.3)",
    },
    {
      title: "Users",
      count: data?.userCount || 0,
      icon: Users,
      color: "#c084fc", // purple-400
      iconBg: "rgba(88, 28, 135, 0.4)",
      cardBg: "linear-gradient(to bottom right, rgba(59, 7, 100, 0.3), rgba(88, 28, 135, 0.1))",
      borderColor: "rgba(126, 34, 206, 0.3)",
    },
    {
      title: "Internships",
      count: data?.categoryInternshipCount || 0,
      icon: Buildings,
      color: "#22d3ee", // cyan-400
      iconBg: "rgba(22, 78, 99, 0.4)",
      cardBg: "linear-gradient(to bottom right, rgba(8, 51, 68, 0.3), rgba(22, 78, 99, 0.1))",
      borderColor: "rgba(14, 116, 144, 0.3)",
    },
    {
      title: "Workshops",
      count: data?.categoryWorkshopCount || 0,
      icon: Tag,
      color: "#fbbf24", // amber-400
      iconBg: "rgba(120, 53, 15, 0.4)",
      cardBg: "linear-gradient(to bottom right, rgba(69, 26, 3, 0.3), rgba(120, 53, 15, 0.1))",
      borderColor: "rgba(180, 83, 9, 0.3)",
    },
  ];

  const chartData = {
    labels: cards.map((card) => card.title),
    datasets: [
      {
        label: "Count",
        data: cards.map((card) => card.count),
        backgroundColor: ["#60a5fa", "#4ade80", "#c084fc", "#22d3ee", "#fbbf24"],
        borderRadius: 6,
        barThickness: 40,
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
        backgroundColor: "#1e293b",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        borderColor: "rgba(71, 85, 105, 0.5)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
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
        ticks: {
          color: "#64748b",
          font: { size: 11, family: "'JetBrains Mono', monospace" }
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(71, 85, 105, 0.2)",
          drawBorder: false
        },
        ticks: {
          color: "#64748b",
          font: { size: 11, family: "'JetBrains Mono', monospace" }
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#60a5fa" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{
            bgcolor: "rgba(127, 29, 29, 0.3)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "6px",
            "& .MuiAlert-icon": { color: "#f87171" },
          }}
        >
          Failed to load dashboard data. Please refresh.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ChartLineUp size={28} weight="duotone" style={{ color: "#60a5fa" }} />
          <Box
            component="h1"
            sx={{
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              fontFamily: "'Chivo', sans-serif",
              fontWeight: 700,
              color: "#f8fafc",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              m: 0,
            }}
          >
            Admin Dashboard
          </Box>
        </Box>

        <FormControl size="small">
          <Select
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            startAdornment={<CalendarBlank size={16} weight="duotone" style={{ color: "#64748b", marginRight: 8 }} />}
            sx={{
              minWidth: 150,
              color: "#f8fafc",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              bgcolor: "rgba(30, 41, 59, 0.4)",
              border: "1px solid rgba(71, 85, 105, 0.6)",
              borderRadius: "6px",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-icon": { color: "#64748b" },
              "&:hover": { borderColor: "#64748b" },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#1e293b",
                  border: "1px solid rgba(71, 85, 105, 0.5)",
                  borderRadius: "6px",
                  "& .MuiMenuItem-root": {
                    color: "#f8fafc",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" },
                    "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" },
                  },
                },
              },
            }}
          >
            {getLast12Months().map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(5, 1fr)" },
          gap: 2,
        }}
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Box
              key={card.title}
              sx={{
                background: card.cardBg,
                border: `1px solid ${card.borderColor}`,
                borderRadius: "6px",
                p: 3,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: card.color,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box>
                  <Box
                    sx={{
                      color: "#64748b",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "'JetBrains Mono', monospace",
                      mb: 1,
                    }}
                  >
                    {card.title}
                  </Box>
                  <Box
                    sx={{
                      fontSize: "28px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#f8fafc",
                    }}
                  >
                    {card.count}
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1.25,
                    bgcolor: card.iconBg,
                    borderRadius: "6px",
                  }}
                >
                  <Icon size={24} weight="duotone" style={{ color: card.color }} />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Chart */}
      <Box
        sx={{
          bgcolor: "rgba(30, 41, 59, 0.4)",
          border: "1px solid rgba(71, 85, 105, 0.6)",
          borderRadius: "6px",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ChartLineUp size={16} weight="duotone" />
            Overview Chart
          </Box>
          <Box
            sx={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#64748b",
              px: 1.5,
              py: 0.5,
              bgcolor: "rgba(51, 65, 85, 0.5)",
              borderRadius: "4px",
            }}
          >
            {monthYear}
          </Box>
        </Box>
        <Box sx={{ height: { xs: 200, md: 280 } }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Box>

      {/* Live Sessions Widget */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
        }}
      >
        <LiveSessionsWidget variant="admin" maxItems={4} />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
