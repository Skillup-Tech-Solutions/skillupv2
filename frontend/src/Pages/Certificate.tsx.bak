"use client";
import React, { useState, useRef } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/Images/blacklogo.png";
import background from "../assets/Images/background.png";
import msme from "../assets/Images/msms.png";
import iso from "../assets/Images/isonew.png";
import iaf from "../assets/Images/iaf.png";
import sign from "../assets/Images/dummysign.png";
import CustomButton from "../Custom/CustomButton";
const Certificate = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef(null);

  const handleCreate = () => {
    setShowCertificate(true);
    setOpen(false);
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
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
        btnSx={{width:"max-content"}}
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 3 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Box
            ref={certificateRef}
            sx={{
              position: "relative",
              width: "800px",
              height: "530px",
              margin: "auto",
              overflow: "hidden",
              fontFamily: "'Trykker', serif",
              color: "#545151",
              backgroundColor: "#fff",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          >
            {/* Background */}
            <img
              src={background}
              alt="Background"
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
            />

            {/* Certificate Content */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                width: "100%",
                height: "100%",
                textAlign: "center",
                zIndex: 2,
              }}
            >
              <img
                src={logo}
                alt="logo"
                style={{ width: "100px", marginTop: "30px" }}
              />

              <h2
                style={{
                  margin: 0,
                  fontFamily: "Trykker",
                  fontSize: "35px",
                  color: "#545151",
                }}
              >
                CERTIFICATE
              </h2>

              <h3
                style={{
                  margin: 0,
                  fontFamily: "Style Script",
                  fontSize: "25px",
                  color: "#545151",
                }}
              >
                Of Completion
              </h3>

              <h4
                style={{
                  marginTop: "30px",
                  fontFamily: "Trykker",
                  fontSize: "18px",
                  color: "#545151",
                }}
              >
                This Certificate is Proudly Presented to
              </h4>

              <h5
                style={{
                  marginTop: "10px",
                  fontFamily: "Style Script",
                  fontSize: "35px",
                  color: "#545151",
                }}
              >
                {name || "Recipient Name"}
              </h5>

              <h6
                style={{
                  margin: "10px auto 0 auto",
                  fontFamily: "Trykker",
                  fontSize: "16px",
                  color: "#545151",
                  maxWidth: "85%",
                  lineHeight: "1.5",
                }}
              >
                {description ||
                  "Has successfully completed an internship at Skill Up Tech Solution, conducted from 30th June 2025 to 14th July 2025, demonstrating strong skills in Artificial Intelligence and AI Agents."}
              </h6>

              {/* Bottom Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0px 40px",
                  position: "absolute",
                  bottom: "60px",
                  width: "100%",
                }}
              >
                <img src={iaf} alt="IAF" style={{ width: "100px" }} />
                <img src={msme} alt="MSME" style={{ width: "100px" }} />
                <img src={iso} alt="ISO" style={{ width: "100px" }} />

                <div style={{ textAlign: "center" }}>
                  <img src={sign} alt="Sign" style={{ width: "100px" }} />
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "Trykker",
                      fontSize: "16px",
                      color: "#545151",
                    }}
                  >
                    Nivetha
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Trykker",
                      fontSize: "16px",
                      color: "#545151",
                    }}
                  >
                    Co-ordinator
                  </p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <img src={sign} alt="Sign" style={{ width: "100px" }} />
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "Trykker",
                      fontSize: "16px",
                      color: "#545151",
                    }}
                  >
                    Mohamed Faroon
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Trykker",
                      fontSize: "16px",
                      color: "#545151",
                    }}
                  >
                    Head Manager
                  </p>
                </div>
              </div>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
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
