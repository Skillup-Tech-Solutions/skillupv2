const StudentAssignment = require("../models/StudentAssignment");
const pdf = require("pdfkit");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

exports.generateProjectReport = async (req, res) => {
    try {
        const { format, status } = req.query; // format: 'excel' or 'pdf', status: 'active', 'delivered', 'all'

        let query = { itemType: "project" };

        if (status === "active") {
            query.status = { $nin: ["delivered", "completed"] };
        } else if (status === "delivered") {
            query.status = { $in: ["delivered", "completed"] };
        }
        // 'all' or undefined implies no status filter

        const assignments = await StudentAssignment.find(query)
            .populate("student", "name email mobile")
            .populate("itemId", "title name")
            .populate("assignedBy", "name")
            .sort({ assignedAt: -1 });

        if (format === "excel") {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Project Assignments");

            worksheet.columns = [
                { header: "Student Name", key: "studentName", width: 25 },
                { header: "Email", key: "email", width: 30 },
                { header: "Project Title", key: "projectTitle", width: 30 },
                { header: "Status", key: "status", width: 20 },
                { header: "Assigned Date", key: "assignedDate", width: 20 },
                { header: "Assigned By", key: "assignedBy", width: 20 },
                { header: "Payment Amount", key: "paymentAmount", width: 15 },
                { header: "Payment Status", key: "paymentStatus", width: 15 },
            ];

            assignments.forEach((assignment) => {
                worksheet.addRow({
                    studentName: assignment.student?.name || "N/A",
                    email: assignment.student?.email || "N/A",
                    projectTitle: assignment.itemId?.title || assignment.itemId?.name || "N/A",
                    status: assignment.status,
                    assignedDate: new Date(assignment.assignedAt).toLocaleDateString(),
                    assignedBy: assignment.assignedBy?.name || "System",
                    paymentAmount: assignment.payment?.amount || 0,
                    paymentStatus: assignment.payment?.status || "N/A",
                });
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=project_report_${status || "all"}_${Date.now()}.xlsx`
            );

            await workbook.xlsx.write(res);
            res.end();
        } else if (format === "pdf") {
            const doc = new pdf();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=project_report_${status || "all"}_${Date.now()}.pdf`
            );

            doc.pipe(res);

            doc.fontSize(20).text("Project Assignment Report", { align: "center" });
            doc.moveDown();
            doc.fontSize(12).text(`Filter: ${status || "All"}`, { align: "center" });
            doc.moveDown();

            assignments.forEach((assignment, index) => {
                doc.fontSize(12).bold().text(`${index + 1}. Student: ${assignment.student?.name || "N/A"} (${assignment.student?.email})`);
                doc.fontSize(10).font("Helvetica").text(`   Project: ${assignment.itemId?.title || assignment.itemId?.name || "N/A"}`);
                doc.text(`   Status: ${assignment.status}`);
                doc.text(`   Assigned: ${new Date(assignment.assignedAt).toLocaleDateString()} by ${assignment.assignedBy?.name || "System"}`);
                doc.text(`   Payment: ${assignment.payment?.amount || 0} (${assignment.payment?.status || "N/A"})`);
                doc.moveDown(0.5);
            });

            doc.end();
        } else {
            res.status(400).json({ message: "Invalid format. Use 'excel' or 'pdf'." });
        }
    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).json({ message: "Failed to generate report" });
    }
};
