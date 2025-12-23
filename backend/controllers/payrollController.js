const Payslip = require("../models/Payslip");
const EmployeeProfile = require("../models/EmployeeProfile");
const SalaryStructure = require("../models/SalaryStructure");
const PayrollSettings = require("../models/PayrollSettings");
const generatePayslipPDF = require("../utils/generatePayslipPDF");
const sendPayslipEmail = require("../utils/sendPayslipMail");
const b2Service = require("../utils/b2Service");
// Note: We need a valid b2Service that exports uploadFile. 
// Ideally refactor b2Service to support buffer upload directly if not already. 
// Looking at b2Service.js, uploadFile takes (fileBuffer, fileName, folder). Perfect.

/**
 * Generate Payslip for an Employee
 */
exports.generatePayslip = async (req, res) => {
    try {
        const { employeeProfileId, month, year, attendanceDays, extraEarnings, extraDeductions } = req.body;
        // extraEarnings/Deductions: [{ name, amount }] (One-time adjustments)

        const employee = await EmployeeProfile.findById(employeeProfileId).populate("user", "name email");
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const salaryStructure = await SalaryStructure.findOne({ employee: employeeProfileId });
        if (!salaryStructure) warning = "Salary structure not found, using zero values";

        // --- 1. Calculate Salary ---
        const basic = salaryStructure?.basic || 0;
        const hra = salaryStructure?.hra || 0;
        const fixedAllowances = salaryStructure?.allowances || [];
        const fixedDeductions = salaryStructure?.deductions || [];

        // Add one-time extras
        // We clone to avoid modifying the DB structure
        const finalEarnings = [
            { name: "Basic Pay", amount: basic },
            { name: "HRA", amount: hra },
            ...fixedAllowances,
            ...(extraEarnings || [])
        ];

        const finalDeductions = [
            ...fixedDeductions,
            ...(extraDeductions || [])
        ];

        // Summation
        const grossEarnings = finalEarnings.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const totalDeductions = finalDeductions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const netPay = grossEarnings - totalDeductions;

        // --- 2. Generate PDF ---
        // Get Settings
        let payrollSettings = await PayrollSettings.findOne();
        if (!payrollSettings) payrollSettings = {}; // Defaults in utility

        const pdfBuffer = await generatePayslipPDF(
            {
                ...employee.toObject(),
                name: employee.user.name, // Ensure user name is accessible
                designation: employee.designation,
                attendanceDays: attendanceDays || 30
            },
            {
                month, year,
                earnings: finalEarnings,
                deductions: finalDeductions,
                grossEarnings, totalDeductions, netPay
            },
            payrollSettings
        );

        // --- 3. Upload to Storage (B2) ---
        // Structure: /payslips/2025/January/EMP001.pdf
        const fileName = `${employee.employeeId}_${month}_${year}.pdf`;
        const folder = `payslips/${year}/${month}`;
        // path.join behavior in b2Service handles standard slashes? b2Service manual concat: folder + "/" + name

        // We use b2Service.uploadFile(buffer, name, folder)
        const uploadResult = await b2Service.uploadFile(pdfBuffer, fileName, folder);

        // --- 4. Save Record ---
        // Check update or create
        const existingPayslip = await Payslip.findOne({ employee: employeeProfileId, month, year });

        if (existingPayslip) {
            existingPayslip.grossEarnings = grossEarnings;
            existingPayslip.totalDeductions = totalDeductions;
            existingPayslip.netPay = netPay;
            existingPayslip.basic = basic;
            existingPayslip.hra = hra;
            existingPayslip.attendanceDays = attendanceDays || 30;
            existingPayslip.allowances = finalEarnings.filter(e => !["Basic Pay", "HRA"].includes(e.name)); // Store extras
            existingPayslip.deductions = finalDeductions;
            existingPayslip.pdfUrl = uploadResult.url; // Or uploadResult.fileName for internal ref? 
            // b2Service returns a proxied URL usually. 
            // We should ideally store the "B2 Key" or relative path if we want to be robust, but URL is fine for now.
            existingPayslip.generatedAt = Date.now();
            existingPayslip.generatedBy = req.user.id;

            await existingPayslip.save();
            return res.status(200).json({ message: "Payslip regenerated", payslip: existingPayslip });
        } else {
            const newPayslip = new Payslip({
                employee: employeeProfileId,
                month, year,
                attendanceDays: attendanceDays || 30,
                basic, hra,
                allowances: finalEarnings.filter(e => !["Basic Pay", "HRA"].includes(e.name)),
                deductions: finalDeductions,
                grossEarnings, totalDeductions, netPay,
                pdfUrl: uploadResult.url,
                generatedBy: req.user.id
            });
            await newPayslip.save();
            return res.status(200).json({ message: "Payslip generated", payslip: newPayslip });
        }

    } catch (err) {
        console.error("Generate Payslip Error:", err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Send Payslip Email
 */
exports.sendPayslipEmail = async (req, res) => {
    try {
        const { payslipId, type } = req.body; // type: "ATTACHMENT" or "LINK" or "DOWNLOAD_LINK"

        const payslip = await Payslip.findById(payslipId).populate({
            path: "employee",
            populate: { path: "user", select: "name email" }
        });

        if (!payslip) return res.status(404).json({ message: "Payslip not found" });

        const emailType = type === "LINK" ? "PAYSLIP_LINK" : "PAYSLIP_ATTACHMENT";

        // If attachment, we might need to fetch the file buffer again? 
        // Or sendPayslipEmail utility can assume we only send Link or we fetch content.
        // B2 URL might be public or protected.
        // If protected, we can't just pass URL to Mailjet as attachment reference easily unless it's public.
        // Safest is to download buffer and attach.

        let fileBuffer = null;
        if (emailType === "PAYSLIP_ATTACHMENT") {
            // Need to download file from B2. b2Service doesn't have downloadFile buffer method exposed explicitly in previous snippet?
            // "getSignedUrl" is there. "downloadUrlCache" is there. 
            // We might need to implement a 'downloadFileToBuffer' in b2Service or just fetch via axios from the signed URL.
            // For now, let's assume we send LINK if fetching is complex, or try to implement fetch.

            // To keep it robust without adding axios dependency if not present (it is not in package.json), 
            // we can use native https.
            // Or just default to LINK mode for V1 if attachment is hard.
            // User requested "Option A — Email (with PDF attached)". So I MUST support it.
            // I will use `axios` if installed? No, it's not in package.json. `node-fetch`? No.
            // I can use `https` module.
            // Alternatively, I can regenerate the PDF on the fly! It's deterministic.
            // Regeneration might be safer/faster than downloading from B2. 
            // Let's REGENERATE the buffer for the email attachment. It ensures latest data match.

            // Re-fetch salary structure isn't needed, we have data in Payslip model.
            // reconstruct earnings/deductions
            const earnings = [{ name: "Basic Pay", amount: payslip.basic }, { name: "HRA", amount: payslip.hra }, ...payslip.allowances];

            // Recalculate PDF
            // Get Settings
            let payrollSettings = await PayrollSettings.findOne();
            fileBuffer = await generatePayslipPDF(
                {
                    ...payslip.employee.toObject(),
                    name: payslip.employee.user.name,
                    designation: payslip.employee.designation,
                    attendanceDays: payslip.attendanceDays || 30
                },
                {
                    month: payslip.month, year: payslip.year,
                    earnings: earnings,
                    deductions: payslip.deductions,
                    grossEarnings: payslip.grossEarnings, totalDeductions: payslip.totalDeductions, netPay: payslip.netPay
                },
                payrollSettings
            );
        }

        const employeePortalLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/#/employee/my-payslips`;

        await sendPayslipEmail(emailType, { email: payslip.employee.user.email, name: payslip.employee.user.name }, {
            month: payslip.month,
            year: payslip.year,
            amount: payslip.netPay,
            link: employeePortalLink,
            fileBuffer: fileBuffer,
            fileName: `Payslip_${payslip.month}_${payslip.year}.pdf`
        });

        payslip.emailSent = true;
        payslip.emailSentAt = Date.now();
        payslip.status = "Emailed"; // or Published
        await payslip.save();

        res.status(200).json({ message: "Email sent successfully" });

    } catch (err) {
        console.error("Send Email Error:", err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Payslip History (Admin)
 */
exports.getAllPayslips = async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        let query = {};
        if (month) query.month = month;
        if (year) query.year = year;

        if (employeeId) {
            // Find employee profile first if passed user ID or profile ID?
            // Assuming profile ID passed for simplicity or handle both.
            query.employee = employeeId;
        }

        const payslips = await Payslip.find(query)
            .populate({
                path: "employee",
                populate: { path: "user", select: "name email mobile" }
            })
            .sort({ year: -1, month: -1 });

        res.status(200).json(payslips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get Payroll Settings
 */
exports.getSettings = async (req, res) => {
    try {
        const settings = await PayrollSettings.findOne();
        res.status(200).json(settings || {});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update Payroll Settings
 */
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        let settings = await PayrollSettings.findOne();
        if (!settings) {
            settings = new PayrollSettings(updates);
        } else {
            Object.assign(settings, updates);
        }
        await settings.save();
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Download Payslip PDF
 */
exports.downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params; // Payslip ID

        console.log("Download request received for payslip:", id);
        console.log("Auth header:", req.header("Authorization"));
        console.log("User:", req.user);

        const payslip = await Payslip.findById(id)
            .populate("employee")
            .populate({
                path: "employee",
                populate: { path: "user" }
            });

        if (!payslip) {
            return res.status(404).json({ message: "Payslip not found" });
        }

        // If PDF is stored in B2, fetch and return it
        if (payslip.pdfUrl) {
            // Fetch the file from B2 and stream it
            const axios = require("axios");
            const response = await axios.get(payslip.pdfUrl, { responseType: 'arraybuffer' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="payslip_${payslip.employee.employeeId}_${payslip.month}_${payslip.year}.pdf"`);
            res.send(response.data);
        } else {
            return res.status(404).json({ message: "PDF not available for this payslip" });
        }
    } catch (err) {
        console.error("Download Payslip Error:", err);
        res.status(500).json({ message: err.message });
    }
};
