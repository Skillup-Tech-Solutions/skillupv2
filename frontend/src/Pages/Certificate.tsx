import { useState, useRef } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import background from "../assets/Images/certificate_bg.jpg";
import CustomButton from "../Custom/CustomButton";

dayjs.extend(advancedFormat);
const Certificate = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs("2025-06-30"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs("2025-07-14"));
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    setShowCertificate(true);
    setOpen(false);
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${name || "Certificate"}.pdf`);
  };

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, color: "#333", fontFamily: "Bold_M" }}
      >
        Skill Up Tech Certificate Generator
      </Typography>
      <CustomButton
        label="Create Certificate"
        variant="contained"
        onClick={() => setOpen(true)}
        type="button"
        btnSx={{ width: "max-content" }}
      />
      {/* Input Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            p: 4,
            background: "white",
            borderRadius: 2,
            width: 400,
            mx: "auto",
            mt: 10,
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Enter Details
          </Typography>
          <TextField
            label="Name"
            fullWidth
            sx={{ mb: 2 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Domain"
            fullWidth
            sx={{ mb: 2 }}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </LocalizationProvider>
          <CustomButton
            label="View Certificate"
            variant="contained"
            onClick={handleCreate}
            type="button"
          />
        </Box>
      </Modal>

      {/* Certificate Display */}
      {showCertificate && (
        <Box sx={{ textAlign: "center", mt: 5, pb: 10 }}>
          <Box
            ref={certificateRef}
            sx={{
              position: "relative",
              width: "1000px",
              height: "707px",
              margin: "auto",
              overflow: "hidden",
              fontFamily: "'Trykker', serif",
              color: "#333",
              backgroundColor: "#fff",
              boxShadow: "0 0 20px rgba(0,0,0,0.1)",
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
              {/* Recipient Name Container for Automatic Centering */}
              <Box
                sx={{
                  position: "absolute",
                  top: "40%",
                  left: 0,
                  width: "100%",
                  zIndex: 2,
                }}
              >
                <Typography
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
                </Typography>
              </Box>

              {/* Domain Overlay */}
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

              {/* Start Date Overlay */}
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

              {/* End Date Overlay */}
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

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, px: 4, py: 1.5, fontSize: "16px", fontWeight: "bold" }}
            onClick={handleDownload}
          >
            Download Certificate
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Certificate;
