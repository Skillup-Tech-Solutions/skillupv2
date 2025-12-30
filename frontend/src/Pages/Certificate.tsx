import { useState, useRef } from "react";
import { Box, Button, TextField, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import background from "../assets/Images/certificate_bg.jpg";
import { Certificate as CertificateIcon, Plus, DownloadSimple, X } from "@phosphor-icons/react";

dayjs.extend(advancedFormat);

// Dark TextField styles
const textFieldDarkStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(15, 23, 42, 0.5)",
    color: "#f8fafc",
    borderRadius: "6px",
    fontFamily: "'Inter', sans-serif",
    "& fieldset": { borderColor: "#475569" },
    "&:hover fieldset": { borderColor: "#64748b" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
  },
  "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
  "& .MuiInputLabel-root": {
    color: "#94a3b8",
    "&.Mui-focused": { color: "#3b82f6" },
  },
};

// Dark DatePicker styles
const datePickerDarkStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(15, 23, 42, 0.5)",
    color: "#f8fafc",
    borderRadius: "6px",
    "& fieldset": { borderColor: "#475569" },
    "&:hover fieldset": { borderColor: "#64748b" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
  },
  "& .MuiInputLabel-root": {
    color: "#94a3b8",
    "&.Mui-focused": { color: "#3b82f6" },
  },
  "& .MuiSvgIcon-root": { color: "#64748b" },
};

const Certificate = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs("2025-06-30"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs("2025-07-14"));
  const [showCertificate, setShowCertificate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    if (!name.trim()) {
      return;
    }
    setShowCertificate(true);
    setOpen(false);
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${name || "Certificate"}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CertificateIcon size={28} weight="duotone" style={{ color: "#fbbf24" }} />
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
            Certificate Generator
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
          Create Certificate
        </Button>
      </Box>

      {/* Input Modal */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
          onClick={() => setOpen(false)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "6px",
              width: 450,
              maxWidth: "95vw",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header */}
            <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ fontSize: "16px", fontFamily: "'Chivo', sans-serif", fontWeight: 700, color: "#f8fafc" }}>
                Enter Certificate Details
              </Box>
              <Box onClick={() => setOpen(false)} sx={{ cursor: "pointer", color: "#94a3b8", "&:hover": { color: "#f8fafc" } }}>
                <X size={20} />
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Recipient Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={textFieldDarkStyles}
                placeholder="Enter recipient's full name"
              />
              <TextField
                label="Domain / Course"
                fullWidth
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                sx={textFieldDarkStyles}
                placeholder="e.g., Artificial Intelligence"
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: { fullWidth: true, sx: datePickerDarkStyles },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            bgcolor: "#1e293b",
                            color: "#f8fafc",
                            border: "1px solid rgba(71, 85, 105, 0.5)",
                            "& .MuiPickersDay-root": { color: "#f8fafc", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" }, "&.Mui-selected": { bgcolor: "#3b82f6" } },
                            "& .MuiDayCalendar-weekDayLabel": { color: "#64748b" },
                            "& .MuiPickersCalendarHeader-label": { color: "#f8fafc" },
                            "& .MuiIconButton-root": { color: "#94a3b8" },
                          },
                        },
                      },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: { fullWidth: true, sx: datePickerDarkStyles },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            bgcolor: "#1e293b",
                            color: "#f8fafc",
                            border: "1px solid rgba(71, 85, 105, 0.5)",
                            "& .MuiPickersDay-root": { color: "#f8fafc", "&:hover": { bgcolor: "rgba(51, 65, 85, 0.5)" }, "&.Mui-selected": { bgcolor: "#3b82f6" } },
                            "& .MuiDayCalendar-weekDayLabel": { color: "#64748b" },
                            "& .MuiPickersCalendarHeader-label": { color: "#f8fafc" },
                            "& .MuiIconButton-root": { color: "#94a3b8" },
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2.5, borderTop: "1px solid rgba(71, 85, 105, 0.4)", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                onClick={() => setOpen(false)}
                sx={{
                  bgcolor: "#334155",
                  color: "#f8fafc",
                  borderRadius: "6px",
                  px: 2.5,
                  py: 1,
                  "&:hover": { bgcolor: "#475569" },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim()}
                sx={{
                  bgcolor: "#3b82f6",
                  color: "#fff",
                  borderRadius: "6px",
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#2563eb" },
                  "&:disabled": { bgcolor: "#475569", color: "#94a3b8" },
                }}
              >
                Generate
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Certificate Display */}
      {showCertificate && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Box
            ref={certificateRef}
            sx={{
              position: "relative",
              width: "1000px",
              height: "707px",
              overflow: "hidden",
              fontFamily: "'Trykker', serif",
              color: "#333",
              backgroundColor: "#fff",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              borderRadius: "6px",
              border: "1px solid rgba(71, 85, 105, 0.4)",
            }}
          >
            {/* Background Image */}
            <img
              src={background}
              alt="Background"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
              }}
            />

            {/* Overlay Content */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            >
              {/* Recipient Name */}
              <Box
                sx={{
                  position: "absolute",
                  top: "40%",
                  left: 0,
                  width: "100%",
                  zIndex: 2,
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    fontFamily: "'Alata', sans-serif",
                    fontSize: "48px",
                    color: "#262525ff",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    width: "100%",
                  }}
                >
                  {name || "Student Name"}
                </Box>
              </Box>

              {/* Domain */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "34.2%",
                  left: "30.5%",
                  fontFamily: "'Trykker', serif",
                  fontSize: "17px",
                  color: "#333",
                }}
              >
                {domain || "Artificial Intelligence"}
              </Box>

              {/* Start Date */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "30.6%",
                  left: "32%",
                  fontFamily: "'Trykker', serif",
                  fontSize: "17px",
                  color: "#333",
                }}
              >
                {startDate ? startDate.format("Do MMMM YYYY") : "30th June 2025"}
              </Box>

              {/* End Date */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "27%",
                  left: "32%",
                  fontFamily: "'Trykker', serif",
                  fontSize: "17px",
                  color: "#333",
                }}
              >
                {endDate ? endDate.format("Do MMMM YYYY") : "14th July 2025"}
              </Box>
            </Box>
          </Box>

          {/* Download Button */}
          <Button
            variant="contained"
            startIcon={downloading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <DownloadSimple size={20} weight="bold" />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{
              bgcolor: "#22c55e",
              color: "#fff",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              px: 4,
              py: 1.5,
              "&:hover": { bgcolor: "#16a34a" },
              "&:disabled": { bgcolor: "#475569" },
            }}
          >
            {downloading ? "Downloading..." : "Download Certificate"}
          </Button>
        </Box>
      )}

      {/* Empty State */}
      {!showCertificate && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
            borderRadius: "6px",
            bgcolor: "rgba(30, 41, 59, 0.4)",
            border: "1px solid rgba(71, 85, 105, 0.6)",
          }}
        >
          <CertificateIcon size={64} weight="duotone" style={{ color: "#475569", marginBottom: 16 }} />
          <Box sx={{ fontSize: "18px", fontWeight: 600, color: "#94a3b8", mb: 1 }}>
            No Certificate Generated
          </Box>
          <Box sx={{ fontSize: "14px", color: "#64748b", mb: 3, textAlign: "center" }}>
            Click "Create Certificate" to generate a new certificate
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
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Create Certificate
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Certificate;
