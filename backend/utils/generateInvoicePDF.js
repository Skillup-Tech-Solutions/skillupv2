const PDFDocument = require("pdfkit");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

/**
 * Generates an Invoice PDF for a student assignment payment
 * Design matches the existing client-side template in CourseSubmissionsList.tsx
 * With GST 18% breakdown (Total is GST-inclusive)
 */
const generateInvoicePDF = async (invoiceData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" });
            const buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- COLORS & STYLES ---
            const primaryColor = "#1976d2";
            const grey = "#666666";
            const lightGrey = "#f1f5f9";
            const black = "#333333";

            // Calculate GST (Total is GST-inclusive)
            const totalAmount = invoiceData.amount || 0;
            const baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
            const gstAmount = Math.round((totalAmount - baseAmount) * 100) / 100;

            // --- HEADER ---
            let currentY = 40;

            // Logo (left side)
            const logoPath = path.join(__dirname, "../../frontend/src/assets/Images/blacklogo.png");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, currentY, { width: 80 });
            } else {
                doc.fontSize(20).font("Helvetica-Bold").fillColor(primaryColor).text("SkillUp", 40, currentY);
            }

            // Company Details
            currentY += 15;
            doc.font("Helvetica-Bold").fontSize(14).fillColor(primaryColor).text("Skill Up Tech Solutions", 130, currentY);
            doc.font("Helvetica").fontSize(9).fillColor(grey);
            doc.text("53/10, Virudhachalam Main Road,", 130, currentY + 18);
            doc.text("Ulundurpet - 606107", 130, currentY + 30);
            doc.text("Email: skilluptechsolution@gmail.com", 130, currentY + 42);

            // INVOICE text (right side)
            doc.fontSize(36).font("Helvetica-Bold").fillColor("#cccccc").text("INVOICE", 400, 40, { align: "right" });
            doc.fontSize(11).font("Helvetica-Bold").fillColor(black).text(`Order # ${invoiceData.invoiceNumber}`, 350, 85, { align: "right" });
            doc.fontSize(10).font("Helvetica").fillColor(grey).text(`Date: ${moment().format("DD MMM YYYY")}`, 350, 102, { align: "right" });

            currentY = 140;

            // Horizontal Separator
            doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor("#eeeeee").lineWidth(2).stroke();
            currentY += 20;

            // Bill To Section
            doc.font("Helvetica-Bold").fontSize(11).fillColor("#555555").text("Bill To:", 40, currentY);
            currentY += 18;
            doc.font("Helvetica-Bold").fontSize(14).fillColor(black).text(invoiceData.studentName || "Student", 40, currentY);
            currentY += 18;
            doc.font("Helvetica").fontSize(10).fillColor(grey).text(invoiceData.studentEmail || "", 40, currentY);

            currentY += 40;

            // --- TABLE HEADER ---
            doc.rect(40, currentY, 515, 30).fill(lightGrey);
            doc.font("Helvetica-Bold").fontSize(10).fillColor(black);
            doc.text("Description", 55, currentY + 10);
            doc.text("Qty", 340, currentY + 10, { width: 50, align: "center" });
            doc.text("Price", 400, currentY + 10, { width: 70, align: "right" });
            doc.text("Total", 480, currentY + 10, { width: 60, align: "right" });

            currentY += 30;

            // --- ITEM ROW ---
            doc.rect(40, currentY, 515, 45).stroke("#e0e0e0");
            doc.font("Helvetica-Bold").fontSize(11).fillColor(black).text(
                `${invoiceData.itemType ? invoiceData.itemType.charAt(0).toUpperCase() + invoiceData.itemType.slice(1) : "Course"} Fee: ${invoiceData.itemName || "Item"}`,
                55, currentY + 10, { width: 270 }
            );
            if (invoiceData.itemDescription) {
                doc.font("Helvetica").fontSize(9).fillColor(grey).text(invoiceData.itemDescription, 55, currentY + 26, { width: 270 });
            }
            doc.font("Helvetica").fontSize(10).fillColor(black);
            doc.text("1", 340, currentY + 15, { width: 50, align: "center" });
            doc.text(`Rs.${baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 400, currentY + 15, { width: 70, align: "right" });
            doc.text(`Rs.${baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 480, currentY + 15, { width: 60, align: "right" });

            currentY += 45;

            // --- TOTALS SECTION (Right aligned) ---
            const totalsX = 360;
            const totalsWidth = 195;

            // Subtotal
            doc.rect(totalsX, currentY, totalsWidth, 28).stroke("#e0e0e0");
            doc.font("Helvetica").fontSize(10).fillColor(grey).text("Subtotal:", totalsX + 10, currentY + 8);
            doc.font("Helvetica").fontSize(10).fillColor(black).text(
                `Rs.${baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                totalsX + 100, currentY + 8, { width: 85, align: "right" }
            );

            currentY += 28;

            // GST Row
            doc.rect(totalsX, currentY, totalsWidth, 28).stroke("#e0e0e0");
            doc.font("Helvetica").fontSize(10).fillColor(grey).text("GST @ 18%:", totalsX + 10, currentY + 8);
            doc.font("Helvetica").fontSize(10).fillColor(black).text(
                `Rs.${gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                totalsX + 100, currentY + 8, { width: 85, align: "right" }
            );

            currentY += 28;

            // Total Row (highlighted)
            doc.rect(totalsX, currentY, totalsWidth, 35).fillAndStroke(lightGrey, "#333333");
            doc.font("Helvetica-Bold").fontSize(12).fillColor(black).text("Total:", totalsX + 10, currentY + 10);
            doc.font("Helvetica-Bold").fontSize(14).fillColor(primaryColor).text(
                `Rs.${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                totalsX + 90, currentY + 9, { width: 95, align: "right" }
            );

            currentY += 55;

            // --- PAYMENT INFO ---
            if (invoiceData.paymentStatus === "paid") {
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#22c55e").text("✓ PAID", 40, currentY);
                if (invoiceData.paidAt) {
                    doc.font("Helvetica").fontSize(9).fillColor(grey).text(
                        `on ${moment(invoiceData.paidAt).format("DD MMM YYYY")}`, 75, currentY
                    );
                }
                currentY += 15;
            }
            if (invoiceData.transactionId) {
                doc.font("Helvetica").fontSize(9).fillColor(grey).text(`Transaction ID: ${invoiceData.transactionId}`, 40, currentY);
                currentY += 14;
            }
            if (invoiceData.paymentMethod) {
                doc.text(`Payment Method: ${invoiceData.paymentMethod.toUpperCase()}`, 40, currentY);
                currentY += 14;
            }

            currentY += 30;

            // --- FOOTER ---
            // Thank you message (left)
            doc.font("Helvetica-Bold").fontSize(14).fillColor(black).text("Thank you for your business!", 40, currentY);
            doc.font("Helvetica").fontSize(9).fillColor(grey).text("If you have any questions, please contact support.", 40, currentY + 18);

            // Signature (right)
            const signPath = path.join(__dirname, "../../frontend/src/assets/Images/dummysign.png");
            if (fs.existsSync(signPath)) {
                doc.image(signPath, 450, currentY - 10, { width: 80 });
                doc.font("Helvetica-Bold").fontSize(9).fillColor(grey).text("Authorized Signature", 440, currentY + 40, { width: 100, align: "center" });
            }

            // Bottom footer
            doc.font("Helvetica").fontSize(8).fillColor("#999999");
            doc.text("This is a computer-generated invoice and does not require a physical signature.", 40, 780, { align: "center", width: 515 });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateInvoicePDF;
