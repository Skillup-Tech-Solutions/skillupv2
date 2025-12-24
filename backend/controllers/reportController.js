const StudentAssignment = require("../models/StudentAssignment");
const pdf = require("pdfkit");
const ExcelJS = require("exceljs");

exports.generateProjectReport = async (req, res) => {
    try {
        const { format, status } = req.query;

        let query = { itemType: "project" };

        if (status === "active") {
            query.status = { $nin: ["delivered", "completed"] };
        } else if (status === "delivered") {
            query.status = { $in: ["delivered", "completed"] };
        }

        const assignments = await StudentAssignment.find(query)
            .populate("student", "name email mobile status createdAt")
            .populate("itemId", "title name description")
            .populate("assignedBy", "name email")
            .populate("requirementSubmission.submittedBy", "name")
            .populate("adminReview.reviewedBy", "name")
            .sort({ assignedAt: -1 });

        if (format === "excel") {
            await generateExcelReport(res, assignments, status);
        } else if (format === "pdf") {
            await generatePDFReport(res, assignments, status);
        } else {
            res.status(400).json({ message: "Invalid format. Use 'excel' or 'pdf'." });
        }
    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).json({ message: "Failed to generate report" });
    }
};

// ============== EXCEL REPORT ==============
async function generateExcelReport(res, assignments, status) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SkillUp Admin";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Project Assignments");

    // Title row
    worksheet.mergeCells("A1:L1");
    worksheet.getCell("A1").value = "PROJECT ASSIGNMENT REPORT";
    worksheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1976D2" } };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Subtitle
    worksheet.mergeCells("A2:L2");
    worksheet.getCell("A2").value = `Generated: ${new Date().toLocaleString()} | Filter: ${status || "All"} | Total: ${assignments.length} records`;
    worksheet.getCell("A2").font = { italic: true, size: 10, color: { argb: "FF666666" } };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.addRow([]); // Empty row

    // Define columns starting from row 4
    worksheet.columns = [
        { header: "S.No", key: "sno", width: 6 },
        { header: "Student Name", key: "studentName", width: 18 },
        { header: "Email", key: "email", width: 26 },
        { header: "Mobile", key: "mobile", width: 14 },
        { header: "Project", key: "project", width: 22 },
        { header: "Project Type", key: "projectType", width: 12 },
        { header: "Status", key: "status", width: 16 },
        { header: "Assigned Date", key: "assignedDate", width: 14 },
        { header: "Assigned By", key: "assignedBy", width: 14 },
        { header: "Total Amount", key: "amount", width: 12 },
        { header: "Payment Status", key: "paymentStatus", width: 14 },
        { header: "Rating", key: "rating", width: 8 },
    ];

    // Set header row (row 4)
    const headerRow = worksheet.getRow(4);
    headerRow.values = ["S.No", "Student Name", "Email", "Mobile", "Project", "Project Type", "Status", "Assigned Date", "Assigned By", "Total Amount", "Payment Status", "Rating"];
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Add data rows
    assignments.forEach((a, i) => {
        const row = worksheet.addRow({
            sno: i + 1,
            studentName: a.student?.name || "N/A",
            email: a.student?.email || "N/A",
            mobile: a.student?.mobile || "N/A",
            project: a.itemId?.title || a.itemId?.name || "N/A",
            projectType: a.requirementSubmission?.projectType || "-",
            status: a.status || "N/A",
            assignedDate: new Date(a.assignedAt).toLocaleDateString(),
            assignedBy: a.assignedBy?.name || "System",
            amount: a.payment?.amount || 0,
            paymentStatus: a.payment?.status || "N/A",
            rating: a.feedback?.rating ? `${a.feedback.rating}/5` : "-",
        });

        // Status color
        const statusCell = row.getCell(7);
        if (["completed", "delivered"].includes(a.status)) {
            statusCell.font = { color: { argb: "FF2E7D32" }, bold: true };
        } else if (a.status?.includes("pending")) {
            statusCell.font = { color: { argb: "FFF57C00" }, bold: true };
        }

        // Payment status color
        const paymentCell = row.getCell(11);
        if (a.payment?.status === "paid") {
            paymentCell.font = { color: { argb: "FF2E7D32" }, bold: true };
        }

        // Alternate row background
        if (i % 2 === 1) {
            row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
        }
    });

    // Add borders to all cells
    const lastRow = 4 + assignments.length;
    for (let row = 4; row <= lastRow; row++) {
        for (let col = 1; col <= 12; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
                top: { style: "thin", color: { argb: "FFE0E0E0" } },
                left: { style: "thin", color: { argb: "FFE0E0E0" } },
                bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
                right: { style: "thin", color: { argb: "FFE0E0E0" } }
            };
        }
    }

    // ========== DETAILED SHEET ==========
    const detailSheet = workbook.addWorksheet("Detailed Data");

    detailSheet.columns = [
        { header: "S.No", key: "sno", width: 6 },
        { header: "Student Name", key: "studentName", width: 18 },
        { header: "Student Email", key: "studentEmail", width: 26 },
        { header: "Student Mobile", key: "studentMobile", width: 14 },
        { header: "Student Status", key: "studentStatus", width: 12 },
        { header: "Joined Date", key: "joinedDate", width: 12 },
        { header: "Project Title", key: "projectTitle", width: 22 },
        { header: "Project Type", key: "projectType", width: 12 },
        { header: "Topic", key: "topic", width: 20 },
        { header: "College Guidelines", key: "guidelines", width: 28 },
        { header: "Project Status", key: "projectStatus", width: 16 },
        { header: "Progress %", key: "progress", width: 10 },
        { header: "Assigned Date", key: "assignedDate", width: 12 },
        { header: "Assigned By", key: "assignedBy", width: 14 },
        { header: "Completed Date", key: "completedDate", width: 12 },
        { header: "Payment Required", key: "paymentRequired", width: 12 },
        { header: "Total Amount", key: "totalAmount", width: 12 },
        { header: "Advance Amount", key: "advanceAmount", width: 12 },
        { header: "Final Amount", key: "finalAmount", width: 12 },
        { header: "Payment Status", key: "paymentStatus", width: 12 },
        { header: "Payment Method", key: "paymentMethod", width: 12 },
        { header: "Transaction ID", key: "transactionId", width: 16 },
        { header: "Invoice Number", key: "invoiceNumber", width: 16 },
        { header: "Delivery Files", key: "deliveryFiles", width: 10 },
        { header: "Rating", key: "rating", width: 8 },
        { header: "Feedback", key: "feedback", width: 30 },
    ];

    // Style header
    const detailHeader = detailSheet.getRow(1);
    detailHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    detailHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };

    assignments.forEach((a, i) => {
        detailSheet.addRow({
            sno: i + 1,
            studentName: a.student?.name || "N/A",
            studentEmail: a.student?.email || "N/A",
            studentMobile: a.student?.mobile || "N/A",
            studentStatus: a.student?.status || "N/A",
            joinedDate: a.student?.createdAt ? new Date(a.student.createdAt).toLocaleDateString() : "-",
            projectTitle: a.itemId?.title || a.itemId?.name || "N/A",
            projectType: a.requirementSubmission?.projectType || "-",
            topic: a.requirementSubmission?.topic || "-",
            guidelines: a.requirementSubmission?.collegeGuidelines || "-",
            projectStatus: a.status || "N/A",
            progress: `${a.progress || 0}%`,
            assignedDate: new Date(a.assignedAt).toLocaleDateString(),
            assignedBy: a.assignedBy?.name || "System",
            completedDate: a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "-",
            paymentRequired: a.payment?.required ? "Yes" : "No",
            totalAmount: a.payment?.amount || 0,
            advanceAmount: a.payment?.advanceAmount || 0,
            finalAmount: a.payment?.finalAmount || 0,
            paymentStatus: a.payment?.status || "N/A",
            paymentMethod: a.payment?.paymentMethod || "-",
            transactionId: a.payment?.transactionId || "-",
            invoiceNumber: a.invoice?.invoiceNumber || "-",
            deliveryFiles: a.deliveryFiles?.length || 0,
            rating: a.feedback?.rating || "-",
            feedback: a.feedback?.comments || "-",
        });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=project_report_${status || "all"}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
}

// ============== PDF REPORT ==============
async function generatePDFReport(res, assignments, status) {
    const doc = new pdf({
        margin: 30,
        size: "A4",
        bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=project_report_${status || "all"}_${Date.now()}.pdf`);

    doc.pipe(res);

    // App Brand Colors
    const colors = {
        primary: "#f57f17",       // Orange
        headerDark: "#1F2026",    // Dark - table headers
        lightOrange: "#FFF4E5",   // Light orange background
        grey: "#717680",
        success: "#067647",
        warning: "#f79009",
        error: "#b42318",
        white: "#FFFFFF",
        lightGrey: "#F9F9F9",
        border: "#e5e7eb"
    };

    // ===== HEADER =====
    doc.rect(0, 0, 595, 70).fill(colors.headerDark);
    doc.fontSize(22).font("Helvetica-Bold").fillColor(colors.primary)
        .text("SKILLUP", 30, 18, { continued: true })
        .fillColor(colors.white).text(" - Project Assignment Report");
    doc.fontSize(9).font("Helvetica").fillColor("#A4A7AE")
        .text(`Generated: ${new Date().toLocaleString()} | Filter: ${(status || "All").toUpperCase()} | Total Records: ${assignments.length}`, 30, 45);

    let y = 85;

    // ===== TABLE HEADER =====
    const tableTop = y;
    const col = {
        sno: 30,
        name: 55,
        project: 155,
        status: 280,
        payment: 370,
        date: 450,
        rating: 530
    };

    // Header row background - using app's dark header color
    doc.rect(30, tableTop, 535, 22).fill(colors.headerDark);

    // Header text - white with orange accent
    doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.white);
    doc.text("No.", col.sno, tableTop + 6);
    doc.text("Student / Email", col.name, tableTop + 6);
    doc.text("Project / Topic", col.project, tableTop + 6);
    doc.text("Status", col.status, tableTop + 6);
    doc.text("Payment", col.payment, tableTop + 6);
    doc.text("Assigned", col.date, tableTop + 6);
    doc.text("Rate", col.rating, tableTop + 6);
    y = tableTop + 25;

    // ===== DATA ROWS =====
    assignments.forEach((a, i) => {
        // Check for new page
        if (y > 750) {
            doc.addPage();
            y = 40;

            // Repeat header on new page
            doc.rect(30, y, 535, 22).fill(colors.headerDark);
            doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.white);
            doc.text("No.", col.sno, y + 6);
            doc.text("Student / Email", col.name, y + 6);
            doc.text("Project / Topic", col.project, y + 6);
            doc.text("Status", col.status, y + 6);
            doc.text("Payment", col.payment, y + 6);
            doc.text("Assigned", col.date, y + 6);
            doc.text("Rate", col.rating, y + 6);
            y += 25;
        }

        const rowHeight = 45;

        // Alternate row background - using app's light grey
        if (i % 2 === 0) {
            doc.rect(30, y, 535, rowHeight).fill(colors.lightGrey);
        } else {
            doc.rect(30, y, 535, rowHeight).fill(colors.white);
        }

        // Draw row border
        doc.rect(30, y, 535, rowHeight).stroke(colors.border);

        // Row data
        doc.fontSize(8).font("Helvetica-Bold").fillColor(colors.headerDark);

        // S.No with orange accent
        doc.fillColor(colors.primary).text(`${i + 1}`, col.sno, y + 15);

        // Student Name & Email
        doc.font("Helvetica-Bold").fillColor(colors.headerDark)
            .text(truncate(a.student?.name || "N/A", 15), col.name, y + 5);
        doc.fontSize(7).font("Helvetica").fillColor(colors.grey)
            .text(truncate(a.student?.email || "", 20), col.name, y + 17);
        doc.text(a.student?.mobile || "", col.name, y + 28);

        // Project & Topic
        doc.fontSize(8).font("Helvetica-Bold").fillColor(colors.headerDark)
            .text(truncate(a.itemId?.title || a.itemId?.name || "N/A", 20), col.project, y + 5);
        doc.fontSize(7).font("Helvetica").fillColor(colors.grey)
            .text(`Type: ${a.requirementSubmission?.projectType || "-"}`, col.project, y + 17);
        doc.text(`Topic: ${truncate(a.requirementSubmission?.topic || "-", 18)}`, col.project, y + 28);

        // Status with app colors
        const statusColor = getAppStatusColor(a.status);
        doc.fontSize(8).font("Helvetica-Bold").fillColor(statusColor)
            .text((a.status || "N/A").toUpperCase(), col.status, y + 5);
        doc.fontSize(7).font("Helvetica").fillColor(colors.grey)
            .text(`Progress: ${a.progress || 0}%`, col.status, y + 17);
        if (a.completedAt) {
            doc.text(`Done: ${new Date(a.completedAt).toLocaleDateString()}`, col.status, y + 28);
        }

        // Payment with orange primary for amount
        const paymentAmt = a.payment?.amount || 0;
        doc.fontSize(8).font("Helvetica-Bold").fillColor(colors.primary)
            .text(`Rs.${paymentAmt}`, col.payment, y + 5);
        const payColor = a.payment?.status === "paid" ? colors.success : colors.warning;
        doc.fontSize(7).font("Helvetica-Bold").fillColor(payColor)
            .text((a.payment?.status || "N/A").toUpperCase(), col.payment, y + 17);
        doc.font("Helvetica").fillColor(colors.grey)
            .text(`Adv: Rs.${a.payment?.advanceAmount || 0}`, col.payment, y + 28);

        // Assigned Date
        doc.fontSize(8).font("Helvetica").fillColor(colors.headerDark)
            .text(new Date(a.assignedAt).toLocaleDateString(), col.date, y + 5);
        doc.fontSize(7).fillColor(colors.grey)
            .text(`By: ${truncate(a.assignedBy?.name || "System", 12)}`, col.date, y + 17);

        // Rating with orange stars
        const rating = a.feedback?.rating;
        if (rating) {
            doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary)
                .text(`${rating}/5`, col.rating, y + 12);
        } else {
            doc.fontSize(8).font("Helvetica").fillColor(colors.grey)
                .text("-", col.rating + 8, y + 12);
        }

        y += rowHeight;
    });

    // ===== SUMMARY BOX - Using app's light orange =====
    if (y > 700) doc.addPage();
    y = doc.y + 20;

    doc.rect(30, y, 535, 55).fill(colors.lightOrange);
    doc.rect(30, y, 535, 55).stroke(colors.primary);

    // Orange accent bar
    doc.rect(30, y, 5, 55).fill(colors.primary);

    doc.fontSize(12).font("Helvetica-Bold").fillColor(colors.primary)
        .text("REPORT SUMMARY", 45, y + 8);
    doc.fontSize(9).font("Helvetica").fillColor(colors.headerDark);

    const completed = assignments.filter(a => ["completed", "delivered"].includes(a.status)).length;
    const pending = assignments.filter(a => a.status?.includes("pending")).length;
    const inProgress = assignments.filter(a => ["in-progress", "assigned"].includes(a.status)).length;
    const totalAmount = assignments.reduce((sum, a) => sum + (a.payment?.amount || 0), 0);
    const paidAmount = assignments.filter(a => a.payment?.status === "paid").reduce((sum, a) => sum + (a.payment?.amount || 0), 0);

    doc.text(`Total Projects: ${assignments.length}  |  Completed: ${completed}  |  In Progress: ${inProgress}  |  Pending: ${pending}`, 45, y + 26);
    doc.font("Helvetica-Bold").fillColor(colors.primary)
        .text(`Total Value: Rs.${totalAmount}`, 45, y + 40, { continued: true });
    doc.font("Helvetica").fillColor(colors.headerDark)
        .text(`  |  Collected: Rs.${paidAmount}  |  Outstanding: Rs.${totalAmount - paidAmount}`);

    // ===== FOOTER =====
    doc.fontSize(8).font("Helvetica-Oblique").fillColor(colors.grey)
        .text("Generated by SkillUp Admin System", 30, 800, { align: "center" });

    doc.end();
}

// Helpers
function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.substring(0, len - 2) + ".." : str;
}

// App-aligned status colors
function getAppStatusColor(status) {
    const colors = {
        "assigned": "#1976D2",              // Blue
        "requirement-submitted": "#7B1FA2", // Purple
        "advance-payment-pending": "#f79009", // App warning orange
        "in-progress": "#0288D1",           // Light blue
        "ready-for-demo": "#00897B",        // Teal
        "final-payment-pending": "#f79009", // App warning orange
        "ready-for-download": "#067647",    // App success green
        "delivered": "#067647",             // App success green
        "completed": "#067647"              // App success green
    };
    return colors[status] || "#717680"; // App grey fallback
}
