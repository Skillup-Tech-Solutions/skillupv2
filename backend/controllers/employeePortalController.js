const Payslip = require("../models/Payslip");
const EmployeeProfile = require("../models/EmployeeProfile");
const PayrollSettings = require("../models/PayrollSettings");
const b2Service = require("../utils/b2Service");

/**
 * Get My Payslips
 */
exports.getMyPayslips = async (req, res) => {
    try {
        // req.user.id is the User ID. Need to find Profile ID.
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const payslips = await Payslip.find({
            employee: employeeProfile._id,
            status: { $in: ["Published", "Emailed"] } // Only show published ones
        }).sort({ year: -1, month: -1 });

        res.status(200).json(payslips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Download My Payslip
 */
exports.downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });

        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const payslip = await Payslip.findOne({
            _id: id,
            employee: employeeProfile._id
        });

        if (!payslip) {
            return res.status(404).json({ message: "Payslip not found or access denied" });
        }

        // Logic to get download URL
        // If pdfUrl is a full URL, return it
        // If it's a B2 path, sign it

        // Assumption: pdfUrl stored in DB is the "proxyUrl" we generated in b2Service.uploadFile
        // OR it's the raw B2 URL.
        // Let's assume we want to return a signed URL directly to the frontend to force download
        // OR allow frontend to use the proxy.
        // If it is a proxy URL, just return it.

        // However, for better security, let's generate a FRESH signed URL here if possible
        // But we don't store the file NAME explicitly in `payslip` model except inside `pdfUrl` maybe?
        // Wait, we didn't store fileName in Payslip model in step 39 (Create Payslip Model).
        // We only stored `pdfUrl`.
        // In `payrollController`, we did: 
        // const fileName = `${employee.employeeId}_${month}_${year}.pdf`;
        // const uploadResult = await b2Service.uploadFile...
        // newPayslip.pdfUrl = uploadResult.url; 

        // If uploadResult.url is a proxy (http://api/files/download?file=...), we can return that.
        // But that proxy endpoint needs to be secured or valid.
        // Let's check `b2Service.js` content again.
        // It returns `url: proxyUrl`.
        // So `pdfUrl` in DB is `.../api/files/download?file=...`

        res.status(200).json({ downloadUrl: payslip.pdfUrl });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
